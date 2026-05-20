/**
 * Reuse-discovery command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import {
  encodeRepoCodegraphLookupResult,
  lookupRepoExports,
  type RepoCodegraphCatalogReadError,
  type RepoCodegraphFreshnessStatus,
  RepoCodegraphLookupRequest,
  type RepoCodegraphLookupResult,
  readRepoCodegraphImportPolicies,
  readRepoExportsCatalog,
} from "@beep/repo-codegraph";
import {
  DomainError,
  type FsUtils,
  findRepoRoot,
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
import { A } from "@beep/utils";
import { Console, Effect, type FileSystem, Layer, type Path, pipe } from "effect";
import * as Bool from "effect/Boolean";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Command, Flag } from "effect/unstable/cli";
import { ChildProcess, type ChildProcessSpawner } from "effect/unstable/process";
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
const lookupQueryFlag = Flag.string("query").pipe(
  Flag.withDescription("Symbol name or natural-language intent to search in public repo exports")
);
const lookupFromFlag = Flag.string("from").pipe(
  Flag.withDescription("Optional source package name, package path, or repo-relative file path for boundary advice"),
  Flag.optional
);
const lookupLimitFlag = Flag.integer("limit").pipe(
  Flag.withDescription("Maximum number of lookup matches to return"),
  Flag.withDefault(8)
);
const strictCatalogFlag = Flag.boolean("strict").pipe(
  Flag.withDescription("Run repo-exports:catalog:check before lookup and fail if the catalog is stale")
);
const snippetFlag = Flag.boolean("snippet").pipe(
  Flag.withDescription("Print import snippets in human-readable output")
);
const symbolIdFlag = Flag.string("symbol-id").pipe(
  Flag.withDescription("Optional TSMorph symbol id used to anchor a precise reuse lookup"),
  Flag.optional
);
const candidateIdFlag = Flag.string("candidate-id").pipe(
  Flag.withDescription("Candidate id from `beep reuse inventory --json`")
);
const typeOnlyExportKinds = ["interface", "type"] as const;

const isTypeOnlyExportKind = (exportKind: string): boolean => A.contains(typeOnlyExportKinds, exportKind);

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
  | RepoCodegraphCatalogReadError
  | ReuseAnalysisError
  | ReuseCandidateNotFoundError
  | S.SchemaError;

type ReuseProgramDependencies =
  | FileSystem.FileSystem
  | FsUtils
  | Path.Path
  | ChildProcessSpawner.ChildProcessSpawner
  | ReuseDiscoveryService
  | ReuseInventoryService
  | ReusePartitionPlannerService
  | TSMorphService;

type ReuseRuntimeContext =
  | FileSystem.FileSystem
  | FsUtils
  | Path.Path
  | ChildProcessSpawner.ChildProcessSpawner
  | TSMorphService;

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
      RepoCodegraphCatalogReadError: Effect.fn(function* (error) {
        process.exitCode = 1;
        yield* Console.error(`[reuse] ${error.operation}: ${error.message}`);
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

const ensureRepoExportsCatalogFresh = Effect.fn("Reuse.ensureRepoExportsCatalogFresh")(function* (
  repoRoot: string,
  strict: boolean
): Effect.fn.Return<RepoCodegraphFreshnessStatus, DomainError, ChildProcessSpawner.ChildProcessSpawner> {
  // Strict mode hard-fails stale catalogs, so successful lookup output is only unchecked or current.
  if (!strict) {
    return "unchecked";
  }

  const exitCode = yield* Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* ChildProcess.make("bun", ["run", "repo-exports:catalog:check"], {
        cwd: repoRoot,
        stderr: "inherit",
        stdout: "ignore",
      });
      return yield* handle.exitCode;
    })
  ).pipe(
    Effect.mapError(
      (cause) =>
        new DomainError({
          message: `Failed to run repo-exports:catalog:check: ${cause.message}`,
        })
    )
  );

  if (exitCode !== 0) {
    return yield* new DomainError({
      message: `repo-exports:catalog:check failed with exit code ${exitCode}`,
    });
  }

  return "current";
});

const printLookupSummary = Effect.fn(function* (result: RepoCodegraphLookupResult, snippet: boolean) {
  yield* Console.log(`Query: ${result.query}`);
  yield* Console.log(
    `Matches: ${A.length(result.matches)} returned, ${result.totals.matchedEntries} matched, ${result.totals.catalogEntries} catalog entries`
  );
  yield* Console.log(`Catalog freshness: ${result.freshnessStatus}`);
  yield* Effect.forEach(result.warnings, (warning) => Console.log(`Warning: ${warning}`), {
    concurrency: 1,
    discard: true,
  });
  yield* Effect.forEach(
    result.matches,
    Effect.fn(function* (match) {
      yield* Console.log(`- ${match.symbolName} (${match.exportKind}) :: ${match.packageName}`);
      yield* Console.log(`  recommended: ${match.recommendedImport.importSpecifier}`);
      if (snippet) {
        const importKeyword = isTypeOnlyExportKind(match.exportKind) ? "import type" : "import";
        yield* Console.log(
          `  ${importKeyword} { ${match.symbolName} } from "${match.recommendedImport.importSpecifier}";`
        );
      }
      yield* Console.log(`  source: ${match.sourcePath}:${match.sourceLine}`);
      yield* pipe(
        match.summary,
        O.map((summary) => Console.log(`  summary: ${summary}`)),
        O.getOrElse(() => Effect.void)
      );
      yield* Console.log(
        `  score: ${match.score.total.toFixed(1)} (exact ${match.score.exact.toFixed(1)}, lexical ${match.score.lexical.toFixed(1)}, semantic ${match.score.semantic.toFixed(1)}, graph ${match.score.graph.toFixed(1)}, boundary ${match.score.boundary.toFixed(1)})`
      );
      yield* Console.log(`  boundary: ${match.boundary.status} - ${match.boundary.reason}`);
    }),
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

const reuseLookupCommand = Command.make(
  "lookup",
  {
    query: lookupQueryFlag,
    from: lookupFromFlag,
    limit: lookupLimitFlag,
    strict: strictCatalogFlag,
    snippet: snippetFlag,
    json: jsonFlag,
  },
  ({ query, from, limit, strict, snippet, json }) =>
    runReuseProgram(
      Effect.gen(function* () {
        const repoRoot = yield* findRepoRoot();
        const freshnessStatus = yield* ensureRepoExportsCatalogFresh(repoRoot, strict);
        const catalog = yield* readRepoExportsCatalog(repoRoot);
        const importPolicies = yield* readRepoCodegraphImportPolicies(repoRoot, catalog);
        const result = lookupRepoExports(
          catalog,
          new RepoCodegraphLookupRequest({
            fromPackage: from,
            limit,
            query,
          }),
          {
            freshnessStatus,
            importPolicies,
          }
        );

        yield* printSelectedOutput(
          json,
          encodeRepoCodegraphLookupResult(result).pipe(Effect.flatMap(printEncodedJson)),
          printLookupSummary(result, snippet)
        );
      })
    )
).pipe(Command.withDescription("Look up reusable public exports by symbol name or natural-language intent"));

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
  yield* Console.log(
    "- bun run beep reuse partitions --scope packages/tooling/tool/cli,packages/tooling/library/repo-utils --json"
  );
  yield* Console.log(
    "- bun run beep reuse inventory --scope packages/tooling/tool/cli,packages/tooling/library/repo-utils --json"
  );
  yield* Console.log(
    "- bun run beep reuse find --file packages/tooling/tool/cli/src/commands/Docgen/index.ts --query json --json"
  );
  yield* Console.log("- bun run beep reuse lookup --query UnknownRecord --from packages/tooling/tool/cli --json");
  yield* Console.log("- bun run beep reuse packet --candidate-id reuse-pattern:schema-json-encode-sync --json");
  yield* Console.log("- bun run beep reuse codex-smoke --json");
});

/**
 * Reuse-discovery command group.
 *
 * @category use-cases
 * @since 0.0.0
 */
export const reuseCommand = Command.make("reuse", {}, printReuseIndex).pipe(
  Command.withDescription("Discover high-confidence reuse candidates and future agent work partitions"),
  Command.withSubcommands([
    reusePartitionsCommand,
    reuseFindCommand,
    reuseInventoryCommand,
    reuseLookupCommand,
    reusePacketCommand,
    reuseCodexSmokeCommand,
  ])
);
