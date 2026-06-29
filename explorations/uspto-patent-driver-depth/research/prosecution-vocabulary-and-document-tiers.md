# prosecution-vocabulary-and-document-tiers

Scope: assemble the USPTO prosecution controlled vocabularies (numeric status-code lifecycle dictionary, `/transactions` event-history model, document-code litigation tiers, PTAB/assignment/foreign-priority/PTA endpoint shapes) from primary sources, reconcile the divergent MCP maps against authoritative USPTO data, and draw the vocabulary-ownership boundary between `@beep/uspto` (driver) and `@beep/law-practice-domain`. Feeds mcp-uspto#4, patents-mcp-server#8, uspto_pfw_mcp#7, us-gov-open-data-mcp#7, patents-mcp-server#4.

## Findings

### A. The two divergent status-code maps are both unreliable; the authoritative source is the USPTO `status_codes` dataset / ODP `/status-codes` endpoint

- The application's current status is a **numeric `appl_status_code` (1–3 digit integer)** decoded against a `status_codes` lookup file; **225 unique application status codes exist**, and descriptions link to applications via this integer key. (USPTO Appendix A §A.1/§A.4, `Table A-3`: `appl_status_code` int + `status_description` str97 — https://www.uspto.gov/sites/default/files/documents/Appendix%20A.pdf)
- **Canonical common codes (USPTO Appendix A, `Table A-7: Common status codes`, verbatim)** — https://www.uspto.gov/sites/default/files/documents/Appendix%20A.pdf:
  - `150` = Patented Case (46.5% of all apps)
  - `161` = Abandoned -- Failure to Respond to an Office Action
  - `250` = Patent Expired Due to NonPayment of Maintenance Fees Under 37 CFR 1.362
  - `159` = Provisional Application Expired
  - `30` = Docketed New Case - Ready for Examination
  - `218` = RO PROCESSING COMPLETED-PLACED IN STORAGE
  - `566` = PCT - International Search Report Mailed to IB
  - `41` = Non Final Action Mailed
  - `166` = Abandoned -- File-Wrapper-Continuation Parent Application
  - `19` = Application Undergoing Preexam Processing
- **Allowance/RCE status transitions (USPTO Appendix B, `Table B-2`, verbatim)** — https://www.uspto.gov/sites/default/files/documents/Appendix%20B.pdf:
  - event `N/=.` (Notice of Allowance Data Verification Completed) → status `90` "Allowed-Notice of Allowance Not Yet Mailed"
  - event `MN/=.` (Mail Notice of Allowance) → "Sets application status to `92` (Allowed -- Notice of Allowance Mailed -- Issue Revision Completed)"
  - event `IEXX` (Initial Exam Team nn) → "sets status to `19`"
  - event `RCEX` (Request for Continued Examination): "Currently, an RCE causes the status to change to `30` ... Prior to November 2009, an RCE caused the status to change to `71` (Response to Non-Final Office Action Entered and Forwarded to Examiner)"
- **Reconciliation verdict — the `patents-mcp-server#8` `STATUS_CODE_MAP {"30":"Patented Case","41":"Non Final Action Mailed","47":"Final Rejection Mailed","70":"Notice of Allowance","160":"RCE Filed"}` is substantially CORRUPTED** when checked against the above primary data:
  - `30` → claimed "Patented Case" but is **"Docketed New Case - Ready for Examination"**; "Patented Case" is **`150`** (Appendix A Table A-7). WRONG.
  - `41` → "Non Final Action Mailed". CORRECT (Appendix A Table A-7).
  - `70` → claimed "Notice of Allowance" but Notice of Allowance **mailed = `92`** and **not-yet-mailed = `90`** (Appendix B Table B-2); `70` is neither. WRONG/UNSUPPORTED.
  - `160` → claimed "RCE Filed", but **RCE is a transaction event (`RCEX`), not a status**; filing an RCE drives status to `30` (post-Nov-2009) or `71` (prior), so there is no "RCE Filed" status code. CATEGORY ERROR.
  - i.e. only 1 of 5 entries survives. **Decision: do NOT port either hand-curated map** (neither `utility.tools.ts` `STATUS_CODE_MAP` nor the second divergent `resources/index.ts` map). The driver should **embed/sync the canonical USPTO `status_codes` table (the 225-code dictionary), keyed by the integer `applicationStatusCode`**, sourced from the ODP `/status-codes` endpoint (or the PatEx `status_codes` data file), never a partial literal map that silently drifts.

