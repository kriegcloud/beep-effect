import * as SemanticWeb from "@beep/semantic-web";
import { CanonicalizationServiceLive } from "@beep/semantic-web/adapters/canonicalization";
import { ShaclValidationServiceLive } from "@beep/semantic-web/adapters/shacl-engine";
import { WebAnnotation } from "@beep/semantic-web/adapters/web-annotation";
import { Dataset, makeBlankNode, makeDataset, makeLiteral, makeNamedNode, makeQuad } from "@beep/semantic-web/rdf";
import {
  CanonicalizationService,
  CanonicalizeDatasetRequest,
  FingerprintDatasetRequest,
} from "@beep/semantic-web/services/canonicalization";
import { ShaclValidationRequest, ShaclValidationService } from "@beep/semantic-web/services/shacl-validation";
import {
  SparqlQueryRequest,
  SparqlQueryService,
  UnsupportedSparqlQueryServiceLive,
} from "@beep/semantic-web/services/sparql-query";
import { RDF_TYPE } from "@beep/semantic-web/vocab/rdf";
import { XSD_STRING } from "@beep/semantic-web/vocab/xsd";
import { A, Str } from "@beep/utils";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Order, pipe } from "effect";
import * as S from "effect/Schema";
import { FastCheck as fc } from "effect/testing";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

const decodeUnknownSync = <Schema extends S.ConstraintDecoder<unknown, never>>(schema: Schema) =>
  S.decodeUnknownSync(schema);

const dataset = makeDataset([
  makeQuad(
    makeNamedNode("https://example.com/people/alice"),
    makeNamedNode("https://schema.org/name"),
    makeLiteral("Alice", XSD_STRING.value)
  ),
  makeQuad(makeNamedNode("https://example.com/people/alice"), RDF_TYPE, makeNamedNode("https://schema.org/Person")),
]);

const boundDataset = (value: Dataset): Dataset => Dataset.make({ quads: pipe(value.quads, A.take(3)) });

const DatasetArbitrary = S.toArbitrary(Dataset).map(boundDataset);
const CanonicalizeDatasetRequestArbitrary = S.toArbitrary(CanonicalizeDatasetRequest).map((request) =>
  CanonicalizeDatasetRequest.make({
    dataset: boundDataset(request.dataset),
    algorithm: request.algorithm,
    workLimit: request.workLimit,
  })
);

const runCanonicalization = <A, E>(effect: Effect.Effect<A, E, CanonicalizationService>) =>
  Effect.runPromise(effect.pipe(provideScopedLayer(CanonicalizationServiceLive), Effect.orDie));

const runShacl = <A, E>(effect: Effect.Effect<A, E, ShaclValidationService>) =>
  Effect.runPromise(effect.pipe(provideScopedLayer(ShaclValidationServiceLive), Effect.orDie));

const runSparql = <A, E>(effect: Effect.Effect<A, E, SparqlQueryService>) =>
  Effect.runPromise(effect.pipe(provideScopedLayer(UnsupportedSparqlQueryServiceLive), Effect.orDie));

