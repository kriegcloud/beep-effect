import {StringLiteralKit} from "../../utils/StringLiteralKit.js";
import * as S from "effect/Schema";
import * as Tuple from "effect/Tuple";
import {pipe} from "effect";

export const IntegerColumnTypeLiterals = StringLiteralKit(
  "bigint",
  "int",
  "smallint",
  "tinyint"
);
export type IntegerColumnTypeLiterals = S.Schema.Type<typeof IntegerColumnTypeLiterals>

export const IntegerColumnType = IntegerColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("IntegerColumnType");
    return pipe(
      members,
      Tuple.evolve([
        (type) => S.Struct({_tag: S.tag(type.literal), type, category, identity: S.optional(S.Boolean)}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category, identity: S.optional(S.Boolean)}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category, identity: S.optional(S.Boolean)}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category, identity: S.optional(S.Boolean)}),
      ])
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const FloatingPointColumnTypeLiterals = StringLiteralKit(
  "float",
  "real",
  "decimal",
  "numeric"
);
export type FloatingPointColumnTypeLiterals = S.Schema.Type<typeof FloatingPointColumnTypeLiterals>

export const FloatingPointColumnType = FloatingPointColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("FloatingPointColumnType");
    return pipe(
      members,
      Tuple.evolve([
        (type) => S.Struct({_tag: S.tag(type.literal), type, category, precision: S.optional(S.Number)}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category, precision: S.optional(S.Number), scale: S.optional(S.Number)}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category, precision: S.optional(S.Number), scale: S.optional(S.Number)}),
      ])
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const CharacterColumnTypeLiterals = StringLiteralKit(
  "char",
  "varchar",
  "text",
  "nchar",
  "nvarchar",
  "ntext"
);
export type CharacterColumnTypeLiterals = S.Schema.Type<typeof CharacterColumnTypeLiterals>

export const CharacterColumnType = CharacterColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("CharacterColumnType");
    return pipe(
      members,
      Tuple.evolve([
        (type) => S.Struct({_tag: S.tag(type.literal), type, category, length: S.optional(S.Number)}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category, length: S.optional(S.Number)}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category, length: S.optional(S.Number)}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category, length: S.optional(S.Number)}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
      ])
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const BinaryColumnTypeLiterals = StringLiteralKit(
  "binary",
  "varbinary"
);
export type BinaryColumnTypeLiterals = S.Schema.Type<typeof BinaryColumnTypeLiterals>

export const BinaryColumnType = BinaryColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("BinaryColumnType");
    return pipe(
      members,
      Tuple.evolve([
        (type) => S.Struct({_tag: S.tag(type.literal), type, category, length: S.optional(S.Number)}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category, length: S.optional(S.Number)}),
      ])
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const BooleanColumnTypeLiterals = StringLiteralKit(
  "bit"
);
export type BooleanColumnTypeLiterals = S.Schema.Type<typeof BooleanColumnTypeLiterals>

export const BooleanColumnType = BooleanColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("BooleanColumnType");
    return pipe(
      members,
      Tuple.evolve([
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
      ])
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const DateTimeColumnTypeLiterals = StringLiteralKit(
  "date",
  "datetime",
  "datetime2",
  "datetimeoffset",
  "time"
);
export type DateTimeColumnTypeLiterals = S.Schema.Type<typeof DateTimeColumnTypeLiterals>

export const DateTimeColumnType = DateTimeColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("DateTimeColumnType");
    return pipe(
      members,
      Tuple.evolve([
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category, precision: S.optional(S.Number)}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category, precision: S.optional(S.Number)}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category, precision: S.optional(S.Number)}),
      ])
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const ColumnTypeLiteral = StringLiteralKit(
  ...IntegerColumnTypeLiterals.Options,
  ...FloatingPointColumnTypeLiterals.Options,
  ...CharacterColumnTypeLiterals.Options,
  ...BinaryColumnTypeLiterals.Options,
  ...BooleanColumnTypeLiterals.Options,
  ...DateTimeColumnTypeLiterals.Options
);
export type ColumnTypeLiteral = S.Schema.Type<typeof ColumnTypeLiteral>

export const ColumnType = S.Union(
  [
    ...IntegerColumnType.members,
    ...FloatingPointColumnType.members,
    ...CharacterColumnType.members,
    ...BinaryColumnType.members,
    ...BooleanColumnType.members,
    ...DateTimeColumnType.members
  ] as const
).pipe(S.toTaggedUnion("category"));

export const matchCategory = ColumnType.match({
  IntegerColumnType: (col) => col.type,
  FloatingPointColumnType: (col) => col.type,
  CharacterColumnType: (col) => col.type,
  BinaryColumnType: (col) => col.type,
  BooleanColumnType: (col) => col.type,
  DateTimeColumnType: (col) => col.type,
});
