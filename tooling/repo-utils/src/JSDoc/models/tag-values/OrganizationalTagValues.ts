/**
 * Organizational tag occurrence shapes.
 *
 * @packageDocumentation
 * @category models
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { nameField, optionalDesc, optionalName, optionalType } from "./_fields.js";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/OrganizationalTagValues");

/**
 * @example
 * ```ts
 * import { ModuleValue } from "@beep/repo-utils/JSDoc/models/tag-values/OrganizationalTagValues"
 * void ModuleValue
 * ```
 * @category models
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
 * @example
 * ```ts
 * import { NamespaceValue } from "@beep/repo-utils/JSDoc/models/tag-values/OrganizationalTagValues"
 * void NamespaceValue
 * ```
 * @category models
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
 * @example
 * ```ts
 * import { MemberofValue } from "@beep/repo-utils/JSDoc/models/tag-values/OrganizationalTagValues"
 * void MemberofValue
 * ```
 * @category models
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
 * @example
 * ```ts
 * import { MemberValue } from "@beep/repo-utils/JSDoc/models/tag-values/OrganizationalTagValues"
 * void MemberValue
 * ```
 * @category models
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
 * @example
 * ```ts
 * import { PropertyValue } from "@beep/repo-utils/JSDoc/models/tag-values/OrganizationalTagValues"
 * void PropertyValue
 * ```
 * @category models
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
 * @example
 * ```ts
 * import { InterfaceValue } from "@beep/repo-utils/JSDoc/models/tag-values/OrganizationalTagValues"
 * void InterfaceValue
 * ```
 * @category models
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
 * @example
 * ```ts
 * import { FunctionValue } from "@beep/repo-utils/JSDoc/models/tag-values/OrganizationalTagValues"
 * void FunctionValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class FunctionValue extends S.TaggedClass<FunctionValue>($I`FunctionValue`)(
  "function",
  { ...optionalName },
  $I.annote("FunctionValue", {
    description: "Occurrence shape for @function — marks a symbol as a function.",
  })
) {}
