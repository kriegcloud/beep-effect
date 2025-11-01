import type { Field } from "@effect/experimental/VariantSchema";
import type * as StringTypes from "./string.types.js";

export type ModelStringKeyFields = {
  readonly [k: StringTypes.NonEmptyString]: Field.Any;
};

export type NonEmptyModelFields<Fields extends ModelStringKeyFields> = Fields extends NonNullable<unknown>
  ? NonNullable<unknown> extends Fields
    ? never
    : Fields
  : never;
