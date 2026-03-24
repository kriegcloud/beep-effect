/**
 * Structural tag occurrence shapes (AST-derivable).
 *
 * @category DomainModel
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { empty, nameField, optionalDesc, optionalName, optionalType, typeField } from "./_fields.js";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/StructuralTagValues");

/**
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
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
 * @category DomainModel
 * @since 0.0.0
 */
export class YieldsValue extends S.TaggedClass<YieldsValue>($I`YieldsValue`)(
  "yields",
  { ...optionalType, ...optionalDesc },
  $I.annote("YieldsValue", {
    description: "Occurrence shape for @yields — documents a generator's yield value.",
  })
) {}
