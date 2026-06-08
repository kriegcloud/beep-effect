/**
 * Yeet command orchestration.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { createHash } from "node:crypto";
import { $RepoCliId } from "@beep/identity/packages";
import { findRepoRoot } from "@beep/repo-utils";
import { Console, DateTime, Effect, FileSystem, Order, Path, pipe, Result } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { printCommandJson } from "../../../internal/cli/Json.js";
import {
  commandTextForStep,
  executeRepoPlanStepStreaming,
  RepoRunContext,
  resolveLocalRepoBinary,
  runRepoCommandCapture,
  TurboPlanSnapshot,
  TurboPlanTask,
  TurboWorkspacePackage,
} from "../../../internal/repo-run/index.js";
import { YeetCommandError } from "../Yeet.errors.js";
import { PrCloseoutOptions, runPrCloseout } from "./Closeout.js";
import { renderPackageQualityPacketMarkdown } from "./PacketRenderer.js";
import {
  buildYeetRunPlanWithMode,
  DEFAULT_YEET_PACKET_DIR,
  emptyTurboPlanSnapshot,
  YEET_FEEDBACK_TASKS,
  YeetProofTier,
  YeetRunMode,
  YeetRunPlanModeOptions,
} from "./Planner.js";
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
    length: S.Finite,
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
    count: S.Finite,
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

const shouldCollectAffectedFeedbackTasks = (mode: YeetRunMode): boolean =>
  YeetRunMode.$match(mode, {
    closeout: () => false,
    publish: () => false,
    repair: () => true,
    verify: () => false,
    monitor: () => false,
    "pre-push-hook": () => false,
  });

class GhPullRequestView extends S.Class<GhPullRequestView>($I`GhPullRequestView`)(
  {
    headRefName: S.String,
    number: S.Finite,
    state: S.String,
  },
  $I.annote("GhPullRequestView", {
    description: "GitHub pull request metadata used to guard Yeet monitor runs.",
  })
) {}

const decodeGhPullRequestView = S.decodeUnknownEffect(S.fromJsonString(GhPullRequestView));

/**
 * Runtime options accepted by the yeet handler.
 *
 * @example
 * ```ts
 * import { YeetRunOptions } from "@beep/repo-cli/commands/Yeet"
 *
 * const options = YeetRunOptions.make({
 *   amend: false,
 *   base: "origin/main",
 *   bots: "greptile,coderabbit,chatgpt",
 *   fast: false,
 *   head: "HEAD",
 *   json: false,
 *   message: "",
 *   mode: "verify",
 *   monitor: false,
 *   noEdit: false,
 *   packetDir: ".beep/yeet",
 *   plan: true,
 *   pushOnly: false,
 *   requireGreptileIssues: -1,
 *   requireGreptileScore: "",
 *   requireReviewComments: -1,
 *   retriggerGreptile: false,
 *   reuseVerified: false,
 *   startPrEarly: false,
 *   tier: "full"
 * })
 * console.log(options.base)
 * ```
 * @category models
 * @since 0.0.0
 */
export class YeetRunOptions extends S.Class<YeetRunOptions>($I`YeetRunOptions`)(
  {
    amend: S.Boolean,
    base: S.String,
    bots: S.String,
    fast: S.Boolean,
    head: S.String,
    json: S.Boolean,
    message: S.String,
    mode: YeetRunMode,
    monitor: S.Boolean,
    noEdit: S.Boolean,
    packetDir: S.String,
    plan: S.Boolean,
    pushOnly: S.Boolean,
    requireGreptileIssues: S.Finite,
    requireGreptileScore: S.String,
    requireReviewComments: S.Finite,
    retriggerGreptile: S.Boolean,
    reuseVerified: S.Boolean,
    startPrEarly: S.Boolean,
    tier: YeetProofTier,
  },
  $I.annote("YeetRunOptions", {
    description: "Runtime options accepted by the yeet handler.",
  })
) {}

class YeetRunState extends S.Class<YeetRunState>($I`YeetRunState`)(
  {
    schemaVersion: S.Literal("yeet-run-state/v1"),
    artifactDir: S.String,
    base: S.String,
    branch: S.String,
    commitSha: S.String,
    diffFingerprint: S.String,
    head: S.String,
    proofCommand: S.String,
    proofTier: YeetProofTier,
    runId: S.String,
    verifiedAt: S.String,
  },
  $I.annote("YeetRunState", {
    description: "Durable exact-match proof state for Yeet retry and closeout loops.",
  })
) {}

const decodeYeetRunState = S.decodeUnknownEffect(S.fromJsonString(YeetRunState));

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

