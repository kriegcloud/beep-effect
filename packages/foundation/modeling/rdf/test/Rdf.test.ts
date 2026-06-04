import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";
import { IRI } from "../src/Iri.js";
import { JsonLdDocument } from "../src/JsonLd.js";
import { makeNamedNode, NamedNode } from "../src/Rdf.js";
import { XSD_STRING } from "../src/Vocab/Xsd.js";

describe("@beep/rdf", () => {
  it("decodes IRIs and builds named nodes", () => {
    expect(S.is(IRI)("https://example.org/value")).toBe(true);
    expect(makeNamedNode("https://example.org/value")).toEqual(
      NamedNode.make({
        termType: "NamedNode",
        value: "https://example.org/value",
      })
    );
  });

  it("exports core vocabulary constants", () => {
    expect(XSD_STRING.value).toBe("http://www.w3.org/2001/XMLSchema#string");
  });

  it("keeps JSON-LD value schemas available", () => {
    expect(S.is(JsonLdDocument)({ "@graph": [] })).toBe(true);
  });
});
