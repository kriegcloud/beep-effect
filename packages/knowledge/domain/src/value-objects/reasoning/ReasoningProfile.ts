import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/reasoning/ReasoningProfile");

export class ReasoningProfile extends BS.StringLiteralKit(
  "rdfs-full",
  "rdfs-subclass",
  "rdfs-domain-range",
  "owl-sameas",
  "owl-full",
  "custom"
).annotations(
  $I.annotations("ReasoningProfile", {
    description: "Supported reasoning profiles for the inference engine.",
  })
) {}

export declare namespace ReasoningProfile {
  export type Type = typeof ReasoningProfile.Type;
  export type Encoded = typeof ReasoningProfile.Encoded;
}

export class ReasoningProfileDescription extends BS.MappedLiteralKit(
  [S.decodeUnknownSync(ReasoningProfile)("rdfs-full"), "Full RDFS entailment (domain, range, subclass, subproperty)"],
  [S.decodeUnknownSync(ReasoningProfile)("rdfs-subclass"), "RDFS subclass-only entailment (rdfs9 + rdfs11)"],
  [S.decodeUnknownSync(ReasoningProfile)("rdfs-domain-range"), "RDFS domain/range-only entailment (rdfs2 + rdfs3)"],
  [S.decodeUnknownSync(ReasoningProfile)("owl-sameas"), "OWL sameAs closure (symmetry + transitivity + propagation)"],
  [S.decodeUnknownSync(ReasoningProfile)("owl-full"), "RDFS full + OWL property rules"],
  [S.decodeUnknownSync(ReasoningProfile)("custom"), "User-defined inference rules"]
).annotations(
  $I.annotations("ReasoningProfileDescription", {
    title: "Reasoning Profile Description",
    description: "Human-readable descriptions for each reasoning profile",
  })
) {}

export declare namespace ReasoningProfileDescription {
  export type Type = typeof ReasoningProfileDescription.Type;
  export type Encoded = typeof ReasoningProfileDescription.Encoded;
}
