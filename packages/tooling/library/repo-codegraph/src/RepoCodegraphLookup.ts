/**
 * Deterministic lookup scoring over the generated repo export catalog.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCodegraphId } from "@beep/identity/packages";
import { A, Str } from "@beep/utils";
import { flow, identity, Order, pipe } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import {
  RepoCodegraphBoundaryAdvice,
  RepoCodegraphFreshnessStatus,
  RepoCodegraphImportCandidate,
  RepoCodegraphLookupMatch,
  RepoCodegraphLookupResult,
  RepoCodegraphLookupScore,
  RepoCodegraphLookupTotals,
  RepoCodegraphPackageImportPolicy,
} from "./RepoCodegraphLookup.model.ts";
import { RepoExportsCatalogEntry, RepoExportsCatalogPackage } from "./RepoExportsCatalog.model.ts";
import type {
  RepoCodegraphBoundaryStatus,
  RepoCodegraphLookupRequest,
  RepoCodegraphPreferredImport,
} from "./RepoCodegraphLookup.model.ts";
import type { RepoExportsCatalog } from "./RepoExportsCatalog.model.ts";

const $I = $RepoCodegraphId.create("RepoCodegraphLookup");

const defaultFreshnessWarning =
  "Catalog freshness was not checked; run with --strict or `bun run repo-exports:catalog:check`.";
const boundaryCitations = ["standards/ARCHITECTURE.md", "standards/architecture/07-non-slice-families.md"] as const;

class ScoredEntry extends S.Class<ScoredEntry>($I`ScoredEntry`)(
  {
    entry: RepoExportsCatalogEntry,
    score: RepoCodegraphLookupScore,
    boundary: RepoCodegraphBoundaryAdvice,
  },
  $I.annote("ScoredEntry", {
    description: "A scored entry from the repo exports catalog",
  })
) {}

/**
 * Resolved package and selector details for a lookup request.
 *
 * @example
 * ```ts
 * import { FromPackageResolution } from "@beep/repo-codegraph/RepoCodegraphLookup"
 * console.log(FromPackageResolution)
 * ```
 * @category models
 * @since 0.0.0
 */
export class FromPackageResolution extends S.Class<FromPackageResolution>($I`FromPackageResolution`)(
  {
    package: S.Option(RepoExportsCatalogPackage),
    selector: S.Option(S.String),
  },
  $I.annote("FromPackageResolution", {
    description: "A package resolution from the repo exports catalog",
  })
) {}

/**
 * Optional freshness and import-policy inputs for repo codegraph lookup.
 *
 * @example
 * ```ts
 * import { LookupOptions } from "@beep/repo-codegraph/RepoCodegraphLookup"
 * console.log(LookupOptions)
 * ```
 * @category models
 * @since 0.0.0
 */
export class LookupOptions extends S.Class<LookupOptions>($I`LookupOptions`)(
  {
    freshnessStatus: S.optionalKey(RepoCodegraphFreshnessStatus),
    importPolicies: RepoCodegraphPackageImportPolicy.pipe(S.Array, S.optionalKey),
  },
  $I.annote("LookupOptions", {
    description: "Options for the repo codegraph lookup",
  })
) {}

/**
 * Normalized path-like selector tokens used for catalog matching.
 *
 * @example
 * ```ts
 * import { NormalizedPathLikeSelector } from "@beep/repo-codegraph/RepoCodegraphLookup"
 * console.log(NormalizedPathLikeSelector)
 * ```
 * @category models
 * @since 0.0.0
 */
export class NormalizedPathLikeSelector extends S.Class<NormalizedPathLikeSelector>($I`NormalizedPathLikeSelector`)(
  {
    escapedRoot: S.Boolean,
    segments: S.Array(S.String),
  },
  $I.annote("NormalizedPathLikeSelector", {
    description: "A normalized path-like selector for repo codegraph lookup",
  })
) {}

const normalizeCamelCase = Str.replace(/([a-z0-9])([A-Z])/gu, "$1 $2");
const normalizeSearchText = flow(normalizeCamelCase, Str.toLowerCase, Str.replace(/[^a-z0-9@/._-]+/gu, " "), Str.trim);

const tokenize = flow(normalizeSearchText, Str.split(" "), A.map(Str.trim), A.filter(Str.isNonEmpty), A.dedupe);

const uniqueSortedStrings: (values: ReadonlyArray<string>) => ReadonlyArray<string> = flow(
  A.dedupe<ReadonlyArray<string>>,
  A.sort(Order.String)
);

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

  return RepoCodegraphLookupScore.make({
    boundary: boundaryComponent,
    exact,
    graph,
    lexical,
    semantic,
    total: exact + lexical + semantic + graph + boundaryComponent,
  });
};

