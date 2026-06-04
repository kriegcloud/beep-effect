import { $OntologyId } from "@beep/identity/packages";
import {
  getOntologyKeyMetadata,
  getOntologyMetadata,
  isOntologyClassAnnotationDraft,
  Ontology,
  OntologyAssemblyError,
  projectJsonLdContext,
  projectTurtle,
} from "@beep/ontology";
import { XSD_STRING } from "@beep/rdf/Vocab/Xsd";
import { describe, expect, it } from "@effect/vitest";
import { Effect, pipe, Result } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const { Ont, $I } = Ontology.create({
  identity: $OntologyId.create("ontology-package-test"),
  baseIri: "https://example.org/test#",
  preferredPrefix: "test",
  label: "Ontology Package Test",
});

class Parent extends S.Class<Parent>($I`Parent`)(
  {
    label: S.NonEmptyString.pipe(
      $I.annoteKey(
        "Parent.label",
        Ont.dataPredicate({
          description: "Parent label.",
          range: XSD_STRING,
        })
      )
    ),
  },
  $I.annote(
    "Parent",
    Ont.class({
      description: "Parent ontology class.",
    })
  )
) {}

class Child extends S.Class<Child>($I`Child`)(
  {
    label: S.NonEmptyString.pipe(
      $I.annoteKey(
        "Child.label",
        Ont.dataPredicate({
          description: "Child label.",
          range: XSD_STRING,
        })
      )
    ),
    parent: Parent.pipe(
      $I.annoteKey(
        "Child.parent",
        Ont.objectPredicate({
          description: "Parent relationship.",
          range: Parent,
        })
      )
    ),
  },
  $I.annote(
    "Child",
    Ont.class({
      description: "Child ontology class.",
      parents: [Parent],
      sameAs: [Ont.sameAs("https://schema.org/Thing")],
    })
  )
) {}

class MultilineComment extends S.Class<MultilineComment>($I`MultilineComment`)(
  {},
  $I.annote(
    "MultilineComment",
    Ont.class({
      description: "Line one\nLine two\tTabbed\rCarriage",
    })
  )
) {}

describe("@beep/ontology", () => {
  it("stores class and key ontology annotations on Effect schemas", () => {
    const classMetadata = getOntologyMetadata(Parent);
    const keyMetadata = getOntologyKeyMetadata(Child.fields.parent);

    expect(classMetadata?.kind).toBe("classDraft");
    expect(isOntologyClassAnnotationDraft(classMetadata)).toBe(true);
    expect(keyMetadata?.kind).toBe("objectPredicateDraft");
  });

  it("assembles schema references into ontology metadata", () => {
    const ontology = Effect.runSync(Ont.build([Parent, Child]));
    const child = pipe(
      ontology.classes,
      A.findFirst((ontologyClass) => ontologyClass.termName === "Child"),
      O.getOrThrow
    );
    const parentPredicate = pipe(
      child.predicates,
      A.findFirst((predicate) => predicate.fieldName === "parent"),
      O.getOrThrow
    );

    expect(child.parents[0]?.iri).toBe("https://example.org/test#Parent");
    expect(child.sameAs[0]?.iri).toBe("https://schema.org/Thing");
    expect(parentPredicate.kind).toBe("objectPredicate");
    if (parentPredicate.kind === "objectPredicate") {
      expect(parentPredicate.rangeClassIri).toBe("https://example.org/test#Parent");
    }
  });

  it("projects JSON-LD and Turtle", () => {
    const ontology = Effect.runSync(Ont.build([Parent, Child]));
    const context = projectJsonLdContext(ontology);
    const turtle = projectTurtle(ontology);

    expect(context["@context"].Child).toEqual({
      "@id": "https://example.org/test#Child",
    });
    expect(turtle).toContain("<https://example.org/test#Child> a rdfs:Class");
    expect(turtle).toContain("<https://example.org/test#parent> a owl:ObjectProperty");
  });

  it("escapes Turtle string literal control characters", () => {
    const ontology = Effect.runSync(Ont.build([MultilineComment]));
    const turtle = projectTurtle(ontology);

    expect(turtle).toContain('rdfs:comment "Line one\\nLine two\\tTabbed\\rCarriage"');
  });

  it("round-trips projected JSON-LD", () => {
    const ontology = Effect.runSync(Ont.build([Parent, Child]));
    const roundTrip = Ont.fromJsonLD(Ont.toJsonLD(ontology));

    expect(Result.isSuccess(roundTrip)).toBe(true);
    if (Result.isSuccess(roundTrip)) {
      expect(A.length(roundTrip.success.classes)).toBe(A.length(ontology.classes));
      expect(roundTrip.success.metadata.baseIri).toBe("https://example.org/test#");
    }
  });

  it("returns a typed JSON-LD parse failure for documents with no class nodes", () => {
    const ontology = Effect.runSync(Ont.build([Parent, Child]));
    const result = Ont.fromJsonLD({ ...Ont.toJsonLD(ontology), "@graph": [] });

    expect(Result.isFailure(result)).toBe(true);
    if (Result.isFailure(result)) {
      expect(result.failure).toBeInstanceOf(OntologyAssemblyError);
      expect(result.failure.reason).toBe("missingClassMetadata");
    }
  });
});
