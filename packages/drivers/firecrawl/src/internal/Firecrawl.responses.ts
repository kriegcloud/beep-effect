/**
 * Structural guards for Firecrawl SDK response values.
 *
 * @since 0.0.0
 */

import { $FirecrawlId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import type {
  ActiveCrawlsResponse,
  AgentResponse,
  AgentStatusResponse,
  BatchScrapeJob,
  BatchScrapeResponse,
  BrowserCreateResponse,
  BrowserDeleteResponse,
  BrowserExecuteResponse,
  BrowserListResponse,
  ConcurrencyCheck,
  CrawlErrorsResponse,
  CrawlJob,
  CrawlResponse,
  CreditUsage,
  CreditUsageHistoricalResponse,
  Document,
  MapData,
  Monitor,
  MonitorCheck,
  MonitorCheckDetail,
  QueueStatusResponse,
  ScrapeBrowserDeleteResponse,
  ScrapeExecuteResponse,
  SearchData,
  TokenUsage,
  TokenUsageHistoricalResponse,
} from "firecrawl";

const $I = $FirecrawlId.create("Firecrawl.responses");

const unknownRecord = S.Record(S.String, S.Unknown);
const optionalString = S.optionalKey(S.String);
const optionalFinite = S.optionalKey(S.Finite);
const optionalBoolean = S.optionalKey(S.Boolean);
const optionalNullableString = S.String.pipe(S.NullOr, S.optionalKey);

const sdkResponse = <A>(name: string, description: string, shape: S.Constraint): S.Codec<A> => {
  const isShape = S.is(S.toEncoded(shape));

  return S.declare<A>((value: unknown): value is A => isShape(value), {
    description,
    expected: name,
  }).pipe($I.annoteSchema(name, { description }));
};

const documentMetadataShape = S.Record(S.String, S.Unknown);
class DocumentAttributeShape extends S.Opaque<DocumentAttributeShape, { readonly brand: unique symbol }>()(
  S.Struct({
    attribute: S.String,
    selector: S.String,
    values: S.Array(S.String),
  }).pipe($I.annoteSchema("DocumentAttributeShape"))
) {}
class DocumentShape extends S.Opaque<DocumentShape, { readonly brand: unique symbol }>()(
  S.Struct({
    actions: S.optionalKey(unknownRecord),
    answer: optionalString,
    attributes: DocumentAttributeShape.pipe(S.Array, S.optionalKey),
    audio: optionalString,
    branding: S.optionalKey(S.Unknown),
    changeTracking: S.optionalKey(unknownRecord),
    highlights: optionalString,
    html: optionalString,
    images: S.String.pipe(S.Array, S.optionalKey),
    json: S.optionalKey(S.Unknown),
    links: S.String.pipe(S.Array, S.optionalKey),
    markdown: optionalString,
    menu: S.optionalKey(S.Unknown),
    metadata: S.optionalKey(documentMetadataShape),
    product: S.optionalKey(S.Unknown),
    rawHtml: optionalString,
    screenshot: optionalString,
    summary: optionalString,
    video: optionalString,
    warning: optionalString,
  }).pipe($I.annoteSchema("DocumentShape"))
) {}

class SearchResultWebShape extends S.Opaque<SearchResultWebShape, { readonly brand: unique symbol }>()(
  S.Struct({
    category: optionalString,
    description: optionalString,
    title: optionalString,
    url: S.String,
  }).pipe($I.annoteSchema("SearchResultWebShape"))
) {}
class SearchResultNewsShape extends S.Opaque<SearchResultNewsShape, { readonly brand: unique symbol }>()(
  S.Struct({
    category: optionalString,
    date: optionalString,
    imageUrl: optionalString,
    position: optionalFinite,
    snippet: optionalString,
    title: optionalString,
    url: optionalString,
  }).pipe($I.annoteSchema("SearchResultNewsShape"))
) {}
class SearchResultImageShape extends S.Opaque<SearchResultImageShape, { readonly brand: unique symbol }>()(
  S.Struct({
    imageHeight: optionalFinite,
    imageUrl: optionalString,
    imageWidth: optionalFinite,
    position: optionalFinite,
    title: optionalString,
    url: optionalString,
  }).pipe($I.annoteSchema("SearchResultImageShape"))
) {}
class SearchDocumentShape extends S.Opaque<SearchDocumentShape, { readonly brand: unique symbol }>()(
  S.Struct({
    ...DocumentShape.fields,
    category: S.optionalKey(S.Never),
    date: S.optionalKey(S.Never),
    description: S.optionalKey(S.Never),
    imageHeight: S.optionalKey(S.Never),
    imageUrl: S.optionalKey(S.Never),
    imageWidth: S.optionalKey(S.Never),
    position: S.optionalKey(S.Never),
    snippet: S.optionalKey(S.Never),
    title: S.optionalKey(S.Never),
    url: S.optionalKey(S.Never),
  }).pipe($I.annoteSchema("SearchDocumentShape"))
) {}
class SearchDataShape extends S.Opaque<SearchDataShape, { readonly brand: unique symbol }>()(
  S.Struct({
    images: S.Union([SearchResultImageShape, SearchDocumentShape]).pipe(S.Array, S.optionalKey),
    news: S.Union([SearchResultNewsShape, SearchDocumentShape]).pipe(S.Array, S.optionalKey),
    web: S.Union([SearchResultWebShape, SearchDocumentShape]).pipe(S.Array, S.optionalKey),
  }).pipe($I.annoteSchema("SearchDataShape"))
) {}
class MapDataShape extends S.Opaque<MapDataShape, { readonly brand: unique symbol }>()(
  S.Struct({
    id: optionalString,
    links: S.Array(SearchResultWebShape),
  }).pipe($I.annoteSchema("MapDataShape"))
) {}

class CrawlResponseShape extends S.Opaque<CrawlResponseShape, { readonly brand: unique symbol }>()(
  S.Struct({
    id: S.String,
    url: S.String,
  }).pipe($I.annoteSchema("CrawlResponseShape"))
) {}
class ScrapeJobShape extends S.Opaque<ScrapeJobShape, { readonly brand: unique symbol }>()(
  S.Struct({
    completed: S.Finite,
    creditsUsed: optionalFinite,
    data: S.Array(DocumentShape),
    expiresAt: optionalString,
    id: S.String,
    next: optionalNullableString,
    status: S.Literals(["scraping", "completed", "failed", "cancelled"]),
    total: S.Finite,
  }).pipe($I.annoteSchema("ScrapeJobShape"))
) {}
class CrawlErrorShape extends S.Opaque<CrawlErrorShape, { readonly brand: unique symbol }>()(
  S.Struct({
    code: optionalString,
    error: S.String,
    id: S.String,
    timestamp: optionalString,
    url: S.String,
  }).pipe($I.annoteSchema("CrawlErrorShape"))
) {}
class CrawlErrorsShape extends S.Opaque<CrawlErrorsShape, { readonly brand: unique symbol }>()(
  S.Struct({
    errors: S.Array(CrawlErrorShape),
    robotsBlocked: S.Array(S.String),
  }).pipe($I.annoteSchema("CrawlErrorsShape"))
) {}
class ActiveCrawlShape extends S.Opaque<ActiveCrawlShape, { readonly brand: unique symbol }>()(
  S.Struct({
    id: S.String,
    options: unknownRecord.pipe(S.NullOr, S.optionalKey),
    teamId: S.String,
    url: S.String,
  }).pipe($I.annoteSchema("ActiveCrawlShape"))
) {}
class ActiveCrawlsShape extends S.Opaque<ActiveCrawlsShape, { readonly brand: unique symbol }>()(
  S.Struct({
    crawls: S.Array(ActiveCrawlShape),
    success: S.Boolean,
  }).pipe($I.annoteSchema("ActiveCrawlsShape"))
) {}

class MonitorScheduleShape extends S.Opaque<MonitorScheduleShape, { readonly brand: unique symbol }>()(
  S.Struct({
    cron: optionalString,
    text: optionalString,
    timezone: optionalString,
  }).pipe($I.annoteSchema("MonitorScheduleShape"))
) {}
class MonitorWebhookShape extends S.Opaque<MonitorWebhookShape, { readonly brand: unique symbol }>()(
  S.Struct({
    events: S.String.pipe(S.Array, S.optionalKey),
    headers: S.optionalKey(S.Record(S.String, S.String)),
    metadata: S.optionalKey(S.Record(S.String, S.String)),
    url: S.String,
  }).pipe($I.annoteSchema("MonitorWebhookShape"))
) {}
class MonitorEmailNotificationShape extends S.Opaque<
  MonitorEmailNotificationShape,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    enabled: optionalBoolean,
    includeDiffs: optionalBoolean,
    recipients: S.String.pipe(S.Array, S.optionalKey),
  }).pipe($I.annoteSchema("MonitorEmailNotificationShape"))
) {}
class MonitorNotificationShape extends S.Opaque<MonitorNotificationShape, { readonly brand: unique symbol }>()(
  S.Struct({
    email: S.optionalKey(MonitorEmailNotificationShape),
  }).pipe($I.annoteSchema("MonitorNotificationShape"))
) {}
class MonitorScrapeTargetShape extends S.Opaque<MonitorScrapeTargetShape, { readonly brand: unique symbol }>()(
  S.Struct({
    id: optionalString,
    scrapeOptions: S.optionalKey(unknownRecord),
    type: S.tag("scrape"),
    urls: S.Array(S.String),
  }).pipe($I.annoteSchema("MonitorScrapeTargetShape"))
) {}
class MonitorCrawlTargetShape extends S.Opaque<MonitorCrawlTargetShape, { readonly brand: unique symbol }>()(
  S.Struct({
    crawlOptions: S.optionalKey(unknownRecord),
    id: optionalString,
    scrapeOptions: S.optionalKey(unknownRecord),
    type: S.tag("crawl"),
    url: S.String,
  }).pipe($I.annoteSchema("MonitorCrawlTargetShape"))
) {}
class MonitorSearchTargetShape extends S.Opaque<MonitorSearchTargetShape, { readonly brand: unique symbol }>()(
  S.Struct({
    excludeDomains: S.String.pipe(S.Array, S.optionalKey),
    id: optionalString,
    includeDomains: S.String.pipe(S.Array, S.optionalKey),
    maxResults: optionalFinite,
    queries: S.Array(S.String),
    searchWindow: S.optionalKey(S.Literals(["5m", "15m", "1h", "6h", "24h", "7d"])),
    type: S.tag("search"),
  }).pipe($I.annoteSchema("MonitorSearchTargetShape"))
) {}
const monitorTargetShape = S.Union([MonitorScrapeTargetShape, MonitorCrawlTargetShape, MonitorSearchTargetShape]);
class MonitorSummaryShape extends S.Opaque<MonitorSummaryShape, { readonly brand: unique symbol }>()(
  S.Struct({
    changed: S.Finite,
    error: S.Finite,
    new: S.Finite,
    removed: S.Finite,
    same: S.Finite,
    totalPages: S.Finite,
  }).pipe($I.annoteSchema("MonitorSummaryShape"))
) {}
class MonitorShape extends S.Opaque<MonitorShape, { readonly brand: unique symbol }>()(
  S.Struct({
    createdAt: S.String,
    currentCheckId: optionalNullableString,
    estimatedCreditsPerMonth: S.Finite.pipe(S.NullOr, S.optionalKey),
    goal: optionalNullableString,
    id: S.String,
    judgeEnabled: optionalBoolean,
    lastCheckSummary: MonitorSummaryShape.pipe(S.NullOr, S.optionalKey),
    lastRunAt: optionalNullableString,
    name: S.String,
    nextRunAt: optionalNullableString,
    notification: MonitorNotificationShape.pipe(S.NullOr, S.optionalKey),
    retentionDays: S.Finite,
    schedule: MonitorScheduleShape,
    status: S.Literals(["active", "paused", "deleted"]),
    targets: S.Array(monitorTargetShape),
    updatedAt: S.String,
    webhook: MonitorWebhookShape.pipe(S.NullOr, S.optionalKey),
  }).pipe($I.annoteSchema("MonitorShape"))
) {}

