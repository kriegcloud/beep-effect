/**
 * Observations, communication events, and voices.
 *
 * Events are canonical; any "Alice ↔ Bob, 247 messages" edge is a projection.
 * Event participants point at **identifiers** (what the header says), never at
 * parties. A `Voice` sits between the channel and any person: who composed and
 * sent under this channel configuration. Sender ≠ sent-representing is the
 * classic assistant / delegate case and is preserved, not collapsed.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $ScratchpadId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  AccountId,
  ActivityId,
  ContextRef,
  EventId,
  IdentifierId,
  ObservationId,
  OccurrenceId,
  PartyId,
  VoiceId,
} from "./Ids.ts";
import { EvidenceAnchor } from "./Provenance.ts";
import { UtcInstant } from "./Time.ts";
import { thunkFalse } from "@beep/utils";

const $I = $ScratchpadId.create("party/Communication");

/**
 * Header roles. `sender` (MAPI PR_SENDER) and `sent-representing`
 * (PR_SENT_REPRESENTING) are distinct from RFC 5322 `from`.
 *
 * @category communication
 * @since 0.0.0
 */
export const ParticipantRole = LiteralKit(["from", "sender", "sent-representing", "to", "cc", "bcc", "reply-to"]).pipe(
  $I.annoteSchema("ParticipantRole", { description: "Header role of a communication participant." })
);
export type ParticipantRole = typeof ParticipantRole.Type;

/**
 * How easily a piece of evidence is shared or forged. Template and bulk
 * evidence may corroborate an identity claim; it can never found one.
 *
 * @category communication
 * @since 0.0.0
 */
export const EvidenceKind = LiteralKit(["distinctive-behavior", "shared-template", "bulk-distribution"]).pipe(
  $I.annoteSchema("EvidenceKind", { description: "How shareable or forgeable a piece of evidence is." })
);
export type EvidenceKind = typeof EvidenceKind.Type;

/**
 * Speech acts a narrow classifier (or reviewer) labels on a message. These are
 * the raw material for operational-hierarchy assessments.
 *
 * @category communication
 * @since 0.0.0
 */
export const SpeechAct = LiteralKit([
  "requests-approval",
  "grants-approval",
  "escalates",
  "instructs",
  "reports-status",
]).pipe(
  $I.annoteSchema("SpeechAct", { description: "Speech act labelled on a message." }));
export type SpeechAct = typeof SpeechAct.Type;

const base = { id: ObservationId, producedBy: ActivityId, observedAt: UtcInstant };

/**
 * An observation: what a deterministic extractor, classifier, or tool actually
 * saw, bound to an exact anchor. Observations are immutable and never
 * "corrected"; a better extractor produces a new observation.
 *
 * @category observation
 * @since 0.0.0
 */
export const Observation = S.TaggedUnion({
  /** One header participant exactly as parsed, including the raw display name. */
  HeaderParticipant: {
    ...base,
    event: EventId,
    role: ParticipantRole,
    identifier: IdentifierId,
    displayName: S.OptionFromNullOr(S.String),
    anchor: EvidenceAnchor,
  },
  /** File-embedded metadata (Office Author, XMP Creator, PDF Producer...). */
  MetadataTag: {
    ...base,
    occurrence: OccurrenceId,
    namespace: S.NonEmptyString,
    tag: S.NonEmptyString,
    rawValue: S.String,
    anchor: EvidenceAnchor,
  },
  /** A signature block: a self-description by an interested source. */
  SignatureBlock: {
    ...base,
    event: EventId,
    nameText: S.NonEmptyString,
    titleText: S.OptionFromNullOr(S.String),
    organizationText: S.OptionFromNullOr(S.String),
    identifiers: S.Array(IdentifierId),
    anchor: EvidenceAnchor,
  },
  /** A row of a produced directory / HR / org-chart export. */
  DirectoryRow: {
    ...base,
    occurrence: OccurrenceId,
    fields: S.Record(S.String, S.String),
    anchor: EvidenceAnchor,
  },
  /** An Exchange permissions export row: grantee may act on a mailbox. */
  MailboxPermission: {
    ...base,
    account: AccountId,
    grantee: IdentifierId,
    permission: LiteralKit(["full-access", "send-as", "send-on-behalf"]),
    anchor: EvidenceAnchor,
  },
  /** A speech act on a message, from a classifier or reviewer. */
  SpeechActLabel: {
    ...base,
    event: EventId,
    act: SpeechAct,
    anchor: EvidenceAnchor,
  },
  /**
   * Something expected is absent from the collection: a custodian with no
   * mailbox, a reply-chain hop with no produced message. Absence is evidence
   * about the collection, scoped to it; it is never a negative world fact.
   */
  Absence: {
    ...base,
    scope: ContextRef,
    expected: S.NonEmptyString,
  },
}).pipe(
  $I.annoteSchema("Observation", { description: "Immutable extractor/tool/classifier output." })
);
export type Observation = typeof Observation.Type;

