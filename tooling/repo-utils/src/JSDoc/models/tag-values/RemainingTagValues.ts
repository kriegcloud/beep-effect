/**
 * Remaining JSDoc tag occurrence shapes.
 *
 * @category models
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { empty, nameField, optionalDesc, optionalName } from "./_fields.js";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/RemainingTagValues");

/**
 *
 * @example
 * ```ts
 * import { AliasValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * void AliasValue
 * ```
 *
 * @category models
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
 *
 * @example
 * ```ts
 * import { BorrowsValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * void BorrowsValue
 * ```
 *
 * @category models
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
 *
 * @example
 * ```ts
 * import { ClassdescValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * void ClassdescValue
 * ```
 *
 * @category models
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
 *
 * @example
 * ```ts
 * import { ConstructsValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * void ConstructsValue
 * ```
 *
 * @category models
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
 *
 * @example
 * ```ts
 * import { CopyrightValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * void CopyrightValue
 * ```
 *
 * @category models
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
 *
 * @example
 * ```ts
 * import { LicenseValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * void LicenseValue
 * ```
 *
 * @category models
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
 *
 * @example
 * ```ts
 * import { ExternalValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * void ExternalValue
 * ```
 *
 * @category models
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
 *
 * @example
 * ```ts
 * import { FileValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * void FileValue
 * ```
 *
 * @category models
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
 *
 * @example
 * ```ts
 * import { GlobalValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * void GlobalValue
 * ```
 *
 * @category models
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
 *
 * @example
 * ```ts
 * import { HideconstructorValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * void HideconstructorValue
 * ```
 *
 * @category models
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
 *
 * @example
 * ```ts
 * import { IgnoreValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * void IgnoreValue
 * ```
 *
 * @category models
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
 *
 * @example
 * ```ts
 * import { InnerValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * void InnerValue
 * ```
 *
 * @category models
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
 *
 * @example
 * ```ts
 * import { InstanceValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * void InstanceValue
 * ```
 *
 * @category models
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
 *
 * @example
 * ```ts
 * import { KindValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * void KindValue
 * ```
 *
 * @category models
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
 *
 * @example
 * ```ts
 * import { LendsValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * void LendsValue
 * ```
 *
 * @category models
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
 *
 * @example
 * ```ts
 * import { MixinValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * void MixinValue
 * ```
 *
 * @category models
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
 *
 * @example
 * ```ts
 * import { MixesValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * void MixesValue
 * ```
 *
 * @category models
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
 *
 * @example
 * ```ts
 * import { NameValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * void NameValue
 * ```
 *
 * @category models
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
 *
 * @example
 * ```ts
 * import { VariationValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * void VariationValue
 * ```
 *
 * @category models
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
 *
 * @example
 * ```ts
 * import { TutorialValue } from "@beep/repo-utils/JSDoc/models/tag-values/RemainingTagValues"
 *
 * void TutorialValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TutorialValue extends S.TaggedClass<TutorialValue>($I`TutorialValue`)(
  "tutorial",
  { ...nameField },
  $I.annote("TutorialValue", {
    description: "Occurrence shape for @tutorial — links to a tutorial.",
  })
) {}
