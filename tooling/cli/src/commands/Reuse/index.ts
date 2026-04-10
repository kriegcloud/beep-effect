/**
 * Reuse-discovery command suite.
 *
 * @module
 * @since 0.0.0
 */

import {
  type DomainError,
  type FsUtils,
  jsonStringifyPretty,
  type NoSuchFileError,
  type ReuseAnalysisError,
  type ReuseCandidateNotFoundError,
  ReuseDiscoveryService,
  ReuseFindResult,
  ReuseInventory,
  ReuseInventoryService,
  ReusePacket,
  ReusePartitionPlan,
  ReusePartitionPlannerService,
  ReuseServiceSuiteLive,
  type TSMorphService,
} from "@beep/repo-utils";
import { Console, Effect, Scope, type FileSystem, Layer, type Path } from "effect";
import * as S from "effect/Schema";
import { Command, Flag } from "effect/unstable/cli";
import { type CodexRunnerError, CodexSmokeResult, runCodexSmoke } from "./internal/CodexRunner.js";

const scopeFlag = Flag.string("scope").pipe(
  Flag.withDescription("Limit analysis to one or more package or path selectors separated by commas"),
  Flag.optional
);
const jsonFlag = Flag.boolean("json").pipe(Flag.withDescription("Emit machine-readable JSON output"));
const fileFlag = Flag.string("file").pipe(Flag.withDescription("Repo-relative file path to inspect for local reuse"));
const queryFlag = Flag.string("query").pipe(
  Flag.withDescription("Optional free-text query used to rank likely reuse matches"),
  Flag.optional
);
const symbolIdFlag = Flag.string("symbol-id").pipe(
  Flag.withDescription("Optional TSMorph symbol id used to anchor a precise reuse lookup"),
  Flag.optional
);
const candidateIdFlag = Flag.string("candidate-id").pipe(
  Flag.withDescription("Candidate id from `beep reuse inventory --json`")
);

const printJson = Effect.fn(function* (value: unknown) {
  const rendered = yield* jsonStringifyPretty(value);
  yield* Console.log(rendered);
});

const reuseServiceSuiteScope = Scope.makeUnsafe();
const buildReuseServiceSuiteContext = Effect.cached(Layer.buildWithScope(ReuseServiceSuiteLive, reuseServiceSuiteScope));

type ReuseProgramError = DomainError | NoSuchFileError | ReuseAnalysisError | ReuseCandidateNotFoundError;

type ReuseProgramDependencies =
  | FileSystem.FileSystem
  | FsUtils
  | Path.Path
  | ReuseDiscoveryService
  | ReuseInventoryService
  | ReusePartitionPlannerService
  | TSMorphService;

type ReuseRuntimeContext = FileSystem.FileSystem | FsUtils | Path.Path | TSMorphService;

const provideReuseServices = <A>(effect: Effect.Effect<A, ReuseProgramError, ReuseProgramDependencies>) =>
  Effect.scoped(
    buildReuseServiceSuiteContext.pipe(
      Effect.flatMap((buildContext) =>
        buildContext.pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context))))
      )
    )
  );

const runReuseProgram = <A>(
  effect: Effect.Effect<A, ReuseProgramError, ReuseProgramDependencies>
): Effect.Effect<void, never, ReuseRuntimeContext> =>
  provideReuseServices(effect).pipe(
    Effect.catchTags({
      DomainError: Effect.fn(function* (error) {
        process.exitCode = 1;
        yield* Console.error(`[reuse] ${error.message}`);
      }),
      ReuseAnalysisError: Effect.fn(function* (error) {
        process.exitCode = 1;
        yield* Console.error(`[reuse] ${error.operation}: ${error.message}`);
      }),
      ReuseCandidateNotFoundError: Effect.fn(function* (error) {
        process.exitCode = 1;
        yield* Console.error(
          `[reuse] candidate ${error.candidateId} was not present in inventory scope ${error.scopeSelector}`
        );
      }),
      NoSuchFileError: Effect.fn(function* (error) {
        process.exitCode = 1;
        yield* Console.error(`[reuse] missing file while preparing analysis context: ${error.path}`);
      }),
    }),
    Effect.asVoid
  );

