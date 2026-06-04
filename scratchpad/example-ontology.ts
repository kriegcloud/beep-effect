import { $ScratchpadId } from "@beep/identity/packages";
import { IRI } from "@beep/semantic-web/iri";
import { XSD_STRING } from "@beep/semantic-web/vocab/xsd";
import { Effect } from "effect";
import * as S from "effect/Schema";
import {
  JsonLdContextDocument,
  Ontology,
  OWL_THING,
  makeIri,
  projectJsonLdContext,
  projectTurtle,
} from "./ontology-builder/index.js";

export const { Ont, $I, metadata: ExampleOntologyMetadata } = Ontology.create({
  identity: $ScratchpadId.create("example-ontology"),
  baseIri: "https://example.org/ontology#",
  preferredPrefix: "ex",
  label: "Example Ontology",
  comment: "Neutral scratch ontology used to prove schema annotation fibration.",
});

export const ExampleOntologyBaseIri = Ont.iri("https://example.org/ontology#");
export const ExampleOrganizationTerm = Ont.termName("Organization");
export const ExamplePersonTerm = Ont.termName("Person");
export const ExampleLegalNameTerm = Ont.termName("legalName");
export const ExampleNameTerm = Ont.termName("name");
export const ExampleHomepageTerm = Ont.termName("homepage");
export const ExampleMemberOfTerm = Ont.termName("memberOf");

export const ExampleOrganizationIri = Ont.iri(ExampleOntologyBaseIri, ExampleOrganizationTerm);
export const ExamplePersonIri = Ont.iri(ExampleOntologyBaseIri, ExamplePersonTerm);
export const ExampleLegalNameIri = Ont.iri(ExampleOntologyBaseIri, ExampleLegalNameTerm);
export const ExampleNameIri = Ont.iri(ExampleOntologyBaseIri, ExampleNameTerm);
export const ExampleHomepageIri = Ont.iri(ExampleOntologyBaseIri, ExampleHomepageTerm);
export const ExampleMemberOfIri = Ont.iri(ExampleOntologyBaseIri, ExampleMemberOfTerm);

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
  },
  $I.annote(
    "Organization",
    Ont.class({
      description: "Neutral organization class used by the scratch ontology builder.",
    })
  )
) {}

export class Person extends S.Class<Person>($I`Person`)(
  {
    name: S.NonEmptyString.pipe(
      $I.annoteKey(
        "Person.name",
        Ont.dataPredicate({
          description: "Preferred display name for the person.",
          range: XSD_STRING,
        })
      )
    ),
    homepage: IRI.pipe(
      $I.annoteKey(
        "Person.homepage",
        Ont.dataPredicate({
          description: "Homepage IRI for the person.",
          range: XSD_STRING,
        })
      )
    ),
    memberOf: IRI.pipe(
      $I.annoteKey(
        "Person.memberOf",
        Ont.objectPredicate({
          description: "Organization IRI that this person belongs to.",
          range: "Organization",
        })
      )
    ),
  },
  $I.annote(
    "Person",
    Ont.class({
      description: "Neutral person class used by the scratch ontology builder.",
    })
  )
) {}

export const ExampleExternalActorRoleTerm = Ont.termName("ExternalActorRole");
export const ExampleRoleInDocumentTerm = Ont.termName("RoleInDocument");
export const ExampleActorAttributesTerm = Ont.termName("ActorAttributes");
export const ExampleActorPlayerTerm = Ont.termName("ActorPlayer");
export const FolioActorPlayerIri = Ont.iri("https://folio.openlegalstandard.org/R8CdMpOM0RmyrgCCvbpiLS0");

export class ExternalActorRole extends S.Class<ExternalActorRole>($I`ExternalActorRole`)(
  {},
  $I.annote(
    "ExternalActorRole",
    Ont.class({
      description: "External actor-role class used to prove class equivalence references.",
    })
  )
) {}

export class RoleInDocument extends S.Class<RoleInDocument>($I`RoleInDocument`)(
  {},
  $I.annote(
    "RoleInDocument",
    Ont.class({
      description: "FOLIO-inspired child class for roles held in documents.",
    })
  )
) {}

export class ActorAttributes extends S.Class<ActorAttributes>($I`ActorAttributes`)(
  {},
  $I.annote(
    "ActorAttributes",
    Ont.class({
      description: "FOLIO-inspired child class for actor attributes.",
    })
  )
) {}

