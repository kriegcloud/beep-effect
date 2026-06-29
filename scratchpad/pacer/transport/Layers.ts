/**
 * Composition of the PACER service layers over a chosen `HttpClient` layer.
 *
 * The only difference between the mock and live runs is which `HttpClient` layer
 * is passed in here (the deterministic mock vs `FetchHttpClient.layer`).
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Layer } from "effect";
import * as HttpClient from "effect/unstable/http/HttpClient";
import { PacerAuth, PacerSession } from "../auth/PacerAuth.service.ts";
import { PclClient } from "../pcl/PclClient.service.ts";
import type { PacerConfig } from "../Pacer.config.ts";
import type { PacerAuthError } from "../Pacer.errors.ts";

/**
 * The composed PACER layers for one configuration + transport.
 *
 * @category layers
 * @since 0.0.0
 */
export interface PacerLayers {
  readonly auth: Layer.Layer<PacerAuth>;
  readonly session: Layer.Layer<PacerSession, PacerAuthError>;
  readonly pcl: Layer.Layer<PclClient, PacerAuthError>;
  readonly full: Layer.Layer<PacerAuth | PacerSession | PclClient, PacerAuthError>;
}

/**
 * Compose `PacerAuth`, `PacerSession`, and `PclClient` over the given transport.
 *
 * @category layers
 * @since 0.0.0
 */
export const makePacerLayer = (
  cfg: PacerConfig,
  httpClient: Layer.Layer<HttpClient.HttpClient>
): PacerLayers => {
  const auth = PacerAuth.makeLayer(cfg).pipe(Layer.provide(httpClient));
  const session = PacerSession.layer.pipe(Layer.provide(auth));
  const pcl = PclClient.makeLayer(cfg).pipe(Layer.provide(Layer.merge(httpClient, session)));
  const full = Layer.mergeAll(pcl, session, auth);
  return { auth, session, pcl, full };
};
