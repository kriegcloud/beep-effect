import { getNestedValue } from "@beep/utils/data/string.utils";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Str from "effect/String";

export type OrderDirection = "asc" | "desc";

export type OrderIteratee<T> = ((item: T) => unknown) | string;

export const orderBy = <T>(
  collection: ReadonlyArray<T>,
  iteratees: ReadonlyArray<OrderIteratee<T>>,
  directions: ReadonlyArray<OrderDirection | string> = []
): ReadonlyArray<T> =>
  F.pipe(
    iteratees,
    A.reduce(
      {
        index: 0,
        orders: [] as ReadonlyArray<Order.Order<T>>,
      },
      (state, iteratee) => {
        const direction = F.pipe(
          directions,
          A.get(state.index),
          O.map(normalizeDirection),
          O.getOrElse<OrderDirection>(() => "asc")
        );

        const accessor = toAccessor(iteratee);
        const finalOrder = Order.make<T>((left, right) => {
          const leftValue = accessor(left);
          const rightValue = accessor(right);
          const baseResult = compareUnknown(leftValue, rightValue);

          if (baseResult === 0) {
            return 0;
          }

          if (isNullish(leftValue) || isNullish(rightValue)) {
            return baseResult;
          }

          return direction === "desc" ? invertResult(baseResult) : baseResult;
        });

        return {
          index: state.index + 1,
          orders: F.pipe(state.orders, A.append(finalOrder)),
        };
      }
    ),
    ({ orders }) =>
      F.pipe(
        orders,
        A.match({
          onEmpty: () => collection,
          onNonEmpty: (nonEmpty) => F.pipe(collection, A.sort(combineComparators(nonEmpty))),
        })
      )
  );

const combineComparators = <T>(orders: A.NonEmptyReadonlyArray<Order.Order<T>>): Order.Order<T> =>
  Order.combineAll(orders);

const toAccessor =
  <T>(iteratee: OrderIteratee<T>) =>
  (item: T): unknown =>
    typeof iteratee === "function" ? iteratee(item) : getNestedValue(item as Record<string, unknown>, iteratee);

const isNullish = (value: unknown): boolean => value === null || value === undefined;

const invertResult = (value: -1 | 0 | 1): -1 | 0 | 1 => (value === 0 ? 0 : ((value * -1) as -1 | 0 | 1));

const normalizeDirection = (input: OrderDirection | string): OrderDirection =>
  F.pipe(input, Str.trim, Str.toLowerCase, (value) => (value === "desc" ? "desc" : "asc"));

const compareUnknown = (left: unknown, right: unknown): -1 | 0 | 1 => {
  if (Object.is(left, right)) {
    return 0;
  }

  if (left === undefined || left === null) {
    return 1;
  }

  if (right === undefined || right === null) {
    return -1;
  }

  if (typeof left === "number" && typeof right === "number") {
    if (Number.isNaN(left)) {
      return Number.isNaN(right) ? 0 : 1;
    }
    if (Number.isNaN(right)) {
      return -1;
    }
    return normalizeOrderResult(Order.number(left, right));
  }

  if (typeof left === "bigint" && typeof right === "bigint") {
    return normalizeOrderResult(Order.bigint(left, right));
  }

  if (typeof left === "boolean" && typeof right === "boolean") {
    return normalizeOrderResult(Order.boolean(left, right));
  }

  if (typeof left === "string" && typeof right === "string") {
    return normalizeOrderResult(Order.string(left, right));
  }

  if (left instanceof Date && right instanceof Date) {
    return normalizeOrderResult(Order.Date(left, right));
  }

  if (typeof left === "symbol" && typeof right === "symbol") {
    return normalizeOrderResult(Order.string(String(left), String(right)));
  }

  if (A.isArray(left) && A.isArray(right)) {
    return normalizeOrderResult(Order.string(JSON.stringify(left), JSON.stringify(right)));
  }

  if (typeof left === "object" && typeof right === "object") {
    return normalizeOrderResult(Order.string(JSON.stringify(left), JSON.stringify(right)));
  }

  return normalizeOrderResult(Order.string(String(left), String(right)));
};

const normalizeOrderResult = (value: number): -1 | 0 | 1 => (value < 0 ? -1 : value > 0 ? 1 : 0);
