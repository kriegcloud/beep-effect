/**
 * Canonical quality task adapter for repo root and workspace package scripts.
 *
 * @module
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { type DomainError, findRepoRoot, type NoSuchFileError } from "@beep/repo-utils";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { thunkEmptyStr, thunkFalse } from "@beep/utils";
import { Cause, Console, Effect, FileSystem, Match, Path, pipe, Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { ChildProcess, type ChildProcessSpawner } from "effect/unstable/process";

const $I = $RepoCliId.create("commands/Quality/Tasks");

const QUALITY_TASK_NAMES = ["build", "check", "test", "lint", "audit"] as const;
const LINT_POLICY_SUBCOMMANDS = ["circular", "schema-first", "tooling-tagged-errors", "tooling-schema-first"] as const;
const AUDIT_MODE_NAMES = ["packages", "github"] as const;
const GITHUB_CHECK_MODES = ["quality", "repo-sanity", "secrets", "security", "sast", "nix", "pre-push"] as const;

/**
 * Canonical quality task name.
 *
 * @example
 * ```ts
 * import { QualityTaskName } from "@beep/repo-cli/commands/Quality/Tasks"
 * const isLint = QualityTaskName.is.lint("lint")
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const QualityTaskName = LiteralKit(QUALITY_TASK_NAMES).annotate(
  $I.annote("QualityTaskName", {
    description: "Canonical quality task name handled by beep-cli.",
  })
);

/**
 * Canonical quality task name.
 *
 * @example
 * ```ts
 * import type { QualityTaskName } from "@beep/repo-cli/commands/Quality/Tasks"
 * const task: QualityTaskName = "check"
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type QualityTaskName = typeof QualityTaskName.Type;

/**
 * Package-local script profile used by the quality task adapter.
 *
 * @example
 * ```ts
 * import { PackageTaskProfile } from "@beep/repo-cli/commands/Quality/Tasks"
 * const profile = new PackageTaskProfile({
 *   task: "lint",
 *   script: "beep:lint",
 *   fixScript: "beep:lint:fix"
 * })
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class PackageTaskProfile extends S.Class<PackageTaskProfile>($I`PackageTaskProfile`)(
  {
    task: QualityTaskName,
    script: S.String,
    fixScript: S.optionalKey(S.String),
  },
  $I.annote("PackageTaskProfile", {
    description: "Package-local script profile used by the quality task adapter.",
  })
) {}

/**
 * Planned subprocess invocation.
 *
 * @example
 * ```ts
 * import { QualityTaskStep } from "@beep/repo-cli/commands/Quality/Tasks"
 * const step = new QualityTaskStep({
 *   label: "lint",
 *   command: "bunx",
 *   args: ["turbo", "run", "lint"],
 *   cwd: "/repo"
 * })
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class QualityTaskStep extends S.Class<QualityTaskStep>($I`QualityTaskStep`)(
  {
    label: S.String,
    command: S.String,
    args: S.Array(S.String),
    cwd: S.String,
    useLocalEnv: S.optionalKey(S.Boolean),
  },
  $I.annote("QualityTaskStep", {
    description: "Planned subprocess invocation for a quality task.",
  })
) {}

/**
 * Result of parsing a quality command invocation.
 *
 * @example
 * ```ts
 * import { QualityTaskInvocation } from "@beep/repo-cli/commands/Quality/Tasks"
 * const invocation = new QualityTaskInvocation({
 *   task: "lint",
 *   args: ["--filter=@beep/repo-cli"],
 *   fix: false
 * })
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class QualityTaskInvocation extends S.Class<QualityTaskInvocation>($I`QualityTaskInvocation`)(
  {
    task: QualityTaskName,
    args: S.Array(S.String),
    fix: S.Boolean,
  },
  $I.annote("QualityTaskInvocation", {
    description: "Result of parsing a quality command invocation.",
  })
) {}

/**
 * Error raised when a quality task subprocess exits unsuccessfully.
 *
 * @example
 * ```ts
 * import { QualityTaskFailed } from "@beep/repo-cli/commands/Quality/Tasks"
 * const failure = new QualityTaskFailed({
 *   label: "lint",
 *   command: "bunx turbo run lint",
 *   exitCode: 1
 * })
 * ```
 * @category error handling
 * @since 0.0.0
 */
