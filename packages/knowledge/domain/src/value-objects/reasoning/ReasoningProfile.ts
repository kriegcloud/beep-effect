/**
 * Reasoning profile definitions
 *
 * Defines supported reasoning profiles for the RDFS/OWL reasoning engine.
 * Each profile enables different sets of inference rules.
 *
 * @module knowledge-domain/value-objects/reasoning/ReasoningProfile
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/reasoning/ReasoningProfile");

/**
 * ReasoningProfile - Supported reasoning profiles
 *
 * Defines the reasoning profiles supported by the inference engine:
 * - RDFS: RDF Schema entailment rules (subclass, subproperty, domain, range)
 * - OWL_RL: OWL 2 RL profile rules (more expressive, tractable subset of OWL)
 * - CUSTOM: User-defined inference rules
 *
 * @since 0.1.0
 * @category value-objects
 */
export const ReasoningProfile = S.Literal("RDFS", "OWL_RL", "CUSTOM").annotations(
  $I.annotations("ReasoningProfile", {
    title: "Reasoning Profile",
    description: "Supported reasoning profiles for the inference engine",
  })
);

export type ReasoningProfile = typeof ReasoningProfile.Type;

/**
 * Type guard for ReasoningProfile values.
 *
 * @since 0.1.0
 * @category value-objects
 */
export const isReasoningProfile = S.is(ReasoningProfile);

/**
 * ReasoningProfileDescription - Human-readable descriptions for each profile
 *
 * @since 0.1.0
 * @category value-objects
 */
export const ReasoningProfileDescription: Record<ReasoningProfile, string> = {
  RDFS: "RDF Schema entailment (subclass, subproperty, domain, range inference)",
  OWL_RL: "OWL 2 RL profile (tractable subset of OWL with rule-based semantics)",
  CUSTOM: "User-defined inference rules",
} as const;
