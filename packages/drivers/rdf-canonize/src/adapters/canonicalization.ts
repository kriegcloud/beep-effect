/**
 * Local canonicalization adapter backing.
 *
 * @packageDocumentation
 * @since 0.0.0
 * @packageDocumentation
 */

/// <reference path="../rdf-canonize.d.ts" />

import {
  DefaultGraph,
  makeBlankNode,
  makeDataset,
  makeLiteral,
  makeNamedNode,
  makeQuad,
  sortDatasetQuads,
} from "@beep/rdf/Rdf";
import { Sha256Hex } from "@beep/schema";
import {
  CanonicalDatasetResult,
  CanonicalizationError,
  CanonicalizationService,
  DatasetFingerprint,
} from "@beep/semantic-web/services/canonicalization";
import { A, Str } from "@beep/utils";
import { Duration, Effect, flow, Layer, Match, pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { canonize, NQuads } from "rdf-canonize";
import type { GraphTerm, ObjectTerm, Quad, Subject } from "@beep/rdf/Rdf";
import type { CanonicalizationServiceShape } from "@beep/semantic-web/services/canonicalization";
import type { CanonizeGraph, CanonizeObject, CanonizeQuad, CanonizeSubject } from "rdf-canonize";

const SemanticCanonicalizationMaxWorkFactor = 1;
const SemanticCanonicalizationTimeout = Duration.seconds(1);
const SemanticCanonicalizationTimeoutMs = Duration.toMillis(SemanticCanonicalizationTimeout);
const semanticCanonicalizationBudgetFailureNames = ["AbortError", "TimeoutError"] as const;
const semanticCanonicalizationBudgetFailureFragments = [
  "Maximum deep iterations exceeded",
  "Abort signal received",
  "signal timed out",
  "aborted due to timeout",
] as const;
const semanticCanonicalizationBudgetMessage = `Semantic canonicalization exceeded the configured resource budget (maxWorkFactor=${SemanticCanonicalizationMaxWorkFactor}, timeout=${SemanticCanonicalizationTimeoutMs}ms).`;

const hashCanonicalText = Effect.fn("SemanticWeb.hashCanonicalText")(function* (canonicalText: string) {
  const hex = yield* Effect.tryPromise({
    try: () => {
      const bytes = new TextEncoder().encode(canonicalText);
      return crypto.subtle.digest("SHA-256", bytes).then((digest) =>
        pipe(
          A.fromIterable(new Uint8Array(digest)),
          A.map((value) => Str.padStart(2, "0")(value.toString(16))),
          A.join("")
        )
      );
    },
    catch: () =>
      CanonicalizationError.make({
        reason: "fingerprintFailure",
        message: "Failed to hash canonical dataset text.",
      }),
  });

  return yield* S.decodeUnknownEffect(Sha256Hex)(hex).pipe(
    Effect.mapError(() =>
      CanonicalizationError.make({
        reason: "fingerprintFailure",
        message: "Failed to decode SHA-256 dataset fingerprint.",
      })
    )
  );
});

const enforceWorkLimit = (
  quads: ReadonlyArray<Quad>,
  workLimit: O.Option<number>
): Effect.Effect<void, CanonicalizationError> =>
  O.isSome(workLimit) && quads.length > workLimit.value
    ? Effect.fail(
        CanonicalizationError.make({
          reason: "workLimitExceeded",
          message: `Dataset contains ${quads.length} quads, exceeding the work limit of ${workLimit.value}.`,
        })
      )
    : Effect.void;

const lexicalCanonicalTextFromQuads = (quads: ReadonlyArray<Quad>): string =>
  pipe(NQuads.serialize(toCanonizeDataset(quads)), Str.trimEnd);

const toCanonizeSubject = (subject: Subject): CanonizeSubject =>
  subject.termType === "NamedNode"
    ? { termType: "NamedNode", value: subject.value }
    : { termType: "BlankNode", value: subject.value };

const toCanonizeObject = (object: ObjectTerm): CanonizeObject => {
  if (object.termType === "NamedNode") {
    return { termType: "NamedNode", value: object.value };
  }

  if (object.termType === "BlankNode") {
    return { termType: "BlankNode", value: object.value };
  }

  return {
    termType: "Literal",
    value: object.value,
    datatype: { termType: "NamedNode", value: object.datatype.value },
    ...(O.isSome(object.language) ? { language: object.language.value } : {}),
  };
};

const toCanonizeGraph = (graph: GraphTerm): CanonizeGraph => {
  if (graph.termType === "NamedNode") {
    return { termType: "NamedNode", value: graph.value };
  }

  if (graph.termType === "BlankNode") {
    return { termType: "BlankNode", value: graph.value };
  }

  return { termType: "DefaultGraph", value: "" };
};

const toCanonizeQuad = (quad: Quad): CanonizeQuad => ({
  subject: toCanonizeSubject(quad.subject),
  predicate: { termType: "NamedNode", value: quad.predicate.value },
  object: toCanonizeObject(quad.object),
  graph: toCanonizeGraph(quad.graph),
});

const toCanonizeDataset: (quads: ReadonlyArray<Quad>) => ReadonlyArray<CanonizeQuad> = flow(A.map(toCanonizeQuad));

const fromCanonizeSubject = (subject: CanonizeSubject): Subject =>
  subject.termType === "NamedNode" ? makeNamedNode(subject.value) : makeBlankNode(subject.value);

const fromCanonizeObject = (object: CanonizeObject): ObjectTerm => {
  if (object.termType === "NamedNode") {
    return makeNamedNode(object.value);
  }

  if (object.termType === "BlankNode") {
    return makeBlankNode(object.value);
  }

  return makeLiteral(object.value, object.datatype.value, { language: object.language });
};

const fromCanonizeGraph = (graph: CanonizeGraph): GraphTerm =>
  Match.value(graph.termType).pipe(
    Match.when("NamedNode", () => makeNamedNode(graph.value)),
    Match.when("BlankNode", () => makeBlankNode(graph.value)),
    Match.orElse(() => DefaultGraph.make({ termType: "DefaultGraph", value: "" }))
  );

const fromCanonizeQuad = (quad: CanonizeQuad): Quad =>
  makeQuad(fromCanonizeSubject(quad.subject), makeNamedNode(quad.predicate.value), {
    object: fromCanonizeObject(quad.object),
    graph: fromCanonizeGraph(quad.graph),
  });

const hasSemanticCanonicalizationBudgetFailureName = (error: unknown): boolean =>
  error instanceof Error && A.some(semanticCanonicalizationBudgetFailureNames, (name) => error.name === name);

const isSemanticCanonicalizationBudgetFailure = (message: string): boolean =>
  A.some(semanticCanonicalizationBudgetFailureFragments, (fragment) => pipe(message, Str.includes(fragment)));

const mapCanonizeFailure = (error: unknown): CanonicalizationError => {
  const message = error instanceof Error ? error.message : "RDF dataset canonicalization failed.";

  return hasSemanticCanonicalizationBudgetFailureName(error) || isSemanticCanonicalizationBudgetFailure(message)
    ? CanonicalizationError.make({
        reason: "workLimitExceeded",
        message: semanticCanonicalizationBudgetMessage,
      })
    : CanonicalizationError.make({
        reason: "canonicalizationFailure",
        message,
      });
};

const canonicalizeSemantically = Effect.fn("SemanticWeb.canonicalizeSemantically")(function* (
  quads: ReadonlyArray<Quad>
) {
  const canonicalText = yield* Effect.tryPromise<string, CanonicalizationError>({
    try: () =>
      // Keep the semantic path on an explicit CPU budget instead of relying on upstream defaults.
      canonize(toCanonizeDataset(quads), {
        algorithm: "RDFC-1.0",
        format: "application/n-quads",
        maxWorkFactor: SemanticCanonicalizationMaxWorkFactor,
        signal: AbortSignal.timeout(SemanticCanonicalizationTimeoutMs),
      }),
    catch: mapCanonizeFailure,
  });

  const parsed = yield* Effect.try({
    try: () => NQuads.parse(canonicalText),
    catch: mapCanonizeFailure,
  });

  return {
    canonicalText: pipe(canonicalText, Str.trimEnd),
    dataset: makeDataset(pipe(parsed, A.map(fromCanonizeQuad))),
  };
});

const canonicalizeLexically = (quads: ReadonlyArray<Quad>) => {
  const sorted = sortDatasetQuads(makeDataset(quads));
  return {
    canonicalText: lexicalCanonicalTextFromQuads(sorted),
    dataset: makeDataset(sorted),
  };
};

const getCanonicalDataset = (
  request: Parameters<CanonicalizationServiceShape["canonicalize"]>[0]
): Effect.Effect<
  { readonly canonicalText: string; readonly dataset: ReturnType<typeof makeDataset> },
  CanonicalizationError
> =>
  Match.value(request.algorithm).pipe(
    Match.when("rdfc-1.0", () => canonicalizeSemantically(request.dataset.quads)),
    Match.when("lexical-sort-v1", () => Effect.succeed(canonicalizeLexically(request.dataset.quads))),
    Match.orElse((algorithm) =>
      Effect.fail(
        CanonicalizationError.make({
          reason: "unsupportedAlgorithm",
          message: `Unsupported canonicalization algorithm: ${algorithm}`,
        })
      )
    )
  );

/**
 * Canonicalization service live layer.
 *
 * @example
 * ```ts
 * import { CanonicalizationServiceLive } from "@beep/rdf-canonize/adapters/canonicalization"
 *
 * console.log(CanonicalizationServiceLive)
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const CanonicalizationServiceLive = Layer.succeed(
  CanonicalizationService,
  CanonicalizationService.of({
    canonicalize: Effect.fn(function* (request) {
      yield* enforceWorkLimit(request.dataset.quads, request.workLimit);
      const canonical = yield* getCanonicalDataset(request);
      return CanonicalDatasetResult.make(canonical);
    }),
    fingerprint: Effect.fn(function* (request) {
      yield* enforceWorkLimit(request.dataset.quads, request.workLimit);
      const canonical = yield* getCanonicalDataset(request);
      const fingerprint = yield* hashCanonicalText(canonical.canonicalText);
      return DatasetFingerprint.make({
        canonicalText: canonical.canonicalText,
        fingerprint,
      });
    }),
  } satisfies CanonicalizationServiceShape)
);
