/**
 * Variant Schema model helpers that enforce non-empty field maps.
 *
 * @example
 * import type { ModelStringKeyFields } from "@beep/types/model.types";
 * import type { Field } from "@effect/experimental/VariantSchema";
 *
 * type Fields = ModelStringKeyFields & { id: Field.Any };
 * let example!: Fields;
 * void example;
 *
 * @category Types/Model
 * @since 0.1.0
 */
import type { Field } from "@effect/experimental/VariantSchema";
import type * as StringTypes from "./string.types.js";

/**
 * Variant Schema field map restricted to non-empty string keys.
 *
 * Keeps identity helpers from accidentally generating empty property names.
 *
 * @example
 * import type { ModelStringKeyFields } from "@beep/types/model.types";
 * import type { Field } from "@effect/experimental/VariantSchema";
 *
 * type Fields = ModelStringKeyFields & { id: Field.Any; name: Field.Any };
 * let example!: Fields;
 * void example;
 *
 * @category Types/Model
 * @since 0.1.0
 */
export type ModelStringKeyFields = {
  readonly [k: StringTypes.NonEmptyString]: Field.Any;
};

/**
 * Narrows a field map to only the variants that provably contain entries.
 *
 * Guarantees we do not generate empty Variant Schema records when building
 * derived DSLs.
 *
 * @example
 * import type { NonEmptyModelFields } from "@beep/types/model.types";
 * import type { Field } from "@effect/experimental/VariantSchema";
 *
 * type NonEmpty = NonEmptyModelFields<{ id: Field.Any }>;
 * let example!: NonEmpty;
 * void example;
 *
 * @category Types/Model
 * @since 0.1.0
 */
export type NonEmptyModelFields<Fields extends ModelStringKeyFields> =
  Fields extends NonNullable<unknown> ? (NonNullable<unknown> extends Fields ? never : Fields) : never;
