import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

import { IRI } from "./Quad";

const $I = $KnowledgeDomainId.create("value-objects/rdf/ProvenanceVocabulary");

export const PROV_NAMESPACE = "http://www.w3.org/ns/prov#" as const;

export class ProvenanceTerm extends BS.StringLiteralKit(
  "Entity",
  "Activity",
  "Agent",
  "wasGeneratedBy",
  "wasDerivedFrom",
  "wasAttributedTo",
  "startedAtTime",
  "endedAtTime",
  "generatedAtTime",
  "used",
  "wasAssociatedWith"
).annotations(
  $I.annotations("ProvenanceTerm", {
    description: "PROV-O terms used by extraction and provenance services",
  })
) {}

export declare namespace ProvenanceTerm {
  export type Type = typeof ProvenanceTerm.Type;
}

export class ProvenanceTermIri extends BS.MappedLiteralKit(
  ["Entity", `${PROV_NAMESPACE}Entity`],
  ["Activity", `${PROV_NAMESPACE}Activity`],
  ["Agent", `${PROV_NAMESPACE}Agent`],
  ["wasGeneratedBy", `${PROV_NAMESPACE}wasGeneratedBy`],
  ["wasDerivedFrom", `${PROV_NAMESPACE}wasDerivedFrom`],
  ["wasAttributedTo", `${PROV_NAMESPACE}wasAttributedTo`],
  ["startedAtTime", `${PROV_NAMESPACE}startedAtTime`],
  ["endedAtTime", `${PROV_NAMESPACE}endedAtTime`],
  ["generatedAtTime", `${PROV_NAMESPACE}generatedAtTime`],
  ["used", `${PROV_NAMESPACE}used`],
  ["wasAssociatedWith", `${PROV_NAMESPACE}wasAssociatedWith`]
).annotations(
  $I.annotations("ProvenanceTermIri", {
    description: "IRI mapping for PROV-O terms used by server services",
  })
) {}

export declare namespace ProvenanceTermIri {
  export type Type = typeof ProvenanceTermIri.Type;
  export type Encoded = typeof ProvenanceTermIri.Encoded;
}

export const PROV = ProvenanceTermIri.DecodedEnum;

export class ProvActivity extends S.Class<ProvActivity>($I`ProvActivity`)(
  {
    iri: IRI,
    startedAtTime: BS.DateTimeUtcFromAllAcceptable,
    endedAtTime: S.optionalWith(BS.DateTimeUtcFromAllAcceptable, { nullable: true }),
    wasAssociatedWith: IRI,
  },
  $I.annotations("ProvActivity", {
    description: "PROV-O Activity metadata for extraction runs",
  })
) {}

export class ProvEntityProvenance extends S.Class<ProvEntityProvenance>($I`ProvEntityProvenance`)(
  {
    iri: IRI,
    wasGeneratedBy: IRI,
    generatedAtTime: S.optionalWith(BS.DateTimeUtcFromAllAcceptable, { nullable: true }),
    wasDerivedFrom: S.optional(IRI),
    wasAttributedTo: S.optional(IRI),
  },
  $I.annotations("ProvEntityProvenance", {
    description: "PROV-O linkage between generated entities and extraction activities",
  })
) {}

export class ProvAgent extends S.Class<ProvAgent>($I`ProvAgent`)(
  {
    iri: IRI,
    label: S.optional(S.NonEmptyTrimmedString),
  },
  $I.annotations("ProvAgent", {
    description: "PROV-O Agent metadata for extraction systems and models",
  })
) {}
