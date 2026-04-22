/**
 * Inline tag occurrence shapes.
 *
 * @category models
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { optionalDesc, optionalName } from "./_fields.js";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/InlineTagValues");

/**
 *
 * @example
 * ```ts
 * import { LinkValue } from "@beep/repo-utils/JSDoc/models/tag-values/InlineTagValues"
 *
 * void LinkValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class LinkValue extends S.TaggedClass<LinkValue>($I`LinkValue`)(
  "link",
  { ...optionalName, ...optionalDesc },
  $I.annote("LinkValue", {
    description: "Occurrence shape for @link — an inline link to another symbol.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { InheritDocValue } from "@beep/repo-utils/JSDoc/models/tag-values/InlineTagValues"
 *
 * void InheritDocValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class InheritDocValue extends S.TaggedClass<InheritDocValue>($I`InheritDocValue`)(
  "inheritDoc",
  { ...optionalName },
  $I.annote("InheritDocValue", {
    description: "Occurrence shape for @inheritDoc — inherits documentation from a parent.",
  })
) {}
