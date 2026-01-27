/**
 * SharedErrors - Cross-domain shared errors
 *
 * These errors are used across multiple domains and don't belong
 * to any specific domain. They include HttpApiSchema annotations
 * for automatic HTTP status code mapping.
 *
 * @module shared/errors/SharedErrors
 */

import { HttpApiSchema } from "@effect/platform";
import * as S from "effect/Schema";

// =============================================================================
// Internal Errors (500)
// =============================================================================

/**
 * DataCorruptionError - Data integrity violation detected
 */
export class DataCorruptionError extends S.TaggedError<DataCorruptionError>()(
  "DataCorruptionError",
  {
    entityType: S.String,
    entityId: S.String,
    reason: S.String,
  },
  HttpApiSchema.annotations({ status: 500 })
) {
  override get message(): string {
    return `Data corruption detected for ${this.entityType} ${this.entityId}: ${this.reason}`;
  }
}

export const isDataCorruptionError = S.is(DataCorruptionError);

/**
 * OperationFailedError - Generic operation failure (when specific error doesn't exist)
 */
export class OperationFailedError extends S.TaggedError<OperationFailedError>()(
  "OperationFailedError",
  {
    operation: S.String,
    reason: S.String,
  },
  HttpApiSchema.annotations({ status: 500 })
) {
  override get message(): string {
    return `Operation '${this.operation}' failed: ${this.reason}`;
  }
}

export const isOperationFailedError = S.is(OperationFailedError);
