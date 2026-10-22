/**
 * Content-derived proposal identity and canonical JSON reuse for detection.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import {
  canonicalDetectionJson as canonicalJson,
  makeDetectionProposalId,
} from "@beep/epistemics/ContradictionDetection";
import {
  BeliefVersionRef,
  ContradictionProposalContent,
  ContradictionProposalId as ProposalIdSchema,
} from "../Contradiction/index.ts";
import type * as Result from "effect/Result";
import type * as S from "effect/Schema";
import type { ContradictionProposalId } from "../Contradiction/index.ts";
/**
 * Encode JSON values with the same canonicalizer used by shipped contradiction seals.
 *
 * **Example** (canonicalDetectionJson)
 *
 * ```ts import.meta.vitest name="canonicalDetectionJson"
 * import { canonicalDetectionJson } from "@beep/epistemic-domain/values/ContradictionDetection"
 * console.log(canonicalDetectionJson({ b: 2, a: 1 }))
 * ```
 *
 * @category encoding
 * @since 0.0.0
 */
export const canonicalDetectionJson: (value: unknown) => string = canonicalJson;
/**
 * Hash the losing immutable ref and the complete replacement fact for one proposal.
 *
 * **Example** (detectionProposalId)
 *
 * ```ts import.meta.vitest name="detectionProposalId"
 * import { detectionProposalId } from "@beep/epistemic-domain/values/ContradictionDetection"
 * import { BeliefVersionRef } from "@beep/epistemic-domain/values/Contradiction"
 * import * as Result from "effect/Result"
 * import * as S from "effect/Schema"
 * import * as Str from "effect/String"
 * const ref = Result.getOrThrow(S.decodeResult(BeliefVersionRef)({ edgeVersionId: 1, logicalKey: Str.repeat(64)("a"), version: 1 }))
 * const id = Result.getOrThrow(detectionProposalId(ref, { subject: "example", predicate: "status", value: "A", polarity: "asserted" }))
 * Str.length(id) // => 64
 * ```
 *
 * @category identifiers
 * @since 0.0.0
 */
export const detectionProposalId: {
  (
    losingBelief: BeliefVersionRef,
    fact: typeof ContradictionProposalContent.fields.fact.Type
  ): Result.Result<ContradictionProposalId, S.SchemaError>;
  (
    fact: typeof ContradictionProposalContent.fields.fact.Type
  ): (losingBelief: BeliefVersionRef) => Result.Result<ContradictionProposalId, S.SchemaError>;
} = makeDetectionProposalId({
  contradiction: { ContradictionProposalId: ProposalIdSchema },
  BeliefVersionRef,
  ContradictionProposalContent,
}).detectionProposalId;