class MonitorScrapeTargetResultShape extends S.Opaque<
  MonitorScrapeTargetResultShape,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    expectedJobs: S.String.pipe(S.Array, S.optionalKey),
    targetId: S.String,
    type: S.tag("scrape"),
  }).pipe($I.annoteSchema("MonitorScrapeTargetResultShape"))
) {}
class MonitorCrawlTargetResultShape extends S.Opaque<
  MonitorCrawlTargetResultShape,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    crawlId: optionalString,
    targetId: S.String,
    type: S.tag("crawl"),
  }).pipe($I.annoteSchema("MonitorCrawlTargetResultShape"))
) {}
class MonitorSearchTargetResultShape extends S.Opaque<
  MonitorSearchTargetResultShape,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    degradedReason: optionalNullableString,
    judgeCredits: optionalFinite,
    judgeDegraded: optionalBoolean,
    matches: optionalFinite,
    resultCount: optionalFinite,
    resultsJudged: optionalFinite,
    searchCompleted: optionalBoolean,
    searchCredits: optionalFinite,
    summary: optionalString,
    targetId: S.String,
    type: S.tag("search"),
  }).pipe($I.annoteSchema("MonitorSearchTargetResultShape"))
) {}
const monitorTargetResultShape = S.Union([
  MonitorScrapeTargetResultShape,
  MonitorCrawlTargetResultShape,
  MonitorSearchTargetResultShape,
]);
class MonitorCheckShape extends S.Opaque<MonitorCheckShape, { readonly brand: unique symbol }>()(
  S.Struct({
    actualCredits: S.Finite.pipe(S.NullOr, S.optionalKey),
    billingStatus: S.Literals(["not_applicable", "reserved", "confirmed", "released", "failed"]),
    createdAt: S.String,
    error: optionalNullableString,
    estimatedCredits: S.Finite.pipe(S.NullOr, S.optionalKey),
    finishedAt: optionalNullableString,
    id: S.String,
    monitorId: S.String,
    notificationStatus: S.optionalKey(S.Unknown),
    reservedCredits: S.Finite.pipe(S.NullOr, S.optionalKey),
    scheduledFor: optionalNullableString,
    startedAt: optionalNullableString,
    status: S.Literals([
      "queued",
      "running",
      "completed",
      "failed",
      "partial",
      "skipped_overlap",
      "skipped_no_credits",
    ]),
    summary: MonitorSummaryShape,
    targetResults: monitorTargetResultShape.pipe(S.Array, S.optionalKey),
    trigger: S.Literals(["scheduled", "manual"]),
    updatedAt: S.String,
  }).pipe($I.annoteSchema("MonitorCheckShape"))
) {}
class MonitorCheckPageShape extends S.Opaque<MonitorCheckPageShape, { readonly brand: unique symbol }>()(
  S.Struct({
    createdAt: S.String,
    currentScrapeId: optionalNullableString,
    diff: unknownRecord.pipe(S.NullOr, S.optionalKey),
    error: optionalNullableString,
    id: S.String,
    judgment: unknownRecord.pipe(S.NullOr, S.optionalKey),
    metadata: S.optionalKey(S.Unknown),
    previousScrapeId: optionalNullableString,
    snapshot: unknownRecord.pipe(S.NullOr, S.optionalKey),
    status: S.Literals(["same", "new", "changed", "removed", "error"]),
    statusCode: S.Finite.pipe(S.NullOr, S.optionalKey),
    targetId: S.String,
    url: S.String,
  }).pipe($I.annoteSchema("MonitorCheckPageShape"))
) {}
class MonitorCheckDetailShape extends S.Opaque<MonitorCheckDetailShape, { readonly brand: unique symbol }>()(
  S.Struct({
    ...MonitorCheckShape.fields,
    next: optionalNullableString,
    pages: S.Array(MonitorCheckPageShape),
  }).pipe($I.annoteSchema("MonitorCheckDetailShape"))
) {}

