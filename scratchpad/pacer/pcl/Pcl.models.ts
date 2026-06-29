/**
 * Schema-first request/response models for the PACER Case Locator (PCL) API
 * synchronous search endpoints (`/cases/find`, `/parties/find`).
 *
 * Response fields are modeled defensively with `S.optionalKey` (PACER omits
 * empty fields) and permissive unions for the int-vs-string fields that the
 * spec is inconsistent about, so a live QA response never fails to decode.
 * effect/Schema ignores excess keys on decode, so unmodeled PACER fields are
 * dropped rather than rejected.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $ScratchpadId } from "@beep/identity";
import * as S from "effect/Schema";
import { CaseNumberFull, JurisdictionType, ReportStatus } from "../Pacer.tokens.ts";

const $I = $ScratchpadId.create("pacer/pcl/Pcl.models");

/** Permissive numeric field: PACER returns these as int (immediate) or string (batch). */
const NumberOrString = S.Union([S.Finite, S.String]);

/**
 * `CourtCaseSearchDto` — request body for `/cases/find` (pragmatic subset).
 *
 * @category schemas
 * @since 0.0.0
 */
export class CourtCaseSearchDto extends S.Class<CourtCaseSearchDto>($I`CourtCaseSearchDto`)(
  {
    caseNumberFull: S.optionalKey(CaseNumberFull),
    caseTitle: S.optionalKey(S.String),
    jurisdictionType: S.optionalKey(JurisdictionType),
    courtId: S.String.pipe(S.Array, S.optionalKey),
    caseType: S.String.pipe(S.Array, S.optionalKey),
    natureOfSuit: S.String.pipe(S.Array, S.optionalKey),
    dateFiledFrom: S.optionalKey(S.String),
    dateFiledTo: S.optionalKey(S.String),
  },
  $I.annote("CourtCaseSearchDto", {
    description: "PCL /cases/find request body (subset).",
  })
) {}

/**
 * `PartySearchDto` — request body for `/parties/find` (pragmatic subset).
 *
 * @category schemas
 * @since 0.0.0
 */
export class PartySearchDto extends S.Class<PartySearchDto>($I`PartySearchDto`)(
  {
    lastName: S.optionalKey(S.String),
    firstName: S.optionalKey(S.String),
    middleName: S.optionalKey(S.String),
    exactNameMatch: S.optionalKey(S.Boolean),
    courtId: S.String.pipe(S.Array, S.optionalKey),
    jurisdictionType: S.optionalKey(JurisdictionType),
  },
  $I.annote("PartySearchDto", {
    description: "PCL /parties/find request body (subset).",
  })
) {}

/**
 * Billing receipt block returned with each immediate search.
 *
 * @category schemas
 * @since 0.0.0
 */
export class Receipt extends S.Class<Receipt>($I`Receipt`)(
  {
    transactionDate: S.optionalKey(S.String),
    billablePages: S.optionalKey(S.Finite),
    loginId: S.optionalKey(S.String),
    clientCode: S.optionalKey(S.String),
    firmId: S.optionalKey(S.String),
    search: S.optionalKey(S.String),
    description: S.optionalKey(S.String),
    csoId: S.optionalKey(S.Finite),
    reportId: S.optionalKey(S.String),
    searchFee: S.optionalKey(S.String),
  },
  $I.annote("Receipt", {
    description: "PCL search billing receipt block.",
  })
) {}

/**
 * Pagination block. `last` drives the pagination stream's stop condition.
 *
 * @category schemas
 * @since 0.0.0
 */
export class PageInfo extends S.Class<PageInfo>($I`PageInfo`)(
  {
    number: S.optionalKey(S.Finite),
    size: S.optionalKey(S.Finite),
    totalPages: S.optionalKey(S.Finite),
    totalElements: S.optionalKey(S.Finite),
    numberOfElements: S.optionalKey(S.Finite),
    first: S.optionalKey(S.Boolean),
    last: S.optionalKey(S.Boolean),
  },
  $I.annote("PageInfo", {
    description: "PCL search pagination block (54 records per page).",
  })
) {}

