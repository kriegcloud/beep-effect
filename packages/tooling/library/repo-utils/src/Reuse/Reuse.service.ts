/**
 * Reuse-catalog discovery, partitioning, and inventory services.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
// cspell:words tsmorph stringifier

import { $RepoUtilsId } from "@beep/identity/packages";
import { NonNegativeInt, TaggedErrorClass } from "@beep/schema";
import { A, Str } from "@beep/utils";
import {
  Context,
  DateTime,
  Effect,
  FileSystem,
  flow,
  Inspectable,
  Layer,
  MutableHashMap,
  Order,
  Path,
  pipe,
} from "effect";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { FsUtils } from "../FsUtils.js";
import { findRepoRoot } from "../Root.js";
import {
  TSMorphService,
  TsMorphFileOutlineRequest,
  TsMorphProjectScopeRequest,
  TsMorphSymbolLookupRequest,
} from "../TSMorph/index.js";
import {
  ReuseCandidate,
  ReuseCatalogEntry,
  ReuseFindResult,
  ReuseInventory,
  ReusePacket,
  ReusePartitionPlan,
  ReuseSourceSymbolRef,
  ReuseWorkUnit,
} from "./Reuse.model.js";
import type { Symbol as TsMorphSymbol } from "../TSMorph/index.js";
import type { ReuseCandidateKind } from "./Reuse.model.js";

const $I = $RepoUtilsId.create("Reuse/Reuse.service");

type WorkspaceScope = {
  readonly packageName: string;
  readonly packagePath: string;
  readonly srcPath: string;
  readonly tsConfigPath: string;
};

type SelectorCacheKey = string;

type PatternDefinition = {
  readonly id: string;
  readonly kind: ReuseCandidateKind;
  readonly title: string;
  readonly regex: RegExp;
  readonly specialistLabel: string;
  readonly rationale: string;
  readonly recommendedAction: string;
  readonly proposedDestinationPackage: string;
  readonly proposedDestinationModule: string;
  readonly blockingConcerns: ReadonlyArray<string>;
  readonly implementationSteps: ReadonlyArray<string>;
  readonly verificationCommands: ReadonlyArray<string>;
  readonly catalogKeywords: ReadonlyArray<string>;
};

type PatternOccurrence = {
  readonly filePath: string;
  readonly packagePath: string;
  readonly line: number;
  readonly text: string;
  readonly sourceSymbol: O.Option<ReuseSourceSymbolRef>;
};

type ScoredCatalogMatch = {
  readonly entry: ReuseCatalogEntry;
  readonly score: number;
};

type PatternOccurrencesById = Readonly<Record<string, ReadonlyArray<PatternOccurrence>>>;
type PatternMatchCountsById = Readonly<Record<string, number>>;

class WorkspacePackageManifest extends S.Class<WorkspacePackageManifest>($I`WorkspacePackageManifest`)(
  {
    name: S.optionalKey(S.NonEmptyString),
  },
  $I.annote("WorkspacePackageManifest", {
    description: "Minimal workspace package manifest required by reuse-discovery services.",
  })
) {}

/**
 * Typed error returned when reuse analysis cannot complete a repository scan or lookup.
 *
 * @example
 * ```ts
 * import { ReuseAnalysisError } from "@beep/repo-utils/Reuse/Reuse.service"
 * const error = ReuseAnalysisError.make({
 *   message: "Inventory scan failed",
 *   operation: "buildInventory"
 * })
 * void error.operation
 * ```
 * @category error-handling
 * @since 0.0.0
 */
export class ReuseAnalysisError extends TaggedErrorClass<ReuseAnalysisError>($I`ReuseAnalysisError`)(
  "ReuseAnalysisError",
  {
    operation: S.NonEmptyString,
    message: S.NonEmptyString,
  },
  $I.annote("ReuseAnalysisError", {
    description: "Typed failure emitted by reuse-discovery analysis services.",
  })
) {}

/**
 * Typed error returned when a requested candidate id is absent from the current reuse inventory.
 *
 * @example
 * ```ts
 * import { ReuseCandidateNotFoundError } from "@beep/repo-utils/Reuse/Reuse.service"
 * const error = ReuseCandidateNotFoundError.make({
 *   candidateId: "candidate:missing",
 *   scopeSelector: "packages/tooling/library/repo-utils"
 * })
 * void error.candidateId
 * ```
 * @category error-handling
 * @since 0.0.0
 */
export class ReuseCandidateNotFoundError extends TaggedErrorClass<ReuseCandidateNotFoundError>(
  $I`ReuseCandidateNotFoundError`
)(
  "ReuseCandidateNotFoundError",
  {
    candidateId: S.NonEmptyString,
    scopeSelector: S.NonEmptyString,
  },
  $I.annote("ReuseCandidateNotFoundError", {
    description: "Requested reuse candidate id was not present in the computed inventory.",
  })
) {}

const decodeJsonString = S.decodeUnknownEffect(S.UnknownFromJsonString);
const decodeWorkspacePackageManifest = S.decodeUnknownEffect(WorkspacePackageManifest);
const decodeFileOutlineRequest = S.decodeUnknownEffect(TsMorphFileOutlineRequest);
const decodeProjectScopeRequest = S.decodeUnknownEffect(TsMorphProjectScopeRequest);
const decodeSymbolLookupRequest = S.decodeUnknownEffect(TsMorphSymbolLookupRequest);
const decodeNonNegativeInt = S.decodeUnknownEffect(NonNegativeInt);

const PRODUCTION_FILE_IGNORE_PATTERNS = [
  "**/*.d.ts",
  "**/*.test.*",
  "**/*.spec.*",
  "**/*.stories.*",
  "**/test/**",
  "**/tests/**",
  "**/docs/**",
  "**/dist/**",
  "**/storybook-static/**",
] as const;

const WORKSPACE_PACKAGE_PATTERNS = [
  "packages/*/*/package.json",
  "packages/tooling/*/*/package.json",
  "apps/*/package.json",
] as const;