class BatchScrapeResponseShape extends S.Opaque<BatchScrapeResponseShape, { readonly brand: unique symbol }>()(
  S.Struct({
    id: S.String,
    invalidURLs: S.String.pipe(S.Array, S.optionalKey),
    url: S.String,
  }).pipe($I.annoteSchema("BatchScrapeResponseShape"))
) {}
class AgentResponseShape extends S.Opaque<AgentResponseShape, { readonly brand: unique symbol }>()(
  S.Struct({
    error: optionalString,
    id: S.String,
    success: S.Boolean,
  }).pipe($I.annoteSchema("AgentResponseShape"))
) {}
class AgentStatusShape extends S.Opaque<AgentStatusShape, { readonly brand: unique symbol }>()(
  S.Struct({
    creditsUsed: optionalFinite,
    data: S.optionalKey(S.Unknown),
    error: optionalString,
    expiresAt: S.String,
    model: S.optionalKey(S.Literals(["spark-1-pro", "spark-1-mini"])),
    status: S.Literals(["processing", "completed", "failed"]),
    success: S.Boolean,
  }).pipe($I.annoteSchema("AgentStatusShape"))
) {}

class BrowserCreateShape extends S.Opaque<BrowserCreateShape, { readonly brand: unique symbol }>()(
  S.Struct({
    cdpUrl: optionalString,
    error: optionalString,
    expiresAt: optionalString,
    id: optionalString,
    interactiveLiveViewUrl: optionalString,
    liveViewUrl: optionalString,
    success: S.Boolean,
  }).pipe($I.annoteSchema("BrowserCreateShape"))
) {}
class BrowserExecuteShape extends S.Opaque<BrowserExecuteShape, { readonly brand: unique symbol }>()(
  S.Struct({
    cdpUrl: optionalString,
    error: optionalString,
    exitCode: optionalFinite,
    interactiveLiveViewUrl: optionalString,
    killed: optionalBoolean,
    liveViewUrl: optionalString,
    output: optionalString,
    result: optionalString,
    stderr: optionalString,
    stdout: optionalString,
    success: S.Boolean,
  }).pipe($I.annoteSchema("BrowserExecuteShape"))
) {}
class BrowserDeleteShape extends S.Opaque<BrowserDeleteShape, { readonly brand: unique symbol }>()(
  S.Struct({
    creditsBilled: optionalFinite,
    error: optionalString,
    sessionDurationMs: optionalFinite,
    success: S.Boolean,
  }).pipe($I.annoteSchema("BrowserDeleteShape"))
) {}
class BrowserSessionShape extends S.Opaque<BrowserSessionShape, { readonly brand: unique symbol }>()(
  S.Struct({
    cdpUrl: S.String,
    createdAt: S.String,
    id: S.String,
    interactiveLiveViewUrl: optionalString,
    lastActivity: S.String,
    liveViewUrl: S.String,
    status: S.String,
    streamWebView: S.Boolean,
  }).pipe($I.annoteSchema("BrowserSessionShape"))
) {}
class BrowserListShape extends S.Opaque<BrowserListShape, { readonly brand: unique symbol }>()(
  S.Struct({
    error: optionalString,
    sessions: BrowserSessionShape.pipe(S.Array, S.optionalKey),
    success: S.Boolean,
  }).pipe($I.annoteSchema("BrowserListShape"))
) {}