class YeetPublishIntent extends S.Class<YeetPublishIntent>($I`YeetPublishIntent`)(
  {
    paths: S.Array(S.String),
  },
  $I.annote("YeetPublishIntent", {
    description: "Reviewed Git index paths that yeet is allowed to publish.",
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

const zeroGitSha = "0000000000000000000000000000000000000000" as const;

const sortedUniquePaths = (paths: ReadonlyArray<string>): ReadonlyArray<string> =>
  pipe(paths, A.filter(Str.isNonEmpty), A.dedupe, A.sort(Order.String));

const gitPathListFromNulOutput = (output: string): ReadonlyArray<string> =>
  pipe(output, Str.split("\0"), sortedUniquePaths);

const prePushLocalShasFromStdin = (input: string): ReadonlyArray<string> =>
  pipe(
    Str.split(/\r?\n/u)(input),
    A.map(Str.trim),
    A.filter(Str.isNonEmpty),
    A.map((line) => Str.split(/\s+/u)(line)[1] ?? ""),
    A.filter((sha) => Str.isNonEmpty(sha) && sha !== zeroGitSha),
    sortedUniquePaths
  );

const prePushShaMismatches = (localShas: ReadonlyArray<string>, expectedCommitSha: string): ReadonlyArray<string> =>
  pipe(
    localShas,
    A.filter((sha) => sha !== expectedCommitSha),
    sortedUniquePaths
  );

const publishPathsOutsideIntent = (
  intendedPaths: ReadonlyArray<string>,
  observedPaths: ReadonlyArray<string>
): ReadonlyArray<string> =>
  pipe(
    observedPaths,
    A.filter((filePath) => !A.contains(intendedPaths, filePath)),
    sortedUniquePaths
  );

const publishRestagePaths = (
  intendedPaths: ReadonlyArray<string>,
  existingPaths: ReadonlyArray<string>
): ReadonlyArray<string> =>
  pipe(
    intendedPaths,
    A.filter((filePath) => A.contains(existingPaths, filePath)),
    sortedUniquePaths
  );

const expectedPublishUpstream = (branch: string): string => `origin/${branch}`;

const publishUpstreamMismatchWarning = (branch: string, upstream: string): O.Option<string> =>
  upstream === expectedPublishUpstream(branch)
    ? O.none()
    : O.some(
        `[yeet] warning: branch "${branch}" tracks "${upstream}"; publish will push HEAD to ${expectedPublishUpstream(branch)}.`
      );

const formatPublishPaths = (paths: ReadonlyArray<string>): string =>
  pipe(
    paths,
    sortedUniquePaths,
    A.map((filePath) => `  - ${filePath}`),
    A.join("\n")
  );

const publishScopeError = (message: string, paths: ReadonlyArray<string>): YeetCommandError =>
  YeetCommandError.make({
    message: `${message}\n${formatPublishPaths(paths)}`,
    command: "git status --short",
    exitCode: 1,
  });

/**
 * Parse NUL-delimited Git path output for Yeet publish-safety tests.
 *
 * @category testing
 * @since 0.0.0
 */
export const gitPathListFromNulOutputForTesting = gitPathListFromNulOutput;

/**
 * Parse Git pre-push stdin and return non-delete local commit SHAs.
 *
 * @category testing
 * @since 0.0.0
 */
export const prePushLocalShasFromStdinForTesting = prePushLocalShasFromStdin;

/**
 * Return pushed SHAs that do not match the reusable Yeet proof commit.
 *
 * @category testing
 * @since 0.0.0
 */
export const prePushShaMismatchesForTesting = prePushShaMismatches;

/**
 * Return observed paths that are not part of the reviewed Yeet publish intent.
 *
 * @category testing
 * @since 0.0.0
 */
export const publishPathsOutsideIntentForTesting = publishPathsOutsideIntent;

/**
 * Return reviewed paths that can be passed to `git add` without failing on
 * reviewed deletions.
 *
 * @category testing
 * @since 0.0.0
 */
export const publishRestagePathsForTesting = publishRestagePaths;

/**
 * Return the warning Yeet prints when publish push target differs from branch
 * upstream tracking.
 *
 * @category testing
 * @since 0.0.0
 */
export const publishUpstreamMismatchWarningForTesting = publishUpstreamMismatchWarning;

const renderJson = Effect.fn("Yeet.renderJson")(function* (value: unknown): Effect.fn.Return<string, YeetCommandError> {
  return yield* encodeJson(value).pipe(Effect.mapError(YeetCommandError.new("Failed to encode yeet JSON output.")));
});
const decodeJsonTextOption = S.decodeUnknownOption(S.UnknownFromJsonString);

type RunGitOutputOptions = {
  readonly trim?: boolean;
};

const runGitOutput = Effect.fn("Yeet.runGitOutput")(function* (
  repoRoot: string,
  args: ReadonlyArray<string>,
  options: RunGitOutputOptions = {}
): Effect.fn.Return<string, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  const command = `git ${A.join(args, " ")}`;
  const result = yield* runRepoCommandCapture("git", args, repoRoot).pipe(
    Effect.mapError(YeetCommandError.new(`Failed to run ${command}.`))
  );
  if (result.exitCode !== 0) {
    return yield* YeetCommandError.make({
      message: `${command} failed with exit code ${result.exitCode}.`,
      command,
      exitCode: result.exitCode,
    });
  }
  if (result.truncated) {
    return yield* YeetCommandError.make({
      message: `${command} output exceeded the repo-run capture limit.`,
      command,
      exitCode: 1,
    });
  }

  return options.trim === false ? result.output : Str.trim(result.output);
});

const blockedMonitorBranches: ReadonlyArray<string> = ["main", "master", "HEAD"];
const shouldMonitorChecks = (options: YeetRunOptions): boolean =>
  options.monitor || options.mode === "monitor" || options.mode === "closeout";

const validateMonitorBranch = (context: RepoRunContext): Effect.Effect<void, YeetCommandError> => {
  if (!A.contains(blockedMonitorBranches, context.branch)) {
    return Effect.void;
  }

  return Effect.fail(
    YeetCommandError.make({
      message: `yeet monitor is PR-branch-only; refusing to monitor branch "${context.branch}".`,
      command: "git rev-parse --abbrev-ref HEAD",
      exitCode: 1,
    })
  );
};

const runGhPullRequestView = Effect.fn("Yeet.runGhPullRequestView")(function* (
  context: RepoRunContext
): Effect.fn.Return<GhPullRequestView, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  const result = yield* runRepoCommandCapture(
    "gh",
    ["pr", "view", "--json", "number,headRefName,state"],
    context.repoRoot
  ).pipe(Effect.mapError(YeetCommandError.new("Failed to inspect current branch pull request.")));

  if (result.exitCode !== 0) {
    return yield* YeetCommandError.make({
      message:
        "yeet monitor requires an open pull request for the current branch. Run the full local proof fallback with `bun run audit:github pre-push` when no PR is available.",
      command: "gh pr view --json number,headRefName,state",
      exitCode: result.exitCode,
    });
  }

  if (result.truncated) {
    return yield* YeetCommandError.make({
      message: "gh pr view output exceeded the repo-run capture limit.",
      command: "gh pr view --json number,headRefName,state",
      exitCode: 1,
    });
  }

  return yield* decodeGhPullRequestView(result.output).pipe(
    Effect.mapError(YeetCommandError.new("Failed to decode gh pr view JSON."))
  );
});

const validateOpenPullRequest = Effect.fn("Yeet.validateOpenPullRequest")(function* (
  context: RepoRunContext
): Effect.fn.Return<void, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  const pullRequest = yield* runGhPullRequestView(context);

  if (pullRequest.state !== "OPEN") {
    return yield* YeetCommandError.make({
      message: `yeet monitor requires an open pull request; current branch PR #${pullRequest.number} is ${pullRequest.state}.`,
      command: "gh pr view --json number,headRefName,state",
      exitCode: 1,
    });
  }

  if (pullRequest.headRefName !== context.branch) {
    return yield* YeetCommandError.make({
      message: `yeet monitor expected PR head "${context.branch}" but gh reported "${pullRequest.headRefName}".`,
      command: "gh pr view --json number,headRefName,state",
      exitCode: 1,
    });
  }
});

