/**
 * Sync-out recovery message helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as A from "effect/Array";
import * as S from "effect/Schema";

const $I = $SandboxId.create("RecoveryMessage");

/**
 * Sync-out step that failed during patch application.
 *
 * @example
 * ```ts
 * import { FailedStep } from "@beep/sandbox"
 *
 * const step: FailedStep = "diff"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const FailedStep = LiteralKit(["commits", "diff", "untracked"]).annotate(
  $I.annote("FailedStep", {
    description: "Sync-out step that failed during patch application.",
  })
);

/**
 * Runtime type for {@link FailedStep}.
 *
 * @category models
 * @since 0.0.0
 */
export type FailedStep = typeof FailedStep.Type;

/**
 * Recovery message inputs for a failed sync-out patch application.
 *
 * @example
 * ```ts
 * import { RecoveryInput } from "@beep/sandbox"
 *
 * const input = new RecoveryInput({
 *   failedStep: "diff",
 *   hasCommits: true,
 *   hasDiff: true,
 *   hasUntracked: false,
 *   patchDir: ".sandcastle/patches/20260324-153000",
 * })
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RecoveryInput extends S.Class<RecoveryInput>($I`RecoveryInput`)(
  {
    branch: S.optionalKey(S.String),
    failedStep: FailedStep,
    hasCommits: S.Boolean,
    hasDiff: S.Boolean,
    hasUntracked: S.Boolean,
    patchDir: S.String,
  },
  $I.annote("RecoveryInput", {
    description: "Recovery message inputs for a failed sync-out patch application.",
  })
) {}

interface RecoveryStep {
  readonly has: boolean;
  readonly key: FailedStep;
  readonly label: string;
}

const commandForStep = (patchDir: string, step: FailedStep): string => {
  return FailedStep.$match(step, {
    commits: () => `git am --3way ${patchDir}/*.patch`,
    diff: () => `git apply ${patchDir}/changes.patch`,
    untracked: () => `cp -r ${patchDir}/untracked/* .`,
  });
};

const buildSteps = (input: RecoveryInput): ReadonlyArray<RecoveryStep> => {
  const steps = A.empty<RecoveryStep>();

  if (input.hasCommits) {
    steps.push({
      has: true,
      key: "commits",
      label: "committed changes",
    });
  }
  if (input.hasDiff) {
    steps.push({
      has: true,
      key: "diff",
      label: "uncommitted changes",
    });
  }
  if (input.hasUntracked) {
    steps.push({
      has: true,
      key: "untracked",
      label: "untracked files",
    });
  }

  return steps;
};

const buildRemainingCommands = (patchDir: string, steps: ReadonlyArray<RecoveryStep>): ReadonlyArray<string> => {
  const commands: Array<string> = [];

  for (const step of steps) {
    if (step.has) {
      commands.push(commandForStep(patchDir, step.key));
    }
  }

  return commands;
};

const formatCommandBlock = (commands: ReadonlyArray<string>): string =>
  commands.length === 1
    ? `  ${commands[0]}`
    : commands
        .map((command, index) => (index < commands.length - 1 ? `  ${command} && \\` : `  ${command}`))
        .join("\n");

/**
 * Build copy-pastable recovery commands for a failed sync-out.
 *
 * @example
 * ```ts
 * import { buildRecoveryMessage, RecoveryInput } from "@beep/sandbox"
 *
 * const message = buildRecoveryMessage(new RecoveryInput({
 *   failedStep: "commits",
 *   hasCommits: true,
 *   hasDiff: true,
 *   hasUntracked: false,
 *   patchDir: ".sandcastle/patches/20260324-153000",
 * }))
 *
 * console.log(message)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const buildRecoveryMessage = (input: RecoveryInput): string => {
  const cmdPatchDir = input.branch === undefined ? input.patchDir : `../../${input.patchDir}`;
  const steps = buildSteps(input);
  const failedIndex = steps.findIndex((step) => step.key === input.failedStep);
  const failedStepInfo = steps[failedIndex];
  const lines: Array<string> = [];

  if (failedStepInfo === undefined) {
    return `Patch application failed at unknown step (${input.failedStep}).`;
  }

  lines.push(`Patch application failed at step ${failedIndex + 1} (${failedStepInfo.label}).`);
  lines.push("");

  if (input.branch !== undefined) {
    lines.push("Set up worktree, then resolve:");
    lines.push(
      formatCommandBlock([`git worktree add .sandcastle/worktree ${input.branch}`, "cd .sandcastle/worktree"])
    );
    lines.push("");
  }

  if (input.failedStep === "commits") {
    lines.push("Resolve conflicts, then continue with:");
    lines.push("  git am --continue");

    const remaining = buildRemainingCommands(cmdPatchDir, steps.slice(failedIndex + 1));
    if (remaining.length > 0) {
      lines.push("");
      lines.push("After all commits are applied, run the remaining steps:");
      lines.push(formatCommandBlock(remaining));
    }
  } else {
    const remaining = buildRemainingCommands(cmdPatchDir, steps.slice(failedIndex));
    if (remaining.length > 0) {
      lines.push("Run the remaining steps:");
      lines.push(formatCommandBlock(remaining));
    }
  }

  return lines.join("\n");
};
