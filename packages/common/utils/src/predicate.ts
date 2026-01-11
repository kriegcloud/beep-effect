import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";

export const isNotNullableEntryValue = <K, V>(entry: readonly [K, V]): entry is readonly [K, NonNullable<V>] =>
  F.pipe(entry, A.tail, O.flatMap(O.liftPredicate(P.isNotNullable)), O.isSome);

export const isNotNullableEntryKey = <K, V>(entry: readonly [K, V]): entry is readonly [K, NonNullable<V>] =>
  F.pipe(entry, A.head, O.flatMap(O.liftPredicate(P.isNotNullable)), O.isSome);
