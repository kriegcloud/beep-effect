import { JsonLdContextServiceLive } from "@beep/semantic-web/adapters/jsonld-context";
import { JsonLdDocumentServiceLive } from "@beep/semantic-web/adapters/jsonld-document";
import { JsonLdStreamParseServiceLive } from "@beep/semantic-web/adapters/jsonld-stream-parse";
import { JsonLdStreamSerializeServiceLive } from "@beep/semantic-web/adapters/jsonld-stream-serialize";
import { JsonLdContext, JsonLdDocument, JsonLdFrame, JsonLdLiteralValue } from "@beep/semantic-web/jsonld";
import { Dataset } from "@beep/semantic-web/rdf";
import {
  CompactJsonLdIriRequest,
  ExpandJsonLdTermRequest,
  JsonLdContextService,
  MergeJsonLdContextsRequest,
  NormalizeJsonLdContextRequest,
} from "@beep/semantic-web/services/jsonld-context";
import {
  CompactJsonLdDocumentRequest,
  ExpandJsonLdDocumentRequest,
  FrameJsonLdDocumentRequest,
  JsonLdDocumentService,
  JsonLdFromRdfRequest,
  JsonLdToRdfRequest,
  NormalizeJsonLdDocumentRequest,
} from "@beep/semantic-web/services/jsonld-document";
import { JsonLdStreamParseRequest, JsonLdStreamParseService } from "@beep/semantic-web/services/jsonld-stream-parse";
import {
  JsonLdStreamSerializeRequest,
  JsonLdStreamSerializeService,
} from "@beep/semantic-web/services/jsonld-stream-serialize";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const decodeUnknownSync = <Schema extends S.Top>(schema: Schema) =>
  S.decodeUnknownSync(schema as Schema & { readonly DecodingServices: never });

const isJsonLdLiteralValue = S.is(JsonLdLiteralValue);

const rawContext = {
  "@base": "https://example.com/",
  "@vocab": "https://schema.org/",
  terms: {
    homepage: { "@id": "https://schema.org/url" },
    name: "https://schema.org/name",
    Person: "https://schema.org/Person",
  },
} as const;

const rawDocument = {
  "@context": rawContext,
  "@graph": [
    {
      "@id": "https://example.com/people/alice",
      "@type": ["https://schema.org/Person"],
      properties: {
        "https://schema.org/name": [{ "@value": "Alice" }],
        "https://schema.org/url": [{ "@id": "https://example.com/alice" }],
      },
    },
  ],
} as const;

const rawCompactedContext = {
  terms: {
    Person: "https://schema.org/Person",
    birthDate: "https://schema.org/birthDate",
    dateType: "https://example.com/types/Date",
    person: "https://example.com/people/",
  },
} as const;

const rawTypedLiteralDocument = {
  "@context": rawCompactedContext,
  "@graph": [
    {
      "@id": "https://example.com/people/alice",
      "@type": ["https://schema.org/Person"],
      properties: {
        "https://schema.org/birthDate": [{ "@value": "2026-03-08", "@type": "https://example.com/types/Date" }],
      },
    },
  ],
} as const;

const rawBlankNodeContext = {
  terms: {
    Person: "https://schema.org/Person",
    knows: "https://schema.org/knows",
    name: "https://schema.org/name",
  },
} as const;

const rawBlankNodeDocument = {
  "@context": rawBlankNodeContext,
  "@graph": [
    {
      "@id": "_:alice",
      "@type": ["https://schema.org/Person"],
      properties: {
        "https://schema.org/knows": [{ "@id": "_:bob" }],
        "https://schema.org/name": [{ "@value": "Alice" }],
      },
    },
    {
      "@id": "_:bob",
      properties: {
        "https://schema.org/name": [{ "@value": "Bob" }],
      },
    },
    {
      properties: {
        "https://schema.org/name": [{ "@value": "Anonymous" }],
      },
    },
  ],
} as const;

const runContext = <A>(effect: Effect.Effect<A, unknown, JsonLdContextService>) =>
  Effect.runPromise(effect.pipe(Effect.provide(JsonLdContextServiceLive)));

