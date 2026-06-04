import { XSD_STRING } from "@beep/semantic-web/vocab/xsd";
import { Cause, Effect, Exit } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";
import {
  $I,
  ExampleActorAttributesTerm,
  ExampleExternalActorRoleTerm,
  ExampleLegalNameIri,
  ExampleLegalNameTerm,
  ExampleOntology,
  ExampleOntologyBaseIri,
  ExampleOrganizationIri,
  ExampleRoleInDocumentTerm,
  FolioActorPlayerIri,
  FolioExampleOntology,
  Ont,
  OntologyAssemblyError,
  Organization,
  getOntologyKeyMetadata,
  getOntologyMetadata,
  projectTurtle,
} from "../index.js";

describe("scratch ontology builder annotations", () => {
  it("stores class authoring metadata in Effect schema annotations", () => {
    const metadata = getOntologyMetadata(Organization);

    expect(S.resolveAnnotations(Organization)?.ontologyMetadata).toEqual(metadata);
    expect(metadata).toMatchObject({
      kind: "classDraft",
    });
    if (metadata?.kind === "classDraft") {
      expect(O.getOrUndefined(metadata.description)).toBe("Neutral organization class used by the scratch ontology builder.");
    }
  });

  it("stores predicate authoring metadata in Effect key annotations", () => {
    const legalNameField = S.NonEmptyString.pipe(
      $I.annoteKey(
        "Organization.legalName",
        Ont.dataPredicate({
          description: "Legal display name for the organization.",
          range: XSD_STRING,
        })
      )
    );
    const metadata = getOntologyKeyMetadata(legalNameField);

    expect(S.resolveAnnotationsKey(legalNameField)?.ontologyMetadata).toEqual(metadata);
    expect(metadata).toMatchObject({
      kind: "datatypePredicateDraft",
      rangeDatatypeIri: XSD_STRING.value,
    });
  });

  it("assembles final class and predicate metadata from annotation drafts", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const ontology = yield* ExampleOntology;

        expect(ontology.classes).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              iri: ExampleOrganizationIri,
              predicates: expect.arrayContaining([
                expect.objectContaining({
                  kind: "datatypePredicate",
                  schemaIdentity: $I.make("Organization.legalName"),
                  termName: ExampleLegalNameTerm,
                  iri: ExampleLegalNameIri,
                  label: "legal name",
                  rangeDatatypeIri: XSD_STRING.value,
                }),
              ]),
            }),
          ])
        );
      })
    ));
});

describe("scratch ontology builder relationships", () => {
  it("resolves bare schema relationship targets during ontology assembly", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const ontology = yield* FolioExampleOntology;
        const maybeActorPlayer = A.findFirst(ontology.classes, (ontologyClass) => ontologyClass.iri === FolioActorPlayerIri);
        expect(O.isSome(maybeActorPlayer)).toBe(true);
        if (O.isSome(maybeActorPlayer)) {
          const actorPlayer = maybeActorPlayer.value;

          expect(actorPlayer.children).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                iri: Ont.iri(ExampleOntologyBaseIri, ExampleRoleInDocumentTerm),
              }),
              expect.objectContaining({
                iri: Ont.iri(ExampleOntologyBaseIri, ExampleActorAttributesTerm),
              }),
            ])
          );
          expect(actorPlayer.equivalentClasses).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                iri: Ont.iri(ExampleOntologyBaseIri, ExampleExternalActorRoleTerm),
              }),
            ])
          );
        }
      })
    ));

  it("projects authorable children as reverse subclass triples in Turtle", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const ontology = yield* FolioExampleOntology;
        const turtle = projectTurtle(ontology);

        expect(turtle).toContain(
          `<${Ont.iri(ExampleOntologyBaseIri, ExampleRoleInDocumentTerm)}> rdfs:subClassOf <${FolioActorPlayerIri}> .`
        );
        expect(turtle).toContain(
          `<${Ont.iri(ExampleOntologyBaseIri, ExampleActorAttributesTerm)}> rdfs:subClassOf <${FolioActorPlayerIri}> .`
        );
      })
    ));

  it("fails with a typed assembly error when a schema relationship target is not in the build set", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        class UnbuiltParent extends S.Class<UnbuiltParent>($I`UnbuiltParent`)(
          {},
          $I.annote(
            "UnbuiltParent",
            Ont.class({
              description: "Class intentionally omitted from the ontology build set.",
            })
          )
        ) {}

        class ChildWithUnbuiltParent extends S.Class<ChildWithUnbuiltParent>($I`ChildWithUnbuiltParent`)(
          {},
          $I.annote(
            "ChildWithUnbuiltParent",
            Ont.class({
              description: "Class with a relationship target omitted from the ontology build set.",
              parents: [UnbuiltParent],
            })
          )
        ) {}

        const exit = yield* Effect.exit(Ont.build([ChildWithUnbuiltParent]));

        expect(Exit.isFailure(exit)).toBe(true);
        if (Exit.isFailure(exit)) {
          const error = Cause.findErrorOption(exit.cause);
          expect(O.isSome(error)).toBe(true);
          if (O.isSome(error)) {
            expect(error.value).toBeInstanceOf(OntologyAssemblyError);
            expect(error.value.reason).toBe("unresolvedReferenceTarget");
          }
        }
      })
    ));
});
