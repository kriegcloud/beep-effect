import { makeRule, Operands } from "@beep/logos/v2/internal";
import { BetweenNumeric } from "@beep/logos/v2/rules/util";
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

export const { Input, Rule } = makeRule("number", {
  field: S.NonEmptyString,
  op: S.Union(Ops.Eq, Ops.Neq, Ops.Gt, Ops.Gte, Ops.Lt, Ops.Lte, Ops.Between),
});

export namespace Input {
  export type Type = typeof Input.Type;
  export type Encoded = typeof Input.Encoded;
}

export namespace Rule {
  export type Type = typeof Rule.Type;
  export type Encoded = typeof Rule.Encoded;
}

export const make = (i: Omit<Input.Type, "id" | "type">) =>
  Input.make({
    ...i,
    type: "number",
  });

export const validate = (rule: Input.Type, value: number) =>
  Match.value(rule.op).pipe(
    Match.withReturnType<boolean>(),
    Match.tags({
      eq: (op) => op.value === value,
      ne: (op) => op.value !== value,
      gt: (op) => op.value < value,
      gte: (op) => op.value <= value,
      lt: (op) => op.value > value,
      lte: (op) => op.value >= value,
      between: (op) => {
        const {
          value: { min, max },
          inclusive,
        } = op;
        const minInclusive = inclusive ? value >= min : value > min;
        const maxInclusive = inclusive ? value <= max : value < max;
        return minInclusive && maxInclusive;
      },
    }),
    Match.orElse(() => false),
  );
