import * as S from "effect/Schema";
import { OptionArrayToOptionTupleSchema } from "./OptionArrayToOptionTuple";
import { TupleToStructValueSchema } from "./TupleToStruct";

type OptionArrayToOptionStructValueSchema<Keys extends ReadonlyArray<string>, Value extends S.Schema.Any> = S.transform<
  OptionArrayToOptionTupleSchema<Keys["length"], S.SchemaClass<S.Schema.Encoded<Value>>>,
  TupleToStructValueSchema<Keys, S.OptionFromSelf<Value>>
>;

const makeOptionArrayToOptionStructValueClass = <
  const Keys extends ReadonlyArray<string>,
  const Value extends S.Schema.Any,
>(
  keys: Keys,
  value: Value
) => {
  const optionArrayToOptionTupleSchema = OptionArrayToOptionTupleSchema(
    keys.length as Keys["length"],
    S.encodedSchema(value)
  );
  const tupleToStructValueSchema = TupleToStructValueSchema(keys, S.OptionFromSelf(value));

  return class extends S.compose(optionArrayToOptionTupleSchema, tupleToStructValueSchema, { strict: false }) {
    static keys = keys;
    static value = value;
  } as unknown as OptionArrayToOptionStructValueSchema<Keys, Value>;
};

const OptionArrayToOptionStructValueSchema = <
  const Keys extends ReadonlyArray<string>,
  const Value extends S.Schema.Any,
>(
  keys: Keys,
  value: Value
): OptionArrayToOptionStructValueSchema<Keys, Value> => makeOptionArrayToOptionStructValueClass(keys, value);

export { OptionArrayToOptionStructValueSchema };
