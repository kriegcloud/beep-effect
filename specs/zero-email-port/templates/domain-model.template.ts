/**
 * Domain Model Template
 *
 * Copy this template and replace:
 * - `Example` with your entity name
 * - `ExampleId` with your EntityId
 * - Field definitions with your domain fields
 */

import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { makeFields } from "@beep/shared-domain/common";
import { EntityId } from "@beep/schema";

// ─────────────────────────────────────────────────────────────────────────────
// EntityId
// ─────────────────────────────────────────────────────────────────────────────

export const ExampleId = EntityId.make("example__");
export type ExampleId = typeof ExampleId.Type;

// ─────────────────────────────────────────────────────────────────────────────
// Domain Model
// ─────────────────────────────────────────────────────────────────────────────

export class Example extends M.Class<Example>("Example")({
  id: ExampleId.Schema,
  name: S.String,
  description: S.optionalWith(S.String, { as: "Option" }),
  isActive: S.Boolean,
  ...makeFields,
}) {}

// ─────────────────────────────────────────────────────────────────────────────
// Domain Errors
// ─────────────────────────────────────────────────────────────────────────────

export class ExampleNotFoundError extends S.TaggedError<ExampleNotFoundError>()(
  "ExampleNotFoundError",
  {
    id: ExampleId.Schema,
  }
) {}

export class ExampleValidationError extends S.TaggedError<ExampleValidationError>()(
  "ExampleValidationError",
  {
    field: S.String,
    reason: S.String,
  }
) {}

// ─────────────────────────────────────────────────────────────────────────────
// Input/Output Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const CreateExampleInput = S.Struct({
  name: S.String.pipe(S.minLength(1), S.maxLength(255)),
  description: S.optional(S.String.pipe(S.maxLength(1000))),
});
export type CreateExampleInput = typeof CreateExampleInput.Type;

export const UpdateExampleInput = S.Struct({
  id: ExampleId.Schema,
  name: S.optional(S.String.pipe(S.minLength(1), S.maxLength(255))),
  description: S.optional(S.String.pipe(S.maxLength(1000))),
  isActive: S.optional(S.Boolean),
});
export type UpdateExampleInput = typeof UpdateExampleInput.Type;

// ─────────────────────────────────────────────────────────────────────────────
// Derived Types
// ─────────────────────────────────────────────────────────────────────────────

export type ExampleInsert = typeof Example.insert.Type;
export type ExampleUpdate = typeof Example.update.Type;
