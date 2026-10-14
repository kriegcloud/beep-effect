/**
 * Service contracts of the Windows bootstrapper and their live layers: the
 * Windows host (Claude detection, installer runs, shell opens, state folder),
 * the pinned installer download, the bundled gateway file, and the console
 * conversation with the lawyer.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $PracticeSetupId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Crypto from "effect/Crypto";
import * as Effect from "effect/Effect";
import * as Hex from "effect/encoding/Hex";
import * as FileSystem from "effect/FileSystem";
import { flow, pipe } from "effect/Function";
import { HttpClient } from "effect/http";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";
import { ChildProcess, ChildProcessSpawner } from "effect/process";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import * as Str from "effect/String";
import * as Terminal from "effect/Terminal";
import { SetupFailure } from "./Setup.errors.ts";
import { ClaudeInstall } from "./Setup.models.ts";
import type { PinnedInstaller } from "./Setup.models.ts";

const $I = $PracticeSetupId.create("Setup.services");

/**
 * Package family name of the Claude Desktop MSIX.
 *
 * **Example** (Read the family name)
 *
 * ```ts
 * import { CLAUDE_PACKAGE_FAMILY } from "@/Setup.services"
 *
 * console.log(CLAUDE_PACKAGE_FAMILY) // "Claude_pzs8sxrjxfjjc"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const CLAUDE_PACKAGE_FAMILY = "Claude_pzs8sxrjxfjjc";

/**
 * Registry key Claude Setup's per-user install registers under.
 *
 * **Example** (Read the uninstall key)
 *
 * ```ts
 * import { CLAUDE_UNINSTALL_KEY } from "@/Setup.services"
 *
 * console.log(CLAUDE_UNINSTALL_KEY.startsWith("HKCU")) // true
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const CLAUDE_UNINSTALL_KEY = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\AnthropicClaude";

/**
 * Whether `Get-AppxPackage` output names the Claude Desktop package family.
 *
 * **Example** (Find the family in PowerShell output)
 *
 * ```ts
 * import { appxListsClaude } from "@/Setup.services"
 *
 * console.log(appxListsClaude("Claude_pzs8sxrjxfjjc\r\n")) // true
 * console.log(appxListsClaude("")) // false
 * ```
 *
 * @param output - Standard output of `Get-AppxPackage -Name Claude`, one family name per line.
 * @category utilities
 * @since 0.0.0
 */
export const appxListsClaude = (output: string): boolean =>
  pipe(Str.linesIterator(output), A.fromIterable, A.map(Str.trim), A.contains(CLAUDE_PACKAGE_FAMILY));

/**
 * Service shape of {@link SetupHost}.
 *
 * **Example** (Type a host)
 *
 * ```ts
 * import type { SetupHostShape } from "@/Setup.services"
 * import * as Effect from "effect/Effect"
 *
 * const host: SetupHostShape = {
 *   claudeInstall: Effect.succeed("missing"),
 *   runInstaller: () => Effect.succeed(0),
 *   open: () => Effect.void,
 *   stateDir: Effect.succeed("C:\\Users\\lawyer\\AppData\\Local\\beep\\practice-setup"),
 * }
 * console.log(typeof host.open)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface SetupHostShape {
  /** How Claude Desktop is installed for this Windows account, if at all. */
  readonly claudeInstall: Effect.Effect<ClaudeInstall, SetupFailure>;
  /** Hand a file or link to Windows, as a double-click would. */
  readonly open: (target: string) => Effect.Effect<void, SetupFailure>;
  /** Run an installer and wait for it; succeeds with its exit code. */
  readonly runInstaller: (path: string, args: ReadonlyArray<string>) => Effect.Effect<number, SetupFailure>;
  /** The bootstrapper's own folder, created on first use. */
  readonly stateDir: Effect.Effect<string, SetupFailure>;
}

const collectText = <E>(stream: Stream.Stream<Uint8Array, E>) =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runFold(() => Str.empty, Str.concat)
  );

