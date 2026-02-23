import type { StringTypes } from "@beep/types";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Tuple from "effect/Tuple";
import type * as Types from "effect/Types";

const StructToTupleTypeId: typeof S.TypeId = S.TypeId;
export { StructToTupleTypeId };

type StructHelper<
  A extends ReadonlyArray<StringTypes.NonEmptyString>,
  B extends ReadonlyArray<S.Schema.Any>,
> = A extends readonly [
  infer AHead extends StringTypes.NonEmptyString,
  ...infer ATail extends ReadonlyArray<StringTypes.NonEmptyString>,
]
  ? B extends readonly [infer BHead extends S.Schema.All, ...infer BTail extends ReadonlyArray<S.Schema.Any>]
    ? { [K in AHead]: BHead } & StructHelper<ATail, BTail>
    : {}
  : {};

type Struct<
  Keys extends ReadonlyArray<StringTypes.NonEmptyString>,
  Fields extends ReadonlyArray<S.Schema.Any>,
> = StructHelper<Keys, Fields>;

type EncodedFields<Fields extends ReadonlyArray<S.Schema.Any>> = Fields extends readonly [
  infer Head extends S.Schema.Any,
  ...infer Tail extends ReadonlyArray<S.Schema.Any>,
]
  ? [S.SchemaClass<S.Schema.Encoded<Head>>, ...EncodedFields<Tail>]
  : [];

type StructToTupleSchema<
  Keys extends ReadonlyArray<StringTypes.NonEmptyString>,
  Fields extends Types.TupleOf<Keys["length"], S.Schema.Any>,
> = S.transform<S.Struct<Struct<Keys, Fields>>, S.Tuple<EncodedFields<Fields>>> & {
  readonly keys: Keys;
  readonly fields: Fields;
};

const makeStructToTupleClass = <
  const Keys extends ReadonlyArray<StringTypes.NonEmptyString>,
  const Fields extends Types.TupleOf<Keys["length"], S.Schema.Any>,
>(
  keys: Keys,
  fields: Fields
) => {
  const TupleSchema = S.Tuple<EncodedFields<Fields>>(
    ...(pipe(fields, A.map(S.encodedSchema)) as EncodedFields<Fields>)
  );
  const StructSchema = S.Struct(R.fromEntries(A.zip(keys, fields)) as Struct<Keys, Fields>);

  return class extends S.transform(StructSchema, TupleSchema, {
    strict: true,
    decode: (struct) =>
      pipe(
        keys,
        Tuple.map((key) => struct[key as keyof S.Struct.Type<Struct<Keys, Fields>>])
      ) as S.Schema.Encoded<typeof TupleSchema>,
    encode: (tuple) => pipe(A.zip(keys, tuple), Object.fromEntries),
  }) {
    static keys = keys;
    static fields = fields;
  } as StructToTupleSchema<Keys, Fields>;
};

const StructToTupleSchema = <
  const Keys extends ReadonlyArray<StringTypes.NonEmptyString>,
  const Fields extends Types.TupleOf<Keys["length"], S.Schema.Any>,
>(
  keys: Keys,
  fields: Fields
): StructToTupleSchema<Keys, Fields> => makeStructToTupleClass(keys, fields);

type StructValue<Keys extends ReadonlyArray<StringTypes.NonEmptyString>, Value extends S.Schema.Any> = {
  [K in Keys[number]]: Value;
};

type EncodedValues<Keys extends ReadonlyArray<StringTypes.NonEmptyString>, Value extends S.Schema.Any> = Types.TupleOf<
  Keys["length"],
  S.SchemaClass<S.Schema.Encoded<Value>>
>;

type StructToTupleValueSchema<
  Keys extends ReadonlyArray<StringTypes.NonEmptyString>,
  Value extends S.Schema.Any,
> = S.transform<S.Struct<StructValue<Keys, Value>>, S.Tuple<EncodedValues<Keys, Value>>> & {
  readonly keys: Keys;
  readonly value: Value;
};

const makeStructToTupleValueClass = <
  Keys extends ReadonlyArray<StringTypes.NonEmptyString>,
  Value extends S.Schema.Any,
>(
  keys: Keys,
  value: Value
) => {
  const TupleSchema = S.Tuple<EncodedValues<Keys, Value>>(
    ...(A.makeBy(keys.length, () => S.encodedSchema(value)) as EncodedValues<Keys, Value>)
  );
  const StructSchema = S.Struct(
    R.fromEntries(
      pipe(
        keys,
        A.map((key) => [key, value])
      )
    ) as StructValue<Keys, Value>
  );

  return class extends S.transform(StructSchema, TupleSchema, {
    strict: true,
    decode: (struct) =>
      pipe(
        keys,
        Tuple.map((key) => struct[key as keyof S.Struct.Type<StructValue<Keys, Value>>])
      ) as S.Schema.Encoded<typeof TupleSchema>,
    encode: (tuple) => pipe(A.zip(keys, tuple), Object.fromEntries),
  }) {
    static keys = keys;
    static value = value;
  } as StructToTupleValueSchema<Keys, Value>;
};

const StructToTupleValueSchema = <
  const Keys extends ReadonlyArray<StringTypes.NonEmptyString>,
  const Value extends S.Schema.Any,
>(
  keys: Keys,
  value: Value
): StructToTupleValueSchema<Keys, Value> => makeStructToTupleValueClass(keys, value);

export { StructToTupleSchema, StructToTupleValueSchema };
