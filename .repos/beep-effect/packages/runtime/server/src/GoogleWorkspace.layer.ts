/**
 * Google Workspace Layer Composition
 *
 * Composes Google Workspace adapters from various slices into a unified layer.
 * Each adapter depends on GoogleAuthClient and HttpClient. GoogleAuthClient
 * requires AuthContext which is provided per-request by the HttpRouter.
 *
 * @module runtime-server/GoogleWorkspace.layer
 * @since 0.1.0
 */

import { type GoogleCalendarAdapter, GoogleCalendarAdapterLive } from "@beep/calendar-server/adapters";
import { type GmailAdapter, GmailAdapterLive } from "@beep/comms-server/adapters";
import type { GoogleAuthClient } from "@beep/google-workspace-client";
import { GoogleAuthClientLive } from "@beep/google-workspace-server";
import { type GmailExtractionAdapter, GmailExtractionAdapterLive } from "@beep/knowledge-server/adapters";
import type { AuthContext } from "@beep/shared-domain/Policy";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as Layer from "effect/Layer";

/**
 * Google Auth layer requires AuthContext (provided per-request by HttpRouter).
 *
 * GoogleAuthClientLive captures AuthContext at layer construction time,
 * so it must be provided within the request context where AuthContext is available.
 */
const GoogleAuthLayer: Layer.Layer<GoogleAuthClient, never, AuthContext> = GoogleAuthClientLive;

/**
 * Calendar adapter with Google Auth and HTTP dependencies.
 *
 * Provides GoogleCalendarAdapter service for calendar event operations.
 */
const CalendarAdapterLayer: Layer.Layer<GoogleCalendarAdapter, never, AuthContext> = GoogleCalendarAdapterLive.pipe(
  Layer.provide(GoogleAuthLayer),
  Layer.provide(FetchHttpClient.layer)
);

/**
 * Gmail adapter for communications slice.
 *
 * Provides GmailAdapter service for email operations (send, list, get).
 */
const GmailAdapterLayer: Layer.Layer<GmailAdapter, never, AuthContext> = GmailAdapterLive.pipe(
  Layer.provide(GoogleAuthLayer),
  Layer.provide(FetchHttpClient.layer)
);

/**
 * Gmail extraction adapter for knowledge slice.
 *
 * Provides GmailExtractionAdapter service for read-only email extraction
 * optimized for knowledge graph ingestion.
 */
const GmailExtractionAdapterLayer: Layer.Layer<GmailExtractionAdapter, never, AuthContext> =
  GmailExtractionAdapterLive.pipe(Layer.provide(GoogleAuthLayer), Layer.provide(FetchHttpClient.layer));

/**
 * All Google Workspace services provided by this layer.
 */
export type Services = GoogleCalendarAdapter | GmailAdapter | GmailExtractionAdapter;

/**
 * Combined Google Workspace adapter layer.
 *
 * **IMPORTANT**: This layer requires `AuthContext` at construction time because
 * `GoogleAuthClientLive` captures user context during layer initialization.
 * This means it CANNOT be composed at router-level (before requests exist).
 *
 * Instead, provide this layer within handlers or RPC implementations where
 * `AuthContext` is available in the request context.
 *
 * @example
 * ```typescript
 * import * as GoogleWorkspace from "@beep/runtime-server/GoogleWorkspace.layer";
 * import { GoogleCalendarAdapter } from "@beep/calendar-server/adapters";
 * import * as Effect from "effect/Effect";
 * import * as Layer from "effect/Layer";
 *
 * // In a handler with AuthContext available in the request context:
 * const handler = Effect.gen(function* () {
 *   const calendar = yield* GoogleCalendarAdapter;
 *   return yield* calendar.listEvents("primary", timeMin, timeMax);
 * }).pipe(
 *   Effect.provide(GoogleWorkspace.layer)
 * );
 * ```
 */
export const layer: Layer.Layer<Services, never, AuthContext> = Layer.mergeAll(
  CalendarAdapterLayer,
  GmailAdapterLayer,
  GmailExtractionAdapterLayer
);
