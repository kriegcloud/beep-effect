import * as A from "effect/Array";
import * as F from "effect/Function";
import * as P from "effect/Predicate";

export const hasProperties: {
  <Properties extends A.NonEmptyReadonlyArray<PropertyKey>>(
    ...properties: Properties
  ): (self: unknown) => self is { [K in Properties[number]]: unknown };
  <Properties extends A.NonEmptyReadonlyArray<PropertyKey>>(
    self: unknown,
    properties: Properties
  ): self is { [K in Properties[number]]: unknown };
} = F.dual(
  2,
  <Properties extends A.NonEmptyReadonlyArray<PropertyKey>>(
    self: unknown,
    property: Properties
  ): self is { [K in Properties[number]]: unknown } => P.isObject(self) && A.every(property, P.hasProperty)
);
