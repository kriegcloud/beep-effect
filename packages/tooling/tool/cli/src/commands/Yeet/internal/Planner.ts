/**
 * Yeet v1 repository run planner.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { Order } from "effect";
import * as A from "effect/Array";
import { dual, pipe } from "effect/Function";
import * as O from "effect/Option";
import {
  byRepoPlanStepAscending,
  enforceConservativeResume,
  RepoPlanStep,
  RepoRunPlan,
  repoProofStepDefinition,
  TurboPlanSnapshot,
} from "../../../internal/repo-run/index.js";
import type { RepoRunContext, TurboPlanTask } from "../../../internal/repo-run/index.js";

const $I = $RepoCliId.create("commands/Yeet/internal/Planner");

/**
 * Default ignored directory for yeet run artifacts.
 *
 * @category configuration
 * @since 0.0.0
 */
export const DEFAULT_YEET_PACKET_DIR = ".beep/yeet" as const;

/**
 * Turbo tasks used by the Yeet feedback phase.
 *
 * @category configuration
 * @since 0.0.0
 */
export const YEET_FEEDBACK_TASKS = ["build", "check", "lint", "test"] as const;

/**
 * Yeet execution modes.
 *
 * @example
 * ```ts
 * import { YeetRunMode } from "@beep/repo-cli/test/Yeet"
 *
 * console.log(YeetRunMode.is.verify("verify"))
 * ```
 * @category models
 * @since 0.0.0
 */
export const YeetRunMode = LiteralKit(["repair", "verify", "publish"]).pipe(
  $I.annoteSchema("YeetRunMode", {
    description: "Execution mode selected for a yeet repository run.",
  })
);

/**
 * Yeet execution modes.
 *
 * @category models
 * @since 0.0.0
 */
export type YeetRunMode = typeof YeetRunMode.Type;

const sharedFeedbackTurboArgs = ["--continue=dependencies-successful", "--summarize", "--ui=stream"] as const;

const affectedArgs = (): ReadonlyArray<string> => ["--affected", ...sharedFeedbackTurboArgs];

const bunRunStep = (
  context: RepoRunContext,
  id: string,
  label: string,
  phase: RepoPlanStep["phase"],
  script: string,
  args: ReadonlyArray<string>,
  mutability: RepoPlanStep["mutability"],
  scope: RepoPlanStep["scope"],
  task: O.Option<string> = O.none(),
  env: O.Option<Record<string, string | undefined>> = O.none()
): RepoPlanStep =>
  enforceConservativeResume(
    RepoPlanStep.make({
      id,
      label,
      phase,
      command: "bun",
      args: ["run", script, ...args],
      cwd: context.repoRoot,
      scope,
      mutability,
      resume: "never",
      ...(O.isSome(task) ? { task: task.value } : {}),
      ...(O.isSome(env) ? { env: env.value } : {}),
    })
  );

const gitStep = (
  context: RepoRunContext,
  id: string,
  label: string,
  phase: RepoPlanStep["phase"],
  args: ReadonlyArray<string>
): RepoPlanStep =>
  RepoPlanStep.make({
    id,
    label,
    phase,
    command: "git",
    args: [...args],
    cwd: context.repoRoot,
    scope: "git",
    mutability: "publish",
    resume: "never",
  });

/**
 * Create an empty Turbo metadata snapshot.
 *
 * @param warnings - Optional graph-health warnings.
 * @returns Empty Turbo snapshot with graph health status.
 * @example
 * ```ts
 * import { emptyTurboPlanSnapshot } from "@beep/repo-cli/test/Yeet"
 *
 * console.log(emptyTurboPlanSnapshot([]).graphHealthStatus)
 * ```
 * @category constructors
 * @since 0.0.0
 */
export const emptyTurboPlanSnapshot = (warnings: ReadonlyArray<string>): TurboPlanSnapshot =>
  TurboPlanSnapshot.make({
    graphHealthStatus: A.isReadonlyArrayEmpty(warnings) ? "ok" : "warning",
    graphHealthWarnings: [...warnings],
    tasks: [],
  });

const affectedEnv = (context: RepoRunContext): Record<string, string | undefined> => ({
  TURBO_SCM_BASE: context.base,
  TURBO_SCM_HEAD: context.head,
});

const repairSteps = (context: RepoRunContext): ReadonlyArray<RepoPlanStep> => [
  bunRunStep(
    context,
    "prepare:01-lint-fix",
    "prepare:lint:fix",
    "prepare",
    "lint:fix",
    ["--", ...affectedArgs()],
    "write",
    "repo",
    O.none(),
    O.some(affectedEnv(context))
  ),
  bunRunStep(
    context,
    "prepare:02-docgen-local",
    "prepare:docgen:local",
    "prepare",
    "docgen:local",
    [],
    "write",
    "repo"
  ),
  bunRunStep(
    context,
    "prepare:03-repo-exports-catalog",
    "prepare:repo-exports:catalog",
    "prepare",
    "repo-exports:catalog",
    [],
    "write",
    "repo"
  ),
];

const packageNameForFeedbackTask =
  (feedbackTask: string) =>
  (task: TurboPlanTask): O.Option<string> =>
    pipe(
      O.fromUndefinedOr(task.packageName),
      O.filter((packageName) => task.task === feedbackTask && packageName !== "//")
    );

const feedbackFilterArgs = (context: RepoRunContext, feedbackTask: string): ReadonlyArray<string> =>
  pipe(
    context.turbo.tasks,
    A.map(packageNameForFeedbackTask(feedbackTask)),
    A.getSomes,
    A.dedupe,
    A.sort(Order.String),
    A.map((packageName) => `--filter=${packageName}`)
  );

