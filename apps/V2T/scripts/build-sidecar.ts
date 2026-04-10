import { fileURLToPath } from "node:url";
import { $I } from "@beep/identity/packages";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { BunRuntime } from "@effect/platform-bun";
import * as BunServices from "@effect/platform-bun/BunServices";
import { Config, Effect, Fiber, FileSystem, Layer, Path, Runtime, Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import type * as PlatformError from "effect/PlatformError";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { ChildProcess } from "effect/unstable/process";

const $TwoTvBuildId = $I.create("V2T/scripts/build-sidecar");
const sidecarEntrypoint = "packages/VT2/src/main.ts";

const SupportedRustTargetTriple = LiteralKit([
  "x86_64-unknown-linux-gnu",
  "aarch64-unknown-linux-gnu",
  "x86_64-apple-darwin",
  "aarch64-apple-darwin",
  "x86_64-pc-windows-msvc",
]).annotate(
  $TwoTvBuildId.annote("SupportedRustTargetTriple", {
    description: "Rust target triples supported by the V2T sidecar build script.",
  })
);

type SupportedRustTargetTriple = typeof SupportedRustTargetTriple.Type;

const BunBuildTarget = LiteralKit([
  "bun-linux-x64-modern",
  "bun-linux-arm64-modern",
  "bun-darwin-x64-modern",
  "bun-darwin-arm64-modern",
  "bun-windows-x64-modern",
]).annotate(
  $TwoTvBuildId.annote("BunBuildTarget", {
    description: "Bun standalone compilation targets used by the V2T sidecar build script.",
  })
);

type BunBuildTarget = typeof BunBuildTarget.Type;

class BuildSidecarInvariantError extends TaggedErrorClass<BuildSidecarInvariantError>(
  $TwoTvBuildId`BuildSidecarInvariantError`
)(
  "BuildSidecarInvariantError",
  {
    message: S.String,
  },
  $TwoTvBuildId.annote("BuildSidecarInvariantError", {
    description: "Raised when the V2T sidecar build script hits an unexpected invariant.",
  })
) {}

class BuildSidecarCommandExitError extends TaggedErrorClass<BuildSidecarCommandExitError>(
  $TwoTvBuildId`BuildSidecarCommandExitError`
)(
  "BuildSidecarCommandExitError",
  {
    command: S.String,
    exitCode: S.Number,
    stderr: S.String,
  },
  $TwoTvBuildId.annote("BuildSidecarCommandExitError", {
    description: "Raised when a required child process exits with a non-zero status.",
  })
) {}

class UnsupportedRustTargetTripleError extends TaggedErrorClass<UnsupportedRustTargetTripleError>(
  $TwoTvBuildId`UnsupportedRustTargetTripleError`
)(
  "UnsupportedRustTargetTripleError",
  {
    triple: S.String,
  },
  $TwoTvBuildId.annote("UnsupportedRustTargetTripleError", {
    description: "Raised when the V2T sidecar build script resolves an unsupported Rust target triple.",
  })
) {}

const isSupportedRustTargetTriple = S.is(SupportedRustTargetTriple);

const rustTripleToBunTarget: Record<SupportedRustTargetTriple, BunBuildTarget> = {
  "x86_64-unknown-linux-gnu": "bun-linux-x64-modern",
  "aarch64-unknown-linux-gnu": "bun-linux-arm64-modern",
  "x86_64-apple-darwin": "bun-darwin-x64-modern",
  "aarch64-apple-darwin": "bun-darwin-arm64-modern",
  "x86_64-pc-windows-msvc": "bun-windows-x64-modern",
};

const withExitCode = <E extends object>(error: E, exitCode: number): E & { readonly [Runtime.errorExitCode]: number } =>
  Object.assign(error, { [Runtime.errorExitCode]: exitCode });

const buildSidecarCommandExitError = (command: string, exitCode: number, stderr: string) =>
  withExitCode(
    new BuildSidecarCommandExitError({
      command,
      exitCode,
      stderr,
    }),
    exitCode
  );

const collectText = (stream: Stream.Stream<Uint8Array, PlatformError.PlatformError>) =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runFold(() => Str.empty, Str.concat),
    Effect.map(Str.trim)
  );