/**
 * The Windows facts and actions the bootstrapper needs.
 *
 * **Details**
 *
 * The live layer reads `LOCALAPPDATA` through `Config`, checks files through
 * `FileSystem`, and shells out to `reg.exe`, `powershell.exe` and
 * `explorer.exe` through `ChildProcessSpawner`. `open` uses `explorer.exe`, the
 * shell's own double-click path, so `.mcpb` files and `claude://` links reach
 * whatever Windows has registered for them.
 *
 * **Example** (A fake host for tests)
 *
 * ```ts
 * import { SetupHost } from "@/Setup.services"
 * import * as Effect from "effect/Effect"
 * import * as Layer from "effect/Layer"
 *
 * const fake = Layer.succeed(SetupHost, {
 *   claudeInstall: Effect.succeed("per-user"),
 *   runInstaller: () => Effect.succeed(0),
 *   open: () => Effect.void,
 *   stateDir: Effect.succeed("/tmp/practice-setup"),
 * })
 * console.log(Layer.isLayer(fake))
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class SetupHost extends Context.Service<SetupHost, SetupHostShape>()($I`SetupHost`) {
  /**
   * Live Windows host.
   *
   * **Example** (Compose the live host)
   *
   * ```ts
   * import { SetupHost } from "@/Setup.services"
   *
   * console.log(typeof SetupHost.layer)
   * ```
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly layer = Layer.effect(
    SetupHost,
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;

      const failWith = (message: string) => (cause: unknown) => SetupFailure.make({ cause, message });

      const run = Effect.fnUntraced(
        function* (command: string, args: ReadonlyArray<string>) {
          const child = yield* spawner.spawn(
            ChildProcess.make(command, args, { stdin: "ignore", stderr: "ignore", stdout: "pipe" })
          );
          const [stdout, exitCode] = yield* Effect.all([collectText(child.stdout), child.exitCode], {
            concurrency: "unbounded",
          });
          return { stdout, exitCode: Number(exitCode) };
        },
        Effect.scoped,
        (effect, command) => Effect.mapError(effect, failWith(`${command} could not be run.`))
      );

      const localAppData = Config.String("LOCALAPPDATA").pipe(
        Effect.mapError(failWith("This Windows account has no local application data folder."))
      );

      const perUserInstalled = Effect.gen(function* () {
        const executable = path.join(yield* localAppData, "AnthropicClaude", "claude.exe");
        const present = yield* fs
          .exists(executable)
          .pipe(Effect.mapError(failWith("Claude's folder could not be checked.")));
        // reg.exe exits 1 when the key is absent.
        return present || (yield* run("reg.exe", ["query", CLAUDE_UNINSTALL_KEY])).exitCode === 0;
      });

      const msixInstalled = run("powershell.exe", [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "Get-AppxPackage -Name Claude | Select-Object -ExpandProperty PackageFamilyName",
      ]).pipe(Effect.map(({ stdout }) => appxListsClaude(stdout)));

      const claudeInstall = Effect.gen(function* () {
        if (yield* perUserInstalled) {
          return ClaudeInstall.Enum["per-user"];
        }
        return (yield* msixInstalled) ? ClaudeInstall.Enum.msix : ClaudeInstall.Enum.missing;
      });

      return SetupHost.of({
        claudeInstall,
        runInstaller: Effect.fn("SetupHost.runInstaller")(function* (installer, args) {
          return (yield* run(installer, args)).exitCode;
        }),
        // explorer.exe exits 1 even when it opened the target, so the code is ignored.
        open: Effect.fn("SetupHost.open")(function* (target) {
          yield* run("explorer.exe", [target]);
        }),
        stateDir: Effect.gen(function* () {
          const dir = path.join(yield* localAppData, "beep", "practice-setup");
          yield* fs
            .makeDirectory(dir, { recursive: true })
            .pipe(Effect.mapError(failWith("The setup folder could not be created.")));
          return dir;
        }),
      });
    })
  );
}

/**
 * Service shape of {@link InstallerDownload}.
 *
 * **Example** (Type a download)
 *
 * ```ts
 * import type { InstallerDownloadShape } from "@/Setup.services"
 * import * as Effect from "effect/Effect"
 *
 * const download: InstallerDownloadShape = { fetch: () => Effect.void }
 * console.log(typeof download.fetch)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface InstallerDownloadShape {
  /** Download a pinned installer to `destination`, refusing it when its SHA-256 differs. */
  readonly fetch: (installer: PinnedInstaller, destination: string) => Effect.Effect<void, SetupFailure>;
}

