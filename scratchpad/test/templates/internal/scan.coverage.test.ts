import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { CommentStyle } from "../../../effected/templates/CommentStyle.ts";
import { SectionId } from "../../../effected/templates/Section.ts";
import { SectionDialect } from "../../../effected/templates/SectionDialect.ts";
import { scan } from "../../../effected/templates/internal/scan.ts";

describe("scanner boundary coverage", () => {
  it.effect("counts a marker matched by duplicate styles only once", () => Effect.sync(() => {
    const dialect = SectionDialect.make({ phrase: "MANAGED SECTION", styles: [CommentStyle.hash, CommentStyle.hash] });
    const id = SectionId.make({ key: "tool", commentStyle: CommentStyle.hash });
    const result = scan(`${dialect.beginMarker(id)}\nbody\n${dialect.endMarker(id)}`, dialect);
    assert.strictEqual(result.ok, true);
    if (result.ok) {
      assert.strictEqual(result.sections.length, 1);
      assert.strictEqual(result.sections[0]?.section.content, "body");
    }
  }));
  it.effect("preserves a lone CR between marker lines as content", () => Effect.sync(() => {
    const dialect = SectionDialect.default;
    const id = SectionId.make({ key: "tool", commentStyle: CommentStyle.hash });
    for (const separator of ["\r"]) {
      const result = scan(`${dialect.beginMarker(id)}${separator}${dialect.endMarker(id)}`, dialect);
      assert.strictEqual(result.ok, true);
      if (result.ok) assert.strictEqual(result.sections[0]?.section.content, separator);
    }
  }));
});
