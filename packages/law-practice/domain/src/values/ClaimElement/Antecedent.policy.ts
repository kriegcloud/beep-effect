/**
 * Contract of the pure 35 U.S.C. 112(b) antecedent-basis policy.
 *
 * **Details**
 *
 * This module declares the policy's signature only. The deterministic rule
 * set binds to it in a later phase as `const checkAntecedents: AntecedentPolicy`,
 * so its inputs and its finding output are fixed before any rule exists.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import type { PatentClaims } from "../PatentDocument/PatentDocument.model.ts";
import type { AntecedentFinding } from "./AntecedentFinding.model.ts";
import type { ClaimElementTree } from "./ClaimElement.tree.model.ts";

/**
 * Pure antecedent-basis decision over one document's claim-element trees.
 *
 * **Details**
 *
 * The trees are the decompositions of the document's claims, at most one per
 * claim number. The claim set supplies the dependency graph: every
 * referring term resolves only along its claim's dependency chains, never
 * through sibling claims, and a multiple dependent claim is checked once per
 * chain, so its findings carry the `chain` they were resolved against.
 *
 * The policy is total and deterministic. It returns typed advisory findings,
 * never a failure: an empty result means no rule fired, and a term no rule
 * covers is reported as `pattern-not-covered` rather than passed silently.
 *
 * Two inputs have no dependency chain to resolve against, and both yield
 * `pattern-not-covered` findings instead of a pass, a skip or a throw:
 *
 * - a tree whose `claimNumber` names no claim of the set yields one
 *   `pattern-not-covered` finding per referring term of that tree;
 * - a referring term whose dependency chain passes through a claim with no
 *   tree (a claim the decomposer could not decompose) yields one
 *   `pattern-not-covered` finding for that chain, because its antecedents
 *   cannot be read.
 *
 * **Gotchas**
 *
 * Trees normally come from a `ClaimElementDecomposer` over the same set, so a
 * tree outside the set signals a caller bug; it is still reported, never
 * dropped.
 *
 * **Example** (Bind a policy that reports every term as uncovered)
 *
 * ```ts
 * import * as A from "effect/Array"
 * import * as S from "effect/Schema"
 * import { AntecedentFinding, AntecedentRuleId, ClaimTermRef } from "@beep/law-practice-domain/values/ClaimElement"
 * import type { AntecedentPolicy } from "@beep/law-practice-domain/values/ClaimElement"
 * import { PatentClaim } from "@beep/law-practice-domain/values/PatentDocument"
 *
 * const PosInt = S.Int.check(S.isGreaterThan(0))
 * const rule = AntecedentRuleId.make("no-rule-yet")
 *
 * const uncovered: AntecedentPolicy = (trees) =>
 *   A.flatMap(trees, (tree) =>
 *     A.flatMap(tree.elements, (element) =>
 *       A.map(element.terms, (term) =>
 *         AntecedentFinding.cases["pattern-not-covered"].make({
 *           referring: ClaimTermRef.make({ anchor: term.anchor, path: element.path }),
 *           rule
 *         })
 *       )
 *     )
 *   )
 *
 * const claim = PatentClaim.cases.independent.make({
 *   body: "a sensor",
 *   claimNumber: PosInt.make(1),
 *   claimText: "A system comprising a sensor.",
 *   preamble: "A system",
 *   transition: "comprising"
 * })
 * console.log(uncovered([], [claim]).length) // 0
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type AntecedentPolicy = (
  trees: ReadonlyArray<ClaimElementTree>,
  claims: PatentClaims
) => ReadonlyArray<AntecedentFinding>;
