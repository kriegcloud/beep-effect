// Ported from cmark-gfm@0.29.0.gfm.13 (https://github.com/github/cmark-gfm)
// Copyright (c) 2014, John MacFarlane; Copyright (c) 2015, GitHub, Inc.
// License: BSD-2-Clause
//
// `extensions/strikethrough.c`: GFM strikethrough, as a delimiter-stack
// construct. Both halves live here — `match`, which measures a `~` run and
// pushes it, and `insert`, which pairs two runs into a `delete` node — because
// the parser's `processEmphasis` calls the second one the way upstream's
// `process_emphasis` calls `insert_inline_from_delim`.
//
// Three rules carry the whole construct:
//
// 1. Only runs of ONE or TWO tildes are pushed. Upstream's `match` gates the
//    push on `delims == 2 || delims == 1`, so `~~~foo~~~` has no delimiters at
//    all and stays literal — it is not a long run failing to pair, it never
//    became a candidate.
// 2. Flanking is emphasis's flanking. Upstream calls the same
//    `scan_delimiters` and uses its two flags directly, which is `*`'s rule,
//    not `_`'s: intraword strikethrough is allowed.
// 3. The two runs must be the SAME LENGTH. Upstream's `insert` compares the
//    two text literals' lengths and bails when they differ — but bails through
//    `done:`, which still drops every delimiter in between, so a mismatched
//    pair is spent rather than retried.
//
// Registered under the `gfm` dialect only.

import { dual } from "effect/Function";
import * as O from "effect/Option";
import { insertAfter, makeInlineNode, moveSiblings, unlink } from "../inlineNode.ts";
import { InlineConstruct } from "../inlineTypes.ts";
import { pushDelimiterRun, scanDelims } from "./emphasis.ts";
import type { InlineNode } from "../inlineNode.ts";
import type { Delimiter, InlineScanner } from "../inlineTypes.ts";

/**
 * The `~` character — the construct's only trigger.
 *
 * **Example** (Inspect the tilde trigger)
 *
 * ```ts
 * import { C_TILDE } from "@beep/markdown/internal/inlines/strikethrough"
 *
 * console.log(C_TILDE) // ~
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const C_TILDE = "~";

/**
 * Consume a `~` run as literal text and, when it is a viable one- or
 * two-tilde run, push it onto the shared delimiter stack.
 *
 * **Details**
 *
 * The run becomes a text node either way: a `~` that never pairs has to
 * survive as the character it is.
 */
const handleTilde = (scanner: InlineScanner): boolean => {
  const res = scanDelims(scanner, C_TILDE);
  if (O.isNone(res)) {
    return false;
  }

  const run = res.value;
  pushDelimiterRun(scanner, C_TILDE, run, (run.canOpen || run.canClose) && run.numdelims <= 2);
  return true;
};

/**
 * Pair `opener` with `closer` into a `delete` node — upstream's `insert`.
 *
 * **Details**
 *
 * Returns the delimiter the caller's loop continues from, which upstream
 * captures as `closer->next` BEFORE it starts unlinking, so both the matched
 * and the mismatched path resume at the same place.
 *
 * **Gotchas**
 *
 * Only equal-length runs form a `delete` node. Both matched and mismatched
 * pairs remove the delimiters from the closer back through the opener.
 *
 * **Example** (Prepare a curried strikethrough insertion)
 *
 * ```ts
 * import { insertStrikethrough, C_TILDE } from "@beep/markdown/internal/inlines/strikethrough"
 * import { makeInlineNode } from "@beep/markdown/internal/inlineNode"
 * import { Delimiter } from "@beep/markdown/internal/inlineTypes"
 *
 * const opener = new Delimiter(C_TILDE, makeInlineNode("text", 0, 2, "~~"), 2, true, false, undefined)
 * const closer = new Delimiter(C_TILDE, makeInlineNode("text", 6, 8, "~~"), 2, false, true, opener)
 * const insert = insertStrikethrough(opener, closer)
 * console.log(typeof insert) // function
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const insertStrikethrough: {
  (scanner: InlineScanner, opener: Delimiter, closer: Delimiter): Delimiter | undefined;
  (opener: Delimiter, closer: Delimiter): (scanner: InlineScanner) => Delimiter | undefined;
} = dual(3, (scanner: InlineScanner, opener: Delimiter, closer: Delimiter): Delimiter | undefined => {
  const resume = closer.next;
  const openerNode = opener.node;
  const closerNode = closer.node;

  if (openerNode.value.length === closerNode.value.length) {
    // Every tilde on both sides is spent, unlike emphasis, which may leave
    // a run partially unused.
    const delims = openerNode.value.length;
    openerNode.value = "";
    openerNode.end -= delims;
    closerNode.value = "";
    closerNode.start += delims;

    const strikethrough: InlineNode = makeInlineNode("delete", openerNode.end, closerNode.start);
    moveSiblings(strikethrough, openerNode.next, closerNode);
    insertAfter(openerNode, strikethrough);
    unlink(openerNode);
    unlink(closerNode);
  }

  // Upstream's `done:` label: matched or not, every delimiter from the
  // closer back through the opener is removed.
  let delimiter: Delimiter | undefined = closer;
  while (delimiter !== undefined && delimiter !== opener) {
    const previous: Delimiter | undefined = delimiter.previous;
    scanner.removeDelimiter(delimiter);
    delimiter = previous;
  }
  scanner.removeDelimiter(opener);

  return resume;
});

/**
 * Recognizes GFM strikethrough: `~foo~` and `~~foo~~`.
 *
 * **Example** (Inspect the GFM strikethrough trigger)
 *
 * ```ts
 * import { strikethroughConstruct } from "@beep/markdown/internal/inlines/strikethrough"
 *
 * console.log(strikethroughConstruct.triggers[0]) // ~
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const strikethroughConstruct = new InlineConstruct("strikethrough", [C_TILDE], handleTilde);
