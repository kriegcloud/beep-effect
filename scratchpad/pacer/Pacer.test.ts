/**
 * Tests for the PACER POC.
 *
 * Two styles, per the repo's preference for generated-over-hardcoded data:
 *  - **Property-based** (`it.prop` over effect/Schema-derived arbitraries) for
 *    schema round-trips and the status/loginResult error mappings — this forces
 *    the schemas' checks and refinements to hold for any generated value.
 *  - **End-to-end** (`it.layer` + `it.effect`) for the auth → search → logout
 *    spine and the typed error paths over the deterministic mock transport.
 *    Layers are provided by the test harness (not `Effect.provide` in the body),
 *    keeping scope lifetimes correct.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as HttpStatus from "@beep/schema/HttpStatus";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Stream } from "effect";
import * as S from "effect/Schema";
import { FastCheck } from "effect/testing";
import { mockPacerConfig } from "./Pacer.config.ts";
import { PacerAuth } from "./auth/PacerAuth.service.ts";
import { PacerAuthError, PacerPclError } from "./Pacer.errors.ts";
import { CaseReportList, CourtCaseSearchDto, PartySearchDto, ReportInfoType } from "./pcl/Pcl.models.ts";
import { PclClient } from "./pcl/PclClient.service.ts";
import { PACER_MOCK_DOWNLOAD_CASES, PACER_MOCK_TOTAL_CASES } from "./transport/Arbitraries.ts";
import { makePacerLayer } from "./transport/Layers.ts";
import { makePacerMockHttpClient } from "./transport/Mock.ts";

const cfg = mockPacerConfig();

const roundTrips = <A, I>(schema: S.Codec<A, I>, value: A): void => {
  const encoded = S.encodeSync(schema)(value);
  const decoded = S.decodeSync(schema)(encoded);
  expect(S.encodeSync(schema)(decoded)).toEqual(encoded);
};

describe("PACER schema round-trips (property-based)", () => {
  it.prop("CourtCaseSearchDto round-trips", { dto: S.toArbitrary(CourtCaseSearchDto) }, ({ dto }) => {
    roundTrips(CourtCaseSearchDto, dto);
  });

  it.prop("PartySearchDto round-trips", { dto: S.toArbitrary(PartySearchDto) }, ({ dto }) => {
    roundTrips(PartySearchDto, dto);
  });

  it.prop("CaseReportList round-trips", { report: S.toArbitrary(CaseReportList) }, ({ report }) => {
    roundTrips(CaseReportList, report);
  });

  it.prop("ReportInfoType round-trips", { info: S.toArbitrary(ReportInfoType) }, ({ info }) => {
    roundTrips(ReportInfoType, info);
  });
});

describe("PACER error mappings (property-based)", () => {
  const statusArbitrary = FastCheck.constantFrom(
    HttpStatus.BadRequest.literal,
    HttpStatus.Unauthorized.literal,
    HttpStatus.NotFound.literal,
    HttpStatus.NotAcceptable.literal,
    HttpStatus.TooManyRequests.literal,
    HttpStatus.InternalServerError.literal,
    HttpStatus.ServiceUnavailable.literal
  );

  const expectedPclReason = (status: number): string =>
    status === 400
      ? "bad-request"
      : status === 401
        ? "unauthorized"
        : status === 404
          ? "not-found"
          : status === 406
            ? "invalid-parameter"
            : status === 429
              ? "too-many-requests"
              : "server-error";

  it.prop("fromStatus maps any HTTP status to the right typed PacerPclError", { status: statusArbitrary }, ({ status }) => {
    const error = PacerPclError.fromStatus(status);
    expect(error._tag).toBe("PacerPclError");
    expect(error.reason).toBe(expectedPclReason(status));
    expect(error.status).toBe(status);
  });

  it.prop(
    "fromLoginResult maps any loginResult code to the right typed PacerAuthError",
    { code: FastCheck.constantFrom("0", "1", "13", "7", "99") },
    ({ code }) => {
      const error = PacerAuthError.fromLoginResult(code);
      const expected = code === "1" ? "redaction-flag-required" : code === "13" ? "invalid-credentials" : "login-failed";
      expect(error.reason).toBe(expected);
      expect(error.loginResult).toBe(code);
    }
  );
});

describe("PACER end-to-end (mock transport)", () => {
  it.layer(makePacerLayer(cfg, makePacerMockHttpClient()).full)("happy path", (it) => {
    it.effect("streams every /cases/find page and decodes /parties/find", () =>
      Effect.gen(function* () {
        const pcl = yield* PclClient;
        const cases = yield* Stream.runCollect(pcl.streamCases(CourtCaseSearchDto.make({})));
        expect(cases.length).toBe(PACER_MOCK_TOTAL_CASES);
        const parties = yield* pcl.findParties(PartySearchDto.make({ lastName: "Henderson" }));
        expect((parties.content ?? []).length).toBe(1);
      }))

    it.effect("runs the batch download lifecycle (start → poll → download → delete)", () =>
      Effect.gen(function* () {
        const pcl = yield* PclClient;
        const downloaded = yield* pcl.downloadCases(CourtCaseSearchDto.make({ caseNumberFull: "1:2002bk20340" }));
        expect(downloaded.length).toBe(PACER_MOCK_DOWNLOAD_CASES);
      }))
  });

  it.layer(makePacerLayer(cfg, makePacerMockHttpClient({ auth: "invalid" })).auth)("auth failure", (it) => {
    it.effect("login maps loginResult 13 to a typed PacerAuthError", () =>
      Effect.gen(function* () {
        const auth = yield* PacerAuth;
        const error = yield* Effect.flip(auth.login);
        expect(error._tag).toBe("PacerAuthError");
        expect(error.reason).toBe("invalid-credentials");
      }))
  });

  it.layer(makePacerLayer(cfg, makePacerMockHttpClient({ cases: "invalid-parameter" })).full)("pcl validation error", (it) => {
    it.effect("maps HTTP 406 to a typed PacerPclError", () =>
      Effect.gen(function* () {
        const pcl = yield* PclClient;
        const error = yield* Effect.flip(pcl.findCasesPage(CourtCaseSearchDto.make({}), 0));
        expect(error._tag).toBe("PacerPclError");
        expect(error.reason).toBe("invalid-parameter");
        expect(error.status).toBe(406);
      }))
  });

  it.layer(makePacerLayer(cfg, makePacerMockHttpClient({ batch: "failed" })).full)("batch job failure", (it) => {
    it.effect("downloadCases fails with a typed PacerPclError when the report FAILS", () =>
      Effect.gen(function* () {
        const pcl = yield* PclClient;
        const error = yield* Effect.flip(pcl.downloadCases(CourtCaseSearchDto.make({})));
        expect(error._tag).toBe("PacerPclError");
        expect(error.reason).toBe("server-error");
      }))
  });
});
