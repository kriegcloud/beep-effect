/**
 * The Palantiri HttpApi contract, its handlers, and an in-process client.
 *
 * **Details**
 *
 * Every host serves parcels through this one contract, so the CLI's `--json`
 * output and the MCP host's tool results are the same encoded envelope. The
 * in-process client runs the real request encoding, routing, response
 * encoding and client decoding without a socket. It runs the handler in the
 * caller's fiber, so `Parcels.read` nests under the caller's span and records
 * metrics in the caller's registry.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $PalantiriId } from "@beep/identity/packages";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Etag from "effect/http/Etag";
import * as HttpPlatform from "effect/http/HttpPlatform";
import * as HttpApi from "effect/http-api/HttpApi";
import * as HttpApiBuilder from "effect/http-api/HttpApiBuilder";
import * as HttpApiEndpoint from "effect/http-api/HttpApiEndpoint";
import * as HttpApiGroup from "effect/http-api/HttpApiGroup";
import * as HttpApiSchema from "effect/http-api/HttpApiSchema";
import * as HttpApiTest from "effect/http-api/HttpApiTest";
import * as OpenApi from "effect/http-api/OpenApi";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { ParcelBudget, ParcelReadOptions, SessionKey } from "./Parcel.models.ts";
import { ParcelEnvelope } from "./ParcelEnvelope.models.ts";
import { UnknownParcel } from "./Parcels.errors.ts";
import { Parcels } from "./Parcels.service.ts";
import type * as HttpApiClient from "effect/http-api/HttpApiClient";

const $I = $PalantiriId.create("Parcels.api");

/**
 * The `parcels` group: `GET /parcels/:id`, with optional `budget` and
 * `session` queries (`session` is read by `since-last-check`).
 *
 * **Example** (Read the group identifier)
 *
 * ```ts
 * import { ParcelsApiGroup } from "@beep/palantiri/Parcels.api"
 *
 * console.log(ParcelsApiGroup.identifier) // "parcels"
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const ParcelsApiGroup = HttpApiGroup.make("parcels").add(
  HttpApiEndpoint.get("read", "/parcels/:id", {
    params: { id: S.String },
    query: {
      budget: S.optionalKey(S.FiniteFromString.pipe(S.decodeTo(ParcelBudget))),
      session: S.optionalKey(SessionKey),
    },
    success: ParcelEnvelope,
    error: UnknownParcel.pipe(HttpApiSchema.status(404)),
  }).annotate(OpenApi.Summary, "Read one parcel: summary, freshness, budget-capped items and an N-of-M receipt.")
);

/**
 * The Palantiri HttpApi.
 *
 * **Example** (Read the API identifier)
 *
 * ```ts
 * import { PalantiriApi } from "@beep/palantiri/Parcels.api"
 *
 * console.log(PalantiriApi.identifier) // "PalantiriApi"
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const PalantiriApi = HttpApi.make("PalantiriApi")
  .annotate(OpenApi.Title, "Palantiri")
  .annotate(OpenApi.Description, "Schema-typed, freshness-checked observability parcels for agents.")
  .add(ParcelsApiGroup);

/**
 * Handlers for the `parcels` group, served by the {@link Parcels} service.
 *
 * **Example** (Build the handlers layer)
 *
 * ```ts
 * import { layerParcelsHandlers } from "@beep/palantiri/Parcels.api"
 * import * as Layer from "effect/Layer"
 *
 * console.log(Layer.isLayer(layerParcelsHandlers)) // true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const layerParcelsHandlers = HttpApiBuilder.group(
  PalantiriApi,
  "parcels",
  Effect.fnUntraced(function* (handlers) {
    const parcels = yield* Parcels;
    return handlers.handle("read", ({ params, query }) =>
      parcels.read(params.id, ParcelReadOptions.make({ ...query, session: O.fromUndefinedOr(query.session) }))
    );
  })
);

/**
 * An in-process typed client for the Palantiri API.
 *
 * **Example** (Read a parcel through the client)
 *
 * ```ts
 * import { PalantiriClient } from "@beep/palantiri/Parcels.api"
 * import * as Effect from "effect/Effect"
 *
 * const program = PalantiriClient.use((client) => client.parcels.read({ params: { id: "account-headroom" }, query: {} }))
 * console.log(Effect.isEffect(program)) // true
 * ```
 *
 * @category clients
 * @since 0.0.0
 */
export class PalantiriClient extends Context.Service<PalantiriClient, HttpApiClient.ForApi<typeof PalantiriApi>>()(
  $I`PalantiriClient`
) {}

/**
 * {@link PalantiriClient} served in process by the {@link Parcels} service.
 *
 * **Details**
 *
 * Built on `HttpApiTest.groups`, Effect's socket-free pipeline: requests are
 * encoded, routed, handled and decoded exactly as over HTTP. File-backed
 * response support needs `FileSystem` and `Path`; parcels never use it.
 *
 * **Example** (Build the client layer)
 *
 * ```ts
 * import { layerPalantiriClientInProcess } from "@beep/palantiri/Parcels.api"
 * import * as Layer from "effect/Layer"
 *
 * console.log(Layer.isLayer(layerPalantiriClientInProcess)) // true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const layerPalantiriClientInProcess = Layer.effect(
  PalantiriClient,
  HttpApiTest.groups(PalantiriApi, ["parcels"], { baseUrl: "http://palantiri.local" })
).pipe(Layer.provide(layerParcelsHandlers), Layer.provide(Layer.mergeAll(Etag.layer, HttpPlatform.layer)));
