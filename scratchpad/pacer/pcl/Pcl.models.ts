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
import { SchemaUtils } from "@beep/schema";
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
    caseNumberFull: S.OptionFromOptionalKey(CaseNumberFull).pipe(SchemaUtils.withNoneDefault),
    caseTitle: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    jurisdictionType: S.OptionFromOptionalKey(JurisdictionType).pipe(SchemaUtils.withNoneDefault),
    courtId: S.Array(S.String).pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
    caseType: S.Array(S.String).pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
    natureOfSuit: S.Array(S.String).pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
    dateFiledFrom: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    dateFiledTo: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
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
    lastName: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    firstName: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    middleName: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    exactNameMatch: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault),
    courtId: S.Array(S.String).pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
    jurisdictionType: S.OptionFromOptionalKey(JurisdictionType).pipe(SchemaUtils.withNoneDefault),
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
    transactionDate: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    billablePages: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault),
    loginId: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    clientCode: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    firmId: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    search: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    description: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    csoId: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault),
    reportId: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    searchFee: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
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
    number: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault),
    size: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault),
    totalPages: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault),
    totalElements: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault),
    numberOfElements: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault),
    first: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault),
    last: S.OptionFromOptionalKey(S.Boolean).pipe(SchemaUtils.withNoneDefault),
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
    courtId: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    caseId: S.OptionFromOptionalKey(NumberOrString).pipe(SchemaUtils.withNoneDefault),
    caseYear: S.OptionFromOptionalKey(NumberOrString).pipe(SchemaUtils.withNoneDefault),
    caseNumber: S.OptionFromOptionalKey(NumberOrString).pipe(SchemaUtils.withNoneDefault),
    caseOffice: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    caseType: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    caseTitle: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    dateFiled: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    effectiveDateClosed: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    natureOfSuit: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    jurisdictionType: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    caseLink: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    caseNumberFull: S.OptionFromOptionalKey(CaseNumberFull).pipe(SchemaUtils.withNoneDefault),
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
    lastName: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    firstName: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    middleName: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    generation: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    partyType: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    partyRole: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    courtId: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    caseTitle: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    caseNumberFull: S.OptionFromOptionalKey(CaseNumberFull).pipe(SchemaUtils.withNoneDefault),
    jurisdictionType: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    dateFiled: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    caseId: S.OptionFromOptionalKey(NumberOrString).pipe(SchemaUtils.withNoneDefault),
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
    receipt: Receipt.pipe(S.NullOr, S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
    pageInfo: S.OptionFromOptionalKey(PageInfo).pipe(SchemaUtils.withNoneDefault),
    content: S.Array(CaseResult).pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
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
    receipt: Receipt.pipe(S.NullOr, S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
    pageInfo: S.OptionFromOptionalKey(PageInfo).pipe(SchemaUtils.withNoneDefault),
    content: S.Array(PartyResult).pipe(S.OptionFromOptionalKey, SchemaUtils.withNoneDefault),
    masterCase: S.OptionFromOptionalNullOr(S.Unknown).pipe(SchemaUtils.withNoneDefault),
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
    status: S.OptionFromOptionalKey(ReportStatus).pipe(SchemaUtils.withNoneDefault),
    recordCount: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault),
    pages: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault),
    unbilledPageCount: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault),
    downloadFee: S.OptionFromOptionalKey(S.Finite).pipe(SchemaUtils.withNoneDefault),
    startTime: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    endTime: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    searchType: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("ReportInfoType", {
    description: "PCL batch report job metadata.",
  })
) {}
