// A GFM HTML differential: the writer's output rendered by micromark with the
// GFM extension (the reference CommonMark + GFM implementation, independent of
// the `@beep/markdown` engine the writer serializes through) must have the
// structure the writer promises. A table keeps its column count whatever its
// cells carry, a fence or backtick inside code never closes it early, and a
// multi-line list item stays one item.

import { fcRuns } from "@beep/fc-runs/FastCheckRuns";
import { GitHubMarkdown } from "@beep/github-reporting/GitHubMarkdown";
import { assert, describe, it } from "@effect/vitest";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";

const runs = { arbitrary: fcRuns(100) };

/** GitHub renders raw HTML (`<br>`, `<details>`), so the reference does too. */
const html = (markdown: string): string =>
  micromark(markdown, { allowDangerousHtml: true, extensions: [gfm()], htmlExtensions: [gfmHtml()] });

/** The text micromark emits for literal content. */
const escapeHtml = (text: string): string =>
  pipe(
    text,
    Str.replaceAll("&", "&amp;"),
    Str.replaceAll("<", "&lt;"),
    Str.replaceAll(">", "&gt;"),
    Str.replaceAll('"', "&quot;")
  );

/** Cell count of every rendered table row, header row first. */
const rowShape = (rendered: string): ReadonlyArray<number> =>
  A.map(A.drop(Str.split(rendered, "<tr>"), 1), (row) => Str.split(row, /<t[hd]>/).length - 1);

const occurrences = (text: string, needle: string): number => Str.split(text, needle).length - 1;

// Cell text drawn from the characters that threaten GFM table structure.
const HostileCell = S.String.check(S.isPattern(/^[a-z|\\` \n\r*_<>]{0,16}$/u));
const FenceContent = S.String.check(S.isPattern(/^[a-z`~ ]{1,8}(?:\n[a-z`~ ]{1,8}){0,3}$/u));
const BacktickText = S.String.check(S.isPattern(/^[a-z`]{1,12}$/u));
const ItemText = S.String.check(S.isPattern(/^[a-z]{1,8}(?:\r?\n[a-z]{1,8}){0,2}$/u));
const HostileRows = S.Tuple([HostileCell, HostileCell, HostileCell]).pipe(S.Array);
const Items = ItemText.pipe(S.NonEmptyArray);

describe("GitHubMarkdown under the micromark GFM reference", () => {
  it.effect.prop(
    "a table keeps one row per input row and one cell per header, whatever the cells carry",
    [Arbitrary.schema(HostileRows)],
    ([rows]) =>
      Effect.sync(() => {
        const rendered = html(GitHubMarkdown.table(["a", "b", "c"], rows));
        assert.strictEqual(occurrences(rendered, "<table>"), 1);
        assert.deepStrictEqual(
          rowShape(rendered),
          A.makeBy(rows.length + 1, () => 3)
        );
      }),
    runs
  );

  it("a short row is padded with empty cells instead of shifting", () => {
    const rendered = html(GitHubMarkdown.table(["a", "b"], [["only"]]));
    assert.deepStrictEqual(rowShape(rendered), [2, 2]);
    assert.include(rendered, "<td>only</td>\n<td></td>");
  });

  it("an escaped pipe renders as a literal pipe inside its cell", () => {
    const rendered = html(GitHubMarkdown.table(["Range"], [[">=1 || <2"]]));
    assert.include(rendered, "<td>&gt;=1 || &lt;2</td>");
  });

  it.effect.prop(
    "a fenced code block carries its content verbatim, fences inside it included",
    [Arbitrary.schema(FenceContent)],
    ([content]) =>
      Effect.sync(() => {
        assert.strictEqual(
          html(GitHubMarkdown.codeBlock(content, "text")),
          `<pre><code class="language-text">${escapeHtml(content)}\n</code></pre>`
        );
      }),
    runs
  );

  it.effect.prop(
    "inline code carries its content verbatim, backticks inside it included",
    [Arbitrary.schema(BacktickText)],
    ([text]) =>
      Effect.sync(() => {
        assert.strictEqual(html(GitHubMarkdown.code(text)), `<p><code>${escapeHtml(text)}</code></p>`);
      }),
    runs
  );

  it.effect.prop(
    "every list item stays one item, multi-line items included",
    [Arbitrary.schema(Items), Arbitrary.schema(S.Boolean)],
    ([items, ordered]) =>
      Effect.sync(() => {
        const rendered = html(GitHubMarkdown.list(items, { ordered }));
        assert.strictEqual(occurrences(rendered, "<li>"), items.length);
        assert.strictEqual(occurrences(rendered, ordered ? "<ol>" : "<ul>"), 1);
      }),
    runs
  );

  it("a link label with brackets and emphasis stays one link to the angle-bracketed URL", () => {
    assert.strictEqual(
      html(GitHubMarkdown.link("see [x] *y*", "https://e.test/a b(c)")),
      '<p><a href="https://e.test/a%20b(c)">see [x] <em>y</em></a></p>'
    );
  });

  it("a heading renders at its depth, line breaks inline", () => {
    assert.strictEqual(html(GitHubMarkdown.heading("Hi\nthere", 3)), "<h3>Hi<br>there</h3>");
  });

  it("details renders its markdown body between blank lines", () => {
    assert.strictEqual(
      html(GitHubMarkdown.details("Sum", "**body**")),
      "<details>\n<summary>Sum</summary>\n<p><strong>body</strong></p>\n</details>"
    );
  });
});
