import { describe, expect, it } from "@effect/vitest";
import {
  getOntologyKeyMetadata,
  getOntologyMetadata,
  isOntologyClassAnnotationDraft,
} from "@beep/ontology";
import { pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import {
  ExampleJsonLdContext,
  ExampleJsonLdOntology,
  ExampleJsonLdRoundTrip,
  ExampleOntology,
  ExampleTurtleOntology,
  Organization,
} from "../index.js";

describe("scratchpad ontology builder", () => {
  it("stores ontology metadata on schema annotations", () => {
    const classMetadata = getOntologyMetadata(Organization);
    const keyMetadata = getOntologyKeyMetadata(Organization.fields.legalName);

    expect(classMetadata?.kind).toBe("classDraft");
    expect(isOntologyClassAnnotationDraft(classMetadata)).toBe(true);
    expect(keyMetadata?.kind).toBe("datatypePredicateDraft");
  });

  it("assembles class and predicate relationships from schemas", () => {
    const person = pipe(
      ExampleOntology.classes,
      A.findFirst((ontologyClass) => ontologyClass.termName === "Person"),
      O.getOrThrow
    );
    const memberOf = pipe(
      person.predicates,
      A.findFirst((predicate) => predicate.fieldName === "memberOf"),
      O.getOrThrow
    );

    expect(person.parents[0]?.iri).toBe("https://example.org/ontology#LegalActor");
    expect(person.equivalentClasses[0]?.iri).toBe("https://schema.org/Person");
    expect(memberOf.kind).toBe("objectPredicate");
    expect(memberOf.iri).toBe("https://example.org/ontology#memberOf");
    if (memberOf.kind === "objectPredicate") {
      expect(memberOf.rangeClassIri).toBe("https://example.org/ontology#Organization");
    }
  });

  it("projects JSON-LD context and ontology documents", () => {
    expect(ExampleJsonLdContext["@context"].Person).toEqual({
      "@id": "https://example.org/ontology#Person",
    });
    expect(ExampleJsonLdContext["@context"].memberOf).toEqual({
      "@id": "https://example.org/ontology#memberOf",
      "@type": "@id",
    });
    expect(A.length(ExampleJsonLdOntology["@graph"])).toBe(7);
  });

  it("round-trips through JSON-LD", () => {
    expect(A.length(ExampleJsonLdRoundTrip.classes)).toBe(A.length(ExampleOntology.classes));
    expect(ExampleJsonLdRoundTrip.metadata.baseIri).toBe(ExampleOntology.metadata.baseIri);
    expect(O.isSome(ExampleJsonLdRoundTrip.metadata.comment)).toBe(true);
  });

  it("projects Turtle for human review", () => {
    expect(ExampleTurtleOntology).toContain("@prefix ex:");
    expect(ExampleTurtleOntology).toContain("<https://example.org/ontology#Person> a rdfs:Class");
    expect(ExampleTurtleOntology).toContain("owl:equivalentClass <https://schema.org/Person>");
    expect(ExampleTurtleOntology).toContain("<https://example.org/ontology#memberOf> a owl:ObjectProperty");
  });
});
