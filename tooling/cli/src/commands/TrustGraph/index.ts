/**
 * TrustGraph command suite.
 *
 * @module
 * @since 0.0.0
 */

import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { runTrustGraphContext, runTrustGraphStatus, runTrustGraphSyncCurated } from "./internal/TrustGraphRuntime.js";

const trustGraphContextPromptFlag = Flag.string("prompt").pipe(
  Flag.withDescription("Prompt to answer using TrustGraph graph RAG over the beep-effect collection")
);
const trustGraphResetFlag = Flag.boolean("reset").pipe(
  Flag.withDescription("Delete and reseed repo-managed TrustGraph data for the beep-effect collection before syncing")
);

const trustGraphStatusCommand = Command.make(
  "status",
  {},
  Effect.fn(function* () {
    yield* runTrustGraphStatus;
  })
).pipe(Command.withDescription("Inspect TrustGraph flow availability and beep-effect collection state"));

const trustGraphSyncCuratedCommand = Command.make(
  "sync-curated",
  {
    reset: trustGraphResetFlag,
  },
  Effect.fn(function* ({ reset }) {
    yield* runTrustGraphSyncCurated({ reset });
  })
).pipe(Command.withDescription("Sync the curated beep-effect documentation corpus into TrustGraph"));

const trustGraphContextCommand = Command.make(
  "context",
  {
    prompt: trustGraphContextPromptFlag,
  },
  Effect.fn(function* ({ prompt }) {
    yield* runTrustGraphContext(prompt);
  })
).pipe(Command.withDescription("Query TrustGraph for beep-effect repository context"));

/**
 * TrustGraph command group.
 *
 * @category UseCase
 * @since 0.0.0
 */
export const trustgraphCommand = Command.make(
  "trustgraph",
  {},
  Effect.fn(function* () {
    yield* Console.log("TrustGraph commands:");
    yield* Console.log("- bun run beep trustgraph status");
    yield* Console.log('- bun run beep trustgraph context --prompt "<text>"');
    yield* Console.log("- bun run beep trustgraph sync-curated");
    yield* Console.log("- bun run beep trustgraph sync-curated --reset");
  })
).pipe(
  Command.withDescription("TrustGraph knowledge-base commands for beep-effect"),
  Command.withSubcommands([trustGraphStatusCommand, trustGraphContextCommand, trustGraphSyncCuratedCommand])
);
