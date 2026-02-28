/**
 * Return-type selection helper for action option objects.
 *
 * @since 0.0.0
 * @module @beep/ontology/actions/ActionReturnTypeForOptions
 */
import type {
  ActionEditResponse,
  ActionValidationResponse,
  ApplyActionOptions,
  ApplyBatchActionOptions,
} from "./Actions.js";

/**
 * Resolve action return payload from a validate/edit option shape.
 *
 * @since 0.0.0
 * @category models
 */
export type ActionReturnTypeForOptions<Op extends ApplyActionOptions | ApplyBatchActionOptions> = Op extends {
  $validateOnly: true;
}
  ? ActionValidationResponse
  : Op extends { $returnEdits: true }
    ? ActionEditResponse
    : undefined;
