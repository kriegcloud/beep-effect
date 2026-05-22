/**
 * Internal schema module support.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import type * as S from "effect/Schema";
import type * as Model from "../Model/index.ts";
import type * as VariantSchema from "../VariantSchema/index.ts";
/**
 * Selected-row schema field map attached to entity definitions.
 *
 * @since 0.0.0
 * @category models
 */
export type Fields = Readonly<Record<string, S.Top>>;

/**
 * Explicit variant field accepted by {@link ClassFactory}.
 *
 * @since 0.0.0
 * @category models
 */
export type EntityVariantFieldInput = VariantSchema.Field.Any & {
  readonly schemas: VariantSchema.Field.ConfigWithKeys<Model.Variant> & {
    readonly select: S.Top;
  };
};

/**
 * Field input accepted by {@link ClassFactory}.
 *
 * @since 0.0.0
 * @category models
 */
export type EntityFieldInput = S.Top | EntityVariantFieldInput;

/**
 * Entity field input map accepted by {@link ClassFactory}.
 *
 * @since 0.0.0
 * @category models
 */
export type EntityFieldInputs = Readonly<Record<string, EntityFieldInput>>;

/**
 * Extract the selected-row schema from one entity field input.
 *
 * @since 0.0.0
 * @category models
 */
export type SelectedFieldOf<Field extends EntityFieldInput> = Field extends {
  readonly schemas: {
    readonly select: infer Select extends S.Top;
  };
}
  ? Select
  : Field extends S.Top
    ? Field
    : never;

/**
 * Extract selected-row schemas from an entity field input map.
 *
 * @since 0.0.0
 * @category models
 */
export type SelectedFieldsOf<FieldMap extends EntityFieldInputs> = {
  readonly [K in keyof FieldMap]: SelectedFieldOf<FieldMap[K]>;
};
