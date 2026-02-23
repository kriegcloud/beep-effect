#!/usr/bin/env bun

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import { NodeChildProcessSpawner, NodeFileSystem, NodePath, NodeTerminal } from "@effect/platform-node";
import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
// Effect v4 CLI entrypoints live in effect/unstable/cli.
import { Command, Flag } from "effect/unstable/cli";
import {
  collectYamlFiles,
  formatDiagnostics,
  generateJetbrainsPromptLibrary,
  generateMcpForTool,
  normalizeCanonicalEnvelope,
  parseMcpTool,
  readYamlDocument,
  resolveSecretsFromFixturePath,
  runPoc04Apply,
  runPoc04Check,
  runPoc04Revert,
  scaffoldVersion,
  validateCanonicalFile,
} from "./index.js";

/**
 * @since 0.0.0
 * @internal
 */
interface CommandOptions {
  readonly fixture: O.Option<string>;
  readonly fixtures: O.Option<string>;
  readonly input: O.Option<string>;
  readonly tool: O.Option<string>;
  readonly mode: O.Option<string>;
  readonly strict: boolean;
  readonly dryRun: boolean;
  readonly expectFail: boolean;
}

/**
 * @since 0.0.0
 * @internal
 */
class CliRuntimeError extends S.TaggedErrorClass<CliRuntimeError>()("BeepSyncCliRuntimeError", {
  message: S.String,
  cause: S.Unknown,
}) {}

/**
 * @since 0.0.0
 * @internal
 */
const JsonUnknownFromJson = S.fromJsonString(S.Unknown);

/**
 * @since 0.0.0
 * @internal
 */
const toOptionArray = <T>(value: O.Option<T>): ReadonlyArray<T> =>
  O.match(value, { onNone: () => A.empty<T>(), onSome: (some) => A.make(some) });

/**
 * @since 0.0.0
 * @internal
 */
const toNullable = <T>(value: O.Option<T>): T | null => O.match(value, { onNone: () => null, onSome: (some) => some });

/**
 * @since 0.0.0
 * @internal
 */
const normalizePath = (value: string): string => Str.replace(/\\/g, "/")(resolve(value));

/**
 * @since 0.0.0
 * @internal
 */
const isPocPath =
  (segment: string) =>
  (value: string): boolean =>
    Str.includes(segment)(normalizePath(value));

/**
 * @since 0.0.0
 * @internal
 */
const isPoc01Path = isPocPath("/fixtures/poc-01/");
/**
 * @since 0.0.0
 * @internal
 */
const isPoc02Path = isPocPath("/fixtures/poc-02/");
/**
 * @since 0.0.0
 * @internal
 */
const isPoc03Path = isPocPath("/fixtures/poc-03/");
/**
 * @since 0.0.0
 * @internal
 */
const isPoc04Path = isPocPath("/fixtures/poc-04/");
/**
 * @since 0.0.0
 * @internal
 */
const isPoc05Path = isPocPath("/fixtures/poc-05/");

/**
 * @since 0.0.0
 * @internal
 */
const writeStdout = (value: string): Effect.Effect<void> =>
  Effect.sync(() => {
    process.stdout.write(value);
  });

/**
 * @since 0.0.0
 * @internal
 */
const encodeJson = (value: unknown): Effect.Effect<string, CliRuntimeError> =>
  S.encodeUnknownEffect(JsonUnknownFromJson)(value).pipe(
    Effect.mapError(
      (error) =>
        new CliRuntimeError({
          message: "Failed to encode JSON output.",
          cause: error,
        })
    )
  );

/**
 * @since 0.0.0
 * @internal
 */
const writeJson = (value: unknown): Effect.Effect<void, CliRuntimeError> =>
  encodeJson(value).pipe(Effect.flatMap((json) => writeStdout(Str.endsWith("\n")(json) ? json : `${json}\n`)));

/**
 * @since 0.0.0
 * @internal
 */
const markExitCode = (code: number): Effect.Effect<void> =>
  Effect.sync(() => {
    if (code !== 0) {
      process.exitCode = code;
    }
  });

/**
 * @since 0.0.0
 * @internal
 */
const optionStringFlag = (name: string, description: string) =>
  Flag.string(name).pipe(Flag.withDescription(description), Flag.optional);

/**
 * @since 0.0.0
 * @internal
 */