/**
 * Downloads a pinned installer and checks its SHA-256 before writing it.
 *
 * **Details**
 *
 * A mismatched download is never written, so it can never run. The live layer
 * needs `HttpClient`, `Crypto` and `FileSystem`.
 *
 * **Example** (Compose the live download)
 *
 * ```ts
 * import { InstallerDownload } from "@/Setup.services"
 *
 * console.log(typeof InstallerDownload.layer)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class InstallerDownload extends Context.Service<InstallerDownload, InstallerDownloadShape>()(
  $I`InstallerDownload`
) {
  /**
   * Live download over `HttpClient`.
   *
   * **Example** (Read the layer)
   *
   * ```ts
   * import { InstallerDownload } from "@/Setup.services"
   *
   * console.log(typeof InstallerDownload.layer)
   * ```
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly layer = Layer.effect(
    InstallerDownload,
    Effect.gen(function* () {
      const client = HttpClient.filterStatusOk(yield* HttpClient.HttpClient);
      const crypto = yield* Crypto.Crypto;
      const fs = yield* FileSystem.FileSystem;

      return InstallerDownload.of({
        fetch: Effect.fn("PracticeSetup.InstallerDownload.fetch")(function* (installer, destination) {
          const unreachable = SetupFailure.make({
            message: "The Claude installer could not be downloaded. Check the internet connection and try again.",
          });
          const response = yield* client.get(installer.url).pipe(Effect.mapError(() => unreachable));
          const bytes = new Uint8Array(yield* response.arrayBuffer.pipe(Effect.mapError(() => unreachable)));
          const digest = yield* crypto.digest("SHA-256", bytes).pipe(Effect.map(Hex.encode), Effect.orDie);
          if (digest !== installer.sha256) {
            return yield* SetupFailure.make({
              message: "The downloaded Claude installer did not match its expected fingerprint, so it was not run.",
            });
          }
          yield* fs
            .writeFile(destination, bytes)
            .pipe(
              Effect.mapError((cause) =>
                SetupFailure.make({ cause, message: "The Claude installer could not be saved." })
              )
            );
        }),
      });
    })
  );
}

/**
 * Service shape of {@link GatewayBundle}.
 *
 * **Example** (Type a bundle)
 *
 * ```ts
 * import type { GatewayBundleShape } from "@/Setup.services"
 * import * as Effect from "effect/Effect"
 *
 * const bundle: GatewayBundleShape = { materialize: () => Effect.succeed("practice-gateway.mcpb") }
 * console.log(typeof bundle.materialize)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface GatewayBundleShape {
  /** Copy the gateway `.mcpb` into `dir` and return the copy's path, ready to open. */
  readonly materialize: (dir: string) => Effect.Effect<string, SetupFailure>;
}

/**
 * The practice gateway `.mcpb` the bootstrapper hands to Claude.
 *
 * **Details**
 *
 * The compiled bootstrapper embeds the bundle, which lives in Bun's virtual
 * file system; Windows can only open a real file with the `.mcpb` extension,
 * so the bundle is copied out first.
 *
 * **Example** (Bundle from a file)
 *
 * ```ts
 * import { GatewayBundle } from "@/Setup.services"
 * import * as Layer from "effect/Layer"
 *
 * console.log(Layer.isLayer(GatewayBundle.fromFile("practice-gateway-windows-x64.mcpb")))
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class GatewayBundle extends Context.Service<GatewayBundle, GatewayBundleShape>()($I`GatewayBundle`) {
  /**
   * The bundle read from `source`, an embedded asset or a file beside the
   * executable.
   *
   * **Example** (Read the constructor)
   *
   * ```ts
   * import { GatewayBundle } from "@/Setup.services"
   *
   * console.log(typeof GatewayBundle.fromFile)
   * ```
   *
   * @param source - Path of the bundle to copy out.
   * @category layers
   * @since 0.0.0
   */
  static readonly fromFile = (source: string) =>
    Layer.effect(
      GatewayBundle,
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        return GatewayBundle.of({
          materialize: Effect.fn("GatewayBundle.materialize")(function* (dir) {
            const target = path.join(dir, "practice-gateway.mcpb");
            yield* fs.readFile(source).pipe(
              Effect.flatMap((bytes) => fs.writeFile(target, bytes)),
              Effect.mapError((cause) =>
                SetupFailure.make({ cause, message: "The Practice Gateway file is missing from this setup program." })
              )
            );
            return target;
          }),
        });
      })
    );
}

