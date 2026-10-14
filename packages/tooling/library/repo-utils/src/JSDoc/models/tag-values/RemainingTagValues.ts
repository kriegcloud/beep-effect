/**
 * Remaining JSDoc tag occurrence shapes.
 *
 * @packageDocumentation
 * @category models
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { empty, nameField, optionalDesc, optionalName } from "./_fields.ts";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/RemainingTagValues");

/**
 * Schema-backed value for a parsed `alias` tag occurrence: an alias name for the symbol.
 *
 * **Example** (Creating alias tag value)
 *
 * ```ts
 * import { AliasValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * const tag = AliasValue.make({ name: "parse" })
 * const tagName: "alias" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class AliasValue extends S.Opaque<AliasValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("alias", { ...nameField }).pipe(
    $I.annoteSchema("AliasValue", {
      description: "Occurrence shape for @alias — an alias name for the symbol.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `borrows` tag occurrence: copies documentation from another symbol.
 *
 * **Example** (Creating borrows tag value)
 *
 * ```ts
 * import { BorrowsValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * const tag = BorrowsValue.make({ name: "Base#parse" })
 * const tagName: "borrows" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class BorrowsValue extends S.Opaque<BorrowsValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("borrows", { ...nameField }).pipe(
    $I.annoteSchema("BorrowsValue", {
      description: "Occurrence shape for @borrows — copies documentation from another symbol.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `classdesc` tag occurrence: class-level description.
 *
 * **Example** (Creating classdesc tag value)
 *
 * ```ts
 * import { ClassdescValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * const tag = ClassdescValue.make({ description: "Coordinates parsed tag metadata." })
 * const tagName: "classdesc" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ClassdescValue extends S.Opaque<ClassdescValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("classdesc", { ...optionalDesc }).pipe(
    $I.annoteSchema("ClassdescValue", {
      description: "Occurrence shape for @classdesc — class-level description.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `constructs` tag occurrence: marks a function as a constructor.
 *
 * **Example** (Creating constructs tag value)
 *
 * ```ts
 * import { ConstructsValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * const tag = ConstructsValue.make({ name: "Parser" })
 * const tagName: "constructs" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ConstructsValue extends S.Opaque<ConstructsValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("constructs", { ...optionalName }).pipe(
    $I.annoteSchema("ConstructsValue", {
      description: "Occurrence shape for @constructs — marks a function as a constructor.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `copyright` tag occurrence: copyright information.
 *
 * **Example** (Creating copyright tag value)
 *
 * ```ts
 * import { CopyrightValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * const tag = CopyrightValue.make({ description: "Copyright 2026 Beep" })
 * const tagName: "copyright" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CopyrightValue extends S.Opaque<CopyrightValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("copyright", { ...optionalDesc }).pipe(
    $I.annoteSchema("CopyrightValue", {
      description: "Occurrence shape for @copyright — copyright information.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `license` tag occurrence: license information.
 *
 * **Example** (Creating license tag value)
 *
 * ```ts
 * import { LicenseValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * const tag = LicenseValue.make({ description: "Apache-2.0" })
 * const tagName: "license" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class LicenseValue extends S.Opaque<LicenseValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("license", { ...optionalDesc }).pipe(
    $I.annoteSchema("LicenseValue", {
      description: "Occurrence shape for @license — license information.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `external` tag occurrence: documents an external symbol.
 *
 * **Example** (Creating external tag value)
 *
 * ```ts
 * import { ExternalValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * const tag = ExternalValue.make({
 *   name: "external:Package",
 *   description: "Parsed tag text."
 * })
 * const tagName: "external" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ExternalValue extends S.Opaque<ExternalValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("external", { ...optionalName, ...optionalDesc }).pipe(
    $I.annoteSchema("ExternalValue", {
      description: "Occurrence shape for @external — documents an external symbol.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `file` tag occurrence: file-level documentation.
 *
 * **Example** (Creating file tag value)
 *
 * ```ts
 * import { FileValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * const tag = FileValue.make({ description: "Package entry point." })
 * const tagName: "file" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FileValue extends S.Opaque<FileValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("file", { ...optionalDesc }).pipe(
    $I.annoteSchema("FileValue", {
      description: "Occurrence shape for @file — file-level documentation.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `global` tag occurrence: marks a symbol as global.
 *
 * **Example** (Creating global tag value)
 *
 * ```ts
 * import { GlobalValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * const tag = GlobalValue.make({})
 * const tagName: "global" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class GlobalValue extends S.Opaque<GlobalValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("global", empty).pipe(
    $I.annoteSchema("GlobalValue", {
      description: "Occurrence shape for @global — marks a symbol as global.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `hideconstructor` tag occurrence: hides the constructor from docs.
 *
 * **Example** (Creating hideconstructor tag value)
 *
 * ```ts
 * import { HideconstructorValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * const tag = HideconstructorValue.make({})
 * const tagName: "hideconstructor" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class HideconstructorValue extends S.Opaque<HideconstructorValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("hideconstructor", empty).pipe(
    $I.annoteSchema("HideconstructorValue", {
      description: "Occurrence shape for @hideconstructor — hides the constructor from docs.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `ignore` tag occurrence: excludes the symbol from documentation.
 *
 * **Example** (Creating ignore tag value)
 *
 * ```ts
 * import { IgnoreValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * const tag = IgnoreValue.make({})
 * const tagName: "ignore" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class IgnoreValue extends S.Opaque<IgnoreValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("ignore", empty).pipe(
    $I.annoteSchema("IgnoreValue", {
      description: "Occurrence shape for @ignore — excludes the symbol from documentation.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `inner` tag occurrence: marks a symbol as an inner member.
 *
 * **Example** (Creating inner tag value)
 *
 * ```ts
 * import { InnerValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * const tag = InnerValue.make({})
 * const tagName: "inner" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class InnerValue extends S.Opaque<InnerValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("inner", empty).pipe(
    $I.annoteSchema("InnerValue", {
      description: "Occurrence shape for @inner — marks a symbol as an inner member.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `instance` tag occurrence: marks a symbol as an instance member.
 *
 * **Example** (Creating instance tag value)
 *
 * ```ts
 * import { InstanceValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * const tag = InstanceValue.make({})
 * const tagName: "instance" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class InstanceValue extends S.Opaque<InstanceValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("instance", empty).pipe(
    $I.annoteSchema("InstanceValue", {
      description: "Occurrence shape for @instance — marks a symbol as an instance member.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `kind` tag occurrence: specifies the kind of symbol.
 *
 * **Example** (Creating kind tag value)
 *
 * ```ts
 * import { KindValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * const tag = KindValue.make({ kindValue: "function" })
 * const tagName: "kind" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class KindValue extends S.Opaque<KindValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("kind", {
    kindValue: S.Literals([
      "class",
      "constant",
      "event",
      "external",
      "file",
      "function",
      "member",
      "mixin",
      "module",
      "namespace",
      "typedef",
    ]),
  }).pipe(
    $I.annoteSchema("KindValue", {
      description: "Occurrence shape for @kind — specifies the kind of symbol.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `lends` tag occurrence: documents lending to another symbol.
 *
 * **Example** (Creating lends tag value)
 *
 * ```ts
 * import { LendsValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * const tag = LendsValue.make({ name: "Parser.prototype" })
 * const tagName: "lends" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class LendsValue extends S.Opaque<LendsValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("lends", { ...nameField }).pipe(
    $I.annoteSchema("LendsValue", {
      description: "Occurrence shape for @lends — documents lending to another symbol.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `mixin` tag occurrence: marks a symbol as a mixin.
 *
 * **Example** (Creating mixin tag value)
 *
 * ```ts
 * import { MixinValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * const tag = MixinValue.make({ name: "Disposable" })
 * const tagName: "mixin" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class MixinValue extends S.Opaque<MixinValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("mixin", { ...optionalName }).pipe(
    $I.annoteSchema("MixinValue", {
      description: "Occurrence shape for @mixin — marks a symbol as a mixin.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `mixes` tag occurrence: documents mixin inclusion.
 *
 * **Example** (Creating mixes tag value)
 *
 * ```ts
 * import { MixesValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * const tag = MixesValue.make({ name: "Disposable" })
 * const tagName: "mixes" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class MixesValue extends S.Opaque<MixesValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("mixes", { ...nameField }).pipe(
    $I.annoteSchema("MixesValue", {
      description: "Occurrence shape for @mixes — documents mixin inclusion.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `name` tag occurrence: overrides the documented name.
 *
 * **Example** (Creating name tag value)
 *
 * ```ts
 * import { NameValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * const tag = NameValue.make({ name: "parseTag" })
 * const tagName: "name" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class NameValue extends S.Opaque<NameValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("name", { ...nameField }).pipe(
    $I.annoteSchema("NameValue", {
      description: "Occurrence shape for @name — overrides the documented name.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `variation` tag occurrence: distinguishes overloaded symbols.
 *
 * **Example** (Creating variation tag value)
 *
 * ```ts
 * import { VariationValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * const tag = VariationValue.make({})
 * const tagName: "variation" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class VariationValue extends S.Opaque<VariationValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("variation", empty).pipe(
    $I.annoteSchema("VariationValue", {
      description: "Occurrence shape for @variation — distinguishes overloaded symbols.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `tutorial` tag occurrence: links to a tutorial.
 *
 * **Example** (Creating tutorial tag value)
 *
 * ```ts
 * import { TutorialValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * const tag = TutorialValue.make({ name: "getting-started" })
 * const tagName: "tutorial" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TutorialValue extends S.Opaque<TutorialValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("tutorial", { ...nameField }).pipe(
    $I.annoteSchema("TutorialValue", {
      description: "Occurrence shape for @tutorial — links to a tutorial.",
    })
  )
) {}
