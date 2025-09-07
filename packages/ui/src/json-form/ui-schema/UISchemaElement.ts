import { BS } from "@beep/schema";
import type { UnsafeTypes } from "@beep/types";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import isEmpty from "lodash/isEmpty";
import { z } from "zod";
import { Internationalizable } from "./Internationalizable";
import { Labelable, Labeled } from "./Label";
import { Scoped } from "./Scope";

const { Options, Enum, Schema } = BS.stringLiteralKit(
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
  "DISABLE"
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

/**
 * A rule that may be attached to any UI schema element.
 */
export class UIRule extends BS.Class<UIRule>(`UIRule`)({
  ruleEffect: RuleEffect,
  condition: S.suspend((): ConditionSchema => Condition),
}) {}

export namespace UIRule {
  export type Type = S.Schema.Type<typeof UIRule>;
  export type Encoded = S.Schema.Encoded<typeof UIRule>;
}

/**
 * Common base interface for any UI schema element.
 */
export class BaseUISchemaElement extends BS.Class<BaseUISchemaElement>("BaseUISchemaElement")(
  {
    /**
     * The type of this UI schema element.
     */
    type: S.NonEmptyString.annotations({
      description: "The type of this UI schema element.",
    }),
    /**
     * An optional rule.
     */
    rule: BS.toOptionalWithDefault(S.OptionFromUndefinedOr(UIRule))(O.none()),

    /**
     * Any additional options.
     */
    options: BS.toOptionalWithDefault(
      S.OptionFromUndefinedOr(
        S.Record({
          key: S.NonEmptyString,
          value: BS.Json,
        })
      ).annotations({
        description: "Any additional options.",
      })
    )(O.none()),
  },
  {
    schemaId: Symbol.for("@beep/ui/form/ui-schema/BaseUISchemaElement"),
    title: "Base UI schema element",
    description: "Common base interface for any UI schema element.",
  }
) {}

export namespace BaseUISchemaElement {
  export type Type = S.Schema.Type<typeof BaseUISchemaElement>;
  type Enc = S.Schema.Encoded<typeof BaseUISchemaElement>;
  export type Encoded = Enc & {
    /**
     * The type of this UI schema element.
     */
    type: string;
  };
}

/**
 * Represents a layout element which can order its children
 * in a specific way.
 */
export class Layout extends BaseUISchemaElement.extend<Layout>("Layout")(
  {
    elements: S.Array(S.suspend((): S.Schema<BaseUISchemaElement.Type, BaseUISchemaElement.Encoded> => UISchemaElement))
      .pipe(
        S.propertySignature,
        S.withConstructorDefault(() => [])
      )
      .annotations({
        description: "The child elements of this layout.",
      }),
  },
  {
    schemaId: Symbol.for("@beep/ui/form/ui-schema/Layout"),
    title: "Layout",
    description: "Represents a layout element which can order its children in a specific way.",
  }
) {
  static readonly is = (uiSchema: UISchemaElement.Type): uiSchema is Layout.Type => {
    return (uiSchema as Layout.Type).elements !== undefined;
  };
  /**
   * Creates a new ILayout.
   * @param layoutType The type of the layout
   * @returns the new ILayout
   */
  static readonly create = (layoutType: string): Layout.Type =>
    Layout.make({
      type: layoutType,
    });

  /**
   * Wraps the given {@code uiSchema} in a Layout if there is none already.
   * @param uischema The ui schema to wrap in a layout.
   * @param layoutType The type of the layout to create.
   * @returns the wrapped uiSchema.
   */
  static readonly wrap = (uiSchema: UISchemaElement.Type, layoutType: string): Layout.Type => {
    if (!isEmpty(uiSchema) && !Layout.is(uiSchema)) {
      return Layout.make({
        ...Layout.create(layoutType),
        elements: [uiSchema],
      });
    }

    return Layout.make(uiSchema);
  };
}

export namespace Layout {
  export type Type = S.Schema.Type<typeof Layout>;
  export type Encoded = S.Schema.Encoded<typeof Layout>;
}

/**
 * A layout which orders its child elements vertically (i.e. from top to bottom).
 */
export class VerticalLayout extends Layout.extend<VerticalLayout>("VerticalLayout")(
  {
    type: BS.LiteralWithDefault("VerticalLayout"),
  },
  {
    schemaId: Symbol.for("@beep/ui/form/ui-schema/VerticalLayout"),
    title: "Vertical layout",
    description: "A layout which orders its child elements vertically (i.e. from top to bottom).",
  }
) {}

export namespace VerticalLayout {
  export type Type = S.Schema.Type<typeof VerticalLayout>;
  export type Encoded = S.Schema.Encoded<typeof VerticalLayout>;
}

/**
 * A layout which orders its children horizontally (i.e. from left to right).
 */
export class HorizontalLayout extends Layout.extend<HorizontalLayout>("HorizontalLayout")(
  {
    type: BS.LiteralWithDefault("HorizontalLayout"),
  },
  {
    schemaId: Symbol.for("@beep/ui/form/ui-schema/HorizontalLayout"),
    title: "Horizontal layout",
    description: "A layout which orders its children horizontally (i.e. from left to right).",
  }
) {}

export namespace HorizontalLayout {
  export type Type = S.Schema.Type<typeof HorizontalLayout>;
  export type Encoded = S.Schema.Encoded<typeof HorizontalLayout>;
}

/**
 * A group resembles a vertical layout, but additionally might have a label.
 * This layout is useful when grouping different elements by a certain criteria.
 */
export class GroupLayout extends Layout.extend<GroupLayout>("GroupLayout")(
  {
    type: BS.LiteralWithDefault("GroupLayout"),
    ...Labelable.fields,
    ...Internationalizable.fields,
  },
  {
    schemaId: Symbol.for("@beep/ui/form/ui-schema/GroupLayout"),
    title: "Group layout",
    description:
      "A group resembles a vertical layout, but additionally might have a label. This layout is useful when grouping different elements by a certain criteria.",
  }
) {}

export namespace GroupLayout {
  export type Type = S.Schema.Type<typeof GroupLayout>;
  export type Encoded = S.Schema.Encoded<typeof GroupLayout>;
}

/**
 * A label element.
 */
export class LabelElement extends BaseUISchemaElement.extend<LabelElement>("LabelElement")(
  {
    type: BS.LiteralWithDefault("Label"),
    /**
     * The text of label.
     */
    text: S.NonEmptyString.annotations({
      description: "The text of label.",
    }),
    ...Internationalizable.fields,
  },
  {
    schemaId: Symbol.for("@beep/ui/form/ui-schema/LabelElement"),
    title: "Label element",
    description: "A label element.",
  }
) {}

export namespace LabelElement {
  export type Type = S.Schema.Type<typeof LabelElement>;
  export type Encoded = S.Schema.Encoded<typeof LabelElement>;
}

/**
 * A control element. The scope property of the control determines
 * to which part of the schema the control should be bound.
 */
export class ControlElement extends BaseUISchemaElement.extend<ControlElement>("ControlElement")(
  {
    type: BS.LiteralWithDefault("Control"),
    ...Scoped.fields,
    ...Labelable.fields,
    ...Internationalizable.fields,
  },
  {
    schemaId: Symbol.for("@beep/ui/form/ui-schema/ControlElement"),
    title: "Control element",
    description:
      "A control element. The scope property of the control determines to which part of the schema the control should be bound.",
  }
) {
  static readonly is = S.is(ControlElement);

  /**
   * Creates a IControlObject with the given label referencing the given ref
   */
  static readonly create = (ref: string): ControlElement.Type =>
    ControlElement.make({
      type: "Control",
      scope: ref,
    });
}

export namespace ControlElement {
  export type Type = S.Schema.Type<typeof ControlElement>;
  export type Encoded = S.Schema.Encoded<typeof ControlElement>;
}

/**
 * The category layout.
 */
export class Category extends Layout.extend<Category>("Category")(
  {
    type: BS.LiteralWithDefault("Category"),
    ...Labeled.fields,
    ...Internationalizable.fields,
  },
  {
    schemaId: Symbol.for("@beep/ui/form/ui-schema/Category"),
    title: "Category",
    description: "The category layout.",
  }
) {}

export namespace Category {
  export type Type = S.Schema.Type<typeof Category>;
  export type Encoded = S.Schema.Encoded<typeof Category>;
}

export namespace Categorization {
  export interface Type extends BaseUISchemaElement.Type, Labeled.Type, Internationalizable.Type {
    type: "Categorization";
    /**
     * The child elements of this categorization which are either of type
     * {@link Category} or {@link Categorization}.
     */
    elements: ReadonlyArray<Category.Type | Categorization.Type>;
  }

  export interface Encoded extends BaseUISchemaElement.Encoded, Labeled.Encoded, Internationalizable.Encoded {
    type: "Categorization";
    /**
     * The child elements of this categorization which are either of type
     * {@link Category} or {@link Categorization}.
     */
    elements: ReadonlyArray<Category.Encoded | Categorization.Encoded>;
  }
}

/**
 * The categorization element, which may have children elements.
 * A child element may either be itself a Categorization or a Category, hence
 * the categorization element can be used to represent recursive structures like trees.
 */
export class Categorization extends BaseUISchemaElement.extend<Categorization>("Categorization")(
  {
    type: BS.LiteralWithDefault("Categorization"),
    /**
     * The child elements of this categorization which are either of type
     * {@link Category} or {@link Categorization}.
     */
    elements: S.Array(
      S.Union(
        Category,
        S.suspend((): S.Schema<Categorization.Type, Categorization.Encoded> => Categorization)
      )
    ).annotations({
      description:
        "The child elements of this categorization which are either of type {@link Category} or {@link Categorization}.",
    }),
    ...Labeled.fields,
    ...Internationalizable.fields,
  },
  {
    schemaId: Symbol.for("@beep/ui/form/ui-schema/Categorization"),
    title: "Categorization",
    description:
      "The categorization element, which may have children elements. A child element may either be itself a Categorization or a Category, hence the categorization element can be used to represent recursive structures like trees.",
  }
) {}

export class UISchemaElement extends S.Union(
  BaseUISchemaElement,
  ControlElement,
  Layout,
  LabelElement,
  GroupLayout,
  Category,
  Categorization,
  VerticalLayout,
  HorizontalLayout
).annotations({
  schemaId: Symbol.for("@beep/ui/form/ui-schema/UISchemaElement"),
  title: "UI schema element",
  description: "The root element of a UI schema.",
}) {}

export namespace UISchemaElement {
  export type Type = S.Schema.Type<typeof UISchemaElement>;
  export type Encoded = S.Schema.Encoded<typeof UISchemaElement>;
}

export class ValidationFunctionContext extends BS.Class<ValidationFunctionContext>("ValidationFunctionContext")(
  {
    /** The resolved data scoped to the `ValidateFunctionCondition`'s scope. */
    data: S.Unknown.annotations({
      description: "The resolved data scoped to the `ValidateFunctionCondition`'s scope.",
    }),
    /** The full data of the form. */
    fullData: S.Unknown.annotations({
      description: "The full data of the form.",
    }),
    /** Optional instance path. Necessary when the actual data path can not be inferred via the scope alone as it is the case with nested controls. */
    path: S.optional(S.NonEmptyString).annotations({
      description:
        "Optional instance path. Necessary when the actual data path can not be inferred via the scope alone as it is the case with nested controls.",
    }),
    /** The `UISchemaElement` containing the rule that uses the ValidateFunctionCondition, e.g. a `ControlElement` */
    uiSchemaElement: S.suspend(() => UISchemaElement).annotations({
      description:
        "The `UISchemaElement` containing the rule that uses the ValidateFunctionCondition, e.g. a `ControlElement`",
    }),
  },
  {
    schemaId: Symbol.for("@beep/ui/form/ui-schema/ValidationFunctionContext"),
    title: "Validation function context",
    description: "The context object passed to a validation function.",
  }
) {}

export namespace ValidationFunctionContext {
  export type Type = S.Schema.Type<typeof ValidationFunctionContext>;
  export type Encoded = S.Schema.Encoded<typeof ValidationFunctionContext>;
}

const zValidationFunctionContext = z.readonly(
  z.custom<ValidationFunctionContext.Type>(S.is(ValidationFunctionContext))
);

const zValidationFunction = z.readonly(
  z.function({
    input: [zValidationFunctionContext],
    output: z.readonly(z.boolean()),
  })
);
/**
 * Validates whether the condition is fulfilled.
 *
 * @param data The data as resolved via the scope.
 * @returns `true` if the condition is fulfilled
 **/
export const ValidationFunction = S.declare(
  (i: unknown): i is z.infer<typeof zValidationFunction> => zValidationFunction.safeParse(i).success
).annotations({
  identifier: "ValidationFunction",
  schemaId: Symbol.for("@beep/ui/form/ui-schema/ValidationFunction"),
  title: "Validation function",
  description: "A validation function that takes a `ValidationFunctionContext` and returns a boolean.",
  documentation:
    "Validates whether the condition is fulfilled.\n\n@param data The data as resolved via the scope.\n@returns `true` if the condition is fulfilled",
});

export namespace ValidationFunction {
  export type Type = S.Schema.Type<typeof ValidationFunction>;
  export type Encoded = S.Schema.Encoded<typeof ValidationFunction>;
}

export type SchemaTypeUnion =
  | { readonly type: string } // BaseCondition
  | (Scoped.Type & { readonly type: "LEAF"; readonly expectedValue: UnsafeTypes.UnsafeAny }) // LeafCondition
  | (Scoped.Type & { readonly type: string; readonly schema: BS.JsonSchema.Type; readonly failWhenUndefined?: boolean }) // SchemaBasedCondition
  | { readonly type: string; readonly validate: ValidationFunction.Type } // ValidateFunctionCondition
  | { readonly type: string; readonly conditions: ReadonlyArray<SchemaTypeUnion> }
  | { readonly type: "OR"; readonly conditions: ReadonlyArray<SchemaTypeUnion> }
  | { readonly type: "AND"; readonly conditions: ReadonlyArray<SchemaTypeUnion> };

export type SchemaEncodedUnion =
  | { readonly type?: string }
  | (Scoped.Encoded & { readonly type?: "LEAF" | undefined })
  | (Scoped.Encoded & {
      readonly type?: string;
      readonly schema: BS.JsonSchema.Encoded;
      readonly failWhenUndefined?: boolean;
    })
  | { readonly type?: string; readonly validate: ValidationFunction.Encoded }
  | { readonly type?: string; readonly conditions: ReadonlyArray<SchemaEncodedUnion> }
  | { readonly type?: "OR"; readonly conditions: ReadonlyArray<SchemaEncodedUnion> }
  | { readonly type?: "AND"; readonly conditions: ReadonlyArray<SchemaEncodedUnion> };

/**
 * Represents a condition to be evaluated.
 */
export class BaseCondition extends BS.Class<BaseCondition>(`BaseCondition`)(
  {
    /**
     * The type of condition.
     */
    type: BS.toOptionalWithDefault(S.NonEmptyString)("BASE"),
  },
  [
    {
      schemaId: Symbol.for("@beep/ui/form/ui-schema/BaseCondition"),
      identifier: `BaseCondition`,
      title: "Base Condition",
      description: "Represents a condition to be evaluated.",
    },
  ]
) {
  static readonly is = S.is(BaseCondition);
}

export namespace BaseCondition {
  export type Type = {
    readonly type: string;
  };
  export type Encoded = {
    readonly type: string;
  };
}

/**
 * A leaf condition.
 */
export class LeafCondition extends BS.Class<LeafCondition>(`LeafCondition`)({
  type: BS.LiteralWithDefault("LEAF"),
  /**
   * The expected value when evaluating the condition
   */
  expectedValue: S.Any.annotations({
    description: "The expected value when evaluating the condition",
  }),
  ...Scoped.fields,
}) {
  static readonly is = S.is(LeafCondition);
}

export namespace LeafCondition {
  export type Type = Scoped.Type & {
    readonly type: "LEAF";
    readonly expectedValue: UnsafeTypes.UnsafeAny;
  };
  export type Encoded = Scoped.Encoded & {
    readonly type?: "LEAF" | undefined;
    readonly expectedValue: UnsafeTypes.UnsafeAny;
  };
}

export class SchemaBasedCondition extends BS.Class<SchemaBasedCondition>(`SchemaBasedCondition`)({
  type: S.NonEmptyString,
  schema: BS.JsonSchema,
  /**
   * When the scope resolves to undefined and `failWhenUndefined` is set to `true`, the condition
   * will fail. Therefore the reverse effect will be applied.
   *
   * Background:
   * Most JSON Schemas will successfully validate against `undefined` data. Specifying that a
   * condition shall fail when data is `undefined` requires to lift the scope to being able to use
   * JSON Schema's `required`.
   *
   * Using `failWhenUndefined` allows to more conveniently express this condition.
   */
  failWhenUndefined: S.optional(S.Boolean).annotations({
    description:
      "When the scope resolves to undefined and `failWhenUndefined` is set to `true`, the condition will fail. Therefore the reverse effect will be applied.",
    documentation: `Background:
Most JSON Schemas will successfully validate against \`undefined\` data. Specifying that a
condition shall fail when data is \`undefined\` requires to lift the scope to being able to use
JSON Schema's \`required\`.
Using \`failWhenUndefined\` allows to more conveniently express this condition.`,
  }),
  ...Scoped.fields,
}) {
  static readonly is = S.is(SchemaBasedCondition);
}

export namespace SchemaBasedCondition {
  export type Type = Scoped.Type & {
    readonly type: string;
    readonly schema: BS.JsonSchema.Type;
    readonly failWhenUndefined?: boolean;
  };
  export type Encoded = Scoped.Encoded & {
    readonly type?: string | undefined;
    readonly schema: BS.JsonSchema.Encoded;
    readonly failWhenUndefined?: boolean;
  };
}

/** A condition using a validation function to determine its fulfillment. */
export class ValidateFunctionCondition extends BS.Class<ValidateFunctionCondition>("ValidateFunctionCondition")(
  {
    type: S.NonEmptyString,
    /**
     * Validates whether the condition is fulfilled.
     *
     * @param data The data as resolved via the scope.
     * @returns `true` if the condition is fulfilled */
    validate: ValidationFunction,
  },
  {
    schemaId: Symbol.for("@beep/ui/form/ui-schema/ValidateFunctionCondition"),
    identifier: "ValidateFunctionCondition",
    title: "Validation function condition",
    description: "A condition using a validation function to determine its fulfillment.",
  }
) {}

export namespace ValidateFunctionCondition {
  export type Type = {
    readonly type: string;
    readonly validate: ValidationFunction.Type;
  };
  export type Encoded = {
    readonly type?: string | undefined;
    readonly validate: ValidationFunction.Encoded;
  };
}

/**
 * A composable condition.
 */
export class ComposableCondition extends BS.Class<ComposableCondition>("ComposableCondition")(
  {
    type: S.NonEmptyString,
    conditions: S.Array(S.suspend((): S.Schema<SchemaTypeUnion, SchemaEncodedUnion> => Condition)),
  },
  {
    schemaId: Symbol.for("@beep/ui/form/ui-schema/ComposableCondition"),
    identifier: "ComposableCondition",
    title: "Composable condition",
    description: "A composable condition.",
  }
) {
  static readonly is = S.is(ComposableCondition);
}

export namespace ComposableCondition {
  export type Type = {
    readonly type: string;
    readonly conditions: ReadonlyArray<Condition.Type>;
  };

  export type Encoded = {
    readonly type?: string | undefined;
    readonly conditions: ReadonlyArray<Condition.Encoded>;
  };
}

/**
 * An or condition.
 */
export class OrCondition extends ComposableCondition.extend<OrCondition>("OrCondition")(
  {
    type: BS.LiteralWithDefault("OR"),
  },
  {
    schemaId: Symbol.for("@beep/ui/form/ui-schema/OrCondition"),
    identifier: "OrCondition",
    title: "Or condition",
    description: "An or condition.",
  }
) {
  static readonly is = S.is(OrCondition);
}

export namespace OrCondition {
  export type Type = ComposableCondition.Type & {
    readonly type: "OR";
  };
  export type Encoded = ComposableCondition.Encoded & {
    readonly type?: "OR" | undefined;
  };
}

/**
 * An and condition.
 */
export class AndCondition extends ComposableCondition.extend<AndCondition>("AndCondition")(
  {
    type: BS.LiteralWithDefault("AND"),
  },
  {
    schemaId: Symbol.for("@beep/ui/form/ui-schema/AndCondition"),
    identifier: "AndCondition",
    title: "And condition",
    description: "An and condition.",
  }
) {
  static readonly is = S.is(AndCondition);
}

export namespace AndCondition {
  export type Type = ComposableCondition.Type & {
    readonly type: "AND";
  };
  export type Encoded = ComposableCondition.Encoded & {
    readonly type?: "AND" | undefined;
  };
}

/**
 * A union of all available conditions.
 */
export class Condition extends S.Union(
  BaseCondition,
  LeafCondition,
  OrCondition,
  AndCondition,
  SchemaBasedCondition,
  ValidateFunctionCondition
).annotations({
  schemaId: Symbol.for("@beep/ui/form/ui-schema/Condition"),
  identifier: "Condition",
  title: "Condition",
  description: "A union of all available conditions.",
}) {
  static readonly is = S.is(Condition);
}

export namespace Condition {
  export type Type =
    | BaseCondition.Type
    | LeafCondition.Type
    | OrCondition.Type
    | AndCondition.Type
    | SchemaBasedCondition.Type
    | ValidateFunctionCondition.Type;
  export type Encoded =
    | BaseCondition.Encoded
    | LeafCondition.Encoded
    | OrCondition.Encoded
    | AndCondition.Encoded
    | SchemaBasedCondition.Encoded
    | ValidateFunctionCondition.Encoded;
}
// SchemaEncodedUnion
// SchemaTypeUnion
export type ConditionSchema = S.Schema<SchemaTypeUnion, SchemaEncodedUnion>;
