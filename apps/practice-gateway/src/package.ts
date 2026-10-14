#!/usr/bin/env bun

/**
 * Cross-platform MCPB packaging entrypoint for the practice gateway.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $PracticeGatewayId } from "@beep/identity/packages";
import { PracticeKgToolkit } from "@beep/law-practice-server";
import * as OptionUtils from "@beep/utils/Option";
import * as A from "effect/Array";
import { Command, Flag } from "effect/cli";
import * as Effect from "effect/Effect";
import * as Base64 from "effect/encoding/Base64";
import * as FileSystem from "effect/FileSystem";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { runEntrypoint } from "./entrypoint.ts";
import { PackageFailure } from "./PracticeGateway.errors.ts";
import { SetupToolkit } from "./SetupTools.ts";
import { PRACTICE_GATEWAY_VERSION } from "./Version.ts";

const $I = $PracticeGatewayId.create("package");

const DuckDbVersion = "1.5.6-r.1";
/*
 * sha512 integrity for the win32 bindings tarball, copied from bun.lock's
 * entry for @duckdb/node-bindings-win32-x64@1.5.6-r.1. The download is
 * verified against this pin before anything is extracted into a
 * user-installed artifact; a DuckDB catalog bump must update both constants.
 */
const WindowsBindingsSha512 =
  "5Rpn5WXEG5gY/u7Keh+c4kuwG/LiE31pCP9CoCohv+u0aFensk/yRIQVW/CXuIoITky9xFhdRzaWUtAnGTYxJQ==";
const WindowsBindingsUrl = `https://registry.npmjs.org/@duckdb/node-bindings-win32-x64/-/node-bindings-win32-x64-${DuckDbVersion}.tgz`;
class BindingsManifest extends S.Class<BindingsManifest>($I`BindingsManifest`)(
  { version: S.String },
  $I.annote("BindingsManifest", {
    description: "Version field of an installed DuckDB bindings package manifest.",
  })
) {}
const decodeBindingsPackageJson = S.decodeUnknownEffect(S.fromJsonString(BindingsManifest));
const NativeAddonExternals = [
  "@duckdb/node-bindings-linux-x64/duckdb.node",
  "@duckdb/node-bindings-linux-x64-musl/duckdb.node",
  "@duckdb/node-bindings-linux-arm64/duckdb.node",
  "@duckdb/node-bindings-linux-arm64-musl/duckdb.node",
  "@duckdb/node-bindings-darwin-arm64/duckdb.node",
  "@duckdb/node-bindings-darwin-x64/duckdb.node",
  "@duckdb/node-bindings-win32-arm64/duckdb.node",
  "@duckdb/node-bindings-win32-x64/duckdb.node",
];
const ForbiddenArchiveFragments = ["package.ts", "src/", "practice-profile.json", ".dpapi"];

const PackageTarget = S.Literals(["all", "linux-x64", "windows-x64"]);
type PackageTarget = typeof PackageTarget.Type;

const TargetSpecs = {
  "linux-x64": {
    bunTarget: "bun-linux-x64",
    executable: "practice-gateway",
    nativePackage: "node-bindings-linux-x64",
    platform: "linux",
  },
  "windows-x64": {
    bunTarget: "bun-windows-x64",
    executable: "practice-gateway.exe",
    nativePackage: "node-bindings-win32-x64",
    platform: "win32",
  },
} as const satisfies Record<Exclude<PackageTarget, "all">, Record<string, string>>;

const target = Flag.Literals("target", PackageTarget.literals).pipe(Flag.withDefault("all" satisfies PackageTarget));
const output = Flag.Directory("output").pipe(Flag.withDefault("apps/practice-gateway/dist/mcpb"));

const run = Effect.fn("PracticeGatewayPackage.run")(function* (
  command: ReadonlyArray<string>,
  options?: { readonly cwd?: string | undefined }
) {
  const result = yield* Effect.tryPromise({
    try: () =>
      Bun.spawn([...command], {
        ...OptionUtils.getSomesStruct({ cwd: O.fromUndefinedOr(options?.cwd) }),
        stderr: "inherit",
        stdout: "inherit",
      }).exited.then((exitCode) => ({ exitCode })),
    catch: (cause) => PackageFailure.make({ cause, message: `Failed to launch "${A.join(command, " ")}".` }),
  });
  if (result.exitCode !== 0) {
    return yield* PackageFailure.make({
      message: `Command failed with exit code ${result.exitCode}: ${A.join(command, " ")}`,
    });
  }
});

const copyDirectory = Effect.fn("PracticeGatewayPackage.copyDirectory")(function* (
  source: string,
  destination: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  yield* fs.makeDirectory(destination, { recursive: true });
  const entries = yield* fs
    .readDirectory(source)
    .pipe(
      Effect.mapError((cause) => PackageFailure.make({ cause, message: `Failed reading sidecars at "${source}".` }))
    );
  yield* Effect.forEach(
    entries,
    (entry) =>
      fs
        .copy(path.join(source, entry), path.join(destination, entry))
        .pipe(
          Effect.mapError((cause) =>
            PackageFailure.make({ cause, message: `Failed copying DuckDB sidecar "${entry}".` })
          )
        ),
    { discard: true }
  );
});

