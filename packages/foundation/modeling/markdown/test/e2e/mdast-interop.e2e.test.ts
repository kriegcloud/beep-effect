// The mdast interop harness: parse each vendored fixture's markdown with
// this package's parser, project through Mdast.toMdast, and deep-equal the
// reference tree mdast-util-from-markdown@2.0.3 produced for the same
// source — positions included. AST-plus-position equality is strictly
// stronger than render equivalence: it proves the projected trees are
// drop-in mdast for the remark ecosystem.
//
// The fixtures exercise CommonMark shapes only (upstream's core loads no
// GFM extensions), so every fixture parses under dialect "commonmark" with
// frontmatter capture off — the configuration upstream generated the .json
// files with. See data/conformance/mdast/VENDORED.md.
//
// KNOWN ENGINE-LINEAGE DIVERGENCES. This engine is a commonmark.js port;
// the fixtures come from micromark. The two reference implementations agree
// on rendered HTML but disagree on three stored-value details, all
// whitespace-shaped, none reachable from the mdast readme's field
// contracts. Each is masked by `normalizeForComparison` — applied to BOTH
// trees so it can hide only these exact classes — and each is pinned by a
// tripwire test below that fails if either side ever changes:
//
// 1. inlineCode values: the CommonMark spec's code-span rule converts
//    interior line endings to spaces and commonmark.js stores the converted
//    form (ours: `"g "`); micromark stores the raw line ending (`"g\n"`).
// 2. text values at soft breaks: commonmark.js strips only trailing
//    *spaces* before a soft break, keeping a trailing tab (ours:
//    `"g\t\nh"`); micromark strips tabs too (`"g\nh"`).
// 3. multiline reference labels: commonmark.js's paragraph accumulation
//    strips continuation-line indentation, so a label spanning lines loses
//    it (ours: `"\n1\n"`); micromark preserves the source indentation
//    (`"\n  1\n"`).

import { Markdown, MarkdownParseOptions } from "@beep/markdown/Markdown";
import { Mdast } from "@beep/markdown/Mdast";
import { assert, describe, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Result from "effect/Result";
import * as Str from "effect/String";
import { loadMdastFixturePairs } from "../support/corpus.ts";

const options = MarkdownParseOptions.make({ dialect: "commonmark" });

// Divergences 1 and 3 combined: the line ending becomes a space and any
// continuation-line indentation after it (which this engine's paragraph
// accumulation strips) is swallowed with it.
const INLINE_CODE_LINE_ENDING = /\r?\n[ \t]*/g;
const TEXT_TRAILING_BLANKS = /[ \t]+\n/g;
const LABEL_CONTINUATION_INDENT = /\n[ \t]+/g;
const LABEL_INDENT = /\n[ \t]+/;

/** Mask one string field of a node of the given `type`. */
const maskString = (type: unknown, key: string, value: string): string => {
  if (key === "label") return Str.replace(LABEL_CONTINUATION_INDENT, "\n")(value);
  if (key !== "value") return value;
  if (type === "inlineCode") return Str.replace(INLINE_CODE_LINE_ENDING, " ")(value);
  return type === "text" ? Str.replace(TEXT_TRAILING_BLANKS, "\n")(value) : value;
};

/**
 * Mask the three documented divergences, on both trees: inlineCode line
 * endings to spaces, text trailing tabs/spaces before a line ending
 * stripped, label continuation-line indentation collapsed. Everything else
 * — every other field, every position — passes through untouched.
 */
const normalizeForComparison = (node: unknown): unknown => {
  if (A.isArray(node)) return A.map(node, normalizeForComparison);
  if (!P.isObject(node)) return node;
  const type = node.type;
  return R.map(node, (value: unknown, key: string) =>
    P.isString(value) ? maskString(type, key, value) : normalizeForComparison(value)
  );
};

const parseFixture = (markdown: string) => {
  const parsed = Markdown.parseResult(markdown, options);
  assert.isTrue(Result.isSuccess(parsed));
  if (Result.isFailure(parsed)) assert.fail("expected a successful fixture parse");
  return Mdast.toMdast(parsed.success);
};

/** Every string `field` of every node of `type`, in document order. */
const values = (tree: unknown, type: string, field: "value" | "label"): ReadonlyArray<string> => {
  if (A.isArray(tree)) return A.flatMap(tree, (item) => values(item, type, field));
  if (!P.isObject(tree)) return [];
  const own = tree[field];
  const children = A.flatMap(R.values(tree), (value) => values(value, type, field));
  return tree.type === type && P.isString(own) ? A.prepend(children, own) : children;
};

const hasLineEnding = Str.includes("\n");
const hasTabBeforeLineEnding = Str.includes("\t\n");
const hasIndentedContinuation = (label: string): boolean => LABEL_INDENT.test(label);

describe("mdast interop corpus", () => {
  const pairs = loadMdastFixturePairs();

  for (const pair of pairs) {
    it(`projects ${pair.name} to the reference tree`, () => {
      assert.deepStrictEqual(normalizeForComparison(parseFixture(pair.markdown)), normalizeForComparison(pair.tree));
    });
  }

  describe("divergence tripwires", () => {
    const fixture = (name: string) =>
      O.getOrThrowWith(
        A.findFirst(pairs, (candidate) => candidate.name === name),
        () => new Error(`no mdast fixture named ${name}`)
      );

    it("pins the inlineCode line-ending divergence on code-text", () => {
      const pair = fixture("code-text");
      // micromark stores the raw line ending; this engine stores the
      // spec's space-converted form. If either side changes, the
      // normalizer's first clause is dead weight — delete it and this.
      assert.isTrue(A.some(values(pair.tree, "inlineCode", "value"), hasLineEnding));
      const ours = values(parseFixture(pair.markdown), "inlineCode", "value");
      assert.isFalse(A.some(ours, hasLineEnding));
    });

    it("pins the soft-break trailing-tab divergence on hard-break-prefix", () => {
      const pair = fixture("hard-break-prefix");
      // commonmark.js strips only spaces before a soft break; micromark
      // strips tabs too. If either side changes, the normalizer's
      // second clause is dead weight — delete it and this.
      assert.isTrue(A.some(values(parseFixture(pair.markdown), "text", "value"), hasTabBeforeLineEnding));
      assert.isFalse(A.some(values(pair.tree, "text", "value"), hasTabBeforeLineEnding));
    });

    it("pins the multiline-label indentation divergence on character-references-everywhere", () => {
      const pair = fixture("character-references-everywhere");
      // micromark preserves continuation-line indentation inside a
      // label; commonmark.js's paragraph accumulation strips it. If
      // either side changes, the normalizer's third clause is dead
      // weight — delete it and this.
      assert.isTrue(A.some(values(pair.tree, "definition", "label"), hasIndentedContinuation));
      const ours = values(parseFixture(pair.markdown), "definition", "label");
      assert.isFalse(A.some(ours, hasIndentedContinuation));
    });
  });
});