export class QualityTaskFailed extends TaggedErrorClass<QualityTaskFailed>($I`QualityTaskFailed`)(
  "QualityTaskFailed",
  {
    label: S.String,
    command: S.String,
    exitCode: S.Number,
  },
  $I.annote("QualityTaskFailed", {
    description: "A quality subprocess exited with a non-zero status code.",
  })
) {}

/**
 * Error raised when a quality task cannot resolve its required configuration.
 *
 * @example
 * ```ts
 * import { QualityTaskConfigurationError } from "@beep/repo-cli/commands/Quality/Tasks"
 * const error = new QualityTaskConfigurationError({
 *   message: "Could not find package.json"
 * })
 * ```
 * @category error handling
 * @since 0.0.0
 */
export class QualityTaskConfigurationError extends TaggedErrorClass<QualityTaskConfigurationError>(
  $I`QualityTaskConfigurationError`
)(
  "QualityTaskConfigurationError",
  {
    message: S.String,
  },
  $I.annote("QualityTaskConfigurationError", {
    description: "Quality task configuration could not be resolved.",
  })
) {}

class PackageJsonDocument extends S.Class<PackageJsonDocument>($I`PackageJsonDocument`)(
  {
    name: S.optionalKey(S.String),
    scripts: S.optionalKey(S.Record(S.String, S.String)),
  },
  $I.annote("PackageJsonDocument", {
    description: "Minimal package.json shape used by quality task resolution.",
  })
) {}
const decodePackageJsonDocument = S.decodeUnknownEffect(S.fromJsonString(PackageJsonDocument));

type QualityTaskEnvironment = FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner;

type OptionalQualityTaskStep = {
  readonly enabled: boolean;
  readonly step: () => QualityTaskStep;
};

type ParsedFixArgsState = {
  readonly fix: boolean;
  readonly args: ReadonlyArray<string>;
};

type TestLaneSelectionState = {
  readonly unit: boolean;
  readonly integration: boolean;
  readonly types: boolean;
  readonly args: ReadonlyArray<string>;
};

type RootAuditMode = (typeof AUDIT_MODE_NAMES)[number];
type RootAuditSelectionState = {
  readonly mode: RootAuditMode;
  readonly args: ReadonlyArray<string>;
};

const emptyParsedFixArgs: ParsedFixArgsState = {
  fix: false,
  args: A.empty<string>(),
};

const emptyTestLaneSelection: TestLaneSelectionState = {
  unit: false,
  integration: false,
  types: false,
  args: A.empty<string>(),
};

const profileByTask: Readonly<Record<QualityTaskName, PackageTaskProfile>> = {
  build: new PackageTaskProfile({ task: "build", script: "beep:build" }),
  check: new PackageTaskProfile({ task: "check", script: "beep:check" }),
  test: new PackageTaskProfile({ task: "test", script: "beep:test" }),
  lint: new PackageTaskProfile({ task: "lint", script: "beep:lint", fixScript: "beep:lint:fix" }),
  audit: new PackageTaskProfile({ task: "audit", script: "beep:audit" }),
};

const isQualityTaskName = (value: string): value is QualityTaskName =>
  A.contains(QUALITY_TASK_NAMES as ReadonlyArray<string>, value);

const isLintPolicySubcommand = (value: string | undefined): boolean =>
  pipe(
    O.fromUndefinedOr(value),
    O.exists((subcommand) => A.contains(LINT_POLICY_SUBCOMMANDS as ReadonlyArray<string>, subcommand))
  );

const isRootAuditMode = (value: string): value is RootAuditMode =>
  A.contains(AUDIT_MODE_NAMES as ReadonlyArray<string>, value);

const isGithubCheckMode = (value: string): boolean => A.contains(GITHUB_CHECK_MODES as ReadonlyArray<string>, value);

