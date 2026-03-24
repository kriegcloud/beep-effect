/**
 * Remaining JSDoc tag occurrence shapes.
 *
 * @category DomainModel
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { empty, nameField, optionalDesc, optionalName } from "./_fields.js";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/RemainingTagValues");

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class AliasValue extends S.TaggedClass<AliasValue>($I`AliasValue`)(
  "alias",
  { ...nameField },
  $I.annote("AliasValue", {
    description: "Occurrence shape for @alias — an alias name for the symbol.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class BorrowsValue extends S.TaggedClass<BorrowsValue>($I`BorrowsValue`)(
  "borrows",
  { ...nameField },
  $I.annote("BorrowsValue", {
    description: "Occurrence shape for @borrows — copies documentation from another symbol.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class ClassdescValue extends S.TaggedClass<ClassdescValue>($I`ClassdescValue`)(
  "classdesc",
  { ...optionalDesc },
  $I.annote("ClassdescValue", {
    description: "Occurrence shape for @classdesc — class-level description.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class ConstructsValue extends S.TaggedClass<ConstructsValue>($I`ConstructsValue`)(
  "constructs",
  { ...optionalName },
  $I.annote("ConstructsValue", {
    description: "Occurrence shape for @constructs — marks a function as a constructor.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class CopyrightValue extends S.TaggedClass<CopyrightValue>($I`CopyrightValue`)(
  "copyright",
  { ...optionalDesc },
  $I.annote("CopyrightValue", {
    description: "Occurrence shape for @copyright — copyright information.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class LicenseValue extends S.TaggedClass<LicenseValue>($I`LicenseValue`)(
  "license",
  { ...optionalDesc },
  $I.annote("LicenseValue", {
    description: "Occurrence shape for @license — license information.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class ExternalValue extends S.TaggedClass<ExternalValue>($I`ExternalValue`)(
  "external",
  { ...optionalName, ...optionalDesc },
  $I.annote("ExternalValue", {
    description: "Occurrence shape for @external — documents an external symbol.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class FileValue extends S.TaggedClass<FileValue>($I`FileValue`)(
  "file",
  { ...optionalDesc },
  $I.annote("FileValue", {
    description: "Occurrence shape for @file — file-level documentation.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class GlobalValue extends S.TaggedClass<GlobalValue>($I`GlobalValue`)(
  "global",
  empty,
  $I.annote("GlobalValue", {
    description: "Occurrence shape for @global — marks a symbol as global.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class HideconstructorValue extends S.TaggedClass<HideconstructorValue>($I`HideconstructorValue`)(
  "hideconstructor",
  empty,
  $I.annote("HideconstructorValue", {
    description: "Occurrence shape for @hideconstructor — hides the constructor from docs.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class IgnoreValue extends S.TaggedClass<IgnoreValue>($I`IgnoreValue`)(
  "ignore",
  empty,
  $I.annote("IgnoreValue", {
    description: "Occurrence shape for @ignore — excludes the symbol from documentation.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class InnerValue extends S.TaggedClass<InnerValue>($I`InnerValue`)(
  "inner",
  empty,
  $I.annote("InnerValue", {
    description: "Occurrence shape for @inner — marks a symbol as an inner member.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class InstanceValue extends S.TaggedClass<InstanceValue>($I`InstanceValue`)(
  "instance",
  empty,
  $I.annote("InstanceValue", {
    description: "Occurrence shape for @instance — marks a symbol as an instance member.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class KindValue extends S.TaggedClass<KindValue>($I`KindValue`)(
  "kind",
  {
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
  },
  $I.annote("KindValue", {
    description: "Occurrence shape for @kind — specifies the kind of symbol.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class LendsValue extends S.TaggedClass<LendsValue>($I`LendsValue`)(
  "lends",
  { ...nameField },
  $I.annote("LendsValue", {
    description: "Occurrence shape for @lends — documents lending to another symbol.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class MixinValue extends S.TaggedClass<MixinValue>($I`MixinValue`)(
  "mixin",
  { ...optionalName },
  $I.annote("MixinValue", {
    description: "Occurrence shape for @mixin — marks a symbol as a mixin.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class MixesValue extends S.TaggedClass<MixesValue>($I`MixesValue`)(
  "mixes",
  { ...nameField },
  $I.annote("MixesValue", {
    description: "Occurrence shape for @mixes — documents mixin inclusion.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class NameValue extends S.TaggedClass<NameValue>($I`NameValue`)(
  "name",
  { ...nameField },
  $I.annote("NameValue", {
    description: "Occurrence shape for @name — overrides the documented name.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class VariationValue extends S.TaggedClass<VariationValue>($I`VariationValue`)(
  "variation",
  empty,
  $I.annote("VariationValue", {
    description: "Occurrence shape for @variation — distinguishes overloaded symbols.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class TutorialValue extends S.TaggedClass<TutorialValue>($I`TutorialValue`)(
  "tutorial",
  { ...nameField },
  $I.annote("TutorialValue", {
    description: "Occurrence shape for @tutorial — links to a tutorial.",
  })
) {}
