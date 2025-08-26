import { makeRule, Operands } from "@beep/logos/v2/internal";
import { BS } from "@beep/schema";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const IgnoreCase = S.Boolean;

export namespace Ops {
  export class Eq extends Operands.Eq.Schema(S.String, {
    ignoreCase: IgnoreCase,
  }) {}
  export class Neq extends Operands.Neq.Schema(S.String, {
    ignoreCase: IgnoreCase,
  }) {}
  export class StartsWith extends Operands.StartsWith.Schema(S.NonEmptyString, {
    ignoreCase: IgnoreCase,
  }) {}
  export class EndsWith extends Operands.EndsWith.Schema(S.NonEmptyString, {
    ignoreCase: IgnoreCase,
  }) {}
  export class Contains extends Operands.Contains.Schema(S.NonEmptyString, {
    ignoreCase: IgnoreCase,
  }) {}
  export class NotContains extends Operands.NotContains.Schema(
    S.NonEmptyString,
    {
      ignoreCase: IgnoreCase,
    },
  ) {}
  export class Matches extends Operands.Matches.Schema(BS.RegexFromString, {
    ignoreCase: IgnoreCase,
  }) {}

  export namespace Matches {
    export type Type = typeof Matches.Type;
    export type Encoded = typeof Matches.Encoded;
  }
}

export const { Input, Rule } = makeRule("string", {
  field: S.NonEmptyString,
  op: S.Union(
    Ops.Eq,
    Ops.Neq,
    Ops.StartsWith,
    Ops.EndsWith,
    Ops.Contains,
    Ops.NotContains,
    Ops.Matches,
  ),
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
    type: "string",
  });

const handleCase = (ignoreCase: boolean) => (value: string) =>
  ignoreCase ? Str.trim(Str.toLowerCase(value)) : Str.trim(value);

export const validate = (rule: Input.Type, value: string) =>
  Match.value(rule.op).pipe(
    Match.withReturnType<boolean>(),
    Match.not({ _tag: "matches" }, (m) => {
      const caseValue = handleCase(m.ignoreCase)(value);
      const caseRuleValue = handleCase(m.ignoreCase)(m.value);
      return F.pipe(
        {
          caseValue,
          caseRuleValue,
        },
        ({ caseValue, caseRuleValue }) =>
          Match.value(m).pipe(
            Match.withReturnType<boolean>(),
            Match.tags({
              eq: () => caseValue === caseRuleValue,
              ne: () => caseValue !== caseRuleValue,
              contains: () => caseValue.includes(caseRuleValue),
              notContains: () => !caseValue.includes(caseRuleValue),
              startsWith: () => caseValue.startsWith(caseRuleValue),
              endsWith: () => caseValue.endsWith(caseRuleValue),
            }),
            Match.orElse(() => false),
          ),
      );
    }),
    Match.tag("matches", (r) => r.value.test(value)),
    Match.orElse(() => false),
  );
