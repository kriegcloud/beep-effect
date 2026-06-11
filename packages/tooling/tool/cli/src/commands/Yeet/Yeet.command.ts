/**
 * Yeet quality feedback and commit/push command.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Argument, Command, Flag } from "effect/unstable/cli";
import {
  runYeetFallowFeedback,
  runYeetFallowFixtureCheck,
  runYeetPlanContractCheck,
} from "./internal/FallowFeedback.js";
import { runYeet, YeetRunOptions } from "./internal/Handler.js";
import { DEFAULT_YEET_PACKET_DIR } from "./internal/Planner.js";
import type { YeetProofTier, YeetRunMode } from "./internal/Planner.js";

const baseFlag = Flag.string("base").pipe(
  Flag.withDescription("Base ref for affected feedback planning"),
  Flag.withDefault("origin/main")
);

const headFlag = Flag.string("head").pipe(
  Flag.withDescription("Head ref for affected feedback planning"),
  Flag.withDefault("HEAD")
);

const jsonFlag = Flag.boolean("json").pipe(Flag.withDescription("Render plan output as JSON"));

const packetDirFlag = Flag.string("packet-dir").pipe(
  Flag.withDescription("Ignored directory for yeet run context, logs, and packets"),
  Flag.withDefault(DEFAULT_YEET_PACKET_DIR)
);

const planFlag = Flag.boolean("plan").pipe(Flag.withDescription("Print the yeet plan without running commands"));

const messageFlag = Flag.string("message").pipe(
  Flag.withDescription("Conventional commit message required before publish"),
  Flag.withDefault("")
);

const fastFlag = Flag.boolean("fast").pipe(
  Flag.withDescription("Skip local full pre-push proof only when paired with --monitor on a PR branch")
);

const startPrEarlyFlag = Flag.boolean("start-pr-early").pipe(
  Flag.withDescription("Push with hooks skipped before full local proof, then run proof and monitor hosted checks")
);

const monitorFlag = Flag.boolean("monitor").pipe(
  Flag.withDescription("Monitor hosted PR checks after publish instead of stopping at push")
);

const tierFlag = Flag.choiceWithValue("tier", [
  ["full", "full"],
  ["review-fix", "review-fix"],
]).pipe(
  Flag.withDescription("Local proof tier for verify; publish always uses full"),
  Flag.withDefault("full" as const)
);

const amendFlag = Flag.boolean("amend").pipe(Flag.withDescription("Amend the current local commit during publish"));

const stagedOnlyFlag = Flag.boolean("staged-only").pipe(
  Flag.withDescription(
    "Publish exactly the staged index: stash unstaged/untracked residue after commit, prove the clean tree, restore after push"
  )
);

const allowStaleBaseFlag = Flag.boolean("allow-stale-base").pipe(
  Flag.withDescription(
    "Proceed with publish even when branch files overlap commits landed on the base since merge-base"
  )
);

const prFlag = Flag.boolean("pr").pipe(
  Flag.withDescription("Create a ready (non-draft) pull request after the push succeeds, unless one is already open")
);

const noEditFlag = Flag.boolean("no-edit").pipe(
  Flag.withDescription("Reuse the current commit message with --amend during publish")
);

const reuseVerifiedFlag = Flag.boolean("reuse-verified").pipe(
  Flag.withDescription("Skip publish proof only when durable Yeet full-proof state exactly matches")
);

const pushOnlyFlag = Flag.boolean("push-only").pipe(
  Flag.withDescription("Push an already-verified clean commit without committing or rerunning local proof")
);

const botsFlag = Flag.string("bots").pipe(
  Flag.withDescription("Comma-separated PR review bots to classify during closeout"),
  Flag.withDefault("greptile,coderabbit,chatgpt")
);

const requireGreptileScoreFlag = Flag.string("require-greptile-score").pipe(
  Flag.withDescription("Required Greptile score, for example 5/5; empty disables the gate"),
  Flag.withDefault("")
);

const requireGreptileIssuesFlag = Flag.integer("require-greptile-issues").pipe(
  Flag.withDescription("Required Greptile open issue count; negative disables the gate"),
  Flag.withDefault(-1)
);

const requireReviewCommentsFlag = Flag.integer("require-review-comments").pipe(
  Flag.withDescription("Required unresolved actionable PR review comment count; negative disables the gate"),
  Flag.withDefault(-1)
);

const replyThreadFlag = Flag.string("reply-thread").pipe(
  Flag.withDescription("Review thread id to reply to during closeout; requires --reply-body"),
  Flag.withDefault("")
);

const replyBodyFlag = Flag.string("reply-body").pipe(
  Flag.withDescription("Reply body posted to --reply-thread during closeout"),
  Flag.withDefault("")
);

const resolveThreadsFlag = Flag.string("resolve-threads").pipe(
  Flag.withDescription("Comma-separated review thread ids to resolve during closeout"),
  Flag.withDefault("")
);

const retriggerGreptileFlag = Flag.boolean("retrigger-greptile").pipe(
  Flag.withDescription("Post the explicit Greptile retrigger comment after reading current PR state")
);

const fallowFromFlag = Flag.string("from").pipe(
  Flag.withDescription("Directory containing Fallow advisory envelopes"),
  Flag.withDefault(".beep/fallow")
);

const fallowEmitFlag = Flag.string("emit").pipe(
  Flag.withDescription("QualityIssueIndex output path for Fallow advisory feedback"),
  Flag.withDefault(".beep/yeet/fallow-quality-issues.json")
);

const fallowAdvisoryFlag = Flag.boolean("advisory").pipe(
  Flag.withDescription("Keep every Fallow-derived Yeet issue nonblocking")
);

const fallowAssertFlag = Flag.string("assert").pipe(
  Flag.withDescription("Comma-separated fixture assertions to enforce"),
  Flag.withDefault("")
);

const fromStdinFlag = Flag.boolean("from-stdin").pipe(
  Flag.withDescription("Read a Yeet plan JSON document from stdin")
);

const expectStepIdFlag = Flag.string("expect-step-id").pipe(
  Flag.withDescription("Required plan step id"),
  Flag.withDefault("")
);

const expectStepLabelFlag = Flag.string("expect-step-label").pipe(
  Flag.withDescription("Required plan step label"),
  Flag.withDefault("")
);

const expectCommandFlag = Flag.string("expect-command").pipe(
  Flag.withDescription("Required plan step command"),
  Flag.withDefault("")
);

const expectArgsFlag = Flag.string("expect-args").pipe(
  Flag.withDescription("Required plan step args rendered as a space-separated string"),
  Flag.withDefault("")
);

const sharedFlags = {
  base: baseFlag,
  head: headFlag,
  json: jsonFlag,
  packetDir: packetDirFlag,
  plan: planFlag,
  tier: tierFlag,
} as const;

const publishFlags = {
  ...sharedFlags,
  allowStaleBase: allowStaleBaseFlag,
  amend: amendFlag,
  fast: fastFlag,
  message: messageFlag,
  monitor: monitorFlag,
  noEdit: noEditFlag,
  pr: prFlag,
  pushOnly: pushOnlyFlag,
  reuseVerified: reuseVerifiedFlag,
  stagedOnly: stagedOnlyFlag,
  startPrEarly: startPrEarlyFlag,
} as const;

const closeoutFlags = {
  ...sharedFlags,
  bots: botsFlag,
  replyBody: replyBodyFlag,
  replyThread: replyThreadFlag,
  requireGreptileIssues: requireGreptileIssuesFlag,
  requireGreptileScore: requireGreptileScoreFlag,
  requireReviewComments: requireReviewCommentsFlag,
  resolveThreads: resolveThreadsFlag,
  retriggerGreptile: retriggerGreptileFlag,
} as const;

type SharedOptions = {
  readonly allowStaleBase?: boolean;
  readonly amend?: boolean;
  readonly base: string;
  readonly bots?: string;
  readonly fast?: boolean;
  readonly head: string;
  readonly json: boolean;
  readonly packetDir: string;
  readonly plan: boolean;
  readonly monitor?: boolean;
  readonly noEdit?: boolean;
  readonly pr?: boolean;
  readonly pushOnly?: boolean;
  readonly replyBody?: string;
  readonly replyThread?: string;
  readonly requireGreptileIssues?: number;
  readonly requireGreptileScore?: string;
  readonly requireReviewComments?: number;
  readonly resolveThreads?: string;
  readonly retriggerGreptile?: boolean;
  readonly reuseVerified?: boolean;
  readonly stagedOnly?: boolean;
  readonly startPrEarly?: boolean;
  readonly tier?: YeetProofTier;
};

const runYeetMode = (mode: YeetRunMode, options: SharedOptions & { readonly message?: string }) =>
  runYeet(
    YeetRunOptions.make({
      ...options,
      allowStaleBase: options.allowStaleBase ?? false,
      amend: options.amend ?? false,
      bots: options.bots ?? "greptile,coderabbit,chatgpt",
      fast: options.fast ?? false,
      message: options.message ?? "",
      mode,
      monitor: options.monitor ?? false,
      noEdit: options.noEdit ?? false,
      pr: options.pr ?? false,
      pushOnly: options.pushOnly ?? false,
      replyBody: options.replyBody ?? "",
      replyThread: options.replyThread ?? "",
      requireGreptileIssues: options.requireGreptileIssues ?? -1,
      requireGreptileScore: options.requireGreptileScore ?? "",
      requireReviewComments: options.requireReviewComments ?? -1,
      resolveThreads: options.resolveThreads ?? "",
      retriggerGreptile: options.retriggerGreptile ?? false,
      reuseVerified: options.reuseVerified ?? false,
      stagedOnly: options.stagedOnly ?? false,
      startPrEarly: options.startPrEarly ?? false,
      tier: options.tier ?? "full",
    })
  );

const yeetVerifyCommand = Command.make("verify", sharedFlags, (options) => runYeetMode("verify", options)).pipe(
  Command.withDescription("Run the canonical pre-push proof without duplicate affected feedback")
);

const yeetRepairCommand = Command.make("repair", sharedFlags, (options) => runYeetMode("repair", options)).pipe(
  Command.withDescription("Run deterministic fixers and artifact generators, then affected feedback")
);

const yeetPublishCommand = Command.make("publish", publishFlags, (options) => runYeetMode("publish", options)).pipe(
  Command.withDescription("Commit reviewed staged changes, prove the commit, then push")
);

const yeetMonitorCommand = Command.make("monitor", sharedFlags, (options) => runYeetMode("monitor", options)).pipe(
  Command.withDescription("Monitor hosted PR checks for the current branch")
);

const yeetCloseoutCommand = Command.make("closeout", closeoutFlags, (options) => runYeetMode("closeout", options)).pipe(
  Command.withDescription("Inspect PR review threads and bot gates for merge closeout")
);

const yeetPrePushHookCommand = Command.make("pre-push-hook", sharedFlags, (options) =>
  runYeetMode("pre-push-hook", options)
).pipe(Command.withDescription("Reuse exact Yeet full-proof state for git pre-push hooks when safe"));

const yeetFallowFeedbackCommand = Command.make(
  "fallow-feedback",
  {
    advisory: fallowAdvisoryFlag,
    emit: fallowEmitFlag,
    from: fallowFromFlag,
  },
  ({ advisory, emit, from }) => runYeetFallowFeedback({ advisory, emit, from })
).pipe(Command.withDescription("Convert Fallow advisory envelopes into a Yeet QualityIssueIndex"));

const yeetFallowFixtureCheckCommand = Command.make(
  "fallow-fixture-check",
  {
    assert: fallowAssertFlag,
    emit: fallowEmitFlag,
    fixturePath: Argument.string("fixture-path").pipe(
      Argument.withDescription("Fallow report-envelope fixture document")
    ),
  },
  ({ assert, emit, fixturePath }) => runYeetFallowFixtureCheck({ assertions: assert, emit, fixturePath })
).pipe(Command.withDescription("Verify Fallow envelope fixtures map into Yeet quality issues"));

const yeetPlanContractCheckCommand = Command.make(
  "plan-contract-check",
  {
    expectArgs: expectArgsFlag,
    expectCommand: expectCommandFlag,
    expectStepId: expectStepIdFlag,
    expectStepLabel: expectStepLabelFlag,
    fromStdin: fromStdinFlag,
  },
  ({ expectArgs, expectCommand, expectStepId, expectStepLabel, fromStdin }) =>
    runYeetPlanContractCheck({ expectArgs, expectCommand, expectStepId, expectStepLabel, fromStdin })
).pipe(Command.withDescription("Assert a Yeet plan contains an exact named step"));

/**
 * Command that repairs, verifies, or publishes repository work through Yeet.
 *
 * @example
 * ```ts
 * import { yeetCommand } from "@beep/repo-cli/commands/Yeet"
 *
 * console.log(yeetCommand)
 * ```
 * @category cli-commands
 * @since 0.0.0
 */
export const yeetCommand = Command.make("yeet", publishFlags, (options) => runYeetMode("publish", options)).pipe(
  Command.withDescription("Repair, verify, or publish repository work with canonical quality proof"),
  Command.withSubcommands([
    yeetVerifyCommand,
    yeetRepairCommand,
    yeetPublishCommand,
    yeetMonitorCommand,
    yeetCloseoutCommand,
    yeetPrePushHookCommand,
    yeetFallowFeedbackCommand,
    yeetFallowFixtureCheckCommand,
    yeetPlanContractCheckCommand,
  ])
);