const stripPassthroughDelimiter = (args: ReadonlyArray<string>): ReadonlyArray<string> =>
  pipe(
    A.head(args),
    O.filter((arg) => arg === "--"),
    O.map(() => A.drop(args, 1)),
    O.getOrElse(() => args)
  );

const parseFixArgs = (args: ReadonlyArray<string>): ParsedFixArgsState =>
  A.reduce(stripPassthroughDelimiter(args), emptyParsedFixArgs, (parsed, arg) =>
    arg === "--fix" ? { ...parsed, fix: true } : { ...parsed, args: pipe(parsed.args, A.append(arg)) }
  );

const parseTestLaneSelection = (args: ReadonlyArray<string>): TestLaneSelectionState => {
  const selected = A.reduce(stripPassthroughDelimiter(args), emptyTestLaneSelection, (lanes, arg) =>
    Match.type<string>().pipe(
      Match.when("--unit", () => ({ ...lanes, unit: true })),
      Match.when("--integration", () => ({ ...lanes, integration: true })),
      Match.when("--types", () => ({ ...lanes, types: true })),
      Match.orElse(() => ({ ...lanes, args: pipe(lanes.args, A.append(arg)) }))
    )(arg)
  );
  const hasLane = selected.unit || selected.integration || selected.types;
  return {
    unit: hasLane ? selected.unit : true,
    integration: hasLane ? selected.integration : true,
    types: hasLane ? selected.types : true,
    args: selected.args,
  };
};

const parseRootAuditSelection = (args: ReadonlyArray<string>): RootAuditSelectionState =>
  A.match(stripPassthroughDelimiter(args), {
    onEmpty: () => ({
      mode: "packages",
      args: A.empty<string>(),
    }),
    onNonEmpty: ([head, ...tail]) => {
      if (isRootAuditMode(head)) {
        return {
          mode: head,
          args: tail,
        };
      }

      if (isGithubCheckMode(head)) {
        return {
          mode: "github",
          args: [head, ...tail],
        };
      }

      return {
        mode: "packages",
        args: [head, ...tail],
      };
    },
  });

const readJsonFile = Effect.fn("QualityTasks.readJsonFile")(function* (filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const content = yield* fs.readFileString(filePath).pipe(
    Effect.mapError(
      (cause) =>
        new QualityTaskConfigurationError({
          message: `Failed to read ${filePath}: ${String(cause)}`,
        })
    )
  );

  return yield* decodePackageJsonDocument(content).pipe(
    Effect.mapError(
      (cause) =>
        new QualityTaskConfigurationError({
          message: `Failed to parse ${filePath}: ${String(cause)}`,
        })
    )
  );
});

const resolvePackageDir = Effect.fn("QualityTasks.resolvePackageDir")(function* (
  repoRoot: string,
  cwd: string
): Effect.fn.Return<O.Option<string>, QualityTaskConfigurationError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const root = path.resolve(repoRoot);

  const findPackageDir = (current: string): Effect.Effect<O.Option<string>, QualityTaskConfigurationError> =>
    Effect.gen(function* () {
      const packageJsonPath = path.join(current, "package.json");
      const exists = yield* fs.exists(packageJsonPath).pipe(Effect.orElseSucceed(thunkFalse));

      if (exists) {
        return current === root ? O.none() : O.some(current);
      }

      if (current === root) {
        return O.none();
      }

      const parent = path.dirname(current);
      if (parent === current) {
        return yield* new QualityTaskConfigurationError({
          message: `Could not find package.json between ${cwd} and ${repoRoot}.`,
        });
      }
      return yield* findPackageDir(parent);
    });

  return yield* findPackageDir(path.resolve(cwd));
});

const commandText = (command: string, args: ReadonlyArray<string>): string => A.join([command, ...args], " ");

const isTurboCacheControlArg = (arg: string): boolean =>
  arg === "--no-cache" ||
  arg === "--force" ||
  Str.startsWith("--force=")(arg) ||
  arg === "--remote-only" ||
  Str.startsWith("--remote-only=")(arg) ||
  arg === "--remote-cache-read-only" ||
  Str.startsWith("--remote-cache-read-only=")(arg) ||
  Str.startsWith("--cache=")(arg);

