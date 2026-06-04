import { IRI } from "@beep/rdf/Iri";
import { JsonLdDocument } from "@beep/rdf/JsonLd";
import { makeNamedNode, NamedNode } from "@beep/rdf/Rdf";
import { XSD_STRING } from "@beep/rdf/Vocab/Xsd";
import { describe, expect, it } from "@effect/vitest";
import { Result } from "effect";
import * as S from "effect/Schema";

describe("@beep/rdf", () => {
  it("decodes IRIs and builds named nodes", () => {
    const value = S.decodeUnknownSync(IRI)("https://example.org/value");

    expect(S.is(IRI)(value)).toBe(true);
    expect(makeNamedNode(value)).toEqual(
      NamedNode.make({
        termType: "NamedNode",
        value,
      })
    );
  });

  it("exports core vocabulary constants", () => {
    expect(XSD_STRING.value).toBe("http://www.w3.org/2001/XMLSchema#string");
  });

  it("keeps JSON-LD value schemas available", () => {
    expect(Result.isSuccess(S.decodeUnknownResult(JsonLdDocument)({ "@graph": [] }))).toBe(true);
  });
});
