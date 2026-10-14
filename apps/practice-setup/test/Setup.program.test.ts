import { it } from "@beep/test-runner";
import * as MemoryFileSystem from "@beep/test-utils/MemoryFileSystem";
import * as BunCrypto from "@effect/platform-bun/BunCrypto";
import * as BunPath from "@effect/platform-bun/BunPath";
import { describe, expect } from "@effect/vitest";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { HttpClient, HttpClientResponse } from "effect/http";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Ref from "effect/Ref";
import * as Result from "effect/Result";
import * as Schedule from "effect/Schedule";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { embeddedEntrySource } from "@/build";
import { SetupFailure } from "@/Setup.errors";
import {
  ClaudeDesktopInstaller,
  newChatLink,
  ONBOARDING_FIRST_MESSAGE,
  OPEN_CLAUDE_LINK,
  PinnedInstaller,
  SetupReport,
} from "@/Setup.models";
import { REPORT_FILE, runSetup } from "@/Setup.program";
import {
  appxListsClaude,
  GatewayBundle,
  InstallerDownload,
  InstallWaitSchedule,
  Lawyer,
  SetupHost,
} from "@/Setup.services";
import type { ClaudeInstall, StepOutcome } from "@/Setup.models";

const STATE_DIR = "/state";
const ABC_SHA256 = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";
const BUNDLE = "/state/practice-gateway.mcpb";

interface Script {
  /** waitFor fails on the call with this index (0-based). */
  readonly cancelAt?: number;
  readonly downloadFails?: boolean;
  /** Install kinds `claudeInstall` answers, in order; the last one repeats. */
  readonly installs: A.NonEmptyReadonlyArray<ClaudeInstall>;
}

const harness = Effect.fnUntraced(function* (script: Script) {
  const opened = yield* Ref.make<ReadonlyArray<string>>([]);
  const installersRun = yield* Ref.make<ReadonlyArray<string>>([]);
  const downloads = yield* Ref.make<ReadonlyArray<string>>([]);
  const said = yield* Ref.make<ReadonlyArray<string>>([]);
  const waits = yield* Ref.make(0);
  const probes = yield* Ref.make(0);

  const host = SetupHost.of({
    claudeInstall: Ref.getAndUpdate(probes, (n) => n + 1).pipe(
      Effect.map((n) => O.getOrElse(A.get(script.installs, n), () => A.lastNonEmpty(script.installs)))
    ),
    runInstaller: Effect.fn("FakeHost.runInstaller")(function* (path) {
      yield* Ref.update(installersRun, A.append(path));
      return 0;
    }),
    open: Effect.fn("FakeHost.open")(function* (target) {
      yield* Ref.update(opened, A.append(target));
    }),
    stateDir: Effect.succeed(STATE_DIR),
  });
  const download = InstallerDownload.of({
    fetch: Effect.fn("FakeDownload.fetch")(function* (_installer, destination) {
      if (script.downloadFails === true) {
        return yield* SetupFailure.make({ message: "The Claude installer could not be downloaded." });
      }
      yield* Ref.update(downloads, A.append(destination));
    }),
  });
  const lawyer = Lawyer.of({
    tell: Effect.fn("FakeLawyer.tell")(function* (text) {
      yield* Ref.update(said, A.append(text));
    }),
    waitFor: Effect.fn("FakeLawyer.waitFor")(function* (text) {
      yield* Ref.update(said, A.append(text));
      if ((yield* Ref.getAndUpdate(waits, (n) => n + 1)) === script.cancelAt) {
        return yield* SetupFailure.make({ message: "Setup was stopped before it finished." });
      }
    }),
  });
  const bundle = GatewayBundle.of({
    materialize: Effect.fn("FakeBundle.materialize")(function* () {
      return BUNDLE;
    }),
  });

  const report = yield* runSetup.pipe(
    Effect.provideService(SetupHost, host),
    Effect.provideService(InstallerDownload, download),
    Effect.provideService(Lawyer, lawyer),
    Effect.provideService(GatewayBundle, bundle),
    Effect.provideService(InstallWaitSchedule, Schedule.recurs(2))
  );
  const fs = yield* FileSystem.FileSystem;
  const written = yield* fs.readFileString(`${STATE_DIR}/${REPORT_FILE}`);
  return {
    report,
    written: yield* S.decodeEffect(S.fromJsonString(SetupReport))(written),
    opened: yield* Ref.get(opened),
    installersRun: yield* Ref.get(installersRun),
    downloads: yield* Ref.get(downloads),
    said: yield* Ref.get(said),
  };
});

const Platform = Layer.mergeAll(MemoryFileSystem.layer, BunPath.layer);

const run = Effect.fn("run")(function* (script: Script) {
  const fs = yield* FileSystem.FileSystem;
  yield* fs.makeDirectory(STATE_DIR, { recursive: true });
  return yield* harness(script);
});

const steps = (report: SetupReport): ReadonlyArray<string> =>
  A.map(report.outcomes, (outcome: StepOutcome) => `${outcome.step}:${outcome.outcome}`);

