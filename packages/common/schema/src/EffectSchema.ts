/**
 * Schema helpers for validating Effect runtime values.
 *
 * This module delegates runtime detection to `Effect.isEffect`, which is the
 * canonical guard provided by the Effect library.
 *
 * @module @beep/schema/EffectSchema
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity/packages";
import { Effect } from "effect";
import * as S from "effect/Schema";

const $I = $SchemaId.create("EffectSchema");
const effectAnnotations = {
  typeConstructor: {
    _tag: "@beep/schema/EffectSchema",
  },
  generation: {
    runtime: "EffectSchema",
    Type: "EffectSchema",
    importDeclaration: 'import { EffectSchema } from "@beep/schema/EffectSchema"',
  },
  expected: "Effect",
  description: "Schema for Effect runtime values.",
  toEquivalence:
    () =>
    <A extends Effect.Effect<unknown, unknown, unknown>>(self: A, that: A): boolean =>
      self === that,
  toFormatter: () => (): string => "[Effect]",
};

/**
 * Type guard that checks whether a value is an Effect runtime value.
 *
 * This reuses {@link Effect.isEffect}, the canonical Effect guard, so schema
 * validation stays aligned with the library's own effect detection semantics.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { isEffect } from "@beep/schema/EffectSchema"
 *
 * const program = Effect.succeed(1)
 *
 * console.log(isEffect(program)) // true
 * console.log(isEffect("hello")) // false
 * ```
 *
 * @param u - The value to test.
 * @returns Whether the value is an Effect runtime value.
 * @category Validation
 * @since 0.0.0
 */
export const isEffect = Effect.isEffect;

/**
 * Declared schema for Effect runtime values.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { EffectSchema } from "@beep/schema/EffectSchema"
 *
 * const program = Effect.succeed("done")
 * const decoded = S.decodeUnknownSync(EffectSchema)(program)
 *
 * void decoded
 * ```
 *
 * @category Validation
 * @since 0.0.0
 */
export const EffectSchema = S.declare<Effect.Effect<unknown, unknown, unknown>>(isEffect, effectAnnotations).pipe(
  $I.annoteSchema("EffectSchema", {
    description: "A schema that validates Effect runtime values.",
  })
);

/**
 * Type of {@link EffectSchema}. {@inheritDoc EffectSchema}
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import type { EffectSchema } from "@beep/schema/EffectSchema"
 *
 * const program: EffectSchema = Effect.succeed("done")
 *
 * void program
 * ```
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type EffectSchema = typeof EffectSchema.Type;
