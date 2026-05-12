/**
 * Runpod LLM documentation index client.
 *
 * @packageDocumentation
 * @since 0.1.0
 */

import { $RunpodId } from "@beep/identity";
import { Config, Context, Effect, flow, Layer, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { FetchHttpClient } from "effect/unstable/http";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import type * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import { RUNPOD_DOCS_INDEX_URL, RunpodDocsConfigInput } from "./Runpod.config.ts";
import { RunpodDocsError } from "./Runpod.errors.ts";

const $I = $RunpodId.create("Runpod.docs");

/**
 * One Markdown documentation link parsed from Runpod's `llms.txt` index.
 *
 * @category models
 * @since 0.1.0
 */
export class RunpodDocsIndexEntry extends S.Class<RunpodDocsIndexEntry>($I`RunpodDocsIndexEntry`)(
  {
    description: S.optionalKey(S.String),
    section: S.String,
    title: S.String,
    url: S.String,
  },
  $I.annote("RunpodDocsIndexEntry", {
    description: "One Markdown documentation link parsed from Runpod's llms.txt index.",
  })
) {}

/**
 * Parsed Runpod documentation index.
 *
 * @category models
 * @since 0.1.0
 */
export class RunpodDocsIndex extends S.Class<RunpodDocsIndex>($I`RunpodDocsIndex`)(
  {
    entries: S.Array(RunpodDocsIndexEntry),
    title: S.String,
  },
  $I.annote("RunpodDocsIndex", {
    description: "Parsed Runpod documentation index from docs.runpod.io/llms.txt.",
  })
) {}

/**
 * Public service shape for the Runpod documentation index client.
 *
 * @category services
 * @since 0.1.0
 */
type RunpodDocsShape = {
  readonly fetchIndex: () => Effect.Effect<RunpodDocsIndex, RunpodDocsError>;
};

type ResolvedRunpodDocsConfig = {
  readonly headers: Readonly<Record<string, string>>;
  readonly indexUrl: string;
};

type DocsParseState = {
  readonly entries: ReadonlyArray<RunpodDocsIndexEntry>;
  readonly section: string;
  readonly title: O.Option<string>;
};

const defaultDocsSection = "Docs";
const normalizeUrl = Str.replace(/\/+$/, "");

const resolveConfig = (config: RunpodDocsConfigInput): ResolvedRunpodDocsConfig => ({
  headers: config.headers ?? {},
  indexUrl: config.indexUrl ?? RUNPOD_DOCS_INDEX_URL,
});

const nonEmptyTrimmed: (value: string) => O.Option<string> = flow(Str.trim, O.liftPredicate(Str.isNonEmpty));

const descriptionFrom: (value: string) => O.Option<string> = flow(
  Str.trim,
  O.liftPredicate(Str.startsWith(": ")),
  O.map(Str.slice(2)),
  O.flatMap(nonEmptyTrimmed)
);

const parseEntry = (section: string, line: string): O.Option<RunpodDocsIndexEntry> => {
  if (!pipe(line, Str.startsWith("- ["))) {
    return O.none();
  }

  const body = Str.slice(3)(line);
  return pipe(
    Str.indexOf("](")(body),
    O.flatMap((titleEnd) => {
      const afterTitle = Str.slice(titleEnd + 2)(body);
      return pipe(
        Str.indexOf(")")(afterTitle),
        O.map((urlEnd) => {
          const description = descriptionFrom(Str.slice(urlEnd + 1)(afterTitle));
          return new RunpodDocsIndexEntry({
            section,
            title: Str.slice(0, titleEnd)(body),
            url: Str.slice(0, urlEnd)(afterTitle),
            ...R.getSomes({
              description,
            }),
          });
        })
      );
    })
  );
};

const parseLine = (state: DocsParseState, rawLine: string): DocsParseState => {
  const line = Str.trim(rawLine);

  if (pipe(line, Str.startsWith("# "))) {
    return {
      ...state,
      title: O.some(Str.trim(Str.slice(2)(line))),
    };
  }

  if (pipe(line, Str.startsWith("## "))) {
    return {
      ...state,
      section: Str.trim(Str.slice(3)(line)),
    };
  }

  return pipe(
    parseEntry(state.section, line),
    O.match({
      onNone: () => state,
      onSome: (entry) => ({
        ...state,
        entries: A.append(state.entries, entry),
      }),
    })
  );
};

/**
 * Parse Runpod's `llms.txt` Markdown index into a structured schema model.
 *
 * @category parsing
 * @since 0.1.0
 */
export const parseRunpodDocsIndex = (text: string): Effect.Effect<RunpodDocsIndex, RunpodDocsError> =>
  Effect.gen(function* () {
    const state = pipe(
      A.fromIterable(Str.linesIterator(text)),
      A.reduce(
        {
          entries: A.empty<RunpodDocsIndexEntry>(),
          section: defaultDocsSection,
          title: O.none<string>(),
        },
        parseLine
      )
    );

    if (A.isReadonlyArrayEmpty(state.entries)) {
      return yield* RunpodDocsError.fromReason("parse");
    }

    return new RunpodDocsIndex({
      entries: state.entries,
      title: O.getOrElse(state.title, () => "Runpod Documentation"),
    });
  }).pipe(
    Effect.withSpan("RunpodDocs.parseIndex", {
      attributes: {
        provider: "runpod",
      },
    })
  );

const ensureSuccessStatus = (
  url: string,
  response: HttpClientResponse.HttpClientResponse
): Effect.Effect<HttpClientResponse.HttpClientResponse, RunpodDocsError> =>
  response.status >= 200 && response.status < 300
    ? Effect.succeed(response)
    : Effect.fail(RunpodDocsError.fromReason("response status", { status: response.status, url }));

const fetchIndex = Effect.fn("RunpodDocs.fetchIndex")(function* (
  client: HttpClient.HttpClient,
  config: ResolvedRunpodDocsConfig
) {
  return yield* pipe(
    HttpClientRequest.get(config.indexUrl),
    HttpClientRequest.setHeaders(config.headers),
    HttpClientRequest.accept("text/plain"),
    (request) => client.execute(request),
    Effect.mapError((cause) => RunpodDocsError.fromReason("transport", { cause, url: config.indexUrl })),
    Effect.flatMap((response) => ensureSuccessStatus(config.indexUrl, response)),
    Effect.flatMap((response) =>
      response.text.pipe(
        Effect.mapError((cause) => RunpodDocsError.fromReason("response decoding", { cause, url: config.indexUrl }))
      )
    ),
    Effect.flatMap(parseRunpodDocsIndex),
    Effect.withSpan("RunpodDocs.fetchIndex", {
      attributes: {
        provider: "runpod",
        url: normalizeUrl(config.indexUrl),
      },
    })
  );
});

const makeFetchIndex = (
  client: HttpClient.HttpClient,
  config: ResolvedRunpodDocsConfig
): RunpodDocsShape["fetchIndex"] => Effect.fn("RunpodDocs.fetchIndex")(() => fetchIndex(client, config));

/**
 * Effect service for the Runpod LLM documentation index.
 *
 * @category services
 * @since 0.1.0
 */
export class RunpodDocs extends Context.Service<RunpodDocs, RunpodDocsShape>()($I`RunpodDocs`) {
  /**
   * Build a Runpod docs layer from explicit runtime configuration.
   *
   * @category layers
   * @since 0.1.0
   */
  static readonly makeLayer = (
    config = new RunpodDocsConfigInput({})
  ): Layer.Layer<RunpodDocs, never, HttpClient.HttpClient> =>
    Layer.effect(
      RunpodDocs,
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;
        const resolved = resolveConfig(config);
        return RunpodDocs.of({
          fetchIndex: makeFetchIndex(client, resolved),
        });
      })
    );

  /**
   * Live Runpod docs layer backed by `RUNPOD_DOCS_INDEX_URL` when provided.
   *
   * @category layers
   * @since 0.1.0
   */
  static readonly layer: Layer.Layer<RunpodDocs, RunpodDocsError> = Layer.effect(
    RunpodDocs,
    Effect.gen(function* () {
      const indexUrl = yield* Config.string("RUNPOD_DOCS_INDEX_URL").pipe(Config.withDefault(RUNPOD_DOCS_INDEX_URL));
      const client = yield* HttpClient.HttpClient;

      return RunpodDocs.of({
        fetchIndex: makeFetchIndex(
          client,
          resolveConfig(
            new RunpodDocsConfigInput({
              indexUrl,
            })
          )
        ),
      });
    }).pipe(Effect.mapError((cause) => RunpodDocsError.fromReason("config", { cause })))
  ).pipe(Layer.provide(FetchHttpClient.layer));
}
