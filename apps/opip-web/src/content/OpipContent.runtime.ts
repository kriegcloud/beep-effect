/**
 * Runtime OPIP content loading with Sanity fallback.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Sanity, SanityConfigInput, SanityQueryRequest } from "@beep/sanity";
import { Effect, Layer, pipe, Redacted } from "effect";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";
import { FetchHttpClient } from "effect/unstable/http";
import { opipSiteContent } from "./OpipContent.data";
import { decodeOpipSiteContent, type OpipSiteContent } from "./OpipContent.model";

const query = '*[_type == "opipSiteContent" && slug.current == "home"][0]';

const envOption = (key: string): O.Option<string> =>
  pipe(process.env[key], O.fromUndefinedOr, O.map(Str.trim), O.filter(Str.isNonEmpty));

const sanityConfig = (): O.Option<SanityConfigInput> => {
  const projectId = envOption("SANITY_PROJECT_ID");
  const dataset = envOption("SANITY_DATASET");

  if (O.isNone(projectId) || O.isNone(dataset)) {
    return O.none();
  }

  return O.some(
    new SanityConfigInput({
      ...R.getSomes({ projectId, dataset }),
      ...R.getSomes({ apiHost: envOption("SANITY_API_HOST") }),
      ...R.getSomes({ apiVersion: envOption("SANITY_API_VERSION") }),
      ...R.getSomes({ apiToken: pipe(envOption("SANITY_API_TOKEN"), O.map(Redacted.make)) }),
    })
  );
};

const loadFromSanity = (config: SanityConfigInput): Effect.Effect<OpipSiteContent> =>
  Effect.gen(function* () {
    const sanity = yield* Sanity;
    const response = yield* sanity.fetch(new SanityQueryRequest({ query }));
    return yield* decodeOpipSiteContent(response.result);
  }).pipe(
    // @effect-diagnostics-next-line strictEffectProvide:off
    Effect.provide(Sanity.makeLayer(config).pipe(Layer.provide(FetchHttpClient.layer))),
    Effect.catch(() => Effect.succeed(opipSiteContent))
  );

/**
 * Loads OPIP site content from Sanity when configured, falling back to the
 * checked-in launch content for local development, builds, and provider errors.
 *
 * @category utilities
 * @since 0.0.0
 */
export const loadOpipSiteContent = Effect.gen(function* () {
  const config = sanityConfig();

  if (O.isNone(config)) {
    return opipSiteContent;
  }

  return yield* loadFromSanity(config.value);
});

/**
 * Promise boundary for Next.js server components.
 *
 * @category utilities
 * @since 0.0.0
 */
export const getOpipSiteContent = (): Promise<OpipSiteContent> => Effect.runPromise(loadOpipSiteContent);
