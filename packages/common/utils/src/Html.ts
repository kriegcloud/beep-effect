/**
 * A module containing utilities for escaping HTML text.
 *
 * @module \@beep/utils/Html
 * @since 0.0.0
 */

import { flow } from "effect";
import * as Str from "effect/String";

/**
 * Escapes the HTML-sensitive characters in `text`.
 *
 * Replaces `&`, `<`, `>`, `"`, and `'` with their corresponding HTML
 * entities.
 *
 * @category utility
 * @since 0.0.0
 * @example
 * ```typescript
 * import { escapeHtml } from "@beep/utils/Html"
 *
 * const value = escapeHtml(`<div class="note">it's fine</div>`)
 * void value
 * ```
 */
export const escapeHtml = flow(
  Str.replaceAll("&", "&amp;"),
  Str.replaceAll("<", "&lt;"),
  Str.replaceAll(">", "&gt;"),
  Str.replaceAll('"', "&quot;"),
  Str.replaceAll("'", "&#39;")
);

/**
 * Escapes HTML-sensitive characters and converts newlines to `<br />`.
 *
 * Useful when rendering plain multi-line text into HTML while preserving line
 * breaks.
 *
 * @category utility
 * @since 0.0.0
 * @example
 * ```typescript
 * import { escapeHtmlMultiline } from "@beep/utils/Html"
 *
 * const value = escapeHtmlMultiline("hello\n<script>alert('x')</script>")
 * void value
 * ```
 */
export const escapeHtmlMultiline = flow(escapeHtml, Str.replaceAll("\n", "<br />"));
