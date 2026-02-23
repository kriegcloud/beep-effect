import { $SemanticWebId } from "@beep/identity/packages";
import { ModelType } from "@beep/semantic-web/rdf/values";
import { pipe } from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SemanticWebId.create("rdf/models/Variable");

export const VariableEncoded = S.TemplateLiteral("<", S.String, ">").annotations(
  $I.annotations("VariableEncoded", {
    description: "",
  })
);

export declare namespace VariableEncoded {
  export type Type = typeof VariableEncoded.Type;
  export type Encoded = typeof VariableEncoded.Encoded;
}

export class Variable extends S.Class<Variable>($I`Variable`)(
  ModelType.makeKind.Variable({
    value: S.NonEmptyString,
  }),
  $I.annotations("Variable", {
    description: "",
  })
) {
  static readonly Equivalence = S.equivalence(Variable);
  static readonly new = (value: string) => new Variable({ value });

  equals(that: Variable): boolean {
    return Variable.Equivalence(this, that);
  }
}

export class VariableFromString extends S.transform(VariableEncoded, Variable, {
  strict: true,
  decode: (string) => pipe(string, Str.replace(">", ""), Str.replace("<", ""), Variable.new),
  encode: ({ value }) => `<${value}>` as const,
}) {}

export declare namespace Variable {
  export type Type = typeof Variable.Type;
}
