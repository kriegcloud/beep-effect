import { ModelUtils } from "@beep/utils";
import type * as M from "@effect/sql/Model";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as S from "effect/Schema";

export const modelKit = <const Model extends M.Any>(model: Model) => {
  const keys = ModelUtils.modelFieldKeys(model);
  const keyEnum = F.pipe(
    keys,
    A.reduce({} as { readonly [K in keyof Model["fields"] & string]: K }, (acc, k) => ({
      ...acc,
      [k]: k,
    }))
  );
  const keySchema = S.Literal(...keys);
  const KeyType = keySchema.Type;
  return {
    keys,
    keyEnum,
    keySchema,
    KeyType,
  } as {
    keys: A.NonEmptyReadonlyArray<keyof Model["fields"] & string>;
    keyEnum: { readonly [K in keyof Model["fields"] & string]: K };
    keySchema: S.Literal<A.NonEmptyReadonlyArray<keyof Model["fields"] & string>>;
    KeyType: keyof Model["fields"] & string;
  };
};
