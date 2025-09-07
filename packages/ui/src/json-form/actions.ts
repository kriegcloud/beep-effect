import { BS } from "@beep/schema";
import type { UnsafeTypes } from "@beep/types";
import { UISchemaElement } from "@beep/ui/json-form/ui-schema";
import _AJV, { type AnySchemaObject } from "ajv";
import * as Data from "effect/Data";
import * as S from "effect/Schema";

export class AJV extends S.declare((input: unknown): input is _AJV => input instanceof _AJV) {}

export namespace AJV {
  export type Type = S.Schema.Type<typeof AJV>;
  export type Encoded = S.Schema.Encoded<typeof AJV>;
}

export class ErrorObjectClass<
  const K extends string = string,
  const P = Record<string, UnsafeTypes.UnsafeAny>,
  const S = unknown,
> extends Data.TaggedError("ErrorObjectClass")<{
  readonly keyword: K;
  readonly instancePath: string;
  readonly schemaPath: string;
  readonly params: P;
  // Added to validation errors of "propertyNames" keyword schema
  readonly propertyName?: string | undefined;
  // Excluded if option `messages` set to false.
  readonly message?: undefined | string;
  readonly schema?: undefined | S;
  readonly parentSchema?: undefined | AnySchemaObject;
  readonly data?: undefined | unknown;
}> {}

export class ErrorObject extends S.declare((i: unknown): i is ErrorObjectClass => i instanceof ErrorObjectClass) {}

export namespace ErrorObject {
  export type Type = S.Schema.Type<typeof ErrorObject>;
  export type Encoded = S.Schema.Encoded<typeof ErrorObject>;
}

export const actionKit = BS.stringLiteralKit(
  "INIT",
  "UPDATE_CORE",
  "SET_AJV",
  "UPDATE_DATA",
  "UPDATE_ERRORS",
  "VALIDATE",
  "ADD_RENDERER",
  "REMOVE_RENDERER",
  "ADD_CELL",
  "REMOVE_CELL",
  "SET_CONFIG",
  "ADD_UI_SCHEMA",
  "REMOVE_UI_SCHEMA",
  "SET_SCHEMA",
  "SET_UI_SCHEMA",
  "SET_VALIDATION_MODE",
  "SET_LOCALE",
  "SET_TRANSLATOR",
  "UPDATE_I18N",
  "ADD_DEFAULT_DATA",
  "REMOVE_DEFAULT_DATA"
);

export class UpdateAction extends BS.Class<UpdateAction>("UpdateAction")({
  type: BS.LiteralWithDefault("UPDATE"),
  path: BS.JsonPath,
  context: S.Object,
  updater: BS.Fn.make({
    input: S.Any,
    output: S.Any,
  }).Schema,
}) {}

export class UpdateErrorsAction extends BS.Class<UpdateErrorsAction>("UpdateErrorsAction")({
  type: BS.LiteralWithDefault("UPDATE_ERRORS"),
  errors: S.Array(ErrorObject),
}) {}

export class InitAction extends BS.Class<InitAction>("InitAction")({
  type: BS.LiteralWithDefault("INIT"),
  data: S.Any,
  schema: BS.JsonSchema,
  uiSchema: UISchemaElement,
  // options: S.optional(S.)
}) {}

export class UpdateArrayAdd extends BS.Class<UpdateArrayAdd>("UpdateArrayAdd")(
  {
    type: BS.LiteralWithDefault("ADD"),
    values: S.Array(S.Any),
  },
  {
    schemaId: Symbol.for("@beep/ui/form/actions/UpdateArrayAdd"),
    title: "Update Array Add",
    description: "Update an array by adding values to it",
  }
) {}

export class UpdateArrayRemove extends BS.Class<UpdateArrayRemove>("UpdateArrayRemove")(
  {
    type: BS.LiteralWithDefault("REMOVE"),
    indices: S.Array(S.NonNegativeInt),
  },
  {
    schemaId: Symbol.for("@beep/ui/form/actions/UpdateArrayRemove"),
    title: "Update Array Remove",
    description: "Update an array by removing values from it",
  }
) {}

export class UpdateArrayMove extends BS.Class<UpdateArrayMove>("UpdateArrayMove")(
  {
    type: BS.LiteralWithDefault("MOVE"),
    moves: S.Array(
      S.Struct({
        from: S.NonNegativeInt,
        to: S.NonNegativeInt,
      })
    ),
  },
  {
    schemaId: Symbol.for("@beep/ui/form/actions/UpdateArrayMove"),
    title: "Update Array Move",
    description: "Update an array by moving values to different positions",
  }
) {}

export class UpdateArrayContext extends S.Union(UpdateArrayAdd, UpdateArrayRemove, UpdateArrayMove).annotations({
  schemaId: Symbol.for("@beep/ui/form/actions/UpdateArrayContext"),
  title: "Update Array Context",
  description: "Update an array by adding, removing or moving values",
}) {
  static readonly is = S.is(UpdateArrayContext);
}