const validateMonitorGuards = Effect.fn("Yeet.validateMonitorGuards")(function* (
  context: RepoRunContext,
  options: YeetRunOptions
): Effect.fn.Return<void, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  if (options.fast && options.mode !== "publish") {
    return yield* YeetCommandError.make({
      message: "yeet --fast is only valid for publish.",
      exitCode: 1,
    });
  }

  if (options.fast && !options.monitor) {
    return yield* YeetCommandError.make({
      message: "yeet publish --fast requires --monitor so hosted PR checks remain explicit.",
      exitCode: 1,
    });
  }

  if (options.startPrEarly && options.mode !== "publish") {
    return yield* YeetCommandError.make({
      message: "yeet --start-pr-early is only valid for publish.",
      exitCode: 1,
    });
  }

  if (options.startPrEarly && !options.monitor) {
    return yield* YeetCommandError.make({
      message:
        "yeet publish --start-pr-early requires --monitor so hosted PR checks are watched while local proof runs.",
      exitCode: 1,
    });
  }

  if (
    options.startPrEarly &&
    (options.fast || options.pushOnly || options.reuseVerified || options.amend || options.noEdit)
  ) {
    return yield* YeetCommandError.make({
      message:
        "yeet publish --start-pr-early cannot be combined with --fast, --push-only, --reuse-verified, --amend, or --no-edit.",
      exitCode: 1,
    });
  }

  if (options.mode === "publish" && options.tier !== "full") {
    return yield* YeetCommandError.make({
      message: "yeet publish always uses the full local proof. Use `yeet verify --tier review-fix` for review loops.",
      exitCode: 1,
    });
  }

  if (options.noEdit && !options.amend) {
    return yield* YeetCommandError.make({
      message: "yeet publish --no-edit requires --amend.",
      exitCode: 1,
    });
  }

  if (options.pushOnly && options.mode !== "publish") {
    return yield* YeetCommandError.make({
      message: "yeet --push-only is only valid for publish.",
      exitCode: 1,
    });
  }

  if (options.pushOnly && !options.reuseVerified) {
    return yield* YeetCommandError.make({
      message: "yeet publish --push-only requires --reuse-verified.",
      exitCode: 1,
    });
  }

  if (options.pushOnly && (options.amend || options.noEdit || options.fast)) {
    return yield* YeetCommandError.make({
      message: "yeet publish --push-only cannot be combined with --amend, --no-edit, or --fast.",
      exitCode: 1,
    });
  }

  if (options.pushOnly && O.isSome(optionFromNonEmpty(options.message))) {
    return yield* YeetCommandError.make({
      message: "yeet publish --push-only does not accept --message because it never creates a commit.",
      exitCode: 1,
    });
  }

  if (!shouldMonitorChecks(options)) {
    return;
  }

  yield* validateMonitorBranch(context);
  if (!options.plan) {
    yield* validateOpenPullRequest(context);
  }
});

const originRefPrefix = "origin/" as const;

const originBranchFromBase = (base: string): O.Option<string> =>
  pipe(
    O.some(base),
    O.filter(Str.startsWith(originRefPrefix)),
    O.map(Str.replace(originRefPrefix, "")),
    O.filter(Str.isNonEmpty)
  );

const refreshBaseRef = Effect.fn("Yeet.refreshBaseRef")(function* (
  repoRoot: string,
  base: string
): Effect.fn.Return<void, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  const originBranch = originBranchFromBase(base);
  if (O.isSome(originBranch)) {
    yield* runGitOutput(repoRoot, [
      "fetch",
      "--quiet",
      "--no-tags",
      "origin",
      `${originBranch.value}:refs/remotes/origin/${originBranch.value}`,
    ]);
    return;
  }

  yield* runGitOutput(repoRoot, ["rev-parse", "--verify", base]);
});

const runGitPathList = Effect.fn("Yeet.runGitPathList")(function* (
  repoRoot: string,
  args: ReadonlyArray<string>
): Effect.fn.Return<ReadonlyArray<string>, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  const output = yield* runGitOutput(repoRoot, args, { trim: false });
  return gitPathListFromNulOutput(output);
});

const collectStagedPublishPaths = Effect.fn("Yeet.collectStagedPublishPaths")(function* (
  repoRoot: string
): Effect.fn.Return<ReadonlyArray<string>, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  return yield* runGitPathList(repoRoot, ["diff", "--cached", "--name-only", "-z"]);
});

const collectUnstagedTrackedPaths = Effect.fn("Yeet.collectUnstagedTrackedPaths")(function* (
  repoRoot: string
): Effect.fn.Return<ReadonlyArray<string>, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  return yield* runGitPathList(repoRoot, ["diff", "--name-only", "-z"]);
});