const feedbackStep = (
  context: RepoRunContext,
  id: string,
  label: string,
  script: string,
  task: string
): O.Option<RepoPlanStep> => {
  const filters = feedbackFilterArgs(context, task);
  if (A.isReadonlyArrayEmpty(filters)) {
    return O.none();
  }

  return O.some(
    bunRunStep(
      context,
      id,
      label,
      "feedback",
      script,
      ["--", ...filters, ...sharedFeedbackTurboArgs],
      "readonly",
      "repo",
      O.some(task)
    )
  );
};

const feedbackSteps = (context: RepoRunContext): ReadonlyArray<RepoPlanStep> =>
  A.getSomes([
    feedbackStep(context, "feedback:01-build", "feedback:build", "build", "build"),
    feedbackStep(context, "feedback:02-check", "feedback:check", "check", "check"),
    feedbackStep(context, "feedback:03-lint", "feedback:lint", "lint", "lint"),
    feedbackStep(context, "feedback:04-test", "feedback:test", "test", "test"),
  ]);

const proofStep = (context: RepoRunContext): RepoPlanStep => {
  const proof = repoProofStepDefinition("pre-push");
  return bunRunStep(context, proof.id, proof.label, "full", "beep", proof.args, "readonly", "repo");
};

const commitStep = (context: RepoRunContext, message: O.Option<string>): RepoPlanStep =>
  gitStep(context, "commit:01-git-commit", "commit:git:commit", "commit", [
    "commit",
    "-m",
    O.getOrElse(message, () => "<required-conventional-commit-message>"),
  ]);

const pushStep = (context: RepoRunContext): RepoPlanStep =>
  gitStep(context, "publish:01-git-push", "publish:git:push", "publish", ["push"]);

const stepsForMode = (
  context: RepoRunContext,
  message: O.Option<string>,
  mode: YeetRunMode
): ReadonlyArray<RepoPlanStep> =>
  YeetRunMode.$match(mode, {
    repair: () => [...repairSteps(context), ...feedbackSteps(context)],
    verify: () => [...feedbackSteps(context), proofStep(context)],
    publish: () => [...feedbackSteps(context), commitStep(context, message), proofStep(context), pushStep(context)],
  });

/**
 * Build a yeet run plan for a specific mode.
 *
 * @param context - Hydrated run context.
 * @param message - Optional conventional commit message; required by publish execution.
 * @param mode - Yeet execution mode.
 * @returns Ordered repository run plan.
 * @example
 * ```ts
 * import { buildYeetRunPlanWithMode, RepoRunContext, TurboPlanSnapshot } from "@beep/repo-cli/test/Yeet"
 * import * as O from "effect/Option"
 *
 * const context = RepoRunContext.make({
 *   base: "origin/main",
 *   branch: "repo-cli-yeet",
 *   cwd: "/repo",
 *   head: "HEAD",
 *   originalArgv: [],
 *   packetDir: ".beep/yeet",
 *   repoRoot: "/repo",
 *   turbo: TurboPlanSnapshot.make({ graphHealthStatus: "ok", graphHealthWarnings: [], tasks: [] })
 * })
 * console.log(buildYeetRunPlanWithMode(context, O.none(), "verify").steps)
 * ```
 * @category workflows
 * @since 0.0.0
 */
export const buildYeetRunPlanWithMode = (
  context: RepoRunContext,
  message: O.Option<string>,
  mode: YeetRunMode
): RepoRunPlan =>
  RepoRunPlan.make({
    context,
    steps: pipe(stepsForMode(context, message, mode), A.sort(byRepoPlanStepAscending)),
  });

/**
 * Build the publish-mode yeet run plan.
 *
 * @param context - Hydrated run context.
 * @param message - Optional conventional commit message; omitted only for plan mode.
 * @returns Ordered repository run plan.
 * @example
 * ```ts
 * import { buildYeetRunPlan, RepoRunContext, TurboPlanSnapshot } from "@beep/repo-cli/test/Yeet"
 * import * as O from "effect/Option"
 *
 * const context = RepoRunContext.make({
 *   base: "origin/main",
 *   branch: "repo-cli-yeet",
 *   cwd: "/repo",
 *   head: "HEAD",
 *   originalArgv: [],
 *   packetDir: ".beep/yeet",
 *   repoRoot: "/repo",
 *   turbo: TurboPlanSnapshot.make({ graphHealthStatus: "ok", graphHealthWarnings: [], tasks: [] })
 * })
 * console.log(buildYeetRunPlan(context, O.some("feat(repo-cli): add yeet")))
 * ```
 * @category workflows
 * @since 0.0.0
 */
export const buildYeetRunPlan: {
  (context: RepoRunContext, message: O.Option<string>): RepoRunPlan;
  (message: O.Option<string>): (context: RepoRunContext) => RepoRunPlan;
} = dual(
  2,
  (context: RepoRunContext, message: O.Option<string>): RepoRunPlan =>
    buildYeetRunPlanWithMode(context, message, "publish")
);

/**
 * Return plan phases in execution order.
 *
 * @param plan - Yeet run plan.
 * @returns Ordered unique phase names.
 * @category utilities
 * @since 0.0.0
 */
export const yeetPlanPhases = (plan: RepoRunPlan): ReadonlyArray<RepoPlanStep["phase"]> =>
  pipe(
    plan.steps,
    A.map((step) => step.phase),
    A.dedupe,
    A.sort(
      Order.mapInput(Order.Number, (phase) => {
        if (phase === "prepare") {
          return 0;
        }
        if (phase === "feedback") {
          return 1;
        }
        if (phase === "commit") {
          return 2;
        }
        if (phase === "full") {
          return 3;
        }
        return 4;
      })
    )
  );
