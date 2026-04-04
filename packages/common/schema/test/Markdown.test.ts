import { decodeMarkdownTextAs, MarkdownTextToHtml } from "@beep/schema/Markdown";
import { describe, expect, it } from "@effect/vitest";
import { Cause, Effect, Exit } from "effect";
import * as S from "effect/Schema";

describe("Markdown", () => {
  it.effect("renders Markdown text to HTML with Bun defaults", () =>
    Effect.gen(function* () {
      const html = yield* decodeMarkdownTextAs(S.String)("<script>x</script>");

      expect(html).toBe("<script>x</script>\n");
    })
  );

  it.effect("forwards Bun Markdown options through the schema factory", () =>
    Effect.gen(function* () {
      const html = yield* decodeMarkdownTextAs(S.String, { tagFilter: true })("<script>x</script>");

      expect(html).toBe("&lt;script>x&lt;/script>\n");
    })
  );

  it.effect("decodes rendered HTML into a target string schema", () =>
    Effect.gen(function* () {
      const rendered = yield* decodeMarkdownTextAs(S.NonEmptyString)("# Hello");

      expect(rendered).toBe("<h1>Hello</h1>\n");
    })
  );

  it.effect("fails to encode HTML output back into Markdown text", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(S.encodeEffect(MarkdownTextToHtml())("<h1>Hello</h1>\n"));

      expect(Exit.isFailure(result)).toBe(true);
      if (Exit.isFailure(result)) {
        const rendered = Cause.pretty(result.cause);

        expect(rendered).toContain("Encoding HTML output back into Markdown text is not supported");
      }
    })
  );
});