### B. `/transactions` timeline: the real field is `eventDataBag`, not `statusCodeBag` (mcp-uspto#4 field names are wrong)

- **Authoritative ODP shape** (OpenAPI-generated Go types, `patent-dev/uspto-odp`): the transaction history lives on `patentFileWrapperDataBag[].eventDataBag: EventData[]`, where `EventData = { eventCode?: string, eventDate?: string, eventDescriptionText?: string }`. (https://raw.githubusercontent.com/patent-dev/uspto-odp/main/generated/types_gen.go — `type EventData struct` + `PatentDataResponse.patentFileWrapperDataBag[].eventDataBag`)
- **mcp-uspto#4's claimed model** `data.statusCodeBag.map(s => ({status:s.statusCodeText, date:s.statusDate, description:s.statusDescriptionText}))` uses field names (`statusCodeBag`, `statusCodeText`, `statusDate`, `statusDescriptionText`) that **do not exist on the ODP transactions resource** — retarget to `eventDataBag` / `eventCode` / `eventDate` / `eventDescriptionText`.
- **`statusCodeBag` is a different endpoint**: it is the response of the `/status-codes` *search* endpoint — `StatusCodeSearchResponse = { count?, requestIdentifier?, statusCodeBag?: [{ applicationStatusCode?: int, applicationStatusDescriptionText?: string }] }`. (same `types_gen.go` — `type StatusCodeSearchResponse struct`; mirrors us-gov-open-data-mcp#7's `OdpSearchResult{count,requestIdentifier,results[],facets}` envelope shape.)
- **Current status is carried on `applicationMetaData`**: `applicationStatusCode?: int`, `applicationStatusDescriptionText?: string`, `applicationStatusDate?: string`. The repo's `UsptoApplicationMetadata` currently captures only `applicationStatusDescriptionText` (string) and **drops the numeric `applicationStatusCode`** (`packages/drivers/uspto/src/Uspto.models.ts:154-171`) — capture the int to drive the lifecycle dictionary.
- **Event codes have a USPTO-native `Category` taxonomy** (column in Appendix B Table B-2): `EX` (examination), `AA` (applicant action), `PE` (pre-exam), `AD` (administrative), `ISS` (issuance), `ABN` (abandonment), `PCT`. There are **1,873 unique event codes** and 275.6M transaction observations. (https://www.uspto.gov/sites/default/files/documents/Appendix%20B.pdf §B.1, Table B-2). This native category is a *fact*; it is the principled hook for any importance overlay (vs inventing one).

### C. Document-code litigation-importance tiers (uspto_pfw_mcp#7): all codes are real IFW doc codes; the tiers themselves are a derived legal judgment

- **Authoritative documentCode dictionary = USPTO `IFW-Doc-Codes-and-Descriptions.xlsx`** (1,053 codes), columns: `Doc Code`, `Doc Code Description`, `Publicly Available` (Yes/Maybe), `Doc Code Direction` (Incoming/Outgoing/Internal). (https://www.uspto.gov/sites/default/files/documents/IFW-Doc-Codes-and-Descriptions.xlsx)
- **All 16 tier codes verified present in that canonical list** (verbatim `Doc Code | Description | direction`):
  - `NOA | Notice of Allowance and Fees Due (PTOL-85) | Outgoing`
  - `CTFR | Final Rejection | Outgoing`
  - `CTNF | Non-Final Rejection | Outgoing`
  - `CLM | Claims | Incoming`
  - `ABST | Abstract | Incoming`
  - `892 | List of references cited by examiner | Outgoing`
  - `1449 | List of References cited by applicant and considered by examiner | Outgoing`
  - `REM | Applicant Arguments/Remarks Made in an Amendment | Incoming`
  - `FWCLM | Index of Claims | Internal`
  - `DRW | Drawings-only black and white line drawings | Incoming`
  - `SPEC | Specification | Incoming`
  - `RCEX | Request for Continued Examination (RCE) | Incoming`
  - `EXIN | Examiner Interview Summary Record (PTOL - 413) | Outgoing`
  - `CTAV | Advisory Action (PTOL-303) | Outgoing`
  - `IDS | Information Disclosure Statement (IDS) Form (SB08) | Incoming`
  - `WFEE | Fee Worksheet (SB06) | Internal`
- **GOTCHA — namespace collision between document codes and event/transaction codes.** Several tier entries (`RCEX`, `EXIN`, `CTAV`, `CTNF`, `CTFR`) **also appear as event/transaction codes** in Appendix B Table B-2 (e.g. `RCEX` rank 46 cat AA, `CTAV` rank 60 cat EX, `CTNF` rank 4 cat EX). The `/documents` endpoint keys on **`documentCode` (IFW list)**; `/transactions` keys on **`eventCode` (event_codes list)**. The tier vocabulary must be anchored to **`documentCode`** — do not mix the two namespaces.
- **The 4 tiers (critical/important/standard/administrative) are NOT a USPTO field** — they are a derived litigation-importance judgment. USPTO ships only objective overlays: per-document `Doc Code Direction` (Incoming/Outgoing/Internal) + `Publicly Available` flag, and per-event `Category` (EX/AA/PE/AD/ISS). The tier rollup encodes evidentiary/strategic weight → it is **product opinion, not driver fact** (see boundary in §F).
- **ODP `/documents` shape** (`DocumentBag.documentBag[]`): `applicationNumberText, directionCategory, documentCode, documentCodeDescriptionText, documentDirectionCategory, documentIdentifier, downloadOptionBag[{downloadUrl, mimeTypeIdentifier, pageTotalQuantity}], officialDate`. Confirms `directionCategory` is server-provided (refines mcp-uspto#6's "incoming/outgoing" wish) and that the repo's `UsptoDocumentReference` (`documentCode`+`documentCodeDescriptionText`+`downloadUrl`) is a faithful subset (`Uspto.models.ts:210-221`). (https://raw.githubusercontent.com/patent-dev/uspto-odp/main/generated/types_gen.go — `type DocumentBag struct`)

### D. PTAB / assignment / foreign-priority / PTA endpoint shapes (authoritative, OpenAPI-generated)

All four sub-resources live inside `patentFileWrapperDataBag[]` alongside `applicationMetaData`, `eventDataBag`, and the continuity bags; the dedicated paths project the matching sub-bag. (https://raw.githubusercontent.com/patent-dev/uspto-odp/main/generated/types_gen.go)

- **PTAB (PTAB API v3, served in ODP — https://developer.uspto.gov/api-catalog/ptab-api-v3-data-odp):** `ProceedingDataResponse = { count?, requestIdentifier?, patentTrialProceedingDataBag?: [{ trialNumber?, trialMetaData?: { trialTypeCode? (IPR|PGR|CBM|DER), trialStatusCategory?, petitionFilingDate?, institutionDecisionDate?, accordedFilingDate?, terminationDate?, latestDecisionDate?, trialLastModifiedDate?, fileDownloadURI? }, patentOwnerData?, regularPetitionerData?, respondentData?, derivationPetitionerData? }] }`. Query field is `trialMetaData.trialTypeCode:IPR` (https://raw.githubusercontent.com/patent-dev/uspto-odp/main/demo/ptab.go). Trial-type enum confirms us-gov-open-data-mcp#7's `trialTypeCodes{IPR,PGR,CBM,DER}`.
- **Assignment (`/assignment`):** `Assignment = { assigneeBag?: [{ assigneeNameText?, assigneeAddress?{addressLineOne..Four, cityName, countryName, postalCode, geographicRegion*, ictCountryCode, ictStateCode} }], assignorBag?: [{ assignorName?, executionDate? }], conveyanceText?, assignmentRecordedDate?, assignmentReceivedDate?, assignmentMailedDate?, reelNumber?(int), frameNumber?(int), reelAndFrameNumber?, pageTotalQuantity?, attorneyDocketNumber?, correspondenceAddress?, domesticRepresentative?, imageAvailableStatusCode?(bool) }`.
- **ForeignPriority (`/foreign-priority`):** `ForeignPriority = { applicationNumberText?, filingDate?, ipOfficeName? }` (minimal).
- **PatentTermAdjustment / PTA (`/adjustment`):** `PatentTermAdjustment = { aDelayQuantity?(int), bDelayQuantity?(int), cDelayQuantity?(int), applicantDayDelayQuantity?(int), adjustmentTotalQuantity?(int), overlappingDayQuantity?(float), nonOverlappingDayQuantity?(float), nonOverlappingDayDelayQuantity?(float), ipOfficeAdjustmentDelayQuantity?(float), patentTermAdjustmentHistoryDataBag?: [{ eventDate?, eventDescriptionText?, eventSequenceNumber?(float), originatingEventSequenceNumber?(float), ptaPTECode?, applicantDayDelayQuantity?(int), ipOfficeDayDelayQuantity?(int) }] }`. (A/B/C-delay semantics are the statutory PTA buckets.)
- **Continuity refinement (mcp-uspto#3 feed):** `ChildContinuityData` / `ParentContinuityData` carry `claimParentageTypeCode` + `claimParentageTypeCodeDescriptionText` (the continuation/divisional/CIP/provisional discriminator), `firstInventorToFileIndicator`, parent/child application numbers, filing dates, patent numbers, and a per-relative status code + description. **GOTCHA: `childApplicationStatusCode` is typed `float32` while `parentApplicationStatusCode` is `int`** — a genuine USPTO schema inconsistency to normalize on decode.

### E. Endpoint surface, auth, current state, deprecations (dates)

- **Base + auth:** ODP `api.uspto.gov`, header `X-API-KEY` (the repo already does this — `Uspto.service.ts:253`). Application paths: `/api/v1/patent/applications/{n}/(meta-data|continuity|documents|transactions|associated-documents|assignment|foreign-priority|attorney|adjustment)` + `/search`; PTAB and `/status-codes` are separate ODP search endpoints. (catalog corroborated by patents-mcp#6 in CAPTURE; https://data.uspto.gov/apis/getting-started)
- **Deprecation (NEW, dated):** **OCE Patent Examination Status Codes API is being decommissioned January 30, 2026** (https://developer.uspto.gov/api-catalog/oce-patent-examination-status-codes). So the legacy OCE status-code dataset is a dead-end for a long-lived driver — rely on the ODP `/status-codes` endpoint (or the PatEx `status_codes` data file) as the lifecycle dictionary source.
- **Prior deprecations (CAPTURE-confirmed):** PatentsView `api.patentsview.org` sunset Feb-2025; legacy Developer Hub decommissioned 2026-06-05; ODP key reissue 2026-03-20 — pin to `data.uspto.gov`/`api.uspto.gov` only.
- **GOTCHA — `developer.uspto.gov` / `data.uspto.gov/apis/*` API doc pages are JS-rendered SPAs**: `WebFetch` returns empty bodies. Use the downloadable datasets (Appendix A/B PDFs, IFW xlsx) and the OpenAPI-generated client types for ground-truth shapes; the human doc pages are not machine-fetchable.

### F. Vocabulary-ownership boundary decision: `@beep/uspto` (driver) vs `@beep/law-practice-domain`

- **Driver (`@beep/uspto`) owns USPTO-native vocabularies as decoded data — faithful decode + normalization, zero interpretation:**
  - numeric `applicationStatusCode` (int) + `applicationStatusDescriptionText` (the 225-code dictionary, **synced from `/status-codes`, not a hand literal map**) — add the int to `UsptoApplicationMetadata`.
  - `eventCode` / `eventDescriptionText` + native `Category` (EX/AA/PE/AD/ISS) for the `/transactions` (`eventDataBag`) timeline model.
  - `documentCode` / `documentCodeDescriptionText` + `directionCategory` + publicly-available flag (the IFW dictionary).
  - `trialTypeCode` (IPR/PGR/CBM/DER), `claimParentageTypeCode`, PTA A/B/C-delay buckets, assignment/foreign-priority sub-bag schemas.
  - i.e. the driver speaks **codes-as-strings + USPTO-native categories**, decoded verbatim (normalizing quirks like the `childApplicationStatusCode` float32).
- **Domain (`@beep/law-practice-domain`) owns the opinionated, product-meaningful overlays:**
  - the **litigation-importance tier mapping** (critical/important/standard/administrative) over `documentCode` — a legal evidentiary-weight judgment, not a USPTO field; feeds `OfficeAction`/`Rejection`/`PriorArtReference` prioritization.
  - a **coarse prosecution-PHASE lifecycle** (e.g. `preexam → docketed → under_examination → non_final → final → appeal → allowed → issued → abandoned/expired`) **derived from the numeric status code**, to replace `PatentAssetStatus`'s current single `"pre_filing"` literal (`packages/law-practice/domain/src/entities/PatentAsset/PatentAsset.values.ts:26`).
  - mapping office-action document/event codes (`CTNF`/`CTFR`/`CTAV`) to `OfficeAction`/`Rejection` state transitions and `RejectionGround` (`Rejection.values.ts` already encodes §101/§102/§103/§112 cardinality).
- **NAMING-COLLISION FLAG — `ClaimLifecycle` is NOT a patent prosecution vocabulary.** The task lists `ClaimLifecycle` as a law-practice entity, but the only `ClaimLifecycle` in the repo is the **shared-kernel epistemic admission gate** (`packages/shared/domain/src/values/ClaimLifecycle/ClaimLifecycle.model.ts`: `candidate → shape_valid → consistency_checked → admitted`) consumed by `@beep/epistemic-*`. That is the *evidence-admission* axis, orthogonal to *patent prosecution phase*. **Do not overload `ClaimLifecycle`** with status codes; the prosecution lifecycle needs its own value module (proposed name e.g. `ProsecutionPhase`) in law-practice/domain.
- **Boundary rule (one sentence):** the moment a mapping encodes legal/strategic judgment (importance tiers, prosecution-phase rollup, OA→rejection semantics) it crosses out of the driver into `law-practice/domain`; a thin translation layer (`law-practice/use-cases`, where `OfficeActionReview` already lives) converts driver vocab → domain vocab, keeping `@beep/uspto` product-neutral per its CLAUDE guide.

## Sources

- USPTO, Appendix A: Description of the Application Data Tab Release (status_codes file, 225 codes, Table A-7 common codes) — https://www.uspto.gov/sites/default/files/documents/Appendix%20A.pdf
- USPTO, Appendix B: Description of the Transaction History Data Release (event_codes, 1,873 codes, Category taxonomy, status transitions) — https://www.uspto.gov/sites/default/files/documents/Appendix%20B.pdf
- USPTO, IFW Document Codes and Descriptions spreadsheet (1,053 documentCodes + direction + public flag) — https://www.uspto.gov/sites/default/files/documents/IFW-Doc-Codes-and-Descriptions.xlsx
- USPTO ODP, OpenAPI-generated client types (authoritative endpoint shapes: EventData, StatusCodeSearchResponse, Assignment, ForeignPriority, PatentTermAdjustment, DocumentBag, ProceedingDataResponse, ApplicationMetaData, Child/ParentContinuityData), `patent-dev/uspto-odp` — https://raw.githubusercontent.com/patent-dev/uspto-odp/main/generated/types_gen.go
- USPTO ODP, PTAB query demo (trialMetaData.trialTypeCode), `patent-dev/uspto-odp` — https://raw.githubusercontent.com/patent-dev/uspto-odp/main/demo/ptab.go
- USPTO ODP, PTAB API v3 (data in ODP) catalog entry — https://developer.uspto.gov/api-catalog/ptab-api-v3-data-odp
- USPTO ODP, OCE Patent Examination Status Codes (decommission notice, Jan 30 2026) — https://developer.uspto.gov/api-catalog/oce-patent-examination-status-codes
- USPTO ODP, Getting Started (X-API-KEY auth) — https://data.uspto.gov/apis/getting-started
- USPTO ODP API doc pages (transactions / status-codes / documents — SPA, not machine-fetchable, listed for traceability) — https://data.uspto.gov/apis/patent-file-wrapper/transactions , https://data.uspto.gov/apis/patent-file-wrapper/status-codes , https://data.uspto.gov/apis/patent-file-wrapper/documents
- patent_client ODP File Wrapper data model (transactions/assignments/term_adjustments/foreign_priority accessors; ODP covers apps filed >= 2001-01-01) — https://patent-client.readthedocs.io/en/latest/user_guide/open_data_portal.html
- Patentbots, USPTO Transaction Codes (secondary corroboration of event-code descriptions) — https://www.patentbots.com/patentplex/uspto-transaction-codes
- Repo (live tree): `packages/drivers/uspto/src/Uspto.models.ts`, `.../Uspto.service.ts`; `packages/law-practice/domain/src/entities/{OfficeAction,Rejection,PatentAsset,Claim}/...`; `packages/shared/domain/src/values/ClaimLifecycle/ClaimLifecycle.model.ts`

## Open / Unverified

- **Status codes `47`, `70`, `160` exact descriptions: UNVERIFIED** against primary. Adversarial check shows the patents-mcp-server#8 labels for `30`/`70`/`160` are wrong/category-confused; `47`/`70`/`160` were not located in Appendix A Table A-7 (which lists only the most common). Resolve by pulling the full 225-code `status_codes` table from the key-authenticated ODP `/status-codes` endpoint.
- **Full 225-code lifecycle dictionary not enumerated here** — only ~14 codes verified from Table A-7 + Appendix B. The complete table requires the ODP `/status-codes` endpoint (API key) or the PatEx `status_codes` bulk file; the OCE dataset Socrata/`ds-api` mirrors returned 404/503 during research.
- **Exact `/transactions` sub-resource path vs aggregated GET projection:** the *field* is authoritatively `eventDataBag` (EventData), but whether ODP exposes a dedicated `/transactions` path returning only `eventDataBag` vs. requiring the aggregated application GET was inferred from patent_client's `transactions` accessor + the Go client's `GetPatentTransactions` + patents-mcp#6's path catalog (CAPTURE), not confirmed against a live key-authenticated call.
- **IFW xlsx (1,053 rows) and Appendix A/B (Dec-2014 PatEx vintage) are point-in-time snapshots** — USPTO updates the doc-code spreadsheet and adds status/event codes over time; treat embedded dictionaries as versioned, not frozen.
- **Litigation-importance tier assignment is reproduced from uspto_pfw_mcp#7's groupings (CAPTURE), not from a USPTO authority** (no such authority exists — it is intentionally a product judgment); the tier *membership* should be reviewed by a patent attorney before it ships as law-practice vocabulary.