const optionsShape = () => ({
  fixture: optionStringFlag("fixture", "Path to fixture YAML file"),
  fixtures: optionStringFlag("fixtures", "Path to fixture directory"),
  input: optionStringFlag("input", "Input file path"),
  tool: optionStringFlag("tool", "Target tool identifier"),
  mode: optionStringFlag("mode", "Command mode override"),
  strict: Flag.boolean("strict").pipe(Flag.withDescription("Treat warnings as failures")),
  dryRun: Flag.boolean("dry-run").pipe(Flag.withDescription("Preview changes without writing files")),
  expectFail: Flag.boolean("expect-fail").pipe(Flag.withDescription("Validation should fail for negative fixtures")),
});

/**
 * @since 0.0.0
 * @internal
 */
const ensureOptionalPathsExist = Effect.fn(function* (
  entries: ReadonlyArray<readonly [flagName: string, value: O.Option<string>]>
) {
  let hasMissingPath = false;
  for (const [flagName, optionValue] of entries) {
    if (O.isNone(optionValue)) {
      continue;
    }

    const exists = existsSync(resolve(optionValue.value));
    if (!exists) {
      hasMissingPath = true;
      yield* Effect.logError(`[beep-sync scaffold] Missing path for --${flagName}: ${optionValue.value}`);
    }
  }

  if (hasMissingPath) {
    yield* markExitCode(2);
  }
  return hasMissingPath;
});

/**
 * @since 0.0.0
 * @internal
 */
const emitScaffoldPayload = Effect.fn(function* (command: string, options: CommandOptions) {
  const payload = {
    mode: "scaffold",
    command,
    strict: options.strict,
    dryRun: options.dryRun,
    tool: toNullable(options.tool),
    modeOption: toNullable(options.mode),
    fixture: O.match(options.fixture, { onNone: () => null, onSome: (value) => resolve(value) }),
    fixtures: O.match(options.fixtures, { onNone: () => null, onSome: (value) => resolve(value) }),
    input: O.match(options.input, { onNone: () => null, onSome: (value) => resolve(value) }),
    note: "Replace scaffold behavior with implementation in P1-P3",
  } as const;

  if (options.expectFail) {
    yield* Effect.logInfo(
      "[beep-sync scaffold] --expect-fail acknowledged (simulated). Real failure semantics pending implementation."
    );
  }

  yield* Effect.logInfo(`[beep-sync scaffold] ${command} completed.`);
  yield* writeJson(payload);
});

/**
 * @since 0.0.0
 * @internal
 */
const runPoc01Validation = Effect.fn(function* (paths: ReadonlyArray<string>, expectFail: boolean) {
  const files = A.flatMap(paths, collectYamlFiles);
  if (A.length(files) === 0) {
    yield* Effect.logError("[beep-sync poc-01] No YAML files found for validation.");
    yield* markExitCode(2);
    return;
  }

  const byFile = A.map(files, (file) => ({ file, diagnostics: validateCanonicalFile(file).diagnostics }));
  const failing = A.filter(byFile, (entry) => A.length(entry.diagnostics) > 0);

  if (A.length(failing) === 0) {
    if (expectFail) {
      yield* Effect.logError("[beep-sync poc-01] --expect-fail was set, but fixtures passed.");
      yield* markExitCode(1);
      return;
    }

    yield* Effect.logInfo(`[beep-sync poc-01] validation passed for ${String(A.length(files))} file(s).`);
    return;
  }

  for (const entry of failing) {
    yield* Console.error(`\n[file] ${entry.file}`);
    yield* Console.error(formatDiagnostics(entry.diagnostics));
  }

  if (expectFail) {
    yield* Effect.logInfo(
      `[beep-sync poc-01] expected failure satisfied (${String(A.length(failing))} file(s) reported diagnostics).`
    );
    return;
  }

  yield* Effect.logError(`[beep-sync poc-01] validation failed for ${String(A.length(failing))} file(s).`);
  yield* markExitCode(1);
});

/**
 * @since 0.0.0
 * @internal
 */