const localTurboCacheArgs = (args: ReadonlyArray<string>): ReadonlyArray<string> =>
  process.env.CI === "true" || A.some(args, isTurboCacheControlArg) ? A.empty() : ["--cache=local:rw"];

const turboRunArgs = (tasks: ReadonlyArray<string>, args: ReadonlyArray<string>): ReadonlyArray<string> => [
  "turbo",
  "run",
  ...tasks,
  ...localTurboCacheArgs(args),
  ...args,
];

const isUnresolvedSecretReference = (value: string | undefined): boolean =>
  value !== undefined && Str.startsWith("op://")(value);

const turboEnvOverrides = (command: string, args: ReadonlyArray<string>): Record<string, string | undefined> => {
  if (
    command !== "bunx" ||
    !pipe(
      A.head(args),
      O.exists((arg) => arg === "turbo")
    )
  ) {
    return {};
  }

  return {
    ...(isUnresolvedSecretReference(process.env.TURBO_TOKEN) ? { TURBO_TOKEN: undefined } : {}),
    ...(isUnresolvedSecretReference(process.env.TURBO_TEAM) ? { TURBO_TEAM: undefined } : {}),
  };
};

const runExitCode = (command: string, args: ReadonlyArray<string>, cwd: string) =>
  Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* ChildProcess.make(command, [...args], {
        cwd,
        stdout: "ignore",
        stderr: "ignore",
      });
      return yield* handle.exitCode;
    })
  );

const canUseLocalEnv = Effect.fn("QualityTasks.canUseLocalEnv")(function* (
  repoRoot: string
): Effect.fn.Return<boolean, never, FileSystem.FileSystem | ChildProcessSpawner.ChildProcessSpawner> {
  if (process.env.CI === "true") {
    return false;
  }

  const fs = yield* FileSystem.FileSystem;
  const hasEnv = yield* fs.exists(`${repoRoot}/.env`).pipe(Effect.orElseSucceed(thunkFalse));
  if (!hasEnv) {
    return false;
  }

  const exitCode = yield* runExitCode("op", ["whoami"], repoRoot).pipe(Effect.orElseSucceed(() => 1));
  return exitCode === 0;
});

const withLocalEnv = Effect.fn("QualityTasks.withLocalEnv")(function* (step: QualityTaskStep) {
  if (step.useLocalEnv !== true) {
    return step;
  }

  const shouldUseLocalEnv = yield* canUseLocalEnv(step.cwd);
  if (!shouldUseLocalEnv) {
    return step;
  }

  return new QualityTaskStep({
    label: `${step.label} (op run)`,
    command: "op",
    args: ["run", "--env-file=.env", "--", step.command, ...step.args],
    cwd: step.cwd,
  });
});

const runStep = Effect.fn("QualityTasks.runStep")(function* (step: QualityTaskStep) {
  const resolved = yield* withLocalEnv(step);
  yield* Console.log(`[beep-cli] ${resolved.label}: ${commandText(resolved.command, resolved.args)}`);
  const exitCode = yield* Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* ChildProcess.make(resolved.command, [...resolved.args], {
        cwd: resolved.cwd,
        env: turboEnvOverrides(resolved.command, resolved.args),
        extendEnv: true,
        stdin: "inherit",
        stdout: "inherit",
        stderr: "inherit",
      });
      return yield* handle.exitCode;
    })
  ).pipe(
    Effect.mapError(
      (cause) =>
        new QualityTaskConfigurationError({
          message: `Failed to spawn ${commandText(resolved.command, resolved.args)}: ${String(cause)}`,
        })
    )
  );

  if (exitCode !== 0) {
    return yield* new QualityTaskFailed({
      label: resolved.label,
      command: commandText(resolved.command, resolved.args),
      exitCode,
    });
  }
});

const runSteps = (steps: ReadonlyArray<QualityTaskStep>) => Effect.forEach(steps, runStep, { discard: true });

const turboStep = (cwd: string, label: string, tasks: ReadonlyArray<string>, args: ReadonlyArray<string>) =>
  new QualityTaskStep({
    label,
    command: "bunx",
    args: turboRunArgs(tasks, args),
    cwd,
  });

