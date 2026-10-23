// Ported from commonmark.js@0.31.2 (https://github.com/commonmark/commonmark.js)
// Copyright (c) 2014-2023 John MacFarlane
// License: BSD-2-Clause
//
// Upstream's `parseInline` switch, as a per-dialect trigger table. The switch
// order is preserved where a character has more than one construct: `<` tries
// an autolink before raw HTML, exactly as
// `this.parseAutolink(block) || this.parseHtmlTag(block)` does.
//
// Emphasis registers on `*`/`_` and links on `[`, `]` and `!`. A character with
// no registered construct falls through to the text fallback — whose pattern
// excludes it — and ends up as a literal single character.

import { $MarkdownId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { autolinkConstruct } from "./inlines/autolink.ts";
import { linkifyEmails, urlAutolinkConstruct, wwwAutolinkConstruct } from "./inlines/autolinkLiteral.ts";
import { codeSpanConstruct } from "./inlines/codeSpan.ts";
import { emphasisConstruct } from "./inlines/emphasis.ts";
import { entityConstruct } from "./inlines/entity.ts";
import { escapeConstruct } from "./inlines/escape.ts";
import { gfmImageOpenConstruct, gfmLinkCloseConstruct } from "./inlines/footnoteReference.ts";
import { lineBreakConstruct } from "./inlines/lineBreak.ts";
import { imageOpenConstruct, linkCloseConstruct, linkOpenConstruct } from "./inlines/link.ts";
import { rawHtmlConstruct } from "./inlines/rawHtml.ts";
import { strikethroughConstruct } from "./inlines/strikethrough.ts";
import { gfmTextConstruct, textConstruct } from "./inlines/text.ts";
import { InlineDialect } from "./inlineTypes.ts";
import type { MarkdownDialect } from "./blockRegistry.ts";
import type { InlineConstruct } from "./inlineTypes.ts";

const $I = $MarkdownId.create("internal/inlineRegistry");

class UnknownInlineDialectError extends S.TaggedError<UnknownInlineDialectError, { readonly brand: unique symbol }>(
  $I`UnknownInlineDialectError`
)(
  "UnknownInlineDialectError",
  {
    message: S.String.pipe(
      $I.annoteKey("UnknownInlineDialectError.message", {
        description: "Diagnostic message naming the unsupported inline dialect.",
      })
    ),
  },
  $I.annoteError<UnknownInlineDialectError>("UnknownInlineDialectError", {
    description: "An inline dialect lookup failed because its key is outside the supported markdown dialect domain.",
  })
) {}

/**
 * The dialects the inline pass can be keyed by.
 *
 * @category type-level
 * @since 0.0.0
 */
export type InlineDialectName = MarkdownDialect;

// Built once per dialect at module load and read-only from then on (the
// `Readonly` type is the freeze): the parser reads it once per character,
// so the lookup is a plain property read on a one-character key — no
// `Option` and no hashing on the hot path. A one-character key can never
// name an `Object.prototype` member.
const triggerTable = (
  constructs: ReadonlyArray<InlineConstruct>
): Readonly<Record<string, ReadonlyArray<InlineConstruct>>> => {
  const table: Record<string, ReadonlyArray<InlineConstruct>> = {};
  for (const construct of constructs) {
    for (const trigger of construct.triggers) {
      table[trigger] = A.append(table[trigger] ?? [], construct);
    }
  }
  return table;
};

/** The CommonMark construct set, which every dialect starts from. */
const COMMONMARK_CONSTRUCTS: ReadonlyArray<InlineConstruct> = [
  lineBreakConstruct,
  escapeConstruct,
  codeSpanConstruct,
  emphasisConstruct,
  linkOpenConstruct,
  imageOpenConstruct,
  linkCloseConstruct,
  autolinkConstruct,
  rawHtmlConstruct,
  entityConstruct,
];

const commonmarkDialect = new InlineDialect(triggerTable(COMMONMARK_CONSTRUCTS), textConstruct, []);

// GFM: the CommonMark set plus strikethrough and the two literal-autolink
// matchers, with the email half as a postprocess pass (`autolinkLiteral.ts`
// carries the reason for the split). The additions are appended, so a
// character CommonMark already claims keeps its existing precedence.
//
// Footnote references are the exception to "additions are appended", because
// they are not an addition to any trigger table — they are two branches inside
// constructs CommonMark already owns, so both are SWAPPED for the variants
// carrying them:
//
//   `]` — the footnote branch sits inside the close-bracket handler, reached
//   only once every link shape has failed. A construct registered AFTER the
//   close-bracket one could never run (it claims every `]`), and one before it
//   would beat the links a footnote must lose to.
//
//   `!` — cmark-gfm's bang handler refuses to open an image on `![^`, which is
//   what keeps the `!` in `text![^1]` literal and lets the bracket reach the
//   footnote branch as an ordinary opener.
//
// `inlines/footnoteReference.ts` and `makeImageOpenConstruct` carry the
// reasoning for each.
const gfmDialect = new InlineDialect(
  triggerTable([
    ...A.filter(
      COMMONMARK_CONSTRUCTS,
      (construct) => construct !== linkCloseConstruct && construct !== imageOpenConstruct
    ),
    gfmLinkCloseConstruct,
    gfmImageOpenConstruct,
    strikethroughConstruct,
    wwwAutolinkConstruct,
    urlAutolinkConstruct,
  ]),
  gfmTextConstruct,
  [linkifyEmails]
);

const dialects = HashMap.fromIterable<InlineDialectName, InlineDialect>([
  ["commonmark", commonmarkDialect],
  ["gfm", gfmDialect],
]);

/**
 * Selects the inline trigger table, text fallback and postprocess passes for `dialect`.
 *
 * **Gotchas**
 *
 * An unknown dialect cannot arrive through the schema-typed public surface,
 * so it is programmer error and dies as a defect.
 *
 * **Example** (Compare dialect postprocess passes)
 *
 * ```ts
 * import { inlineDialect } from "@beep/markdown/internal/inlineRegistry";
 *
 * console.log(inlineDialect("commonmark").postprocess.length) // 0
 * console.log(inlineDialect("gfm").postprocess.length) // 1
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const inlineDialect = (dialect: InlineDialectName): InlineDialect => {
  const found = O.getOrUndefined(HashMap.get(dialects, dialect));
  if (found === undefined) {
    throw UnknownInlineDialectError.make({ message: `unknown markdown dialect: ${dialect}` });
  }
  return found;
};
