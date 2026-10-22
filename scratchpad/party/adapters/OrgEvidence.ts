/**
 * Organization evidence from email domains, for name collisions that
 * contact books could not settle.
 *
 * A corporate SMTP domain is evidence that some organization provisioned the
 * mailbox; it is a lead about affiliation, never identity. Free-mail domains
 * carry no organization evidence. Exchange `/O=` segments are deliberately
 * ignored: `/O=EXCHANGELABS` is shared by every Office 365 tenant.
 *
 * Per colliding display name, mailboxes with organization evidence are
 * compared pairwise:
 *
 * - all share a domain → `same-org-alias` (probably one person, several addresses),
 * - some pair has disjoint domains and overlapping observed spans →
 *   `different-orgs-concurrent` (probably different people),
 * - every disjoint pair has non-overlapping spans → `different-orgs-sequential`
 *   (possibly one person who changed organizations: a career-move lead),
 * - disjoint domains but spans unknown → `different-orgs-undated`,
 * - fewer than two mailboxes with organization evidence → `no-org-evidence`.
 *
 * Every outcome is a review lead. None becomes `SameParty`/`DistinctParty`
 * without a reviewer.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { LiteralKit } from "@beep/schema";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as N from "effect/Number";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { UtcInstant } from "../Time.ts";

/**
 * Consumer mail providers: an address there says nothing about employment.
 *
 * @category org-evidence
 * @since 0.0.0
 */
export const FreeMailDomain = LiteralKit([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "ymail.com",
  "rocketmail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "comcast.net",
  "att.net",
  "sbcglobal.net",
  "bellsouth.net",
  "verizon.net",
  "cox.net",
  "charter.net",
  "earthlink.net",
  "juno.com",
  "mchsi.com",
  "mediacombb.net",
  "centurylink.net",
  "q.com",
  "windstream.net",
  "frontiernet.net",
  "protonmail.com",
  "proton.me",
  "gmx.com",
]);

const isFreeMail = S.is(FreeMailDomain);

const SECOND_LEVEL = HashSet.make("co", "com", "org", "net", "ac", "gov", "edu");

/**
 * Organization domain of an email address: the registrable domain
 * (`mail.acme.example` → `acme.example`; `firm.co.uk` kept whole), or `None`
 * for free-mail and malformed addresses.
 *
 * @category org-evidence
 * @since 0.0.0
 */
export const organizationDomain = (email: string): O.Option<string> =>
  pipe(
    Str.split(Str.toLowerCase(email), "@"),
    A.last,
    O.filter((host) => Str.includes(".")(host)),
    O.map((host) => {
      const labels = Str.split(host, ".");
      const n = A.length(labels);
      const take = n >= 3 && HashSet.has(SECOND_LEVEL, O.getOrElse(A.get(labels, n - 2), () => "")) ? 3 : 2;
      return A.join(A.drop(labels, N.max(0, n - take)), ".");
    }),
    O.filter((domain) => !isFreeMail(domain))
  );

/**
 * What domain evidence says about one colliding name.
 *
 * @category org-evidence
 * @since 0.0.0
 */
export const OrgLead = LiteralKit([
  "same-org-alias",
  "different-orgs-concurrent",
  "different-orgs-sequential",
  "different-orgs-undated",
  "no-org-evidence",
]);
export type OrgLead = typeof OrgLead.Type;

/**
 * One mailbox under a colliding name: its organization domains and observed span.
 *
 * @category org-evidence
 * @since 0.0.0
 */
export interface MailboxEvidence {
  readonly domains: HashSet.HashSet<string>;
  readonly span: O.Option<readonly [UtcInstant, UtcInstant]>;
}

const overlap = (a: readonly [UtcInstant, UtcInstant], b: readonly [UtcInstant, UtcInstant]) =>
  a[0] <= b[1] && b[0] <= a[1];

/**
 * Classify a colliding name by organization evidence.
 *
 * @category org-evidence
 * @since 0.0.0
 */
export const classifyByOrganization = (mailboxes: ReadonlyArray<MailboxEvidence>): OrgLead => {
  const withOrg = A.filter(mailboxes, (m) => HashSet.size(m.domains) > 0);
  if (A.length(withOrg) < 2) return "no-org-evidence";
  const pairs = A.flatMap(withOrg, (a, i) => A.map(A.drop(withOrg, i + 1), (b) => [a, b] as const));
  const disjoint = A.filter(pairs, ([a, b]) => HashSet.size(HashSet.intersection(a.domains, b.domains)) === 0);
  if (A.isReadonlyArrayEmpty(disjoint)) return "same-org-alias";
  const timed = A.flatMap(disjoint, ([a, b]) => O.toArray(O.all([a.span, b.span])));
  if (A.length(timed) < A.length(disjoint)) return "different-orgs-undated";
  return A.some(timed, ([x, y]) => overlap(x, y)) ? "different-orgs-concurrent" : "different-orgs-sequential";
};

/**
 * How much a display name can say about identity. A single token ("John",
 * "Support", "Docketing") is a low-information alias, the display-name
 * analogue of shared-template evidence: it can corroborate but never found a
 * person-level collision.
 *
 * @category org-evidence
 * @since 0.0.0
 */
export const NameShape = LiteralKit(["full-name", "single-token"]);
export type NameShape = typeof NameShape.Type;

/**
 * Classify a normalized display name.
 *
 * @category org-evidence
 * @since 0.0.0
 */
export const nameShape = (name: string): NameShape =>
  A.length(A.filter(Str.split(name, /[\s,]+/), Str.isNonEmpty)) >= 2 ? "full-name" : "single-token";
