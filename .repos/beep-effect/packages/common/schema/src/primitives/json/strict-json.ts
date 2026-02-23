import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SchemaId.create("primitives/json/strict-json");

type StrictJsonPrimitive = string | number | boolean | null;
type StrictJsonObject = { readonly [key: string]: StrictJsonValue };
type StrictJsonArray = readonly StrictJsonValue[];
type StrictJsonValue = StrictJsonPrimitive | StrictJsonObject | StrictJsonArray;

// For cases where you need full JSON validation, use this explicit version
export const StrictJsonValue = S.suspend(
  (): S.Schema<StrictJsonValue> =>
    S.Union(
      S.String,
      S.Number,
      S.Boolean,
      S.Null,
      S.Record({ key: S.String, value: StrictJsonValue }),
      S.Array(StrictJsonValue)
    )
).annotations(
  $I.annotations("StrictJsonValue", {
    description: "Recursive Strict JSON value schema.",
  })
);
