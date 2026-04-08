/**
 * Markdown rendering and schema transforms.
 *
 * @module @beep/schema/Markdown
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity/packages";
import { Effect, flow, SchemaGetter, SchemaIssue } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import type * as R from "effect/Record";
import * as S from "effect/Schema";

const $I = $SchemaId.create("Markdown");

type MarkdownRenderOptions = R.ReadonlyRecord<string, unknown>;
type MarkdownHtmlRender = (content: string, options?: undefined | MarkdownRenderOptions) => unknown;

const encodeUnsupported = (value: unknown): Effect.Effect<string, SchemaIssue.Issue> =>
  Effect.fail(
    new SchemaIssue.InvalidValue(O.some(value), {
      message: "Encoding HTML output back into Markdown text is not supported by MarkdownTextToHtml.",
    })
  );

const invalidMarkdownInput: {
  (content: string, message: string): SchemaIssue.InvalidValue;
  (message: string): (content: string) => SchemaIssue.InvalidValue;
} = dual(
  2,
  (content: string, message: string): SchemaIssue.InvalidValue =>
    new SchemaIssue.InvalidValue(O.some(content), {
      message,
    })
);

const getMarkdownHtmlRender = (): O.Option<MarkdownHtmlRender> => {
  const bunRuntime = Reflect.get(globalThis, "Bun");
  const markdown = P.isObject(bunRuntime) ? Reflect.get(bunRuntime, "markdown") : undefined;
  const html = P.isObject(markdown) ? Reflect.get(markdown, "html") : undefined;
  if (P.isFunction(html)) {
    const renderMarkdownHtml: MarkdownHtmlRender = (content, options) => html(content, options);
    return O.some(renderMarkdownHtml);
  }
  return O.none();
};

const makeRenderMarkdownHtml = (options?: MarkdownRenderOptions) =>
  Effect.fn("Markdown.renderMarkdownHtml")(function* (content: string) {
    const renderMarkdownHtml = yield* O.match(getMarkdownHtmlRender(), {
      onNone: () =>
        Effect.fail(invalidMarkdownInput(content, "Bun.markdown.html is unavailable in the current runtime.")),
      onSome: Effect.succeed,
    });
    const rendered = yield* Effect.try({
      try: () => renderMarkdownHtml(content, options),
      catch: (cause) =>
        invalidMarkdownInput(
          content,
          P.isError(cause) ? `Invalid Markdown input (${cause.message}).` : "Invalid Markdown input."
        ),
    });

    return yield* S.decodeUnknownEffect(S.String)(rendered).pipe(
      Effect.mapError(() => invalidMarkdownInput(content, "Invalid Markdown input (Expected HTML string output)."))
    );
  });

/**
 * Schema factory that renders Markdown text into HTML using `Bun.markdown.html`.
 *
 * Returns a schema transformation from Markdown source text to rendered HTML
 * text. Encoding back to Markdown is not supported.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { MarkdownTextToHtml } from "@beep/schema/Markdown"
 *
 * const program = Effect.gen(function* () {
 *   const html = yield* S.decodeUnknownEffect(MarkdownTextToHtml())(
 *     "# Hello\n\nWorld"
 *   )
 *   return html
 * })
 * void program
 * ```
 *
 * @param options - Optional Bun Markdown parser options. When omitted, Bun defaults are preserved.
 * @returns Schema transformation from Markdown text to rendered HTML text.
 * @category Validation
 * @since 0.0.0
 */
export const MarkdownTextToHtml = (options?: MarkdownRenderOptions) => {
  const renderMarkdownHtml = makeRenderMarkdownHtml(options);

  return S.String.pipe(
    S.decodeTo(S.String, {
      decode: SchemaGetter.transformOrFail(renderMarkdownHtml),
      encode: SchemaGetter.transformOrFail(encodeUnsupported),
    }),
    S.annotate(
      $I.annote("MarkdownTextToHtml", {
        description: "Schema factory that renders Markdown text into HTML text with Bun's Markdown runtime.",
      })
    )
  );
};

/**
 * Builds a decoder that renders Markdown text to HTML and then decodes the
 * result through a target schema.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { decodeMarkdownTextAs } from "@beep/schema/Markdown"
 *
 * const decodeHtml = decodeMarkdownTextAs(S.String)
 *
 * const program = Effect.gen(function* () {
 *   const html = yield* decodeHtml("# Hello")
 *   return html
 * })
 * void program
 * ```
 *
 * @param schema - Target schema to decode rendered HTML output into.
 * @param options - Optional Bun Markdown parser options. When omitted, Bun defaults are preserved.
 * @returns Decoder function from Markdown text to the target schema type.
 * @category Utility
 * @since 0.0.0
 */
export const decodeMarkdownTextAs = <Schema extends S.Top>(schema: Schema, options?: MarkdownRenderOptions) => {
  const decodeMarkdownHtmlText = S.decodeUnknownEffect(MarkdownTextToHtml(options));
  const decodeTarget = S.decodeUnknownEffect(schema);

  return flow(decodeMarkdownHtmlText, Effect.flatMap(decodeTarget));
};
