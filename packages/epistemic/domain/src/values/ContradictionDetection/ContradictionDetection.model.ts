/**
 * Caller-populated contradiction-detection inputs and sealed output content.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import {
  ExactNegationConfidence as ExactNegation,
  makeContradictionDetectionSnapshot,
  makeContradictionDetectionVocabulary,
  makeDetectedContradiction,
  makeDetectionBelief,
  ValueConflictConfidence as ValueConflict,
} from "@beep/epistemics/ContradictionDetection";
import { $EpistemicDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import {
  BeliefVersionRef,
  ContradictionCandidateContent,
  ContradictionCandidateDigest,
  ContradictionCandidateKey,
  ContradictionMatchBasis,
  ContradictionProposalContent,
} from "../Contradiction/index.ts";

const $I = $EpistemicDomainId.create("values/ContradictionDetection/ContradictionDetection.model");
const vocabulary = makeContradictionDetectionVocabulary({ $I });
const belief = makeDetectionBelief({
  $I,
  vocabulary,
  BeliefVersionRef,
  ContradictionMatchBasis,
  ContradictionProposalContent,
});
/**
 * Direct logical conflict classes supported by detector version 1.
 *
 * **Example** (ConflictClass)
 *
 * ```ts import.meta.vitest name="ConflictClass"
 * import { ConflictClass } from "@beep/epistemic-domain/values/ContradictionDetection"
 * console.log(ConflictClass.literals)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const ConflictClass = vocabulary.ConflictClass;

/** Runtime type of {@link ConflictClass}.
 * @category type-level
 * @since 0.0.0
 */
export type ConflictClass = typeof ConflictClass.Type;

/**
 * Explicit assertion polarity supplied by the snapshot caller.
 *
 * **Example** (DetectionPolarity)
 *
 * ```ts import.meta.vitest name="DetectionPolarity"
 * import { DetectionPolarity } from "@beep/epistemic-domain/values/ContradictionDetection"
 * console.log(DetectionPolarity.literals)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const DetectionPolarity = vocabulary.DetectionPolarity;

/** Runtime type of {@link DetectionPolarity}.
 * @category type-level
 * @since 0.0.0
 */
export type DetectionPolarity = typeof DetectionPolarity.Type;

/**
 * One caller-populated assertion whose whole fact fits a shipped resolution proposal.
 *
 * **Example** (DetectionBelief)
 *
 * ```ts import.meta.vitest name="DetectionBelief"
 * import { DetectionBelief } from "@beep/epistemic-domain/values/ContradictionDetection"
 * console.log(DetectionBelief.fields.polarity.literals)
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export class DetectionBelief extends S.Opaque<DetectionBelief, { readonly brand: unique symbol }>()(
  belief.DetectionBeliefSchema
) {}

const snapshot = makeContradictionDetectionSnapshot({ $I, vocabulary, DetectionBelief });

/**
 * One explicit view snapshot with caller-declared single-valued predicate keys.
 *
 * **Example** (ContradictionDetectionSnapshot)
 *
 * ```ts import.meta.vitest name="ContradictionDetectionSnapshot"
 * import { ContradictionDetectionSnapshot } from "@beep/epistemic-domain/values/ContradictionDetection"
 * console.log(ContradictionDetectionSnapshot.fields.singleValuedPredicates)
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export class ContradictionDetectionSnapshot extends S.Opaque<
  ContradictionDetectionSnapshot,
  { readonly brand: unique symbol }
>()(snapshot.ContradictionDetectionSnapshotSchema) {}

/**
 * Fixed confidence for an assertion paired with its explicit equal negation.
 *
 * **Example** (ExactNegationConfidence)
 *
 * ```ts import.meta.vitest name="ExactNegationConfidence"
 * import { ExactNegationConfidence } from "@beep/epistemic-domain/values/ContradictionDetection"
 * console.log(ExactNegationConfidence)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const ExactNegationConfidence = ExactNegation;

/**
 * Fixed review hint for unequal assertions under caller-declared single cardinality.
 *
 * **Example** (ValueConflictConfidence)
 *
 * ```ts import.meta.vitest name="ValueConflictConfidence"
 * import { ValueConflictConfidence } from "@beep/epistemic-domain/values/ContradictionDetection"
 * console.log(ValueConflictConfidence)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const ValueConflictConfidence = ValueConflict;

const detected = makeDetectedContradiction({
  $I,
  contradiction: { ContradictionCandidateDigest, ContradictionCandidateKey },
  ContradictionCandidateContent,
});

/**
 * Candidate content plus shipped seals, without clock or database stamps.
 *
 * **Example** (DetectedContradiction)
 *
 * ```ts import.meta.vitest name="DetectedContradiction"
 * import { DetectedContradiction } from "@beep/epistemic-domain/values/ContradictionDetection"
 * console.log(DetectedContradiction.fields.candidateKey)
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export class DetectedContradiction extends S.Opaque<DetectedContradiction, { readonly brand: unique symbol }>()(
  detected.DetectedContradictionSchema
) {}
