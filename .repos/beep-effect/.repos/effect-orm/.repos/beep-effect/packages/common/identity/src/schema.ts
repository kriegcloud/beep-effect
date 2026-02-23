/**
 * Schema definitions for identity validation including module segments, base segments, and error classes.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { ModuleSegment, InvalidSegmentError } from "@beep/identity/schema"
 *
 * const segment = S.decodeUnknownSync(ModuleSegment)("my-module")
 * ```
 *
 * @category schemas
 * @since 0.1.0
 */
import * as F from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";
/**
 * Schema that validates module name characters to contain only alphanumeric characters, hyphens, or underscores.
 *
 * @category Validation/Schema
 * @example
 * ```typescript
 * import { ModuleCharacters } from "@beep/module-domain"
 * import * as S from "effect/Schema"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const valid = yield* S.decodeUnknown(ModuleCharacters)("my-module_123")
 *   const invalid = yield* S.decodeUnknown(ModuleCharacters)("my.module@invalid")
 * })
 * ```
 * @since 0.1.0
 */
export const ModuleCharacters = S.String.pipe(
  S.pattern(/^[A-Za-z0-9_-]+$/, {
    message: () => "Module segments must contain only alphanumeric characters, hyphens, or underscores.",
  })
);
/**
 * Schema for validating that a string starts with an alphabetic character.
 * Used to ensure module segments begin with a letter to create valid JavaScript accessors.
 *
 * @category Schemas/Validation
 * @example
 * ```typescript
 * import { ModuleLeadingAlpha } from "@beep/monorepo-tools"
 * import * as S from "effect/Schema"
 * import * as Effect from "effect/Effect"
 *
 * const validateModule = S.decodeUnknown(ModuleLeadingAlpha)
 *
 * Effect.gen(function* () {
 *   const valid = yield* validateModule("myModule")     // ✓ passes
 *   const invalid = yield* validateModule("2invalid")   // ✗ fails
 * })
 * ```
 * @since 0.1.0
 */
export const ModuleLeadingAlpha = S.String.pipe(
  S.pattern(/^[A-Za-z]/, {
    message: () => "Module segments must start with an alphabetic character to create valid accessors.",
  })
);

// Base schemas
/**
 * Schema for validating identity segments with strict formatting rules.
 *
 * @category Schemas
 * @example
 * ```typescript
 * import { Segment } from "@beep/iam-domain"
 * import * as S from "@effect/schema/Schema"
 * import * as Effect from "effect/Effect"
 *
 * const parseSegment = S.decodeUnknown(Segment)
 *
 * Effect.gen(function* () {
 *   const valid = yield* parseSegment("user-profile")
 *   const invalid = yield* parseSegment("/invalid/")
 * })
 * ```
 * @since 0.1.0
 */
export const Segment = S.String.pipe(
  S.filter((value) => F.pipe(value, Str.isNonEmpty), {
    message: () => "Identity segments cannot be empty.",
  }),
  S.filter((value) => !F.pipe(value, Str.startsWith("/")), {
    message: () => 'Identity segments cannot start with "/".',
  }),
  S.filter((value) => !F.pipe(value, Str.endsWith("/")), {
    message: () => 'Identity segments cannot end with "/".',
  })
);
/**
 * Type representing a parsed segment from the Segment schema.
 *
 * @category Models/Segment
 * @example
 * ```typescript
 * import { SegmentType } from "@beep/routing-domain"
 * import * as Effect from "effect/Effect"
 *
 * const processSegment = (segment: SegmentType): Effect.Effect<string> =>
 *   Effect.succeed(`Processing segment: ${segment}`)
 * ```
 * @since 0.1.0
 */
export type SegmentType = S.Schema.Type<typeof Segment>;

/**
 * A branded string schema for module segments that enforces naming conventions for valid module accessors.
 * Module segments must start with an alphabetic character and contain only alphanumeric characters, hyphens, or underscores.
 *
 * @category Models/Path
 * @example
 * ```typescript
 * import { ModuleSegment } from "@beep/path-domain"
 * import * as S from "@effect/schema/Schema"
 * import * as Effect from "effect/Effect"
 *
 * const validSegment = S.decodeUnknownEither(ModuleSegment)("user-service")
 * const invalidSegment = S.decodeUnknownEither(ModuleSegment)("123-invalid")
 *
 * Effect.gen(function* () {
 *   const segment = yield* S.decode(ModuleSegment)("auth-module")
 *   console.log(segment) // "auth-module"
 * })
 * ```
 * @since 0.1.0
 */
