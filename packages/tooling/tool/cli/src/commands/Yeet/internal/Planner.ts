/**
 * Yeet v1 repository run planner.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Order } from "effect";
import * as A from "effect/Array";
import { dual, pipe } from "effect/Function";
import * as O from "effect/Option";
import {
  byRepoPlanStepAscending,
  enforceConservativeResume,
  RepoPlanStep,
  RepoRunPlan,
  TurboPlanSnapshot,
} from "../../../internal/repo-run/index.js";
import type { RepoRunContext, TurboPlanTask } from "../../../internal/repo-run/index.js";

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

const gitStep = (context: RepoRunContext, id: string, label: string, args: ReadonlyArray<string>): RepoPlanStep =>
  RepoPlanStep.make({
    id,
    label,
    phase: "publish",
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

/**
 * Build the v1 yeet run plan.
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
} = dual(2, (context: RepoRunContext, message: O.Option<string>): RepoRunPlan => {
  const commitMessage = O.getOrElse(message, () => "<required-conventional-commit-message>");
  const steps = [
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
    ...A.getSomes([
      feedbackStep(context, "feedback:01-build", "feedback:build", "build", "build"),
      feedbackStep(context, "feedback:02-check", "feedback:check", "check", "check"),
      feedbackStep(context, "feedback:03-lint", "feedback:lint", "lint", "lint"),
      feedbackStep(context, "feedback:04-test", "feedback:test", "test", "test"),
    ]),
    bunRunStep(
      context,
      "full:01-quality",
      "full:quality",
      "full",
      "beep",
      ["quality", "github-checks", "quality"],
      "readonly",
      "repo"
    ),
    gitStep(context, "publish:01-commit", "publish:git:commit", ["commit", "-m", commitMessage]),
    bunRunStep(
      context,
      "publish:02-secrets",
      "publish:secrets",
      "publish",
      "beep",
      ["quality", "github-checks", "secrets"],
      "readonly",
      "repo"
    ),
    gitStep(context, "publish:03-push", "publish:git:push", ["push"]),
  ];

  return RepoRunPlan.make({
    context,
    steps: pipe(steps, A.sort(byRepoPlanStepAscending)),
  });
});

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
        if (phase === "full") {
          return 2;
        }
        return 3;
      })
    )
  );
