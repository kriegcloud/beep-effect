/**
 * Runtime OIP content loading with Sanity fallback.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $OipWebId } from "@beep/identity/packages";
import { Sanity, SanityConfigInput, SanityQueryRequest } from "@beep/sanity";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { Str } from "@beep/utils";
import { Config, Effect, flow, Layer, pipe, Redacted } from "effect";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { FetchHttpClient } from "effect/unstable/http";
import { oipSiteContent } from "./OipContent.data.ts";
import { decodeOipSiteContent } from "./OipContent.model.ts";
import type { SanityError } from "@beep/sanity";
import type { OipSiteContent } from "./OipContent.model.ts";

const $I = $OipWebId.create("content/OipContent.runtime");
const query = '*[_type == "oipSiteContent" && slug.current == "home"][0]';

const OipContentLoadErrorReason = LiteralKit(["config", "decode", "provider"]).pipe(
  $I.annoteSchema("OipContentLoadErrorReason", {
    description: "Sanitized OIP content loading failure reason.",
  })
);

type OipContentLoadErrorReason = typeof OipContentLoadErrorReason.Type;

type OipContentLoadErrorOptions = {
  readonly provider?: string;
  readonly providerReason?: string;
  readonly status?: number;
};

class OipContentLoadError extends TaggedErrorClass<OipContentLoadError>($I`OipContentLoadError`)(
  "OipContentLoadError",
  {
    provider: S.optionalKey(S.String),
    providerReason: S.optionalKey(S.String),
    reason: OipContentLoadErrorReason,
    status: S.optionalKey(S.Finite),
  },
  $I.annote("OipContentLoadError", {
    description: "Typed server-side OIP content loading failure.",
  })
) {
  static readonly fromReason = (
    reason: OipContentLoadErrorReason,
    options: OipContentLoadErrorOptions = {}
  ): OipContentLoadError =>
    OipContentLoadError.make({
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

const trimConfigOption: (value: O.Option<string>) => O.Option<string> = flow(O.map(Str.trim), O.filter(Str.isNonEmpty));

const readTextConfigOption = Effect.fn("OipContent.readTextConfigOption")(function* (key: string) {
  const value = yield* Config.string(key).pipe(
    Config.option,
    Effect.mapError(() => OipContentLoadError.fromReason("config"))
  );
  return trimConfigOption(value);
});

const readRedactedConfigOption = Effect.fn("OipContent.readRedactedConfigOption")(function* (key: string) {
  const value = yield* Config.redacted(key).pipe(
    Config.option,
    Effect.mapError(() => OipContentLoadError.fromReason("config"))
  );
  return pipe(
    value,
    O.filter((secret) => Str.isNonEmpty(Str.trim(Redacted.value(secret))))
  );
});

const sanityConfig = Effect.fn("OipContent.sanityConfig")(function* () {
  const projectId = yield* readTextConfigOption("SANITY_PROJECT_ID");
  const dataset = yield* readTextConfigOption("SANITY_DATASET");

  if (O.isNone(projectId) || O.isNone(dataset)) {
    return O.none();
  }

  return O.some(
    SanityConfigInput.make({
      ...R.getSomes({ projectId, dataset }),
      ...R.getSomes({ apiHost: yield* readTextConfigOption("SANITY_API_HOST") }),
      ...R.getSomes({ apiVersion: yield* readTextConfigOption("SANITY_API_VERSION") }),
      ...R.getSomes({ apiToken: yield* readRedactedConfigOption("SANITY_API_TOKEN") }),
    })
  );
});

const loadFromSanity = (config: SanityConfigInput): Effect.Effect<OipSiteContent, OipContentLoadError> =>
  Effect.scoped(
    Layer.build(Sanity.makeLayer(config).pipe(Layer.provide(FetchHttpClient.layer))).pipe(
      Effect.flatMap((context) =>
        Effect.gen(function* () {
          const sanity = yield* Sanity;
          const response = yield* sanity.fetch(SanityQueryRequest.make({ query }));
          return yield* decodeOipSiteContent(response.result).pipe(
            Effect.mapError(() => OipContentLoadError.fromReason("decode", { provider: "sanity" }))
          );
        }).pipe(Effect.provide(context))
      )
    )
  ).pipe(
    Effect.catchTag("SanityError", (error: SanityError) =>
      Effect.fail(
        OipContentLoadError.fromReason("provider", {
          provider: "sanity",
          providerReason: error.reason,
          ...R.getSomes({ status: O.fromUndefinedOr(error.status) }),
        })
      )
    )
  );

const fallbackToStaticContent = (error: OipContentLoadError): Effect.Effect<OipSiteContent> =>
  Effect.logWarning("OIP content loader fell back to checked-in content.").pipe(
    Effect.annotateLogs({
      operation: "oip.content.load",
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
    Effect.as(oipSiteContent)
  );

/**
 * Loads OIP site content from Sanity when configured, falling back to the
 * checked-in launch content for local development, builds, and provider errors.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { loadOipSiteContent } from "@beep/oip-web/content"
 *
 * Effect.runPromise(loadOipSiteContent)
 * ```
 *
 * @effects Reads server runtime config, optionally queries Sanity, decodes the
 * returned content, and logs sanitized fallback metadata.
 * @category utilities
 * @since 0.0.0
 */
export const loadOipSiteContent = Effect.gen(function* () {
  const config = yield* sanityConfig();

  if (O.isNone(config)) {
    return oipSiteContent;
  }

  return yield* loadFromSanity(config.value);
}).pipe(Effect.catchTag("OipContentLoadError", fallbackToStaticContent));

/**
 * Promise boundary for Next.js server components.
 *
 * @example
 * ```ts
 * import { getOipSiteContent } from "@beep/oip-web/content"
 *
 * getOipSiteContent().then((content) => console.log(content.metadata.siteName))
 * ```
 *
 * @effects Runs {@link loadOipSiteContent} as the Promise boundary consumed by
 * Next.js server components.
 * @category utilities
 * @since 0.0.0
 */
export const getOipSiteContent = (): Promise<OipSiteContent> => Effect.runPromise(loadOipSiteContent);