const runCodexSmokeProgram = <A>(
  effect: Effect.Effect<A, CodexRunnerError | DomainError, FileSystem.FileSystem>
): Effect.Effect<void, never, FileSystem.FileSystem> =>
  effect.pipe(
    Effect.catchTags({
      CodexRunnerError: Effect.fn(function* (error) {
        process.exitCode = 1;
        yield* Console.error(`[reuse] codex-smoke failed during ${error.stage}: ${error.message}`);
      }),
      DomainError: Effect.fn(function* (error) {
        process.exitCode = 1;
        yield* Console.error(`[reuse] ${error.message}`);
      }),
    }),
    Effect.asVoid
  );

const printPartitionPlan = Effect.fn(function* (plan: ReusePartitionPlan) {
  yield* Console.log(`Scope: ${plan.scopeSelector}`);
  yield* Console.log(`Catalog entries: ${plan.catalogEntryCount}`);
  yield* Console.log(`Scout work units: ${plan.scoutUnits.length}`);
  for (const unit of plan.scoutUnits) {
    yield* Console.log(`- ${unit.id} :: ${unit.scopeSelector}`);
  }
  yield* Console.log(`Specialist work units: ${plan.specialistUnits.length}`);
  for (const unit of plan.specialistUnits) {
    yield* Console.log(`- ${unit.id} :: ${unit.scopeSelector}`);
  }
});

const printInventory = Effect.fn(function* (inventory: ReuseInventory) {
  yield* Console.log(`Scope: ${inventory.scopeSelector}`);
  yield* Console.log(`Catalog entries: ${inventory.catalogEntryCount}`);
  yield* Console.log(`Candidates: ${inventory.candidateCount}`);
  for (const candidate of inventory.candidates) {
    yield* Console.log(`- ${candidate.candidateId} (${candidate.kind}, confidence=${candidate.confidence.toFixed(2)})`);
    yield* Console.log(`  title: ${candidate.title}`);
    yield* Console.log(
      `  destination: ${candidate.proposedDestinationPackage} -> ${candidate.proposedDestinationModule}`
    );
  }
});

const printFindResult = Effect.fn(function* (result: ReuseFindResult) {
  yield* Console.log(`File: ${result.filePath}`);
  yield* Console.log(`Catalog matches: ${result.matches.length}`);
  for (const match of result.matches) {
    yield* Console.log(`- ${match.id} :: ${match.packageName} :: ${match.symbolName} (${match.modulePath})`);
  }
  yield* Console.log(`Local candidate suggestions: ${result.candidateSuggestions.length}`);
  for (const candidate of result.candidateSuggestions) {
    yield* Console.log(`- ${candidate.candidateId} (${candidate.confidence.toFixed(2)}) :: ${candidate.title}`);
  }
});

const printPacket = Effect.fn(function* (packet: ReusePacket) {
  const candidate = packet.candidate;
  yield* Console.log(`Candidate: ${candidate.candidateId}`);
  yield* Console.log(`Kind: ${candidate.kind}`);
  yield* Console.log(`Confidence: ${candidate.confidence.toFixed(2)}`);
  yield* Console.log(`Destination: ${candidate.proposedDestinationPackage} -> ${candidate.proposedDestinationModule}`);
  yield* Console.log("Implementation steps:");
  for (const step of candidate.implementationSteps) {
    yield* Console.log(`- ${step}`);
  }
  yield* Console.log("Verification:");
  for (const command of candidate.verificationCommands) {
    yield* Console.log(`- ${command}`);
  }
  yield* Console.log(`Catalog matches: ${packet.catalogMatches.length}`);
  for (const match of packet.catalogMatches) {
    yield* Console.log(`- ${match.id} :: ${match.packageName} :: ${match.symbolName}`);
  }
});

const reusePartitionsCommand = Command.make(
  "partitions",
  {
    scope: scopeFlag,
    json: jsonFlag,
  },
  ({ scope, json }) =>
    runReuseProgram(
      Effect.gen(function* () {
        const planner = yield* ReusePartitionPlannerService;
        const plan = yield* planner.buildPartitions(scope);

        if (json) {
          yield* printJson(S.encodeSync(ReusePartitionPlan)(plan));
          return;
        }

        yield* printPartitionPlan(plan);
      })
    )
).pipe(Command.withDescription("Emit scout and specialist work partitions for reuse analysis"));

