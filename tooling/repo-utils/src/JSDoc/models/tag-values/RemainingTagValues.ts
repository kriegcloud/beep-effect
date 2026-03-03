/**
 * Remaining JSDoc tag occurrence shapes.
 *
 * @since 0.0.0
 * @category DomainModel
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { empty, nameField, optionalDesc, optionalName } from "./_fields.js";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/RemainingTagValues");

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class AliasValue extends S.TaggedClass<AliasValue>($I`AliasValue`)(
  "alias",
  { ...nameField },
  $I.annote("AliasValue", {
    description: "Occurrence shape for @alias — an alias name for the symbol.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class BorrowsValue extends S.TaggedClass<BorrowsValue>($I`BorrowsValue`)(
  "borrows",
  { ...nameField },
  $I.annote("BorrowsValue", {
    description: "Occurrence shape for @borrows — copies documentation from another symbol.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class ClassdescValue extends S.TaggedClass<ClassdescValue>($I`ClassdescValue`)(
  "classdesc",
  { ...optionalDesc },
  $I.annote("ClassdescValue", {
    description: "Occurrence shape for @classdesc — class-level description.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class ConstructsValue extends S.TaggedClass<ConstructsValue>($I`ConstructsValue`)(
  "constructs",
  { ...optionalName },
  $I.annote("ConstructsValue", {
    description: "Occurrence shape for @constructs — marks a function as a constructor.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class CopyrightValue extends S.TaggedClass<CopyrightValue>($I`CopyrightValue`)(
  "copyright",
  { ...optionalDesc },
  $I.annote("CopyrightValue", {
    description: "Occurrence shape for @copyright — copyright information.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class LicenseValue extends S.TaggedClass<LicenseValue>($I`LicenseValue`)(
  "license",
  { ...optionalDesc },
  $I.annote("LicenseValue", {
    description: "Occurrence shape for @license — license information.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class ExternalValue extends S.TaggedClass<ExternalValue>($I`ExternalValue`)(
  "external",
  { ...optionalName, ...optionalDesc },
  $I.annote("ExternalValue", {
    description: "Occurrence shape for @external — documents an external symbol.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class FileValue extends S.TaggedClass<FileValue>($I`FileValue`)(
  "file",
  { ...optionalDesc },
  $I.annote("FileValue", {
    description: "Occurrence shape for @file — file-level documentation.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class GlobalValue extends S.TaggedClass<GlobalValue>($I`GlobalValue`)(
  "global",
  empty,
  $I.annote("GlobalValue", {
    description: "Occurrence shape for @global — marks a symbol as global.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class HideconstructorValue extends S.TaggedClass<HideconstructorValue>($I`HideconstructorValue`)(
  "hideconstructor",
  empty,
  $I.annote("HideconstructorValue", {
    description: "Occurrence shape for @hideconstructor — hides the constructor from docs.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class IgnoreValue extends S.TaggedClass<IgnoreValue>($I`IgnoreValue`)(
  "ignore",
  empty,
  $I.annote("IgnoreValue", {
    description: "Occurrence shape for @ignore — excludes the symbol from documentation.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class InnerValue extends S.TaggedClass<InnerValue>($I`InnerValue`)(
  "inner",
  empty,
  $I.annote("InnerValue", {
    description: "Occurrence shape for @inner — marks a symbol as an inner member.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class InstanceValue extends S.TaggedClass<InstanceValue>($I`InstanceValue`)(
  "instance",
  empty,
  $I.annote("InstanceValue", {
    description: "Occurrence shape for @instance — marks a symbol as an instance member.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category DomainModel
 */
export class LendsValue extends S.TaggedClass<LendsValue>($I`LendsValue`)(
  "lends",
  { ...nameField },
  $I.annote("LendsValue", {
    description: "Occurrence shape for @lends — documents lending to another symbol.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class MixinValue extends S.TaggedClass<MixinValue>($I`MixinValue`)(
  "mixin",
  { ...optionalName },
  $I.annote("MixinValue", {
    description: "Occurrence shape for @mixin — marks a symbol as a mixin.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class MixesValue extends S.TaggedClass<MixesValue>($I`MixesValue`)(
  "mixes",
  { ...nameField },
  $I.annote("MixesValue", {
    description: "Occurrence shape for @mixes — documents mixin inclusion.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class NameValue extends S.TaggedClass<NameValue>($I`NameValue`)(
  "name",
  { ...nameField },
  $I.annote("NameValue", {
    description: "Occurrence shape for @name — overrides the documented name.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class VariationValue extends S.TaggedClass<VariationValue>($I`VariationValue`)(
  "variation",
  empty,
  $I.annote("VariationValue", {
    description: "Occurrence shape for @variation — distinguishes overloaded symbols.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class TutorialValue extends S.TaggedClass<TutorialValue>($I`TutorialValue`)(
  "tutorial",
  { ...nameField },
  $I.annote("TutorialValue", {
    description: "Occurrence shape for @tutorial — links to a tutorial.",
  })
) {}
