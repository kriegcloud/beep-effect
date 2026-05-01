/**
 * Structural tag occurrence shapes (AST-derivable).
 *
 * @packageDocumentation
 * @category models
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { empty, nameField, optionalDesc, optionalName, optionalType, typeField } from "./_fields.js";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/StructuralTagValues");

/**
 * @example
 * ```ts
 * import { ParamValue } from "@beep/repo-utils/JSDoc/models/tag-values/StructuralTagValues"
 * void ParamValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class ParamValue extends S.TaggedClass<ParamValue>($I`ParamValue`)(
  "param",
  { ...optionalType, ...nameField, ...optionalDesc },
  $I.annote("ParamValue", {
    description: "Occurrence shape for @param — documents a function parameter.",
  })
) {}

/**
 * @example
 * ```ts
 * import { ReturnsValue } from "@beep/repo-utils/JSDoc/models/tag-values/StructuralTagValues"
 * void ReturnsValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class ReturnsValue extends S.TaggedClass<ReturnsValue>($I`ReturnsValue`)(
  "returns",
  { ...optionalType, ...optionalDesc },
  $I.annote("ReturnsValue", {
    description: "Occurrence shape for @returns — documents the return value.",
  })
) {}

/**
 * @example
 * ```ts
 * import { ThrowsValue } from "@beep/repo-utils/JSDoc/models/tag-values/StructuralTagValues"
 * void ThrowsValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class ThrowsValue extends S.TaggedClass<ThrowsValue>($I`ThrowsValue`)(
  "throws",
  { ...optionalType, ...optionalDesc },
  $I.annote("ThrowsValue", {
    description: "Occurrence shape for @throws — documents an exception a function may throw.",
  })
) {}

/**
 * @example
 * ```ts
 * import { TemplateValue } from "@beep/repo-utils/JSDoc/models/tag-values/StructuralTagValues"
 * void TemplateValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class TemplateValue extends S.TaggedClass<TemplateValue>($I`TemplateValue`)(
  "template",
  { ...optionalType, ...nameField, ...optionalDesc },
  $I.annote("TemplateValue", {
    description: "Occurrence shape for @template — documents a type parameter.",
  })
) {}

/**
 * @example
 * ```ts
 * import { TypeParamValue } from "@beep/repo-utils/JSDoc/models/tag-values/StructuralTagValues"
 * void TypeParamValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class TypeParamValue extends S.TaggedClass<TypeParamValue>($I`TypeParamValue`)(
  "typeParam",
  { ...optionalType, ...nameField, ...optionalDesc },
  $I.annote("TypeParamValue", {
    description: "Occurrence shape for @typeParam — TSDoc type parameter documentation.",
  })
) {}

/**
 * @example
 * ```ts
 * import { TypeValue } from "@beep/repo-utils/JSDoc/models/tag-values/StructuralTagValues"
 * void TypeValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class TypeValue extends S.TaggedClass<TypeValue>($I`TypeValue`)(
  "type",
  { ...typeField },
  $I.annote("TypeValue", {
    description: "Occurrence shape for @type — specifies a type annotation.",
  })
) {}

/**
 * @example
 * ```ts
 * import { TypedefValue } from "@beep/repo-utils/JSDoc/models/tag-values/StructuralTagValues"
 * void TypedefValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class TypedefValue extends S.TaggedClass<TypedefValue>($I`TypedefValue`)(
  "typedef",
  { ...optionalType, ...optionalName, ...optionalDesc },
  $I.annote("TypedefValue", {
    description: "Occurrence shape for @typedef — defines a custom type.",
  })
) {}

/**
 * @example
 * ```ts
 * import { CallbackValue } from "@beep/repo-utils/JSDoc/models/tag-values/StructuralTagValues"
 * void CallbackValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class CallbackValue extends S.TaggedClass<CallbackValue>($I`CallbackValue`)(
  "callback",
  { ...optionalName, ...optionalDesc },
  $I.annote("CallbackValue", {
    description: "Occurrence shape for @callback — documents a callback function type.",
  })
) {}

/**
 * @example
 * ```ts
 * import { AugmentsValue } from "@beep/repo-utils/JSDoc/models/tag-values/StructuralTagValues"
 * void AugmentsValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class AugmentsValue extends S.TaggedClass<AugmentsValue>($I`AugmentsValue`)(
  "augments",
  { ...optionalType },
  $I.annote("AugmentsValue", {
    description: "Occurrence shape for @augments — indicates a class extends another.",
  })
) {}

/**
 * @example
 * ```ts
 * import { ImplementsValue } from "@beep/repo-utils/JSDoc/models/tag-values/StructuralTagValues"
 * void ImplementsValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class ImplementsValue extends S.TaggedClass<ImplementsValue>($I`ImplementsValue`)(
  "implements",
  { ...optionalType },
  $I.annote("ImplementsValue", {
    description: "Occurrence shape for @implements — indicates interface implementation.",
  })
) {}

/**
 * @example
 * ```ts
 * import { ClassValue } from "@beep/repo-utils/JSDoc/models/tag-values/StructuralTagValues"
 * void ClassValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class ClassValue extends S.TaggedClass<ClassValue>($I`ClassValue`)(
  "class",
  { ...optionalName, ...optionalDesc },
  $I.annote("ClassValue", {
    description: "Occurrence shape for @class — marks a function as a constructor.",
  })
) {}

/**
 * @example
 * ```ts
 * import { EnumValue } from "@beep/repo-utils/JSDoc/models/tag-values/StructuralTagValues"
 * void EnumValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class EnumValue extends S.TaggedClass<EnumValue>($I`EnumValue`)(
  "enum",
  { ...optionalType },
  $I.annote("EnumValue", {
    description: "Occurrence shape for @enum — documents an enum-like object.",
  })
) {}

/**
 * @example
 * ```ts
 * import { AsyncValue } from "@beep/repo-utils/JSDoc/models/tag-values/StructuralTagValues"
 * void AsyncValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class AsyncValue extends S.TaggedClass<AsyncValue>($I`AsyncValue`)(
  "async",
  empty,
  $I.annote("AsyncValue", {
    description: "Occurrence shape for @async — marks a function as asynchronous.",
  })
) {}

/**
 * @example
 * ```ts
 * import { GeneratorValue } from "@beep/repo-utils/JSDoc/models/tag-values/StructuralTagValues"
 * void GeneratorValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class GeneratorValue extends S.TaggedClass<GeneratorValue>($I`GeneratorValue`)(
  "generator",
  empty,
  $I.annote("GeneratorValue", {
    description: "Occurrence shape for @generator — marks a function as a generator.",
  })
) {}

/**
 * @example
 * ```ts
 * import { YieldsValue } from "@beep/repo-utils/JSDoc/models/tag-values/StructuralTagValues"
 * void YieldsValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class YieldsValue extends S.TaggedClass<YieldsValue>($I`YieldsValue`)(
  "yields",
  { ...optionalType, ...optionalDesc },
  $I.annote("YieldsValue", {
    description: "Occurrence shape for @yields — documents a generator's yield value.",
  })
) {}
