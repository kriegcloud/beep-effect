/**
 * TypeScript-specific tag occurrence shapes.
 *
 * @category DomainModel
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { empty } from "./_fields.js";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/TypeScriptTagValues");

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class OverloadValue extends S.TaggedClass<OverloadValue>($I`OverloadValue`)(
  "overload",
  empty,
  $I.annote("OverloadValue", {
    description: "Occurrence shape for @overload — marks a function overload signature.",
  })
) {}