/**
 * A single case search result (pragmatic subset).
 *
 * @category schemas
 * @since 0.0.0
 */
export class CaseResult extends S.Class<CaseResult>($I`CaseResult`)(
  {
    courtId: S.optionalKey(S.String),
    caseId: S.optionalKey(NumberOrString),
    caseYear: S.optionalKey(NumberOrString),
    caseNumber: S.optionalKey(NumberOrString),
    caseOffice: S.optionalKey(S.String),
    caseType: S.optionalKey(S.String),
    caseTitle: S.optionalKey(S.String),
    dateFiled: S.optionalKey(S.String),
    effectiveDateClosed: S.optionalKey(S.String),
    natureOfSuit: S.optionalKey(S.String),
    jurisdictionType: S.optionalKey(S.String),
    caseLink: S.optionalKey(S.String),
    caseNumberFull: S.optionalKey(CaseNumberFull),
  },
  $I.annote("CaseResult", {
    description: "PCL case search result record (subset).",
  })
) {}

/**
 * A single party search result (pragmatic subset).
 *
 * @category schemas
 * @since 0.0.0
 */
export class PartyResult extends S.Class<PartyResult>($I`PartyResult`)(
  {
    lastName: S.optionalKey(S.String),
    firstName: S.optionalKey(S.String),
    middleName: S.optionalKey(S.String),
    generation: S.optionalKey(S.String),
    partyType: S.optionalKey(S.String),
    partyRole: S.optionalKey(S.String),
    courtId: S.optionalKey(S.String),
    caseTitle: S.optionalKey(S.String),
    caseNumberFull: S.optionalKey(CaseNumberFull),
    jurisdictionType: S.optionalKey(S.String),
    dateFiled: S.optionalKey(S.String),
    caseId: S.optionalKey(NumberOrString),
  },
  $I.annote("PartyResult", {
    description: "PCL party search result record (subset).",
  })
) {}

/**
 * `/cases/find` response envelope.
 *
 * @category schemas
 * @since 0.0.0
 */
export class CaseReportList extends S.Class<CaseReportList>($I`CaseReportList`)(
  {
    receipt: Receipt.pipe(S.NullOr, S.optionalKey),
    pageInfo: S.optionalKey(PageInfo),
    content: CaseResult.pipe(S.Array, S.optionalKey),
  },
  $I.annote("CaseReportList", {
    description: "PCL /cases/find response envelope.",
  })
) {}

/**
 * `/parties/find` response envelope.
 *
 * @category schemas
 * @since 0.0.0
 */
export class PartyReportList extends S.Class<PartyReportList>($I`PartyReportList`)(
  {
    receipt: Receipt.pipe(S.NullOr, S.optionalKey),
    pageInfo: S.optionalKey(PageInfo),
    content: PartyResult.pipe(S.Array, S.optionalKey),
    masterCase: S.Unknown.pipe(S.NullOr, S.optionalKey),
  },
  $I.annote("PartyReportList", {
    description: "PCL /parties/find response envelope.",
  })
) {}

/**
 * `ReportInfoType` — metadata for an asynchronous batch/download job. Returned
 * by `POST /cases/download` and the `/download/status/{reportId}` poll. Note
 * `reportId` is an integer for batch jobs (vs a UUID string in immediate
 * receipts), so it is modeled permissively.
 *
 * @category schemas
 * @since 0.0.0
 */
export class ReportInfoType extends S.Class<ReportInfoType>($I`ReportInfoType`)(
  {
    reportId: NumberOrString,
    status: S.optionalKey(ReportStatus),
    recordCount: S.optionalKey(S.Finite),
    pages: S.optionalKey(S.Finite),
    unbilledPageCount: S.optionalKey(S.Finite),
    downloadFee: S.optionalKey(S.Finite),
    startTime: S.optionalKey(S.String),
    endTime: S.optionalKey(S.String),
    searchType: S.optionalKey(S.String),
  },
  $I.annote("ReportInfoType", {
    description: "PCL batch report job metadata.",
  })
) {}
