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
import { Console, Effect, type FileSystem, Layer, type Path } from "effect";
import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
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

const printEncodedJson = Effect.fnUntraced(function* (value: unknown) {
  return yield* printJson(value);
});

const printSelectedOutput = <EJson, RJson, EHuman, RHuman>(
  json: boolean,
  jsonOutput: Effect.Effect<void, EJson, RJson>,
  humanOutput: Effect.Effect<void, EHuman, RHuman>
): Effect.Effect<void, EJson | EHuman, RJson | RHuman> =>
  Bool.match(json, {
    onFalse: () => humanOutput,
    onTrue: () => jsonOutput,
  });

type ReuseProgramError =
  | DomainError
  | NoSuchFileError
  | ReuseAnalysisError
  | ReuseCandidateNotFoundError
  | S.SchemaError;

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
    Layer.build(ReuseServiceSuiteLive).pipe(
      Effect.flatMap(
        Effect.fnUntraced(function* (context) {
          return yield* effect.pipe(Effect.provide(context));
        })
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
      SchemaError: Effect.fn(function* (error) {
        process.exitCode = 1;
        yield* Console.error(`[reuse] ${String(error)}`);
      }),
    }),
    Effect.asVoid
  );

const runCodexSmokeProgram = <A>(
  effect: Effect.Effect<A, CodexRunnerError | DomainError | S.SchemaError, FileSystem.FileSystem>
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
      SchemaError: Effect.fn(function* (error) {
        process.exitCode = 1;
        yield* Console.error(`[reuse] ${String(error)}`);
      }),
    }),
    Effect.asVoid
  );

const printPartitionPlan = Effect.fn(function* (plan: ReusePartitionPlan) {
  yield* Console.log(`Scope: ${plan.scopeSelector}`);
  yield* Console.log(`Catalog entries: ${plan.catalogEntryCount}`);
  yield* Console.log(`Scout work units: ${A.length(plan.scoutUnits)}`);
  yield* Effect.forEach(plan.scoutUnits, (unit) => Console.log(`- ${unit.id} :: ${unit.scopeSelector}`), {
    concurrency: 1,
    discard: true,
  });
  yield* Console.log(`Specialist work units: ${A.length(plan.specialistUnits)}`);
  yield* Effect.forEach(plan.specialistUnits, (unit) => Console.log(`- ${unit.id} :: ${unit.scopeSelector}`), {
    concurrency: 1,
    discard: true,
  });
});

const printInventory = Effect.fn(function* (inventory: ReuseInventory) {
  yield* Console.log(`Scope: ${inventory.scopeSelector}`);
  yield* Console.log(`Catalog entries: ${inventory.catalogEntryCount}`);
  yield* Console.log(`Candidates: ${inventory.candidateCount}`);
  yield* Effect.forEach(
    inventory.candidates,
    Effect.fn(function* (candidate) {
      yield* Console.log(
        `- ${candidate.candidateId} (${candidate.kind}, confidence=${candidate.confidence.toFixed(2)})`
      );
      yield* Console.log(`  title: ${candidate.title}`);
      yield* Console.log(
        `  destination: ${candidate.proposedDestinationPackage} -> ${candidate.proposedDestinationModule}`
      );
    }),
    { concurrency: 1, discard: true }
  );
});

const printFindResult = Effect.fn(function* (result: ReuseFindResult) {
  yield* Console.log(`File: ${result.filePath}`);
  yield* Console.log(`Catalog matches: ${A.length(result.matches)}`);
  yield* Effect.forEach(
    result.matches,
    (match) => Console.log(`- ${match.id} :: ${match.packageName} :: ${match.symbolName} (${match.modulePath})`),
    { concurrency: 1, discard: true }
  );
  yield* Console.log(`Local candidate suggestions: ${A.length(result.candidateSuggestions)}`);
  yield* Effect.forEach(
    result.candidateSuggestions,
    (candidate) => Console.log(`- ${candidate.candidateId} (${candidate.confidence.toFixed(2)}) :: ${candidate.title}`),
    { concurrency: 1, discard: true }
  );
});

const printPacket = Effect.fn(function* (packet: ReusePacket) {
  const candidate = packet.candidate;
  yield* Console.log(`Candidate: ${candidate.candidateId}`);
  yield* Console.log(`Kind: ${candidate.kind}`);
  yield* Console.log(`Confidence: ${candidate.confidence.toFixed(2)}`);
  yield* Console.log(`Destination: ${candidate.proposedDestinationPackage} -> ${candidate.proposedDestinationModule}`);
  yield* Console.log("Implementation steps:");
  yield* Effect.forEach(candidate.implementationSteps, (step) => Console.log(`- ${step}`), {
    concurrency: 1,
    discard: true,
  });
  yield* Console.log("Verification:");
  yield* Effect.forEach(candidate.verificationCommands, (command) => Console.log(`- ${command}`), {
    concurrency: 1,
    discard: true,
  });
  yield* Console.log(`Catalog matches: ${A.length(packet.catalogMatches)}`);
  yield* Effect.forEach(
    packet.catalogMatches,
    (match) => Console.log(`- ${match.id} :: ${match.packageName} :: ${match.symbolName}`),
    { concurrency: 1, discard: true }
  );
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

        yield* printSelectedOutput(
          json,
          S.encodeEffect(ReusePartitionPlan)(plan).pipe(Effect.flatMap(printEncodedJson)),
          printPartitionPlan(plan)
        );
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

        yield* printSelectedOutput(
          json,
          S.encodeEffect(ReuseFindResult)(result).pipe(Effect.flatMap(printEncodedJson)),
          printFindResult(result)
        );
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

        yield* printSelectedOutput(
          json,
          S.encodeEffect(ReuseInventory)(inventory).pipe(Effect.flatMap(printEncodedJson)),
          printInventory(inventory)
        );
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

        yield* printSelectedOutput(
          json,
          S.encodeEffect(ReusePacket)(packet).pipe(Effect.flatMap(printEncodedJson)),
          printPacket(packet)
        );
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

        yield* printSelectedOutput(
          json,
          S.encodeEffect(CodexSmokeResult)(result).pipe(Effect.flatMap(printEncodedJson)),
          Effect.gen(function* () {
            yield* Console.log(`SDK: ${result.sdkPackage}`);
            yield* Console.log(`Working directory: ${result.workingDirectory}`);
            yield* Console.log(`Thread created: ${result.threadCreated}`);
            yield* Console.log(`thread.run available: ${result.threadRunMethodAvailable}`);
            yield* Console.log(result.note);
          })
        );
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
