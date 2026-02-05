import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $KnowledgeDomainId.create("value-objects/reasoning/ReasoningProfile");

export const ReasoningProfile = BS.StringLiteralKit("RDFS", "OWL_RL", "CUSTOM").annotations(
  $I.annotations("ReasoningProfile", {
    title: "Reasoning Profile",
    description: "Supported reasoning profiles for the inference engine",
  })
);

export declare namespace ReasoningProfile {
  export type Type = typeof ReasoningProfile.Type;
  export type Encoded = typeof ReasoningProfile.Encoded;
}

export class ReasoningProfileDescription extends BS.MappedLiteralKit(
  [ReasoningProfile.Enum.RDFS, "RDF Schema entailment (subclass, subproperty, domain, range inference)"],
  [ReasoningProfile.Enum.OWL_RL, "OWL 2 RL profile (tractable subset of OWL with rule-based semantics)"],
  [ReasoningProfile.Enum.CUSTOM, "User-defined inference rules"]
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
