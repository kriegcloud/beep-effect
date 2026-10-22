/**
 * The proposition algebra: what a claim can say.
 *
 * Every variant names its roles (`member`, `organization`, `subordinate`,
 * `superior`...) instead of `{ source, target, edgeType, direction }`, so the
 * schema itself rejects reversed or type-confused relations. Endpoint ids are
 * scheme-prefixed, so a person id in an account slot fails to decode.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $ScratchpadId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as Order from "effect/Order";
import * as S from "effect/Schema";
import { AccountId, ConceptIri, ContextRef, IdentifierId, PartyId, VoiceId } from "./Ids.ts";
import { thunkEmptyArray } from "@beep/utils";

const $I = $ScratchpadId.create("party/Proposition");

/**
 * How an identifier relates to a party. `used-by` is weaker than
 * `controlled-by`; `represents` is what a role mailbox does for a department.
 *
 * @category proposition
 * @since 0.0.0
 */
export const IdentifierRelation = LiteralKit(["used-by", "controlled-by", "owned-by", "operated-by", "represents"]).pipe(
  $I.annoteSchema("IdentifierRelation", { description: "How an identifier or account relates to a party." })
);
export type IdentifierRelation = typeof IdentifierRelation.Type;

/**
 * Name kinds. A name is a dated claim, not a party field.
 *
 * @category proposition
 * @since 0.0.0
 */
export const NameKind = LiteralKit(["legal", "preferred", "former", "nickname", "observed-display", "transliteration"]).pipe(
  $I.annoteSchema("NameKind", { description: "Kind of name a party is known by." })
);

const distinctPair = (tag: string, left: string, right: string) =>
  S.makeFilter((value: Record<string, unknown>) => value[left] !== value[right], $I.annote(`${tag}DistinctRolesCheck`, { message: `Expected ${left} and ${right} to be different parties.` }));

const SameParty = S.TaggedStruct("SameParty", { left: PartyId, right: PartyId });
const DistinctParty = S.TaggedStruct("DistinctParty", { left: PartyId, right: PartyId });
const ReportsTo = S.TaggedStruct("ReportsTo", {
  subordinate: PartyId,
  superior: PartyId,
  organization: S.OptionFromNullOr(PartyId),
});
const DelegateOf = S.TaggedStruct("DelegateOf", {
  delegate: PartyId,
  principal: PartyId,
  account: S.OptionFromNullOr(AccountId),
});

/**
 * The closed set of propositions the party model admits. `External` is the
 * explicit, recognizable extension case for SKOS/AgRelOn relationship kinds;
 * there is no stringly-typed fallback.
 *
 * @category proposition
 * @since 0.0.0
 */
export const Proposition = S.Union([
  // identity
  S.TaggedStruct("IdentifierOf", { identifier: IdentifierId, party: PartyId, relation: IdentifierRelation }),
  S.TaggedStruct("AccountIdentifier", { account: AccountId, identifier: IdentifierId }),
  S.TaggedStruct("MailboxKind", {
    account: AccountId,
    kind: LiteralKit(["individual", "shared", "role", "distribution-list", "system"]),
  }),
  S.TaggedStruct("AccountControl", { account: AccountId, controller: PartyId, relation: IdentifierRelation }),
  S.TaggedStruct("VoiceAuthor", { voice: VoiceId, author: PartyId }),
  SameParty.check(distinctPair("SameParty", "left", "right")),
  DistinctParty.check(distinctPair("DistinctParty", "left", "right")),
  S.TaggedStruct("PartyName", { party: PartyId, nameKind: NameKind, value: S.NonEmptyString }),
  // organization
  S.TaggedStruct("Membership", {
    member: PartyId,
    organization: PartyId,
    role: S.OptionFromNullOr(ConceptIri),
    title: S.OptionFromNullOr(S.String),
  }),
  ReportsTo.check(distinctPair("ReportsTo", "subordinate", "superior")),
  DelegateOf.check(distinctPair("DelegateOf", "delegate", "principal")),
  // context: client, custodian, witness, inventor, opposing counsel, target...
  S.TaggedStruct("ContextRole", { party: PartyId, context: ContextRef, role: ConceptIri }),
  // extension
  S.TaggedStruct("External", { subject: PartyId, object: PartyId, predicate: ConceptIri }),
]).pipe(
  S.toTaggedUnion("_tag"),
  $I.annoteSchema("Proposition", { description: "Closed, role-named proposition algebra." })
);
export type Proposition = typeof Proposition.Type;

/**
 * Deterministic logical key: the "same fact" across assertions and versions.
 * Symmetric propositions order their endpoints so `Same(a,b) ≡ Same(b,a)`.
 *
 * @category proposition
 * @since 0.0.0
 */
export const logicalKey = Proposition.match({
  IdentifierOf: (p) => `IdentifierOf|${p.identifier}|${p.party}|${p.relation}`,
  AccountIdentifier: (p) => `AccountIdentifier|${p.account}|${p.identifier}`,
  // one current kind per mailbox: a new kind supersedes, it does not coexist
  MailboxKind: (p) => `MailboxKind|${p.account}`,
  AccountControl: (p) => `AccountControl|${p.account}|${p.controller}|${p.relation}`,
  VoiceAuthor: (p) => `VoiceAuthor|${p.voice}|${p.author}`,
  SameParty: (p) => `SameParty|${pipe([p.left, p.right], A.sort(Order.String), A.join("|"))}`,
  DistinctParty: (p) => `DistinctParty|${pipe([p.left, p.right], A.sort(Order.String), A.join("|"))}`,
  PartyName: (p) => `PartyName|${p.party}|${p.nameKind}|${p.value}`,
  Membership: (p) => `Membership|${p.member}|${p.organization}`,
  ReportsTo: (p) => `ReportsTo|${p.subordinate}|${p.superior}`,
  DelegateOf: (p) => `DelegateOf|${p.delegate}|${p.principal}`,
  ContextRole: (p) => `ContextRole|${p.party}|${p.context}|${p.role}`,
  External: (p) => `External|${p.subject}|${p.predicate}|${p.object}`,
});

/**
 * Parties a proposition mentions, by role. Exhaustive: a new variant fails to
 * compile until it states its participants.
 *
 * @category proposition
 * @since 0.0.0
 */
export const partiesOf = Proposition.match({
  IdentifierOf: (p) => [p.party],
  AccountIdentifier: thunkEmptyArray<PartyId>(),
  MailboxKind: thunkEmptyArray<PartyId>(),
  AccountControl: (p) => [p.controller],
  VoiceAuthor: (p) => [p.author],
  SameParty: (p) => [p.left, p.right],
  DistinctParty: (p) => [p.left, p.right],
  PartyName: (p) => [p.party],
  Membership: (p) => [p.member, p.organization],
  ReportsTo: (p) => [p.subordinate, p.superior],
  DelegateOf: (p) => [p.delegate, p.principal],
  ContextRole: (p) => [p.party],
  External: (p) => [p.subject, p.object],
});
