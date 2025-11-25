import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type * as Types from "effect/Types";

const OptionArrayToOptionTupleTypeId: typeof S.TypeId = S.TypeId;
export { OptionArrayToOptionTupleTypeId };

type OptionArrayToOptionTupleSchema<Count extends number, Value extends S.Schema.Any> = S.transform<
  S.Array$<S.OptionFromSelf<S.SchemaClass<S.Schema.Encoded<Value>>>>,
  S.Tuple<Types.TupleOf<Count, S.OptionFromSelf<Value>>>
> & {
  readonly count: Count;
  readonly value: Value;
};

const makeOptionArrayToOptionTupleClass = <const Count extends number, const Value extends S.Schema.Any>(
  count: Count,
  value: Value
) => {
  const ArraySchema = S.Array(S.OptionFromSelf(S.encodedSchema(value)));
  const TupleSchema = S.Tuple(
    ...(A.makeBy(count, () => S.OptionFromSelf(value)) as Types.TupleOf<Count, S.OptionFromSelf<Value>>)
  );

  return class extends S.transform(ArraySchema, TupleSchema, {
    strict: true,
    decode: (array) =>
      F.pipe(
        TupleSchema.elements,
        A.map((_, index) => F.pipe(A.get(array, index), O.flatten))
      ) as unknown as S.Schema.Encoded<typeof TupleSchema>,
    encode: F.identity,
  }) {
    static count = count;
    static value = value;
  } as unknown as OptionArrayToOptionTupleSchema<Count, Value>;
};

const OptionArrayToOptionTupleSchema = <const Count extends number, const Value extends S.Schema.Any>(
  count: Count,
  value: Value
): OptionArrayToOptionTupleSchema<Count, Value> => makeOptionArrayToOptionTupleClass(count, value);

export { OptionArrayToOptionTupleSchema };