/**
 * Service shape of {@link Lawyer}.
 *
 * **Example** (Type a conversation)
 *
 * ```ts
 * import type { LawyerShape } from "@/Setup.services"
 * import * as Effect from "effect/Effect"
 *
 * const lawyer: LawyerShape = { tell: () => Effect.void, waitFor: () => Effect.void }
 * console.log(typeof lawyer.waitFor)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface LawyerShape {
  /** Show one plain-language line. */
  readonly tell: (text: string) => Effect.Effect<void>;
  /** Show an instruction and wait until the lawyer presses Enter. */
  readonly waitFor: (instruction: string) => Effect.Effect<void, SetupFailure>;
}

/**
 * The bootstrapper's console conversation with the lawyer.
 *
 * **Example** (Compose the console conversation)
 *
 * ```ts
 * import { Lawyer } from "@/Setup.services"
 *
 * console.log(typeof Lawyer.layer)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class Lawyer extends Context.Service<Lawyer, LawyerShape>()($I`Lawyer`) {
  /**
   * Live conversation over `Terminal`.
   *
   * **Example** (Read the layer)
   *
   * ```ts
   * import { Lawyer } from "@/Setup.services"
   *
   * console.log(typeof Lawyer.layer)
   * ```
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly layer = Layer.effect(
    Lawyer,
    Effect.gen(function* () {
      const terminal = yield* Terminal.Terminal;
      const tell = (text: string) => terminal.display(`${text}\n`).pipe(Effect.ignore);
      return Lawyer.of({
        tell,
        waitFor: Effect.fn("Lawyer.waitFor")(function* (instruction) {
          yield* tell(`\n${instruction}\nPress Enter when you are done.`);
          yield* terminal.readLine.pipe(
            Effect.mapError((cause) => SetupFailure.make({ cause, message: "Setup was stopped before it finished." }))
          );
        }),
      });
    })
  );
}

/**
 * How long the bootstrapper waits for Claude Desktop to appear after its
 * installer returns: every 2 seconds for up to 3 minutes.
 *
 * **Example** (Override the wait in a test)
 *
 * ```ts
 * import { InstallWaitSchedule } from "@/Setup.services"
 * import * as Effect from "effect/Effect"
 * import * as Schedule from "effect/Schedule"
 *
 * const fast = Effect.provideService(InstallWaitSchedule, Schedule.recurs(1))
 * console.log(typeof fast)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export const InstallWaitSchedule = Context.Reference<Schedule.Schedule<unknown>>($I`InstallWaitSchedule`, {
  defaultValue: (): Schedule.Schedule<unknown> => Schedule.max([Schedule.spaced("2 seconds"), Schedule.recurs(90)]),
});

/**
 * Everything the live bootstrapper needs besides the platform services.
 *
 * **Example** (Compose the live services)
 *
 * ```ts
 * import { liveSetupServices } from "@/Setup.services"
 * import * as Layer from "effect/Layer"
 *
 * console.log(Layer.isLayer(liveSetupServices("practice-gateway.mcpb")))
 * ```
 *
 * @param bundleSource - Path of the gateway `.mcpb` to hand to Claude.
 * @category layers
 * @since 0.0.0
 */
export const liveSetupServices = flow(GatewayBundle.fromFile, (bundle) =>
  Layer.mergeAll(SetupHost.layer, InstallerDownload.layer, Lawyer.layer, bundle)
);
