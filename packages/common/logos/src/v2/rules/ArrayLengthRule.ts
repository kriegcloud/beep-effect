import { makeRule, Operands } from "@beep/logos/v2/internal";
import { BetweenNumeric } from "@beep/logos/v2/rules/util";
import * as A from "effect/Array";
import * as Match from "effect/Match";
import * as S from "effect/Schema";

export namespace Ops {
  export class Eq extends Operands.Eq.Schema(S.Number, {}) {
    static readonly make = (i: Omit<typeof Eq.Type, "_tag">) =>
      ({
        _tag: "eq",
        ...i,
      }) as const;
  }

  export class Neq extends Operands.Neq.Schema(S.Number, {}) {
    static readonly make = (i: Omit<typeof Neq.Type, "_tag">) =>
      ({
        _tag: "ne",
        ...i,
      }) as const;
  }

  export class Gt extends Operands.Gt.Schema(S.Number, {}) {
    static readonly make = (i: Omit<typeof Gt.Type, "_tag">) =>
      ({
        _tag: "gt",
        ...i,
      }) as const;
  }

  export class Gte extends Operands.Gte.Schema(S.Number, {}) {
    static readonly make = (i: Omit<typeof Gte.Type, "_tag">) =>
      ({
        _tag: "gte",
        ...i,
      }) as const;
  }

  export class Lt extends Operands.Lt.Schema(S.Number, {}) {
    static readonly make = (i: Omit<typeof Lte.Type, "_tag">) =>
      ({
        _tag: "lt",
        ...i,
      }) as const;
  }

  export class Lte extends Operands.Lte.Schema(S.Number, {}) {
    static readonly make = (i: Omit<typeof Lte.Type, "_tag">) =>
      ({
        _tag: "lte",
        ...i,
      }) as const;
  }

  export class Between extends BetweenNumeric {
    static readonly make = (i: Omit<typeof Between.Type, "_tag">) =>
      ({
        _tag: "between",
        ...i,
      }) as const;
  }
}

export const { Rule, Input } = makeRule("arrayLength", {
  field: S.NonEmptyString,
  op: S.Union(Ops.Eq, Ops.Neq, Ops.Gt, Ops.Gte, Ops.Lt, Ops.Lte, Ops.Between),
});

export const makeBase = (i: Omit<Input.Type, "type">) =>
  Input.make({
    ...i,
    type: "arrayLength",
  });

export const eq = (i: Pick<Input.Type, "field"> & { value: number }) =>
  makeBase({
    ...i,
    op: Ops.Eq.make({
      value: i.value,
    }),
  });

export const ne = (i: Pick<Input.Type, "field"> & { value: number }) =>
  makeBase({
    ...i,
    op: Ops.Neq.make({
      value: i.value,
    }),
  });

export const gt = (i: Pick<Input.Type, "field"> & { value: number }) =>
  makeBase({
    ...i,
    op: Ops.Gt.make({
      value: i.value,
    }),
  });

export const gte = (i: Pick<Input.Type, "field"> & { value: number }) =>
  makeBase({
    ...i,
    op: Ops.Gte.make({
      value: i.value,
    }),
  });

export const lt = (i: Pick<Input.Type, "field"> & { value: number }) =>
  makeBase({
    ...i,
    op: Ops.Lt.make({
      value: i.value,
    }),
  });

export const lte = (i: Pick<Input.Type, "field"> & { value: number }) =>
  makeBase({
    ...i,
    op: Ops.Lte.make({
      value: i.value,
    }),
  });

export const between = (
  i: Pick<Input.Type, "field"> & {
    value: {
      min: number;
      max: number;
    };
    inclusive?: boolean;
  }
) =>
  makeBase({
    ...i,
    op: Ops.Between.make({
      inclusive: i.inclusive ?? false,
      value: i.value,
    } as const),
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
    Match.tagsExhaustive({
      eq: (op) => op.value === length,
      ne: (op) => op.value !== length,
      gt: (op) => op.value < length,
      gte: (op) => op.value <= length,
      lt: (op) => op.value > length,
      lte: (op) => op.value >= length,
      between: (op) => BetweenNumeric.validate(op)(length),
    })
  );
};
