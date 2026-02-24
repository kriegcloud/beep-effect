import type { StringTypes } from "@beep/types";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Tuple from "effect/Tuple";
import type * as Types from "effect/Types";

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

type TupleToStructSchema<
  Keys extends ReadonlyArray<StringTypes.NonEmptyString>,
  Fields extends Types.TupleOf<Keys["length"], S.Schema.Any>,
> = S.transform<S.Tuple<EncodedFields<Fields>>, S.Struct<Struct<Keys, Fields>>> & {
  readonly keys: Keys;
  readonly fields: Fields;
};

const makeTupleToStructClass = <
  Keys extends ReadonlyArray<StringTypes.NonEmptyString>,
  Fields extends Types.TupleOf<Keys["length"], S.Schema.Any>,
>(
  keys: Keys,
  fields: Fields
) => {
  const TupleSchema = S.Tuple<EncodedFields<Fields>>(
    ...(F.pipe(fields, A.map(S.encodedSchema)) as EncodedFields<Fields>)
  );
  const StructSchema = S.Struct(R.fromEntries(A.zip(keys, fields)) as Struct<Keys, Fields>);

  return class extends S.transform(TupleSchema, StructSchema, {
    strict: true,
    decode: (tuple) => F.pipe(A.zip(keys, tuple), Object.fromEntries),
    encode: (struct) =>
      F.pipe(
        keys,
        Tuple.map((key) => struct[key as keyof S.Struct.Encoded<Struct<Keys, Fields>>] as unknown)
      ) as S.Schema.Type<typeof TupleSchema>,
  }) {
    static keys = keys;
    static fields = fields;
  } as TupleToStructSchema<Keys, Fields>;
};

const TupleToStructSchema = <
  const Keys extends ReadonlyArray<StringTypes.NonEmptyString>,
  const Fields extends Types.TupleOf<Keys["length"], S.Schema.Any>,
>(
  keys: Keys,
  fields: Fields
): TupleToStructSchema<Keys, Fields> => makeTupleToStructClass(keys, fields);

type StructValue<Keys extends ReadonlyArray<StringTypes.NonEmptyString>, Value extends S.Schema.Any> = {
  [K in Keys[number]]: Value;
};

type EncodedValues<Keys extends ReadonlyArray<StringTypes.NonEmptyString>, Value extends S.Schema.Any> = Types.TupleOf<
  Keys["length"],
  S.SchemaClass<S.Schema.Encoded<Value>>
>;

type TupleToStructValueSchema<
  Keys extends ReadonlyArray<StringTypes.NonEmptyString>,
  Value extends S.Schema.Any,
> = S.transform<S.Tuple<EncodedValues<Keys, Value>>, S.Struct<StructValue<Keys, Value>>> & {
  readonly keys: Keys;
  readonly value: Value;
};

const makeTupleToStructValueClass = <
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
      F.pipe(
        keys,
        A.map((key) => [key, value])
      )
    ) as StructValue<Keys, Value>
  );

  return class extends S.transform(TupleSchema, StructSchema, {
    strict: true,
    decode: (tuple) => F.pipe(A.zip(keys, tuple), Object.fromEntries),
    encode: (struct) =>
      F.pipe(
        keys,
        Tuple.map((key) => struct[key as keyof S.Struct.Encoded<StructValue<Keys, Value>>] as unknown)
      ) as S.Schema.Type<typeof TupleSchema>,
  }) {
    static keys = keys;
    static value = value;
  } as TupleToStructValueSchema<Keys, Value>;
};

const TupleToStructValueSchema = <
  const Keys extends ReadonlyArray<StringTypes.NonEmptyString>,
  const Value extends S.Schema.Any,
>(
  keys: Keys,
  value: Value
): TupleToStructValueSchema<Keys, Value> => makeTupleToStructValueClass(keys, value);

export { TupleToStructSchema, TupleToStructValueSchema };
