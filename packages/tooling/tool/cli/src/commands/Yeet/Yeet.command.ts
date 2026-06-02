/**
 * Yeet quality feedback and commit/push command.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Command, Flag } from "effect/unstable/cli";
import { runYeet, YeetRunOptions } from "./internal/Handler.js";
import { DEFAULT_YEET_PACKET_DIR } from "./internal/Planner.js";

/**
 * Command that runs fast quality feedback, canonical full proof, then commits and pushes reviewed staged changes.
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
export const yeetCommand = Command.make(
  "yeet",
  {
    base: Flag.string("base").pipe(
      Flag.withDescription("Base ref for affected feedback planning"),
      Flag.withDefault("origin/main")
    ),
    head: Flag.string("head").pipe(
      Flag.withDescription("Head ref for affected feedback planning"),
      Flag.withDefault("HEAD")
    ),
    json: Flag.boolean("json").pipe(Flag.withDescription("Render plan output as JSON")),
    message: Flag.string("message").pipe(
      Flag.withDescription("Conventional commit message required before publish"),
      Flag.withDefault("")
    ),
    packetDir: Flag.string("packet-dir").pipe(
      Flag.withDescription("Ignored directory for yeet run context, logs, and packets"),
      Flag.withDefault(DEFAULT_YEET_PACKET_DIR)
    ),
    plan: Flag.boolean("plan").pipe(
      Flag.withDescription("Print the yeet plan without running quality or git commands")
    ),
  },
  (options) => runYeet(YeetRunOptions.make(options))
).pipe(Command.withDescription("Run repo quality feedback, full proof, then commit and push reviewed staged changes"));
