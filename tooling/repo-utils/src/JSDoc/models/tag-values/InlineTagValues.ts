/**
 * Inline tag occurrence shapes.
 *
 * @since 0.0.0
 * @category DomainModel
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { optionalDesc, optionalName } from "./_fields.js";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/InlineTagValues");

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class LinkValue extends S.TaggedClass<LinkValue>($I`LinkValue`)(
  "link",
  { ...optionalName, ...optionalDesc },
  $I.annote("LinkValue", {
    description: "Occurrence shape for @link — an inline link to another symbol.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class InheritDocValue extends S.TaggedClass<InheritDocValue>($I`InheritDocValue`)(
  "inheritDoc",
  { ...optionalName },
  $I.annote("InheritDocValue", {
    description: "Occurrence shape for @inheritDoc — inherits documentation from a parent.",
  })
) {}
