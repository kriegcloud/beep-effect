import { makeRule, Operands } from "@beep/logos/v2/internal";
import { BetweenNumeric } from "@beep/logos/v2/rules/util";
import * as A from "effect/Array";
import * as Match from "effect/Match";
import * as S from "effect/Schema";

export namespace Ops {
  export class Eq extends Operands.Eq.Schema(S.Number, {}) {}

  export class Neq extends Operands.Neq.Schema(S.Number, {}) {}
  export class Gt extends Operands.Gt.Schema(S.Number, {}) {}
  export class Gte extends Operands.Gte.Schema(S.Number, {}) {}
  export class Lt extends Operands.Lt.Schema(S.Number, {}) {}
  export class Lte extends Operands.Lte.Schema(S.Number, {}) {}
  export class Between extends BetweenNumeric {}
}

export const { Rule, Input } = makeRule("arrayLength", {
  field: S.NonEmptyString,
  op: S.Union(Ops.Eq, Ops.Neq, Ops.Gt, Ops.Gte, Ops.Lt, Ops.Lte, Ops.Between),
});

export const make = (i: Omit<Input.Type, "id" | "type">) =>
  Input.make({
    ...i,
    type: "arrayLength",
  });

export namespace Rule {
  export type Type = typeof Rule.Type;
  export type Encoded = typeof Rule.Encoded;
}

export namespace Input {
  export type Type = typeof Input.Type;
  export type Encoded = typeof Input.Encoded;
}

export const validate = (rule: Input.Type, value: Array<unknown>) => {
  const length = A.length(value);
  return Match.value(rule.op).pipe(
    Match.withReturnType<boolean>(),
    Match.tags({
      eq: (op) => op.value === length,
      ne: (op) => op.value !== length,
      gt: (op) => op.value < length,
      gte: (op) => op.value <= length,
      lt: (op) => op.value > length,
      lte: (op) => op.value >= length,
      between: (op) => {
        const {
          value: { min, max },
          inclusive,
        } = op;
        const minInclusive = inclusive ? length >= min : length > min;
        const maxInclusive = inclusive ? length <= max : length < max;
        return minInclusive && maxInclusive;
      },
    }),
    Match.orElse(() => false),
  );
};
