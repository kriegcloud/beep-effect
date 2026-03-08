import * as SemanticWeb from "@beep/semantic-web";
import { CanonicalizationServiceLive } from "@beep/semantic-web/adapters/canonicalization";
import { ShaclValidationServiceLive } from "@beep/semantic-web/adapters/shacl-engine";
import { WebAnnotation } from "@beep/semantic-web/adapters/web-annotation";
import { Dataset, makeDataset, makeLiteral, makeNamedNode, makeQuad } from "@beep/semantic-web/rdf";
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
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as S from "effect/Schema";

const decodeUnknownSync = <Schema extends S.Top>(schema: Schema) =>
  S.decodeUnknownSync(schema as Schema & { readonly DecodingServices: never });

const dataset = makeDataset([
  makeQuad(
    makeNamedNode("https://example.com/people/alice"),
    makeNamedNode("https://schema.org/name"),
    makeLiteral("Alice", XSD_STRING.value)
  ),
  makeQuad(makeNamedNode("https://example.com/people/alice"), RDF_TYPE, makeNamedNode("https://schema.org/Person")),
]);

const runCanonicalization = <A>(effect: Effect.Effect<A, unknown, CanonicalizationService>) =>
  Effect.runPromise(effect.pipe(Effect.provide(CanonicalizationServiceLive)));

const runShacl = <A>(effect: Effect.Effect<A, unknown, ShaclValidationService>) =>
  Effect.runPromise(effect.pipe(Effect.provide(ShaclValidationServiceLive)));

const runSparql = <A>(effect: Effect.Effect<A, unknown, SparqlQueryService>) =>
  Effect.runPromise(effect.pipe(Effect.provide(UnsupportedSparqlQueryServiceLive)));

describe("Services and Surface", () => {
  it("keeps the package root surface curated to VERSION plus the IRI family", () => {
    expect(Object.keys(SemanticWeb).sort()).toEqual([
      "AbsoluteIRI",
      "IRI",
      "IRIReference",
      "RelativeIRIReference",
      "VERSION",
    ]);
  });

  it("canonicalizes and fingerprints datasets deterministically", async () => {
    const canonicalized = await runCanonicalization(
      Effect.gen(function* () {
        const service = yield* CanonicalizationService;
        return yield* service.canonicalize(
          decodeUnknownSync(CanonicalizeDatasetRequest)({
            dataset: S.encodeSync(Dataset)(dataset),
            algorithm: "lexical-v1",
          })
        );
      })
    );

    expect(canonicalized.canonicalText.split("\n")).toHaveLength(2);

    const fingerprint = await runCanonicalization(
      Effect.gen(function* () {
        const service = yield* CanonicalizationService;
        return yield* service.fingerprint(
          decodeUnknownSync(FingerprintDatasetRequest)({
            dataset: S.encodeSync(Dataset)(dataset),
            algorithm: "lexical-v1",
          })
        );
      })
    );

    expect(fingerprint.fingerprint).toMatch(/^[0-9a-f]{64}$/);
    expect(fingerprint.canonicalText).toBe(canonicalized.canonicalText);
  });

  it("validates bounded SHACL shapes and truncates when max results is reached", async () => {
    const result = await runShacl(
      Effect.gen(function* () {
        const service = yield* ShaclValidationService;
        return yield* service.validate(
          decodeUnknownSync(ShaclValidationRequest)({
            dataset: S.encodeSync(Dataset)(dataset),
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
    );

    expect(result.conforms).toBe(false);
    expect(result.truncated).toBe(true);
    expect(result.violations).toHaveLength(1);
  });

  it("exposes the unsupported SPARQL fallback and the web-annotation seam DTOs", async () => {
    await expect(
      runSparql(
        Effect.gen(function* () {
          const service = yield* SparqlQueryService;
          return yield* service.execute(
            decodeUnknownSync(SparqlQueryRequest)({
              query: "SELECT * WHERE { ?s ?p ?o }",
              profile: "select",
              dataset: S.encodeSync(Dataset)(dataset),
            })
          );
        })
      )
    ).rejects.toThrow("No SPARQL engine is wired into the v1 semantic-web package.");

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
  });
});