it.layer(Platform)("runSetup", (it) => {
  it.effect("skips the install, then opens Claude, the gateway and the onboarding chat", () =>
    Effect.gen(function* () {
      const result = yield* run({ installs: ["per-user"] });
      expect(steps(result.report)).toEqual([
        "claude-desktop:skipped",
        "claude-sign-in:done",
        "gateway-extension:done",
        "onboarding-handoff:done",
      ]);
      expect(result.report.complete).toBe(true);
      expect(result.opened).toEqual([OPEN_CLAUDE_LINK, BUNDLE, newChatLink(ONBOARDING_FIRST_MESSAGE)]);
      expect(result.downloads).toEqual([]);
      expect(steps(result.written)).toEqual(steps(result.report));
    })
  );

  it.effect("downloads and runs the pinned installer when Claude is missing", () =>
    Effect.gen(function* () {
      const result = yield* run({ installs: ["missing", "missing", "per-user"] });
      const installer = `${STATE_DIR}/Claude-Setup-${ClaudeDesktopInstaller.version}.exe`;
      expect(result.downloads).toEqual([installer]);
      expect(result.installersRun).toEqual([installer]);
      expect(steps(result.report)[0]).toBe("claude-desktop:done");
      expect(result.report.complete).toBe(true);
    })
  );

  it.effect("accepts an administrator's MSIX install as installed", () =>
    Effect.gen(function* () {
      const result = yield* run({ installs: ["msix"] });
      expect(steps(result.report)[0]).toBe("claude-desktop:skipped");
    })
  );

  it.effect("stops before opening anything when the download fails", () =>
    Effect.gen(function* () {
      const result = yield* run({ installs: ["missing"], downloadFails: true });
      expect(steps(result.report)).toEqual(["claude-desktop:failed"]);
      expect(result.report.complete).toBe(false);
      expect(result.installersRun).toEqual([]);
      expect(result.opened).toEqual([]);
      expect(A.some(result.said, (line) => line.startsWith("Setup stopped: The Claude installer"))).toBe(true);
    })
  );

  it.effect("fails the install step when Claude never appears", () =>
    Effect.gen(function* () {
      const result = yield* run({ installs: ["missing"] });
      expect(steps(result.report)).toEqual(["claude-desktop:failed"]);
      expect(A.map(result.report.outcomes, (outcome: StepOutcome) => outcome.detail)[0]).toContain(
        "installer exit code 0"
      );
    })
  );

  it.effect("stops at sign-in when the lawyer cancels and never opens the gateway", () =>
    Effect.gen(function* () {
      const result = yield* run({ installs: ["per-user"], cancelAt: 0 });
      expect(steps(result.report)).toEqual(["claude-desktop:skipped", "claude-sign-in:failed"]);
      expect(result.opened).toEqual([OPEN_CLAUDE_LINK]);
    })
  );
});

// Serves the URL's last path segment as the body, so each test picks its bytes.
const Serving = Layer.succeed(
  HttpClient.HttpClient,
  HttpClient.make((request, url) =>
    Effect.succeed(HttpClientResponse.fromWeb(request, new Response(Str.slice(1)(url.pathname))))
  )
);

const DownloadLayer = InstallerDownload.layer.pipe(
  Layer.provideMerge(Layer.mergeAll(Serving, BunCrypto.layer, MemoryFileSystem.layer))
);

const downloadWith = Effect.fn("downloadWith")(function* (body: string, sha256: string, destination: string) {
  const download = yield* InstallerDownload;
  const fs = yield* FileSystem.FileSystem;
  const installer = PinnedInstaller.make({ version: "1", url: `https://example.test/${body}`, sha256, silentArgs: [] });
  const result = yield* Effect.result(download.fetch(installer, destination));
  return { result, written: yield* fs.exists(destination) };
});

it.layer(DownloadLayer)("InstallerDownload", (it) => {
  it.effect("writes an installer whose SHA-256 matches the pin", () =>
    Effect.gen(function* () {
      const { result, written } = yield* downloadWith("abc", ABC_SHA256, "/match.exe");
      expect(Result.isSuccess(result)).toBe(true);
      expect(written).toBe(true);
    })
  );

  it.effect("refuses and never writes an installer with another SHA-256", () =>
    Effect.gen(function* () {
      const { result, written } = yield* downloadWith("xyz", ABC_SHA256, "/mismatch.exe");
      expect(Result.isFailure(result)).toBe(true);
      expect(written).toBe(false);
    })
  );
});

describe("bootstrapper helpers", () => {
  it("finds the Claude package family in Get-AppxPackage output", () => {
    expect(appxListsClaude("Claude_pzs8sxrjxfjjc\r\n")).toBe(true);
    expect(appxListsClaude("Other_123\r\n")).toBe(false);
  });

  it("URL-encodes the onboarding message into a claude:// link", () => {
    expect(newChatLink("Set up & go?")).toBe("claude://claude.ai/new?q=Set%20up%20%26%20go%3F");
  });

  it("embeds the bundle through a static file import", () => {
    const source = embeddedEntrySource("../../src/bin.ts");
    expect(source).toContain('import bundle from "./practice-gateway.mcpb" with { type: "file" };');
    expect(source).toContain('import { main } from "../../src/bin.ts";');
  });

  it("pins a lower-case SHA-256 for the Claude installer", () => {
    expect(ClaudeDesktopInstaller.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(ClaudeDesktopInstaller.url).toContain(ClaudeDesktopInstaller.version);
  });
});