const collectUntrackedPaths = Effect.fn("Yeet.collectUntrackedPaths")(function* (
  repoRoot: string
): Effect.fn.Return<ReadonlyArray<string>, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  return yield* runGitPathList(repoRoot, ["ls-files", "--others", "--exclude-standard", "-z"]);
});

const collectCurrentUpstreamBranch = Effect.fn("Yeet.collectCurrentUpstreamBranch")(function* (
  repoRoot: string
): Effect.fn.Return<O.Option<string>, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  const result = yield* runRepoCommandCapture(
    "git",
    ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"],
    repoRoot
  ).pipe(Effect.mapError(YeetCommandError.new("Failed to inspect current branch upstream.")));

  if (result.exitCode !== 0) {
    return O.none();
  }

  return optionFromNonEmpty(result.output);
});

const warnOnMismatchedPublishUpstream = Effect.fn("Yeet.warnOnMismatchedPublishUpstream")(function* (
  context: RepoRunContext
): Effect.fn.Return<void, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  const upstream = yield* collectCurrentUpstreamBranch(context.repoRoot);
  if (O.isNone(upstream)) {
    return;
  }

  const warning = publishUpstreamMismatchWarning(context.branch, upstream.value);
  if (O.isSome(warning)) {
    yield* Console.error(warning.value);
  }
});

const collectPublishIntent = Effect.fn("Yeet.collectPublishIntent")(function* (
  context: RepoRunContext
): Effect.fn.Return<YeetPublishIntent, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  const stagedPaths = yield* collectStagedPublishPaths(context.repoRoot);
  const unstagedPaths = yield* collectUnstagedTrackedPaths(context.repoRoot);
  const untrackedPaths = yield* collectUntrackedPaths(context.repoRoot);

  if (A.isReadonlyArrayEmpty(stagedPaths)) {
    return yield* YeetCommandError.make({
      message: "yeet publish requires reviewed staged changes. Stage the intended files before running yeet.",
      command: "git diff --cached --name-only",
      exitCode: 1,
    });
  }

  if (!A.isReadonlyArrayEmpty(untrackedPaths)) {
    return yield* publishScopeError(
      "yeet publish refuses untracked files. Stage intended new files or remove ignored-sensitive leftovers before running yeet.",
      untrackedPaths
    );
  }

  if (!A.isReadonlyArrayEmpty(unstagedPaths)) {
    return yield* publishScopeError(
      "yeet publish refuses unstaged tracked changes. Stage the reviewed files before running yeet.",
      unstagedPaths
    );
  }

  return YeetPublishIntent.make({ paths: stagedPaths });
});

const validatePublishIntentStillSafe = Effect.fn("Yeet.validatePublishIntentStillSafe")(function* (
  context: RepoRunContext,
  intent: YeetPublishIntent
): Effect.fn.Return<void, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  const stagedPaths = yield* collectStagedPublishPaths(context.repoRoot);
  const unstagedPaths = yield* collectUnstagedTrackedPaths(context.repoRoot);
  const untrackedPaths = yield* collectUntrackedPaths(context.repoRoot);
  const unexpectedStagedPaths = publishPathsOutsideIntent(intent.paths, stagedPaths);
  const unexpectedUnstagedPaths = publishPathsOutsideIntent(intent.paths, unstagedPaths);

  if (!A.isReadonlyArrayEmpty(untrackedPaths)) {
    return yield* publishScopeError(
      "yeet publish stopped because new untracked files appeared during quality.",
      untrackedPaths
    );
  }

  if (!A.isReadonlyArrayEmpty(unexpectedStagedPaths)) {
    return yield* publishScopeError(
      "yeet publish stopped because new staged paths appeared outside the reviewed intent.",
      unexpectedStagedPaths
    );
  }

  if (!A.isReadonlyArrayEmpty(unexpectedUnstagedPaths)) {
    return yield* publishScopeError(
      "yeet publish stopped because quality changed paths outside the reviewed intent.",
      unexpectedUnstagedPaths
    );
  }
});

const collectExistingPublishIntentPaths = Effect.fn("Yeet.collectExistingPublishIntentPaths")(function* (
  context: RepoRunContext,
  intent: YeetPublishIntent
): Effect.fn.Return<ReadonlyArray<string>, never, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const existingPaths = yield* Effect.forEach(intent.paths, (filePath) =>
    pipe(
      fs.exists(path.join(context.repoRoot, filePath)),
      Effect.orElseSucceed(() => false),
      Effect.map((exists) => (exists ? O.some(filePath) : O.none()))
    )
  );
  return pipe(existingPaths, A.getSomes, sortedUniquePaths);
});

const stageReviewedPublishIntent = Effect.fn("Yeet.stageReviewedPublishIntent")(function* (
  context: RepoRunContext,
  intent: YeetPublishIntent
): Effect.fn.Return<
  void,
  YeetCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  yield* validatePublishIntentStillSafe(context, intent);
  const existingPaths = yield* collectExistingPublishIntentPaths(context, intent);
  const restagePaths = publishRestagePaths(intent.paths, existingPaths);
  if (!A.isReadonlyArrayEmpty(restagePaths)) {
    yield* runGitOutput(context.repoRoot, ["add", "--", ...restagePaths]);
  }
  yield* validatePublishIntentStillSafe(context, intent);

  const stagedPaths = yield* collectStagedPublishPaths(context.repoRoot);
  if (A.isReadonlyArrayEmpty(stagedPaths)) {
    return yield* YeetCommandError.make({
      message: "yeet publish has no staged changes after reviewed staging.",
      command: "git diff --cached --name-only",
      exitCode: 1,
    });
  }
});

const postCommitProofChangedBeforePushMessage =
  "yeet publish stopped because the full proof changed files after the local commit. Regenerate them, then amend or reset the commit that has not yet been pushed before retrying.";

