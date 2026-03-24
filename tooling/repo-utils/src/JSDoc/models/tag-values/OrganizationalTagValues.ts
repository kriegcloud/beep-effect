/**
 * Organizational tag occurrence shapes.
 *
 * @category DomainModel
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { nameField, optionalDesc, optionalName, optionalType } from "./_fields.js";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/OrganizationalTagValues");

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class ModuleValue extends S.TaggedClass<ModuleValue>($I`ModuleValue`)(
  "module",
  { ...optionalType, ...optionalName },
  $I.annote("ModuleValue", {
    description: "Occurrence shape for @module — declares a module.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class NamespaceValue extends S.TaggedClass<NamespaceValue>($I`NamespaceValue`)(
  "namespace",
  { ...optionalType, ...optionalName },
  $I.annote("NamespaceValue", {
    description: "Occurrence shape for @namespace — declares a namespace.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class MemberofValue extends S.TaggedClass<MemberofValue>($I`MemberofValue`)(
  "memberof",
  { ...nameField },
  $I.annote("MemberofValue", {
    description: "Occurrence shape for @memberof — specifies parent membership.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class MemberValue extends S.TaggedClass<MemberValue>($I`MemberValue`)(
  "member",
  { ...optionalType, ...optionalName },
  $I.annote("MemberValue", {
    description: "Occurrence shape for @member — documents a member property.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class PropertyValue extends S.TaggedClass<PropertyValue>($I`PropertyValue`)(
  "property",
  { ...optionalType, ...nameField, ...optionalDesc },
  $I.annote("PropertyValue", {
    description: "Occurrence shape for @property — documents a property of an object.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class InterfaceValue extends S.TaggedClass<InterfaceValue>($I`InterfaceValue`)(
  "interface",
  { ...optionalName },
  $I.annote("InterfaceValue", {
    description: "Occurrence shape for @interface — marks a symbol as an interface.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class FunctionValue extends S.TaggedClass<FunctionValue>($I`FunctionValue`)(
  "function",
  { ...optionalName },
  $I.annote("FunctionValue", {
    description: "Occurrence shape for @function — marks a symbol as a function.",
  })
) {}