const packageFamily = (packagePath: string): string => {
  const pathSegments = pipe(packagePath, Str.split("/"));

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
  if (A.contains(pathSegments, "domain")) {
    return "domain";
  }
  if (A.contains(pathSegments, "use-cases")) {
    return "use-cases";
  }
  if (A.contains(pathSegments, "server")) {
    return "server";
  }
  if (A.contains(pathSegments, "client") || A.contains(pathSegments, "ui")) {
    return "client";
  }
  return "unknown";
};

const isRepoExportsCatalogArgument = (value: unknown): value is RepoExportsCatalog =>
  P.hasProperty(value, "packages") && P.hasProperty(value, "schemaVersion");

const normalizePathLikeSelector = (selector: string): string => {
  const normalized = pipe(selector, Str.trim, Str.replace(/\\/gu, "/"), Str.replace(/\/+/gu, "/"));
  const state = pipe(
    normalized,
    Str.split("/"),
    A.reduce<NormalizedPathLikeSelector, string>(
      {
        escapedRoot: false,
        segments: A.empty(),
      },
      (state, segment) => {
        if (state.escapedRoot || segment === "" || segment === ".") {
          return state;
        }
        if (segment === "..") {
          if (A.isReadonlyArrayNonEmpty(state.segments)) {
            return {
              escapedRoot: false,
              segments: A.dropRight(state.segments, 1),
            };
          }
          return {
            escapedRoot: true,
            segments: state.segments,
          };
        }
        return {
          escapedRoot: false,
          segments: A.append(state.segments, segment),
        };
      }
    )
  );
  return state.escapedRoot ? normalized : pipe(state.segments, A.join("/"));
};

const resolveFromPackage = (catalog: RepoExportsCatalog, fromPackage: O.Option<string>): FromPackageResolution => ({
  package: pipe(
    fromPackage,
    O.map(normalizePathLikeSelector),
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
  ),
  selector: fromPackage,
});

