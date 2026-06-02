/**
 * Yeet command orchestration.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { findRepoRoot } from "@beep/repo-utils";
import { Console, Effect, FileSystem, Path, pipe, Result } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { printCommandJson } from "../../../internal/cli/Json.js";
import {
  executeRepoPlanStep,
  RepoRunContext,
  resolveLocalRepoBinary,
  runRepoCommandCapture,
  TurboPlanSnapshot,
  TurboPlanTask,
} from "../../../internal/repo-run/index.js";
import { YeetCommandError } from "../Yeet.errors.js";
import { renderPackageQualityPacketMarkdown } from "./PacketRenderer.js";
import { buildYeetRunPlan, DEFAULT_YEET_PACKET_DIR, emptyTurboPlanSnapshot, YEET_FEEDBACK_TASKS } from "./Planner.js";
import { buildQualityIssueIndex, qualityIssuesFromStepResult } from "./QualityIssueIndex.js";
import type { ChildProcessSpawner } from "effect/unstable/process";
import type { RepoPlanStep, RepoRunPlan, RepoStepRunResult } from "../../../internal/repo-run/index.js";
import type { PackageQualityReport, QualityIssue, QualityIssueIndex } from "./QualityIssueIndex.js";

const $I = $RepoCliId.create("commands/Yeet/internal/Handler");
const encodeJson = S.encodeUnknownEffect(S.UnknownFromJsonString);

class TurboQueryAffectedReason extends S.Class<TurboQueryAffectedReason>($I`TurboQueryAffectedReason`)(
  {
    __typename: S.String,
  },
  $I.annote("TurboQueryAffectedReason", {
    description: "Turbo affected query reason metadata.",
  })
) {}

class TurboQueryAffectedPackageRef extends S.Class<TurboQueryAffectedPackageRef>($I`TurboQueryAffectedPackageRef`)(
  {
    name: S.String,
  },
  $I.annote("TurboQueryAffectedPackageRef", {
    description: "Package reference nested in a Turbo affected task result.",
  })
) {}

class TurboQueryAffectedTask extends S.Class<TurboQueryAffectedTask>($I`TurboQueryAffectedTask`)(
  {
    fullName: S.String,
    name: S.String,
    package: TurboQueryAffectedPackageRef,
    reason: S.optionalKey(TurboQueryAffectedReason),
  },
  $I.annote("TurboQueryAffectedTask", {
    description: "One task returned by Turbo query affected.",
  })
) {}

class TurboQueryAffectedTaskConnection extends S.Class<TurboQueryAffectedTaskConnection>(
  $I`TurboQueryAffectedTaskConnection`
)(
  {
    items: S.Array(TurboQueryAffectedTask),
    length: S.Number,
  },
  $I.annote("TurboQueryAffectedTaskConnection", {
    description: "Turbo affected task connection payload.",
  })
) {}

class TurboQueryAffectedData extends S.Class<TurboQueryAffectedData>($I`TurboQueryAffectedData`)(
  {
    affectedTasks: TurboQueryAffectedTaskConnection,
  },
  $I.annote("TurboQueryAffectedData", {
    description: "Data payload returned by Turbo query affected.",
  })
) {}

class TurboQueryAffectedDocument extends S.Class<TurboQueryAffectedDocument>($I`TurboQueryAffectedDocument`)(
  {
    data: TurboQueryAffectedData,
  },
  $I.annote("TurboQueryAffectedDocument", {
    description: "Turbo query affected JSON document.",
  })
) {}

class TurboQueryPackage extends S.Class<TurboQueryPackage>($I`TurboQueryPackage`)(
  {
    name: S.String,
    path: S.String,
  },
  $I.annote("TurboQueryPackage", {
    description: "One workspace package returned by Turbo query ls.",
  })
) {}

class TurboQueryPackageConnection extends S.Class<TurboQueryPackageConnection>($I`TurboQueryPackageConnection`)(
  {
    count: S.Number,
    items: S.Array(TurboQueryPackage),
  },
  $I.annote("TurboQueryPackageConnection", {
    description: "Turbo package list connection payload.",
  })
) {}

class TurboQueryLsDocument extends S.Class<TurboQueryLsDocument>($I`TurboQueryLsDocument`)(
  {
    packageManager: S.optionalKey(S.String),
    packages: TurboQueryPackageConnection,
  },
  $I.annote("TurboQueryLsDocument", {
    description: "Turbo query ls JSON document.",
  })
) {}

const decodeTurboQueryAffectedDocument = S.decodeUnknownEffect(S.fromJsonString(TurboQueryAffectedDocument));
const decodeTurboQueryLsDocument = S.decodeUnknownEffect(S.fromJsonString(TurboQueryLsDocument));

/**
 * Runtime options accepted by the yeet handler.
 *
 * @example
 * ```ts
 * import { YeetRunOptions } from "@beep/repo-cli/commands/Yeet"
 *
 * const options = YeetRunOptions.make({ base: "origin/main", head: "HEAD", json: false, message: "", packetDir: ".beep/yeet", plan: true })
 * console.log(options.base)
 * ```
 * @category models
 * @since 0.0.0
 */
