/**
 * Runtime OPIP content loading with Sanity fallback.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $OpipWebId } from "@beep/identity/packages";
import { Sanity, SanityConfigInput, type SanityError, SanityQueryRequest } from "@beep/sanity";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { Config, Effect, Layer, pipe, Redacted } from "effect";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { FetchHttpClient } from "effect/unstable/http";
import { opipSiteContent } from "./OpipContent.data";
import { decodeOpipSiteContent, type OpipSiteContent } from "./OpipContent.model";

const $I = $OpipWebId.create("content/OpipContent.runtime");
const query = '*[_type == "opipSiteContent" && slug.current == "home"][0]';

const OpipContentLoadErrorReason = LiteralKit(["config", "decode", "provider"] as const).pipe(
  $I.annoteSchema("OpipContentLoadErrorReason", {
    description: "Sanitized OPIP content loading failure reason.",
  })
);

type OpipContentLoadErrorReason = typeof OpipContentLoadErrorReason.Type;

type OpipContentLoadErrorOptions = {
  readonly provider?: string;
  readonly providerReason?: string;
  readonly status?: number;
};

class OpipContentLoadError extends TaggedErrorClass<OpipContentLoadError>($I`OpipContentLoadError`)(
  "OpipContentLoadError",
  {
    provider: S.optionalKey(S.String),
    providerReason: S.optionalKey(S.String),
    reason: OpipContentLoadErrorReason,
    status: S.optionalKey(S.Number),
  },
  $I.annote("OpipContentLoadError", {
    description: "Typed server-side OPIP content loading failure.",
  })
) {
  static readonly fromReason = (
    reason: OpipContentLoadErrorReason,
    options: OpipContentLoadErrorOptions = {}
  ): OpipContentLoadError =>
    new OpipContentLoadError({
      reason,
      ...R.getSomes({
        provider: O.fromUndefinedOr(options.provider),
        providerReason: O.fromUndefinedOr(options.providerReason),
      }),
      ...R.getSomes({
        status: O.fromUndefinedOr(options.status),
      }),
    });
}

const trimConfigOption = (value: O.Option<string>): O.Option<string> =>
  pipe(value, O.map(Str.trim), O.filter(Str.isNonEmpty));

const readTextConfigOption = Effect.fn("OpipContent.readTextConfigOption")(function* (key: string) {
  const value = yield* Config.string(key).pipe(
    Config.option,
    Effect.mapError(() => OpipContentLoadError.fromReason("config"))
  );
  return trimConfigOption(value);
});

const readRedactedConfigOption = Effect.fn("OpipContent.readRedactedConfigOption")(function* (key: string) {
  const value = yield* Config.redacted(key).pipe(
    Config.option,
    Effect.mapError(() => OpipContentLoadError.fromReason("config"))
  );
  return pipe(
    value,
    O.filter((secret) => Str.isNonEmpty(Str.trim(Redacted.value(secret))))
  );
});

const sanityConfig = Effect.fn("OpipContent.sanityConfig")(function* () {
  const projectId = yield* readTextConfigOption("SANITY_PROJECT_ID");
  const dataset = yield* readTextConfigOption("SANITY_DATASET");

  if (O.isNone(projectId) || O.isNone(dataset)) {
    return O.none();
  }

  return O.some(
    new SanityConfigInput({
      ...R.getSomes({ projectId, dataset }),
      ...R.getSomes({ apiHost: yield* readTextConfigOption("SANITY_API_HOST") }),
      ...R.getSomes({ apiVersion: yield* readTextConfigOption("SANITY_API_VERSION") }),
      ...R.getSomes({ apiToken: yield* readRedactedConfigOption("SANITY_API_TOKEN") }),
    })
  );
});

const loadFromSanity = (config: SanityConfigInput): Effect.Effect<OpipSiteContent, OpipContentLoadError> =>
  Effect.gen(function* () {
    const sanity = yield* Sanity;
    const response = yield* sanity.fetch(new SanityQueryRequest({ query }));
    return yield* decodeOpipSiteContent(response.result).pipe(
      Effect.mapError(() => OpipContentLoadError.fromReason("decode", { provider: "sanity" }))
    );
  }).pipe(
    // @effect-diagnostics-next-line strictEffectProvide:off
    Effect.provide(Sanity.makeLayer(config).pipe(Layer.provide(FetchHttpClient.layer))),
    Effect.catchTag("SanityError", (error: SanityError) =>
      Effect.fail(
        OpipContentLoadError.fromReason("provider", {
          provider: "sanity",
          providerReason: error.reason,
          ...R.getSomes({ status: O.fromUndefinedOr(error.status) }),
        })
      )
    )
  );

const fallbackToStaticContent = (error: OpipContentLoadError): Effect.Effect<OpipSiteContent> =>
  Effect.logWarning("OPIP content loader fell back to checked-in content.").pipe(
    Effect.annotateLogs({
      operation: "opip.content.load",
      outcome: "fallback",
      reason: error.reason,
      ...R.getSomes({
        provider: O.fromUndefinedOr(error.provider),
        providerReason: O.fromUndefinedOr(error.providerReason),
      }),
      ...R.getSomes({
        status: O.fromUndefinedOr(error.status),
      }),
    }),
    Effect.as(opipSiteContent)
  );

/**
 * Loads OPIP site content from Sanity when configured, falling back to the
 * checked-in launch content for local development, builds, and provider errors.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { loadOpipSiteContent } from "@beep/opip-web/content"
 *
 * Effect.runPromise(loadOpipSiteContent)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const loadOpipSiteContent = Effect.gen(function* () {
  const config = yield* sanityConfig();

  if (O.isNone(config)) {
    return opipSiteContent;
  }

  return yield* loadFromSanity(config.value);
}).pipe(Effect.catchTag("OpipContentLoadError", fallbackToStaticContent));

/**
 * Promise boundary for Next.js server components.
 *
 * @example
 * ```ts
 * import { getOpipSiteContent } from "@beep/opip-web/content"
 *
 * getOpipSiteContent().then((content) => console.log(content.metadata.siteName))
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const getOpipSiteContent = (): Promise<OpipSiteContent> => Effect.runPromise(loadOpipSiteContent);
