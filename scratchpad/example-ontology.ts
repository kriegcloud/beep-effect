import { $ScratchpadId } from "@beep/identity/packages";
import { Ontology, OWL_THING, projectJsonLdContext } from "@beep/ontology";
import { IRI } from "@beep/rdf/Iri";
import { XSD_ANY_URI, XSD_STRING } from "@beep/rdf/Vocab/Xsd";
import { Effect } from "effect";
import * as S from "effect/Schema";

const Example = Ontology.create({
  identity: $ScratchpadId.create("example-ontology"),
  baseIri: "https://example.org/ontology#",
  preferredPrefix: "ex",
  label: "Example Ontology",
  comment: "Neutral scratch ontology used to prove schema annotation fibration.",
});

export const Ont = Example.Ont;
export const $I = Example.$I;

export const ExampleOntologyBaseIri = Ont.iri("https://example.org/ontology#");
export const ExampleSchemaOrgOrganization = Ont.iri("https://schema.org/Organization");
export const ExampleSchemaOrgPerson = Ont.iri("https://schema.org/Person");
export const ExampleFolioActor = Ont.iri("https://folio.openlegalstandard.org/R8CdMpOM0RmyrgCCvbpiLS0");

export class LegalActor extends S.Class<LegalActor>($I`LegalActor`)(
  {
    name: S.NonEmptyString.pipe(
      $I.annoteKey(
        "LegalActor.name",
        Ont.dataPredicate({
          description: "Human-readable actor name.",
          range: XSD_STRING,
        })
      )
    ),
  },
  $I.annote(
    "LegalActor",
    Ont.class({
      description: "A neutral participant in a legal or organizational setting.",
      parents: [OWL_THING],
      sameAs: [ExampleFolioActor],
    })
  )
) {}

export class Organization extends S.Class<Organization>($I`Organization`)(
  {
    legalName: S.NonEmptyString.pipe(
      $I.annoteKey(
        "Organization.legalName",
        Ont.dataPredicate({
          description: "Legal display name for the organization.",
          range: XSD_STRING,
        })
      )
    ),
    homepage: IRI.pipe(
      $I.annoteKey(
        "Organization.homepage",
        Ont.dataPredicate({
          description: "Canonical homepage IRI for the organization.",
          range: XSD_ANY_URI,
        })
      )
    ),
  },
  $I.annote(
    "Organization",
    Ont.class({
      description: "Neutral organization class used by the scratch ontology builder.",
      parents: [LegalActor],
      equivalentClasses: [ExampleSchemaOrgOrganization],
      seeAlso: [ExampleSchemaOrgOrganization],
    })
  )
) {}

export class Person extends S.Class<Person>($I`Person`)(
  {
    name: S.NonEmptyString.pipe(
      $I.annoteKey(
        "Person.name",
        Ont.dataPredicate({
          description: "Human-readable person name.",
          range: XSD_STRING,
        })
      )
    ),
    memberOf: Organization.pipe(
      $I.annoteKey(
        "Person.memberOf",
        Ont.objectPredicate({
          description: "Organization the person is a member of.",
          range: Organization,
        })
      )
    ),
  },
  $I.annote(
    "Person",
    Ont.class({
      description: "Neutral person class used by the scratch ontology builder.",
      parents: [LegalActor],
      equivalentClasses: [ExampleSchemaOrgPerson],
      sameAs: [Ont.sameAs(ExampleSchemaOrgPerson)],
    })
  )
) {}

export const ExampleOntology = Effect.runSync(Ont.build([LegalActor, Organization, Person]));
export const ExampleJsonLdOntology = Ont.toJsonLD(ExampleOntology);
export const ExampleJsonLdContext = projectJsonLdContext(ExampleOntology);
export const ExampleTurtleOntology = Ont.toTurtle(ExampleOntology);
export const ExampleJsonLdRoundTrip = Ont.fromJsonLD(ExampleJsonLdOntology);