export class YeetRunOptions extends S.Class<YeetRunOptions>($I`YeetRunOptions`)(
  {
    base: S.String,
    head: S.String,
    json: S.Boolean,
    message: S.String,
    packetDir: S.String,
    plan: S.Boolean,
  },
  $I.annote("YeetRunOptions", {
    description: "Runtime options accepted by the yeet handler.",
  })
) {}

/**
 * Result returned by a yeet execution attempt.
 *
 * @example
 * ```ts
 * import { YeetRunResult } from "@beep/repo-cli/commands/Yeet"
 *
 * const result = YeetRunResult.make({ artifactDir: ".beep/yeet", committed: false, packetPaths: [], pushed: false })
 * console.log(result.artifactDir)
 * ```
 * @category models
 * @since 0.0.0
 */
export class YeetRunResult extends S.Class<YeetRunResult>($I`YeetRunResult`)(
  {
    artifactDir: S.String,
    committed: S.Boolean,
    pushed: S.Boolean,
    packetPaths: S.Array(S.String),
    indexPath: S.optionalKey(S.String),
  },
  $I.annote("YeetRunResult", {
    description: "Execution result and artifact paths emitted by yeet.",
  })
) {}

const optionFromNonEmpty = (value: string): O.Option<string> => pipe(O.some(Str.trim(value)), O.filter(Str.isNonEmpty));
const commandFailure = (result: RepoStepRunResult, message: string): YeetCommandError =>
  YeetCommandError.make({
    message,
    command: result.commandText,
    exitCode: result.exitCode === 0 ? 1 : result.exitCode,
  });

const safeArtifactName = (value: string): string =>
  pipe(value, Str.replace(/[^a-zA-Z0-9._-]+/gu, "_"), Str.replace(/^_+|_+$/gu, ""), (name) =>
    Str.isNonEmpty(name) ? name : "repo"
  );

const renderJson = Effect.fn("Yeet.renderJson")(function* (value: unknown): Effect.fn.Return<string, YeetCommandError> {
  return yield* encodeJson(value).pipe(Effect.mapError(YeetCommandError.new("Failed to encode yeet JSON output.")));
});
const decodeJsonTextOption = S.decodeUnknownOption(S.UnknownFromJsonString);

const runGitOutput = Effect.fn("Yeet.runGitOutput")(function* (
  repoRoot: string,
  args: ReadonlyArray<string>
): Effect.fn.Return<string, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  const result = yield* runRepoCommandCapture("git", args, repoRoot).pipe(
    Effect.mapError(YeetCommandError.new(`Failed to run git ${A.join(args, " ")}.`))
  );
  if (result.exitCode !== 0) {
    return yield* YeetCommandError.make({
      message: `git ${A.join(args, " ")} failed with exit code ${result.exitCode}.`,
      command: `git ${A.join(args, " ")}`,
      exitCode: result.exitCode,
    });
  }
  return Str.trim(result.output);
});