class ConcurrencyShape extends S.Opaque<ConcurrencyShape, { readonly brand: unique symbol }>()(
  S.Struct({
    concurrency: S.Finite,
    maxConcurrency: S.Finite,
  }).pipe($I.annoteSchema("ConcurrencyShape"))
) {}
class CreditUsageShape extends S.Opaque<CreditUsageShape, { readonly brand: unique symbol }>()(
  S.Struct({
    billingPeriodEnd: optionalNullableString,
    billingPeriodStart: optionalNullableString,
    planCredits: optionalFinite,
    remainingCredits: S.Finite,
  }).pipe($I.annoteSchema("CreditUsageShape"))
) {}
class TokenUsageShape extends S.Opaque<TokenUsageShape, { readonly brand: unique symbol }>()(
  S.Struct({
    billingPeriodEnd: optionalNullableString,
    billingPeriodStart: optionalNullableString,
    planTokens: optionalFinite,
    remainingTokens: S.Finite,
  }).pipe($I.annoteSchema("TokenUsageShape"))
) {}
class CreditUsagePeriodShape extends S.Opaque<CreditUsagePeriodShape, { readonly brand: unique symbol }>()(
  S.Struct({
    apiKey: optionalString,
    creditsUsed: S.Finite,
    endDate: S.NullOr(S.String),
    startDate: S.NullOr(S.String),
  }).pipe($I.annoteSchema("CreditUsagePeriodShape"))
) {}
class CreditUsageHistoricalShape extends S.Opaque<CreditUsageHistoricalShape, { readonly brand: unique symbol }>()(
  S.Struct({
    periods: S.Array(CreditUsagePeriodShape),
    success: S.Boolean,
  }).pipe($I.annoteSchema("CreditUsageHistoricalShape"))
) {}
class TokenUsagePeriodShape extends S.Opaque<TokenUsagePeriodShape, { readonly brand: unique symbol }>()(
  S.Struct({
    apiKey: optionalString,
    endDate: S.NullOr(S.String),
    startDate: S.NullOr(S.String),
    tokensUsed: S.Finite,
  }).pipe($I.annoteSchema("TokenUsagePeriodShape"))
) {}
class TokenUsageHistoricalShape extends S.Opaque<TokenUsageHistoricalShape, { readonly brand: unique symbol }>()(
  S.Struct({
    periods: S.Array(TokenUsagePeriodShape),
    success: S.Boolean,
  }).pipe($I.annoteSchema("TokenUsageHistoricalShape"))
) {}
class QueueStatusShape extends S.Opaque<QueueStatusShape, { readonly brand: unique symbol }>()(
  S.Struct({
    activeJobsInQueue: S.Finite,
    jobsInQueue: S.Finite,
    maxConcurrency: S.Finite,
    mostRecentSuccess: S.NullOr(S.String),
    success: S.Boolean,
    waitingJobsInQueue: S.Finite,
  }).pipe($I.annoteSchema("QueueStatusShape"))
) {}

