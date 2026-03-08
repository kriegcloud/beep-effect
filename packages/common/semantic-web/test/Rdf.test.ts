import {
  areDatasetsEquivalent,
  makeDataset,
  makeLiteral,
  makeNamedNode,
  makeQuad,
  PrefixMap,
  serializeQuad,
  serializeTerm,
  sortDatasetQuads,
} from "@beep/semantic-web/rdf";
import { PROV_ACTIVITY, PROV_ENTITY, PROV_WAS_GENERATED_BY } from "@beep/semantic-web/vocab/prov";
import { RDF_TYPE } from "@beep/semantic-web/vocab/rdf";
import { XSD_STRING } from "@beep/semantic-web/vocab/xsd";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

const decodePrefixMap = S.decodeUnknownSync(PrefixMap);

describe("RDF", () => {
  it("serializes terms and quads deterministically", () => {
    const subject = makeNamedNode("https://example.com/people/alice");
    const object = makeLiteral("Alice", XSD_STRING.value);
    const quad = makeQuad(subject, RDF_TYPE, object);

    expect(serializeTerm(subject)).toBe("<https://example.com/people/alice>");
    expect(serializeTerm(object)).toBe('"Alice"^^<http://www.w3.org/2001/XMLSchema#string>');
    expect(serializeQuad(quad)).toBe(
      '<https://example.com/people/alice> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> "Alice"^^<http://www.w3.org/2001/XMLSchema#string> default .'
    );
  });

  it("sorts datasets and compares them independent of quad order", () => {
    const alice = makeNamedNode("https://example.com/people/alice");
    const person = makeNamedNode("https://schema.org/Person");
    const generatedBy = makeNamedNode("https://example.com/generatedBy");
    const generator = makeNamedNode("https://example.com/activities/import");

    const quadA = makeQuad(alice, generatedBy, generator);
    const quadB = makeQuad(alice, RDF_TYPE, person);

    const left = makeDataset([quadA, quadB]);
    const right = makeDataset([quadB, quadA]);

    expect(sortDatasetQuads(left).map(serializeQuad)).toEqual(sortDatasetQuads(right).map(serializeQuad));
    expect(areDatasetsEquivalent(left, right)).toBe(true);
  });

  it("decodes prefix maps and exposes stable vocabulary terms", () => {
    expect(decodePrefixMap({ ex: "https://example.com/" })).toEqual({ ex: "https://example.com/" });
    expect(PROV_ENTITY.value).toBe("http://www.w3.org/ns/prov#Entity");
    expect(PROV_ACTIVITY.value).toBe("http://www.w3.org/ns/prov#Activity");
    expect(PROV_WAS_GENERATED_BY.value).toBe("http://www.w3.org/ns/prov#wasGeneratedBy");
  });
});
