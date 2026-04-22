/**
 * Internal Markdown runtime helpers.
 *
 * @since 0.0.0
 */
import { pipe } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Result from "effect/Result";
import * as MarkdownPackage from "micromark";
import * as MarkdownGfmPackage from "micromark-extension-gfm";

type MarkdownHtmlRender = (input: string) => unknown;

type BunMarkdownRuntime = {
  readonly markdown: {
    readonly html: MarkdownHtmlRender;
  };
};

type MarkdownRuntime = {
  readonly Bun?: BunMarkdownRuntime;
};

type MarkdownModule = typeof MarkdownPackage;
type MarkdownGfmModule = typeof MarkdownGfmPackage;

type MarkdownModuleLoader = () => MarkdownModule;
type MarkdownGfmModuleLoader = () => MarkdownGfmModule;

export type MarkdownParseResult =
  | {
      readonly _tag: "success";
      readonly html: string;
    }
  | {
      readonly _tag: "failure";
      readonly message: string;
    };

export const loadMarkdownModule = (): MarkdownModule => MarkdownPackage;

export const loadMarkdownGfmModule = (): MarkdownGfmModule => MarkdownGfmPackage;

const invalidMarkdownOutput = "Invalid Markdown input (Expected HTML string output).";

const renderMarkdownIssueMessage = (cause: unknown): string =>
  P.isError(cause) ? `Invalid Markdown input (${cause.message}).` : "Invalid Markdown input.";

const getBunRuntime = (runtime: MarkdownRuntime): O.Option<BunMarkdownRuntime> => O.fromNullishOr(runtime.Bun);

const getBunMarkdownHtml = (input: unknown): O.Option<MarkdownHtmlRender> =>
  pipe(
    O.fromNullishOr(input),
    O.filter(P.isObject),
    O.flatMap((value) => (P.hasProperty(value, "Bun") ? O.fromNullishOr(value.Bun) : O.none())),
    O.filter(P.isObject),
    O.flatMap((value) => (P.hasProperty(value, "markdown") ? O.fromNullishOr(value.markdown) : O.none())),
    O.filter(P.isObject),
    O.flatMap((value) =>
      P.hasProperty(value, "html")
        ? (() => {
            const html = value.html;

            return P.isFunction(html) ? O.some((input: string) => html(input)) : O.none();
          })()
        : O.none()
    )
  );

const toMarkdownParseResult = (result: Result.Result<unknown, unknown>): MarkdownParseResult =>
  pipe(
    result,
    Result.match({
      onFailure: (cause) =>
        ({
          _tag: "failure",
          message: renderMarkdownIssueMessage(cause),
        }) satisfies MarkdownParseResult,
      onSuccess: (html) =>
        P.isString(html)
          ? ({
              _tag: "success",
              html,
            } satisfies MarkdownParseResult)
          : ({
              _tag: "failure",
              message: invalidMarkdownOutput,
            } satisfies MarkdownParseResult),
    })
  );

export const getGlobalMarkdownRuntime = (): MarkdownRuntime =>
  pipe(
    getBunMarkdownHtml(globalThis),
    O.map((html) => ({
      Bun: {
        markdown: {
          html,
        },
      },
    })),
    O.getOrElse(() => ({}))
  );

export const makeParseMarkdownForSchema =
  (runtime: MarkdownRuntime, loadMarkdown: MarkdownModuleLoader, loadMarkdownGfm: MarkdownGfmModuleLoader) =>
  (input: string): MarkdownParseResult =>
    pipe(
      getBunRuntime(runtime),
      O.match({
        onNone: () =>
          toMarkdownParseResult(
            Result.try(() => {
              const markdown = loadMarkdown();
              const markdownGfm = loadMarkdownGfm();

              return markdown.micromark(input, {
                extensions: [markdownGfm.gfm()],
                htmlExtensions: [markdownGfm.gfmHtml()],
              });
            })
          ),
        onSome: ({ markdown }) => toMarkdownParseResult(Result.try(() => markdown.html(input))),
      })
    );
