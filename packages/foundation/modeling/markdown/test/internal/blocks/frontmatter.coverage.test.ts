import {
  FrontmatterCapture,
  RawFrontmatterCapture,
  scanFrontmatter,
  scanRawFrontmatter,
} from "@beep/markdown/internal/blocks/frontmatter";
import { preprocessLines } from "@beep/markdown/internal/preprocess";
import { assert, describe, it } from "@effect/vitest";
import { assertNone } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as Str from "effect/String";

describe("frontmatter scanner boundary coverage", () => {
  it.effect("empty and displaced line tables do not capture", () =>
    Effect.sync(() => {
      assert.strictEqual(scanFrontmatter([], ""), null);
      assert.strictEqual(scanFrontmatter([{ text: "---", start: 1 }], " ---"), null);
      assert.strictEqual(scanFrontmatter(preprocessLines("--- x\n---"), "--- x\n---"), null);
      assert.strictEqual(scanFrontmatter(preprocessLines("--- \n---\t"), "--- \n---\t")?.endOffset, 9);
      assertNone(scanRawFrontmatter("--- x\n---"));
      assert.strictEqual(O.getOrThrow(scanRawFrontmatter("--- \n---\t")).bodyOffset, 9);
      assert.deepStrictEqual(
        scanFrontmatter(preprocessLines("---\n---"), "---\n---"),
        FrontmatterCapture.make({
          format: "yaml",
          value: "",
          lineCount: 2,
          endOffset: 7,
        })
      );
      assert.deepStrictEqual(
        scanFrontmatter(preprocessLines("---\n\n---"), "---\n\n---"),
        FrontmatterCapture.make({
          format: "yaml",
          value: "",
          lineCount: 3,
          endOffset: 8,
        })
      );
      assert.deepStrictEqual(
        O.getOrThrow(scanRawFrontmatter("---\rx\r---\rbody")),
        RawFrontmatterCapture.make({
          format: "yaml",
          value: "x\r",
          newline: "\r",
          bodyOffset: 10,
        })
      );
    })
  );
  it.effect("both call forms capture CRLF content and preserve raw body boundaries", () =>
    Effect.sync(() => {
      const text = "---\r\na: 1\r\nb: 2\r\n---\r\nbody";
      assert.strictEqual(scanFrontmatter(text)(preprocessLines(text))?.value, "a: 1\r\nb: 2");
      const raw = O.getOrThrow(scanRawFrontmatter(text));
      assert.strictEqual(raw.value, "a: 1\r\nb: 2\r\n");
      assert.strictEqual(Str.slice(raw.bodyOffset)(text), "body");
    })
  );
  it.effect("a missing closer rejects capture and an EOF closer records the exact boundary", () =>
    Effect.sync(() => {
      const missing = "---\nmissing";
      assertNone(scanRawFrontmatter(missing));
      assertNone(scanRawFrontmatter("---"));
      assertNone(scanRawFrontmatter("---\nmissing\n"));
      assertNone(scanRawFrontmatter("~~~\nx\n~~~\n"));
      assert.strictEqual(scanFrontmatter(preprocessLines(missing), missing), null);
      assert.deepStrictEqual(
        O.getOrThrow(scanRawFrontmatter("---\nx\n---")),
        RawFrontmatterCapture.make({
          format: "yaml",
          value: "x\n",
          newline: "\n",
          bodyOffset: 9,
        })
      );
      assert.deepStrictEqual(
        O.getOrThrow(scanRawFrontmatter("---json\n{}\n---\r\n")),
        RawFrontmatterCapture.make({
          format: "json",
          value: "{}\n",
          newline: "\n",
          bodyOffset: 16,
        })
      );
    })
  );
});
