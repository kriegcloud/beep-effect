// Ported from commonmark.js@0.31.2 (https://github.com/commonmark/commonmark.js)
// Copyright (c) 2014-2023 John MacFarlane
// License: BSD-2-Clause
//
// `parseAutolink`: `<uri>` and `<email>` become links whose text is the
// destination itself.
//
// Port note: upstream stores `normalizeURI(dest)` — percent-encoded — so its
// renderer can emit the value verbatim. mdast defines `url` as the decoded
// destination, so the encoding moves to whoever renders (`references.ts` has
// the same note for link destinations). An autolink also carries no title;
// upstream sets `""`, and an absent optionalKey is the mdast-faithful form.

import * as Str from "effect/String";
import { appendChild, makeInlineNode } from "../inlineNode.ts";
import { stickyOf } from "../patterns.ts";
import type { InlineConstruct } from "../inlineTypes.ts";

const C_LESSTHAN = "<";

const reEmailAutolink = stickyOf(
  /^<([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/
);
// Upstream spells the excluded control range `\x00-\x20`; `\0- ` is the
// same range written the way the linter accepts.
const reAutolink = stickyOf(/^<[A-Za-z][A-Za-z0-9.+-]{1,31}:[^<>\0- ]*>/i);

/**
 * Recognizes an absolute-URI or email autolink enclosed in angle brackets.
 *
 * **Example** (Inspect the angle-bracket trigger)
 *
 * ```ts
 * import { autolinkConstruct } from "@beep/markdown/internal/inlines/autolink";
 *
 * console.log(autolinkConstruct.name, autolinkConstruct.triggers[0]) // autolink <
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const autolinkConstruct: InlineConstruct = {
  name: "autolink",
  triggers: [C_LESSTHAN],
  parse: (scanner) => {
    const from = scanner.pos;

    const email = scanner.match(reEmailAutolink);
    if (email !== undefined) {
      const destination = Str.slice(1, -1)(email);
      const node = makeInlineNode("link", from, scanner.pos);
      node.data.url = `mailto:${destination}`;
      appendChild(node, makeInlineNode("text", from + 1, scanner.pos - 1, destination));
      scanner.append(node);
      return true;
    }

    const uri = scanner.match(reAutolink);
    if (uri !== undefined) {
      const destination = Str.slice(1, -1)(uri);
      const node = makeInlineNode("link", from, scanner.pos);
      node.data.url = destination;
      appendChild(node, makeInlineNode("text", from + 1, scanner.pos - 1, destination));
      scanner.append(node);
      return true;
    }

    return false;
  },
};
