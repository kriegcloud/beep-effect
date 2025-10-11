import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";

export function make<const Value>(values: A.NonEmptyReadonlyArray<Value>): A.NonEmptyReadonlyArray<Value>;
export function make<const Value>(...values: A.NonEmptyReadonlyArray<Value>): A.NonEmptyReadonlyArray<Value>;
export function make<const Value>(...values: A.NonEmptyReadonlyArray<Value>): A.NonEmptyReadonlyArray<Value> {
  return values;
}

type MapWith = ReturnType<
  typeof F.dual<
    <const Value, const MappedValue>(
      f: (value: Value, index: number, array: A.NonEmptyReadonlyArray<Value>) => MappedValue
    ) => (self: A.NonEmptyReadonlyArray<Value>) => A.NonEmptyReadonlyArray<MappedValue>,
    <const Value, const MappedValue>(
      self: A.NonEmptyReadonlyArray<Value>,
      f: (value: Value, index: number, array: A.NonEmptyReadonlyArray<Value>) => MappedValue
    ) => A.NonEmptyReadonlyArray<MappedValue>
  >
>;

export const mapWith: MapWith = F.dual<
  <const Value, const MappedValue>(
    f: (value: Value, index: number, array: A.NonEmptyReadonlyArray<Value>) => MappedValue
  ) => (self: A.NonEmptyReadonlyArray<Value>) => A.NonEmptyReadonlyArray<MappedValue>,
  <const Value, const MappedValue>(
    self: A.NonEmptyReadonlyArray<Value>,
    f: (value: Value, index: number, array: A.NonEmptyReadonlyArray<Value>) => MappedValue
  ) => A.NonEmptyReadonlyArray<MappedValue>
>(
  2,
  <const Value, const MappedValue>(
    self: A.NonEmptyReadonlyArray<Value>,
    f: (value: Value, index: number, array: A.NonEmptyReadonlyArray<Value>) => MappedValue
  ): A.NonEmptyReadonlyArray<MappedValue> => {
    const headOption = A.head(self);
    const tailOption = A.tail(self);
    const head = O.getOrThrow(headOption);
    const tail = O.getOrThrow(tailOption);
    const mappedHead = f(head, 0, self);

    if (tail.length === 0) {
      return [mappedHead] as const;
    }

    const mappedTail = A.map(tail, (value, index) => f(value, index + 1, self));

    return [mappedHead, ...mappedTail] as const;
  }
);
