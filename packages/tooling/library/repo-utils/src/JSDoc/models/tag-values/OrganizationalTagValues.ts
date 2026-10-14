/**
 * Organizational tag occurrence shapes.
 *
 * @packageDocumentation
 * @category models
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { nameField, optionalDesc, optionalName, optionalType } from "./_fields.ts";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/OrganizationalTagValues");

/**
 * Schema-backed value for a parsed `module` tag occurrence: declares a module.
 *
 * **Example** (Creating a module tag)
 *
 * ```ts
 * import { ModuleValue } from "@beep/repo-utils/JSDoc/models/tag-values/OrganizationalTagValues"
 *
 * const tag = ModuleValue.make({
 *   type: "module",
 *   name: "@beep/repo-utils"
 * })
 * const tagName: "module" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ModuleValue extends S.Opaque<ModuleValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("module", { ...optionalType, ...optionalName }).pipe(
    $I.annoteSchema("ModuleValue", {
      description: "Occurrence shape for @module — declares a module.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `namespace` tag occurrence: declares a namespace.
 *
 * **Example** (Creating a namespace tag)
 *
 * ```ts
 * import { NamespaceValue } from "@beep/repo-utils/JSDoc/models/tag-values/OrganizationalTagValues"
 *
 * const tag = NamespaceValue.make({
 *   type: "namespace",
 *   name: "RepoUtils"
 * })
 * const tagName: "namespace" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class NamespaceValue extends S.Opaque<NamespaceValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("namespace", { ...optionalType, ...optionalName }).pipe(
    $I.annoteSchema("NamespaceValue", {
      description: "Occurrence shape for @namespace — declares a namespace.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `memberof` tag occurrence: specifies parent membership.
 *
 * **Example** (Creating a memberof tag)
 *
 * ```ts
 * import { MemberofValue } from "@beep/repo-utils/JSDoc/models/tag-values/OrganizationalTagValues"
 *
 * const tag = MemberofValue.make({ name: "RepoUtils.JSDoc" })
 * const tagName: "memberof" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class MemberofValue extends S.Opaque<MemberofValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("memberof", { ...nameField }).pipe(
    $I.annoteSchema("MemberofValue", {
      description: "Occurrence shape for @memberof — specifies parent membership.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `member` tag occurrence: documents a member property.
 *
 * **Example** (Creating a member tag)
 *
 * ```ts
 * import { MemberValue } from "@beep/repo-utils/JSDoc/models/tag-values/OrganizationalTagValues"
 *
 * const tag = MemberValue.make({
 *   type: "string",
 *   name: "config"
 * })
 * const tagName: "member" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class MemberValue extends S.Opaque<MemberValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("member", { ...optionalType, ...optionalName }).pipe(
    $I.annoteSchema("MemberValue", {
      description: "Occurrence shape for @member — documents a member property.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `property` tag occurrence: documents a property of an object.
 *
 * **Example** (Creating a property tag)
 *
 * ```ts
 * import { PropertyValue } from "@beep/repo-utils/JSDoc/models/tag-values/OrganizationalTagValues"
 *
 * const tag = PropertyValue.make({
 *   type: "number",
 *   name: "options.timeout",
 *   description: "Parsed tag text."
 * })
 * const tagName: "property" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PropertyValue extends S.Opaque<PropertyValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("property", { ...optionalType, ...nameField, ...optionalDesc }).pipe(
    $I.annoteSchema("PropertyValue", {
      description: "Occurrence shape for @property — documents a property of an object.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `interface` tag occurrence: marks a symbol as an interface.
 *
 * **Example** (Creating an interface tag)
 *
 * ```ts
 * import { InterfaceValue } from "@beep/repo-utils/JSDoc/models/tag-values/OrganizationalTagValues"
 *
 * const tag = InterfaceValue.make({ name: "Readable" })
 * const tagName: "interface" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class InterfaceValue extends S.Opaque<InterfaceValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("interface", { ...optionalName }).pipe(
    $I.annoteSchema("InterfaceValue", {
      description: "Occurrence shape for @interface — marks a symbol as an interface.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `function` tag occurrence: marks a symbol as a function.
 *
 * **Example** (Creating a function tag)
 *
 * ```ts
 * import { FunctionValue } from "@beep/repo-utils/JSDoc/models/tag-values/OrganizationalTagValues"
 *
 * const tag = FunctionValue.make({ name: "parseTag" })
 * const tagName: "function" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FunctionValue extends S.Opaque<FunctionValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("function", { ...optionalName }).pipe(
    $I.annoteSchema("FunctionValue", {
      description: "Occurrence shape for @function — marks a symbol as a function.",
    })
  )
) {}
