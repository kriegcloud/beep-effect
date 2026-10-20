/**
 * The read path every Palantiri surface shares: the in-process client
 * runtime, one parcel read under `TRACEPARENT`, session resolution and
 * freshness text. `beep palantiri parcel`, `beep palantiri mcp` and
 * `beep session open` all read through it, so their parcels are the same.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import {
  Freshness,
  layerPalantiriClientInProcess,
  layerParcels,
  PalantiriClient,
  ParcelReadOptions,
  SessionKey,
  withTraceParent,
} from "@beep/palantiri";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { sessionHarness } from "../Session/SessionLedger.service.ts";
import type { ParcelBudget, ParcelId, ParcelSources } from "@beep/palantiri";
import type * as FileSystem from "effect/FileSystem";
import type * as Path from "effect/Path";

/**
 * The in-process Palantiri client over the given source and telemetry
 * layers: the runtime every Palantiri command and the MCP host read through.
 *
 * **Details**
 *
 * The telemetry layer is provided underneath the client, so the handler it
 * runs sees the same tracer and exports through it.
 *
 * **Example** (Build the live runtime)
 *
 * ```ts
 * import { layerPalantiriRuntime, layerPalantiriSourcesLive, layerPalantiriTelemetry } from "@beep/repo-cli/test/Palantiri"
 * import * as Layer from "effect/Layer"
 *
 * console.log(Layer.isLayer(layerPalantiriRuntime(layerPalantiriSourcesLive, layerPalantiriTelemetry))) // true
 * ```
 *
 * @param sources - Every parcel source port.
 * @param telemetry - Tracer and metric export; `Layer.empty` exports nothing.
 * @returns The client layer.
 * @category layers
 * @since 0.0.0
 */
export const layerPalantiriRuntime: {
  <ET, RT>(
    telemetry: Layer.Layer<never, ET, RT>
  ): <EA, RA>(
    sources: Layer.Layer<ParcelSources, EA, RA>
  ) => Layer.Layer<PalantiriClient, EA | ET, FileSystem.FileSystem | Path.Path | RA | RT>;
  <EA, RA, ET, RT>(
    sources: Layer.Layer<ParcelSources, EA, RA>,
    telemetry: Layer.Layer<never, ET, RT>
  ): Layer.Layer<PalantiriClient, EA | ET, FileSystem.FileSystem | Path.Path | RA | RT>;
} = dual(
  2,
  <EA, RA, ET, RT>(
    sources: Layer.Layer<ParcelSources, EA, RA>,
    telemetry: Layer.Layer<never, ET, RT>
  ): Layer.Layer<PalantiriClient, EA | ET, FileSystem.FileSystem | Path.Path | RA | RT> =>
    layerPalantiriClientInProcess.pipe(
      Layer.provide(layerParcels),
      Layer.provide(sources),
      Layer.provideMerge(telemetry)
    )
);

/**
 * Read one parcel through the in-process client, under the caller's
 * `TRACEPARENT`.
 *
 * **Example** (Build the read effect)
 *
 * ```ts
 * import { ParcelReadOptions } from "@beep/palantiri"
 * import { readParcel } from "@beep/repo-cli/test/Palantiri"
 * import * as Effect from "effect/Effect"
 *
 * console.log(Effect.isEffect(readParcel("host-pressure", ParcelReadOptions.make({ budget: 5 })))) // true
 * ```
 *
 * @param id - The parcel to read.
 * @param options - The budget (default 20) and the session `since-last-check` reads.
 * @returns The decoded envelope.
 * @category utilities
 * @since 0.0.0
 */
export const readParcel = Effect.fn("Palantiri.readParcel")(function* (
  id: ParcelId,
  options: ParcelReadOptions = ParcelReadOptions.make({})
) {
  const client = yield* PalantiriClient;
  return yield* client.parcels
    .read({
      params: { id },
      query: O.match(options.session, {
        onNone: () => ({ budget: options.budget }),
        onSome: (session) => ({ budget: options.budget, session }),
      }),
    })
    .pipe(withTraceParent);
});

