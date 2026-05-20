/**
 * Deterministic lookup scoring over the generated repo export catalog.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { A, Str } from "@beep/utils";
import { flow, Order, pipe } from "effect";
import * as O from "effect/Option";
import {
  RepoCodegraphBoundaryAdvice,
  type RepoCodegraphBoundaryStatus,
  type RepoCodegraphFreshnessStatus,
  RepoCodegraphImportCandidate,
  RepoCodegraphLookupMatch,
  type RepoCodegraphLookupRequest,
  RepoCodegraphLookupResult,
  RepoCodegraphLookupScore,
  RepoCodegraphLookupTotals,
  type RepoCodegraphPackageImportPolicy,
  type RepoCodegraphPreferredImport,
} from "./RepoCodegraphLookup.model.ts";
import type {
  RepoExportsCatalog,
  RepoExportsCatalogEntry,
  RepoExportsCatalogPackage,
} from "./RepoExportsCatalog.model.ts";

const defaultFreshnessWarning =
  "Catalog freshness was not checked; run with --strict or `bun run repo-exports:catalog:check`.";
const boundaryCitations = ["standards/ARCHITECTURE.md", "standards/architecture/07-non-slice-families.md"] as const;

type ScoredEntry = {
  readonly entry: RepoExportsCatalogEntry;
  readonly score: RepoCodegraphLookupScore;
  readonly boundary: RepoCodegraphBoundaryAdvice;
};

const normalizeCamelCase = Str.replace(/([a-z0-9])([A-Z])/gu, "$1 $2");
const normalizeSearchText = flow(normalizeCamelCase, Str.toLowerCase, Str.replace(/[^a-z0-9@/._-]+/gu, " "), Str.trim);

const tokenize = flow(normalizeSearchText, Str.split(" "), A.map(Str.trim), A.filter(Str.isNonEmpty), A.dedupe);

const uniqueSortedStrings = (values: ReadonlyArray<string>): ReadonlyArray<string> =>
  pipe(values, A.dedupe, A.sort(Order.String));

const entryIdentity = (entry: RepoExportsCatalogEntry): string =>
  `${entry.packageName}:${entry.symbolName}:${entry.exportKind}:${entry.sourcePath}:${entry.sourceLine}`;

const symbolTokenText = (entry: RepoExportsCatalogEntry): string => pipe(tokenize(entry.symbolName), A.join(" "));

const tokenCoverage = (tokens: ReadonlyArray<string>, candidateText: string): number => {
  if (A.length(tokens) === 0) {
    return 0;
  }

  const hits = pipe(
    tokens,
    A.reduce(0, (count, token) => (Str.includes(token)(candidateText) ? count + 1 : count))
  );

  return hits / A.length(tokens);
};

const exactScore = (requestText: string, entry: RepoExportsCatalogEntry): number => {
  const symbolText = normalizeSearchText(entry.symbolName);
  const request = normalizeSearchText(requestText);
  if (symbolText === request) {
    return 80;
  }

  if (Str.includes(request)(symbolText) || Str.includes(symbolText)(request)) {
    return 55;
  }

  const symbolTokens = symbolTokenText(entry);
  return tokenCoverage(tokenize(requestText), symbolTokens) * 45;
};

const lexicalScore = (tokens: ReadonlyArray<string>, entry: RepoExportsCatalogEntry): number =>
  tokenCoverage(tokens, normalizeSearchText(entry.searchText)) * 35;

const semanticScore = (tokens: ReadonlyArray<string>, entry: RepoExportsCatalogEntry): number => {
  const categoryText = pipe([...entry.categories, entry.summary], A.join(" "), normalizeSearchText);
  return tokenCoverage(tokens, categoryText) * 15;
};

const graphScore = (entry: RepoExportsCatalogEntry): number => {
  if (entry.importSpecifier === entry.packageName) {
    return 8;
  }
  if (entry.exportSubpath === ".") {
    return 6;
  }
  if (!Str.endsWith("/index")(entry.importSpecifier)) {
    return 4;
  }
  return 2;
};

const boundaryScore = (status: RepoCodegraphBoundaryStatus): number => {
  if (status === "allowed") {
    return 5;
  }
  if (status === "advisory") {
    return 1;
  }
  if (status === "blocked") {
    return -50;
  }
  return 0;
};

const scoreEntry = (
  queryTokens: ReadonlyArray<string>,
  request: RepoCodegraphLookupRequest,
  boundary: RepoCodegraphBoundaryAdvice,
  entry: RepoExportsCatalogEntry
): RepoCodegraphLookupScore => {
  const exact = exactScore(request.query, entry);
  const lexical = lexicalScore(queryTokens, entry);
  const semantic = semanticScore(queryTokens, entry);
  const graph = graphScore(entry);
  const boundaryComponent = boundaryScore(boundary.status);

  return new RepoCodegraphLookupScore({
    boundary: boundaryComponent,
    exact,
    graph,
    lexical,
    semantic,
    total: exact + lexical + semantic + graph + boundaryComponent,
  });
};

const packageFamily = (packagePath: string): string => {
  if (Str.startsWith("packages/foundation/")(packagePath)) {
    return "foundation";
  }
  if (Str.startsWith("packages/tooling/")(packagePath)) {
    return "tooling";
  }
  if (Str.startsWith("packages/drivers/")(packagePath)) {
    return "drivers";
  }
  if (Str.startsWith("apps/")(packagePath)) {
    return "app";
  }
  if (Str.includes("-domain")(packagePath)) {
    return "domain";
  }
  if (Str.includes("-use-cases")(packagePath)) {
    return "use-cases";
  }
  if (Str.includes("-server")(packagePath)) {
    return "server";
  }
  if (Str.includes("-client")(packagePath) || Str.includes("-ui")(packagePath)) {
    return "client";
  }
  return "unknown";
};

const resolveFromPackage = (
  catalog: RepoExportsCatalog,
  fromPackage: O.Option<string>
): O.Option<RepoExportsCatalogPackage> =>
  pipe(
    fromPackage,
    O.flatMap((selector) =>
      pipe(
        catalog.packages,
        A.findFirst(
          (pkg) =>
            pkg.packageName === selector ||
            pkg.packagePath === selector ||
            Str.startsWith(`${pkg.packagePath}/`)(selector)
        )
      )
    )
  );

const boundaryAdvice = (
  fromPackage: O.Option<RepoExportsCatalogPackage>,
  target: RepoExportsCatalogEntry
): RepoCodegraphBoundaryAdvice => {
  if (O.isNone(fromPackage)) {
    return new RepoCodegraphBoundaryAdvice({
      citations: [],
      reason: "No caller package was supplied; lookup can only show legal public exports.",
      status: "unknown",
    });
  }

  if (fromPackage.value.packageName === target.packageName) {
    return new RepoCodegraphBoundaryAdvice({
      citations: [...boundaryCitations],
      reason: "Caller and target are the same package.",
      status: "allowed",
    });
  }

  const sourceFamily = packageFamily(fromPackage.value.packagePath);
  const targetFamily = packageFamily(target.packagePath);

  if (targetFamily === "foundation") {
    return new RepoCodegraphBoundaryAdvice({
      citations: [...boundaryCitations],
      reason: "Foundation packages are the shared low-level surface for higher packages.",
      status: "allowed",
    });
  }

  if (
    sourceFamily === "foundation" &&
    (targetFamily === "tooling" || targetFamily === "drivers" || targetFamily === "app")
  ) {
    return new RepoCodegraphBoundaryAdvice({
      citations: [...boundaryCitations],
      reason: "Foundation packages should not depend upward into tooling, drivers, or apps.",
      status: "blocked",
    });
  }

  if (sourceFamily === "tooling") {
    return new RepoCodegraphBoundaryAdvice({
      citations: [...boundaryCitations],
      reason:
        "Tooling may consume public tooling, foundation, and driver surfaces when the package dependency allows it.",
      status: "allowed",
    });
  }

  if ((sourceFamily === "domain" || sourceFamily === "use-cases") && targetFamily === "drivers") {
    return new RepoCodegraphBoundaryAdvice({
      citations: [...boundaryCitations],
      reason: "Domain and use-case packages should keep external driver dependencies at explicit boundaries.",
      status: "blocked",
    });
  }

  return new RepoCodegraphBoundaryAdvice({
    citations: [...boundaryCitations],
    reason: `No precise boundary rule was encoded for ${sourceFamily} -> ${targetFamily}; treat this as advisory.`,
    status: "advisory",
  });
};

const importCandidateOrder: Order.Order<RepoCodegraphImportCandidate> = Order.combine(
  Order.mapInput(Order.Number, (candidate) => (candidate.isRecommended ? 0 : 1)),
  Order.combine(
    Order.mapInput(Order.Number, (candidate) => candidate.importSpecifier.length),
    Order.mapInput(Order.String, (candidate) => candidate.importSpecifier)
  )
);

const entryImportOrder: Order.Order<RepoExportsCatalogEntry> = Order.combine(
  Order.mapInput(Order.Number, (entry) => (entry.importSpecifier === entry.packageName ? 0 : 1)),
  Order.combine(
    Order.mapInput(Order.Number, (entry) => (entry.exportSubpath === "." ? 0 : 1)),
    Order.combine(
      Order.mapInput(Order.Number, (entry) => entry.importSpecifier.length),
      Order.mapInput(Order.String, (entry) => entry.importSpecifier)
    )
  )
);

const preferredImportForSymbol = (
  policies: ReadonlyArray<RepoCodegraphPackageImportPolicy>,
  entry: RepoExportsCatalogEntry,
  legalImportSpecifiers: ReadonlyArray<string>
): O.Option<RepoCodegraphPreferredImport> =>
  pipe(
    policies,
    A.findFirst((policy) => policy.packageName === entry.packageName || policy.packagePath === entry.packagePath),
    O.flatMap((policy) =>
      pipe(
        policy.preferredImports,
        A.findFirst(
          (preferred) =>
            A.contains(legalImportSpecifiers, preferred.importSpecifier) &&
            (A.length(preferred.symbols) === 0 || A.contains(preferred.symbols, entry.symbolName))
        )
      )
    )
  );

const fallbackRecommendedEntry = (entries: ReadonlyArray<RepoExportsCatalogEntry>): RepoExportsCatalogEntry =>
  pipe(entries, A.sort(entryImportOrder), A.head, O.getOrThrow);

const reasonForCandidate = (
  recommendedSpecifier: string,
  entry: RepoExportsCatalogEntry,
  preferred: O.Option<RepoCodegraphPreferredImport>
): O.Option<string> =>
  pipe(
    preferred,
    O.flatMap((policy) => policy.reason),
    O.orElse(() =>
      entry.importSpecifier === entry.packageName
        ? O.some("Package root export is the shortest public import surface.")
        : O.some(`Shortest legal public import for ${entry.exportSubpath}.`)
    ),
    O.filter(() => recommendedSpecifier === entry.importSpecifier)
  );

const legalImportCandidates = (
  catalog: RepoExportsCatalog,
  policies: ReadonlyArray<RepoCodegraphPackageImportPolicy>,
  entry: RepoExportsCatalogEntry
): ReadonlyArray<RepoCodegraphImportCandidate> => {
  const entries = pipe(
    catalog.packages,
    A.flatMap((pkg) => pkg.exports),
    A.filter((candidate) => entryIdentity(candidate) === entryIdentity(entry)),
    A.sort(entryImportOrder),
    A.dedupeWith((left, right) => left.importSpecifier === right.importSpecifier)
  );
  const importSpecifiers = pipe(
    entries,
    A.map((candidate) => candidate.importSpecifier),
    uniqueSortedStrings
  );
  const preferred = preferredImportForSymbol(policies, entry, importSpecifiers);
  const recommendedEntry = pipe(
    preferred,
    O.map((rule) =>
      pipe(
        entries,
        A.findFirst((candidate) => candidate.importSpecifier === rule.importSpecifier),
        O.getOrElse(() => fallbackRecommendedEntry(entries))
      )
    ),
    O.getOrElse(() => fallbackRecommendedEntry(entries))
  );

  return pipe(
    entries,
    A.map((candidate) => {
      const isRecommended = candidate.importSpecifier === recommendedEntry.importSpecifier;
      return new RepoCodegraphImportCandidate({
        exportSubpath: candidate.exportSubpath,
        importSpecifier: candidate.importSpecifier,
        isRecommended,
        reason: isRecommended ? reasonForCandidate(recommendedEntry.importSpecifier, candidate, preferred) : O.none(),
      });
    }),
    A.sort(importCandidateOrder)
  );
};

const toLookupMatch = (
  catalog: RepoExportsCatalog,
  policies: ReadonlyArray<RepoCodegraphPackageImportPolicy>,
  scored: ScoredEntry
): RepoCodegraphLookupMatch => {
  const legalImports = legalImportCandidates(catalog, policies, scored.entry);
  const recommendedImport = pipe(legalImports, A.head, O.getOrThrow);
  const summary = Str.isNonEmpty(Str.trim(scored.entry.summary)) ? O.some(scored.entry.summary) : O.none<string>();

  return new RepoCodegraphLookupMatch({
    boundary: scored.boundary,
    exportKind: scored.entry.exportKind,
    legalImports,
    packageName: scored.entry.packageName,
    packagePath: scored.entry.packagePath,
    recommendedImport,
    score: scored.score,
    sourceLine: scored.entry.sourceLine,
    sourcePath: scored.entry.sourcePath,
    summary,
    symbolName: scored.entry.symbolName,
  });
};

const scoredEntryOrder: Order.Order<ScoredEntry> = Order.combine(
  Order.mapInput(Order.Number, (entry) => -entry.score.total),
  Order.combine(
    Order.mapInput(Order.String, (entry) => entry.entry.packageName),
    Order.combine(
      Order.mapInput(Order.String, (entry) => entry.entry.symbolName),
      Order.mapInput(Order.Number, (entry) => entry.entry.sourceLine)
    )
  )
);

/**
 * Lookup public repo exports by symbol name or free-text intent.
 *
 * @example
 * ```ts
 * import { lookupRepoExports } from "@beep/repo-codegraph"
 * console.log(lookupRepoExports)
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const lookupRepoExports = (
  catalog: RepoExportsCatalog,
  request: RepoCodegraphLookupRequest,
  options?: {
    readonly freshnessStatus?: RepoCodegraphFreshnessStatus;
    readonly importPolicies?: ReadonlyArray<RepoCodegraphPackageImportPolicy>;
  }
): RepoCodegraphLookupResult => {
  const queryTokens = tokenize(request.query);
  const fromPackage = resolveFromPackage(catalog, request.fromPackage);
  const importPolicies = options?.importPolicies ?? [];
  const entries = pipe(
    catalog.packages,
    A.flatMap((pkg) => pkg.exports)
  );
  const scored = pipe(
    entries,
    A.map((entry) => {
      const boundary = boundaryAdvice(fromPackage, entry);
      return {
        boundary,
        entry,
        score: scoreEntry(queryTokens, request, boundary, entry),
      };
    }),
    A.filter((entry) => entry.score.total > 0),
    A.sort(scoredEntryOrder),
    A.dedupeWith((left, right) => entryIdentity(left.entry) === entryIdentity(right.entry))
  );
  const matches = pipe(
    scored,
    A.take(request.limit),
    A.map((entry) => toLookupMatch(catalog, importPolicies, entry))
  );
  const freshnessStatus = options?.freshnessStatus ?? "unchecked";
  const warnings = freshnessStatus === "unchecked" ? [defaultFreshnessWarning] : [];

  return new RepoCodegraphLookupResult({
    freshnessStatus,
    fromPackage: request.fromPackage,
    limit: request.limit,
    matches,
    query: request.query,
    schemaVersion: "repo-codegraph.lookup/v1",
    totals: new RepoCodegraphLookupTotals({
      catalogEntries: A.length(entries),
      matchedEntries: A.length(scored),
      returnedMatches: A.length(matches),
    }),
    warnings,
  });
};