const CURATED_EFFECT_V4_ENTRIES = [
  ReuseCatalogEntry.make({
    id: "effect-v4-curated:Array",
    origin: "effect-v4-curated",
    packageName: "effect",
    packagePath: "effect/Array",
    modulePath: "effect/Array",
    symbolName: "Array",
    symbolKind: "Module",
    summary: O.some("Prefer Effect Array helpers for deterministic collection transforms and sorting."),
    keywords: ["array", "collections", "sort", "map", "filter", "partition"],
    applicability: ["collection-ops", "high-signal-effect-reuse"],
  }),
  ReuseCatalogEntry.make({
    id: "effect-v4-curated:Option",
    origin: "effect-v4-curated",
    packageName: "effect",
    packagePath: "effect/Option",
    modulePath: "effect/Option",
    symbolName: "Option",
    symbolKind: "Module",
    summary: O.some("Model optional values and absence with Option rather than nullish branching."),
    keywords: ["option", "absence", "nullable", "find", "lookup"],
    applicability: ["absence-handling", "high-signal-effect-reuse"],
  }),
  ReuseCatalogEntry.make({
    id: "effect-v4-curated:Schema",
    origin: "effect-v4-curated",
    packageName: "effect",
    packagePath: "effect/Schema",
    modulePath: "effect/Schema",
    symbolName: "Schema",
    symbolKind: "Module",
    summary: O.some("Model boundary payloads, JSON codecs, and reusable data shapes with Schema-first patterns."),
    keywords: ["schema", "json", "decode", "encode", "class", "tagged"],
    applicability: ["schema-first", "json-boundaries", "high-signal-effect-reuse"],
  }),
  ReuseCatalogEntry.make({
    id: "effect-v4-curated:String",
    origin: "effect-v4-curated",
    packageName: "effect",
    packagePath: "effect/String",
    modulePath: "effect/String",
    symbolName: "String",
    symbolKind: "Module",
    summary: O.some("Prefer Effect String helpers for deterministic string tokenization and inspection."),
    keywords: ["string", "tokenize", "split", "trim", "prefix", "suffix"],
    applicability: ["string-ops", "high-signal-effect-reuse"],
  }),
] as const;