export const FirecrawlDocument = sdkResponse<Document>(
  "FirecrawlDocument",
  "Structurally validated Firecrawl document returned by the SDK.",
  DocumentShape
);
export const FirecrawlSearchData = sdkResponse<SearchData>(
  "FirecrawlSearchData",
  "Structurally validated Firecrawl search response.",
  SearchDataShape
);
export const FirecrawlMapData = sdkResponse<MapData>(
  "FirecrawlMapData",
  "Structurally validated Firecrawl map response.",
  MapDataShape
);
export const FirecrawlCrawlResponseData = sdkResponse<CrawlResponse>(
  "FirecrawlCrawlResponseData",
  "Structurally validated Firecrawl crawl start response.",
  CrawlResponseShape
);
export const FirecrawlCrawlJobData = sdkResponse<CrawlJob>(
  "FirecrawlCrawlJobData",
  "Structurally validated Firecrawl crawl job response.",
  ScrapeJobShape
);
export const FirecrawlCrawlErrorsData = sdkResponse<CrawlErrorsResponse>(
  "FirecrawlCrawlErrorsData",
  "Structurally validated Firecrawl crawl errors response.",
  CrawlErrorsShape
);
export const FirecrawlActiveCrawlsData = sdkResponse<ActiveCrawlsResponse>(
  "FirecrawlActiveCrawlsData",
  "Structurally validated Firecrawl active crawls response.",
  ActiveCrawlsShape
);
export const FirecrawlMonitorData = sdkResponse<Monitor>(
  "FirecrawlMonitorData",
  "Structurally validated Firecrawl monitor response.",
  MonitorShape
);
export const FirecrawlMonitorListData = sdkResponse<ReadonlyArray<Monitor>>(
  "FirecrawlMonitorListData",
  "Structurally validated Firecrawl monitor list response.",
  S.Array(MonitorShape)
);
export const FirecrawlMonitorCheckData = sdkResponse<MonitorCheck>(
  "FirecrawlMonitorCheckData",
  "Structurally validated Firecrawl monitor check response.",
  MonitorCheckShape
);
export const FirecrawlMonitorCheckListData = sdkResponse<ReadonlyArray<MonitorCheck>>(
  "FirecrawlMonitorCheckListData",
  "Structurally validated Firecrawl monitor check list response.",
  S.Array(MonitorCheckShape)
);
export const FirecrawlMonitorCheckDetailData = sdkResponse<MonitorCheckDetail>(
  "FirecrawlMonitorCheckDetailData",
  "Structurally validated Firecrawl monitor check detail response.",
  MonitorCheckDetailShape
);
export const FirecrawlBatchScrapeResponseData = sdkResponse<BatchScrapeResponse>(
  "FirecrawlBatchScrapeResponseData",
  "Structurally validated Firecrawl batch scrape start response.",
  BatchScrapeResponseShape
);
export const FirecrawlBatchScrapeJobData = sdkResponse<BatchScrapeJob>(
  "FirecrawlBatchScrapeJobData",
  "Structurally validated Firecrawl batch scrape job response.",
  ScrapeJobShape
);
export const FirecrawlAgentResponseData = sdkResponse<AgentResponse>(
  "FirecrawlAgentResponseData",
  "Structurally validated Firecrawl agent start response.",
  AgentResponseShape
);
export const FirecrawlAgentStatusData = sdkResponse<AgentStatusResponse>(
  "FirecrawlAgentStatusData",
  "Structurally validated Firecrawl agent status response.",
  AgentStatusShape
);
export const FirecrawlBrowserCreateData = sdkResponse<BrowserCreateResponse>(
  "FirecrawlBrowserCreateData",
  "Structurally validated Firecrawl browser creation response.",
  BrowserCreateShape
);
export const FirecrawlBrowserExecuteData = sdkResponse<BrowserExecuteResponse>(
  "FirecrawlBrowserExecuteData",
  "Structurally validated Firecrawl browser execution response.",
  BrowserExecuteShape
);
export const FirecrawlBrowserDeleteData = sdkResponse<BrowserDeleteResponse>(
  "FirecrawlBrowserDeleteData",
  "Structurally validated Firecrawl browser deletion response.",
  BrowserDeleteShape
);
export const FirecrawlBrowserListData = sdkResponse<BrowserListResponse>(
  "FirecrawlBrowserListData",
  "Structurally validated Firecrawl browser list response.",
  BrowserListShape
);
export const FirecrawlConcurrencyData = sdkResponse<ConcurrencyCheck>(
  "FirecrawlConcurrencyData",
  "Structurally validated Firecrawl concurrency response.",
  ConcurrencyShape
);
export const FirecrawlCreditUsageData = sdkResponse<CreditUsage>(
  "FirecrawlCreditUsageData",
  "Structurally validated Firecrawl credit usage response.",
  CreditUsageShape
);
export const FirecrawlTokenUsageData = sdkResponse<TokenUsage>(
  "FirecrawlTokenUsageData",
  "Structurally validated Firecrawl token usage response.",
  TokenUsageShape
);
export const FirecrawlCreditUsageHistoricalData = sdkResponse<CreditUsageHistoricalResponse>(
  "FirecrawlCreditUsageHistoricalData",
  "Structurally validated Firecrawl historical credit usage response.",
  CreditUsageHistoricalShape
);
export const FirecrawlTokenUsageHistoricalData = sdkResponse<TokenUsageHistoricalResponse>(
  "FirecrawlTokenUsageHistoricalData",
  "Structurally validated Firecrawl historical token usage response.",
  TokenUsageHistoricalShape
);
export const FirecrawlQueueStatusData = sdkResponse<QueueStatusResponse>(
  "FirecrawlQueueStatusData",
  "Structurally validated Firecrawl queue status response.",
  QueueStatusShape
);
export const FirecrawlInteractData = sdkResponse<ScrapeExecuteResponse>(
  "FirecrawlInteractData",
  "Structurally validated Firecrawl interaction response.",
  BrowserExecuteShape
);
export const FirecrawlStopInteractionData = sdkResponse<ScrapeBrowserDeleteResponse>(
  "FirecrawlStopInteractionData",
  "Structurally validated Firecrawl stop interaction response.",
  BrowserDeleteShape
);