const ensureWindowsBindings = Effect.fn("PracticeGatewayPackage.ensureWindowsBindings")(function* (
  cacheDir: string,
  repoRoot: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const installedManifest = yield* fs
    .readFileString(path.join(repoRoot, "node_modules", "@duckdb", "node-bindings-linux-x64", "package.json"))
    .pipe(
      Effect.flatMap(decodeBindingsPackageJson),
      Effect.mapError((cause) => PackageFailure.make({ cause, message: "Failed reading installed DuckDB bindings." }))
    );
  if (installedManifest.version !== DuckDbVersion) {
    return yield* PackageFailure.make({
      message: `Installed DuckDB bindings ${installedManifest.version} differ from pinned ${DuckDbVersion}; update DuckDbVersion and WindowsBindingsSha512 together.`,
    });
  }
  const packageDir = path.join(cacheDir, "node-bindings-win32-x64");
  if (yield* fs.exists(path.join(packageDir, "duckdb.node"))) {
    return packageDir;
  }
  const tarball = path.join(cacheDir, "node-bindings-win32-x64.tgz");
  yield* fs.makeDirectory(packageDir, { recursive: true });
  yield* run(["curl", "--fail", "--location", "--silent", "--show-error", WindowsBindingsUrl, "--output", tarball]);
  const tarballBytes = yield* fs
    .readFile(tarball)
    .pipe(Effect.mapError((cause) => PackageFailure.make({ cause, message: "Failed reading bindings tarball." })));
  const digest = yield* Effect.tryPromise({
    try: () => globalThis.crypto.subtle.digest("SHA-512", Uint8Array.from(tarballBytes).buffer),
    catch: (cause) => PackageFailure.make({ cause, message: "Failed hashing bindings tarball." }),
  });
  const digestBase64 = Base64.encode(new Uint8Array(digest));
  if (digestBase64 !== WindowsBindingsSha512) {
    yield* fs.remove(tarball, { force: true });
    return yield* PackageFailure.make({
      message: `DuckDB win32 bindings tarball failed sha512 verification (got ${digestBase64}).`,
    });
  }
  yield* run(["tar", "-xzf", tarball, "--strip-components=1", "-C", packageDir]);
  return packageDir;
});

/*
 * The manifest's tool list derives from the toolkits the gateway serves, so it
 * cannot drift from them. Setup tools are always mounted; practice-kg tools
 * mount when the saved profile selects the knowledge graph.
 */
const manifestTools = A.map([...R.values(SetupToolkit.tools), ...R.values(PracticeKgToolkit.tools)], (tool) => ({
  name: tool.name,
  description: O.getOrElse(O.fromUndefinedOr(tool.description), () => tool.name),
}));

const manifestFor = (platform: "linux" | "win32", executable: string): string =>
  JSON.stringify(
    {
      manifest_version: "0.3",
      name: "beep-practice-gateway",
      display_name: "Beep Practice Gateway",
      version: PRACTICE_GATEWAY_VERSION,
      description:
        "Sets up this computer for the practice (checks, approved repairs, the lawyer's steps) and serves the practice tools the saved profile selects.",
      author: { name: "Beep Effect contributors" },
      repository: { type: "git", url: "https://github.com/kriegcloud/beep-effect.git" },
      license: "MIT",
      compatibility: { platforms: [platform] },
      server: {
        type: "binary",
        entry_point: executable,
        mcp_config: {
          command: `\${__dirname}/${executable}`,
          env: {
            BUNDLE_DIR: "${user_config.bundle_dir}",
            // Bun-compiled executables resolve bare specifiers against the embedded virtual
            // root (B:\~BUN\root / /$bunfs/root), never the exe-adjacent node_modules; the
            // @duckdb native binding only loads when NODE_PATH points at the unpacked dir.
            NODE_PATH: "${__dirname}/node_modules",
            PRACTICE_KG_CORPUS_ROOT: "${user_config.corpus_root}",
          },
        },
      },
      user_config: {
        bundle_dir: {
          type: "directory",
          title: "Practice knowledge-graph bundle",
          description: "Optional. Directory containing bundle.manifest.json, kg.pglite, and practice.duckdb.",
          required: false,
        },
        corpus_root: {
          type: "directory",
          title: "Practice corpus root",
          description: "Optional corpus root used for click-through to source files and email bodies.",
          required: false,
        },
      },
      tools: manifestTools,
    },
    null,
    2
  );

