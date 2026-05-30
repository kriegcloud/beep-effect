/**
 * Reuse-discovery command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import {
  encodeRepoCodegraphLookupResult,
  lookupRepoExports,
  RepoCodegraphLookupRequest,
  readRepoCodegraphImportPolicies,
  readRepoExportsCatalog,
} from "@beep/repo-codegraph";
import {
  DomainError,
  findRepoRoot,
  ReuseCandidate,
  ReuseCloneService,
  ReuseDiscoveryService,
  ReuseFindResult,
  ReuseInventory,
  ReuseInventoryService,
  ReusePacket,
  ReusePartitionPlan,
  ReusePartitionPlannerService,
  ReuseServiceSuiteLive,
} from "@beep/repo-utils";
import { A } from "@beep/utils";
import { Console, Effect, Layer, pipe } from "effect";
import * as Bool from "effect/Boolean";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Command, Flag } from "effect/unstable/cli";
import { ChildProcess } from "effect/unstable/process";
import { jsonFlag } from "../../internal/cli/Flags.js";
import { printCommandJson } from "../../internal/cli/Json.js";
import { printLines } from "../../internal/cli/Printer.js";
import { runCloneGate } from "./internal/CloneBaseline.js";
import { CodexSmokeResult, runCodexSmoke } from "./internal/CodexRunner.js";
import type {
  RepoCodegraphCatalogReadError,
  RepoCodegraphFreshnessStatus,
  RepoCodegraphLookupResult,
} from "@beep/repo-codegraph";
import type {
  FsUtils,
  NoSuchFileError,
  ReuseAnalysisError,
  ReuseCandidateNotFoundError,
  TSMorphService,
} from "@beep/repo-utils";
import type { FileSystem, Path } from "effect";
import type { ChildProcessSpawner } from "effect/unstable/process";
import type { CliJsonError } from "../../internal/cli/Json.js";
import type { CodexRunnerError } from "./internal/CodexRunner.js";

const scopeFlag = Flag.string("scope").pipe(
  Flag.withDescription("Limit analysis to one or more package or path selectors separated by commas"),
  Flag.optional
);
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
const cloneWriteFlag = Flag.boolean("write").pipe(
  Flag.withDescription("Refresh standards/clone.inventory.jsonc from current clones")
);
const cloneCheckFlag = Flag.boolean("check").pipe(
  Flag.withDescription("Fail if new structural clones appear vs the committed baseline")
);
const cloneFuzzyFlag = Flag.boolean("fuzzy").pipe(
  Flag.withDescription("Report near-miss (Type-3) clones by MinHash/LSH similarity (advisory; not gated)")
);
const cloneMinSimilarityFlag = Flag.float("min-similarity").pipe(
  Flag.withDescription("Minimum Jaccard similarity (0..1) for a near-miss cluster when --fuzzy is set"),
  Flag.withDefault(0.8)
);
const typeOnlyExportKinds = ["interface", "type"] as const;
const ASCII_BACKSLASH_CODE = 0x5c;
const ASCII_LEFT_BRACKET_CODE = 0x5b;
const ASCII_RIGHT_BRACKET_CODE = 0x5d;
const BEL_CODE = 0x07;
const ESC_CODE = 0x1b;

const isTypeOnlyExportKind = (exportKind: string): boolean => A.contains(typeOnlyExportKinds, exportKind);

const isControlCode = (code: number): boolean =>
  code <= 0x08 || (code >= 0x0b && code <= 0x1f) || (code >= 0x7f && code <= 0x9f);

const isCsiParameterCode = (code: number): boolean => code >= 0x30 && code <= 0x3f;
const isCsiIntermediateCode = (code: number): boolean => code >= 0x20 && code <= 0x2f;
const isCsiFinalCode = (code: number): boolean => code >= 0x40 && code <= 0x7e;
const isEscFinalCode = (code: number): boolean => code >= 0x40 && code <= 0x5f;

const skipOscSequence = (input: string, cursor: number): number => {
  while (cursor < input.length) {
    const code = input.charCodeAt(cursor);
    if (code === BEL_CODE) {
      return cursor + 1;
    }
    if (code === ESC_CODE && input.charCodeAt(cursor + 1) === ASCII_BACKSLASH_CODE) {
      return cursor + 2;
    }
    cursor += 1;
  }

  return input.length;
};

const skipCsiSequence = (input: string, cursor: number): number => {
  while (cursor < input.length && isCsiParameterCode(input.charCodeAt(cursor))) {
    cursor += 1;
  }
  while (cursor < input.length && isCsiIntermediateCode(input.charCodeAt(cursor))) {
    cursor += 1;
  }

  return cursor < input.length && isCsiFinalCode(input.charCodeAt(cursor)) ? cursor + 1 : cursor;
};

/**
 * Remove terminal control sequences from human-readable reuse output.
 *
 * @param input - Terminal text that may contain control sequences.
 * @returns Text with terminal control sequences and control characters removed.
 * @example
 * ```ts
 * import { sanitizeTerminalText } from "@beep/repo-cli/commands/Reuse"
 * const text = sanitizeTerminalText("\u001b[31munsafe\u001b[0m")
 * console.log(text)
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const sanitizeTerminalText = (input: string): string => {
  let output = "";
  let cursor = 0;

  while (cursor < input.length) {
    const code = input.charCodeAt(cursor);

    if (code === ESC_CODE) {
      const nextCode = input.charCodeAt(cursor + 1);
      if (nextCode === ASCII_RIGHT_BRACKET_CODE) {
        cursor = skipOscSequence(input, cursor + 2);
        continue;
      }
      if (nextCode === ASCII_LEFT_BRACKET_CODE) {
        cursor = skipCsiSequence(input, cursor + 2);
        continue;
      }
      if (isEscFinalCode(nextCode)) {
        cursor += 2;
        continue;
      }
    }

    if (isControlCode(code)) {
      cursor += 1;
      continue;
    }

    output += input[cursor];
    cursor += 1;
  }

  return output;
};

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
  | CliJsonError
  | ReuseAnalysisError
  | ReuseCandidateNotFoundError
  | S.SchemaError;

type ReuseProgramDependencies =
  | FileSystem.FileSystem
  | FsUtils
  | Path.Path
  | ChildProcessSpawner.ChildProcessSpawner
  | ReuseCloneService
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
): Effect.Effect<void, ReuseProgramError, ReuseRuntimeContext> => provideReuseServices(effect).pipe(Effect.asVoid);

const runCodexSmokeProgram = <A>(
  effect: Effect.Effect<A, CliJsonError | CodexRunnerError | DomainError | S.SchemaError, FileSystem.FileSystem>
): Effect.Effect<void, CliJsonError | CodexRunnerError | DomainError | S.SchemaError, FileSystem.FileSystem> =>
  effect.pipe(Effect.asVoid);

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
  ).pipe(Effect.mapError(DomainError.newCauseMessage("Failed to run repo-exports:catalog:check")));

  if (exitCode !== 0) {
    return yield* DomainError.make({
      message: `repo-exports:catalog:check failed with exit code ${exitCode}`,
    });
  }

  return "current";
});

const printLookupSummary = Effect.fn(function* (result: RepoCodegraphLookupResult, snippet: boolean) {
  yield* Console.log(`Query: ${sanitizeTerminalText(result.query)}`);
  yield* Console.log(
    `Matches: ${A.length(result.matches)} returned, ${result.totals.matchedEntries} matched, ${result.totals.catalogEntries} catalog entries`
  );
  yield* Console.log(`Catalog freshness: ${result.freshnessStatus}`);
  yield* Effect.forEach(result.warnings, (warning) => Console.log(`Warning: ${sanitizeTerminalText(warning)}`), {
    concurrency: 1,
    discard: true,
  });
  yield* Effect.forEach(
    result.matches,
    Effect.fn(function* (match) {
      const exportKind = sanitizeTerminalText(match.exportKind);
      const packageName = sanitizeTerminalText(match.packageName);
      const sourcePath = sanitizeTerminalText(match.sourcePath);
      const symbolName = sanitizeTerminalText(match.symbolName);
      const importSpecifier = sanitizeTerminalText(match.recommendedImport.importSpecifier);

      yield* Console.log(`- ${symbolName} (${exportKind}) :: ${packageName}`);
      yield* Console.log(`  recommended: ${importSpecifier}`);
      if (snippet) {
        const importKeyword = isTypeOnlyExportKind(exportKind) ? "import type" : "import";
        yield* Console.log(`  ${importKeyword} { ${symbolName} } from "${importSpecifier}";`);
      }
      yield* Console.log(`  source: ${sourcePath}:${match.sourceLine}`);
      yield* pipe(
        match.summary,
        O.map((summary) => Console.log(`  summary: ${sanitizeTerminalText(summary)}`)),
        O.getOrElse(() => Effect.void)
      );
      yield* Console.log(
        `  score: ${match.score.total.toFixed(1)} (exact ${match.score.exact.toFixed(1)}, lexical ${match.score.lexical.toFixed(1)}, semantic ${match.score.semantic.toFixed(1)}, graph ${match.score.graph.toFixed(1)}, boundary ${match.score.boundary.toFixed(1)})`
      );
      yield* Console.log(
        `  boundary: ${sanitizeTerminalText(match.boundary.status)} - ${sanitizeTerminalText(match.boundary.reason)}`
      );
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
          S.encodeEffect(ReusePartitionPlan)(plan).pipe(Effect.flatMap(printCommandJson)),
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
          S.encodeEffect(ReuseFindResult)(result).pipe(Effect.flatMap(printCommandJson)),
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
          S.encodeEffect(ReuseInventory)(inventory).pipe(Effect.flatMap(printCommandJson)),
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
          S.encodeEffect(ReusePacket)(packet).pipe(Effect.flatMap(printCommandJson)),
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
          RepoCodegraphLookupRequest.make({
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
          encodeRepoCodegraphLookupResult(result).pipe(Effect.flatMap(printCommandJson)),
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
          S.encodeEffect(CodexSmokeResult)(result).pipe(Effect.flatMap(printCommandJson)),
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

const printClones = Effect.fn(function* (candidates: ReadonlyArray<ReuseCandidate>) {
  yield* Console.log(`Structural clone clusters: ${A.length(candidates)}`);
  yield* Effect.forEach(
    candidates,
    Effect.fn(function* (candidate) {
      yield* Console.log(`- ${candidate.candidateId} (confidence=${candidate.confidence.toFixed(2)})`);
      yield* Console.log(`  ${candidate.title}`);
      yield* Effect.forEach(candidate.evidence, (line) => Console.log(`    ${line}`), {
        concurrency: 1,
        discard: true,
      });
    }),
    { concurrency: 1, discard: true }
  );
});

const printNearMissClones = Effect.fn(function* (candidates: ReadonlyArray<ReuseCandidate>) {
  yield* Console.log(`Near-miss clone clusters: ${A.length(candidates)}`);
  yield* Effect.forEach(
    candidates,
    Effect.fn(function* (candidate) {
      yield* Console.log(`- ${candidate.candidateId} (similarity=${candidate.confidence.toFixed(2)})`);
      yield* Console.log(`  ${candidate.title}`);
      yield* Effect.forEach(candidate.evidence, (line) => Console.log(`    ${line}`), {
        concurrency: 1,
        discard: true,
      });
    }),
    { concurrency: 1, discard: true }
  );
});

const reuseClonesCommand = Command.make(
  "clones",
  {
    scope: scopeFlag,
    json: jsonFlag,
    write: cloneWriteFlag,
    check: cloneCheckFlag,
    fuzzy: cloneFuzzyFlag,
    minSimilarity: cloneMinSimilarityFlag,
  },
  ({ scope, json, write, check, fuzzy, minSimilarity }) =>
    runReuseProgram(
      Effect.gen(function* () {
        const cloneService = yield* ReuseCloneService;

        // --fuzzy is report-only (advisory near-miss detection); never a gate.
        if (fuzzy && (write || check)) {
          return yield* DomainError.make({
            message: "`--fuzzy` is report-only and cannot be combined with `--write` or `--check`.",
          });
        }

        if (fuzzy) {
          if (minSimilarity < 0 || minSimilarity > 1) {
            return yield* DomainError.make({
              message: `--min-similarity must be in the range [0, 1]; got ${minSimilarity}.`,
            });
          }
          const candidates = yield* cloneService.detectNearMissClones(scope, { minSimilarity });
          yield* printSelectedOutput(
            json,
            S.encodeEffect(S.Array(ReuseCandidate))(candidates).pipe(Effect.flatMap(printCommandJson)),
            printNearMissClones(candidates)
          );
          return;
        }

        if (write && check) {
          return yield* DomainError.make({
            message: "Use either `--write` (refresh the baseline) or `--check` (enforce it), not both.",
          });
        }

        // --write / --check operate repo-wide against the committed baseline.
        if (write || check) {
          const candidates = yield* cloneService.detectClones(O.none());
          yield* runCloneGate(candidates, { write });
          return;
        }

        const candidates = yield* cloneService.detectClones(scope);
        yield* printSelectedOutput(
          json,
          S.encodeEffect(S.Array(ReuseCandidate))(candidates).pipe(Effect.flatMap(printCommandJson)),
          printClones(candidates)
        );
      })
    )
).pipe(
  Command.withDescription(
    "Detect declaration-anchored structural clones across packages (--write/--check baseline; --fuzzy for advisory near-miss)"
  )
);

const printReuseIndex = () =>
  printLines([
    "Reuse commands:",
    "- bun run beep reuse partitions --scope packages/tooling/tool/cli,packages/tooling/library/repo-utils --json",
    "- bun run beep reuse inventory --scope packages/tooling/tool/cli,packages/tooling/library/repo-utils --json",
    "- bun run beep reuse clones --json",
    "- bun run beep reuse find --file packages/tooling/tool/cli/src/commands/Docgen/index.ts --query json --json",
    "- bun run beep reuse lookup --query UnknownRecord --from packages/tooling/tool/cli --json",
    "- bun run beep reuse packet --candidate-id reuse-pattern:schema-json-encode-sync --json",
    "- bun run beep reuse codex-smoke --json",
  ]);

/**
 * Reuse-discovery command group.
 *
 * @example
 * ```ts
 * import { reuseCommand } from "@beep/repo-cli/commands/Reuse"
 * console.log(reuseCommand)
 * ```
 * @category use-cases
 * @since 0.0.0
 */
export const reuseCommand = Command.make("reuse", {}, printReuseIndex).pipe(
  Command.withDescription("Discover high-confidence reuse candidates and future agent work partitions"),
  Command.withSubcommands([
    reusePartitionsCommand,
    reuseFindCommand,
    reuseInventoryCommand,
    reuseClonesCommand,
    reuseLookupCommand,
    reusePacketCommand,
    reuseCodexSmokeCommand,
  ])
);
