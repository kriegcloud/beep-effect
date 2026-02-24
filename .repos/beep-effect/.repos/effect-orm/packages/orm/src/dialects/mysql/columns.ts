import {StringLiteralKit} from "../../utils/StringLiteralKit.js";
import * as S from "effect/Schema";
import * as Tuple from "effect/Tuple";
import {pipe} from "effect/Function";

export const IntegerColumnTypeLiterals = StringLiteralKit(
  "int",
  "tinyint",
  "smallint",
  "mediumint",
  "bigint",
  "serial"
);
export type IntegerColumnTypeLiterals = S.Schema.Type<typeof IntegerColumnTypeLiterals>

export const IntegerColumnType = IntegerColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("IntegerColumnType");
    return pipe(
      members,
      Tuple.evolve([
        (type) => S.Struct({
          _tag: S.tag(type.literal), type, category,
          unsigned: S.optional(S.Boolean),
          autoIncrement: S.optional(S.Boolean)
        }),
        (type) => S.Struct({
          _tag: S.tag(type.literal), type, category,
          unsigned: S.optional(S.Boolean),
          autoIncrement: S.optional(S.Boolean)
        }),
        (type) => S.Struct({
          _tag: S.tag(type.literal), type, category,
          unsigned: S.optional(S.Boolean),
          autoIncrement: S.optional(S.Boolean)
        }),
        (type) => S.Struct({
          _tag: S.tag(type.literal), type, category,
          unsigned: S.optional(S.Boolean),
          autoIncrement: S.optional(S.Boolean)
        }),
        (type) => S.Struct({
          _tag: S.tag(type.literal), type, category,
          unsigned: S.optional(S.Boolean),
          autoIncrement: S.optional(S.Boolean)
        }),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
      ])
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const FloatingPointColumnTypeLiterals = StringLiteralKit(
  "float",
  "double",
  "decimal",
  "real"
);
export type FloatingPointColumnTypeLiterals = S.Schema.Type<typeof FloatingPointColumnTypeLiterals>

export const FloatingPointColumnType = FloatingPointColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("FloatingPointColumnType");
    return pipe(
      members,
      Tuple.evolve([
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
        (type) => S.Struct({
          _tag: S.tag(type.literal), type, category,
          precision: S.optional(S.Number),
          scale: S.optional(S.Number)
        }),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
      ])
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const CharacterColumnTypeLiterals = StringLiteralKit(
  "char",
  "varchar",
  "text",
  "tinytext",
  "mediumtext",
  "longtext"
);
export type CharacterColumnTypeLiterals = S.Schema.Type<typeof CharacterColumnTypeLiterals>

export const CharacterColumnType = CharacterColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("CharacterColumnType");
    return pipe(
      members,
      Tuple.evolve([
        (type) => S.Struct({
          _tag: S.tag(type.literal), type, category,
          length: S.optional(S.Number)
        }),
        (type) => S.Struct({
          _tag: S.tag(type.literal), type, category,
          length: S.optional(S.Number)
        }),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
      ])
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const BinaryColumnTypeLiterals = StringLiteralKit(
  "binary",
  "varbinary",
  "blob",
  "tinyblob",
  "mediumblob",
  "longblob"
);
export type BinaryColumnTypeLiterals = S.Schema.Type<typeof BinaryColumnTypeLiterals>

export const BinaryColumnType = BinaryColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("BinaryColumnType");
    return pipe(
      members,
      Tuple.evolve([
        (type) => S.Struct({
          _tag: S.tag(type.literal), type, category,
          length: S.optional(S.Number)
        }),
        (type) => S.Struct({
          _tag: S.tag(type.literal), type, category,
          length: S.optional(S.Number)
        }),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
      ])
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const BooleanColumnTypeLiterals = StringLiteralKit(
  "boolean"
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
  "timestamp",
  "time",
  "year"
);
export type DateTimeColumnTypeLiterals = S.Schema.Type<typeof DateTimeColumnTypeLiterals>

export const DateTimeColumnType = DateTimeColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("DateTimeColumnType");
    return pipe(
      members,
      Tuple.evolve([
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
        (type) => S.Struct({
          _tag: S.tag(type.literal), type, category,
          precision: S.optional(S.Number)
        }),
        (type) => S.Struct({
          _tag: S.tag(type.literal), type, category,
          precision: S.optional(S.Number)
        }),
        (type) => S.Struct({
          _tag: S.tag(type.literal), type, category,
          precision: S.optional(S.Number)
        }),
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
      ])
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const JsonColumnTypeLiterals = StringLiteralKit(
  "json"
);
export type JsonColumnTypeLiterals = S.Schema.Type<typeof JsonColumnTypeLiterals>

export const JsonColumnType = JsonColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("JsonColumnType");
    return pipe(
      members,
      Tuple.evolve([
        (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
      ])
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const EnumColumnTypeLiterals = StringLiteralKit(
  "enum"
);
export type EnumColumnTypeLiterals = S.Schema.Type<typeof EnumColumnTypeLiterals>

export const EnumColumnType = EnumColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("EnumColumnType");
    return pipe(
      members,
      Tuple.evolve([
        (type) => S.Struct({
          _tag: S.tag(type.literal), type, category,
          enumName: S.String,
          values: S.Array(S.String)
        }),
      ])
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const matchIntegerColumnType = IntegerColumnType.match({
  int: (col) => col.type,
  tinyint: (col) => col.type,
  smallint: (col) => col.type,
  mediumint: (col) => col.type,
  bigint: (col) => col.type,
  serial: (col) => col.type,
})

export const matchFloatingPointColumnType = FloatingPointColumnType.match({
  float: (col) => col.type,
  double: (col) => col.type,
  decimal: (col) => col.type,
  real: (col) => col.type,
})

export const matchCharacterColumnType = CharacterColumnType.match({
  char: (col) => col.type,
  varchar: (col) => col.type,
  text: (col) => col.type,
  tinytext: (col) => col.type,
  mediumtext: (col) => col.type,
  longtext: (col) => col.type,
})

export const matchBinaryColumnType = BinaryColumnType.match({
  binary: (col) => col.type,
  varbinary: (col) => col.type,
  blob: (col) => col.type,
  tinyblob: (col) => col.type,
  mediumblob: (col) => col.type,
  longblob: (col) => col.type,
})

export const matchBooleanColumnType = BooleanColumnType.match({
  boolean: (col) => col.type,
})

export const matchDateTimeColumnType = DateTimeColumnType.match({
  date: (col) => col.type,
  datetime: (col) => col.type,
  timestamp: (col) => col.type,
  time: (col) => col.type,
  year: (col) => col.type,
})

export const matchJsonColumnType = JsonColumnType.match({
  json: (col) => col.type,
})

export const matchEnumColumnType = EnumColumnType.match({
  enum: (col) => col.type,
})

export const ColumnTypeLiteral = StringLiteralKit(
  ...IntegerColumnTypeLiterals.Options,
  ...FloatingPointColumnTypeLiterals.Options,
  ...CharacterColumnTypeLiterals.Options,
  ...BinaryColumnTypeLiterals.Options,
  ...BooleanColumnTypeLiterals.Options,
  ...DateTimeColumnTypeLiterals.Options,
  ...JsonColumnTypeLiterals.Options,
  ...EnumColumnTypeLiterals.Options
);
export type ColumnTypeLiteral = S.Schema.Type<typeof ColumnTypeLiteral>

export const ColumnType = S.Union([
  IntegerColumnType,
  FloatingPointColumnType,
  CharacterColumnType,
  BinaryColumnType,
  BooleanColumnType,
  DateTimeColumnType,
  JsonColumnType,
  EnumColumnType
]).pipe(S.toTaggedUnion("category"));

export const matchCategory = ColumnType.match({
  IntegerColumnType: matchIntegerColumnType,
  FloatingPointColumnType: matchFloatingPointColumnType,
  CharacterColumnType: matchCharacterColumnType,
  BinaryColumnType: matchBinaryColumnType,
  BooleanColumnType: matchBooleanColumnType,
  DateTimeColumnType: matchDateTimeColumnType,
  JsonColumnType: matchJsonColumnType,
  EnumColumnType: matchEnumColumnType,
})
