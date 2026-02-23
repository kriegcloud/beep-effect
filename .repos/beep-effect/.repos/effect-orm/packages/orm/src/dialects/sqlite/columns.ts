import {StringLiteralKit} from "../../utils/StringLiteralKit.js";
import * as S from "effect/Schema";
import * as Tuple from "effect/Tuple";
import {pipe} from "effect";

export const IntegerColumnTypeLiterals = StringLiteralKit(
  "integer"
);
export type IntegerColumnTypeLiterals = S.Schema.Type<typeof IntegerColumnTypeLiterals>

export const IntegerColumnType = IntegerColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("IntegerColumnType");
    return pipe(
      members,
      Tuple.evolve([
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
      ])
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const matchIntegerColumnType = IntegerColumnType.match({
  integer: (col) => col.type,
});

export const FloatingPointColumnTypeLiterals = StringLiteralKit(
  "real",
  "numeric"
);
export type FloatingPointColumnTypeLiterals = S.Schema.Type<typeof FloatingPointColumnTypeLiterals>

export const FloatingPointColumnType = FloatingPointColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("FloatingPointColumnType");
    return pipe(
      members,
      Tuple.evolve([
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
        (type) => S.Struct({
          _tag: S.tag(type.literal),
          type,
          category,
          precision: S.optional(S.Number),
          scale: S.optional(S.Number),
        }),
      ])
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const matchFloatingPointColumnType = FloatingPointColumnType.match({
  real: (col) => col.type,
  numeric: (col) => col.type,
});

export const TextColumnTypeLiterals = StringLiteralKit(
  "text"
);
export type TextColumnTypeLiterals = S.Schema.Type<typeof TextColumnTypeLiterals>

export const TextColumnType = TextColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("TextColumnType");
    return pipe(
      members,
      Tuple.evolve([
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
      ])
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const matchTextColumnType = TextColumnType.match({
  text: (col) => col.type,
});

export const BlobColumnTypeLiterals = StringLiteralKit(
  "blob"
);
export type BlobColumnTypeLiterals = S.Schema.Type<typeof BlobColumnTypeLiterals>

export const BlobColumnType = BlobColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("BlobColumnType");
    return pipe(
      members,
      Tuple.evolve([
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
      ])
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const matchBlobColumnType = BlobColumnType.match({
  blob: (col) => col.type,
});

export const ColumnTypeLiteral = StringLiteralKit(
  ...IntegerColumnTypeLiterals.Options,
  ...FloatingPointColumnTypeLiterals.Options,
  ...TextColumnTypeLiterals.Options,
  ...BlobColumnTypeLiterals.Options
);
export type ColumnTypeLiteral = S.Schema.Type<typeof ColumnTypeLiteral>

export const ColumnType = S.Union(
  [IntegerColumnType, FloatingPointColumnType, TextColumnType, BlobColumnType] as const
).pipe(S.toTaggedUnion("category"));

export const matchCategory = ColumnType.match({
  IntegerColumnType: matchIntegerColumnType,
  FloatingPointColumnType: matchFloatingPointColumnType,
  TextColumnType: matchTextColumnType,
  BlobColumnType: matchBlobColumnType,
});