const isEscapedQuote = (output: string, index: number): boolean => {
  let backslashCount = 0;
  for (let cursor = index - 1; cursor >= 0 && output[cursor] === "\\"; cursor -= 1) {
    backslashCount += 1;
  }
  return backslashCount % 2 === 1;
};

const balancedObjectTextEndingAt = (output: string, end: number): O.Option<string> => {
  let depth = 0;
  let inString = false;

  for (let cursor = end; cursor >= 0; cursor -= 1) {
    const char = output[cursor];
    if (char === '"' && !isEscapedQuote(output, cursor)) {
      inString = !inString;
      continue;
    }
    if (inString) {
      continue;
    }
    if (char === "}") {
      depth += 1;
      continue;
    }
    if (char === "{" && depth > 0) {
      depth -= 1;
      if (depth === 0) {
        return O.some(Str.slice(cursor, end + 1)(output));
      }
    }
  }

  return O.none();
};

const jsonObjectTextFromMixedOutput = (output: string): O.Option<string> => {
  for (let cursor = Str.length(output) - 1; cursor >= 0; cursor -= 1) {
    if (output[cursor] !== "}") {
      continue;
    }

    const candidate = balancedObjectTextEndingAt(output, cursor);
    if (O.isSome(candidate) && O.isSome(decodeJsonTextOption(candidate.value))) {
      return candidate;
    }
  }

  return O.none();
};

/**
 * Extract the last decodable JSON object from mixed command output for tests.
 *
 * @category testing
 * @since 0.0.0
 */
export const jsonObjectTextFromMixedOutputForTesting = jsonObjectTextFromMixedOutput;

const runTurboQueryJson = Effect.fn("Yeet.runTurboQueryJson")(function* (
  repoRoot: string,
  args: ReadonlyArray<string>,
  label: string
): Effect.fn.Return<
  string,
  YeetCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const turbo = yield* resolveLocalRepoBinary(repoRoot, "turbo");
  const result = yield* runRepoCommandCapture(turbo, args, repoRoot).pipe(
    Effect.mapError(YeetCommandError.new(`Failed to run ${label}.`))
  );
  if (result.exitCode !== 0) {
    return yield* YeetCommandError.make({
      message: `${label} failed with exit code ${result.exitCode}.`,
      command: `${turbo} ${A.join(args, " ")}`,
      exitCode: result.exitCode,
    });
  }
  if (result.truncated) {
    return yield* YeetCommandError.make({
      message: `${label} output exceeded the repo-run capture limit.`,
      command: `${turbo} ${A.join(args, " ")}`,
      exitCode: 1,
    });
  }

  return yield* pipe(
    jsonObjectTextFromMixedOutput(result.output),
    O.match({
      onNone: () =>
        Effect.fail(
          YeetCommandError.make({
            message: `${label} did not emit a JSON object.`,
            command: `${turbo} ${A.join(args, " ")}`,
            exitCode: 1,
          })
        ),
      onSome: Effect.succeed,
    })
  );
});

const collectTurboVersion = Effect.fn("Yeet.collectTurboVersion")(function* (
  repoRoot: string
): Effect.fn.Return<
  O.Option<string>,
  never,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const turbo = yield* resolveLocalRepoBinary(repoRoot, "turbo");
  const result = yield* runRepoCommandCapture(turbo, ["--version"], repoRoot).pipe(Effect.option);
  return pipe(
    result,
    O.filter((output) => output.exitCode === 0),
    O.map((output) => Str.trim(output.output)),
    O.filter(Str.isNonEmpty)
  );
});

const packagePathsByName = (document: TurboQueryLsDocument): Record<string, string> =>
  pipe(
    document.packages.items,
    A.map((pkg) => [pkg.name, pkg.path] as const),
    R.fromEntries
  );

