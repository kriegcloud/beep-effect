/**
 * Effect SQL model helpers that become `Utils.ModelUtils`, offering deterministic
 * metadata extraction for documentation and runtime wiring.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const modelUtilsTable = { fields: { id: {} } };
 * const modelUtilsFieldKeys = Utils.ModelUtils.modelFieldKeys(modelUtilsTable);
 * const modelUtilsExample: FooTypes.Prettify<typeof modelUtilsFieldKeys> = modelUtilsFieldKeys;
 * void modelUtilsExample;
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
import { invariant } from "@beep/invariant";
import * as A from "effect/Array";
import * as Struct from "effect/Struct";

type ModelWithFields = {
  readonly fields: Record<string, unknown>;
};

type ModelFieldKeys = <const Model extends ModelWithFields>(
  model: Model
) => A.NonEmptyReadonlyArray<keyof Model["fields"] & string>;

/**
 * Produces a non-empty list of field keys from an Effect SQL model, asserting
 * that the model actually defines fields.
 *
 * @example
 * import { ModelUtils } from "@beep/utils";
 *
 * const modelUtilsInput = { fields: { id: {} } };
 * const keys = ModelUtils.modelFieldKeys(modelUtilsInput);
 * // ["id"]
 *
 * @category Data/Model
 * @since 0.1.0
 */
export const modelFieldKeys: ModelFieldKeys = <const Model extends ModelWithFields>(model: Model) => {
  const keys = Struct.keys(model.fields) as Array<keyof Model["fields"]>;
  invariant(A.isNonEmptyReadonlyArray(keys), "Empty model", {
    file: "packages/common/utils/src/data/model.utils.ts",
    line: 15,
    args: [model],
  });
  return keys as A.NonEmptyReadonlyArray<keyof Model["fields"] & string>;
};
