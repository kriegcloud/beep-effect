import { invariant } from "@beep/invariant";
import type * as M from "@effect/sql/Model";
import * as A from "effect/Array";
import * as Struct from "effect/Struct";

type ModelFieldKeys = <const Model extends M.Any>(
  model: Model
) => A.NonEmptyReadonlyArray<keyof Model["fields"] & string>;

export const modelFieldKeys: ModelFieldKeys = <const Model extends M.Any>(model: Model) => {
  const keys = Struct.keys(model.fields) as Array<keyof Model["fields"]>;
  invariant(A.isNonEmptyReadonlyArray(keys), "Empty model", {
    file: "packages/common/utils/src/data/model.utils.ts",
    line: 15,
    args: [model],
  });
  return keys as A.NonEmptyReadonlyArray<keyof Model["fields"] & string>;
};
