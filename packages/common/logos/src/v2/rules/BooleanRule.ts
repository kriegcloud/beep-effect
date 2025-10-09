import * as Equal from "effect/Equal";
import * as Match from "effect/Match";
import * as S from "effect/Schema";
import { makeRule, Operands } from "../internal";

export namespace Ops {
  export class IsTrue extends Operands.IsTrue.Schema(S.Null, {}) {
    static readonly make = () =>
      ({
        _tag: "isTrue",
        value: null,
      }) as const;
  }
  export class IsFalse extends Operands.IsFalse.Schema(S.Null, {}) {
    static readonly make = () =>
      ({
        _tag: "isFalse" as const,
        value: null,
      }) as const;
  }
}

export const { Input, Rule } = makeRule("boolean", {
  field: S.NonEmptyString,
  op: S.Union(Ops.IsTrue, Ops.IsFalse),
});

export namespace Input {
  export type Type = typeof Input.Type;
  export type Encoded = typeof Input.Encoded;
}

export namespace Rule {
  export type Type = typeof Rule.Type;
  export type Encoded = typeof Rule.Encoded;
}

// export const make = (i: {
//   op: Input.Type["op"]["_tag"];
//   field: Input.Type["field"];
// }) =>
//   Input.make({
//     ...i,
//     type: "boolean",
//     op: i.op === "isTrue" ? Ops.IsTrue.make() : Ops.IsFalse.make(),
//   });

const makeBase = (i: Omit<Input.Type, "id" | "type">) =>
  Input.make({
    ...i,
    type: "boolean",
  });

export const isTrue = (i: Pick<Input.Type, "field">) =>
  makeBase({
    op: Ops.IsTrue.make(),
    field: i.field,
  });

export const isFalse = (i: Pick<Input.Type, "field">) =>
  makeBase({
    op: Ops.IsFalse.make(),
    field: i.field,
  });

export const validate = (rule: Input.Type, value: boolean) =>
  Match.value(rule.op).pipe(
    Match.withReturnType<boolean>(),
    Match.tagsExhaustive({
      isTrue: () => Equal.equals(value)(true),
      isFalse: () => Equal.equals(value)(false),
    })
  );
