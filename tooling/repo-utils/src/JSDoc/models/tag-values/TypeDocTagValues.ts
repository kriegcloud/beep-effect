/**
 * TypeDoc-specific tag occurrence shapes.
 *
 * @category models
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { TSCategoryTag } from "../TSCategory.model.js";
import { empty, nameField } from "./_fields.js";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/TypeDocTagValues");

/**
 *
 * @example
 * ```ts
 * import { CategoryValue } from "@beep/repo-utils/JSDoc/models/tag-values/TypeDocTagValues"
 *
 * void CategoryValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CategoryValue extends S.TaggedClass<CategoryValue>($I`CategoryValue`)(
  "category",
  { name: TSCategoryTag },
  $I.annote("CategoryValue", {
    description: "Occurrence shape for @category — assigns a documentation category.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { DocumentValue } from "@beep/repo-utils/JSDoc/models/tag-values/TypeDocTagValues"
 *
 * void DocumentValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DocumentValue extends S.TaggedClass<DocumentValue>($I`DocumentValue`)(
  "document",
  empty,
  $I.annote("DocumentValue", {
    description: "Occurrence shape for @document — marks for documentation generation.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { GroupValue } from "@beep/repo-utils/JSDoc/models/tag-values/TypeDocTagValues"
 *
 * void GroupValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class GroupValue extends S.TaggedClass<GroupValue>($I`GroupValue`)(
  "group",
  { ...nameField },
  $I.annote("GroupValue", {
    description: "Occurrence shape for @group — assigns a documentation group.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { HiddenValue } from "@beep/repo-utils/JSDoc/models/tag-values/TypeDocTagValues"
 *
 * void HiddenValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class HiddenValue extends S.TaggedClass<HiddenValue>($I`HiddenValue`)(
  "hidden",
  empty,
  $I.annote("HiddenValue", {
    description: "Occurrence shape for @hidden — hides the symbol from documentation.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { ExpandValue } from "@beep/repo-utils/JSDoc/models/tag-values/TypeDocTagValues"
 *
 * void ExpandValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ExpandValue extends S.TaggedClass<ExpandValue>($I`ExpandValue`)(
  "expand",
  empty,
  $I.annote("ExpandValue", {
    description: "Occurrence shape for @expand — expands type aliases in documentation.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { InlineValue } from "@beep/repo-utils/JSDoc/models/tag-values/TypeDocTagValues"
 *
 * void InlineValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class InlineValue extends S.TaggedClass<InlineValue>($I`InlineValue`)(
  "inline",
  empty,
  $I.annote("InlineValue", {
    description: "Occurrence shape for @inline — inlines a type in documentation.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { MergeModuleWithValue } from "@beep/repo-utils/JSDoc/models/tag-values/TypeDocTagValues"
 *
 * void MergeModuleWithValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class MergeModuleWithValue extends S.TaggedClass<MergeModuleWithValue>($I`MergeModuleWithValue`)(
  "mergeModuleWith",
  { ...nameField },
  $I.annote("MergeModuleWithValue", {
    description: "Occurrence shape for @mergeModuleWith — merges module documentation.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { PrimaryExportValue } from "@beep/repo-utils/JSDoc/models/tag-values/TypeDocTagValues"
 *
 * void PrimaryExportValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PrimaryExportValue extends S.TaggedClass<PrimaryExportValue>($I`PrimaryExportValue`)(
  "primaryExport",
  empty,
  $I.annote("PrimaryExportValue", {
    description: "Occurrence shape for @primaryExport — marks the primary export.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { SortStrategyValue } from "@beep/repo-utils/JSDoc/models/tag-values/TypeDocTagValues"
 *
 * void SortStrategyValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SortStrategyValue extends S.TaggedClass<SortStrategyValue>($I`SortStrategyValue`)(
  "sortStrategy",
  { ...nameField },
  $I.annote("SortStrategyValue", {
    description: "Occurrence shape for @sortStrategy — specifies documentation sort order.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { UseDeclaredTypeValue } from "@beep/repo-utils/JSDoc/models/tag-values/TypeDocTagValues"
 *
 * void UseDeclaredTypeValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class UseDeclaredTypeValue extends S.TaggedClass<UseDeclaredTypeValue>($I`UseDeclaredTypeValue`)(
  "useDeclaredType",
  empty,
  $I.annote("UseDeclaredTypeValue", {
    description: "Occurrence shape for @useDeclaredType — uses declared type in docs.",
  })
) {}
