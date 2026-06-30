/**
 * Typed PCL client derived from the {@link ./Pcl.api.ts} HttpApi definition via
 * `HttpApiClient.make`, plus a pagination stream over `/cases/find`.
 *
 * The derived client is base-URL-prefixed and, on every request, has the
 * current `nextGenCSO` token (read from {@link PacerSession}) injected as the
 * `X-NEXT-GEN-CSO` header (plus optional `X-CLIENT-CODE`). Any fresh token PACER
 * returns in the `X-NEXT-GEN-CSO` response header is written back to the
 * session Ref. Failures (status codes, decode errors) are mapped to the typed
 * {@link PacerPclError}.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $ScratchpadId } from "@beep/identity";
import { Context, Effect, Layer, pipe, Redacted, Ref, Stream } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import { HttpApiClient } from "effect/unstable/httpapi";
import { PacerSession } from "../auth/PacerAuth.service.ts";
import { PacerPclError } from "../Pacer.errors.ts";
import { NextGenCsoToken, ReportStatus } from "../Pacer.tokens.ts";
import { PclHttpApi } from "./Pcl.api.ts";
import type { PacerConfig } from "../Pacer.config.ts";
import type {
  CaseReportList,
  CaseResult,
  CourtCaseSearchDto,
  PartyReportList,
  PartySearchDto,
  ReportInfoType,
} from "./Pcl.models.ts";

const $I = $ScratchpadId.create("pacer/pcl/PclClient.service");

/** Max status polls before a batch download is treated as timed out (~10s at 200ms). */
const POLL_MAX_ATTEMPTS = 50;

/** Per-request timeout so a hung PACER endpoint can never block the program forever. */
const REQUEST_TIMEOUT = "30 seconds";

/** Hard cap on pagination, guarding against a server that never sets `pageInfo.last`. */
const PAGINATION_MAX_PAGES = 1000;

const extractStatus = (error: unknown): number | undefined =>
  P.hasProperty(error, "response") && P.hasProperty(error.response, "status") && P.isNumber(error.response.status)
    ? error.response.status
    : undefined;

const errorTag = (error: unknown): string | undefined =>
  P.hasProperty(error, "_tag") && P.isString(error._tag) ? error._tag : undefined;

const isTerminalReportStatus = (status: ReportStatus): boolean =>
  status === ReportStatus.Enum.COMPLETED || status === ReportStatus.Enum.FAILED;

const mapPclFailure = (error: unknown): PacerPclError => {
  const status = extractStatus(error);
  if (status !== undefined) {
    return PacerPclError.fromStatus(status);
  }
  const tag = errorTag(error);
  if (tag === "SchemaError" || tag === "DecodeError" || tag === "EmptyBodyError") {
    return PacerPclError.fromReason("response-decoding", { cause: String(error) });
  }
  return PacerPclError.fromReason("transport", { cause: String(error) });
};

/** Apply the shared per-request timeout and map any failure to a typed PacerPclError. */
const callPcl = <A, E>(effect: Effect.Effect<A, E>): Effect.Effect<A, PacerPclError> =>
  effect.pipe(Effect.timeout(REQUEST_TIMEOUT), Effect.mapError(mapPclFailure));

const makeInjectingClient = (
  base: HttpClient.HttpClient,
  cfg: PacerConfig,
  tokenRef: Ref.Ref<Redacted.Redacted<NextGenCsoToken>>
): HttpClient.HttpClient =>
  base.pipe(
    HttpClient.mapRequestEffect((request) =>
      Ref.get(tokenRef).pipe(
        Effect.map((token) => {
          const withToken = HttpClientRequest.setHeader(
            request,
            "X-NEXT-GEN-CSO",
            Redacted.value(token)
          ).pipe(HttpClientRequest.accept("application/json"));
          return O.match(cfg.clientCode, {
            onNone: () => withToken,
            onSome: (code) => HttpClientRequest.setHeader(withToken, "X-CLIENT-CODE", code),
          });
        })
      )
    ),
    HttpClient.transformResponse((effect) =>
      effect.pipe(
        Effect.tap((response) => {
          const fresh = response.headers["x-next-gen-cso"];
          return P.isString(fresh) && fresh.length > 0
            ? Ref.set(tokenRef, Redacted.make(NextGenCsoToken.make(fresh)))
            : Effect.void;
        })
      )
    )
  );

/**
 * Runtime shape exposed by {@link PclClient}.
 *
 * @category services
 * @since 0.0.0
 */
export interface PclClientShape {
  /** Fetch a single page of `/cases/find` (0-based page). */
  readonly findCasesPage: (
    payload: CourtCaseSearchDto,
    page: number
  ) => Effect.Effect<CaseReportList, PacerPclError>;
  /** Fetch a page of `/parties/find` (0-based page, defaults to 0). */
  readonly findParties: (payload: PartySearchDto, page?: number) => Effect.Effect<PartyReportList, PacerPclError>;
  /** Stream every `/cases/find` result across pages until `pageInfo.last`. */
  readonly streamCases: (payload: CourtCaseSearchDto) => Stream.Stream<CaseResult, PacerPclError>;
  /** Start an asynchronous batch case download; returns the report job metadata. */
  readonly startCaseDownload: (payload: CourtCaseSearchDto) => Effect.Effect<ReportInfoType, PacerPclError>;
  /** Poll the status of a batch case download job. */
  readonly caseDownloadStatus: (reportId: number) => Effect.Effect<ReportInfoType, PacerPclError>;
  /** Download the full result set of a completed batch case job. */
  readonly caseDownloadResults: (reportId: number) => Effect.Effect<CaseReportList, PacerPclError>;
  /** Delete a stored batch report job (PACER caps stored jobs, so this is mandatory). */
  readonly deleteCaseReport: (reportId: number) => Effect.Effect<void, PacerPclError>;
  /** Full batch lifecycle: start → poll until COMPLETED → download → always delete. */
  readonly downloadCases: (payload: CourtCaseSearchDto) => Effect.Effect<ReadonlyArray<CaseResult>, PacerPclError>;
}

