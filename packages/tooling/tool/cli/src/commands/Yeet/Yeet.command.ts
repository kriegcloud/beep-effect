/**
 * Yeet quality feedback and commit/push command.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Command, Flag } from "effect/unstable/cli";
import { runYeet, YeetRunOptions } from "./internal/Handler.js";
import { DEFAULT_YEET_PACKET_DIR } from "./internal/Planner.js";
import type { YeetRunMode } from "./internal/Planner.js";

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

const monitorFlag = Flag.boolean("monitor").pipe(
  Flag.withDescription("Monitor hosted PR checks after publish instead of stopping at push")
);

const sharedFlags = {
  base: baseFlag,
  head: headFlag,
  json: jsonFlag,
  packetDir: packetDirFlag,
  plan: planFlag,
} as const;

const publishFlags = {
  ...sharedFlags,
  fast: fastFlag,
  message: messageFlag,
  monitor: monitorFlag,
} as const;

type SharedOptions = {
  readonly base: string;
  readonly fast?: boolean;
  readonly head: string;
  readonly json: boolean;
  readonly packetDir: string;
  readonly plan: boolean;
  readonly monitor?: boolean;
};

const runYeetMode = (mode: YeetRunMode, options: SharedOptions & { readonly message?: string }) =>
  runYeet(
    YeetRunOptions.make({
      ...options,
      fast: options.fast ?? false,
      message: options.message ?? "",
      mode,
      monitor: options.monitor ?? false,
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
  Command.withSubcommands([yeetVerifyCommand, yeetRepairCommand, yeetPublishCommand, yeetMonitorCommand])
);