const turboPlanTaskFromAffectedTask =
  (pathsByName: Record<string, string>) =>
  (task: TurboQueryAffectedTask): TurboPlanTask => {
    const packagePath = R.get(pathsByName, task.package.name);
    return TurboPlanTask.make({
      taskId: task.fullName,
      packageName: task.package.name,
      task: task.name,
      ...(O.isSome(packagePath) ? { packagePath: packagePath.value } : {}),
    });
  };

const turboPlanTasksFromQueryDocuments = (
  affectedDocument: TurboQueryAffectedDocument,
  packageDocument: TurboQueryLsDocument
): ReadonlyArray<TurboPlanTask> => {
  const pathsByName = packagePathsByName(packageDocument);
  return pipe(affectedDocument.data.affectedTasks.items, A.map(turboPlanTaskFromAffectedTask(pathsByName)));
};

const decodeTurboPlanTasksFromQueryJson = Effect.fn("Yeet.decodeTurboPlanTasksFromQueryJson")(function* (
  affectedJson: string,
  packageJson: string
): Effect.fn.Return<ReadonlyArray<TurboPlanTask>, YeetCommandError> {
  const affectedDocument = yield* decodeTurboQueryAffectedDocument(affectedJson).pipe(
    Effect.mapError(YeetCommandError.new("Failed to decode Turbo affected query JSON."))
  );
  const packageDocument = yield* decodeTurboQueryLsDocument(packageJson).pipe(
    Effect.mapError(YeetCommandError.new("Failed to decode Turbo package query JSON."))
  );
  return turboPlanTasksFromQueryDocuments(affectedDocument, packageDocument);
});

/**
 * Decode Turbo query JSON into Yeet Turbo plan task metadata for focused tests.
 *
 * @category testing
 * @since 0.0.0
 */
export const decodeTurboPlanTasksFromQueryJsonForTesting = decodeTurboPlanTasksFromQueryJson;

const collectTurboPlanSnapshot = Effect.fn("Yeet.collectTurboPlanSnapshot")(function* (
  repoRoot: string,
  options: YeetRunOptions
): Effect.fn.Return<
  TurboPlanSnapshot,
  YeetCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const turboVersion = yield* collectTurboVersion(repoRoot);
  const affectedJson = yield* runTurboQueryJson(
    repoRoot,
    ["query", "affected", "--tasks", ...YEET_FEEDBACK_TASKS, "--base", options.base, "--head", options.head],
    "turbo query affected"
  );
  const packageJson = yield* runTurboQueryJson(repoRoot, ["query", "ls", "--output", "json"], "turbo query ls");
  const tasks = yield* decodeTurboPlanTasksFromQueryJson(affectedJson, packageJson);

  return TurboPlanSnapshot.make({
    ...emptyTurboPlanSnapshot([]),
    ...(O.isSome(turboVersion) ? { turboVersion: turboVersion.value } : {}),
    tasks,
  });
});