/**
 * The session a since-last-check read moves the cursor of: the given one,
 * else the harness session the process runs under (`CLAUDE_CODE_SESSION_ID`,
 * then `CODEX_THREAD_ID`), else `None`.
 *
 * **Example** (An explicit session wins)
 *
 * ```ts
 * import { resolveParcelSession } from "@beep/repo-cli/test/Palantiri"
 * import * as Effect from "effect/Effect"
 * import * as O from "effect/Option"
 *
 * console.log(Effect.isEffect(resolveParcelSession(O.some("s-1")))) // true
 * ```
 *
 * @param given - A session named by the caller, if any.
 * @returns The session, if one is known.
 * @category utilities
 * @since 0.0.0
 */
export const resolveParcelSession = (given: O.Option<SessionKey>): Effect.Effect<O.Option<SessionKey>> =>
  O.match(given, {
    onSome: Effect.succeedSome,
    onNone: () => sessionHarness.pipe(Effect.map((harness) => O.filter(harness.sessionId, S.is(SessionKey)))),
  });

/**
 * Read options from an optional budget and session; an absent budget keeps
 * the schema's default of 20.
 *
 * **Example** (Keep the default budget)
 *
 * ```ts
 * import { parcelReadOptions } from "@beep/repo-cli/test/Palantiri"
 * import * as O from "effect/Option"
 *
 * console.log(parcelReadOptions(O.none(), O.none()).budget) // 20
 * ```
 *
 * @param budget - The most items to return, if given.
 * @param session - The session `since-last-check` reads, if any.
 * @returns Options carrying the given budget, or the default of 20, and the session.
 * @category utilities
 * @since 0.0.0
 */
export const parcelReadOptions: {
  (session: O.Option<SessionKey>): (budget: O.Option<ParcelBudget>) => ParcelReadOptions;
  (budget: O.Option<ParcelBudget>, session: O.Option<SessionKey>): ParcelReadOptions;
} = dual(
  2,
  (budget: O.Option<ParcelBudget>, session: O.Option<SessionKey>): ParcelReadOptions =>
    ParcelReadOptions.make({
      ...O.match(budget, { onNone: () => ({}), onSome: (value) => ({ budget: value }) }),
      session,
    })
);

/**
 * A parcel's freshness as text: `fresh as of <time>`, or
 * `unknown (<reason>)` with its time and detail when known.
 *
 * **Example** (Render an unknown reading)
 *
 * ```ts
 * import { Freshness } from "@beep/palantiri"
 * import { renderFreshness } from "@beep/repo-cli/test/Palantiri"
 * import * as O from "effect/Option"
 *
 * console.log(renderFreshness(Freshness.cases.Unknown.make({ reason: "no-source", asOf: O.none(), detail: O.none() })))
 * // "unknown (no-source)"
 * ```
 *
 * @category formatting
 * @since 0.0.0
 */
export const renderFreshness: (freshness: Freshness) => string = Freshness.match({
  Fresh: (fresh) => `fresh as of ${DateTime.formatIso(fresh.asOf)}`,
  Unknown: (unknown) =>
    `unknown (${unknown.reason})${O.getOrElse(
      O.map(unknown.asOf, (asOf) => ` as of ${DateTime.formatIso(asOf)}`),
      () => ""
    )}${O.getOrElse(
      O.map(unknown.detail, (detail) => `: ${detail}`),
      () => ""
    )}`,
});

/**
 * A freshness bound as text: seconds, or `none (event-sourced)` for a parcel
 * with no bound.
 *
 * **Example** (Render a five-minute bound)
 *
 * ```ts
 * import { renderParcelBound } from "@beep/repo-cli/test/Palantiri"
 * import * as Duration from "effect/Duration"
 *
 * console.log(renderParcelBound(Duration.minutes(5))) // "300s"
 * console.log(renderParcelBound(Duration.infinity)) // "none (event-sourced)"
 * ```
 *
 * @param bound - The parcel's freshness bound.
 * @returns The bound as text.
 * @category formatting
 * @since 0.0.0
 */
export const renderParcelBound = (bound: Duration.Duration): string =>
  Duration.isFinite(bound) ? `${Duration.toSeconds(bound)}s` : "none (event-sourced)";
