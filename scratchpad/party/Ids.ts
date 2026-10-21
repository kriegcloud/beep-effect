/**
 * Prefixed, branded identifiers for the party data model.
 *
 * Every id is a string with a fixed scheme prefix. The prefix is checked at the
 * decode boundary, so a person id placed in an account slot fails to decode
 * instead of silently type-checking as "some string". Identity lives in these
 * ids, never in `effect/Graph` node indexes.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $ScratchpadId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $ScratchpadId.create("party/Ids");

const prefixed = (prefix: string) =>
  S.String.check(
    S.isPattern(new RegExp(`^${prefix}:\\S+$`), $I.annote(`${prefix}PrefixCheck`, { message: `Expected an id of the form "${prefix}:<value>".` }))
  );

/**
 * A canonical party (person, organization, collective). Never an account.
 *
 * @category ids
 * @since 0.0.0
 */
export const PartyId = prefixed("party").pipe(
  S.brand("PartyId"),
  $I.annoteSchema("PartyId", { description: "Identifier with the party: scheme." })
);
export type PartyId = typeof PartyId.Type;

/**
 * An identifier string such as an email address or phone number.
 *
 * @category ids
 * @since 0.0.0
 */
export const IdentifierId = prefixed("ident").pipe(
  S.brand("IdentifierId"),
  $I.annoteSchema("IdentifierId", { description: "Identifier with the ident: scheme." })
);
export type IdentifierId = typeof IdentifierId.Type;

/**
 * An account on some system (mailbox, social account, phone line).
 *
 * @category ids
 * @since 0.0.0
 */
export const AccountId = prefixed("acct").pipe(
  S.brand("AccountId"),
  $I.annoteSchema("AccountId", { description: "Identifier with the acct: scheme." })
);
export type AccountId = typeof AccountId.Type;

/**
 * A voice: whoever composed and sent under one channel configuration.
 *
 * @category ids
 * @since 0.0.0
 */
export const VoiceId = prefixed("voice").pipe(
  S.brand("VoiceId"),
  $I.annoteSchema("VoiceId", { description: "Identifier with the voice: scheme." })
);
export type VoiceId = typeof VoiceId.Type;

/**
 * Immutable artifact content, keyed by its SHA-256 digest.
 *
 * @category ids
 * @since 0.0.0
 */
export const ContentId = prefixed("sha256").pipe(
  S.brand("ContentId"),
  $I.annoteSchema("ContentId", { description: "Identifier with the sha256: scheme." })
);
export type ContentId = typeof ContentId.Type;

/**
 * One occurrence of artifact content in a collection (a path, a Bates range, a PST child).
 *
 * @category ids
 * @since 0.0.0
 */
export const OccurrenceId = prefixed("occ").pipe(
  S.brand("OccurrenceId"),
  $I.annoteSchema("OccurrenceId", { description: "Identifier with the occ: scheme." })
);
export type OccurrenceId = typeof OccurrenceId.Type;

/**
 * A provenance activity (extraction run, resolver run, human review).
 *
 * @category ids
 * @since 0.0.0
 */
export const ActivityId = prefixed("act").pipe(
  S.brand("ActivityId"),
  $I.annoteSchema("ActivityId", { description: "Identifier with the act: scheme." })
);
export type ActivityId = typeof ActivityId.Type;

/**
 * A deterministic or model-produced observation.
 *
 * @category ids
 * @since 0.0.0
 */
export const ObservationId = prefixed("obs").pipe(
  S.brand("ObservationId"),
  $I.annoteSchema("ObservationId", { description: "Identifier with the obs: scheme." })
);
export type ObservationId = typeof ObservationId.Type;

/**
 * A communication event (message, meeting, call).
 *
 * @category ids
 * @since 0.0.0
 */
export const EventId = prefixed("evt").pipe(
  S.brand("EventId"),
  $I.annoteSchema("EventId", { description: "Identifier with the evt: scheme." })
);
export type EventId = typeof EventId.Type;

/**
 * A source-local assertion: one proposition asserted by one source occurrence.
 *
 * @category ids
 * @since 0.0.0
 */
export const AssertionId = prefixed("asrt").pipe(
  S.brand("AssertionId"),
  $I.annoteSchema("AssertionId", { description: "Identifier with the asrt: scheme." })
);
export type AssertionId = typeof AssertionId.Type;

/**
 * An immutable bitemporal claim version in the authority ledger.
 *
 * @category ids
 * @since 0.0.0
 */
export const ClaimVersionId = prefixed("cv").pipe(
  S.brand("ClaimVersionId"),
  $I.annoteSchema("ClaimVersionId", { description: "Identifier with the cv: scheme." })
);
export type ClaimVersionId = typeof ClaimVersionId.Type;

/**
 * A derived assessment (operational hierarchy signal, evidence-kind classification).
 *
 * @category ids
 * @since 0.0.0
 */
export const AssessmentId = prefixed("asmt").pipe(
  S.brand("AssessmentId"),
  $I.annoteSchema("AssessmentId", { description: "Identifier with the asmt: scheme." })
);
export type AssessmentId = typeof AssessmentId.Type;

/**
 * An authenticated human principal (reviewer, analyst).
 *
 * @category ids
 * @since 0.0.0
 */
export const PrincipalId = prefixed("user").pipe(
  S.brand("PrincipalId"),
  $I.annoteSchema("PrincipalId", { description: "Identifier with the user: scheme." })
);
export type PrincipalId = typeof PrincipalId.Type;

/**
 * A context the party plays a role in (matter, case, deal, campaign).
 *
 * @category ids
 * @since 0.0.0
 */
export const ContextRef = prefixed("ctx").pipe(
  S.brand("ContextRef"),
  $I.annoteSchema("ContextRef", { description: "Identifier with the ctx: scheme." })
);
export type ContextRef = typeof ContextRef.Type;

/**
 * A SKOS concept IRI for open vocabularies (roles, relationship kinds, services).
 *
 * @category ids
 * @since 0.0.0
 */
export const ConceptIri = S.String.check(
  S.isPattern(/^(https?:\/\/|urn:)\S+$/, $I.annote("ConceptIriCheck", { message: "Expected an http(s) or urn concept IRI." }))
).pipe(S.brand("ConceptIri"), $I.annoteSchema("ConceptIri", { description: "SKOS concept IRI." }));
export type ConceptIri = typeof ConceptIri.Type;

/**
 * A hex digest used to pin an evidence basis, a configuration, or a text version.
 *
 * @category ids
 * @since 0.0.0
 */
export const Digest = S.String.check(
  S.isPattern(/^[0-9a-f]{8,64}$/, $I.annote("DigestCheck", { message: "Expected a lowercase hex digest." }))
).pipe(S.brand("Digest"), $I.annoteSchema("Digest", { description: "Lowercase hex digest." }));
export type Digest = typeof Digest.Type;