/**
 * Hydrate a shared yeet run context from repository state.
 *
 * @param options - Runtime options.
 * @returns Shared run context.
 * @example
 * ```ts
 * import { defaultYeetRunOptions, hydrateYeetRunContext } from "@beep/repo-cli/test/Yeet"
 *
 * const context = hydrateYeetRunContext(defaultYeetRunOptions({ plan: true }))
 * console.log(context)
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const hydrateYeetRunContext = Effect.fn("Yeet.hydrateYeetRunContext")(function* (
  options: YeetRunOptions
): Effect.fn.Return<
  RepoRunContext,
  YeetCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const repoRoot = yield* findRepoRoot().pipe(Effect.mapError(YeetCommandError.new("Failed to locate repo root.")));
  const branch = yield* runGitOutput(repoRoot, ["rev-parse", "--abbrev-ref", "HEAD"]);
  const turbo = yield* collectTurboPlanSnapshot(repoRoot, options);

  return RepoRunContext.make({
    repoRoot,
    cwd: process.cwd(),
    base: options.base,
    head: options.head,
    branch,
    packetDir: options.packetDir,
    originalArgv: [],
    turbo,
  });
});

const artifactDirForContext = Effect.fn("Yeet.artifactDirForContext")(function* (
  context: RepoRunContext
): Effect.fn.Return<string, never, Path.Path> {
  const path = yield* Path.Path;
  return path.isAbsolute(context.packetDir) ? context.packetDir : path.join(context.repoRoot, context.packetDir);
});

const rawOutputPathForStep = Effect.fn("Yeet.rawOutputPathForStep")(function* (
  context: RepoRunContext,
  step: RepoPlanStep
): Effect.fn.Return<string, never, Path.Path> {
  const path = yield* Path.Path;
  const artifactDir = yield* artifactDirForContext(context);
  return path.join(artifactDir, "logs", `${safeArtifactName(step.id)}.log`);
});

const executeStepWithArtifacts = Effect.fn("Yeet.executeStepWithArtifacts")(function* (
  context: RepoRunContext,
  step: RepoPlanStep
): Effect.fn.Return<
  RepoStepRunResult,
  YeetCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const rawOutputPath = yield* rawOutputPathForStep(context, step);
  return yield* executeRepoPlanStep(step, O.some(rawOutputPath)).pipe(
    Effect.mapError(YeetCommandError.new(`Failed to execute ${step.label}.`))
  );
});

const writeTextFile = Effect.fn("Yeet.writeTextFile")(function* (
  filePath: string,
  content: string
): Effect.fn.Return<void, YeetCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  yield* fs
    .makeDirectory(path.dirname(filePath), { recursive: true })
    .pipe(Effect.mapError(YeetCommandError.new(`Failed to create directory for "${filePath}".`)));
  yield* fs
    .writeFileString(filePath, content)
    .pipe(Effect.mapError(YeetCommandError.new(`Failed to write "${filePath}".`)));
});

const writeIssueArtifacts = Effect.fn("Yeet.writeIssueArtifacts")(function* (
  context: RepoRunContext,
  index: QualityIssueIndex
): Effect.fn.Return<YeetRunResult, YeetCommandError, FileSystem.FileSystem | Path.Path> {
  const path = yield* Path.Path;
  const artifactDir = yield* artifactDirForContext(context);
  const indexPath = path.join(artifactDir, "quality-issue-index.json");
  yield* writeTextFile(indexPath, `${yield* renderJson(index)}\n`);

  const writePackagePacket = Effect.fnUntraced(function* (
    report: PackageQualityReport
  ): Effect.fn.Return<string, YeetCommandError, FileSystem.FileSystem | Path.Path> {
    const markdown = yield* pipe(
      renderPackageQualityPacketMarkdown(report),
      Result.match({
        onFailure: (error) => Effect.fail(YeetCommandError.make({ message: error.message })),
        onSuccess: Effect.succeed,
      })
    );
    const packetPath = path.join(artifactDir, "packets", `${safeArtifactName(report.packageName)}.md`);
    yield* writeTextFile(packetPath, markdown);
    return packetPath;
  });

  const packetPaths = yield* Effect.forEach(index.packages, writePackagePacket);

  return YeetRunResult.make({
    artifactDir,
    committed: false,
    pushed: false,
    packetPaths,
    indexPath,
  });
});

const issuesFromResults = (
  context: RepoRunContext,
  steps: ReadonlyArray<RepoPlanStep>,
  results: ReadonlyArray<RepoStepRunResult>
): ReadonlyArray<QualityIssue> =>
  pipe(
    results,
    A.flatMap((result) =>
      pipe(
        A.findFirst(steps, (step) => step.id === result.stepId),
        O.map((step) => qualityIssuesFromStepResult(context, step, result)),
        O.getOrElse(A.empty<QualityIssue>)
      )
    )
  );

const publishResult = Effect.fn("Yeet.publishResult")(function* (
  context: RepoRunContext
): Effect.fn.Return<YeetRunResult, never, Path.Path> {
  const artifactDir = yield* artifactDirForContext(context);
  return YeetRunResult.make({
    artifactDir,
    committed: true,
    pushed: true,
    packetPaths: [],
  });
});

const commitMessagePathForContext = Effect.fn("Yeet.commitMessagePathForContext")(function* (
  context: RepoRunContext
): Effect.fn.Return<string, never, Path.Path> {
  const path = yield* Path.Path;
  const artifactDir = yield* artifactDirForContext(context);
  return path.join(artifactDir, "commit-message.txt");
});

const emptyPlanResult = Effect.fn("Yeet.emptyPlanResult")(function* (
  context: RepoRunContext
): Effect.fn.Return<YeetRunResult, never, Path.Path> {
  const artifactDir = yield* artifactDirForContext(context);
  return YeetRunResult.make({
    artifactDir,
    committed: false,
    pushed: false,
    packetPaths: [],
  });
});

const validateRequiredMessage = (options: YeetRunOptions): Effect.Effect<O.Option<string>, YeetCommandError> => {
  const message = optionFromNonEmpty(options.message);
  if (options.plan || O.isSome(message)) {
    return Effect.succeed(message);
  }
  return Effect.fail(
    YeetCommandError.make({
      message: "yeet requires --message with a conventional commit message unless --plan is used.",
      exitCode: 1,
    })
  );
};

const validateCommitMessage = Effect.fn("Yeet.validateCommitMessage")(function* (
  context: RepoRunContext,
  message: string
): Effect.fn.Return<
  void,
  YeetCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const commitlint = yield* resolveLocalRepoBinary(context.repoRoot, "commitlint");
  const messagePath = yield* commitMessagePathForContext(context);
  yield* writeTextFile(messagePath, `${message}\n`);
  const result = yield* runRepoCommandCapture(commitlint, ["--edit", messagePath], context.repoRoot).pipe(
    Effect.mapError(YeetCommandError.new("Failed to run commitlint."))
  );
  if (result.exitCode !== 0) {
    return yield* YeetCommandError.make({
      message: `commit message failed commitlint:\n${result.output}`,
      command: `${commitlint} --edit ${messagePath}`,
      exitCode: result.exitCode,
    });
  }
});

const runPhase = Effect.fn("Yeet.runPhase")(function* (
  context: RepoRunContext,
  steps: ReadonlyArray<RepoPlanStep>
): Effect.fn.Return<
  ReadonlyArray<RepoStepRunResult>,
  YeetCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  return yield* Effect.forEach(steps, (step) => executeStepWithArtifacts(context, step), { concurrency: 1 });
});

const failWithIssueArtifacts = Effect.fn("Yeet.failWithIssueArtifacts")(function* (
  context: RepoRunContext,
  steps: ReadonlyArray<RepoPlanStep>,
  results: ReadonlyArray<RepoStepRunResult>,
  message: string
): Effect.fn.Return<never, YeetCommandError, FileSystem.FileSystem | Path.Path> {
  const index = buildQualityIssueIndex(issuesFromResults(context, steps, results));
  const artifacts = yield* writeIssueArtifacts(context, index);
  yield* Console.error(`${message}\nYeet quality packets written to ${artifacts.artifactDir}`);
  for (const packetPath of artifacts.packetPaths) {
    yield* Console.error(`  - ${packetPath}`);
  }
  const firstFailure = A.findFirst(results, (result) => result.exitCode !== 0);
  return yield* pipe(
    firstFailure,
    O.map((result) => commandFailure(result, message)),
    O.getOrElse(() => YeetCommandError.make({ message }))
  );
});

const runPlanExecution = Effect.fn("Yeet.runPlanExecution")(function* (
  plan: RepoRunPlan,
  message: string
): Effect.fn.Return<
  YeetRunResult,
  YeetCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const prepareSteps = A.filter(plan.steps, (step) => step.phase === "prepare");
  const feedbackSteps = A.filter(plan.steps, (step) => step.phase === "feedback");
  const fullSteps = A.filter(plan.steps, (step) => step.phase === "full");
  const publishSteps = A.filter(plan.steps, (step) => step.phase === "publish");

  const prepareResults = yield* runPhase(plan.context, prepareSteps);
  if (A.some(prepareResults, (result) => result.exitCode !== 0)) {
    return yield* failWithIssueArtifacts(plan.context, prepareSteps, prepareResults, "yeet prepare phase failed.");
  }

  const feedbackResults = yield* runPhase(plan.context, feedbackSteps);
  if (A.some(feedbackResults, (result) => result.exitCode !== 0)) {
    return yield* failWithIssueArtifacts(plan.context, feedbackSteps, feedbackResults, "yeet feedback phase failed.");
  }

  const fullResults = yield* runPhase(plan.context, fullSteps);
  if (A.some(fullResults, (result) => result.exitCode !== 0)) {
    return yield* failWithIssueArtifacts(plan.context, fullSteps, fullResults, "yeet final full proof failed.");
  }

  yield* validateCommitMessage(plan.context, message);
  const publishResults = yield* runPhase(plan.context, publishSteps);
  if (A.some(publishResults, (result) => result.exitCode !== 0)) {
    return yield* failWithIssueArtifacts(plan.context, publishSteps, publishResults, "yeet publish phase failed.");
  }

  return yield* publishResult(plan.context);
});

const renderPlan = Effect.fn("Yeet.renderPlan")(function* (
  plan: RepoRunPlan,
  json: boolean
): Effect.fn.Return<void, YeetCommandError> {
  if (json) {
    yield* printCommandJson(plan).pipe(Effect.mapError(YeetCommandError.new("Failed to print yeet plan JSON.")));
    return;
  }
  yield* Console.log("yeet plan");
  yield* Console.log(`- branch: ${plan.context.branch}`);
  yield* Console.log(`- base/head: ${plan.context.base}...${plan.context.head}`);
  yield* Console.log(`- artifacts: ${plan.context.packetDir}`);
  for (const step of plan.steps) {
    yield* Console.log(`- ${step.phase}: ${step.label} -> ${step.command} ${A.join(step.args, " ")}`);
  }
});

/**
 * Run yeet with the provided options.
 *
 * @param options - Yeet runtime options.
 * @returns Yeet run result when execution succeeds.
 * @example
 * ```ts
 * import { defaultYeetRunOptions, runYeet } from "@beep/repo-cli/test/Yeet"
 *
 * const result = runYeet(defaultYeetRunOptions({ plan: true }))
 * console.log(result)
 * ```
 * @category use-cases
 * @since 0.0.0
 */