export class ActorPlayer extends S.Class<ActorPlayer>($I`ActorPlayer`)(
  {},
  $I.annote(
    "ActorPlayer",
    Ont.class({
      iri: FolioActorPlayerIri,
      label: "Actor / Player",
      altLabels: ["Actor", "Player", "Player Role"],
      definition:
        "A person who has a role in a legal matter, such as buyer, provider, lawyer, law firm, expert, employer, employee, seller, lessor, lessee, debtor, creditor, payor, payee, landlord, or tenant.",
      description: "FOLIO-inspired actor/player class used to prove class relationships and mapping metadata.",
      source: "https://folio.openlegalstandard.org/R8CdMpOM0RmyrgCCvbpiLS0/html",
      parents: [OWL_THING],
      children: [RoleInDocument, ActorAttributes],
      isDefinedBy: [],
      equivalentClasses: [ExternalActorRole],
      exactMatches: ["https://example.org/legal-taxonomy/actor-player"],
      closeMatches: ["https://example.org/legal-taxonomy/legal-actor"],
      sameAs: ["https://example.org/resources/actor-player"],
    })
  )
) {}

export const ExamplePersonValue = Person.make({
  name: "Ada Lovelace",
  homepage: makeIri("https://example.org/people/ada"),
  memberOf: makeIri("https://example.org/organizations/analytical-engine-circle"),
});

export const DecodeExamplePerson = S.decodeUnknownEffect(Person)({
  name: "Ada Lovelace",
  homepage: "https://example.org/people/ada",
  memberOf: "https://example.org/organizations/analytical-engine-circle",
});

export const ExampleOntology = Ont.build([Organization, Person]);

export const ExampleJsonLdContext = ExampleOntology.pipe(Effect.map(projectJsonLdContext));

export const ExampleTurtle = ExampleOntology.pipe(Effect.map(projectTurtle));

export const FolioExampleOntology = Ont.build([ExternalActorRole, RoleInDocument, ActorAttributes, ActorPlayer]);

export const FolioExampleJsonLdOntology = FolioExampleOntology.pipe(Effect.map(Ont.toJsonLD));

export const FolioExampleRoundTripOntology = FolioExampleJsonLdOntology.pipe(Effect.map(Ont.fromJsonLD));

export const FolioExampleRoundTripJsonLdOntology = FolioExampleRoundTripOntology.pipe(Effect.map(Ont.toJsonLD));

export const ExpectedExampleJsonLdContext: typeof JsonLdContextDocument.Encoded = {
  "@context": {
    "@vocab": "https://example.org/ontology#",
    Organization: {
      "@id": "https://example.org/ontology#Organization",
    },
    legalName: {
      "@id": "https://example.org/ontology#legalName",
      "@type": XSD_STRING.value,
    },
    Person: {
      "@id": "https://example.org/ontology#Person",
    },
    name: {
      "@id": "https://example.org/ontology#name",
      "@type": XSD_STRING.value,
    },
    homepage: {
      "@id": "https://example.org/ontology#homepage",
      "@type": XSD_STRING.value,
    },
    memberOf: {
      "@id": "https://example.org/ontology#memberOf",
      "@type": "@id",
    },
  },
};

export const ExpectedExampleTurtle = `@prefix ex: <https://example.org/ontology#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<https://example.org/ontology#Organization> a rdfs:Class ;
  rdfs:label "Organization" ;
  rdfs:comment "Neutral organization class used by the scratch ontology builder." ;
  rdfs:isDefinedBy <https://example.org/ontology#Organization> .

<https://example.org/ontology#Person> a rdfs:Class ;
  rdfs:label "Person" ;
  rdfs:comment "Neutral person class used by the scratch ontology builder." ;
  rdfs:isDefinedBy <https://example.org/ontology#Person> .

<https://example.org/ontology#legalName> a rdf:Property ;
  rdfs:label "legal name" ;
  rdfs:comment "Legal display name for the organization." ;
  rdfs:domain <https://example.org/ontology#Organization> ;
  rdfs:range <${XSD_STRING.value}> .

<https://example.org/ontology#name> a rdf:Property ;
  rdfs:label "name" ;
  rdfs:comment "Preferred display name for the person." ;
  rdfs:domain <https://example.org/ontology#Person> ;
  rdfs:range <${XSD_STRING.value}> .

<https://example.org/ontology#homepage> a rdf:Property ;
  rdfs:label "homepage" ;
  rdfs:comment "Homepage IRI for the person." ;
  rdfs:domain <https://example.org/ontology#Person> ;
  rdfs:range <${XSD_STRING.value}> .

<https://example.org/ontology#memberOf> a rdf:Property ;
  rdfs:label "member of" ;
  rdfs:comment "Organization IRI that this person belongs to." ;
  rdfs:domain <https://example.org/ontology#Person> ;
  rdfs:range <https://example.org/ontology#Organization> .`;