const PATTERN_DEFINITIONS = [
  {
    id: "schema-json-encode-effect",
    kind: "extract-function",
    title: "Shared Effect schema JSON encoder helper",
    regex: /S\.encode(?:Unknown)?Effect\(S\.(?:UnknownFromJsonString|fromJsonString\()/u,
    specialistLabel: "JSON codec specialist",
    rationale:
      "Multiple files create similar Effect schema JSON encoders inline, which is a high-confidence extraction candidate.",
    recommendedAction:
      "Extract a shared Effect schema JSON encoder helper and replace repeated inline initializers with the shared function.",
    proposedDestinationPackage: "@beep/schema",
    proposedDestinationModule: "packages/foundation/modeling/schema/src/json/SchemaJsonCodec.ts",
    blockingConcerns: [
      "Confirm the shared helper preserves caller-specific schema error mapping before replacing all call sites.",
    ],
    implementationSteps: [
      "Create an Effect-returning schema JSON encoder helper in the proposed destination module.",
      "Replace repeated inline encoder initializers with the shared helper.",
      "Map schema errors into each caller's local typed error before returning across command or service boundaries.",
    ],
    verificationCommands: ["bun run check --filter=@beep/repo-cli", "bun run test --filter=@beep/repo-cli"],
    catalogKeywords: ["schema", "json", "encode"],
  },
  {
    id: "schema-json-decode-effect",
    kind: "extract-function",
    title: "Shared Effect schema JSON decoder helper",
    regex: /S\.decode(?:Unknown)?Effect\(S\.(?:UnknownFromJsonString|fromJsonString\()/u,
    specialistLabel: "JSON codec specialist",
    rationale:
      "Multiple files decode JSON strings through similar Effect schema helpers, which is a good candidate for a shared boundary utility.",
    recommendedAction:
      "Extract a shared Effect schema JSON decoder helper and route repeated inline decoders through it.",
    proposedDestinationPackage: "@beep/schema",
    proposedDestinationModule: "packages/foundation/modeling/schema/src/json/SchemaJsonCodec.ts",
    blockingConcerns: [
      "Confirm callers agree on the Effect error shape and map schema issues into local typed boundary errors.",
    ],
    implementationSteps: [
      "Create an Effect-returning decoder helper adjacent to the encoder helper or an existing JSON boundary module.",
      "Replace repeated inline decoder initializers with the shared helper.",
      "Verify callers still render decode failures with the same user-facing text after Effect.mapError mapping.",
    ],
    verificationCommands: ["bun run check --filter=@beep/repo-cli", "bun run test --filter=@beep/repo-cli"],
    catalogKeywords: ["schema", "json", "decode"],
  },
  {
    id: "render-json-helper",
    kind: "extract-function",
    title: "Shared pretty JSON renderer helper",
    regex: /const renderJson = \(value: unknown\): string => \{/u,
    specialistLabel: "JSON rendering specialist",
    rationale:
      "At least two files own the same pretty JSON rendering helper shape, which is a strong candidate for extraction.",
    recommendedAction:
      "Extract a shared pretty JSON renderer helper or align on an existing JSON stringifier wrapper to remove local duplication.",
    proposedDestinationPackage: "@beep/utils",
    proposedDestinationModule: "packages/foundation/modeling/utils/src/json/renderPrettyJson.ts",
    blockingConcerns: [
      "Validate whether callers require jsonc-based formatting or can safely reuse an existing schema JSON stringifier.",
    ],
    implementationSteps: [
      "Compare the current renderJson implementations and preserve any formatting contract differences in the extracted helper.",
      "Move the shared renderer into the destination module.",
      "Replace local renderJson helpers with the shared import and keep human-readable CLI output unchanged.",
    ],
    verificationCommands: ["bun run check --filter=@beep/repo-cli", "bun run test --filter=@beep/repo-cli"],
    catalogKeywords: ["json", "render", "stringify"],
  },
] satisfies ReadonlyArray<PatternDefinition>;

const normalizeRelativePath = (value: string): string => Str.replaceAll(/\\/gu, "/")(value);

const canonicalizeRelativePath = (value: string): string => {
  const normalized = normalizeRelativePath(Str.trim(value));
  const segments = Str.split("/")(normalized);
  let resolved = A.empty<string>();

  for (const segment of segments) {
    if (segment.length === 0 || segment === ".") {
      continue;
    }

    if (segment === "..") {
      const previous = A.last(resolved);
      if (O.isSome(previous) && previous.value !== "..") {
        resolved = A.slice(resolved, 0, -1);
      } else {
        resolved = A.append(resolved, segment);
      }
      continue;
    }

    resolved = A.append(resolved, segment);
  }

  return pipe(resolved, A.join("/"));
};

const toNullableNonEmptyString = (value: string): string | null => {
  const trimmed = Str.trim(value);
  return trimmed.length > 0 ? trimmed : null;
};

const optionFromNullableNonEmptyString = (value: string | null | undefined): O.Option<string> =>
  value == null ? O.none() : O.fromNullishOr(toNullableNonEmptyString(value));

const formatCauseMessage = (cause: unknown): string =>
  cause instanceof Error ? cause.message : Inspectable.toStringUnknown(cause, 2);

const mkAnalysisError = (operation: string, message: string): ReuseAnalysisError =>
  ReuseAnalysisError.make({
    operation,
    message,
  });

const mapAnalysisError =
  (operation: string, context: string) =>
  (cause: unknown): ReuseAnalysisError =>
    mkAnalysisError(operation, `${context}: ${formatCauseMessage(cause)}`);

const parseScopeSelector = (scopeSelector: O.Option<string>): ReadonlyArray<string> => {
  if (O.isNone(scopeSelector)) {
    return [];
  }

  return pipe(Str.split(",")(scopeSelector.value), A.map(canonicalizeRelativePath), A.filter(Str.isNonEmpty));
};

const uniqueStrings = (values: ReadonlyArray<string>): Array<string> => A.dedupe(values);

const uniqueSortedStrings: (values: ReadonlyArray<string>) => Array<string> = flow(uniqueStrings, A.sort(Order.String));

const lowerKeywords = (input: string): Array<string> => {
  const matches = pipe(
    input,
    Str.match(/[A-Za-z0-9]+/gu),
    O.getOrElse(() => [] as ReadonlyArray<string>)
  );
  return pipe(
    matches,
    A.map(flow(Str.trim, Str.toLowerCase)),
    A.filter((normalized) => normalized.length >= 2),
    uniqueStrings
  );
};

const lowerKeywordsFromParts = (parts: ReadonlyArray<string>): Array<string> => {
  let keywords = A.empty<string>();
  for (const part of parts) {
    keywords = A.appendAll(keywords, lowerKeywords(part));
  }
  return uniqueStrings(keywords);
};

const matchesScopeSelector = (scope: WorkspaceScope, selectorTokens: ReadonlyArray<string>): boolean => {
  if (selectorTokens.length === 0) {
    return true;
  }

  const scopePathSegments = Str.split("/")(scope.packagePath);

  for (const token of selectorTokens) {
    if (
      scope.packageName === token ||
      scope.packagePath === token ||
      Str.startsWith(`${token}/`)(scope.packagePath) ||
      A.contains(scopePathSegments, token)
    ) {
      return true;
    }
  }

  return false;
};

const confidenceFromOccurrenceCount = (count: number): number => Math.min(0.55 + count * 0.1, 0.95);

const catalogEntryKeywords = (entry: ReuseCatalogEntry): Array<string> =>
  lowerKeywordsFromParts([
    entry.packageName,
    entry.packagePath,
    entry.modulePath,
    entry.symbolName,
    O.getOrElse(entry.summary, () => ""),
    ...entry.keywords,
    ...entry.applicability,
  ]);

const rankCatalogMatches = (
  catalogEntries: ReadonlyArray<ReuseCatalogEntry>,
  queryKeywords: ReadonlyArray<string>,
  limit = 8
): ReadonlyArray<ReuseCatalogEntry> => {
  const normalizedQuery = pipe(queryKeywords, A.map(Str.toLowerCase), uniqueStrings);
  const scored = pipe(
    catalogEntries,
    A.reduce(A.empty<ScoredCatalogMatch>(), (matches, entry) => {
      const entryKeywords = catalogEntryKeywords(entry);
      let score = 0;

      for (const keyword of normalizedQuery) {
        if (Str.toLowerCase(entry.symbolName) === keyword) {
          score += 5;
        }
        if (
          pipe(entry.packageName, Str.toLowerCase, Str.includes(keyword)) ||
          pipe(entry.modulePath, Str.toLowerCase, Str.includes(keyword))
        ) {
          score += 2;
        }
        if (A.contains(entryKeywords, keyword)) {
          score += 3;
        }
      }

      return score > 0 ? A.append(matches, { entry, score }) : matches;
    }),
    A.sort(
      Order.combine(
        Order.mapInput(Order.Number, (item: ScoredCatalogMatch) => -item.score),
        Order.mapInput(Order.String, (item: ScoredCatalogMatch) => item.entry.id)
      )
    )
  );

  return pipe(
    scored,
    A.slice(0, limit),
    A.map((item) => item.entry)
  );
};

const stableSourceSymbols = (symbols: ReadonlyArray<ReuseSourceSymbolRef>): ReadonlyArray<ReuseSourceSymbolRef> => {
  const state = pipe(
    symbols,
    A.reduce({ seen: A.empty<string>(), result: A.empty<ReuseSourceSymbolRef>() }, (current, symbol) =>
      A.contains(current.seen, symbol.symbolId)
        ? current
        : {
            seen: A.append(current.seen, symbol.symbolId),
            result: A.append(current.result, symbol),
          }
    )
  );

  return state.result;
};

const sourceSymbolFromTsMorph = (symbol: TsMorphSymbol): ReuseSourceSymbolRef =>
  ReuseSourceSymbolRef.make({
    symbolId: symbol.id,
    filePath: symbol.filePath,
    symbolName: symbol.name,
    symbolKind: symbol.kind,
  });

const nearestSymbolForLine = (symbols: ReadonlyArray<TsMorphSymbol>, line: number): O.Option<ReuseSourceSymbolRef> => {
  for (const symbol of symbols) {
    if (symbol.startLine <= line && symbol.endLine >= line) {
      return O.some(sourceSymbolFromTsMorph(symbol));
    }
  }

  return O.none();
};

const candidateFromPattern = (
  pattern: PatternDefinition,
  occurrences: ReadonlyArray<PatternOccurrence>,
  catalogEntries: ReadonlyArray<ReuseCatalogEntry>
): ReuseCandidate => {
  const sourceSymbols = stableSourceSymbols(
    pipe(
      occurrences,
      A.flatMap((occurrence) =>
        O.isSome(occurrence.sourceSymbol) ? A.of(occurrence.sourceSymbol.value) : A.empty<ReuseSourceSymbolRef>()
      )
    )
  );
  const sourceScopes = uniqueSortedStrings(
    pipe(
      occurrences,
      A.map((occurrence) => occurrence.packagePath)
    )
  );
  const evidence = pipe(
    occurrences,
    A.map(
      (occurrence) => `${occurrence.filePath}:${occurrence.line} matches ${pattern.id} -> ${Str.trim(occurrence.text)}`
    )
  );
  const queryKeywords = lowerKeywordsFromParts([pattern.title, ...pattern.catalogKeywords, ...sourceScopes]);
  const catalogMatches = pipe(
    rankCatalogMatches(catalogEntries, queryKeywords),
    A.map((entry) => entry.id)
  );

  return ReuseCandidate.make({
    candidateId: `reuse-pattern:${pattern.id}`,
    kind: pattern.kind,
    title: pattern.title,
    sourceSymbols,
    sourceScopes,
    recommendedAction: pattern.recommendedAction,
    proposedDestinationPackage: pattern.proposedDestinationPackage,
    proposedDestinationModule: pattern.proposedDestinationModule,
    confidence: confidenceFromOccurrenceCount(occurrences.length),
    evidence,
    blockingConcerns: A.fromIterable(pattern.blockingConcerns),
    implementationSteps: A.fromIterable(pattern.implementationSteps),
    verificationCommands: A.fromIterable(pattern.verificationCommands),
    catalogMatchIds: catalogMatches,
  });
};

const scopeSelectorLabel = (scopeSelector: O.Option<string>, scopes: ReadonlyArray<WorkspaceScope>): string => {
  if (O.isSome(scopeSelector)) {
    const tokens = parseScopeSelector(scopeSelector);
    return tokens.length > 0 ? pipe(tokens, A.join(",")) : "all-production";
  }

  const joined = pipe(
    scopes,
    A.map((scope) => scope.packagePath),
    A.join(",")
  );
  return joined.length > 0 ? joined : "all-production";
};

const buildCatalogEntry = (scope: WorkspaceScope, symbol: TsMorphSymbol): ReuseCatalogEntry =>
  ReuseCatalogEntry.make({
    id: `repo:${symbol.id}`,
    origin: Str.startsWith("packages/foundation/")(scope.packagePath) ? "repo-foundation" : "repo-tooling",
    packageName: scope.packageName,
    packagePath: scope.packagePath,
    modulePath: symbol.filePath,
    symbolName: symbol.name,
    symbolKind: symbol.kind,
    summary: optionFromNullableNonEmptyString(O.getOrElse(symbol.summary, () => "")),
    keywords: lowerKeywordsFromParts([
      symbol.name,
      symbol.qualifiedName,
      symbol.signature,
      symbol.filePath,
      O.getOrElse(symbol.summary, () => ""),
      O.getOrElse(symbol.docstring, () => ""),
    ]),
    applicability: lowerKeywordsFromParts([scope.packageName, scope.packagePath, symbol.kind]),
  });

const resolveScopeRequest = (
  repoRoot: string,
  tsConfigPath: string,
  operation: string,
  packagePath: string
): Effect.Effect<TsMorphProjectScopeRequest, ReuseAnalysisError> =>
  decodeProjectScopeRequest({
    entrypoint: {
      _tag: "tsconfig",
      tsConfigPath,
    },
    mode: "syntax",
    referencePolicy: "workspaceOnly",
    repoRootPath: repoRoot,
  }).pipe(Effect.mapError(mapAnalysisError(operation, `Failed to build ts-morph scope request for ${packagePath}`)));

const scanPatternsInFile = (
  filePath: string,
  packagePath: string,
  text: string,
  outlineSymbols: ReadonlyArray<TsMorphSymbol>
): PatternOccurrencesById => {
  const buckets: Record<string, Array<PatternOccurrence>> = {};
  const lines = Str.split(/\r?\n/u)(text);

  let lineNumber = 1;
  for (const line of lines) {
    for (const pattern of PATTERN_DEFINITIONS) {
      if (pattern.regex.test(line)) {
        buckets[pattern.id] = A.append(buckets[pattern.id] ?? A.empty<PatternOccurrence>(), {
          filePath,
          packagePath,
          line: lineNumber,
          text: line,
          sourceSymbol: nearestSymbolForLine(outlineSymbols, lineNumber),
        });
      }
      pattern.regex.lastIndex = 0;
    }
    lineNumber += 1;
  }

  return buckets;
};

const countPatternsInText = (text: string): PatternMatchCountsById => {
  const counts: Record<string, number> = {};
  const lines = Str.split(/\r?\n/u)(text);

  for (const line of lines) {
    for (const pattern of PATTERN_DEFINITIONS) {
      if (pattern.regex.test(line)) {
        counts[pattern.id] = (counts[pattern.id] ?? 0) + 1;
      }
      pattern.regex.lastIndex = 0;
    }
  }

  return counts;
};

const makeScoutWorkUnit = (scope: WorkspaceScope): ReuseWorkUnit =>
  ReuseWorkUnit.make({
    id: `reuse:scout:${scope.packagePath}`,
    kind: "scout",
    label: scope.packageName,
    scopeSelector: scope.packagePath,
    rationale: `Package scout for ${scope.packagePath} so local reuse candidates can be inventoried independently.`,
  });

const makeSpecialistWorkUnit = (label: string, selectors: ReadonlyArray<string>, rationale: string): ReuseWorkUnit =>
  ReuseWorkUnit.make({
    id: `reuse:specialist:${pipe(label, Str.toLowerCase, Str.replace(/\s+/gu, "-"))}`,
    kind: "specialist",
    label,
    scopeSelector: pipe(uniqueSortedStrings(selectors), A.join(",")),
    rationale,
  });

const makeReuseRuntime = Effect.gen(function* () {
  const fsUtils = yield* FsUtils;
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const tsmorph = yield* TSMorphService;
  const repoRoot = yield* findRepoRoot();

  return {
    fs,
    fsUtils,
    path,
    repoRoot,
    tsmorph,
  } as const;
});

type ReuseRuntime = Effect.Success<typeof makeReuseRuntime>;

type ReuseAnalysisContextShape = {
  readonly runtime: ReuseRuntime;
  readonly workspaceScopesBySelector: MutableHashMap.MutableHashMap<SelectorCacheKey, ReadonlyArray<WorkspaceScope>>;
  readonly sourceFilesByScope: MutableHashMap.MutableHashMap<string, ReadonlyArray<string>>;
  readonly catalogEntriesByScope: MutableHashMap.MutableHashMap<string, ReadonlyArray<ReuseCatalogEntry>>;
  readonly patternOccurrencesByScope: MutableHashMap.MutableHashMap<string, PatternOccurrencesById>;
  readonly patternMatchCountsByScope: MutableHashMap.MutableHashMap<string, PatternMatchCountsById>;
  readonly catalogBySelector: MutableHashMap.MutableHashMap<SelectorCacheKey, ReadonlyArray<ReuseCatalogEntry>>;
  readonly candidatesBySelector: MutableHashMap.MutableHashMap<SelectorCacheKey, ReadonlyArray<ReuseCandidate>>;
};

class ReuseAnalysisContext extends Context.Service<ReuseAnalysisContext, ReuseAnalysisContextShape>()(
  $I`ReuseAnalysisContext`
) {}

const selectorCacheKey = (scopeSelector: O.Option<string>): SelectorCacheKey => {
  const tokens = scopeSelector.pipe(parseScopeSelector, uniqueSortedStrings);
  return tokens.length > 0 ? pipe(tokens, A.join(",")) : "__all__";
};

const optionFromSelectorTokens = (tokens: ReadonlyArray<string>): O.Option<string> =>
  tokens.length > 0 ? O.some(pipe(tokens, A.join(","))) : O.none();

const catalogScopeSelector = (scopeSelector: O.Option<string>): O.Option<string> => {
  if (O.isNone(scopeSelector)) {
    return O.none();
  }

  return optionFromSelectorTokens(uniqueSortedStrings(["packages/foundation", ...parseScopeSelector(scopeSelector)]));
};

const getCachedOrCompute = <A, E, R>(
  cache: MutableHashMap.MutableHashMap<string, A>,
  key: string,
  compute: Effect.Effect<A, E, R>
): Effect.Effect<A, E, R> =>
  Effect.sync(() => MutableHashMap.get(cache, key)).pipe(
    Effect.flatMap(
      Effect.fnUntraced(function* (cached) {
        if (O.isSome(cached)) {
          return yield* Effect.succeed(cached.value);
        }

        return yield* compute.pipe(
          Effect.tap((value) =>
            Effect.sync(() => {
              MutableHashMap.set(cache, key, value);
            })
          )
        );
      })
    )
  );

const discoverWorkspaceScopes = (analysisContext: ReuseAnalysisContextShape, scopeSelector: O.Option<string>) =>
  getCachedOrCompute(
    analysisContext.workspaceScopesBySelector,
    selectorCacheKey(scopeSelector),
    Effect.gen(function* () {
      const runtime = analysisContext.runtime;
      const selectorTokens = parseScopeSelector(scopeSelector);
      const packageJsonPaths = yield* runtime.fsUtils
        .globFiles(WORKSPACE_PACKAGE_PATTERNS, {
          cwd: runtime.repoRoot,
          ignore: ["**/node_modules/**", "**/dist/**"],
        })
        .pipe(Effect.mapError(mapAnalysisError("discoverWorkspaceScopes", "Failed to list workspace manifests")));

      let scopes = A.empty<WorkspaceScope>();

      for (const packageJsonPath of packageJsonPaths) {
        const absolutePackageJsonPath = runtime.path.join(runtime.repoRoot, packageJsonPath);
        const content = yield* runtime.fs
          .readFileString(absolutePackageJsonPath)
          .pipe(Effect.mapError(mapAnalysisError("discoverWorkspaceScopes", `Failed to read ${packageJsonPath}`)));
        const parsedManifest = yield* decodeJsonString(content).pipe(
          Effect.mapError(mapAnalysisError("discoverWorkspaceScopes", `Failed to parse ${packageJsonPath}`))
        );
        const manifest = yield* decodeWorkspacePackageManifest(parsedManifest).pipe(
          Effect.mapError(mapAnalysisError("discoverWorkspaceScopes", `Failed to decode ${packageJsonPath}`))
        );

        const packagePath = normalizeRelativePath(runtime.path.dirname(packageJsonPath));
        const srcPath = normalizeRelativePath(runtime.path.join(packagePath, "src"));
        const tsConfigPath = normalizeRelativePath(runtime.path.join(packagePath, "tsconfig.json"));
        const hasSrc = yield* runtime.fs
          .exists(runtime.path.join(runtime.repoRoot, srcPath))
          .pipe(Effect.mapError(mapAnalysisError("discoverWorkspaceScopes", `Failed to stat ${srcPath}`)));
        const hasTsConfig = yield* runtime.fs
          .exists(runtime.path.join(runtime.repoRoot, tsConfigPath))
          .pipe(Effect.mapError(mapAnalysisError("discoverWorkspaceScopes", `Failed to stat ${tsConfigPath}`)));

        if (!(hasSrc && hasTsConfig)) {
          continue;
        }

        const scope = {
          packageName: manifest.name ?? packagePath,
          packagePath,
          srcPath,
          tsConfigPath,
        } satisfies WorkspaceScope;

        if (matchesScopeSelector(scope, selectorTokens)) {
          scopes = A.append(scopes, scope);
        }
      }

      return pipe(scopes, A.sort(Order.mapInput(Order.String, (scope: WorkspaceScope) => scope.packagePath)));
    })
  );

const collectScopeFiles = (analysisContext: ReuseAnalysisContextShape, scope: WorkspaceScope) =>
  getCachedOrCompute(
    analysisContext.sourceFilesByScope,
    scope.packagePath,
    analysisContext.runtime.fsUtils
      .globFiles(`${scope.srcPath}/**/*.{ts,tsx,mts,cts}`, {
        cwd: analysisContext.runtime.repoRoot,
        ignore: A.fromIterable(PRODUCTION_FILE_IGNORE_PATTERNS),
      })
      .pipe(
        Effect.mapError(
          mapAnalysisError("collectScopeFiles", `Failed to collect source files for ${scope.packagePath}`)
        ),
        Effect.map(flow(A.fromIterable, A.map(normalizeRelativePath), A.sort(Order.String)))
      )
  );

const collectCatalogEntriesForScope = (analysisContext: ReuseAnalysisContextShape, scope: WorkspaceScope) =>
  getCachedOrCompute(
    analysisContext.catalogEntriesByScope,
    scope.packagePath,
    Effect.gen(function* () {
      const runtime = analysisContext.runtime;
      const files = yield* collectScopeFiles(analysisContext, scope);
      const projectScopeRequest = yield* resolveScopeRequest(
        runtime.repoRoot,
        scope.tsConfigPath,
        "collectCatalogEntriesForScope",
        scope.packagePath
      );
      const projectScope = yield* runtime.tsmorph
        .resolveProjectScope(projectScopeRequest)
        .pipe(
          Effect.mapError(
            mapAnalysisError(
              "collectCatalogEntriesForScope",
              `Failed to resolve ts-morph scope for ${scope.packagePath}`
            )
          )
        );
      let entries = A.empty<ReuseCatalogEntry>();

      for (const filePath of files) {
        const fileOutlineRequest = yield* decodeFileOutlineRequest({
          scopeId: projectScope.scopeId,
          filePath,
        }).pipe(
          Effect.mapError(
            mapAnalysisError("collectCatalogEntriesForScope", `Failed to build file outline request for ${filePath}`)
          )
        );
        const outlineOption = yield* runtime.tsmorph.getFileOutline(fileOutlineRequest).pipe(Effect.option);

        if (O.isNone(outlineOption)) {
          continue;
        }

        for (const symbol of outlineOption.value.symbols) {
          entries = A.append(entries, buildCatalogEntry(scope, symbol));
        }
      }

      return entries;
    })
  );

const collectPatternOccurrencesForScope = (analysisContext: ReuseAnalysisContextShape, scope: WorkspaceScope) =>
  getCachedOrCompute(
    analysisContext.patternOccurrencesByScope,
    scope.packagePath,
    Effect.gen(function* () {
      const runtime = analysisContext.runtime;
      const files = yield* collectScopeFiles(analysisContext, scope);
      const projectScopeRequest = yield* resolveScopeRequest(
        runtime.repoRoot,
        scope.tsConfigPath,
        "collectPatternOccurrencesForScope",
        scope.packagePath
      );
      const projectScope = yield* runtime.tsmorph
        .resolveProjectScope(projectScopeRequest)
        .pipe(
          Effect.mapError(
            mapAnalysisError(
              "collectPatternOccurrencesForScope",
              `Failed to resolve ts-morph scope for ${scope.packagePath}`
            )
          )
        );
      const merged: Record<string, Array<PatternOccurrence>> = {};

      for (const filePath of files) {
        const sourceTextOption = yield* runtime.fs
          .readFileString(runtime.path.join(runtime.repoRoot, filePath))
          .pipe(Effect.option);
        const fileOutlineRequest = yield* decodeFileOutlineRequest({
          scopeId: projectScope.scopeId,
          filePath,
        }).pipe(
          Effect.mapError(
            mapAnalysisError(
              "collectPatternOccurrencesForScope",
              `Failed to build file outline request for ${filePath}`
            )
          )
        );
        const outlineOption = yield* runtime.tsmorph.getFileOutline(fileOutlineRequest).pipe(Effect.option);

        if (O.isNone(sourceTextOption)) {
          continue;
        }
        const outlineSymbols = O.isSome(outlineOption) ? outlineOption.value.symbols : [];

        const scanned = scanPatternsInFile(filePath, scope.packagePath, sourceTextOption.value, outlineSymbols);

        for (const [patternId, occurrences] of R.toEntries(scanned)) {
          merged[patternId] = A.appendAll(merged[patternId] ?? A.empty<PatternOccurrence>(), occurrences);
        }
      }

      const resolvedOccurrences: PatternOccurrencesById = merged;
      return resolvedOccurrences;
    })
  );

const collectPatternMatchCountsForScope = (analysisContext: ReuseAnalysisContextShape, scope: WorkspaceScope) =>
  getCachedOrCompute(
    analysisContext.patternMatchCountsByScope,
    scope.packagePath,
    Effect.gen(function* () {
      const runtime = analysisContext.runtime;
      const files = yield* collectScopeFiles(analysisContext, scope);
      const counts: Record<string, number> = {};

      for (const filePath of files) {
        const absoluteFilePath = runtime.path.join(runtime.repoRoot, filePath);
        const sourceText = yield* runtime.fs
          .readFileString(absoluteFilePath)
          .pipe(Effect.mapError(mapAnalysisError("collectPatternMatchCountsForScope", `Failed to read ${filePath}`)));
        const fileCounts = countPatternsInText(sourceText);

        for (const [patternId, count] of R.toEntries(fileCounts)) {
          counts[patternId] = (counts[patternId] ?? 0) + count;
        }
      }

      const resolvedCounts: PatternMatchCountsById = counts;
      return resolvedCounts;
    })
  );

/**
 * Service contract for building a shared reuse catalog from repository scopes plus curated external entries.
 *
 * @category models
 * @since 0.0.0
 */
type ReuseCatalogServiceShape = {
  readonly buildCatalog: (
    scopeSelector?: O.Option<string>
  ) => Effect.Effect<ReadonlyArray<ReuseCatalogEntry>, ReuseAnalysisError>;
};

/**
 * Service tag for the reuse catalog contract.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { ReuseCatalogService } from "@beep/repo-utils/Reuse/Reuse.service"
 * const program = Effect.gen(function* () {
 *   const service = yield* ReuseCatalogService
 *   return service
 * })
 * void program
 * ```
 * @category models
 * @since 0.0.0
 */
export class ReuseCatalogService extends Context.Service<ReuseCatalogService, ReuseCatalogServiceShape>()(
  $I`ReuseCatalogService`
) {}

/**
 * Service contract for turning reuse hotspots into scout and specialist work partitions.
 *
 * @category models
 * @since 0.0.0
 */
type ReusePartitionPlannerServiceShape = {
  readonly buildPartitions: (scopeSelector?: O.Option<string>) => Effect.Effect<ReusePartitionPlan, ReuseAnalysisError>;
};

/**
 * Service tag for reuse partition planning.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { ReusePartitionPlannerService } from "@beep/repo-utils/Reuse/Reuse.service"
 * const program = Effect.gen(function* () {
 *   const service = yield* ReusePartitionPlannerService
 *   return service
 * })
 * void program
 * ```
 * @category models
 * @since 0.0.0
 */
export class ReusePartitionPlannerService extends Context.Service<
  ReusePartitionPlannerService,
  ReusePartitionPlannerServiceShape
>()($I`ReusePartitionPlannerService`) {}

/**
 * Service contract for reuse candidate discovery and file-local reuse option lookups.
 *
 * @category models
 * @since 0.0.0
 */
type ReuseDiscoveryServiceShape = {
  readonly discoverCandidates: (
    scopeSelector?: O.Option<string>
  ) => Effect.Effect<ReadonlyArray<ReuseCandidate>, ReuseAnalysisError>;
  readonly findReuseOptions: (request: {
    readonly filePath: string;
    readonly query: O.Option<string>;
    readonly symbolId: O.Option<string>;
  }) => Effect.Effect<ReuseFindResult, ReuseAnalysisError>;
};

/**
 * Service tag for reuse candidate discovery.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { ReuseDiscoveryService } from "@beep/repo-utils/Reuse/Reuse.service"
 * const program = Effect.gen(function* () {
 *   const service = yield* ReuseDiscoveryService
 *   return service
 * })
 * void program
 * ```
 * @category models
 * @since 0.0.0
 */
export class ReuseDiscoveryService extends Context.Service<ReuseDiscoveryService, ReuseDiscoveryServiceShape>()(
  $I`ReuseDiscoveryService`
) {}

/**
 * Service contract for materializing ranked inventories and implementation packets from discovered candidates.
 *
 * @category models
 * @since 0.0.0
 */
type ReuseInventoryServiceShape = {
  readonly buildInventory: (scopeSelector?: O.Option<string>) => Effect.Effect<ReuseInventory, ReuseAnalysisError>;
  readonly buildPacket: (
    candidateId: string,
    scopeSelector?: O.Option<string>
  ) => Effect.Effect<ReusePacket, ReuseAnalysisError | ReuseCandidateNotFoundError>;
};

/**
 * Service tag for reuse inventory materialization.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { ReuseInventoryService } from "@beep/repo-utils/Reuse/Reuse.service"
 * const program = Effect.gen(function* () {
 *   const service = yield* ReuseInventoryService
 *   return service
 * })
 * void program
 * ```
 * @category models
 * @since 0.0.0
 */
export class ReuseInventoryService extends Context.Service<ReuseInventoryService, ReuseInventoryServiceShape>()(
  $I`ReuseInventoryService`
) {}

const ReuseAnalysisContextLive = Layer.effect(
  ReuseAnalysisContext,
  Effect.gen(function* () {
    const runtime = yield* makeReuseRuntime;

    return ReuseAnalysisContext.of({
      runtime,
      workspaceScopesBySelector: MutableHashMap.empty(),
      sourceFilesByScope: MutableHashMap.empty(),
      catalogEntriesByScope: MutableHashMap.empty(),
      patternOccurrencesByScope: MutableHashMap.empty(),
      patternMatchCountsByScope: MutableHashMap.empty(),
      catalogBySelector: MutableHashMap.empty(),
      candidatesBySelector: MutableHashMap.empty(),
    });
  })
);

/**
 * Default live layer for building the shared reuse catalog.
 *
 * @example
 * ```ts
 * import { ReuseCatalogServiceLive } from "@beep/repo-utils/Reuse/Reuse.service"
 * const layer = ReuseCatalogServiceLive
 * void layer
 * ```
 * @category constructors
 * @since 0.0.0
 */
export const ReuseCatalogServiceLive = Layer.effect(
  ReuseCatalogService,
  Effect.gen(function* () {
    const analysisContext = yield* ReuseAnalysisContext;

    const buildCatalog: ReuseCatalogServiceShape["buildCatalog"] = Effect.fn(function* (scopeSelector = O.none()) {
      const effectiveScopeSelector = catalogScopeSelector(scopeSelector);
      const cacheKey = selectorCacheKey(effectiveScopeSelector);

      return yield* getCachedOrCompute(
        analysisContext.catalogBySelector,
        cacheKey,
        Effect.gen(function* () {
          const scopes = yield* discoverWorkspaceScopes(analysisContext, effectiveScopeSelector);
          let entries = A.empty<ReuseCatalogEntry>();

          for (const scope of scopes) {
            const scopeEntries = yield* collectCatalogEntriesForScope(analysisContext, scope);
            entries = A.appendAll(entries, scopeEntries);
          }

          entries = A.appendAll(entries, CURATED_EFFECT_V4_ENTRIES);
          return pipe(entries, A.sort(Order.mapInput(Order.String, (entry: ReuseCatalogEntry) => entry.id)));
        })
      );
    });

    return ReuseCatalogService.of({
      buildCatalog,
    });
  })
);

/**
 * Default live layer for reuse partition planning.
 *
 * @example
 * ```ts
 * import { ReusePartitionPlannerServiceLive } from "@beep/repo-utils/Reuse/Reuse.service"
 * const layer = ReusePartitionPlannerServiceLive
 * void layer
 * ```
 * @category constructors
 * @since 0.0.0
 */
export const ReusePartitionPlannerServiceLive = Layer.effect(
  ReusePartitionPlannerService,
  Effect.gen(function* () {
    const analysisContext = yield* ReuseAnalysisContext;
    const catalogService = yield* ReuseCatalogService;

    const buildPartitions: ReusePartitionPlannerServiceShape["buildPartitions"] = Effect.fn(function* (
      scopeSelector = O.none()
    ) {
      const scopes = yield* discoverWorkspaceScopes(analysisContext, scopeSelector);
      const catalogEntries = yield* catalogService.buildCatalog(scopeSelector);
      const scoutUnits = pipe(scopes, A.map(makeScoutWorkUnit));
      const specialistHotspots: Record<
        string,
        {
          readonly label: string;
          readonly rationale: string;
          readonly selectors: Array<string>;
          totalOccurrences: number;
        }
      > = {};

      for (const scope of scopes) {
        const matchCounts = yield* collectPatternMatchCountsForScope(analysisContext, scope);

        for (const pattern of PATTERN_DEFINITIONS) {
          const matchedCount = pipe(
            R.get(matchCounts, pattern.id),
            O.getOrElse(() => 0)
          );
          if (matchedCount === 0) {
            continue;
          }

          const existing = specialistHotspots[pattern.specialistLabel];
          specialistHotspots[pattern.specialistLabel] =
            existing === undefined
              ? {
                  label: pattern.specialistLabel,
                  rationale: pattern.rationale,
                  selectors: A.of(scope.packagePath),
                  totalOccurrences: matchedCount,
                }
              : {
                  ...existing,
                  selectors: A.append(existing.selectors, scope.packagePath),
                  totalOccurrences: existing.totalOccurrences + matchedCount,
                };
        }
      }

      let eligibleHotspots: Array<{
        readonly label: string;
        readonly rationale: string;
        readonly selectors: Array<string>;
        totalOccurrences: number;
      }> = [];
      for (const label of R.keys(specialistHotspots)) {
        const hotspot = specialistHotspots[label];
        if (hotspot === undefined || hotspot.totalOccurrences < 2) {
          continue;
        }
        eligibleHotspots = A.append(eligibleHotspots, hotspot);
      }

      const byHotspotLabelAscending: Order.Order<(typeof eligibleHotspots)[number]> = Order.mapInput(
        Order.String,
        (hotspot: (typeof eligibleHotspots)[number]) => hotspot.label
      );
      const specialistUnits = pipe(
        eligibleHotspots,
        A.sort(byHotspotLabelAscending),
        A.map((hotspot) => makeSpecialistWorkUnit(hotspot.label, hotspot.selectors, hotspot.rationale))
      );

      return ReusePartitionPlan.make({
        scopeSelector: scopeSelectorLabel(scopeSelector, scopes),
        scoutUnits,
        specialistUnits,
        catalogEntryCount: yield* decodeNonNegativeInt(catalogEntries.length).pipe(
          Effect.mapError(mapAnalysisError("buildPartitions", "Failed to normalize reuse catalog entry count"))
        ),
      });
    });

    return ReusePartitionPlannerService.of({
      buildPartitions,
    });
  })
);

/**
 * Default live layer for reuse candidate discovery and local option lookup.
 *
 * @example
 * ```ts
 * import { ReuseDiscoveryServiceLive } from "@beep/repo-utils/Reuse/Reuse.service"
 * const layer = ReuseDiscoveryServiceLive
 * void layer
 * ```
 * @category constructors
 * @since 0.0.0
 */
export const ReuseDiscoveryServiceLive = Layer.effect(
  ReuseDiscoveryService,
  Effect.gen(function* () {
    const analysisContext = yield* ReuseAnalysisContext;
    const catalogService = yield* ReuseCatalogService;

    const discoverCandidates: ReuseDiscoveryServiceShape["discoverCandidates"] = Effect.fn(function* (
      scopeSelector = O.none()
    ) {
      return yield* getCachedOrCompute(
        analysisContext.candidatesBySelector,
        selectorCacheKey(scopeSelector),
        Effect.gen(function* () {
          const scopes = yield* discoverWorkspaceScopes(analysisContext, scopeSelector);
          const catalogEntries = yield* catalogService.buildCatalog(scopeSelector);
          const mergedOccurrences: Record<string, Array<PatternOccurrence>> = {};

          for (const scope of scopes) {
            const scopedOccurrences = yield* collectPatternOccurrencesForScope(analysisContext, scope);
            for (const [patternId, occurrences] of R.toEntries(scopedOccurrences)) {
              mergedOccurrences[patternId] = A.appendAll(
                mergedOccurrences[patternId] ?? A.empty<PatternOccurrence>(),
                occurrences
              );
            }
          }

          let candidates = A.empty<ReuseCandidate>();
          for (const pattern of PATTERN_DEFINITIONS) {
            const occurrences = mergedOccurrences[pattern.id] ?? [];
            if (occurrences.length >= 2) {
              candidates = A.append(candidates, candidateFromPattern(pattern, occurrences, catalogEntries));
            }
          }

          return pipe(
            candidates,
            A.sort(
              Order.combine(
                Order.mapInput(Order.Number, (candidate: ReuseCandidate) => -candidate.confidence),
                Order.mapInput(Order.String, (candidate: ReuseCandidate) => candidate.candidateId)
              )
            )
          );
        })
      );
    });

    const findReuseOptions: ReuseDiscoveryServiceShape["findReuseOptions"] = Effect.fn(function* ({
      filePath,
      query,
      symbolId,
    }) {
      const runtime = analysisContext.runtime;
      const normalizedFilePath = canonicalizeRelativePath(
        runtime.path.isAbsolute(filePath) ? runtime.path.relative(runtime.repoRoot, filePath) : filePath
      );

      if (normalizedFilePath.length === 0 || normalizedFilePath === ".." || Str.startsWith("../")(normalizedFilePath)) {
        return yield* mkAnalysisError(
          "findReuseOptions",
          `Target file must be a repo-relative path inside the repository: ${filePath}`
        );
      }

      const absoluteFilePath = runtime.path.resolve(runtime.repoRoot, normalizedFilePath);
      const exists = yield* runtime.fs
        .exists(absoluteFilePath)
        .pipe(Effect.mapError(mapAnalysisError("findReuseOptions", `Failed to stat ${normalizedFilePath}`)));

      if (!exists) {
        return yield* mkAnalysisError("findReuseOptions", `Target file does not exist: ${normalizedFilePath}`);
      }

      const scopes = yield* discoverWorkspaceScopes(analysisContext, O.none());
      const owningScopeOption = pipe(
        scopes,
        A.findFirst(
          (scope) =>
            normalizedFilePath === scope.packagePath || Str.startsWith(`${scope.packagePath}/`)(normalizedFilePath)
        )
      );

      if (O.isNone(owningScopeOption)) {
        return yield* mkAnalysisError(
          "findReuseOptions",
          `Could not resolve an owning workspace scope for ${normalizedFilePath}`
        );
      }

      const owningScope = owningScopeOption.value;
      const inventoryCandidates = yield* discoverCandidates(O.some(owningScope.packagePath));
      const localSuggestions = pipe(
        inventoryCandidates,
        A.filter((candidate) =>
          pipe(
            candidate.evidence,
            A.some((line) => Str.startsWith(`${normalizedFilePath}:`)(line))
          )
        )
      );
      const catalogEntries = yield* catalogService.buildCatalog(O.some(owningScope.packagePath));
      let queryKeywords = A.empty<string>();

      if (O.isSome(query)) {
        queryKeywords = A.appendAll(queryKeywords, lowerKeywords(query.value));
      }

      if (O.isSome(symbolId)) {
        const projectScopeRequest = yield* resolveScopeRequest(
          runtime.repoRoot,
          owningScope.tsConfigPath,
          "findReuseOptions",
          owningScope.packagePath
        );
        const projectScope = yield* runtime.tsmorph
          .resolveProjectScope(projectScopeRequest)
          .pipe(
            Effect.mapError(
              mapAnalysisError("findReuseOptions", `Failed to resolve ts-morph scope for ${owningScope.packagePath}`)
            )
          );
        const symbolLookupRequest = yield* decodeSymbolLookupRequest({
          scopeId: projectScope.scopeId,
          symbolId: symbolId.value,
        }).pipe(
          Effect.mapError(
            mapAnalysisError("findReuseOptions", `Failed to build symbol lookup request for ${symbolId.value}`)
          )
        );
        const lookup = yield* runtime.tsmorph
          .getSymbolById(symbolLookupRequest)
          .pipe(Effect.mapError(mapAnalysisError("findReuseOptions", `Failed to lookup symbol ${symbolId.value}`)));

        queryKeywords = A.appendAll(
          queryKeywords,
          lowerKeywordsFromParts([
            lookup.symbol.name,
            lookup.symbol.qualifiedName,
            lookup.symbol.signature,
            O.getOrElse(lookup.symbol.summary, () => ""),
            O.getOrElse(lookup.symbol.docstring, () => ""),
          ])
        );
      }

      if (queryKeywords.length === 0) {
        queryKeywords = A.appendAll(queryKeywords, lowerKeywords(normalizedFilePath));
      }

      return ReuseFindResult.make({
        filePath: normalizedFilePath,
        query,
        symbolId,
        matches: rankCatalogMatches(catalogEntries, queryKeywords),
        candidateSuggestions: localSuggestions,
      });
    });

    return ReuseDiscoveryService.of({
      discoverCandidates,
      findReuseOptions,
    });
  })
);

/**
 * Default live layer for ranked reuse inventories and implementation packets.
 *
 * @example
 * ```ts
 * import { ReuseInventoryServiceLive } from "@beep/repo-utils/Reuse/Reuse.service"
 * const layer = ReuseInventoryServiceLive
 * void layer
 * ```
 * @category constructors
 * @since 0.0.0
 */
export const ReuseInventoryServiceLive = Layer.effect(
  ReuseInventoryService,
  Effect.gen(function* () {
    const analysisContext = yield* ReuseAnalysisContext;
    const catalogService = yield* ReuseCatalogService;
    const discoveryService = yield* ReuseDiscoveryService;

    const buildInventory: ReuseInventoryServiceShape["buildInventory"] = Effect.fn(function* (
      scopeSelector = O.none()
    ) {
      const scopes = yield* discoverWorkspaceScopes(analysisContext, scopeSelector);
      const catalogEntries = yield* catalogService.buildCatalog(scopeSelector);
      const candidates = yield* discoveryService.discoverCandidates(scopeSelector);
      const generatedAt = yield* DateTime.now.pipe(
        Effect.map(DateTime.toDateUtc),
        Effect.map((date) => date.toISOString())
      );

      return ReuseInventory.make({
        scopeSelector: scopeSelectorLabel(scopeSelector, scopes),
        generatedAt,
        catalogEntryCount: yield* decodeNonNegativeInt(catalogEntries.length).pipe(
          Effect.mapError(mapAnalysisError("buildInventory", "Failed to normalize reuse catalog entry count"))
        ),
        candidateCount: yield* decodeNonNegativeInt(candidates.length).pipe(
          Effect.mapError(mapAnalysisError("buildInventory", "Failed to normalize reuse candidate count"))
        ),
        candidates,
      });
    });

    const buildPacket: ReuseInventoryServiceShape["buildPacket"] = Effect.fn(function* (
      candidateId,
      scopeSelector = O.none()
    ) {
      const inventory = yield* buildInventory(scopeSelector);
      const candidateOption = pipe(
        inventory.candidates,
        A.findFirst((entry) => entry.candidateId === candidateId)
      );

      if (O.isNone(candidateOption)) {
        return yield* ReuseCandidateNotFoundError.make({
          candidateId,
          scopeSelector: inventory.scopeSelector,
        });
      }

      const candidate = candidateOption.value;
      const catalogEntries = yield* catalogService.buildCatalog(scopeSelector);
      const catalogMatches = pipe(
        catalogEntries,
        A.filter((entry) => A.contains(candidate.catalogMatchIds, entry.id))
      );

      return ReusePacket.make({
        candidate,
        catalogMatches,
      });
    });

    return ReuseInventoryService.of({
      buildInventory,
      buildPacket,
    });
  })
);

const ReuseCatalogAndDiscoveryLive = Layer.mergeAll(
  ReuseCatalogServiceLive,
  ReuseDiscoveryServiceLive.pipe(Layer.provideMerge(ReuseCatalogServiceLive))
);

/**
 * Fully wired reuse-discovery layer suite for CLI and tests.
 *
 * @example
 * ```ts
 * import { ReuseServiceSuiteLive } from "@beep/repo-utils/Reuse/Reuse.service"
 * const layer = ReuseServiceSuiteLive
 * void layer
 * ```
 * @category constructors
 * @since 0.0.0
 */
export const ReuseServiceSuiteLive = Layer.mergeAll(
  ReuseCatalogAndDiscoveryLive,
  ReusePartitionPlannerServiceLive.pipe(Layer.provideMerge(ReuseCatalogServiceLive)),
  ReuseInventoryServiceLive.pipe(Layer.provide(ReuseCatalogAndDiscoveryLive))
).pipe(Layer.provideMerge(ReuseAnalysisContextLive));
