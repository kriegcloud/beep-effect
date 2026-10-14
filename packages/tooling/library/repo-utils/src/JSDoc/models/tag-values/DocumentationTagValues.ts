/**
 * Documentation content tag occurrence shapes.
 *
 * @packageDocumentation
 * @category models
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { optionalDesc } from "./_fields.ts";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/DocumentationTagValues");

/**
 * Schema-backed value for a parsed `description` tag occurrence: the main description body.
 *
 * **Example** (Creating a description tag)
 *
 * ```ts
 * import { DescriptionValue } from "@beep/repo-utils/JSDoc/models/tag-values/DocumentationTagValues"
 *
 * const tag = DescriptionValue.make({ description: "Parses one JSDoc block." })
 * const tagName: "description" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DescriptionValue extends S.Opaque<DescriptionValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("description", { ...optionalDesc }).pipe(
    $I.annoteSchema("DescriptionValue", {
      description: "Occurrence shape for @description — the main description body.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `summary` tag occurrence: a short summary.
 *
 * **Example** (Creating a summary tag)
 *
 * ```ts
 * import { SummaryValue } from "@beep/repo-utils/JSDoc/models/tag-values/DocumentationTagValues"
 *
 * const tag = SummaryValue.make({ description: "Parse tag metadata." })
 * const tagName: "summary" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SummaryValue extends S.Opaque<SummaryValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("summary", { ...optionalDesc }).pipe(
    $I.annoteSchema("SummaryValue", {
      description: "Occurrence shape for @summary — a short summary.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `remarks` tag occurrence: additional remarks.
 *
 * **Example** (Creating a remarks tag)
 *
 * ```ts
 * import { RemarksValue } from "@beep/repo-utils/JSDoc/models/tag-values/DocumentationTagValues"
 *
 * const tag = RemarksValue.make({ description: "Whitespace is preserved for docgen." })
 * const tagName: "remarks" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RemarksValue extends S.Opaque<RemarksValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("remarks", { ...optionalDesc }).pipe(
    $I.annoteSchema("RemarksValue", {
      description: "Occurrence shape for @remarks — additional remarks.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `example` tag occurrence: a usage example.
 *
 * **Example** (Creating an example tag)
 *
 * ```ts
 * import { ExampleValue } from "@beep/repo-utils/JSDoc/models/tag-values/DocumentationTagValues"
 *
 * const tag = ExampleValue.make({ description: "ParamValue.make({ name: \"input\" })" })
 * const tagName: "example" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ExampleValue extends S.Opaque<ExampleValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("example", { ...optionalDesc }).pipe(
    $I.annoteSchema("ExampleValue", {
      description: "Occurrence shape for @example — a usage example.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `deprecated` tag occurrence: marks a symbol as deprecated.
 *
 * **Example** (Creating a deprecated tag)
 *
 * ```ts
 * import { DeprecatedValue } from "@beep/repo-utils/JSDoc/models/tag-values/DocumentationTagValues"
 *
 * const tag = DeprecatedValue.make({ description: "Use parseJSDocTag instead." })
 * const tagName: "deprecated" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DeprecatedValue extends S.Opaque<DeprecatedValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("deprecated", { ...optionalDesc }).pipe(
    $I.annoteSchema("DeprecatedValue", {
      description: "Occurrence shape for @deprecated — marks a symbol as deprecated.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `see` tag occurrence: a reference to related resources.
 *
 * **Example** (Creating a see tag)
 *
 * ```ts
 * import { SeeValue } from "@beep/repo-utils/JSDoc/models/tag-values/DocumentationTagValues"
 *
 * const tag = SeeValue.make({ description: "TagValue" })
 * const tagName: "see" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SeeValue extends S.Opaque<SeeValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("see", { ...optionalDesc }).pipe(
    $I.annoteSchema("SeeValue", {
      description: "Occurrence shape for @see — a reference to related resources.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `since` tag occurrence: the version when the symbol was introduced.
 *
 * **Example** (Creating a since tag)
 *
 * ```ts
 * import { SinceValue } from "@beep/repo-utils/JSDoc/models/tag-values/DocumentationTagValues"
 *
 * const tag = SinceValue.make({ description: "0.0.0" })
 * const tagName: "since" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SinceValue extends S.Opaque<SinceValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("since", { ...optionalDesc }).pipe(
    $I.annoteSchema("SinceValue", {
      description: "Occurrence shape for @since — the version when the symbol was introduced.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `version` tag occurrence: the current version of the symbol.
 *
 * **Example** (Creating a version tag)
 *
 * ```ts
 * import { VersionValue } from "@beep/repo-utils/JSDoc/models/tag-values/DocumentationTagValues"
 *
 * const tag = VersionValue.make({ description: "1.2.3" })
 * const tagName: "version" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class VersionValue extends S.Opaque<VersionValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("version", { ...optionalDesc }).pipe(
    $I.annoteSchema("VersionValue", {
      description: "Occurrence shape for @version — the current version of the symbol.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `author` tag occurrence: the author of the symbol.
 *
 * **Example** (Creating an author tag)
 *
 * ```ts
 * import { AuthorValue } from "@beep/repo-utils/JSDoc/models/tag-values/DocumentationTagValues"
 *
 * const tag = AuthorValue.make({ description: "Beep Maintainers" })
 * const tagName: "author" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class AuthorValue extends S.Opaque<AuthorValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("author", { ...optionalDesc }).pipe(
    $I.annoteSchema("AuthorValue", {
      description: "Occurrence shape for @author — the author of the symbol.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `todo` tag occurrence: a pending task.
 *
 * **Example** (Creating a todo tag)
 *
 * ```ts
 * import { TodoValue } from "@beep/repo-utils/JSDoc/models/tag-values/DocumentationTagValues"
 *
 * const tag = TodoValue.make({ description: "Normalize inherited tags." })
 * const tagName: "todo" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TodoValue extends S.Opaque<TodoValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("todo", { ...optionalDesc }).pipe(
    $I.annoteSchema("TodoValue", {
      description: "Occurrence shape for @todo — a pending task.",
    })
  )
) {}
