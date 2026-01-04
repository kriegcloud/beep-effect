import { $BslId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $BslId.create("models/json");

export class JsonPrimitive extends S.Union(S.String, S.Number, S.Boolean, S.Null).annotations(
  $I.annotations("JsonPrimitive", {
    description: "Union of JSON primitive types.",
  })
) {}

export declare namespace JsonPrimitive {
  export type Type = string | number | boolean | null;
}

export class JsonObject extends S.suspend(
  (): S.Schema<JsonObject.Type> => S.Record({ key: S.String, value: JsonValue })
).annotations(
  $I.annotations("JsonObject", {
    description: "Record of JSON key-value pairs.",
  })
) {}

export declare namespace JsonObject {
  export type Type = { readonly [key: string]: JsonValue.Type };
}

export class JsonArray extends S.suspend((): S.Schema<JsonArray.Type> => S.Array(JsonValue)).annotations(
  $I.annotations("JsonArray", {
    description: "Array of JSON values.",
  })
) {}

export declare namespace JsonArray {
  export type Type = readonly JsonValue.Type[];
}

export class JsonValue extends S.suspend(
  (): S.Schema<JsonValue.Type> => S.Union(JsonPrimitive, JsonObject, S.Array(JsonValue))
).annotations(
  $I.annotations("JsonValue", {
    description: "Union of JSON value types.",
  })
) {}

export declare namespace JsonValue {
  export type Type = JsonPrimitive.Type | JsonObject.Type | JsonArray.Type;
}

const JsonArrayUnknown = S.Array(S.Unknown);

export class JsonColumnAccepts extends S.Union(S.Object, JsonArrayUnknown, S.mutable(JsonArrayUnknown)).annotations(
  $I.annotations("JsonColumnAccepts", {
    description: "Union of JSON value types that can be accepted by a JSON column.",
  })
) {}

export declare namespace JsonColumnAccepts {
  export type Type = typeof JsonColumnAccepts.Type;
}