const runValidateCommand = Effect.fn(function* (options: CommandOptions) {
  const hasMissingPath = yield* ensureOptionalPathsExist(
    A.make(
      ["fixture", options.fixture] as const,
      ["fixtures", options.fixtures] as const,
      ["input", options.input] as const
    )
  );
  if (hasMissingPath) {
    return;
  }

  const paths = A.flatMap(A.make(options.fixture, options.fixtures), toOptionArray);
  const allPoc01 = A.length(paths) > 0 && A.every(paths, isPoc01Path);
  if (allPoc01) {
    yield* runPoc01Validation(paths, options.expectFail);
    return;
  }

  if (O.isSome(options.fixture) && isPoc05Path(options.fixture.value)) {
    const fixturePath = options.fixture.value;
    const result = yield* Effect.try({
      try: () => resolveSecretsFromFixturePath(fixturePath),
      catch: (error) =>
        new CliRuntimeError({
          message: P.isError(error) ? error.message : String(error),
          cause: error,
        }),
    });

    yield* writeJson(result);
    yield* markExitCode(result.ok ? 0 : 1);
    return;
  }

  yield* emitScaffoldPayload("validate", options);
});

/**
 * @since 0.0.0
 * @internal
 */
const runNormalizeCommand = Effect.fn(function* (options: CommandOptions) {
  const hasMissingPath = yield* ensureOptionalPathsExist(A.make(["input", options.input] as const));
  if (hasMissingPath) {
    return;
  }

  if (O.isNone(options.input)) {
    yield* emitScaffoldPayload("normalize", options);
    return;
  }

  const inputPath = options.input.value;
  const validated = validateCanonicalFile(inputPath);
  if (A.length(validated.diagnostics) > 0) {
    yield* Effect.logError("[beep-sync poc-01] normalize blocked by validation errors:");
    yield* Console.error(formatDiagnostics(validated.diagnostics));
    yield* markExitCode(1);
    return;
  }

  const normalized = normalizeCanonicalEnvelope(validated.data);
  yield* writeJson(normalized);
});

/**
 * @since 0.0.0
 * @internal
 */
const runGenerateCommand = Effect.fn(function* (options: CommandOptions) {
  const hasMissingPath = yield* ensureOptionalPathsExist(A.make(["fixture", options.fixture] as const));
  if (hasMissingPath) {
    return;
  }

  if (O.isNone(options.fixture) || O.isNone(options.tool)) {
    yield* emitScaffoldPayload("generate", options);
    return;
  }

  const fixturePath = options.fixture.value;
  const toolName = options.tool.value;

  if (isPoc02Path(fixturePath)) {
    const parsedTool = parseMcpTool(toolName);
    if (O.isNone(parsedTool)) {
      yield* Effect.logError(`[beep-sync poc-02] Unsupported tool for POC-02: ${toolName}`);
      yield* markExitCode(1);
      return;
    }

    const fixtureData = yield* Effect.try({
      try: () => readYamlDocument(fixturePath),
      catch: (error) =>
        new CliRuntimeError({
          message: P.isError(error) ? error.message : String(error),
          cause: error,
        }),
    });
    const result = generateMcpForTool(parsedTool.value, fixtureData);

    for (const warning of result.warnings) {
      yield* Console.error(`[warning] ${warning}`);
    }

    if (options.strict && A.length(result.warnings) > 0) {
      yield* Effect.logError(
        `[beep-sync poc-02] strict mode blocked generation (${String(A.length(result.warnings))} warning(s)).`
      );
      yield* markExitCode(1);
      return;
    }

    yield* writeStdout(result.output);
    return;
  }

  if (toolName === "jetbrains" && isPoc03Path(fixturePath)) {
    const fixtureData = yield* Effect.try({
      try: () => readYamlDocument(fixturePath),
      catch: (error) =>
        new CliRuntimeError({
          message: P.isError(error) ? error.message : String(error),
          cause: error,
        }),
    });
    const envelope = generateJetbrainsPromptLibrary(
      fixtureData,
      O.match(options.mode, { onNone: () => undefined, onSome: (value) => value })
    );
    yield* writeJson(envelope);
    return;
  }

  yield* emitScaffoldPayload("generate", options);
});

/**
 * @since 0.0.0
 * @internal
 */
const runApplyCommand = Effect.fn(function* (options: CommandOptions) {
  const hasMissingPath = yield* ensureOptionalPathsExist(A.make(["fixture", options.fixture] as const));
  if (hasMissingPath) {
    return;
  }

  if (O.isSome(options.fixture) && isPoc04Path(options.fixture.value)) {
    const result = runPoc04Apply(options.fixture.value, options.dryRun);
    yield* writeJson(result);
    yield* markExitCode(result.ok ? 0 : 1);
    return;
  }

  yield* emitScaffoldPayload("apply", options);
});

/**
 * @since 0.0.0
 * @internal
 */