const optionalQualityTaskStep = ({ enabled, step }: OptionalQualityTaskStep): ReadonlyArray<QualityTaskStep> =>
  enabled ? A.of(step()) : A.empty();

const rootBuildSteps = (repoRoot: string, args: ReadonlyArray<string>) => [
  new QualityTaskStep({
    label: "build",
    command: "bunx",
    args: turboRunArgs(["build"], args),
    cwd: repoRoot,
    useLocalEnv: true,
  }),
];

const rootCheckSteps = (repoRoot: string, args: ReadonlyArray<string>) => [
  turboStep(repoRoot, "check", ["check", "check:dtslint:tsgo", "check:tsgo:smoke"], args),
];

const rootTestSteps = (repoRoot: string, args: ReadonlyArray<string>) => {
  const lanes = parseTestLaneSelection(args);
  const unitArgs = [
    "--filter=!@beep/repo-memory-runtime",
    "--filter=!@beep/repo-memory-sqlite",
    "--filter=!@beep/shared-server",
    ...lanes.args,
  ];

  return [
    ...optionalQualityTaskStep({
      enabled: lanes.unit,
      step: () => turboStep(repoRoot, "test:unit", ["test"], unitArgs),
    }),
    ...optionalQualityTaskStep({
      enabled: lanes.types,
      step: () => turboStep(repoRoot, "test:types", ["check:types"], lanes.args),
    }),
    ...optionalQualityTaskStep({
      enabled: lanes.integration,
      step: () => turboStep(repoRoot, "test:integration", ["test:integration"], ["--concurrency=1", ...lanes.args]),
    }),
  ];
};

const rootLintSteps = (repoRoot: string, args: ReadonlyArray<string>, fix: boolean) =>
  fix
    ? [
        turboStep(repoRoot, "lint:effect-imports:fix", ["lint:effect-imports:fix"], args),
        turboStep(repoRoot, "lint:fix", ["lint:fix"], args),
      ]
    : [
        turboStep(
          repoRoot,
          "lint",
          [
            "lint",
            "lint:effect-imports:check",
            "lint:terse-effect",
            "lint:native-runtime",
            "lint:dual-arity",
            "lint:allowlist",
            "lint:jsdoc",
            "lint:docgen",
            "lint:spell",
            "lint:markdown",
            "lint:circular",
            "lint:tooling-tagged-errors",
            "lint:typos",
          ],
          args
        ),
      ];

const rootAuditSteps = (repoRoot: string, args: ReadonlyArray<string>) => {
  const selection = parseRootAuditSelection(args);

  if (selection.mode === "packages") {
    return [turboStep(repoRoot, "audit:packages", ["audit"], selection.args)];
  }

  const auditArgs = selection.args;
  const scriptMode = pipe(
    A.head(auditArgs),
    O.getOrElse(() => "pre-push")
  );
  const scriptArgs = A.match(auditArgs, {
    onEmpty: () => ["pre-push"],
    onNonEmpty: () => auditArgs,
  });

  return [
    new QualityTaskStep({
      label: `audit:${scriptMode}`,
      command: "bash",
      args: ["scripts/run-github-checks.sh", ...scriptArgs],
      cwd: repoRoot,
    }),
  ];
};

const invocationArgs = (invocation: QualityTaskInvocation): ReadonlyArray<string> =>
  invocation.args ?? A.empty<string>();
const invocationFix = (invocation: QualityTaskInvocation): boolean => invocation.fix ?? false;

const rootStepsFor = (repoRoot: string, invocation: QualityTaskInvocation): ReadonlyArray<QualityTaskStep> =>
  pipe(invocation, (current) =>
    Match.type<QualityTaskName>().pipe(
      Match.when("build", () => rootBuildSteps(repoRoot, invocationArgs(current))),
      Match.when("check", () => rootCheckSteps(repoRoot, invocationArgs(current))),
      Match.when("test", () => rootTestSteps(repoRoot, invocationArgs(current))),
      Match.when("lint", () => rootLintSteps(repoRoot, invocationArgs(current), invocationFix(current))),
      Match.when("audit", () => rootAuditSteps(repoRoot, invocationArgs(current))),
      Match.exhaustive
    )(current.task)
  );