const postCommitProofChangedAfterEarlyPushMessage =
  "yeet publish --start-pr-early stopped because the full proof changed files after the commit was already pushed. Commit a follow-up fix and publish again.";

const validatePostCommitProofDidNotChangeWorktree = Effect.fn("Yeet.validatePostCommitProofDidNotChangeWorktree")(
  function* (
    context: RepoRunContext,
    message = postCommitProofChangedBeforePushMessage
  ): Effect.fn.Return<void, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
    const stagedPaths = yield* collectStagedPublishPaths(context.repoRoot);
    const unstagedPaths = yield* collectUnstagedTrackedPaths(context.repoRoot);
    const untrackedPaths = yield* collectUntrackedPaths(context.repoRoot);
    const changedPaths = sortedUniquePaths([...stagedPaths, ...unstagedPaths, ...untrackedPaths]);

    if (!A.isReadonlyArrayEmpty(changedPaths)) {
      return yield* publishScopeError(message, changedPaths);
    }
  }
);

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

const turboWorkspacePackageFromQueryPackage = (pkg: TurboQueryPackage): TurboWorkspacePackage =>
  TurboWorkspacePackage.make({
    name: pkg.name,
    path: pkg.path,
  });

const turboWorkspacePackagesFromQueryDocument = (
  document: TurboQueryLsDocument
): ReadonlyArray<TurboWorkspacePackage> => pipe(document.packages.items, A.map(turboWorkspacePackageFromQueryPackage));

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

const collectAffectedFeedbackTasks = Effect.fn("Yeet.collectAffectedFeedbackTasks")(function* (
  repoRoot: string,
  options: YeetRunOptions,
  packageDocument: TurboQueryLsDocument
): Effect.fn.Return<
  ReadonlyArray<TurboPlanTask>,
  YeetCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  if (!shouldCollectAffectedFeedbackTasks(options.mode)) {
    return [];
  }

  const affectedJson = yield* runTurboQueryJson(
    repoRoot,
    ["query", "affected", "--tasks", ...YEET_FEEDBACK_TASKS, "--base", options.base, "--head", options.head],
    "turbo query affected"
  );
  const affectedDocument = yield* decodeTurboQueryAffectedDocument(affectedJson).pipe(
    Effect.mapError(YeetCommandError.new("Failed to decode Turbo affected query JSON."))
  );
  return turboPlanTasksFromQueryDocuments(affectedDocument, packageDocument);
});

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
  const packageJson = yield* runTurboQueryJson(repoRoot, ["query", "ls", "--output", "json"], "turbo query ls");
  const packageDocument = yield* decodeTurboQueryLsDocument(packageJson).pipe(
    Effect.mapError(YeetCommandError.new("Failed to decode Turbo package query JSON."))
  );
  const tasks = yield* collectAffectedFeedbackTasks(repoRoot, options, packageDocument);
  const packages = turboWorkspacePackagesFromQueryDocument(packageDocument);

  return TurboPlanSnapshot.make({
    ...emptyTurboPlanSnapshot([]),
    ...(O.isSome(turboVersion) ? { turboVersion: turboVersion.value } : {}),
    packages,
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
  if (options.mode === "pre-push-hook") {
    return RepoRunContext.make({
      repoRoot,
      cwd: process.cwd(),
      base: options.base,
      head: options.head,
      branch,
      packetDir: options.packetDir,
      originalArgv: [],
      turbo: emptyTurboPlanSnapshot([]),
    });
  }

  yield* refreshBaseRef(repoRoot, options.base);
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

const runIdForContext = (context: RepoRunContext): string => safeArtifactName(context.branch);

const runStatePathForContext = Effect.fn("Yeet.runStatePathForContext")(function* (
  context: RepoRunContext
): Effect.fn.Return<string, never, Path.Path> {
  const path = yield* Path.Path;
  const artifactDir = yield* artifactDirForContext(context);
  return path.join(artifactDir, "runs", runIdForContext(context), "state.json");
});

const runOutputPathForContext = Effect.fn("Yeet.runOutputPathForContext")(function* (
  context: RepoRunContext,
  fileName: string
): Effect.fn.Return<string, never, Path.Path> {
  const path = yield* Path.Path;
  const artifactDir = yield* artifactDirForContext(context);
  return path.join(artifactDir, "runs", runIdForContext(context), fileName);
});

const collectDiffFingerprint = Effect.fn("Yeet.collectDiffFingerprint")(function* (
  context: RepoRunContext
): Effect.fn.Return<string, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  const status = yield* runGitOutput(context.repoRoot, ["status", "--short"], { trim: false });
  const unstagedDiff = yield* runGitOutput(context.repoRoot, ["diff", "--binary", "HEAD"], { trim: false });
  const stagedDiff = yield* runGitOutput(context.repoRoot, ["diff", "--cached", "--binary"], { trim: false });
  return createHash("sha256")
    .update(status)
    .update("\0")
    .update(unstagedDiff)
    .update("\0")
    .update(stagedDiff)
    .digest("hex");
});

const currentCommitSha = (context: RepoRunContext) => runGitOutput(context.repoRoot, ["rev-parse", "HEAD"]);

const proofCommandForSteps = (steps: ReadonlyArray<RepoPlanStep>): string =>
  pipe(steps, A.map(commandTextForStep), A.join(" && "));

const writeVerifiedState = Effect.fn("Yeet.writeVerifiedState")(function* (
  context: RepoRunContext,
  tier: YeetProofTier,
  proofSteps: ReadonlyArray<RepoPlanStep>
): Effect.fn.Return<
  void,
  YeetCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const artifactDir = yield* artifactDirForContext(context);
  const statePath = yield* runStatePathForContext(context);
  const state = YeetRunState.make({
    schemaVersion: "yeet-run-state/v1",
    artifactDir,
    base: context.base,
    branch: context.branch,
    commitSha: yield* currentCommitSha(context),
    diffFingerprint: yield* collectDiffFingerprint(context),
    head: context.head,
    proofCommand: proofCommandForSteps(proofSteps),
    proofTier: tier,
    runId: runIdForContext(context),
    verifiedAt: yield* DateTime.now.pipe(Effect.map(DateTime.formatIso)),
  });
  yield* writeTextFile(statePath, `${yield* renderJson(state)}\n`);
});

