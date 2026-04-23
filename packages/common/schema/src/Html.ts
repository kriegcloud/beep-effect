/**
 * HTML text schemas.
 *
 * @module
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SchemaId.create("Html");

/**
 * Branded schema for trusted HTML fragment strings.
 *
 * Use this for rendered snippets such as Markdown or rich-text projections that
 * are valid to embed inside an existing HTML document body.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { HtmlFragment } from "@beep/schema/Html"
 *
 * const fragment = S.decodeUnknownSync(HtmlFragment)("<p>Hello</p>")
 * console.log(fragment) // "<p>Hello</p>"
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const HtmlFragment = S.String.pipe(
  S.brand("HtmlFragment"),
  $I.annoteSchema("HtmlFragment", {
    description: "Trusted HTML fragment text that can be embedded inside a larger HTML document.",
  })
);

/**
 * Type for {@link HtmlFragment}. {@inheritDoc HtmlFragment}
 *
 * @example
 * ```ts
 * import type { HtmlFragment } from "@beep/schema/Html"
 *
 * const render = (value: HtmlFragment) => value
 * void render
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type HtmlFragment = typeof HtmlFragment.Type;
