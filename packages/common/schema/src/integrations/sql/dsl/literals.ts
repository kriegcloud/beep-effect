import { $SchemaId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { thunk } from "@beep/utils/thunk";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Struct from "effect/Struct";

const $I = $SchemaId.create("integrations/sql/dsl/literals");

export class ModelVariant extends BS.StringLiteralKit(
  "select",
  "insert",
  "update",
  "json",
  "jsonCreate",
  "jsonUpdate"
).annotations(
  $I.annotations("ModelVariant", {
    description: "One of the possible variants of a domain model schema.",
  })
) {}

export declare namespace ModelVariant {
  export type Type = typeof ModelVariant.Type;
}

export class ColumnType extends BS.StringLiteralKit(
  "string",
  "number",
  "integer",
  "boolean",
  "datetime",
  "uuid",
  "json",
  "bigint"
).annotations(
  $I.annotations("ColumnType", {
    description: "One of the possible column types in a domain model schema.",
  })
) {
  static readonly thunks = F.pipe(
    this.Enum,
    Struct.entries,
    A.reduce({} as { readonly [K in ColumnType.Type]: F.LazyArg<ColumnType.Type> }, (acc, [key, value]) => ({
      ...acc,
      [key]: thunk(value),
    }))
  );

  static readonly parameterize = F.pipe(
    this.Options,
    A.reduce(
      {} as {
        readonly [K in ColumnType.Type]: { readonly type: K };
      },
      (acc, opt) =>
        ({
          ...acc,
          [opt]: { type: opt },
        }) as const
    )
  );
}

export declare namespace ColumnType {
  export type Type = typeof ColumnType.Type;
}
