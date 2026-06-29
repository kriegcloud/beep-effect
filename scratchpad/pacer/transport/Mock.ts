/**
 * Deterministic in-memory `HttpClient` layer for the PACER POC.
 *
 * Routes on the request URL and returns schema-derived bodies from
 * {@link ./Arbitraries.ts} (generated via `Schema.toArbitrary`, not hardcoded
 * JSON), so both the auth and PCL services run with no network and no
 * credentials. Options select the auth + cases error scenarios.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Effect, Layer } from "effect";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import {
  authInvalidBody,
  authSuccessBody,
  DEFAULT_REPORT_ID,
  defaultCasePages,
  defaultPartyBody,
  downloadResultsBody,
  invalidParameterBody,
  logoutBody,
  reportInfoBody,
} from "./Arbitraries.ts";

/**
 * Selects which scenario the mock serves.
 *
 * @category models
 * @since 0.0.0
 */
export interface PacerMockOptions {
  /** cso-auth behavior. Defaults to `"success"`. */
  readonly auth?: "success" | "invalid";
  /** /cases/find behavior. Defaults to `"success"`. */
  readonly cases?: "success" | "invalid-parameter" | "unauthorized";
  /** Batch job terminal status. Defaults to `"complete"`. */
  readonly batch?: "complete" | "failed";
}

const jsonResponse = (
  request: Parameters<Parameters<typeof HttpClient.make>[0]>[0],
  status: number,
  body: unknown
): HttpClientResponse.HttpClientResponse =>
  HttpClientResponse.fromWeb(
    request,
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })
  );

/**
 * Build a mock `HttpClient` layer for the chosen scenario. The case pages and
 * party rows are sampled from their schemas once per layer.
 *
 * @category layers
 * @since 0.0.0
 */
export const makePacerMockHttpClient = (options: PacerMockOptions = {}): Layer.Layer<HttpClient.HttpClient> => {
  const casePages = defaultCasePages();
  const partyBody = defaultPartyBody();
  return Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make((request, url) => {
      const path = url.pathname;
      if (path.endsWith("/services/cso-auth")) {
        return Effect.succeed(jsonResponse(request, 200, options.auth === "invalid" ? authInvalidBody : authSuccessBody));
      }
      if (path.endsWith("/services/cso-logout")) {
        return Effect.succeed(jsonResponse(request, 200, logoutBody));
      }
      // Batch lifecycle (happy path): start → status COMPLETED → results → delete.
      if (path.includes("/cases/download/status/")) {
        const id = Number(url.pathname.split("/").filter(Boolean).at(-1));
        const status = options.batch === "failed" ? "FAILED" : "COMPLETED";
        return Effect.succeed(jsonResponse(request, 200, reportInfoBody(Number.isFinite(id) ? id : DEFAULT_REPORT_ID, status)));
      }
      if (path.includes("/cases/download/")) {
        return Effect.succeed(jsonResponse(request, 200, downloadResultsBody()));
      }
      if (path.endsWith("/cases/download")) {
        return Effect.succeed(jsonResponse(request, 200, reportInfoBody(DEFAULT_REPORT_ID, "RUNNING")));
      }
      if (path.includes("/cases/reports/")) {
        return Effect.succeed(HttpClientResponse.fromWeb(request, new Response(null, { status: 204 })));
      }
      if (path.endsWith("/cases/find")) {
        if (options.cases === "invalid-parameter") {
          return Effect.succeed(jsonResponse(request, 406, invalidParameterBody));
        }
        if (options.cases === "unauthorized") {
          return Effect.succeed(jsonResponse(request, 401, { error: "unauthorized" }));
        }
        const requested = Number.parseInt(url.searchParams.get("page") ?? "0", 10);
        const page = Number.isFinite(requested) ? Math.min(Math.max(requested, 0), casePages.length - 1) : 0;
        return Effect.succeed(jsonResponse(request, 200, casePages[page]));
      }
      if (path.endsWith("/parties/find")) {
        return Effect.succeed(jsonResponse(request, 200, partyBody));
      }
      return Effect.succeed(jsonResponse(request, 404, { error: "not found", path }));
    })
  );
};

/**
 * The default happy-path mock `HttpClient` layer.
 *
 * @category layers
 * @since 0.0.0
 */
export const PacerMockHttpClient: Layer.Layer<HttpClient.HttpClient> = makePacerMockHttpClient();
