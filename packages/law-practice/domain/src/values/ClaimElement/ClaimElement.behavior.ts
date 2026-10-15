/**
 * Contract of the pure claim-element decomposer.
 *
 * **Details**
 *
 * This module declares the decomposer's signature only. The deterministic
 * rule implementation binds to it in a later phase as
 * `const decomposeClaim: ClaimElementDecomposer`, so its parameters, success
 * value and failure channel are fixed before any rule exists.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import type * as Effect from "effect/Effect";
import type { PatentClaim, PatentClaims } from "../PatentDocument/PatentDocument.model.ts";
import type { ClaimDecompositionError } from "./ClaimElement.errors.ts";
import type { ClaimElementTree } from "./ClaimElement.tree.model.ts";

/**
 * Pure decomposition of one normalized patent claim into its claim-element tree.
 *
 * **Details**
 *
 * The second argument is the document's whole validated claim set. It is the
 * context the claim is read in: a dependent claim's `claimReferences` resolve
 * against it, which is how `depends-on-element` edges reach earlier claims.
 * The claim itself must be a member of that set.
 *
 * An implementation is pure and deterministic: the same claim and claim set
 * always give the same tree. Its requirements channel is `never`, so it reads
 * no services, files, configuration or clock. It fails only when no tree can
 * be built at all ({@link ClaimDecompositionError}); phrasing no rule covers
 * still yields a tree, and the antecedent policy reports it as
 * `pattern-not-covered`.
 *
 * **Example** (Bind a decomposer that refuses every claim)
 *
 * ```ts
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 * import { ClaimDecompositionError } from "@beep/law-practice-domain/values/ClaimElement"
 * import type { ClaimElementDecomposer } from "@beep/law-practice-domain/values/ClaimElement"
 * import { PatentClaim } from "@beep/law-practice-domain/values/PatentDocument"
 *
 * const PosInt = S.Int.check(S.isGreaterThan(0))
 *
 * const refuse: ClaimElementDecomposer = (claim) =>
 *   Effect.fail(
 *     ClaimDecompositionError.make({
 *       claimNumber: claim.claimNumber,
 *       message: `Claim ${claim.claimNumber} has no segmentable structure.`,
 *       reason: "unsupported-claim-text"
 *     })
 *   )
 *
 * const claim = PatentClaim.cases.independent.make({
 *   body: "a sensor",
 *   claimNumber: PosInt.make(1),
 *   claimText: "A system comprising a sensor.",
 *   preamble: "A system",
 *   transition: "comprising"
 * })
 * const exit = Effect.runSyncExit(refuse(claim, [claim]))
 * console.log(exit._tag) // "Failure"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ClaimElementDecomposer = (
  claim: PatentClaim,
  claims: PatentClaims
) => Effect.Effect<ClaimElementTree, ClaimDecompositionError>;