/**
 * Build root quality task subprocess steps. Exposed for focused unit tests.
 *
 * @param repoRoot - Repository root directory.
 * @param invocation - Parsed quality invocation.
 * @returns Planned subprocess steps.
 * @category Utility
 * @since 0.0.0
 */
export const rootQualityStepsForTesting = (
  repoRoot: string,
  invocation: QualityTaskInvocation
): ReadonlyArray<QualityTaskStep> => rootStepsFor(repoRoot, invocation);

const readPackageJson = Effect.fn("QualityTasks.readPackageJson")(function* (packageDir: string) {
  const path = yield* Path.Path;
  return yield* readJsonFile(path.join(packageDir, "package.json"));
});

const runPackageTask = Effect.fn("QualityTasks.runPackageTask")(function* (
  packageDir: string,
  invocation: QualityTaskInvocation
) {
  const packageJson = yield* readPackageJson(packageDir);
  const scripts = packageJson.scripts ?? {};
  const profile = profileByTask[invocation.task];
  const fix = invocationFix(invocation);
  const args = invocationArgs(invocation);
  const script = pipe(
    O.fromUndefinedOr(profile.fixScript),
    O.filter(() => fix),
    O.getOrElse(() => profile.script)
  );
  const packageName = packageJson.name ?? packageDir;

  if (pipe(scripts, R.get(script), O.isNone)) {
    yield* Console.log(`[beep-cli] ${packageName} ${invocation.task}${fix ? ":fix" : ""}: no-op`);
    return;
  }

  yield* runStep(
    new QualityTaskStep({
      label: `${packageName} ${script}`,
      command: "bun",
      args: ["run", script, ...args],
      cwd: packageDir,
    })
  );
});

const runRootTask = Effect.fn("QualityTasks.runRootTask")(function* (
  repoRoot: string,
  invocation: QualityTaskInvocation
) {
  yield* runSteps(rootStepsFor(repoRoot, invocation));
});

const handleQualityTaskError = Effect.catchTags({
  NoSuchFileError: Effect.fn("QualityTasks.handleNoSuchFileError")(function* (error: NoSuchFileError) {
    process.exitCode = 1;
    yield* Console.error(`[beep-cli] ${error.message}`);
  }),
  QualityTaskConfigurationError: Effect.fn("QualityTasks.handleConfigurationError")(function* (
    error: QualityTaskConfigurationError
  ) {
    process.exitCode = 1;
    yield* Console.error(`[beep-cli] ${error.message}`);
  }),
  QualityTaskFailed: Effect.fn("QualityTasks.handleFailedTask")(function* (error: QualityTaskFailed) {
    process.exitCode = error.exitCode;
    yield* Console.error(`[beep-cli] ${error.label} failed with exit code ${error.exitCode}`);
  }),
  DomainError: Effect.fn("QualityTasks.handleDomainError")(function* (error: DomainError) {
    process.exitCode = 1;
    yield* Console.error(`[beep-cli] ${error.message}`);
  }),
});

const handleUnexpectedQualityTaskCause = Effect.catchCause(
  Effect.fn("QualityTasks.handleUnexpectedCause")(function* (cause) {
    process.exitCode = 1;
    yield* Console.error(`[beep-cli] unexpected failure\n${Cause.pretty(cause)}`);
  })
);

/**
 * Parse a raw argv vector into a quality task invocation when the first token is
 * one of the canonical quality task names.
 *
 * @param argv - Raw command arguments after the binary name.
 * @returns Parsed invocation or `None` when another command group should handle it.
 * @example
 * ```ts
 * import { parseQualityTaskInvocation } from "@beep/repo-cli/commands/Quality/Tasks"
 * import * as O from "effect/Option"
 * const invocation = parseQualityTaskInvocation(["lint", "--fix"])
 * const handled = O.isSome(invocation)
 * ```
 * @category Utility
 * @since 0.0.0
 */
