/**
 * Canonical parties, identifiers, and accounts.
 *
 * The rule this file enforces by omission: a party carries no email, phone,
 * handle, title, or employer field. Everything that changes over time or can
 * be shared lives in its own record and reaches a party only through an
 * evidence-backed claim (see `Proposition.ts`).
 *
 * ```text
 * Party ≠ Account ≠ Identifier ≠ Voice ≠ Observation ≠ Claim
 * ```
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $ScratchpadId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as Str from "effect/String";
import * as S from "effect/Schema";
import { AccountId, ConceptIri, IdentifierId, PartyId } from "./Ids.ts";
import { flow } from "effect/Function";

const $I = $ScratchpadId.create("party/Party");

// ---------------------------------------------------------------------------
// Party
// ---------------------------------------------------------------------------

/**
 * Kinds of collective agent that have their own identity, lifecycle, or
 * relationships (the promotion rule: a grouping becomes a party only when it
 * has a life of its own; otherwise it stays a relationship episode).
 *
 * @category party
 * @since 0.0.0
 */
export const CollectiveKind = LiteralKit(["household", "team", "committee", "joint-venture", "other"]).pipe(
  $I.annoteSchema("CollectiveKind", { description: "Kinds of collective agent with their own identity." })
);
export type CollectiveKind = typeof CollectiveKind.Type;

/**
 * A canonical party: who we currently mean, independent of every role,
 * account, and identifier. "Client", "custodian", "target", "inventor" and
 * "defendant" are context roles (`ContextRole`), never party kinds.
 *
 * @category party
 * @since 0.0.0
 */
export const Party = S.TaggedUnion({
  Person: {
    id: PartyId,
    /** Display only. Names are claims (`PartyName`), never identity. */
    label: S.NonEmptyString,
  },
  Organization: {
    id: PartyId,
    label: S.NonEmptyString,
    /** Open classification (company, department, law firm, patent office...). */
    orgKind: S.OptionFromNullOr(ConceptIri),
  },
  CollectiveAgent: {
    id: PartyId,
    label: S.NonEmptyString,
    collectiveKind: CollectiveKind,
  },
}).pipe($I.annoteSchema("Party", { description: "Canonical person, organization, or collective agent." }));
export type Party = typeof Party.Type;

// ---------------------------------------------------------------------------
// Identifier
// ---------------------------------------------------------------------------

/**
 * An identifier is a string some system uses to address or name an account.
 * It is shareable, reassignable, and recyclable, so it is never a party.
 * `normalized` is the dedupe key; `raw` preserves what the source said.
 *
 * @category identifier
 * @since 0.0.0
 */
export const Identifier = S.TaggedUnion({
  EmailAddress: { id: IdentifierId, normalized: S.NonEmptyString, raw: S.String },
  PhoneNumber: { id: IdentifierId, e164: S.NonEmptyString, raw: S.String },
  /** Exchange legacyExchangeDN / X.500 address as it appears in MAPI headers. */
  ExchangeDn: { id: IdentifierId, normalized: S.NonEmptyString, raw: S.String },
  Username: { id: IdentifierId, service: ConceptIri, handle: S.NonEmptyString },
  NativeAccountId: { id: IdentifierId, service: ConceptIri, value: S.NonEmptyString },
  ExternalId: { id: IdentifierId, scheme: ConceptIri, value: S.NonEmptyString },
}).pipe(
  $I.annoteSchema("Identifier", { description: "Addressable identifier; never a party." })
);
export type Identifier = typeof Identifier.Type;

/**
 * Deterministic dedupe key for an identifier: two observations of the same
 * normalized string resolve to one identifier record without any judgment.
 *
 * @category identifier
 * @since 0.0.0
 */
export const identifierKey = Identifier.match({
  EmailAddress: (i) => `email:${i.normalized}`,
  PhoneNumber: (i) => `tel:${i.e164}`,
  ExchangeDn: (i) => `x500:${i.normalized}`,
  Username: (i) => `user:${i.service}:${Str.toLowerCase(i.handle)}`,
  NativeAccountId: (i) => `native:${i.service}:${i.value}`,
  ExternalId: (i) => `ext:${i.scheme}:${i.value}`,
});

/**
 * Lowercase and trim an email address. Deliberately does not strip `+tags` or
 * dots: provider-specific canonicalization is a claim, not a normalization.
 *
 * @category identifier
 * @since 0.0.0
 */
export const normalizeEmail = flow(Str.trim, Str.toLowerCase);

/**
 * Uppercase and trim an X.500 / legacyExchangeDN address.
 *
 * @category identifier
 * @since 0.0.0
 */
export const normalizeExchangeDn = (raw: string): string => Str.toUpperCase(Str.trim(raw));

// ---------------------------------------------------------------------------
// Account
// ---------------------------------------------------------------------------

/**
 * Mail system hosting a mailbox.
 *
 * @category account
 * @since 0.0.0
 */
export const MailSystem = LiteralKit(["exchange", "google-workspace", "imap", "unknown"]).pipe(
  $I.annoteSchema("MailSystem", { description: "Mail system hosting a mailbox." })
);

/**
 * An account: a durable thing on a system that identifiers point at and
 * people operate. Whether a mailbox is individual or shared is evidence
 * (`MailboxKind` proposition), not a field, because productions often reveal
 * it late (an Exchange permissions export arrives in a later tranche).
 *
 * @category account
 * @since 0.0.0
 */
export const Account = S.TaggedUnion({
  Mailbox: { id: AccountId, system: MailSystem },
  SocialAccount: { id: AccountId, service: ConceptIri },
  PhoneLine: { id: AccountId, carrier: S.OptionFromNullOr(S.String) },
  ChatAccount: { id: AccountId, service: ConceptIri },
}).pipe(
  $I.annoteSchema("Account", { description: "Account on some system; never a party." })
);
export type Account = typeof Account.Type;