const loadVerifiedState = Effect.fn("Yeet.loadVerifiedState")(function* (
  context: RepoRunContext
): Effect.fn.Return<YeetRunState, YeetCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const statePath = yield* runStatePathForContext(context);
  const text = yield* fs
    .readFileString(statePath)
    .pipe(Effect.mapError(YeetCommandError.new(`No reusable Yeet proof state found at ${statePath}.`)));
  return yield* decodeYeetRunState(text).pipe(
    Effect.mapError(YeetCommandError.new(`Failed to decode reusable Yeet proof state at ${statePath}.`))
  );
});

const assertReusableVerifiedState = Effect.fn("Yeet.assertReusableVerifiedState")(function* (
  context: RepoRunContext
): Effect.fn.Return<
  void,
  YeetCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const state = yield* loadVerifiedState(context);
  const expectedCommitSha = yield* currentCommitSha(context);
  const expectedFingerprint = yield* collectDiffFingerprint(context);
  const mismatch = [
    ...(state.branch === context.branch ? [] : [`branch ${state.branch} != ${context.branch}`]),
    ...(state.base === context.base ? [] : [`base ${state.base} != ${context.base}`]),
    ...(state.head === context.head ? [] : [`head ${state.head} != ${context.head}`]),
    ...(state.commitSha === expectedCommitSha ? [] : [`commit ${state.commitSha} != ${expectedCommitSha}`]),
    ...(state.diffFingerprint === expectedFingerprint ? [] : ["diff fingerprint changed"]),
    ...(state.proofTier === "full" ? [] : [`proof tier ${state.proofTier} is not full`]),
  ];

  if (A.isReadonlyArrayEmpty(mismatch)) {
    yield* Console.log(`[yeet] reusing full proof state from ${state.verifiedAt}`);
    return;
  }

  return yield* YeetCommandError.make({
    message: `yeet publish --reuse-verified found stale proof state:\n${A.join(
      A.map(mismatch, (line) => `  - ${line}`),
      "\n"
    )}\nRun \`bun run beep yeet verify\` against the exact current worktree before retrying.`,
    exitCode: 1,
  });
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
  return yield* executeRepoPlanStepStreaming(step, O.some(rawOutputPath)).pipe(
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
  context: RepoRunContext,
  committed: boolean
): Effect.fn.Return<YeetRunResult, never, Path.Path> {
  const artifactDir = yield* artifactDirForContext(context);
  return YeetRunResult.make({
    artifactDir,
    committed,
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
  if (
    options.plan ||
    options.mode !== "publish" ||
    O.isSome(message) ||
    (options.amend && options.noEdit) ||
    options.pushOnly
  ) {
    return Effect.succeed(message);
  }
  return Effect.fail(
    YeetCommandError.make({
      message: "yeet publish requires --message with a conventional commit message unless --plan is used.",
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

const runVerifyMode = Effect.fn("Yeet.runVerifyMode")(function* (
  context: RepoRunContext,
  fullSteps: ReadonlyArray<RepoPlanStep>,
  tier: YeetProofTier
): Effect.fn.Return<
  YeetRunResult,
  YeetCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const verifyResults = yield* runPhase(context, fullSteps);
  if (A.some(verifyResults, (result) => result.exitCode !== 0)) {
    return yield* failWithIssueArtifacts(context, fullSteps, verifyResults, "yeet verification proof failed.");
  }
  yield* writeVerifiedState(context, tier, fullSteps);
  return yield* emptyPlanResult(context);
});

const shouldSkipCommitForReusablePublish = Effect.fn("Yeet.shouldSkipCommitForReusablePublish")(function* (
  context: RepoRunContext,
  options: YeetRunOptions
): Effect.fn.Return<boolean, YeetCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  if (!options.reuseVerified || (!options.pushOnly && (!options.amend || !options.noEdit))) {
    return false;
  }

  const stagedPaths = yield* collectStagedPublishPaths(context.repoRoot);
  if (!A.isReadonlyArrayEmpty(stagedPaths)) {
    return false;
  }

  const unstagedPaths = yield* collectUnstagedTrackedPaths(context.repoRoot);
  const untrackedPaths = yield* collectUntrackedPaths(context.repoRoot);
  const changedPaths = sortedUniquePaths([...unstagedPaths, ...untrackedPaths]);
  if (!A.isReadonlyArrayEmpty(changedPaths)) {
    return yield* publishScopeError(
      options.pushOnly
        ? "yeet publish --push-only --reuse-verified found uncommitted changes."
        : "yeet publish --reuse-verified found uncommitted changes but no staged amend intent.",
      changedPaths
    );
  }

  return true;
});

const runPublishMode = Effect.fn("Yeet.runPublishMode")(function* (
  plan: RepoRunPlan,
  message: O.Option<string>,
  options: YeetRunOptions,
  commitSteps: ReadonlyArray<RepoPlanStep>,
  fullSteps: ReadonlyArray<RepoPlanStep>,
  earlyPublishSteps: ReadonlyArray<RepoPlanStep>,
  publishSteps: ReadonlyArray<RepoPlanStep>,
  monitorSteps: ReadonlyArray<RepoPlanStep>
): Effect.fn.Return<
  YeetRunResult,
  YeetCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const skipCommit = yield* shouldSkipCommitForReusablePublish(plan.context, options);
  if (options.reuseVerified) {
    yield* assertReusableVerifiedState(plan.context);
  }

  if (skipCommit) {
    yield* Console.log("[yeet] skipped commit; exact reusable proof state matches the current clean commit");
  } else {
    const publishIntent = yield* collectPublishIntent(plan.context);
    if (O.isSome(message)) {
      yield* validateCommitMessage(plan.context, message.value);
    }
    yield* stageReviewedPublishIntent(plan.context, publishIntent);

    const commitResults = yield* runPhase(plan.context, commitSteps);
    if (A.some(commitResults, (result) => result.exitCode !== 0)) {
      return yield* failWithIssueArtifacts(plan.context, commitSteps, commitResults, "yeet commit phase failed.");
    }
  }

  if (options.startPrEarly) {
    yield* Console.log(
      "[yeet] start-pr-early: pushing before local proof; full proof and hosted monitor remain required"
    );
    yield* warnOnMismatchedPublishUpstream(plan.context);
    const earlyPublishResults = yield* runPhase(plan.context, earlyPublishSteps);
    if (A.some(earlyPublishResults, (result) => result.exitCode !== 0)) {
      return yield* failWithIssueArtifacts(
        plan.context,
        earlyPublishSteps,
        earlyPublishResults,
        "yeet start-pr-early push phase failed."
      );
    }

    const fullResults = yield* runPhase(plan.context, fullSteps);
    if (A.some(fullResults, (result) => result.exitCode !== 0)) {
      return yield* failWithIssueArtifacts(
        plan.context,
        fullSteps,
        fullResults,
        "yeet publish --start-pr-early proof failed after pushing the commit. Fix the issue in a follow-up commit and publish again."
      );
    }
    yield* writeVerifiedState(plan.context, "full", fullSteps);
    yield* validatePostCommitProofDidNotChangeWorktree(plan.context, postCommitProofChangedAfterEarlyPushMessage);

    const monitorResults = yield* runPhase(plan.context, monitorSteps);
    if (A.some(monitorResults, (result) => result.exitCode !== 0)) {
      return yield* failWithIssueArtifacts(
        plan.context,
        monitorSteps,
        monitorResults,
        "yeet publish monitor phase failed."
      );
    }

    return yield* publishResult(plan.context, !skipCommit);
  }

  if (!options.reuseVerified) {
    const fullResults = yield* runPhase(plan.context, fullSteps);
    if (A.some(fullResults, (result) => result.exitCode !== 0)) {
      return yield* failWithIssueArtifacts(
        plan.context,
        fullSteps,
        fullResults,
        "yeet publish proof failed after creating the local commit. Fix the issue, then amend or reset the commit that has not yet been pushed before retrying."
      );
    }
    yield* writeVerifiedState(plan.context, "full", fullSteps);
  } else {
    yield* Console.log("[yeet] skipped local full proof after exact reusable proof-state match");
  }
  yield* validatePostCommitProofDidNotChangeWorktree(plan.context);

  yield* warnOnMismatchedPublishUpstream(plan.context);
  const publishResults = yield* runPhase(plan.context, publishSteps);
  if (A.some(publishResults, (result) => result.exitCode !== 0)) {
    return yield* failWithIssueArtifacts(plan.context, publishSteps, publishResults, "yeet publish phase failed.");
  }

  const monitorResults = yield* runPhase(plan.context, monitorSteps);
  if (A.some(monitorResults, (result) => result.exitCode !== 0)) {
    return yield* failWithIssueArtifacts(
      plan.context,
      monitorSteps,
      monitorResults,
      "yeet publish monitor phase failed."
    );
  }

  return yield* publishResult(plan.context, !skipCommit);
});

const readPrePushHookStdin = Effect.fn("Yeet.readPrePushHookStdin")(function* (): Effect.fn.Return<
  string,
  YeetCommandError
> {
  if (process.stdin.isTTY) {
    return "";
  }

  return yield* Effect.tryPromise({
    try: () => Bun.stdin.text(),
    catch: (cause) =>
      YeetCommandError.make({
        message: `Failed to read git pre-push stdin: ${cause instanceof Error ? cause.message : String(cause)}`,
        exitCode: 1,
      }),
  });
});

const runPrePushHookMode = Effect.fn("Yeet.runPrePushHookMode")(function* (
  context: RepoRunContext
): Effect.fn.Return<
  YeetRunResult,
  YeetCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const currentSha = yield* currentCommitSha(context);
  const stdinText = yield* readPrePushHookStdin();
  const pushedLocalShas = prePushLocalShasFromStdin(stdinText);
  const localShas = A.isReadonlyArrayEmpty(pushedLocalShas) ? [currentSha] : pushedLocalShas;
  const mismatchedShas = prePushShaMismatches(localShas, currentSha);

  if (!A.isReadonlyArrayEmpty(mismatchedShas)) {
    return yield* YeetCommandError.make({
      message: `yeet pre-push-hook cannot reuse proof for pushed SHA(s) outside current HEAD:\n${formatPublishPaths(
        mismatchedShas
      )}`,
      command: "git push",
      exitCode: 1,
    });
  }

  yield* assertReusableVerifiedState(context);
  yield* Console.log(`[yeet] pre-push hook reused full proof for ${Str.slice(0, 12)(currentSha)}`);
  return yield* emptyPlanResult(context);
});

const runMonitorMode = Effect.fn("Yeet.runMonitorMode")(function* (
  context: RepoRunContext,
  monitorSteps: ReadonlyArray<RepoPlanStep>
): Effect.fn.Return<
  YeetRunResult,
  YeetCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const monitorResults = yield* runPhase(context, monitorSteps);
  if (A.some(monitorResults, (result) => result.exitCode !== 0)) {
    return yield* failWithIssueArtifacts(context, monitorSteps, monitorResults, "yeet monitor failed.");
  }
  return yield* emptyPlanResult(context);
});

const runCloseoutMode = Effect.fn("Yeet.runCloseoutMode")(function* (
  context: RepoRunContext,
  options: YeetRunOptions
): Effect.fn.Return<
  YeetRunResult,
  YeetCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const report = yield* runPrCloseout(
    context,
    PrCloseoutOptions.make({
      bots: options.bots,
      requireGreptileIssues: options.requireGreptileIssues,
      requireGreptileScore: options.requireGreptileScore,
      requireReviewComments: options.requireReviewComments,
      retriggerGreptile: options.retriggerGreptile,
    })
  );
  const reportPath = yield* runOutputPathForContext(context, "pr-closeout.json");
  yield* writeTextFile(reportPath, `${yield* renderJson(report)}\n`);
  yield* Console.log(`[yeet] PR closeout report written to ${reportPath}`);

  if (A.isReadonlyArrayEmpty(report.issues)) {
    return yield* emptyPlanResult(context);
  }

  const index = buildQualityIssueIndex(report.issues);
  const artifacts = yield* writeIssueArtifacts(context, index);
  yield* Console.error(
    `yeet PR closeout failed with ${report.issueCount} issue(s).\nYeet quality packets written to ${artifacts.artifactDir}`
  );
  for (const packetPath of artifacts.packetPaths) {
    yield* Console.error(`  - ${packetPath}`);
  }
  return yield* YeetCommandError.make({
    message: `yeet PR closeout failed with ${report.issueCount} issue(s).`,
    command: "bun run beep yeet closeout",
    exitCode: 1,
  });
});

const runPlanExecution = Effect.fn("Yeet.runPlanExecution")(function* (
  plan: RepoRunPlan,
  options: YeetRunOptions,
  message: O.Option<string>
): Effect.fn.Return<
  YeetRunResult,
  YeetCommandError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const prepareSteps = A.filter(plan.steps, (step) => step.phase === "prepare");
  const feedbackSteps = A.filter(plan.steps, (step) => step.phase === "feedback");
  const commitSteps = A.filter(plan.steps, (step) => step.phase === "commit");
  const earlyPublishSteps = A.filter(plan.steps, (step) => step.phase === "early-publish");
  const fullSteps = A.filter(plan.steps, (step) => step.phase === "full");
  const publishSteps = A.filter(plan.steps, (step) => step.phase === "publish");
  const monitorSteps = A.filter(plan.steps, (step) => step.phase === "monitor");

  const prepareResults = yield* runPhase(plan.context, prepareSteps);
  if (A.some(prepareResults, (result) => result.exitCode !== 0)) {
    return yield* failWithIssueArtifacts(plan.context, prepareSteps, prepareResults, "yeet prepare phase failed.");
  }

  const feedbackResults = yield* runPhase(plan.context, feedbackSteps);
  if (A.some(feedbackResults, (result) => result.exitCode !== 0)) {
    return yield* failWithIssueArtifacts(plan.context, feedbackSteps, feedbackResults, "yeet feedback phase failed.");
  }

  return yield* YeetRunMode.$match(options.mode, {
    repair: () => emptyPlanResult(plan.context),
    verify: () => runVerifyMode(plan.context, fullSteps, options.tier),
    publish: () =>
      runPublishMode(plan, message, options, commitSteps, fullSteps, earlyPublishSteps, publishSteps, monitorSteps),
    monitor: () => runMonitorMode(plan.context, monitorSteps),
    closeout: () => runCloseoutMode(plan.context, options),
    "pre-push-hook": () => runPrePushHookMode(plan.context),
  });
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
  yield* validateMonitorGuards(context, options);
  const plan = buildYeetRunPlanWithMode(
    context,
    message,
    YeetRunPlanModeOptions.make({
      amend: options.amend,
      fast: options.fast,
      mode: options.mode,
      monitor: options.monitor,
      noEdit: options.noEdit,
      pushOnly: options.pushOnly,
      startPrEarly: options.startPrEarly,
      tier: options.tier,
    })
  );
  if (options.plan) {
    yield* renderPlan(plan, options.json);
    return yield* emptyPlanResult(context);
  }

  return yield* runPlanExecution(plan, options, message);
});

