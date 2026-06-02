/**
 * Yeet v1 repository run planner.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import {
  byRepoPlanStepAscending,
  enforceConservativeResume,
  RepoPlanStep,
  RepoRunPlan,
  TurboPlanSnapshot,
} from "../../../internal/repo-run/index.js";
import type { RepoRunContext } from "../../../internal/repo-run/index.js";

/**
 * Default ignored directory for yeet run artifacts.
 *
 * @category configuration
 * @since 0.0.0
 */
export const DEFAULT_YEET_PACKET_DIR = ".beep/yeet" as const;

const affectedFeedbackArgs = [
  "--affected",
  "--continue=dependencies-successful",
  "--summarize",
  "--ui=stream",
] as const;

const bunRunStep = (
  context: RepoRunContext,
  id: string,
  label: string,
  phase: RepoPlanStep["phase"],
  script: string,
  args: ReadonlyArray<string>,
  mutability: RepoPlanStep["mutability"],
  scope: RepoPlanStep["scope"],
  task: O.Option<string> = O.none()
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
      resume: "fingerprint-match",
      ...(O.isSome(task) ? { task: task.value } : {}),
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
 * import { emptyTurboPlanSnapshot } from "@beep/repo-cli/commands/Yeet"
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

/**
 * Build the v1 yeet run plan.
 *
 * @param context - Hydrated run context.
 * @param message - Optional conventional commit message; omitted only for plan mode.
 * @returns Ordered repository run plan.
 * @example
 * ```ts
 * import { buildYeetRunPlan } from "@beep/repo-cli/commands/Yeet"
 *
 * console.log(buildYeetRunPlan)
 * ```
 * @category planning
 * @since 0.0.0
 */
export const buildYeetRunPlan = (context: RepoRunContext, message: O.Option<string>): RepoRunPlan => {
  const commitMessage = O.getOrElse(message, () => "<required-conventional-commit-message>");
  const steps = [
    bunRunStep(
      context,
      "prepare:01-lint-fix",
      "prepare:lint:fix",
      "prepare",
      "lint:fix",
      ["--", "--affected"],
      "write",
      "repo"
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
      "feedback:01-build",
      "feedback:build",
      "feedback",
      "build",
      ["--", ...affectedFeedbackArgs],
      "readonly",
      "package",
      O.some("build")
    ),
    bunRunStep(
      context,
      "feedback:02-check",
      "feedback:check",
      "feedback",
      "check",
      ["--", ...affectedFeedbackArgs],
      "readonly",
      "package",
      O.some("check")
    ),
    bunRunStep(
      context,
      "feedback:03-lint",
      "feedback:lint",
      "feedback",
      "lint",
      ["--", ...affectedFeedbackArgs],
      "readonly",
      "package",
      O.some("lint")
    ),
    bunRunStep(
      context,
      "feedback:04-test",
      "feedback:test",
      "feedback",
      "test",
      ["--", ...affectedFeedbackArgs],
      "readonly",
      "package",
      O.some("test")
    ),
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
    gitStep(context, "publish:01-stage", "publish:git:add", ["add", "-A"]),
    gitStep(context, "publish:02-commit", "publish:git:commit", ["commit", "-m", commitMessage]),
    gitStep(context, "publish:03-push", "publish:git:push", ["push"]),
  ];

  return RepoRunPlan.make({
    context,
    steps: pipe(steps, A.sort(byRepoPlanStepAscending)),
  });
};

/**
 * Return plan phases in execution order.
 *
 * @param plan - Yeet run plan.
 * @returns Ordered unique phase names.
 * @category planning
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