const runBufferedCommand = Effect.fn("TwoTvBuild.runBufferedCommand")(function* (command: ChildProcess.Command) {
  return yield* Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* command;
      const stdoutFiber = yield* Effect.forkScoped(collectText(handle.stdout));
      const stderrFiber = yield* Effect.forkScoped(collectText(handle.stderr));
      const exitCode = yield* handle.exitCode;
      const stdout = yield* Fiber.join(stdoutFiber);
      const stderr = yield* Fiber.join(stderrFiber);

      return { stdout, stderr, exitCode };
    })
  );
});

const decodeHostTripleLine = Effect.fn("TwoTvBuild.decodeHostTripleLine")(function* (verboseVersionOutput: string) {
  const hostLine = A.findFirst(Str.split("\n")(verboseVersionOutput), (line) => Str.startsWith("host: ")(line));

  if (O.isNone(hostLine)) {
    return yield* new BuildSidecarInvariantError({
      message: "Could not find the rust host triple in `rustc -vV` output.",
    });
  }

  return Str.trim(Str.replace("host: ", "")(hostLine.value));
});

const resolveRustHostTriple = Effect.fn("TwoTvBuild.resolveRustHostTriple")(function* () {
  const rustHostTupleResult = yield* runBufferedCommand(
    ChildProcess.make("rustc", ["--print", "host-tuple"], {
      extendEnv: true,
      stdin: "ignore",
      stdout: "pipe",
      stderr: "pipe",
    })
  );

  if (rustHostTupleResult.exitCode === 0 && Str.isNonEmpty(rustHostTupleResult.stdout)) {
    return rustHostTupleResult.stdout;
  }

  const rustVerboseVersionResult = yield* runBufferedCommand(
    ChildProcess.make("rustc", ["-vV"], {
      extendEnv: true,
      stdin: "ignore",
      stdout: "pipe",
      stderr: "pipe",
    })
  );

  if (rustVerboseVersionResult.exitCode !== 0) {
    return yield* buildSidecarCommandExitError(
      "rustc -vV",
      rustVerboseVersionResult.exitCode,
      rustVerboseVersionResult.stderr
    );
  }

  return yield* decodeHostTripleLine(rustVerboseVersionResult.stdout);
});

const resolveBuildScriptConfig = Effect.fn("TwoTvBuild.resolveBuildScriptConfig")(function* () {
  const path = yield* Path.Path;
  const currentDirectory = fileURLToPath(new URL(".", import.meta.url));
  const repoRoot = path.resolve(currentDirectory, "../../..");
  const configuredTargetTriple = yield* Config.option(
    Config.string("TAURI_ENV_TARGET_TRIPLE").pipe(Config.orElse(() => Config.string("CARGO_BUILD_TARGET")))
  );
  const resolvedTargetTriple = O.isSome(configuredTargetTriple)
    ? configuredTargetTriple.value
    : yield* resolveRustHostTriple();

  if (!isSupportedRustTargetTriple(resolvedTargetTriple)) {
    return yield* new UnsupportedRustTargetTripleError({ triple: resolvedTargetTriple });
  }

  const binaryFileName = `v2t-sidecar-${resolvedTargetTriple}${Str.includes("windows")(resolvedTargetTriple) ? ".exe" : ""}`;

  return {
    repoRoot,
    outputPath: path.resolve(currentDirectory, "../src-tauri/binaries", binaryFileName),
    bunTarget: rustTripleToBunTarget[resolvedTargetTriple],
  };
});

const buildSidecar = Effect.fn("TwoTvBuild.buildSidecar")(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const config = yield* resolveBuildScriptConfig();

  yield* fs.makeDirectory(path.dirname(config.outputPath), { recursive: true });

  const exitCode = yield* Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* ChildProcess.make(
        "bun",
        ["build", sidecarEntrypoint, "--compile", `--target=${config.bunTarget}`, `--outfile=${config.outputPath}`],
        {
          cwd: config.repoRoot,
          extendEnv: true,
          stdin: "inherit",
          stdout: "inherit",
          stderr: "inherit",
        }
      );

      return yield* handle.exitCode;
    })
  );

  if (exitCode !== 0) {
    return yield* new BuildSidecarCommandExitError({
      command: `bun build ${sidecarEntrypoint} --compile`,
      exitCode,
      stderr: "",
    });
  }
});

const main = Layer.effectDiscard(buildSidecar().pipe(Effect.withSpan("TwoTvBuild.buildSidecar"))).pipe(
  Layer.provide(BunServices.layer)
);

BunRuntime.runMain(Layer.launch(main));