export const parseQualityTaskInvocation = (argv: ReadonlyArray<string>): O.Option<QualityTaskInvocation> => {
  const parseCommand = ([command, ...rawArgs]: A.NonEmptyReadonlyArray<string>): O.Option<QualityTaskInvocation> => {
    if (!isQualityTaskName(command)) {
      return O.none();
    }

    if (command === "lint" && isLintPolicySubcommand(pipe(A.get(rawArgs, 0), O.getOrUndefined))) {
      return O.none();
    }

    const parsed = parseFixArgs(rawArgs);
    return O.some(
      new QualityTaskInvocation({
        task: command,
        args: parsed.args,
        fix: command === "lint" && parsed.fix,
      })
    );
  };

  return A.match(argv, {
    onEmpty: O.none,
    onNonEmpty: parseCommand,
  });
};

/**
 * Run a parsed quality task in either repo-root or package-local mode.
 *
 * @param invocation - Parsed quality task invocation.
 * @example
 * ```ts
 * import { QualityTaskInvocation, runQualityTask } from "@beep/repo-cli/commands/Quality/Tasks"
 * const program = runQualityTask(
 *   new QualityTaskInvocation({
 *     task: "check",
 *     args: [],
 *     fix: false
 *   })
 * )
 * ```
 * @category UseCase
 * @since 0.0.0
 */
export const runQualityTask: (invocation: QualityTaskInvocation) => Effect.Effect<void, never, QualityTaskEnvironment> =
  Effect.fn("QualityTasks.runQualityTask")(
    function* (invocation: QualityTaskInvocation) {
      const path = yield* Path.Path;
      const cwd = path.resolve(process.cwd());
      const repoRoot = yield* findRepoRoot(cwd);
      const packageDir = yield* resolvePackageDir(repoRoot, cwd);

      yield* pipe(
        packageDir,
        O.map((dir) => runPackageTask(dir, invocation)),
        O.getOrElse(() => runRootTask(repoRoot, invocation))
      );
    },
    handleQualityTaskError,
    handleUnexpectedQualityTaskCause
  );

/**
 * Run a quality task directly from a raw argv vector.
 *
 * @param argv - Raw command arguments after the binary name.
 * @returns `true` when the invocation was handled by the quality adapter.
 * @example
 * ```ts
 * import { runQualityTaskIfRequested } from "@beep/repo-cli/commands/Quality/Tasks"
 * const program = runQualityTaskIfRequested(["build", "--affected"])
 * ```
 * @category UseCase
 * @since 0.0.0
 */
export const runQualityTaskIfRequested: (
  argv: ReadonlyArray<string>
) => Effect.Effect<boolean, never, QualityTaskEnvironment> = Effect.fn("QualityTasks.runQualityTaskIfRequested")(
  function* (argv: ReadonlyArray<string>) {
    return yield* pipe(
      parseQualityTaskInvocation(argv),
      O.map((invocation) => runQualityTask(invocation).pipe(Effect.as(true))),
      O.getOrElse(() => Effect.succeed(false))
    );
  }
);

/**
 * Run a subprocess and capture all output. Exposed for focused unit tests.
 *
 * @param step - Step to run.
 * @returns Captured combined stdout/stderr and exit code.
 * @example
 * ```ts
 * import { collectStepOutput, QualityTaskStep } from "@beep/repo-cli/commands/Quality/Tasks"
 * const output = collectStepOutput(
 *   new QualityTaskStep({
 *     label: "version",
 *     command: "bun",
 *     args: ["--version"],
 *     cwd: "/repo"
 *   })
 * )
 * ```
 * @category Utility
 * @since 0.0.0
 */
export const collectStepOutput = (step: QualityTaskStep) =>
  Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* ChildProcess.make(step.command, [...step.args], {
        cwd: step.cwd,
        stdout: "pipe",
        stderr: "pipe",
      });
      const output = yield* handle.all.pipe(
        Stream.decodeText(),
        Stream.runFold(thunkEmptyStr, (acc, chunk) => acc + chunk)
      );
      const exitCode = yield* handle.exitCode;
      return {
        output: Str.trim(output),
        exitCode,
      };
    })
  );
