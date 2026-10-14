/**
 * TypeDoc-specific tag occurrence shapes.
 *
 * @packageDocumentation
 * @category models
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { TSCategoryTag } from "../TSCategory.model.ts";
import { empty, nameField } from "./_fields.ts";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/TypeDocTagValues");

/**
 * Schema-backed value for a parsed `category` tag occurrence: assigns a documentation category.
 *
 * **Example** (Make category with name)
 *
 * ```ts
 * import { CategoryValue } from "@beep/repo-utils/JSDoc/models/tag-values/TypeDocTagValues"
 *
 * const tag = CategoryValue.make({ name: "Utility" })
 * const tagName: "category" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CategoryValue extends S.Opaque<CategoryValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("category", { name: TSCategoryTag }).pipe(
    $I.annoteSchema("CategoryValue", {
      description: "Occurrence shape for @category — assigns a documentation category.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `document` tag occurrence: marks for documentation generation.
 *
 * **Example** (Make empty document tag)
 *
 * ```ts
 * import { DocumentValue } from "@beep/repo-utils/JSDoc/models/tag-values/TypeDocTagValues"
 *
 * const tag = DocumentValue.make({})
 * const tagName: "document" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DocumentValue extends S.Opaque<DocumentValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("document", empty).pipe(
    $I.annoteSchema("DocumentValue", {
      description: "Occurrence shape for @document — marks for documentation generation.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `group` tag occurrence: assigns a documentation group.
 *
 * **Example** (Make group with name)
 *
 * ```ts
 * import { GroupValue } from "@beep/repo-utils/JSDoc/models/tag-values/TypeDocTagValues"
 *
 * const tag = GroupValue.make({ name: "Parsing" })
 * const tagName: "group" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class GroupValue extends S.Opaque<GroupValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("group", { ...nameField }).pipe(
    $I.annoteSchema("GroupValue", {
      description: "Occurrence shape for @group — assigns a documentation group.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `hidden` tag occurrence: hides the symbol from documentation.
 *
 * **Example** (Make empty hidden tag)
 *
 * ```ts
 * import { HiddenValue } from "@beep/repo-utils/JSDoc/models/tag-values/TypeDocTagValues"
 *
 * const tag = HiddenValue.make({})
 * const tagName: "hidden" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class HiddenValue extends S.Opaque<HiddenValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("hidden", empty).pipe(
    $I.annoteSchema("HiddenValue", {
      description: "Occurrence shape for @hidden — hides the symbol from documentation.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `expand` tag occurrence: expands type aliases in documentation.
 *
 * **Example** (Make empty expand tag)
 *
 * ```ts
 * import { ExpandValue } from "@beep/repo-utils/JSDoc/models/tag-values/TypeDocTagValues"
 *
 * const tag = ExpandValue.make({})
 * const tagName: "expand" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ExpandValue extends S.Opaque<ExpandValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("expand", empty).pipe(
    $I.annoteSchema("ExpandValue", {
      description: "Occurrence shape for @expand — expands type aliases in documentation.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `inline` tag occurrence: inlines a type in documentation.
 *
 * **Example** (Make empty inline tag)
 *
 * ```ts
 * import { InlineValue } from "@beep/repo-utils/JSDoc/models/tag-values/TypeDocTagValues"
 *
 * const tag = InlineValue.make({})
 * const tagName: "inline" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class InlineValue extends S.Opaque<InlineValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("inline", empty).pipe(
    $I.annoteSchema("InlineValue", {
      description: "Occurrence shape for @inline — inlines a type in documentation.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `mergeModuleWith` tag occurrence: merges module documentation.
 *
 * **Example** (Make mergeModuleWith with name)
 *
 * ```ts
 * import { MergeModuleWithValue } from "@beep/repo-utils/JSDoc/models/tag-values/TypeDocTagValues"
 *
 * const tag = MergeModuleWithValue.make({ name: "@beep/repo-utils" })
 * const tagName: "mergeModuleWith" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class MergeModuleWithValue extends S.Opaque<MergeModuleWithValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("mergeModuleWith", { ...nameField }).pipe(
    $I.annoteSchema("MergeModuleWithValue", {
      description: "Occurrence shape for @mergeModuleWith — merges module documentation.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `primaryExport` tag occurrence: marks the primary export.
 *
 * **Example** (Make empty primaryExport tag)
 *
 * ```ts
 * import { PrimaryExportValue } from "@beep/repo-utils/JSDoc/models/tag-values/TypeDocTagValues"
 *
 * const tag = PrimaryExportValue.make({})
 * const tagName: "primaryExport" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PrimaryExportValue extends S.Opaque<PrimaryExportValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("primaryExport", empty).pipe(
    $I.annoteSchema("PrimaryExportValue", {
      description: "Occurrence shape for @primaryExport — marks the primary export.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `sortStrategy` tag occurrence: specifies documentation sort order.
 *
 * **Example** (Make sortStrategy with name)
 *
 * ```ts
 * import { SortStrategyValue } from "@beep/repo-utils/JSDoc/models/tag-values/TypeDocTagValues"
 *
 * const tag = SortStrategyValue.make({ name: "source-order" })
 * const tagName: "sortStrategy" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SortStrategyValue extends S.Opaque<SortStrategyValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("sortStrategy", { ...nameField }).pipe(
    $I.annoteSchema("SortStrategyValue", {
      description: "Occurrence shape for @sortStrategy — specifies documentation sort order.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `useDeclaredType` tag occurrence: uses declared type in docs.
 *
 * **Example** (Make empty useDeclaredType tag)
 *
 * ```ts
 * import { UseDeclaredTypeValue } from "@beep/repo-utils/JSDoc/models/tag-values/TypeDocTagValues"
 *
 * const tag = UseDeclaredTypeValue.make({})
 * const tagName: "useDeclaredType" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class UseDeclaredTypeValue extends S.Opaque<UseDeclaredTypeValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("useDeclaredType", empty).pipe(
    $I.annoteSchema("UseDeclaredTypeValue", {
      description: "Occurrence shape for @useDeclaredType — uses declared type in docs.",
    })
  )
) {}
