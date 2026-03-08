/**
 * Local canonicalization adapter backing.
 *
 * @since 0.0.0
 * @module
 */

import { Sha256Hex } from "@beep/schema";
import { Effect, Layer, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  type CanonizeGraph,
  type CanonizeObject,
  type CanonizeQuad,
  type CanonizeSubject,
  canonize,
  NQuads,
} from "rdf-canonize";
import {
  DefaultGraph,
  type GraphTerm,
  makeBlankNode,
  makeDataset,
  makeLiteral,
  makeNamedNode,
  makeQuad,
  type ObjectTerm,
  type Quad,
  type Subject,
  sortDatasetQuads,
} from "../rdf.ts";
import {
  CanonicalDatasetResult,
  CanonicalizationError,
  CanonicalizationService,
  type CanonicalizationServiceShape,
  DatasetFingerprint,
} from "../services/canonicalization.ts";

const decodeSha256Hex = S.decodeUnknownSync(Sha256Hex);

const hashCanonicalText = (canonicalText: string): Effect.Effect<typeof Sha256Hex.Type, CanonicalizationError> =>
  Effect.tryPromise({
    try: async () => {
      const bytes = new TextEncoder().encode(canonicalText);
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const hex = Array.from(new Uint8Array(digest))
        .map((value) => value.toString(16).padStart(2, "0"))
        .join("");

      return decodeSha256Hex(hex);
    },
    catch: () =>
      new CanonicalizationError({
        reason: "fingerprintFailure",
        message: "Failed to hash canonical dataset text.",
      }),
  });

const enforceWorkLimit = (
  quads: ReadonlyArray<Quad>,
  workLimit: O.Option<number>
): Effect.Effect<void, CanonicalizationError> =>
  O.isSome(workLimit) && quads.length > workLimit.value
    ? Effect.fail(
        new CanonicalizationError({
          reason: "workLimitExceeded",
          message: `Dataset contains ${quads.length} quads, exceeding the work limit of ${workLimit.value}.`,
        })
      )
    : Effect.void;

const lexicalCanonicalTextFromQuads = (quads: ReadonlyArray<Quad>): string =>
  NQuads.serialize(toCanonizeDataset(quads)).trimEnd();

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

const toCanonizeDataset = (quads: ReadonlyArray<Quad>): ReadonlyArray<CanonizeQuad> =>
  pipe(quads, A.map(toCanonizeQuad));

const fromCanonizeSubject = (subject: CanonizeSubject): Subject =>
  subject.termType === "NamedNode" ? makeNamedNode(subject.value) : makeBlankNode(subject.value);

const fromCanonizeObject = (object: CanonizeObject): ObjectTerm => {
  if (object.termType === "NamedNode") {
    return makeNamedNode(object.value);
  }

  if (object.termType === "BlankNode") {
    return makeBlankNode(object.value);
  }

  return makeLiteral(object.value, object.datatype.value, object.language);
};

const fromCanonizeGraph = (graph: CanonizeGraph): GraphTerm =>
  graph.termType === "NamedNode"
    ? makeNamedNode(graph.value)
    : graph.termType === "BlankNode"
      ? makeBlankNode(graph.value)
      : DefaultGraph.makeUnsafe({ termType: "DefaultGraph", value: "" });

const fromCanonizeQuad = (quad: CanonizeQuad): Quad =>
  makeQuad(
    fromCanonizeSubject(quad.subject),
    makeNamedNode(quad.predicate.value),
    fromCanonizeObject(quad.object),
    fromCanonizeGraph(quad.graph)
  );

const mapCanonizeFailure = (error: unknown): CanonicalizationError =>
  new CanonicalizationError({
    reason: "canonicalizationFailure",
    message: error instanceof Error ? error.message : "RDF dataset canonicalization failed.",
  });

const canonicalizeSemantically = (
  quads: ReadonlyArray<Quad>
): Effect.Effect<
  { readonly canonicalText: string; readonly dataset: ReturnType<typeof makeDataset> },
  CanonicalizationError
> =>
  Effect.gen(function* () {
    const canonicalText = yield* Effect.tryPromise({
      try: () =>
        canonize(toCanonizeDataset(quads), {
          algorithm: "RDFC-1.0",
          format: "application/n-quads",
        }),
      catch: mapCanonizeFailure,
    });

    const parsed = yield* Effect.try({
      try: () => NQuads.parse(canonicalText),
      catch: mapCanonizeFailure,
    });

    return {
      canonicalText: canonicalText.trimEnd(),
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
  request.algorithm === "rdfc-1.0"
    ? canonicalizeSemantically(request.dataset.quads)
    : request.algorithm === "lexical-sort-v1"
      ? Effect.succeed(canonicalizeLexically(request.dataset.quads))
      : Effect.fail(
          new CanonicalizationError({
            reason: "unsupportedAlgorithm",
            message: `Unsupported canonicalization algorithm: ${request.algorithm}`,
          })
        );

/**
 * Canonicalization service live layer.
 *
 * @since 0.0.0
 * @category Layers
 */
export const CanonicalizationServiceLive = Layer.succeed(
  CanonicalizationService,
  CanonicalizationService.of({
    canonicalize: Effect.fn(function* (request) {
      yield* enforceWorkLimit(request.dataset.quads, request.workLimit);
      const canonical = yield* getCanonicalDataset(request);
      return CanonicalDatasetResult.makeUnsafe(canonical);
    }),
    fingerprint: Effect.fn(function* (request) {
      yield* enforceWorkLimit(request.dataset.quads, request.workLimit);
      const canonical = yield* getCanonicalDataset(request);
      const fingerprint = yield* hashCanonicalText(canonical.canonicalText);
      return DatasetFingerprint.makeUnsafe({
        canonicalText: canonical.canonicalText,
        fingerprint,
      });
    }),
  } satisfies CanonicalizationServiceShape)
);