const boundaryAdvice = (
  fromPackage: FromPackageResolution,
  target: RepoExportsCatalogEntry
): RepoCodegraphBoundaryAdvice => {
  if (O.isNone(fromPackage.package)) {
    const reason = pipe(
      fromPackage.selector,
      O.map((selector) => `Caller package selector "${selector}" did not match any catalog package.`),
      O.getOrElse(() => "No caller package was supplied; lookup can only show legal public exports.")
    );
    return RepoCodegraphBoundaryAdvice.make({
      citations: [],
      reason,
      status: "unknown",
    });
  }

  if (fromPackage.package.value.packageName === target.packageName) {
    return RepoCodegraphBoundaryAdvice.make({
      citations: [...boundaryCitations],
      reason: "Caller and target are the same package.",
      status: "allowed",
    });
  }

  const sourceFamily = packageFamily(fromPackage.package.value.packagePath);
  const targetFamily = packageFamily(target.packagePath);

  if (targetFamily === "foundation") {
    return RepoCodegraphBoundaryAdvice.make({
      citations: [...boundaryCitations],
      reason: "Foundation packages are the shared low-level surface for higher packages.",
      status: "allowed",
    });
  }

  if (
    sourceFamily === "foundation" &&
    (targetFamily === "tooling" || targetFamily === "drivers" || targetFamily === "app")
  ) {
    return RepoCodegraphBoundaryAdvice.make({
      citations: [...boundaryCitations],
      reason: "Foundation packages should not depend upward into tooling, drivers, or apps.",
      status: "blocked",
    });
  }

  if (sourceFamily === "tooling") {
    return RepoCodegraphBoundaryAdvice.make({
      citations: [...boundaryCitations],
      reason:
        "Tooling may consume public tooling, foundation, and driver surfaces when the package dependency allows it.",
      status: "allowed",
    });
  }

  if ((sourceFamily === "domain" || sourceFamily === "use-cases") && targetFamily === "drivers") {
    return RepoCodegraphBoundaryAdvice.make({
      citations: [...boundaryCitations],
      reason: "Domain and use-case packages should keep external driver dependencies at explicit boundaries.",
      status: "blocked",
    });
  }

  return RepoCodegraphBoundaryAdvice.make({
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

const fallbackRecommendedEntry = (
  entry: RepoExportsCatalogEntry,
  entries: ReadonlyArray<RepoExportsCatalogEntry>
): RepoExportsCatalogEntry =>
  pipe(
    entries,
    A.sort(entryImportOrder),
    A.head,
    O.getOrElse(() => entry)
  );

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
  const matchingEntries = pipe(
    catalog.packages,
    A.flatMap((pkg) => pkg.exports),
    A.filter((candidate) => entryIdentity(candidate) === entryIdentity(entry)),
    A.sort(entryImportOrder),
    A.dedupeWith((left, right) => left.importSpecifier === right.importSpecifier)
  );
  const entries = pipe(
    matchingEntries,
    A.match({
      onEmpty: () => [entry],
      onNonEmpty: identity,
    })
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
        O.getOrElse(() => fallbackRecommendedEntry(entry, entries))
      )
    ),
    O.getOrElse(() => fallbackRecommendedEntry(entry, entries))
  );

  return pipe(
    entries,
    A.map((candidate) => {
      const isRecommended = candidate.importSpecifier === recommendedEntry.importSpecifier;
      return RepoCodegraphImportCandidate.make({
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
  const recommendedImport = pipe(
    legalImports,
    A.head,
    O.getOrElse(() =>
      RepoCodegraphImportCandidate.make({
        exportSubpath: scored.entry.exportSubpath,
        importSpecifier: scored.entry.importSpecifier,
        isRecommended: true,
        reason: O.some("Catalog entry import is the only available public import surface."),
      })
    )
  );
  const summary = Str.isNonEmpty(Str.trim(scored.entry.summary)) ? O.some(scored.entry.summary) : O.none<string>();

  return RepoCodegraphLookupMatch.make({
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

// Dedupe by entry identity in O(n). The prior `A.dedupeWith` comparator was
// O(n^2) and recomputed `entryIdentity` strings on every pairwise comparison,
// which dominated lookup latency on the full catalog (~12.8k matched entries).
// Keeping the first occurrence preserves the post-sort "best score wins" choice.
const dedupeScoredByIdentity = (entries: ReadonlyArray<ScoredEntry>): ReadonlyArray<ScoredEntry> => {
  const seen = new Set<string>();
  return A.filter(entries, (entry) => {
    const identity = entryIdentity(entry.entry);
    if (seen.has(identity)) {
      return false;
    }
    seen.add(identity);
    return true;
  });
};

const lookupRepoExportsBody = (
  catalog: RepoExportsCatalog,
  request: RepoCodegraphLookupRequest,
  options?: LookupOptions
): RepoCodegraphLookupResult => {
  const queryTokens = tokenize(request.query);
  const fromPackage = resolveFromPackage(catalog, request.fromPackage);
  const importPolicies = options?.importPolicies ?? [];
  const fromPackageWarning = pipe(
    fromPackage.selector,
    O.filter(() => O.isNone(fromPackage.package)),
    O.map((selector) => `Caller package selector "${selector}" did not match any catalog package.`),
    A.fromOption
  );
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
    dedupeScoredByIdentity
  );
  const matches = pipe(
    scored,
    A.take(request.limit),
    A.map((entry) => toLookupMatch(catalog, importPolicies, entry))
  );
  const freshnessStatus = options?.freshnessStatus ?? "unchecked";
  const warnings =
    freshnessStatus === "unchecked" ? [defaultFreshnessWarning, ...fromPackageWarning] : fromPackageWarning;

  return RepoCodegraphLookupResult.make({
    freshnessStatus,
    fromPackage: request.fromPackage,
    limit: request.limit,
    matches,
    query: request.query,
    schemaVersion: "repo-codegraph.lookup/v1",
    totals: RepoCodegraphLookupTotals.make({
      catalogEntries: A.length(entries),
      matchedEntries: A.length(scored),
      returnedMatches: A.length(matches),
    }),
    warnings,
  });
};

/**
 * Lookup public repo exports by symbol name or free-text intent.
 *
 * @param catalog - Generated export catalog to score.
 * @param request - Lookup query, optional caller package, and result limit.
 * @param options - Optional catalog freshness and package import-policy context.
 * @returns Scored public export matches with import and boundary guidance.
 * @example
 * ```ts
 * import { lookupRepoExports } from "@beep/repo-codegraph"
 * console.log(lookupRepoExports)
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const lookupRepoExports: {
  (
    catalog: RepoExportsCatalog,
    request: RepoCodegraphLookupRequest,
    options?: LookupOptions
  ): RepoCodegraphLookupResult;
  (
    request: RepoCodegraphLookupRequest,
    options?: LookupOptions
  ): (catalog: RepoExportsCatalog) => RepoCodegraphLookupResult;
} = dual((args) => args.length >= 2 && isRepoExportsCatalogArgument(args[0]), lookupRepoExportsBody);
