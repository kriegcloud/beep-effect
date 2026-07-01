/**
 * Schema-derived data for the PACER mock + tests.
 *
 * Instead of hardcoded JSON fixtures, PCL response rows are GENERATED from the
 * effect/Schema definitions via `Schema.toArbitrary` + `FastCheck.sample`, then
 * re-encoded through the envelope schema. This keeps the mock honest: any drift
 * in a schema's checks/refinements (e.g. the `CaseNumberFull` arbitrary) shows
 * up in the generated data. Auth bodies are built with the schema's validated
 * `.make` constructor — their `loginResult` codes are scenario constants, not
 * random — and only the page counts are fixed (so tests can assert totals).
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { FastCheck } from "effect/testing";
import { CsoAuthResponse, CsoLogoutResponse } from "../auth/CsoAuth.models.ts";
import {
  CaseReportList,
  CaseResult,
  PageInfo,
  PartyReportList,
  PartyResult,
  Receipt,
  ReportInfoType,
} from "../pcl/Pcl.models.ts";

const caseArbitrary = S.toArbitrary(CaseResult);
const partyArbitrary = S.toArbitrary(PartyResult);
const receiptArbitrary = S.toArbitrary(Receipt);

/** Generate `count` schema-valid case rows (deterministic per `seed`). */
export const sampleCaseResults = (count: number, seed: number): ReadonlyArray<CaseResult> =>
  FastCheck.sample(caseArbitrary, { numRuns: count, seed });

/** Generate `count` schema-valid party rows (deterministic per `seed`). */
export const samplePartyResults = (count: number, seed: number): ReadonlyArray<PartyResult> =>
  FastCheck.sample(partyArbitrary, { numRuns: count, seed });

const sampleReceipt = (seed: number): Receipt => {
  const [value] = FastCheck.sample(receiptArbitrary, { numRuns: 1, seed });
  return value ?? Receipt.make({});
};

/** Build one encoded `/cases/find` page envelope with controlled pagination. */
export const caseReportListBody = (
  pageNumber: number,
  totalPages: number,
  content: ReadonlyArray<CaseResult>
): unknown => S.encodeUnknownSync(CaseReportList)(
  CaseReportList.make({
    receipt: O.some(sampleReceipt(pageNumber + 1)),
    pageInfo: O.some(
      PageInfo.make({
        number: O.some(pageNumber),
        size: O.some(54),
        totalPages: O.some(totalPages),
        totalElements: O.some(totalPages),
        numberOfElements: O.some(content.length),
        first: O.some(pageNumber === 0),
        last: O.some(pageNumber >= totalPages - 1),
      })
    ),
    content: O.some(content),
  })
);

/** Build one encoded `/parties/find` page envelope. */
export const partyReportListBody = (content: ReadonlyArray<PartyResult>): unknown => S.encodeSync(PartyReportList)(
  PartyReportList.make({
    receipt: O.some(sampleReceipt(2001)),
    pageInfo: O.some(
      PageInfo.make({
        number: O.some(0),
        size: O.some(54),
        totalPages: O.some(1),
        totalElements: O.some(content.length),
        numberOfElements: O.some(content.length),
        first: O.some(true),
        last: O.some(true),
      })
    ),
    content: O.some(content),
    masterCase: O.none(),
  })
);

/** Total number of case rows the default mock serves across all pages. */
export const PACER_MOCK_TOTAL_CASES = 3;

/** Two schema-sampled `/cases/find` pages (2 rows then 1 row; last on page 1). */
export const defaultCasePages = (): ReadonlyArray<unknown> => [
  caseReportListBody(0, 2, sampleCaseResults(2, 1001)),
  caseReportListBody(1, 2, sampleCaseResults(1, 1002)),
];

/** One schema-sampled `/parties/find` page (1 row). */
export const defaultPartyBody = (): unknown => partyReportListBody(samplePartyResults(1, 2002));

/** Successful cso-auth body (loginResult "0", non-empty token). */
export const authSuccessBody: unknown = S.encodeSync(CsoAuthResponse)(
  CsoAuthResponse.make({
    nextGenCSO: "Q".repeat(128),
    loginResult: "0",
    errorDescription: O.none(),
  })
);

/** Failed cso-auth body (invalid credentials / OTP, loginResult "13"). */
export const authInvalidBody: unknown = S.encodeSync(CsoAuthResponse)(CsoAuthResponse.make({
  nextGenCSO: "",
  loginResult: "13",
  errorDescription: O.some("Invalid username, password, or one-time passcode."),
}));

/** Successful cso-logout body. */
export const logoutBody: unknown = S.encodeSync(CsoLogoutResponse)(
  CsoLogoutResponse.make({
    loginResult: O.some("0"),
    errorDescription: O.none(),
    nextGenCSO: O.none(),
  })
);

/** A PCL 406 validation error body (PACER's own shape, not our error schema). */
export const invalidParameterBody = {
  error: "Validation Exception",
  message: "invalid search parameter",
};

/** The report id the default mock issues for batch downloads. */
export const DEFAULT_REPORT_ID = 1078;

/** Total case rows the default batch download returns. */
export const PACER_MOCK_DOWNLOAD_CASES = 2;

/** Build an encoded `ReportInfoType` body for a batch job in the given status. */
export const reportInfoBody = (
  reportId: number,
  status: "WAITING" | "RUNNING" | "COMPLETED" | "FAILED"
): unknown => S.encodeSync(ReportInfoType)(
  ReportInfoType.make({
    reportId,
    status: O.some(status),
    recordCount: O.some(3),
    pages: O.some(1),
  })
);

/** Build the encoded result set returned by a completed batch case download. */
export const downloadResultsBody = (): unknown => caseReportListBody(
  0,
  1,
  sampleCaseResults(PACER_MOCK_DOWNLOAD_CASES, 3001)
);