describe("Services and Surface", () => {
  it("keeps the package root surface curated to the IRI family", () => {
    expect(pipe(Object.keys(SemanticWeb), A.sort(Order.String))).toEqual([
      "AbsoluteIRI",
      "IRI",
      "IRIReference",
      "RelativeIRIReference",
    ]);
  });

  it(
    "round-trips schema-derived RDF datasets and canonicalization DTOs through boundary encoders",
    { timeout: 30000 },
    () =>
      fc.assert(
        fc.property(DatasetArbitrary, CanonicalizeDatasetRequestArbitrary, (generatedDataset, canonicalizeRequest) => {
          const encodedDataset = Effect.runSync(S.encodeEffect(Dataset)(generatedDataset));
          const decodedDataset = Effect.runSync(S.decodeUnknownEffect(Dataset)(encodedDataset));
          const reencodedDataset = Effect.runSync(S.encodeEffect(Dataset)(decodedDataset));

          const encodedCanonicalizeRequest = Effect.runSync(
            S.encodeEffect(CanonicalizeDatasetRequest)(canonicalizeRequest)
          );
          const decodedCanonicalizeRequest = Effect.runSync(
            S.decodeUnknownEffect(CanonicalizeDatasetRequest)(encodedCanonicalizeRequest)
          );
          const reencodedCanonicalizeRequest = Effect.runSync(
            S.encodeEffect(CanonicalizeDatasetRequest)(decodedCanonicalizeRequest)
          );

          expect(reencodedDataset).toEqual(encodedDataset);
          expect(reencodedCanonicalizeRequest).toEqual(encodedCanonicalizeRequest);
        }),
        { numRuns: 5 }
      )
  );

  it("canonicalizes and fingerprints datasets deterministically", () =>
    Effect.gen(function* () {
      const canonicalized = yield* Effect.promise(() =>
        Promise.resolve(
          runCanonicalization(
            Effect.gen(function* () {
              const service = yield* CanonicalizationService;
              return yield* service.canonicalize(
                decodeUnknownSync(CanonicalizeDatasetRequest)({
                  dataset: yield* S.encodeEffect(Dataset)(dataset),
                  algorithm: "rdfc-1.0",
                })
              );
            })
          )
        )
      );

      expect(pipe(canonicalized.canonicalText, Str.split("\n"))).toHaveLength(2);

      const fingerprint = yield* Effect.promise(() =>
        Promise.resolve(
          runCanonicalization(
            Effect.gen(function* () {
              const service = yield* CanonicalizationService;
              return yield* service.fingerprint(
                decodeUnknownSync(FingerprintDatasetRequest)({
                  dataset: yield* S.encodeEffect(Dataset)(dataset),
                  algorithm: "rdfc-1.0",
                })
              );
            })
          )
        )
      );

      expect(fingerprint.fingerprint).toMatch(/^[0-9a-f]{64}$/);
      expect(fingerprint.canonicalText).toBe(canonicalized.canonicalText);
    }));

  it("produces the same semantic fingerprint for isomorphic blank-node datasets", () =>
    Effect.gen(function* () {
      const knows = makeNamedNode("https://schema.org/knows");
      const name = makeNamedNode("https://schema.org/name");

      const left = makeDataset([
        makeQuad(makeBlankNode("a"), knows, makeBlankNode("b")),
        makeQuad(makeBlankNode("a"), name, makeLiteral("Alice", XSD_STRING.value)),
        makeQuad(makeBlankNode("b"), name, makeLiteral("Bob", XSD_STRING.value)),
      ]);

      const right = makeDataset([
        makeQuad(makeBlankNode("x"), knows, makeBlankNode("y")),
        makeQuad(makeBlankNode("x"), name, makeLiteral("Alice", XSD_STRING.value)),
        makeQuad(makeBlankNode("y"), name, makeLiteral("Bob", XSD_STRING.value)),
      ]);

      const [leftFingerprint, rightFingerprint] = yield* Effect.promise(() =>
        Promise.resolve(
          Promise.all([
            runCanonicalization(
              Effect.gen(function* () {
                const service = yield* CanonicalizationService;
                return yield* service.fingerprint(
                  decodeUnknownSync(FingerprintDatasetRequest)({
                    dataset: yield* S.encodeEffect(Dataset)(left),
                    algorithm: "rdfc-1.0",
                  })
                );
              })
            ),
            runCanonicalization(
              Effect.gen(function* () {
                const service = yield* CanonicalizationService;
                return yield* service.fingerprint(
                  decodeUnknownSync(FingerprintDatasetRequest)({
                    dataset: yield* S.encodeEffect(Dataset)(right),
                    algorithm: "rdfc-1.0",
                  })
                );
              })
            ),
          ])
        )
      );

      expect(leftFingerprint.fingerprint).toBe(rightFingerprint.fingerprint);
      expect(leftFingerprint.canonicalText).toBe(rightFingerprint.canonicalText);
    }));

  it("validates bounded SHACL-inspired shapes and truncates when max results is reached", () =>
    Effect.gen(function* () {
      const result = yield* Effect.promise(() =>
        Promise.resolve(
          runShacl(
            Effect.gen(function* () {
              const service = yield* ShaclValidationService;
              return yield* service.validate(
                decodeUnknownSync(ShaclValidationRequest)({
                  dataset: yield* S.encodeEffect(Dataset)(dataset),
                  shapes: [
                    {
                      targetClass: makeNamedNode("https://schema.org/Person"),
                      properties: [
                        {
                          path: makeNamedNode("https://schema.org/knows"),
                          minCount: 1,
                        },
                        {
                          path: makeNamedNode("https://schema.org/name"),
                          datatype: makeNamedNode(XSD_STRING.value),
                        },
                      ],
                    },
                  ],
                  maxResults: 1,
                })
              );
            })
          )
        )
      );

      expect(result.conforms).toBe(false);
      expect(result.truncated).toBe(true);
      expect(result.violations).toHaveLength(1);
    }));

  it("exposes the unsupported SPARQL fallback and the web-annotation seam DTOs", () =>
    Effect.gen(function* () {
      yield* Effect.promise(() =>
        Promise.resolve(
          expect(
            runSparql(
              Effect.gen(function* () {
                const service = yield* SparqlQueryService;
                return yield* service.execute(
                  decodeUnknownSync(SparqlQueryRequest)({
                    query: "SELECT * WHERE { ?s ?p ?o }",
                    profile: "select",
                    dataset: yield* S.encodeEffect(Dataset)(dataset),
                  })
                );
              })
            )
          ).rejects.toThrow("No SPARQL engine is wired into the v1 semantic-web package.")
        )
      );

      const annotation = decodeUnknownSync(WebAnnotation)({
        id: "https://example.com/annotations/1",
        type: "Annotation",
        target: {
          source: "https://example.com/documents/1",
          selector: {
            type: "TextQuoteSelector",
            exact: "Alice",
          },
        },
      });

      expect(annotation.type).toBe("Annotation");
      expect(annotation.target.selector.type).toBe("TextQuoteSelector");
    }));
});
