/**
 * Rejection value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $LawPracticeDomainId.create("entities/Rejection/Rejection.values");

const RejectionStatute = LiteralKit(["102", "103", "101", "112"]);

/**
 * The statutory ground of a rejection, discriminated on the statute section it
 * is grounded in. The tagged union encodes prior-art cardinality directly in the
 * type: an anticipation rejection (§102) cites exactly one reference; an
 * obviousness rejection (§103) combines one or more references with a stated
 * combination rationale; subject-matter (§101) and written-description /
 * definiteness (§112) rejections cite no prior art.
 *
 * @example
 * ```ts
 * import { RejectionGround } from "@beep/law-practice-domain"
 * import * as S from "effect/Schema"
 *
 * const ground = S.decodeUnknownSync(RejectionGround)({
 *   statute: "102",
 *   referenceFixtureKey: "ref.smith",
 * })
 * console.log(ground.statute) // "102"
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const RejectionGround = RejectionStatute.toTaggedUnion("statute")({
  "101": {},
  "102": { referenceFixtureKey: S.String },
  "103": { combinationRationale: S.String, referenceFixtureKeys: S.NonEmptyArray(S.String) },
  "112": {},
}).pipe(
  $I.annoteSchema("RejectionGround", {
    description:
      "Statutory ground of a rejection, encoding prior-art cardinality per statute section (§102 = 1 reference, §103 = >=1 references + rationale, §101/§112 = 0 references).",
  })
);

/**
 * Runtime type for {@link RejectionGround}.
 *
 * @example
 * ```ts
 * import type { RejectionGround } from "@beep/law-practice-domain"
 *
 * const ground: RejectionGround = { statute: "101" }
 * console.log(ground.statute)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type RejectionGround = typeof RejectionGround.Type;