const reuseFindCommand = Command.make(
  "find",
  {
    file: fileFlag,
    query: queryFlag,
    symbolId: symbolIdFlag,
    json: jsonFlag,
  },
  ({ file, query, symbolId, json }) =>
    runReuseProgram(
      Effect.gen(function* () {
        const discovery = yield* ReuseDiscoveryService;
        const result = yield* discovery.findReuseOptions({
          filePath: file,
          query,
          symbolId,
        });

        if (json) {
          yield* printJson(S.encodeSync(ReuseFindResult)(result));
          return;
        }

        yield* printFindResult(result);
      })
    )
).pipe(Command.withDescription("Find likely reuse matches and extraction suggestions for one file or symbol"));

const reuseInventoryCommand = Command.make(
  "inventory",
  {
    scope: scopeFlag,
    json: jsonFlag,
  },
  ({ scope, json }) =>
    runReuseProgram(
      Effect.gen(function* () {
        const inventoryService = yield* ReuseInventoryService;
        const inventory = yield* inventoryService.buildInventory(scope);

        if (json) {
          yield* printJson(S.encodeSync(ReuseInventory)(inventory));
          return;
        }

        yield* printInventory(inventory);
      })
    )
).pipe(Command.withDescription("Build a ranked reuse inventory for the selected scope"));

const reusePacketCommand = Command.make(
  "packet",
  {
    candidateId: candidateIdFlag,
    scope: scopeFlag,
    json: jsonFlag,
  },
  ({ candidateId, scope, json }) =>
    runReuseProgram(
      Effect.gen(function* () {
        const inventoryService = yield* ReuseInventoryService;
        const packet = yield* inventoryService.buildPacket(candidateId, scope);

        if (json) {
          yield* printJson(S.encodeSync(ReusePacket)(packet));
          return;
        }

        yield* printPacket(packet);
      })
    )
).pipe(Command.withDescription("Materialize a structured implementation packet for one reuse candidate"));

const reuseCodexSmokeCommand = Command.make(
  "codex-smoke",
  {
    json: jsonFlag,
  },
  ({ json }) =>
    runCodexSmokeProgram(
      Effect.gen(function* () {
        const result = yield* runCodexSmoke;

        if (json) {
          yield* printJson(S.encodeSync(CodexSmokeResult)(result));
          return;
        }

        yield* Console.log(`SDK: ${result.sdkPackage}`);
        yield* Console.log(`Working directory: ${result.workingDirectory}`);
        yield* Console.log(`Thread created: ${result.threadCreated}`);
        yield* Console.log(`thread.run available: ${result.threadRunMethodAvailable}`);
        yield* Console.log(result.note);
      })
    )
).pipe(Command.withDescription("Validate the Codex SDK adapter and thread startup path without running a loop"));

const printReuseIndex = Effect.fn(function* () {
  yield* Console.log("Reuse commands:");
  yield* Console.log("- bun run beep reuse partitions --scope tooling/cli,tooling/repo-utils --json");
  yield* Console.log("- bun run beep reuse inventory --scope tooling/cli,tooling/repo-utils --json");
  yield* Console.log("- bun run beep reuse find --file tooling/cli/src/commands/Docgen/index.ts --query json --json");
  yield* Console.log("- bun run beep reuse packet --candidate-id reuse-pattern:schema-json-encode-sync --json");
  yield* Console.log("- bun run beep reuse codex-smoke --json");
});

/**
 * Reuse-discovery command group.
 *
 * @category UseCase
 * @since 0.0.0
 */
export const reuseCommand = Command.make("reuse", {}, printReuseIndex).pipe(
  Command.withDescription("Discover high-confidence reuse candidates and future agent work partitions"),
  Command.withSubcommands([
    reusePartitionsCommand,
    reuseFindCommand,
    reuseInventoryCommand,
    reusePacketCommand,
    reuseCodexSmokeCommand,
  ])
);
