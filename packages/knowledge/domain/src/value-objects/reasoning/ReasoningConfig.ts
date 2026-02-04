/**
 * Reasoning configuration value object
 *
 * Configuration parameters for controlling reasoning behavior including
 * depth limits, inference caps, and profile selection.
 *
 * @module knowledge-domain/value-objects/reasoning/ReasoningConfig
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { ReasoningProfile } from "./ReasoningProfile";

const $I = $KnowledgeDomainId.create("value-objects/reasoning/ReasoningConfig");

/**
 * PositiveInt - A positive integer (greater than 0)
 *
 * @since 0.1.0
 * @category value-objects
 */
const PositiveInt = S.Number.pipe(
  S.int(),
  S.positive(),
  S.annotations({
    title: "Positive Integer",
    description: "A positive integer greater than 0",
  })
);

/**
 * ReasoningConfig - Configuration for the reasoning engine
 *
 * Controls the behavior of the inference engine including:
 * - Maximum recursion depth for rule application
 * - Maximum number of inferences to generate
 * - Reasoning profile to use
 *
 * @since 0.1.0
 * @category value-objects
 */
export class ReasoningConfig extends S.Class<ReasoningConfig>($I`ReasoningConfig`)({
  /**
   * Maximum depth for recursive rule application.
   * Prevents infinite loops in cyclic ontologies.
   * @default 10
   */
  maxDepth: S.propertySignature(PositiveInt).pipe(
    S.withConstructorDefault(() => 10)
  ),

  /**
   * Maximum number of inferences to generate.
   * Acts as a safety limit to prevent runaway inference.
   * @default 10_000
   */
  maxInferences: S.propertySignature(PositiveInt).pipe(
    S.withConstructorDefault(() => 10_000)
  ),

  /**
   * Reasoning profile to use for inference.
   * Determines which rule sets are applied.
   * @default "RDFS"
   */
  profile: S.propertySignature(ReasoningProfile).pipe(
    S.withConstructorDefault(() => "RDFS" as const)
  ),
}) {}

/**
 * Default reasoning configuration.
 *
 * @since 0.1.0
 * @category value-objects
 */
export const DefaultReasoningConfig = new ReasoningConfig({});
