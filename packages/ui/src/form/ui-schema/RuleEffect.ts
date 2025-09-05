import {BS} from "@beep/schema";
import type * as S from "effect/Schema";

const {
  Options,
  Enum,
  Schema,
} = BS.stringLiteralKit(
  /**
   * Effect that hides the associated element.
   */
  "HIDE",
  /**
   * Effect that shows the associated element.
   */
  "SHOW",
  /**
   * Effect that enables the associated element.
   */
  "ENABLE",
  /**
   * Effect that disables the associated element.
   */
  "DISABLE",
);

/**
 * The different rule effects.
 */
const RuleEffectSchemaId: unique symbol = Symbol.for("@beep/ui/form/ui-schema/RuleEffect");

export class RuleEffect extends Schema.annotations({
  schemaId: RuleEffectSchemaId,
  identifier: "RuleEffect",
  title: "Rule Effect",
  description: "The different rule effects.",
}) {
  static readonly Options = Options;
  static readonly Enum = Enum;
}

export namespace RuleEffect {
  export type Type = S.Schema.Type<typeof RuleEffect>;
  export type Encoded = S.Schema.Encoded<typeof RuleEffect>;
}

