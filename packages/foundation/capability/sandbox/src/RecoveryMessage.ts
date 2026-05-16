/**
 * Sync-out recovery message helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { A, O } from "@beep/utils";
import { pipe } from "effect";
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
    A.appendInPlace(steps, {
      has: true,
      key: "commits",
      label: "committed changes",
    });
  }
  if (input.hasDiff) {
    A.appendInPlace(steps, {
      has: true,
      key: "diff",
      label: "uncommitted changes",
    });
  }
  if (input.hasUntracked) {
    A.appendInPlace(steps, {
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
      A.appendInPlace(commands, commandForStep(patchDir, step.key));
    }
  }

  return commands;
};

const formatCommandBlock = (commands: ReadonlyArray<string>): string =>
  commands.length === 1
    ? `  ${commands[0]}`
    : A.join(
        A.map(commands, (command, index) => (index < commands.length - 1 ? `  ${command} && \\` : `  ${command}`)),
        "\n"
      );

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
  const failedIndex = pipe(
    steps,
    A.findFirstIndex((step) => step.key === input.failedStep),
    O.getOrElse(() => -1)
  );
  const failedStepInfo = steps[failedIndex];
  const lines: Array<string> = [];

  if (failedStepInfo === undefined) {
    return `Patch application failed at unknown step (${input.failedStep}).`;
  }

  A.appendInPlace(lines, `Patch application failed at step ${failedIndex + 1} (${failedStepInfo.label}).`);
  A.appendInPlace(lines, "");

  if (input.branch !== undefined) {
    A.appendInPlace(lines, "Set up worktree, then resolve:");
    A.appendInPlace(
      lines,
      formatCommandBlock([`git worktree add .sandcastle/worktree ${input.branch}`, "cd .sandcastle/worktree"])
    );
    A.appendInPlace(lines, "");
  }

  if (input.failedStep === "commits") {
    A.appendInPlace(lines, "Resolve conflicts, then continue with:");
    A.appendInPlace(lines, "  git am --continue");

    const remaining = buildRemainingCommands(cmdPatchDir, A.slice(steps, failedIndex + 1));
    if (remaining.length > 0) {
      A.appendInPlace(lines, "");
      A.appendInPlace(lines, "After all commits are applied, run the remaining steps:");
      A.appendInPlace(lines, formatCommandBlock(remaining));
    }
  } else {
    const remaining = buildRemainingCommands(cmdPatchDir, A.slice(steps, failedIndex));
    if (remaining.length > 0) {
      A.appendInPlace(lines, "Run the remaining steps:");
      A.appendInPlace(lines, formatCommandBlock(remaining));
    }
  }

  return A.join(lines, "\n");
};
