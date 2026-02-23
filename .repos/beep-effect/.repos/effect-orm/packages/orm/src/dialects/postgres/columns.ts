import {StringLiteralKit} from "../../utils/StringLiteralKit.js";
import * as S from "effect/Schema";
// import * as Match from "effect/Match";
import * as Tuple from "effect/Tuple";
import {pipe} from "effect";

export const IntegerColumnTypeLiterals = StringLiteralKit(
  "integer",
  "smallint",
  "bigint",
  "serial",
  "smallserial",
  "bigserial"
);

export const IntegerColumnType = IntegerColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("IntegerColumnType");
    return pipe(
      members,
      Tuple.evolve(
        [
          (type) => S.Struct({
            _tag: S.tag(type.literal),
            type, category
          }),
          (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
          (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
          (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
          (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
          (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
        ]
      )
    );
  }
).pipe(S.toTaggedUnion("_tag"));


export const matchIntegerColumnType = IntegerColumnType.match({
  integer: (col) => col.type,
  smallint: (col) => col.type,
  bigint: (col) => col.type,
  serial: (col) => col.type,
  smallserial: (col) => col.type,
  bigserial: (col) => col.type,
})


export type IntegerColumnTypeLiterals = S.Schema.Type<typeof IntegerColumnTypeLiterals>

export const FloatingPointColumnTypeLiterals = StringLiteralKit(
  "real",
  "double precision",
  "numeric"
);
export type FloatingPointColumnTypeLiterals = S.Schema.Type<typeof FloatingPointColumnTypeLiterals>

export const FloatingPointColumnType = FloatingPointColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("FloatingPointColumnType");
    return pipe(
      members,
      Tuple.evolve(
        [
          (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
          (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
          (type) => S.Struct({
            _tag: S.tag(type.literal), type, category,
            precision: S.optional(S.Number),
            scale: S.optional(S.Number)
          }),
        ]
      )
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const matchFloatingPointColumnType = FloatingPointColumnType.match({
  real: (col) => col.type,
  "double precision": (col) => col.type,
  numeric: (col) => col.type,
})

export const CharacterColumnTypeLiterals = StringLiteralKit(
  "text",
  "varchar",
  "char"
);
export type CharacterColumnTypeLiterals = S.Schema.Type<typeof CharacterColumnTypeLiterals>

export const CharacterColumnType = CharacterColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("CharacterColumnType");
    return pipe(
      members,
      Tuple.evolve(
        [
          (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
          (type) => S.Struct({
            _tag: S.tag(type.literal), type, category,
            length: S.optional(S.Number)
          }),
          (type) => S.Struct({
            _tag: S.tag(type.literal), type, category,
            length: S.optional(S.Number)
          }),
        ]
      )
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const matchCharacterColumnType = CharacterColumnType.match({
  text: (col) => col.type,
  varchar: (col) => col.type,
  char: (col) => col.type,
})

export const BooleanColumnTypeLiterals = StringLiteralKit(
  "boolean"
);
export type BooleanColumnTypeLiterals = S.Schema.Type<typeof BooleanColumnTypeLiterals>

export const BooleanColumnType = BooleanColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("BooleanColumnType");
    return pipe(
      members,
      Tuple.evolve(
        [
          (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
        ]
      )
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const matchBooleanColumnType = BooleanColumnType.match({
  boolean: (col) => col.type,
})

export const DateTimeColumnTypeLiterals = StringLiteralKit(
  "date",
  "time",
  "timestamp",
  "interval"
);
export type DateTimeColumnTypeLiterals = S.Schema.Type<typeof DateTimeColumnTypeLiterals>

export const DateTimeColumnType = DateTimeColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("DateTimeColumnType");
    return pipe(
      members,
      Tuple.evolve(
        [
          (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
          (type) => S.Struct({
            _tag: S.tag(type.literal), type, category,
            precision: S.optional(S.Number)
          }),
          (type) => S.Struct({
            _tag: S.tag(type.literal), type, category,
            precision: S.optional(S.Number),
            withTimezone: S.optional(S.Boolean)
          }),
          (type) => S.Struct({
            _tag: S.tag(type.literal), type, category,
            fields: S.optional(S.String)
          }),
        ]
      )
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const matchDateTimeColumnType = DateTimeColumnType.match({
  date: (col) => col.type,
  time: (col) => col.type,
  timestamp: (col) => col.type,
  interval: (col) => col.type,
})

export const JsonColumnTypeLiterals = StringLiteralKit(
  "json",
  "jsonb"
);
export type JsonColumnTypeLiterals = S.Schema.Type<typeof JsonColumnTypeLiterals>

export const JsonColumnType = JsonColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("JsonColumnType");
    return pipe(
      members,
      Tuple.evolve(
        [
          (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
          (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
        ]
      )
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const matchJsonColumnType = JsonColumnType.match({
  json: (col) => col.type,
  jsonb: (col) => col.type,
})

export const BinaryColumnTypeLiterals = StringLiteralKit(
  "bytea"
);
export type BinaryColumnTypeLiterals = S.Schema.Type<typeof BinaryColumnTypeLiterals>

export const BinaryColumnType = BinaryColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("BinaryColumnType");
    return pipe(
      members,
      Tuple.evolve(
        [
          (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
        ]
      )
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const matchBinaryColumnType = BinaryColumnType.match({
  bytea: (col) => col.type,
})

export const UuidColumnTypeLiterals = StringLiteralKit(
  "uuid"
);
export type UuidColumnTypeLiterals = S.Schema.Type<typeof UuidColumnTypeLiterals>

export const UuidColumnType = UuidColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("UuidColumnType");
    return pipe(
      members,
      Tuple.evolve(
        [
          (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
        ]
      )
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const matchUuidColumnType = UuidColumnType.match({
  uuid: (col) => col.type,
})

export const NetworkColumnTypeLiterals = StringLiteralKit(
  "inet",
  "cidr",
  "macaddr",
  "macaddr8"
);
export type NetworkColumnTypeLiterals = S.Schema.Type<typeof NetworkColumnTypeLiterals>

export const NetworkColumnType = NetworkColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("NetworkColumnType");
    return pipe(
      members,
      Tuple.evolve(
        [
          (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
          (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
          (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
          (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
        ]
      )
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const matchNetworkColumnType = NetworkColumnType.match({
  inet: (col) => col.type,
  cidr: (col) => col.type,
  macaddr: (col) => col.type,
  macaddr8: (col) => col.type,
})

export const GeometricColumnTypeLiterals = StringLiteralKit(
  "point",
  "line",
  "geometry"
);
export type GeometricColumnTypeLiterals = S.Schema.Type<typeof GeometricColumnTypeLiterals>

export const GeometricColumnType = GeometricColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("GeometricColumnType");
    return pipe(
      members,
      Tuple.evolve(
        [
          (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
          (type) => S.Struct({_tag: S.tag(type.literal), type, category}),
          (type) => S.Struct({
            _tag: S.tag(type.literal), type, category,
            srid: S.optional(S.Number),
            geometryType: S.optional(S.String)
          }),
        ]
      )
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const matchGeometricColumnType = GeometricColumnType.match({
  point: (col) => col.type,
  line: (col) => col.type,
  geometry: (col) => col.type,
})

export const VectorColumnTypeLiterals = StringLiteralKit(
  "vector",
  "halfvec",
  "sparsevec",
  "bit"
);
export type VectorColumnTypeLiterals = S.Schema.Type<typeof VectorColumnTypeLiterals>

export const VectorColumnType = VectorColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("VectorColumnType");
    return pipe(
      members,
      Tuple.evolve(
        [
          (type) => S.Struct({
            _tag: S.tag(type.literal), type, category,
            dimensions: S.Number
          }),
          (type) => S.Struct({
            _tag: S.tag(type.literal), type, category,
            dimensions: S.Number
          }),
          (type) => S.Struct({
            _tag: S.tag(type.literal), type, category,
            dimensions: S.Number
          }),
          (type) => S.Struct({
            _tag: S.tag(type.literal), type, category,
            length: S.Number
          }),
        ]
      )
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const matchVectorColumnType = VectorColumnType.match({
  vector: (col) => col.type,
  halfvec: (col) => col.type,
  sparsevec: (col) => col.type,
  bit: (col) => col.type,
})

export const EnumColumnTypeLiterals = StringLiteralKit(
  "enum"
);
export type EnumColumnTypeLiterals = S.Schema.Type<typeof EnumColumnTypeLiterals>

export const EnumColumnType = EnumColumnTypeLiterals.mapMembers(
  (members) => {
    const category = S.tag("EnumColumnType");
    return pipe(
      members,
      Tuple.evolve(
        [
          (type) => S.Struct({
            _tag: S.tag(type.literal), type, category,
            enumName: S.String,
            values: S.Array(S.String)
          }),
        ]
      )
    );
  }
).pipe(S.toTaggedUnion("_tag"));

export const matchEnumColumnType = EnumColumnType.match({
  enum: (col) => col.type,
})

export const ColumnTypeLiteral = StringLiteralKit(
  ...IntegerColumnTypeLiterals.Options,
  ...FloatingPointColumnTypeLiterals.Options,
  ...CharacterColumnTypeLiterals.Options,
  ...BooleanColumnTypeLiterals.Options,
  ...DateTimeColumnTypeLiterals.Options,
  ...JsonColumnTypeLiterals.Options,
  ...BinaryColumnTypeLiterals.Options,
  ...UuidColumnTypeLiterals.Options,
  ...NetworkColumnTypeLiterals.Options,
  ...GeometricColumnTypeLiterals.Options,
  ...VectorColumnTypeLiterals.Options,
  ...EnumColumnTypeLiterals.Options
);
export type ColumnTypeLiteral = S.Schema.Type<typeof ColumnTypeLiteral>


export const ColumnTypeCategory = S.Union(
  [
    IntegerColumnType,
    FloatingPointColumnType,
    CharacterColumnType,
    BooleanColumnType,
    DateTimeColumnType,
    JsonColumnType,
    BinaryColumnType,
    UuidColumnType,
    NetworkColumnType,
    GeometricColumnType,
    VectorColumnType,
    EnumColumnType
  ]
).pipe(S.toTaggedUnion("category"));

export const matchCategory = ColumnTypeCategory.match({
  IntegerColumnType: matchIntegerColumnType,
  FloatingPointColumnType: matchFloatingPointColumnType,
  CharacterColumnType: matchCharacterColumnType,
  BooleanColumnType: matchBooleanColumnType,
  DateTimeColumnType: matchDateTimeColumnType,
  JsonColumnType: matchJsonColumnType,
  BinaryColumnType: matchBinaryColumnType,
  UuidColumnType: matchUuidColumnType,
  NetworkColumnType: matchNetworkColumnType,
  GeometricColumnType: matchGeometricColumnType,
  VectorColumnType: matchVectorColumnType,
  EnumColumnType: matchEnumColumnType,
})

type CaseMember<
  Union extends S.Top,
  Tag extends string
> = Extract<S.Schema.Type<Union>, { readonly _tag: Tag }>

export type BigintDriverType<M extends "bigint" | "number"> = M extends "number" ? number : bigint
export type NumericDriverType<M extends "string" | "number"> = M extends "number" ? number : string
export type DateDriverType<M extends "date" | "string"> = M extends "string" ? string : Date
export type TimestampDriverType<M extends "date" | "string"> = M extends "string" ? string : Date
export type JsonDriverType<M extends "json" | "text"> = M extends "text" ? string : unknown
export type EnumDriverType<V extends readonly string[]> = V[number]

export const Column = {
  integer: (): CaseMember<typeof IntegerColumnType, "integer"> =>
    ({ _tag: "integer", type: "integer", category: "IntegerColumnType" }),

  smallint: (): CaseMember<typeof IntegerColumnType, "smallint"> =>
    ({ _tag: "smallint", type: "smallint", category: "IntegerColumnType" }),

  bigint: <M extends "bigint" | "number" = "bigint">(
    props?: { readonly mode?: M }
  ): CaseMember<typeof IntegerColumnType, "bigint"> & { readonly mode: M } =>
    ({ _tag: "bigint", type: "bigint", category: "IntegerColumnType", mode: (props?.mode ?? "bigint") as M }),

  serial: (): CaseMember<typeof IntegerColumnType, "serial"> =>
    ({ _tag: "serial", type: "serial", category: "IntegerColumnType" }),

  smallserial: (): CaseMember<typeof IntegerColumnType, "smallserial"> =>
    ({ _tag: "smallserial", type: "smallserial", category: "IntegerColumnType" }),

  bigserial: <M extends "bigint" | "number" = "bigint">(
    props?: { readonly mode?: M }
  ): CaseMember<typeof IntegerColumnType, "bigserial"> & { readonly mode: M } =>
    ({ _tag: "bigserial", type: "bigserial", category: "IntegerColumnType", mode: (props?.mode ?? "bigint") as M }),

  real: (): CaseMember<typeof FloatingPointColumnType, "real"> =>
    ({ _tag: "real", type: "real", category: "FloatingPointColumnType" }),

  doublePrecision: (): CaseMember<typeof FloatingPointColumnType, "double precision"> =>
    ({ _tag: "double precision", type: "double precision", category: "FloatingPointColumnType" }),

  numeric: <M extends "string" | "number" = "string">(props?: {
    readonly precision?: number
    readonly scale?: number
    readonly mode?: M
  }): CaseMember<typeof FloatingPointColumnType, "numeric"> & { readonly mode: M } => {
    const { mode: _mode, ...rest } = props ?? {}
    return { _tag: "numeric", type: "numeric", category: "FloatingPointColumnType", ...rest, mode: (_mode ?? "string") as M }
  },

  text: (): CaseMember<typeof CharacterColumnType, "text"> =>
    ({ _tag: "text", type: "text", category: "CharacterColumnType" }),

  varchar: (props?: {
    readonly length?: number
  }): CaseMember<typeof CharacterColumnType, "varchar"> =>
    ({ _tag: "varchar", type: "varchar", category: "CharacterColumnType", ...props }),

  char: (props?: {
    readonly length?: number
  }): CaseMember<typeof CharacterColumnType, "char"> =>
    ({ _tag: "char", type: "char", category: "CharacterColumnType", ...props }),

  boolean: (): CaseMember<typeof BooleanColumnType, "boolean"> =>
    ({ _tag: "boolean", type: "boolean", category: "BooleanColumnType" }),

  date: <M extends "date" | "string" = "date">(
    props?: { readonly mode?: M }
  ): CaseMember<typeof DateTimeColumnType, "date"> & { readonly mode: M } =>
    ({ _tag: "date", type: "date", category: "DateTimeColumnType", mode: (props?.mode ?? "date") as M }),

  time: (props?: {
    readonly precision?: number
  }): CaseMember<typeof DateTimeColumnType, "time"> =>
    ({ _tag: "time", type: "time", category: "DateTimeColumnType", ...props }),

  timestamp: <M extends "date" | "string" = "date">(props?: {
    readonly precision?: number
    readonly withTimezone?: boolean
    readonly mode?: M
  }): CaseMember<typeof DateTimeColumnType, "timestamp"> & { readonly mode: M } => {
    const { mode: _mode, ...rest } = props ?? {}
    return { _tag: "timestamp", type: "timestamp", category: "DateTimeColumnType", ...rest, mode: (_mode ?? "date") as M }
  },

  interval: (props?: {
    readonly fields?: string
  }): CaseMember<typeof DateTimeColumnType, "interval"> =>
    ({ _tag: "interval", type: "interval", category: "DateTimeColumnType", ...props }),

  json: <M extends "json" | "text" = "json">(
    props?: { readonly mode?: M }
  ): CaseMember<typeof JsonColumnType, "json"> & { readonly mode: M } =>
    ({ _tag: "json", type: "json", category: "JsonColumnType", mode: (props?.mode ?? "json") as M }),

  jsonb: <M extends "json" | "text" = "json">(
    props?: { readonly mode?: M }
  ): CaseMember<typeof JsonColumnType, "jsonb"> & { readonly mode: M } =>
    ({ _tag: "jsonb", type: "jsonb", category: "JsonColumnType", mode: (props?.mode ?? "json") as M }),

  bytea: (): CaseMember<typeof BinaryColumnType, "bytea"> =>
    ({ _tag: "bytea", type: "bytea", category: "BinaryColumnType" }),

  uuid: (): CaseMember<typeof UuidColumnType, "uuid"> =>
    ({ _tag: "uuid", type: "uuid", category: "UuidColumnType" }),

  inet: (): CaseMember<typeof NetworkColumnType, "inet"> =>
    ({ _tag: "inet", type: "inet", category: "NetworkColumnType" }),

  cidr: (): CaseMember<typeof NetworkColumnType, "cidr"> =>
    ({ _tag: "cidr", type: "cidr", category: "NetworkColumnType" }),

  macaddr: (): CaseMember<typeof NetworkColumnType, "macaddr"> =>
    ({ _tag: "macaddr", type: "macaddr", category: "NetworkColumnType" }),

  macaddr8: (): CaseMember<typeof NetworkColumnType, "macaddr8"> =>
    ({ _tag: "macaddr8", type: "macaddr8", category: "NetworkColumnType" }),

  point: (): CaseMember<typeof GeometricColumnType, "point"> =>
    ({ _tag: "point", type: "point", category: "GeometricColumnType" }),

  line: (): CaseMember<typeof GeometricColumnType, "line"> =>
    ({ _tag: "line", type: "line", category: "GeometricColumnType" }),

  geometry: (props?: {
    readonly srid?: number
    readonly geometryType?: string
  }): CaseMember<typeof GeometricColumnType, "geometry"> =>
    ({ _tag: "geometry", type: "geometry", category: "GeometricColumnType", ...props }),

  vector: (props: {
    readonly dimensions: number
  }): CaseMember<typeof VectorColumnType, "vector"> =>
    ({ _tag: "vector", type: "vector", category: "VectorColumnType", ...props }),

  halfvec: (props: {
    readonly dimensions: number
  }): CaseMember<typeof VectorColumnType, "halfvec"> =>
    ({ _tag: "halfvec", type: "halfvec", category: "VectorColumnType", ...props }),

  sparsevec: (props: {
    readonly dimensions: number
  }): CaseMember<typeof VectorColumnType, "sparsevec"> =>
    ({ _tag: "sparsevec", type: "sparsevec", category: "VectorColumnType", ...props }),

  bit: (props: {
    readonly length: number
  }): CaseMember<typeof VectorColumnType, "bit"> =>
    ({ _tag: "bit", type: "bit", category: "VectorColumnType", ...props }),

  enum: <const V extends readonly [string, ...string[]]>(props: {
    readonly enumName: string
    readonly values: V
  }): CaseMember<typeof EnumColumnType, "enum"> & { readonly values: V } =>
    ({ _tag: "enum", type: "enum", category: "EnumColumnType", ...props }),
} as const
