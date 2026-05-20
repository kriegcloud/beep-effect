import { loadMarkdownGfmModule, loadMarkdownModule, makeParseMarkdownForSchema } from "@beep/schema/internal/markdown";
import { decodeMarkdownTextAs, Markdown, MarkdownTextToHtml } from "@beep/schema/Markdown";
import { describe, expect, it } from "@effect/vitest";
import { Cause, Effect, Exit } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const replaceGlobalBunMarkdownHtml = (html: unknown) =>
  Effect.sync(() => {
    const bunRuntime = Reflect.get(globalThis, "Bun");
    const markdown = P.isObject(bunRuntime) ? Reflect.get(bunRuntime, "markdown") : undefined;
    const original = P.isObject(markdown) ? Reflect.get(markdown, "html") : undefined;

    if (P.isObject(markdown)) {
      Reflect.set(markdown, "html", html);
    }

    return { markdown, original };
  });

const restoreGlobalBunMarkdownHtml = ({
  markdown,
  original,
}: {
  readonly markdown: unknown;
  readonly original: unknown;
}) =>
  Effect.sync(() => {
    if (P.isObject(markdown) && P.isFunction(original)) {
      Reflect.set(markdown, "html", original);
    }
  });

describe("Markdown", () => {
  it.effect("brands Markdown text accepted by the active parser", () =>
    Effect.gen(function* () {
      const decodeMarkdown = S.decodeUnknownEffect(Markdown);

      expect(yield* decodeMarkdown("# Hello")).toBe("# Hello");
      expect(yield* decodeMarkdown("plain text")).toBe("plain text");
      expect(yield* decodeMarkdown("")).toBe("");
    })
  );

  it("falls back to micromark with GFM extensions when Bun is unavailable", () => {
    const parseWithoutBun = makeParseMarkdownForSchema({}, loadMarkdownModule, {
      loadMarkdownGfm: loadMarkdownGfmModule,
    });
    const result = parseWithoutBun("| a | b |\n| - | - |\n| 1 | 2 |");

    expect(result._tag).toBe("success");
    if (result._tag === "success") {
      expect(result.html).toContain("<table>");
    }
  });

  it.effect("maps parser output failures into SchemaIssue.InvalidValue", () =>
    Effect.gen(function* () {
      const result = yield* Effect.acquireUseRelease(
        replaceGlobalBunMarkdownHtml(() => 1),
        () => Effect.exit(S.decodeUnknownEffect(Markdown)("# Hello")),
        restoreGlobalBunMarkdownHtml
      );

      expect(Exit.isFailure(result)).toBe(true);
      if (Exit.isFailure(result)) {
        const rendered = Cause.pretty(result.cause);

        expect(rendered).toContain("Invalid Markdown input (Expected HTML string output).");
      }
    })
  );

  it.effect("fails Markdown-to-HTML decoding when the Bun renderer is unavailable", () =>
    Effect.gen(function* () {
      const result = yield* Effect.acquireUseRelease(
        replaceGlobalBunMarkdownHtml(undefined),
        () => Effect.exit(S.decodeUnknownEffect(MarkdownTextToHtml())("# Hello")),
        restoreGlobalBunMarkdownHtml
      );

      expect(Exit.isFailure(result)).toBe(true);
      if (Exit.isFailure(result)) {
        const rendered = Cause.pretty(result.cause);

        expect(rendered).toContain("Bun.markdown.html is unavailable in the current runtime.");
      }
    })
  );

  it.effect("maps renderer exceptions into markdown parse failures", () =>
    Effect.gen(function* () {
      const errorResult = yield* Effect.acquireUseRelease(
        replaceGlobalBunMarkdownHtml(() => {
          throw new Error("renderer failed");
        }),
        () => Effect.exit(S.decodeUnknownEffect(MarkdownTextToHtml())("# Hello")),
        restoreGlobalBunMarkdownHtml
      );
      const unknownResult = yield* Effect.acquireUseRelease(
        replaceGlobalBunMarkdownHtml(() => {
          throw "renderer failed";
        }),
        () => Effect.exit(S.decodeUnknownEffect(MarkdownTextToHtml())("# Hello")),
        restoreGlobalBunMarkdownHtml
      );

      expect(Exit.isFailure(errorResult)).toBe(true);
      if (Exit.isFailure(errorResult)) {
        const rendered = Cause.pretty(errorResult.cause);

        expect(rendered).toContain("Invalid Markdown input (renderer failed).");
      }

      expect(Exit.isFailure(unknownResult)).toBe(true);
      if (Exit.isFailure(unknownResult)) {
        const rendered = Cause.pretty(unknownResult.cause);

        expect(rendered).toContain("Invalid Markdown input.");
      }
    })
  );

  it.effect("renders Markdown text to HTML with raw HTML filtering by default", () =>
    Effect.gen(function* () {
      const html = yield* decodeMarkdownTextAs(S.String)("<script>x</script>");

      expect(html).toBe("&lt;script>x&lt;/script>\n");
    })
  );

  it.effect("forwards Bun Markdown options through the schema factory", () =>
    Effect.gen(function* () {
      const html = yield* decodeMarkdownTextAs(S.String, { tagFilter: false })("<script>x</script>");

      expect(html).toBe("<script>x</script>\n");
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