/**
 * Build a plan for tests without reading repository state.
 *
 * @param options - Hydrated test context, optional message, and optional mode.
 * @returns Ordered Yeet run plan.
 * @category testing
 * @since 0.0.0
 */
export const buildYeetRunPlanForTesting = (options: {
  readonly amend?: boolean;
  readonly context: RepoRunContext;
  readonly fast?: boolean;
  readonly message: O.Option<string>;
  readonly mode?: YeetRunMode;
  readonly monitor?: boolean;
  readonly noEdit?: boolean;
  readonly pushOnly?: boolean;
  readonly startPrEarly?: boolean;
  readonly tier?: YeetProofTier;
}): RepoRunPlan =>
  buildYeetRunPlanWithMode(
    options.context,
    options.message,
    YeetRunPlanModeOptions.make({
      amend: options.amend ?? false,
      fast: options.fast ?? false,
      mode: options.mode ?? "publish",
      monitor: options.monitor ?? false,
      noEdit: options.noEdit ?? false,
      pushOnly: options.pushOnly ?? false,
      startPrEarly: options.startPrEarly ?? false,
      tier: options.tier ?? "full",
    })
  );

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
    amend: false,
    base: "origin/main",
    bots: "greptile,coderabbit,chatgpt",
    fast: false,
    head: "HEAD",
    json: false,
    message: "",
    mode: "publish",
    monitor: false,
    noEdit: false,
    packetDir: DEFAULT_YEET_PACKET_DIR,
    plan: false,
    pushOnly: false,
    requireGreptileIssues: -1,
    requireGreptileScore: "",
    requireReviewComments: -1,
    retriggerGreptile: false,
    reuseVerified: false,
    startPrEarly: false,
    tier: "full",
    ...overrides,
  });
