import {BS} from "@beep/schema";
import * as S from "effect/Schema";
import {RuleEffect} from "@beep/ui/form/ui-schema/RuleEffect";

/**
 * Interface for describing an UI schema element that is referencing
 * a subschema. The value of the scope may be a JSON Pointer.
 */
export class Scopable extends BS.Class<Scopable>(`Scopable`)({
  /**
   * The scope that determines to which part this element should be bound to.
   */
  scope: S.OptionFromUndefinedOr(S.NonEmptyString).annotations({
    description: "The scope that determines to which part this element should be bound to."
  }),
}, [
  {
    identifier: "Scopable",
    title: "Scopable",
    description: "The scope that determines to which part this element should be bound to.",
    schemaId: Symbol.for("@beep/ui/form/ui-schema/Scopable"),
  }
]) {
}

export namespace Scopable {
  export type Type = S.Schema.Type<typeof Scopable>;
  export type Encoded = S.Schema.Encoded<typeof Scopable>;
}

/**
 * Interface for describing an UI schema element that is referencing
 * a subschema. The value of the scope must be a JSON Pointer.
 */
export class Scoped extends Scopable.extend<Scoped>(`Scoped`)({
  /**
   * The scope that determines to which part this element should be bound to.
   */
  scope: S.NonEmptyString.annotations({
    description: "The scope that determines to which part this element should be bound to."
  }),
}, [
  {
    identifier: "Scoped",
    title: "Scoped",
    description: "Interface for describing an UI schema element that is referencing * a subschema. The value of the scope must be a JSON Pointer.",
    schemaId: Symbol.for("@beep/ui/form/ui-schema/Scoped"),
  }
]) {

}

export namespace Scoped {
  export type Type = S.Schema.Type<typeof Scoped>;
  export type Encoded = S.Schema.Encoded<typeof Scoped>;
}

/**
 * Interface for describing an UI schema element that may be labeled.
 */
export class Labelable extends BS.Class<Labelable>("Labelable")({
  label: S.OptionFromUndefinedOr(S.Union(S.Unknown, S.NonEmptyString))
}, [
  {
    schemaId: Symbol.for("@beep/ui/form/ui-schema/Labelable"),
    identifier: `Labelable`,
    title: "Label-able",
    description: "Interface for describing an UI schema element that may be labeled.",
  }
]) {
}

export namespace Labelable {
  export type Type = S.Schema.Type<typeof Labelable>;
  export type Encoded = S.Schema.Encoded<typeof Labelable>;
}

/**
 * Interface for describing an UI schema element that is labeled.
 */
export class Labeled extends Labelable.extend<Labeled>(`Labeled`)({
  label: S.OptionFromUndefinedOr(S.Union(S.Unknown, S.NonEmptyString))
}, [
  {
    schemaId: Symbol.for("@beep/ui/form/ui-schema/Labeled"),
    identifier: `Labeled`,
    title: "Labeled",
    description: "Interface for describing an UI schema element that is labeled.",
  }
]) {
}

export namespace Labeled {
  export type Type = S.Schema.Type<typeof Labeled>;
  export type Encoded = S.Schema.Encoded<typeof Labeled>;
}

/*
 * Interface for describing an UI schema element that can provide an internationalization base key.
 * If defined, this key is suffixed to derive applicable message keys for the UI schema element.
 * For example, such suffixes are `.label` or `.description` to derive the corresponding message keys for a control element.
 */
export class Internationalizable extends BS.Class<Internationalizable>(`Internationalizable`)({
  i18n: S.OptionFromUndefinedOr(S.NonEmptyString)
}, [
  {
    schemaId: Symbol.for("@beep/ui/form/ui-schema/Internationalizable"),
    identifier: `Internationalizable`,
    title: "Internationalizable",
    description: "Interface for describing an UI schema element that can provide an internationalization base key.",
    documentation: `Interface for describing an UI schema element that can provide an internationalization base key.
If defined, this key is suffixed to derive applicable message keys for the UI schema element.
For example, such suffixes are \`.label\` or \`.description\` to derive the corresponding message keys for a control element.`
  }
]) {
}

export namespace Internationalizable {
  export type Type = S.Schema.Type<typeof Internationalizable>;
  export type Encoded = S.Schema.Encoded<typeof Internationalizable>;
}

/**
 * A rule that may be attached to any UI schema element.
 */
export class UIRule extends BS.Class<UIRule>(`UIRule`)({
  ruleEffect: RuleEffect,
  //condition:
}) {}

/**
 * Represents a condition to be evaluated.
 */
export class BaseCondition extends BS.Class<BaseCondition>(`BaseCondition`)({
    /**
   * The type of condition.
   */
    type: S.OptionFromUndefinedOr(S.NonEmptyString)
}, [
  {
    schemaId: Symbol.for("@beep/ui/form/ui-schema/BaseCondition"),
    identifier: `BaseCondition`,
    title: "Base Condition",
    description: "Represents a condition to be evaluated.",
  }
]) {}

export namespace BaseCondition {
  export type Type = S.Schema.Type<typeof BaseCondition>;
  export type Encoded = S.Schema.Encoded<typeof BaseCondition>;
}

/**
 * A leaf condition.
 */
export class LeafCondition extends BaseCondition.extend<LeafCondition>(`LeafCondition`)({
  type: BS.LiteralWithDefault("LEAF"),
  /**
   * The expected value when evaluating the condition
   */
  expectedValue: S.Any.annotations({
    description: "The expected value when evaluating the condition",
  }),
  ...Scoped.fields,
}) {}

