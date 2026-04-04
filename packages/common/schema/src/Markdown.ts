/**
 * Markdown rendering and schema transforms.
 *
 * @module @beep/schema/Markdown
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity/packages";
import { Effect, flow, SchemaIssue, SchemaTransformation } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $SchemaId.create("Markdown");

const encodeUnsupported = (value: unknown): Effect.Effect<string, SchemaIssue.Issue> =>
  Effect.fail(
    new SchemaIssue.InvalidValue(O.some(value), {
      message: "Encoding HTML output back into Markdown text is not supported by MarkdownTextToHtml.",
    })
  );

const invalidMarkdownInput = (content: string, message: string): SchemaIssue.InvalidValue =>
  new SchemaIssue.InvalidValue(O.some(content), {
    message,
  });

const makeRenderMarkdownHtml = (options?: Bun.markdown.Options) =>
  Effect.fn("Markdown.renderMarkdownHtml")(function* (content: string) {
    return yield* Effect.try({
      try: () => (options === undefined ? Bun.markdown.html(content) : Bun.markdown.html(content, options)),
      catch: (cause) =>
        invalidMarkdownInput(
          content,
          P.isError(cause) ? `Invalid Markdown input (${cause.message}).` : "Invalid Markdown input."
        ),
    });
  });

/**
 * Schema factory that renders Markdown text into HTML text using Bun's Markdown runtime.
 *
 * @param options - Optional Bun Markdown parser options. When omitted, Bun defaults are preserved.
 * @returns Schema transformation from Markdown text to rendered HTML text.
 * @category Validation
 * @since 0.0.0
 */
export const MarkdownTextToHtml = (options?: Bun.markdown.Options) => {
  const renderMarkdownHtml = makeRenderMarkdownHtml(options);

  return S.String.pipe(
    S.decodeTo(
      S.String,
      SchemaTransformation.transformOrFail({
        decode: renderMarkdownHtml,
        encode: encodeUnsupported,
      })
    ),
    S.annotate(
      $I.annote("MarkdownTextToHtml", {
        description: "Schema factory that renders Markdown text into HTML text with Bun's Markdown runtime.",
      })
    )
  );
};

/**
 * Decode Markdown text into a target schema using Bun-backed HTML rendering and schema decoding.
 *
 * @param schema - Target schema to decode rendered HTML output into.
 * @param options - Optional Bun Markdown parser options. When omitted, Bun defaults are preserved.
 * @returns Decoder function from Markdown text to the target schema type.
 * @category Utility
 * @since 0.0.0
 */
export const decodeMarkdownTextAs = <Schema extends S.Top>(schema: Schema, options?: Bun.markdown.Options) => {
  const decodeMarkdownHtmlText = S.decodeUnknownEffect(MarkdownTextToHtml(options));
  const decodeTarget = S.decodeUnknownEffect(schema);

  return flow(decodeMarkdownHtmlText, Effect.flatMap(decodeTarget));
};