export const ModuleSegment = Segment.pipe(
  S.pattern(/^[A-Za-z]/, {
    message: () => "Module segments must start with an alphabetic character to create valid accessors.",
  }),
  S.pattern(/^[A-Za-z0-9_-]+$/, {
    message: () => "Module segments must contain only alphanumeric characters, hyphens, or underscores.",
  }),
  S.brand("ModuleSegment")
);
/**
 * Type representing a validated module segment string that contains only alphanumeric characters, hyphens, or underscores.
 *
 * @category Models/Module
 * @example
 * ```typescript
 * import { ModuleSegmentType } from "@beep/module-domain"
 * import * as S from "@effect/schema/Schema"
 * import * as Effect from "effect/Effect"
 *
 * const parseSegment = (input: string): Effect.Effect<ModuleSegmentType, S.ParseError> =>
 *   S.decodeUnknown(ModuleSegment)(input)
 *
 * const validSegment = parseSegment("my-module")  // Success
 * const invalidSegment = parseSegment("my@module") // ParseError
 * ```
 * @since 0.1.0
 */
export type ModuleSegmentType = S.Schema.Type<typeof ModuleSegment>;

/**
 * Schema for validating identity base segments with strict formatting rules.
 *
 * @category Models/Identity
 * @example
 * ```typescript
 * import { BaseSegment } from "@beep/iam-domain"
 * import * as S from "@effect/schema/Schema"
 * import * as Effect from "effect/Effect"
 *
 * const validBase = S.decodeUnknown(BaseSegment)("user-123")
 * const invalidBase = S.decodeUnknown(BaseSegment)("-invalid-")
 *
 * Effect.gen(function* () {
 *   const base = yield* validBase
 *   console.log(base) // "user-123"
 * })
 * ```
 * @since 0.1.0
 */
export const BaseSegment = S.String.pipe(
  S.filter((value) => F.pipe(value, Str.isNonEmpty), {
    message: () => "Identity bases cannot be empty.",
  }),
  S.pattern(/^[A-Za-z0-9](?:[A-Za-z0-9_-]*[A-Za-z0-9])?$/, {
    message: () =>
      "Identity bases must use alphanumeric, hyphen, or underscore characters and start/end with alphanumeric.",
  }),
  S.brand("BaseSegment")
);

// Tagged errors
/**
 * Error thrown when an identity segment is invalid.
 *
 * @category Errors
 * @example
 * ```typescript
 * import { InvalidSegmentError } from "@beep/iam-domain"
 * import * as Effect from "effect/Effect"
 *
 * const error = new InvalidSegmentError({
 *   value: "invalid..segment",
 *   reason: "Segment contains consecutive dots"
 * })
 *
 * const program = Effect.fail(error)
 * ```
 * @since 0.1.0
 */
export class InvalidSegmentError extends S.TaggedError<InvalidSegmentError>("InvalidSegmentError")(
  "InvalidSegmentError",
  {
    value: S.String,
    reason: S.optional(S.String),
  }
) {
  override get message(): string {
    return this.reason ?? `Identity segments are invalid: ${this.value}`;
  }
}

/**
 * Error thrown when a module segment contains invalid characters or format.
 *
 * @category Errors
 * @example
 * ```typescript
 * import { InvalidModuleSegmentError } from "@beep/core"
 * import * as Effect from "effect/Effect"
 *
 * const error = new InvalidModuleSegmentError({
 *   value: "invalid-segment!",
 *   reason: "Module segments cannot contain special characters"
 * })
 *
 * const program = Effect.fail(error)
 * ```
 * @since 0.1.0
 */
export class InvalidModuleSegmentError extends S.TaggedError<InvalidModuleSegmentError>("InvalidModuleSegmentError")(
  "InvalidModuleSegmentError",
  {
    value: S.String,
    reason: S.optional(S.String),
  }
) {
  override get message(): string {
    return this.reason ?? `Module segments are invalid: ${this.value}`;
  }
}

/**
 * Error thrown when an identity base value is invalid.
 *
 * @category Errors
 * @example
 * ```typescript
 * import { InvalidBaseError } from "@beep/identity-domain"
 * import * as Effect from "effect/Effect"
 *
 * const error = new InvalidBaseError({
 *   value: "invalid-base",
 *   reason: "Base must be alphanumeric"
 * })
 *
 * const program = Effect.fail(error)
 * ```
 * @since 0.1.0
 */
export class InvalidBaseError extends S.TaggedError<InvalidBaseError>("InvalidBaseError")("InvalidBaseError", {
  value: S.String,
  reason: S.optional(S.String),
}) {
  override get message(): string {
    return this.reason ?? `Identity bases are invalid: ${this.value}`;
  }
}