const runDocument = <A>(effect: Effect.Effect<A, unknown, JsonLdDocumentService>) =>
  Effect.runPromise(effect.pipe(Effect.provide(JsonLdDocumentServiceLive)));

const runStreamParse = <A>(effect: Effect.Effect<A, unknown, JsonLdStreamParseService>) =>
  Effect.runPromise(
    effect.pipe(Effect.provide(JsonLdStreamParseServiceLive.pipe(Layer.provide(JsonLdDocumentServiceLive))))
  );

const runStreamSerialize = <A>(effect: Effect.Effect<A, unknown, JsonLdStreamSerializeService>) =>
  Effect.runPromise(
    effect.pipe(Effect.provide(JsonLdStreamSerializeServiceLive.pipe(Layer.provide(JsonLdDocumentServiceLive))))
  );

describe("JSON-LD", () => {
  it("normalizes, expands, compacts, and merges bounded contexts", async () => {
    const normalized = await runContext(
      Effect.gen(function* () {
        const service = yield* JsonLdContextService;
        return yield* service.normalize(decodeUnknownSync(NormalizeJsonLdContextRequest)({ context: rawContext }));
      })
    );

    expect(Object.keys(normalized.terms)).toEqual(["Person", "homepage", "name"]);

    const expanded = await runContext(
      Effect.gen(function* () {
        const service = yield* JsonLdContextService;
        return yield* service.expandTerm(
          decodeUnknownSync(ExpandJsonLdTermRequest)({ context: rawContext, term: "name" })
        );
      })
    );

    expect(expanded.iri).toBe("https://schema.org/name");

    const compacted = await runContext(
      Effect.gen(function* () {
        const service = yield* JsonLdContextService;
        return yield* service.compactIri(
          decodeUnknownSync(CompactJsonLdIriRequest)({ context: rawContext, iri: "https://schema.org/Person" })
        );
      })
    );

    expect(compacted.term).toBe("Person");

    const merged = await runContext(
      Effect.gen(function* () {
        const service = yield* JsonLdContextService;
        return yield* service.merge(
          decodeUnknownSync(MergeJsonLdContextsRequest)({
            left: rawContext,
            right: {
              terms: {
                description: "https://schema.org/description",
              },
            },
          })
        );
      })
    );

    expect(merged.terms.description).toBe("https://schema.org/description");
    expect(O.isSome(merged["@base"])).toBe(true);
  });

  it("compacts, frames, and bridges bounded JSON-LD documents to and from RDF", async () => {
    const compacted = await runDocument(
      Effect.gen(function* () {
        const service = yield* JsonLdDocumentService;
        return yield* service.compact(
          decodeUnknownSync(CompactJsonLdDocumentRequest)({
            document: rawDocument,
            context: rawContext,
          })
        );
      })
    );

    const [compactedNode] = compacted.document["@graph"];
    expect(compactedNode.properties.name).toBeDefined();
    expect(O.isSome(compactedNode["@type"])).toBe(true);
    if (O.isSome(compactedNode["@type"])) {
      expect(compactedNode["@type"].value).toEqual(["Person"]);
    }

    const framed = await runDocument(
      Effect.gen(function* () {
        const service = yield* JsonLdDocumentService;
        return yield* service.frame(
          FrameJsonLdDocumentRequest.makeUnsafe({
            document: decodeUnknownSync(JsonLdDocument)(S.encodeSync(JsonLdDocument)(compacted.document)),
            frame: decodeUnknownSync(JsonLdFrame)({
              "@type": "Person",
              includeProperties: ["name"],
            }),
          })
        );
      })
    );

    expect(Object.keys(framed.document["@graph"][0].properties)).toEqual(["name"]);

    const bridged = await runDocument(
      Effect.gen(function* () {
        const service = yield* JsonLdDocumentService;
        return yield* service.toRdf(decodeUnknownSync(JsonLdToRdfRequest)({ document: rawDocument }));
      })
    );

    expect(bridged.dataset.quads).toHaveLength(3);

    const roundTripped = await runDocument(
      Effect.gen(function* () {
        const service = yield* JsonLdDocumentService;
        return yield* service.fromRdf(
          JsonLdFromRdfRequest.makeUnsafe({
            dataset: bridged.dataset,
            context: O.some(decodeUnknownSync(JsonLdContext)(rawContext)),
          })
        );
      })
    );

    const [roundTripNode] = roundTripped.document["@graph"];
    expect(roundTripNode.properties.name).toBeDefined();
    expect(O.isSome(roundTripNode["@type"])).toBe(true);
  });

  it("compacts node identifiers and typed-literal datatypes with the supplied context", async () => {
    const compacted = await runDocument(
      Effect.gen(function* () {
        const service = yield* JsonLdDocumentService;
        return yield* service.compact(
          decodeUnknownSync(CompactJsonLdDocumentRequest)({
            document: rawTypedLiteralDocument,
            context: rawCompactedContext,
          })
        );
      })
    );

    const [compactedNode] = compacted.document["@graph"];
    expect(compactedNode["@id"]).toEqual(O.some("person:alice"));

    const birthDateValues = compactedNode.properties.birthDate;
    expect(birthDateValues).toBeDefined();
    if (birthDateValues !== undefined) {
      expect(birthDateValues).toHaveLength(1);

      const maybeLiteralValue = pipe(birthDateValues, A.findFirst(isJsonLdLiteralValue));

      expect(O.isSome(maybeLiteralValue)).toBe(true);
      if (O.isSome(maybeLiteralValue) && O.isSome(maybeLiteralValue.value["@type"])) {
        expect(maybeLiteralValue.value["@type"].value).toBe("dateType");
      }
    }

    const bridged = await runDocument(
      Effect.gen(function* () {
        const service = yield* JsonLdDocumentService;
        return yield* service.toRdf(decodeUnknownSync(JsonLdToRdfRequest)({ document: rawTypedLiteralDocument }));
      })
    );

    const fromRdf = await runDocument(
      Effect.gen(function* () {
        const service = yield* JsonLdDocumentService;
        return yield* service.fromRdf(
          JsonLdFromRdfRequest.makeUnsafe({
            dataset: bridged.dataset,
            context: O.some(decodeUnknownSync(JsonLdContext)(rawCompactedContext)),
          })
        );
      })
    );

    const [roundTrippedNode] = fromRdf.document["@graph"];
    expect(roundTrippedNode["@id"]).toEqual(O.some("person:alice"));

    const roundTrippedBirthDateValues = roundTrippedNode.properties.birthDate;
    expect(roundTrippedBirthDateValues).toBeDefined();
    if (roundTrippedBirthDateValues !== undefined) {
      const maybeRoundTrippedLiteralValue = pipe(roundTrippedBirthDateValues, A.findFirst(isJsonLdLiteralValue));

      expect(O.isSome(maybeRoundTrippedLiteralValue)).toBe(true);
      if (O.isSome(maybeRoundTrippedLiteralValue) && O.isSome(maybeRoundTrippedLiteralValue.value["@type"])) {
        expect(maybeRoundTrippedLiteralValue.value["@type"].value).toBe("dateType");
      }
    }
  });

  it("round-trips blank-node subjects, blank-node object references, and anonymous nodes through RDF", async () => {
    const bridged = await runDocument(
      Effect.gen(function* () {
        const service = yield* JsonLdDocumentService;
        return yield* service.toRdf(decodeUnknownSync(JsonLdToRdfRequest)({ document: rawBlankNodeDocument }));
      })
    );

    const roundTripped = await runDocument(
      Effect.gen(function* () {
        const service = yield* JsonLdDocumentService;
        return yield* service.fromRdf(
          JsonLdFromRdfRequest.makeUnsafe({
            dataset: bridged.dataset,
            context: O.some(decodeUnknownSync(JsonLdContext)(rawBlankNodeContext)),
          })
        );
      })
    );

    const maybeAliceNode = pipe(
      roundTripped.document["@graph"],
      A.findFirst((node) => O.isSome(node["@id"]) && node["@id"].value === "_:alice")
    );

    expect(O.isSome(maybeAliceNode)).toBe(true);
    if (O.isSome(maybeAliceNode)) {
      expect(maybeAliceNode.value.properties.knows).toEqual([{ "@id": "_:bob" }]);
    }

    const maybeAnonymousNode = pipe(
      roundTripped.document["@graph"],
      A.findFirst(
        (node) =>
          node.properties.name !== undefined &&
          node.properties.name[0] !== undefined &&
          "@value" in node.properties.name[0] &&
          node.properties.name[0]["@value"] === "Anonymous"
      )
    );

    expect(O.isSome(maybeAnonymousNode)).toBe(true);
    if (O.isSome(maybeAnonymousNode)) {
      expect(O.isSome(maybeAnonymousNode.value["@id"])).toBe(true);
    }
  });

  it("expands compacted documents and normalizes bounded document structure", async () => {
    const compacted = await runDocument(
      Effect.gen(function* () {
        const service = yield* JsonLdDocumentService;
        return yield* service.compact(
          decodeUnknownSync(CompactJsonLdDocumentRequest)({
            document: rawDocument,
            context: rawContext,
          })
        );
      })
    );

    const expanded = await runDocument(
      Effect.gen(function* () {
        const service = yield* JsonLdDocumentService;
        return yield* service.expand(
          decodeUnknownSync(ExpandJsonLdDocumentRequest)({
            document: S.encodeSync(JsonLdDocument)(compacted.document),
            loaderPolicy: {
              allowRemoteDocuments: false,
            },
          })
        );
      })
    );

    expect(O.isNone(expanded.document["@context"])).toBe(true);
    expect(Object.keys(expanded.document["@graph"][0].properties)).toEqual([
      "https://schema.org/name",
      "https://schema.org/url",
    ]);

    const normalized = await runDocument(
      Effect.gen(function* () {
        const service = yield* JsonLdDocumentService;
        return yield* service.normalize(
          decodeUnknownSync(NormalizeJsonLdDocumentRequest)({
            document: S.encodeSync(JsonLdDocument)(compacted.document),
            profile: "bounded-v1",
            safeMode: true,
            loaderPolicy: {
              allowRemoteDocuments: false,
            },
          })
        );
      })
    );

    expect(Object.keys(normalized.document["@graph"][0].properties)).toEqual(["homepage", "name"]);
  });

  it("rejects safe-mode normalization for anonymous JSON-LD nodes", async () => {
    await expect(
      runDocument(
        Effect.gen(function* () {
          const service = yield* JsonLdDocumentService;
          return yield* service.normalize(
            decodeUnknownSync(NormalizeJsonLdDocumentRequest)({
              document: rawBlankNodeDocument,
              profile: "bounded-v1",
              safeMode: true,
            })
          );
        })
      )
    ).rejects.toThrow("Safe-mode normalization requires explicit @id values for every JSON-LD node.");
  });

  it("round-trips bounded streaming parse and serialize seams through buffered fallback mode", async () => {
    const bridged = await runDocument(
      Effect.gen(function* () {
        const service = yield* JsonLdDocumentService;
        return yield* service.toRdf(decodeUnknownSync(JsonLdToRdfRequest)({ document: rawDocument }));
      })
    );

    const serialized = await runStreamSerialize(
      Effect.gen(function* () {
        const service = yield* JsonLdStreamSerializeService;
        return yield* service.serialize(
          decodeUnknownSync(JsonLdStreamSerializeRequest)({
            dataset: S.encodeSync(Dataset)(bridged.dataset),
            context: rawContext,
            maxChunkCharacters: 32,
          })
        );
      })
    );

    expect(serialized.mode).toBe("buffered-fallback");
    expect(serialized.chunkCount).toBeGreaterThan(1);

    const reparsed = await runStreamParse(
      Effect.gen(function* () {
        const service = yield* JsonLdStreamParseService;
        return yield* service.parse(
          decodeUnknownSync(JsonLdStreamParseRequest)({
            input: {
              kind: "text",
              encoding: "utf-8",
              chunks: serialized.chunks,
            },
            loaderPolicy: {
              allowRemoteDocuments: false,
            },
          })
        );
      })
    );

    expect(reparsed.mode).toBe("buffered-fallback");
    expect(reparsed.dataset.quads).toHaveLength(3);
  });
});