/**
 * Typed PCL client service derived from {@link PclHttpApi}.
 *
 * @category services
 * @since 0.0.0
 */
export class PclClient extends Context.Service<PclClient, PclClientShape>()($I`PclClient`) {
  /**
   * Build a layer; requires an `HttpClient` and an authenticated `PacerSession`.
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly makeLayer = (
    cfg: PacerConfig
  ): Layer.Layer<PclClient, never, HttpClient.HttpClient | PacerSession> =>
    Layer.effect(
      PclClient,
      Effect.gen(function* () {
        const session = yield* PacerSession;
        // A token-injecting client for the raw DELETE (httpapi has no DELETE here).
        const injected = makeInjectingClient(yield* HttpClient.HttpClient, cfg, session.tokenRef);
        const client = yield* HttpApiClient.make(PclHttpApi, {
          baseUrl: cfg.pclBaseUrl,
          transformClient: (base) => makeInjectingClient(base, cfg, session.tokenRef),
        });

        const findCasesPage = (payload: CourtCaseSearchDto, page: number) =>
          callPcl(client.pcl.findCases({ payload, query: { page } }));

        const findParties = (payload: PartySearchDto, page = 0) =>
          callPcl(client.pcl.findParties({ payload, query: { page } }));

        const streamCases = (payload: CourtCaseSearchDto): Stream.Stream<CaseResult, PacerPclError> =>
          Stream.paginate(0, (page: number) =>
            page >= PAGINATION_MAX_PAGES
              ? Effect.fail(PacerPclError.fromReason("server-error", { cause: "pagination exceeded max pages" }))
              : findCasesPage(payload, page).pipe(
                  Effect.map((report) => {
                    const content = O.getOrElse(report.content, () => []);
                    const hasMore = pipe(
                      report.pageInfo,
                      O.flatMap((pageInfo) => pageInfo.last),
                      O.exists((last) => !last)
                    );
                    return [content, hasMore ? O.some(page + 1) : O.none<number>()] as const;
                  })
                )
          );

        const startCaseDownload = (payload: CourtCaseSearchDto) =>
          callPcl(client.pcl.startCaseDownload({ payload }));

        const caseDownloadStatus = (reportId: number) =>
          callPcl(client.pcl.caseDownloadStatus({ params: { reportId } }));

        const caseDownloadResults = (reportId: number) =>
          callPcl(client.pcl.caseDownloadResults({ params: { reportId } }));

        const deleteCaseReport = (reportId: number): Effect.Effect<void, PacerPclError> =>
          callPcl(
            injected.execute(
              HttpClientRequest.make("DELETE")(`${cfg.pclBaseUrl}/pcl-public-api/rest/cases/reports/${reportId}`)
            )
          ).pipe(
            Effect.flatMap((response) =>
              response.status >= 200 && response.status < 300
                ? Effect.void
                : Effect.fail(PacerPclError.fromStatus(response.status))
            )
          );

        const pollUntilComplete = (
          reportId: number,
          attemptsLeft: number
        ): Effect.Effect<ReportInfoType, PacerPclError> =>
          caseDownloadStatus(reportId).pipe(
            Effect.flatMap((info) =>
              O.exists(info.status, isTerminalReportStatus)
                ? Effect.succeed(info)
                : attemptsLeft <= 0
                  ? Effect.fail(PacerPclError.fromReason("server-error", { cause: "report polling timed out" }))
                  : Effect.sleep("200 millis").pipe(Effect.flatMap(() => pollUntilComplete(reportId, attemptsLeft - 1)))
            )
          );

        const downloadCases = (payload: CourtCaseSearchDto): Effect.Effect<ReadonlyArray<CaseResult>, PacerPclError> =>
          Effect.gen(function* () {
            const started = yield* startCaseDownload(payload);
            const reportId = typeof started.reportId === "number" ? started.reportId : Number(started.reportId);
            if (!Number.isInteger(reportId)) {
              return yield* PacerPclError.fromReason("server-error", {
                cause: `invalid reportId from server: ${String(started.reportId)}`,
              });
            }
            // Always delete the stored report, even if polling/download fails.
            return yield* Effect.gen(function* () {
              const completed = yield* pollUntilComplete(reportId, POLL_MAX_ATTEMPTS);
              if (O.contains(completed.status, ReportStatus.Enum.FAILED)) {
                return yield* PacerPclError.fromReason("server-error", { cause: "report failed" });
              }
              const report = yield* caseDownloadResults(reportId);
              return O.getOrElse(report.content, () => []);
            }).pipe(Effect.ensuring(deleteCaseReport(reportId).pipe(Effect.ignore)));
          });

        return PclClient.of({
          findCasesPage,
          findParties,
          streamCases,
          startCaseDownload,
          caseDownloadStatus,
          caseDownloadResults,
          deleteCaseReport,
          downloadCases,
        });
      })
    );
}