/**
 * The revisable classification of one observation's evidence kind. A signature
 * block seen under many voices gets reclassified to `shared-template`; claims
 * that leaned on it re-open.
 *
 * @category observation
 * @since 0.0.0
 */
export const EvidenceKindAssessment = S.Struct({
  observation: ObservationId,
  kind: EvidenceKind,
  producedBy: ActivityId,
  recordedAt: UtcInstant,
}).pipe($I.annoteSchema("EvidenceKindAssessment", { description: "Revisable evidence-kind classification." }));
export type EvidenceKindAssessment = typeof EvidenceKindAssessment.Type;

/**
 * One participant slot of a communication event.
 *
 * @category communication
 * @since 0.0.0
 */
export const Participant = S.Struct({
  role: ParticipantRole,
  identifier: IdentifierId,
  observation: ObservationId,
});
export type Participant = typeof Participant.Type;

/**
 * A canonical communication event. Participant lists must contain exactly one
 * `from`; at most one `sender` and one `sent-representing`.
 *
 * @category communication
 * @since 0.0.0
 */
export const CommunicationEvent = S.Struct({
  id: EventId,
  occurrence: OccurrenceId,
  channel: LiteralKit(["email", "meeting", "call", "chat"]),
  sentAt: S.OptionFromNullOr(UtcInstant),
  messageId: S.OptionFromNullOr(S.String),
  conversationKey: S.OptionFromNullOr(S.String),
  participants: S.NonEmptyArray(Participant),
})
  .check(
    S.makeFilter(
      ({ participants }) => A.length(A.filter(participants, (p) => p.role === "from")) === 1,
      $I.annote("ExactlyOneFromCheck", { message: "Expected exactly one from participant." })
    ),
    S.makeFilter(
      ({ participants }) =>
        A.length(A.filter(participants, (p) => p.role === "sender")) <= 1 &&
        A.length(A.filter(participants, (p) => p.role === "sent-representing")) <= 1,
      $I.annote("SingleSenderCheck", { message: "Expected at most one sender and one sent-representing." })
    )
  )
  .pipe($I.annoteSchema("CommunicationEvent", { description: "Canonical communication event." }));
export type CommunicationEvent = typeof CommunicationEvent.Type;

/**
 * A voice: the channel configuration a message was composed under. Its
 * candidate authors are claims (`VoiceAuthor`), never fields.
 *
 * @category communication
 * @since 0.0.0
 */
export const Voice = S.Struct({
  id: VoiceId,
  from: IdentifierId,
  sender: S.OptionFromNullOr(IdentifierId),
  representing: S.OptionFromNullOr(IdentifierId),
}).pipe($I.annoteSchema("Voice", { description: "Who composed under one channel configuration." }));
export type Voice = typeof Voice.Type;

const roleIdentifier = (event: CommunicationEvent, role: ParticipantRole) =>
  O.map(
    A.findFirst(event.participants, (p) => p.role === role),
    (p) => p.identifier
  );

/**
 * Deterministic voice key for an event: `from | sender | representing`.
 * Identical channel configurations share one voice across messages.
 *
 * @category communication
 * @since 0.0.0
 */
export const voiceOf = (event: CommunicationEvent): Voice => {
  const from = O.getOrThrow(roleIdentifier(event, "from"));
  const sender = roleIdentifier(event, "sender");
  const representing = roleIdentifier(event, "sent-representing");
  const key = A.join([from, O.getOrElse(sender, () => "-"), O.getOrElse(representing, () => "-")], "|");
  return { id: VoiceId.make(`voice:${key}`), from, sender, representing };
};

/**
 * True when the composing sender differs from the identity the message was
 * sent as: the delegate / assistant / shared-mailbox signal.
 *
 * @category communication
 * @since 0.0.0
 */
export const isDelegated = (voice: Voice): boolean =>
  O.match(voice.sender, {
    onNone: thunkFalse,
    onSome: (sender) => sender !== O.getOrElse(voice.representing, () => voice.from),
  });

/**
 * A party slot that is known to exist but whose identity is withheld
 * (redaction, privilege log). Resolving it later is an ordinary `SameParty`
 * claim against a real party.
 *
 * @category communication
 * @since 0.0.0
 */
export const RedactedPartySlot = S.Struct({
  placeholder: PartyId,
  occurrence: OccurrenceId,
  redactionReason: S.NonEmptyString,
}).pipe($I.annoteSchema("RedactedPartySlot", { description: "Withheld party known to exist." }));
