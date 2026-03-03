/**
 * TypeDoc-specific tag occurrence shapes.
 *
 * @since 0.0.0
 * @category DomainModel
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { TSCategoryTag } from "../TSCategory.model.js";
import { empty, nameField } from "./_fields.js";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/TypeDocTagValues");

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class CategoryValue extends S.TaggedClass<CategoryValue>($I`CategoryValue`)(
  "category",
  { name: TSCategoryTag },
  $I.annote("CategoryValue", {
    description: "Occurrence shape for @category — assigns a documentation category.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class DocumentValue extends S.TaggedClass<DocumentValue>($I`DocumentValue`)(
  "document",
  empty,
  $I.annote("DocumentValue", {
    description: "Occurrence shape for @document — marks for documentation generation.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class GroupValue extends S.TaggedClass<GroupValue>($I`GroupValue`)(
  "group",
  { ...nameField },
  $I.annote("GroupValue", {
    description: "Occurrence shape for @group — assigns a documentation group.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class HiddenValue extends S.TaggedClass<HiddenValue>($I`HiddenValue`)(
  "hidden",
  empty,
  $I.annote("HiddenValue", {
    description: "Occurrence shape for @hidden — hides the symbol from documentation.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class ExpandValue extends S.TaggedClass<ExpandValue>($I`ExpandValue`)(
  "expand",
  empty,
  $I.annote("ExpandValue", {
    description: "Occurrence shape for @expand — expands type aliases in documentation.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class InlineValue extends S.TaggedClass<InlineValue>($I`InlineValue`)(
  "inline",
  empty,
  $I.annote("InlineValue", {
    description: "Occurrence shape for @inline — inlines a type in documentation.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class MergeModuleWithValue extends S.TaggedClass<MergeModuleWithValue>($I`MergeModuleWithValue`)(
  "mergeModuleWith",
  { ...nameField },
  $I.annote("MergeModuleWithValue", {
    description: "Occurrence shape for @mergeModuleWith — merges module documentation.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class PrimaryExportValue extends S.TaggedClass<PrimaryExportValue>($I`PrimaryExportValue`)(
  "primaryExport",
  empty,
  $I.annote("PrimaryExportValue", {
    description: "Occurrence shape for @primaryExport — marks the primary export.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class SortStrategyValue extends S.TaggedClass<SortStrategyValue>($I`SortStrategyValue`)(
  "sortStrategy",
  { ...nameField },
  $I.annote("SortStrategyValue", {
    description: "Occurrence shape for @sortStrategy — specifies documentation sort order.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class UseDeclaredTypeValue extends S.TaggedClass<UseDeclaredTypeValue>($I`UseDeclaredTypeValue`)(
  "useDeclaredType",
  empty,
  $I.annote("UseDeclaredTypeValue", {
    description: "Occurrence shape for @useDeclaredType — uses declared type in docs.",
  })
) {}
