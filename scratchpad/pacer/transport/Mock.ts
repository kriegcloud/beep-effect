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

import { $ScratchpadId } from "@beep/identity";
import { LiteralKit, SchemaUtils } from "@beep/schema";
import { Effect, Layer } from "effect";
import * as Str from "effect/String";
import * as S from "effect/Schema";
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

const $I = $ScratchpadId.create("pacer/transport/Mock");

export const PacerAuthOption = LiteralKit(["success", "invalid"]).pipe(
  $I.annoteSchema("PacerAuthOption", {
    description: "cso-auth behavior.",
  })
);

export type PacerAuthOption = typeof PacerAuthOption.Type;

export const PacerBatchOption = LiteralKit(["complete", "failed"]).pipe(
  $I.annoteSchema("PacerBatchOption", {
    description: "Batch job terminal status.",
  })
);

export type PacerBatchOption = typeof PacerBatchOption.Type;

export const PacerCasesOption = LiteralKit(["success", "invalid-parameter", "unauthorized"]).pipe(
  $I.annoteSchema("PacerCasesOption", {
    description: "/cases/find behavior.",
  })
);

export type PacerCasesOption = typeof PacerCasesOption.Type;

/**
 * Selects which scenario the mock serves.
 *
 * @category models
 * @since 0.0.0
 */
export class PacerMockOptions extends S.Class<PacerMockOptions>($I`PacerMockOptions`)({
  /**
   * cso-auth behavior. Defaults to `"success"`.
   * @default success
   */
  auth: PacerAuthOption.pipe(
    SchemaUtils.withKeyDefaults(PacerAuthOption.Enum.success),
    S.annotateKey({
      description: "cso-auth behavior. Defaults to `'success'`.",
      default: "success",
    })
  ),
  /**
   * /cases/find behavior. Defaults to `'success'`.
   * @default success
   */
  cases: PacerCasesOption.pipe(
    SchemaUtils.withKeyDefaults(PacerCasesOption.Enum.success),
    S.annotateKey({
      description: "/cases/find behavior. Defaults to `'success'`.",
      default: "success",
    })
  ),
  /**
   * Batch job terminal status. Defaults to `"complete"`.
   * @default complete
   */
  batch: PacerBatchOption.pipe(
    SchemaUtils.withKeyDefaults(PacerBatchOption.Enum.complete),
    S.annotateKey({
      description: "Batch job terminal status. Defaults to `'complete'`.",
      default: "complete",
    })
  ),
}, $I.annote("PacerMockOptions", {
  description: "Selects which scenario the mock serves.",
})) {
}

export type PacerMockOptionsInput = Readonly<{
  readonly auth?: PacerAuthOption;
  readonly cases?: PacerCasesOption;
  readonly batch?: PacerBatchOption;
}>;

const resolveMockOptions = (options: PacerMockOptionsInput): PacerMockOptions =>
  PacerMockOptions.make({
    auth: options.auth ?? PacerAuthOption.Enum.success,
    cases: options.cases ?? PacerCasesOption.Enum.success,
    batch: options.batch ?? PacerBatchOption.Enum.complete,
  });

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
export const makePacerMockHttpClient = (
  options: PacerMockOptionsInput = {}
): Layer.Layer<HttpClient.HttpClient> => {
  const resolved = resolveMockOptions(options);
  const casePages = defaultCasePages();
  const partyBody = defaultPartyBody();
  return Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make((request, url) => {
      const path = url.pathname;
      if (Str.endsWith("/services/cso-auth")(path)) {
        return Effect.succeed(
          jsonResponse(request, 200, resolved.auth === "invalid" ? authInvalidBody : authSuccessBody)
        );
      }
      if (Str.endsWith("/services/cso-logout")(path)) {
        return Effect.succeed(jsonResponse(request, 200, logoutBody));
      }
      // Batch lifecycle (happy path): start -> status COMPLETED -> results -> delete.
      if (Str.includes("/cases/download/status/")(path)) {
        const id = Number(url.pathname.split("/").filter(Boolean).at(-1));
        const status = resolved.batch === "failed" ? "FAILED" : "COMPLETED";
        return Effect.succeed(
          jsonResponse(request, 200, reportInfoBody(Number.isFinite(id) ? id : DEFAULT_REPORT_ID, status))
        );
      }
      if (Str.includes("/cases/download/")(path)) {
        return Effect.succeed(jsonResponse(request, 200, downloadResultsBody()));
      }
      if (Str.endsWith("/cases/download")(path)) {
        return Effect.succeed(jsonResponse(request, 200, reportInfoBody(DEFAULT_REPORT_ID, "RUNNING")));
      }
      if (Str.includes("/cases/reports/")(path)) {
        return Effect.succeed(HttpClientResponse.fromWeb(request, new Response(null, { status: 204 })));
      }
      if (Str.endsWith("/cases/find")(path)) {
        if (resolved.cases === "invalid-parameter") {
          return Effect.succeed(jsonResponse(request, 406, invalidParameterBody));
        }
        if (resolved.cases === "unauthorized") {
          return Effect.succeed(jsonResponse(request, 401, { error: "unauthorized" }));
        }
        const requested = Number.parseInt(url.searchParams.get("page") ?? "0", 10);
        const page = Number.isFinite(requested) ? Math.min(Math.max(requested, 0), casePages.length - 1) : 0;
        return Effect.succeed(jsonResponse(request, 200, casePages[page]));
      }
      if (Str.endsWith("/parties/find")(path)) {
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
