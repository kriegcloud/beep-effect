import { makeAssertsFn, makeAssertsReturn } from "@beep/utils/assertions";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";

export const isNonEmptyReadonlyArrayOfGuard =
  <const A, const I, const R>(self: S.Schema<A, I, R>) =>
  (array: unknown): array is A.NonEmptyReadonlyArray<S.Schema.Type<S.Schema<A, I, R>>> =>
    S.is(S.NonEmptyArray(self))(array);

export const assertIsNonEmptyArrayOf = <const A, const I, const R, const Type = S.Schema.Type<S.Schema<A, I, R>>>(
  elementSchema: S.Schema<A, I, R>
) => makeAssertsFn(S.NonEmptyArray(elementSchema));

export const assertReturnNonEmpty = <const A, const I, const R>(elementSchema: S.Schema<A, I, R>) =>
  makeAssertsReturn(S.NonEmptyArray(elementSchema));

export namespace NonEmptyReadonly {
  export function make<const Value>(values: A.NonEmptyReadonlyArray<Value>): A.NonEmptyReadonlyArray<Value>;
  export function make<const Value>(...values: A.NonEmptyReadonlyArray<Value>): A.NonEmptyReadonlyArray<Value>;
  export function make<const Value>(...values: A.NonEmptyReadonlyArray<Value>): A.NonEmptyReadonlyArray<Value> {
    return values;
  }

  export const mapWith = F.dual<
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
}