// fallow-ignore-next-line complexity -- archive gate is deliberately explicit; exercised by package:mcpb on every build
const assertArchive = Effect.fn("PracticeGatewayPackage.assertArchive")(function* (
  archivePath: string,
  nativePackage: string
) {
  const fs = yield* FileSystem.FileSystem;
  const process = yield* Effect.try({
    try: () => Bun.spawn(["unzip", "-Z1", archivePath], { stderr: "pipe", stdout: "pipe" }),
    catch: (cause) => PackageFailure.make({ cause, message: `Failed inspecting "${archivePath}".` }),
  });
  const output = yield* Effect.tryPromise({
    try: () => new Response(process.stdout).text(),
    catch: (cause) => PackageFailure.make({ cause, message: `Failed reading "${archivePath}" inventory.` }),
  });
  const exitCode = yield* Effect.tryPromise({
    try: () => process.exited,
    catch: (cause) => PackageFailure.make({ cause, message: `Failed waiting for unzip on "${archivePath}".` }),
  });
  const listing = { exitCode, output };
  if (listing.exitCode !== 0) {
    return yield* PackageFailure.make({ message: `unzip could not inspect "${archivePath}".` });
  }
  const entries = Str.split("\n")(Str.trim(listing.output));
  const forbidden = A.findFirst(entries, (entry) =>
    A.some(ForbiddenArchiveFragments, (fragment) => Str.includes(fragment)(entry))
  );
  if (O.isSome(forbidden)) {
    yield* fs.remove(archivePath, { force: true });
    return yield* PackageFailure.make({ message: `Forbidden entry leaked into MCPB: ${forbidden.value}` });
  }
  const allowedExact: ReadonlyArray<string> = [
    "manifest.json",
    "practice-gateway",
    "practice-gateway.exe",
    "node_modules/",
    "node_modules/@duckdb/",
  ];
  const allowed = (entry: string) =>
    A.contains(allowedExact, entry) || Str.startsWith(`node_modules/@duckdb/${nativePackage}/`)(entry);
  const unexpected = A.findFirst(entries, (entry) => !allowed(entry));
  if (O.isSome(unexpected)) {
    yield* fs.remove(archivePath, { force: true });
    return yield* PackageFailure.make({ message: `Unexpected entry in MCPB: ${unexpected.value}` });
  }
  if (!(yield* fs.exists(archivePath))) {
    return yield* PackageFailure.make({ message: `MCPB was not created at "${archivePath}".` });
  }
});

// fallow-ignore-next-line complexity -- operational packaging lane; exercised end-to-end by package:mcpb + smoke:compiled, not unit-covered
const packageTarget = Effect.fn("PracticeGatewayPackage.packageTarget")(function* (
  targetName: Exclude<PackageTarget, "all">,
  outputRoot: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const repoRoot = path.resolve(import.meta.dir, "..", "..", "..");
  const { bunTarget, executable, nativePackage, platform } = TargetSpecs[targetName];
  const resolvedOutputRoot = path.resolve(repoRoot, outputRoot);
  const bundleDir = path.resolve(resolvedOutputRoot, targetName);
  const archivePath = path.resolve(resolvedOutputRoot, `practice-gateway-${targetName}.mcpb`);
  const cacheDir = path.resolve(resolvedOutputRoot, ".cache");
  const nativeSource =
    targetName === "windows-x64"
      ? yield* ensureWindowsBindings(cacheDir, repoRoot)
      : path.resolve(repoRoot, "node_modules", "@duckdb", nativePackage);
  yield* fs.remove(bundleDir, { recursive: true, force: true });
  yield* fs.makeDirectory(bundleDir, { recursive: true });
  const manifest = manifestFor(platform, executable);
  yield* fs.writeFileString(path.join(bundleDir, "manifest.json"), `${manifest}\n`);
  yield* run(
    [
      "bun",
      "build",
      "--compile",
      `--target=${bunTarget}`,
      "apps/practice-gateway/src/bin.ts",
      `--outfile=${path.join(bundleDir, executable)}`,
      "--asset-naming=[name].[ext]",
      ...A.flatMap(NativeAddonExternals, (external) => ["--external", external]),
    ],
    { cwd: repoRoot }
  );
  yield* copyDirectory(nativeSource, path.join(bundleDir, "node_modules", "@duckdb", nativePackage));
  yield* fs.remove(archivePath, { force: true });
  yield* run(["zip", "-q", "-r", archivePath, "."], { cwd: bundleDir });
  yield* assertArchive(archivePath, nativePackage);
  yield* Effect.logInfo("MCPB packaged", { archivePath, target: targetName });
});

const program = Command.make(
  "practice-gateway-package",
  { output, target },
  Effect.fnUntraced(function* ({ output, target }) {
    const targets = Match.value(target).pipe(
      Match.when("all", () => ["linux-x64", "windows-x64"] as const),
      Match.when("linux-x64", () => ["linux-x64"] as const),
      Match.when("windows-x64", () => ["windows-x64"] as const),
      Match.exhaustive
    );
    yield* Effect.forEach(targets, (targetName) => packageTarget(targetName, output), { discard: true });
  })
).pipe(Command.run({ version: "0.0.0" }));
runEntrypoint({ isMain: import.meta.main, program });