export const runYeet = Effect.fn("Yeet.runYeet")(function* (
  options: YeetRunOptions
): Effect.fn.Return<
  YeetRunResult,
  YeetCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const message = yield* validateRequiredMessage(options);
  const context = yield* hydrateYeetRunContext(options);
  const plan = buildYeetRunPlan(context, message);
  if (options.plan) {
    yield* renderPlan(plan, options.json);
    return yield* emptyPlanResult(context);
  }

  return yield* runPlanExecution(
    plan,
    O.getOrElse(message, () => "")
  );
});

/**
 * Build a plan for tests without reading repository state.
 *
 * @category testing
 * @since 0.0.0
 */
export const buildYeetRunPlanForTesting = buildYeetRunPlan;

/**
 * Construct baseline yeet options for focused tests.
 *
 * @param overrides - Partial option values to replace the defaults.
 * @returns Runtime options with repo-standard defaults applied.
 * @category testing
 * @since 0.0.0
 */
export const defaultYeetRunOptions = (overrides: Partial<YeetRunOptions> = {}): YeetRunOptions =>
  YeetRunOptions.make({
    base: "origin/main",
    head: "HEAD",
    json: false,
    message: "",
    packetDir: DEFAULT_YEET_PACKET_DIR,
    plan: false,
    ...overrides,
  });