const runCheckCommand = Effect.fn(function* (options: CommandOptions) {
  const hasMissingPath = yield* ensureOptionalPathsExist(A.make(["fixture", options.fixture] as const));
  if (hasMissingPath) {
    return;
  }

  if (O.isSome(options.fixture) && isPoc04Path(options.fixture.value)) {
    const result = runPoc04Check(options.fixture.value);
    yield* writeJson(result);
    yield* markExitCode(result.ok ? 0 : 1);
    return;
  }

  yield* emitScaffoldPayload("check", options);
});

/**
 * @since 0.0.0
 * @internal
 */
const runRevertCommand = Effect.fn(function* (options: CommandOptions) {
  const hasMissingPath = yield* ensureOptionalPathsExist(A.make(["fixture", options.fixture] as const));
  if (hasMissingPath) {
    return;
  }

  if (O.isSome(options.fixture) && isPoc04Path(options.fixture.value)) {
    const result = runPoc04Revert(options.fixture.value);
    yield* writeJson(result);
    yield* markExitCode(result.ok ? 0 : 1);
    return;
  }

  yield* emitScaffoldPayload("revert", options);
});

/**
 * @since 0.0.0
 * @internal
 */
const runDoctorCommand = Effect.fn(function* (options: CommandOptions) {
  const hasMissingPath = yield* ensureOptionalPathsExist(
    A.make(
      ["fixture", options.fixture] as const,
      ["fixtures", options.fixtures] as const,
      ["input", options.input] as const
    )
  );
  if (hasMissingPath) {
    return;
  }

  yield* emitScaffoldPayload("doctor", options);
});

/**
 * @since 0.0.0
 * @internal
 */
const validateCommand = Command.make("validate", optionsShape(), runValidateCommand).pipe(
  Command.withDescription("Validate canonical fixtures and secret resolution probes")
);
/**
 * @since 0.0.0
 * @internal
 */
const normalizeCommand = Command.make("normalize", optionsShape(), runNormalizeCommand).pipe(
  Command.withDescription("Normalize canonical fixture input")
);
/**
 * @since 0.0.0
 * @internal
 */
const generateCommand = Command.make("generate", optionsShape(), runGenerateCommand).pipe(
  Command.withDescription("Generate scaffold outputs for fixture probes")
);
/**
 * @since 0.0.0
 * @internal
 */
const applyCommand = Command.make("apply", optionsShape(), runApplyCommand).pipe(
  Command.withDescription("Apply managed fixture behavior")
);
/**
 * @since 0.0.0
 * @internal
 */
const checkCommand = Command.make("check", optionsShape(), runCheckCommand).pipe(
  Command.withDescription("Check managed fixture behavior")
);
/**
 * @since 0.0.0
 * @internal
 */
const revertCommand = Command.make("revert", optionsShape(), runRevertCommand).pipe(
  Command.withDescription("Revert managed fixture behavior")
);
/**
 * @since 0.0.0
 * @internal
 */
const doctorCommand = Command.make("doctor", optionsShape(), runDoctorCommand).pipe(
  Command.withDescription("Run scaffold diagnostics")
);

/**
 * @since 0.0.0
 * @internal
 */
const rootCommand = Command.make("beep-sync").pipe(
  Command.withDescription("Unified AI tooling sync runtime (scaffold mode)"),
  Command.withSubcommands([
    validateCommand,
    normalizeCommand,
    generateCommand,
    applyCommand,
    checkCommand,
    doctorCommand,
    revertCommand,
  ])
);

/**
 * @since 0.0.0
 * @internal
 */
const BaseLayers = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer, NodeTerminal.layer);

/**
 * @since 0.0.0
 * @internal
 */
const runtimeLayer = Layer.mergeAll(NodeChildProcessSpawner.layer).pipe(Layer.provideMerge(BaseLayers));

/**
 * @since 0.0.0
 * @internal
 */
const program = Command.run(rootCommand, { version: scaffoldVersion }).pipe(
  Effect.provide(runtimeLayer),
  Effect.catchCause((cause: Cause.Cause<unknown>) =>
    Effect.gen(function* () {
      yield* Effect.logError("[beep-sync] fatal error");
      yield* Effect.logError(Cause.pretty(cause));
      yield* Effect.sync(() => {
        process.exitCode = process.exitCode ?? 1;
      });
    })
  )
);

BunRuntime.runMain(program);
