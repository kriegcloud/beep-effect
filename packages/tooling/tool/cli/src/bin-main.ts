#!/usr/bin/env bun

/**
 * CLI entry point for the repo command suite.
 *
 * @internal
 * @packageDocumentation
 * @since 0.0.0
 */

const QUALITY_TASK_NAMES: ReadonlyArray<string> = ["build", "check", "test", "lint", "audit"];
const LINT_POLICY_SUBCOMMANDS: ReadonlyArray<string> = [
  "circular",
  "deprecated-apis",
  "package-test-imports",
  "reflection-artifacts",
  "schema-first",
  "schema-topology",
  "tooling-tagged-errors",
  "tooling-schema-first",
];
const ROOT_CLI_GLOBAL_FLAG_NAMES: ReadonlyArray<string> = [
  "--completions",
  "--help",
  "--log-level",
  "--version",
  "-h",
  "-v",
];
const CHANGED_PATH_DIFF_FILTER = ["A", "C", "M", "R", "T", "U", "X", "B"].join("");

const rawArgv = Bun.argv.slice(2);

const { A } = await import("@beep/utils");
const { flow } = await import("effect");

const nonEmptyLines = (text: string): ReadonlyArray<string> =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

const unique: (values: ReadonlyArray<string>) => ReadonlyArray<string> = flow(A.fromIterable, A.dedupe);

const spawnTextOption = (args: ReadonlyArray<string>): string | undefined => {
  const result = Bun.spawnSync({
    cmd: ["git", ...args],
    stderr: "ignore",
    stdout: "pipe",
  });

  return result.success ? result.stdout.toString() : undefined;
};

const fastLintFixNoop = (): boolean => {
  if (rawArgv.length !== 2 || rawArgv[0] !== "lint" || rawArgv[1] !== "--fix") {
    return false;
  }

  const outputs = [
    spawnTextOption(["diff", "--name-only", `--diff-filter=${CHANGED_PATH_DIFF_FILTER}`, "HEAD", "--"]),
    spawnTextOption(["diff", "--cached", "--name-only", `--diff-filter=${CHANGED_PATH_DIFF_FILTER}`, "--"]),
    spawnTextOption(["ls-files", "--others", "--exclude-standard"]),
  ];

  if (outputs.some((output) => output === undefined)) {
    return false;
  }

  const changedFiles = unique(outputs.flatMap((output) => nonEmptyLines(output ?? "")));
  if (changedFiles.length > 0) {
    return false;
  }

  process.stdout.write("[beep-cli] lint:fix: no changed files\n");
  return true;
};

if (fastLintFixNoop()) {
  process.exit(0);
}

const isQualityTaskName = (value: string | undefined): boolean =>
  value !== undefined && QUALITY_TASK_NAMES.includes(value);

const isLintPolicySubcommand = (value: string | undefined): boolean =>
  value !== undefined && LINT_POLICY_SUBCOMMANDS.includes(value);

const isRootCliGlobalFlag = (value: string): boolean =>
  ROOT_CLI_GLOBAL_FLAG_NAMES.includes(value) || ROOT_CLI_GLOBAL_FLAG_NAMES.some((name) => value.startsWith(`${name}=`));

const hasRootCliGlobalFlag = (argv: ReadonlyArray<string>): boolean => argv.some(isRootCliGlobalFlag);

const canUseQualityTaskFastPath = (argv: ReadonlyArray<string>): boolean =>
  isQualityTaskName(argv[0]) && !hasRootCliGlobalFlag(argv) && !(argv[0] === "lint" && isLintPolicySubcommand(argv[1]));

const { BunChildProcessSpawner, BunCrypto, BunHttpClient, BunRuntime, BunServices } = await import("@effect/platform-bun");
const { Cause, Effect, Exit, Layer, Runtime } = await import("effect");
const O = await import("effect/Option");
const P = await import("effect/Predicate");

/**
 * Foundation layer providing Node.js implementations of FileSystem, Path, and Terminal.
 *
 * These three services are leaf dependencies required by virtually every CLI
 * command and are combined here so they can be shared by all derived layers.
 *
 * @internal
 * @category configuration
 * @since 0.0.0
 */
const BaseLayers = Layer.mergeAll(BunServices.layer, BunHttpClient.layer, BunCrypto.layer);

const argv = A.slice(process.argv, 2);

const renderCliFailure = (exit: import("effect").Exit.Exit<unknown, unknown>) => {
  if (Exit.isSuccess(exit)) {
    return;
  }

  const error = Cause.squash(exit.cause);
  if (!Runtime.getErrorReported(error)) {
    return;
  }

  if (P.hasProperty(error, "message") && P.isString(error.message)) {
    process.stderr.write(`${error.message}\n`);
    return;
  }

  process.stderr.write(`${Cause.pretty(exit.cause)}\n`);
};

const runRepoCliMain = <E, A>(effect: import("effect").Effect.Effect<A, E>) =>
  BunRuntime.runMain(effect, {
    disableErrorReporting: true,
    teardown: (exit, onExit) => {
      renderCliFailure(exit);
      Runtime.defaultTeardown(exit, onExit);
    },
  });

/**
 * Top-level CLI program effect produced by running the root command tree
 * with the fully-resolved {@link DerivedLayers}.
 *
 * This is the value handed to `Effect.runPromise` to execute the CLI.
 *
 * @internal
 * @category use-cases
 * @since 0.0.0
 */
let handledByQualityFastPath = false;

if (canUseQualityTaskFastPath(argv)) {
  const { parseQualityTaskInvocation, runQualityTask } = await import("./commands/Quality/Tasks.js");
  const qualityTaskInvocation = parseQualityTaskInvocation(argv);

  if (O.isSome(qualityTaskInvocation)) {
    handledByQualityFastPath = true;
    const QualityLayers = Layer.mergeAll(BunChildProcessSpawner.layer).pipe(Layer.provideMerge(BaseLayers));
    const qualityProgram = Effect.scoped(
      Layer.build(QualityLayers).pipe(
        Effect.flatMap(
          Effect.fnUntraced(function* (context) {
            return yield* runQualityTask(qualityTaskInvocation.value).pipe(Effect.provide(context));
          })
        )
      )
    );
    runRepoCliMain(qualityProgram);
  }
}

if (!handledByQualityFastPath) {
  const [{ FsUtilsLive, TSMorphServiceLive }, { Command }, { rootCommand }] = await Promise.all([
    import("@beep/repo-utils"),
    import("effect/unstable/cli"),
    import("./commands/Root.js"),
  ]);
  const DerivedLayers = Layer.mergeAll(BunChildProcessSpawner.layer, FsUtilsLive, TSMorphServiceLive).pipe(
    Layer.provideMerge(BaseLayers)
  );
  const commandProgram = Effect.scoped(
    Layer.build(DerivedLayers).pipe(
      Effect.flatMap(
        Effect.fnUntraced(function* (context) {
          return yield* Command.run(rootCommand, { version: "0.0.0" }).pipe(Effect.provide(context));
        })
      )
    )
  );
  runRepoCliMain(commandProgram);
}
