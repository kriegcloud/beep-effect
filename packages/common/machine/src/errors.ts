import { $MachineId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $MachineId.create("errors");

/** Attempted to spawn/restore actor with ID already in use */
export class DuplicateActorError extends S.TaggedError<DuplicateActorError>($I`DuplicateActorError`)(
  "DuplicateActorError",
  { actorId: S.String },
  $I.annotations("DuplicateActorError", {
    description: "Attempted to spawn or restore an actor with an ID already in use",
  })
) {}

/** Machine has unprovided effect slots */
export class UnprovidedSlotsError extends S.TaggedError<UnprovidedSlotsError>($I`UnprovidedSlotsError`)(
  "UnprovidedSlotsError",
  { slots: S.Array(S.String) },
  $I.annotations("UnprovidedSlotsError", {
    description: "Machine has guard or effect slots that were not provided implementations",
  })
) {}

/** Operation requires schemas attached to machine */
export class MissingSchemaError extends S.TaggedError<MissingSchemaError>($I`MissingSchemaError`)(
  "MissingSchemaError",
  { operation: S.String },
  $I.annotations("MissingSchemaError", {
    description: "Operation requires state or event schemas attached to the machine",
  })
) {}

/** State/Event schema has no variants */
export class InvalidSchemaError extends S.TaggedError<InvalidSchemaError>($I`InvalidSchemaError`)(
  "InvalidSchemaError",
  {},
  $I.annotations("InvalidSchemaError", {
    description: "State or event schema definition contains no variants",
  })
) {}

/** $match called with missing handler for tag */
export class MissingMatchHandlerError extends S.TaggedError<MissingMatchHandlerError>($I`MissingMatchHandlerError`)(
  "MissingMatchHandlerError",
  { tag: S.String },
  $I.annotations("MissingMatchHandlerError", {
    description: "Pattern match called with a missing handler for a variant tag",
  })
) {}

/** Slot handler not found at runtime (internal error) */
export class SlotProvisionError extends S.TaggedError<SlotProvisionError>($I`SlotProvisionError`)(
  "SlotProvisionError",
  {
    slotName: S.String,
    slotType: S.Literal("guard", "effect"),
  },
  $I.annotations("SlotProvisionError", {
    description: "Slot handler was not found at runtime during machine execution",
  })
) {}

/** Machine.build() validation failed - missing or extra handlers */
export class ProvisionValidationError extends S.TaggedError<ProvisionValidationError>($I`ProvisionValidationError`)(
  "ProvisionValidationError",
  {
    missing: S.Array(S.String),
    extra: S.Array(S.String),
  },
  $I.annotations("ProvisionValidationError", {
    description: "Machine build validation failed due to missing or extra handler provisions",
  })
) {}

/** Assertion failed in testing utilities */
export class AssertionError extends S.TaggedError<AssertionError>($I`AssertionError`)(
  "AssertionError",
  { message: S.String },
  $I.annotations("AssertionError", {
    description: "Assertion failed in testing utilities",
  })
) {}
