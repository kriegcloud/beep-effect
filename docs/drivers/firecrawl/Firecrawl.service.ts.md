---
title: Firecrawl.service.ts
nav_order: 4
parent: "@beep/firecrawl"
---

## Firecrawl.service.ts overview

Effect service boundary for the Firecrawl v2 SDK.

Since v0.0.0

---
## Exports Grouped by Category
- [services](#services)
  - [Firecrawl (class)](#firecrawl-class)
  - [FirecrawlSdkClient (type alias)](#firecrawlsdkclient-type-alias)
  - [FirecrawlSdkWatcher (type alias)](#firecrawlsdkwatcher-type-alias)
  - [FirecrawlShape (type alias)](#firecrawlshape-type-alias)
---

# services

## Firecrawl (class)

Effect service for the Firecrawl v2 SDK.

**Example**

```ts
import { Firecrawl, FirecrawlConfigInput } from "@beep/firecrawl"
import { Redacted } from "effect"

const layer = Firecrawl.makeLayer(
  FirecrawlConfigInput.make({
    apiKey: Redacted.make("fc-test-key")
  })
)

console.log(layer)
```

**Signature**

```ts
declare class Firecrawl
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.service.ts#L743)

Since v0.0.0

## FirecrawlSdkClient (type alias)

Minimal Firecrawl SDK client contract used by the driver service.

**Example**

```ts
import type { FirecrawlSdkClient } from "@beep/firecrawl"

type Method = keyof FirecrawlSdkClient

const method: Method = "scrape"
console.log(method)
```

**Signature**

```ts
type FirecrawlSdkClient = {
  readonly agent: (request: M.FirecrawlAgentWaitRequest) => Promise<M.FirecrawlAgentStatusData>;
  readonly batchScrape: (
    urls: Array<string>,
    options?: M.FirecrawlBatchScrapeWaitOptions
  ) => Promise<M.FirecrawlBatchScrapeJobData>;
  readonly browser: (options?: M.FirecrawlBrowserOptions) => Promise<M.FirecrawlBrowserCreateData>;
  readonly browserExecute: (
    sessionId: string,
    request: M.FirecrawlBrowserExecuteRequest
  ) => Promise<M.FirecrawlBrowserExecuteData>;
  readonly cancelAgent: (jobId: string) => Promise<boolean>;
  readonly cancelBatchScrape: (jobId: string) => Promise<boolean>;
  readonly cancelCrawl: (jobId: string) => Promise<boolean>;
  readonly crawl: (url: string, request?: M.FirecrawlCrawlWaitOptions) => Promise<M.FirecrawlCrawlJobData>;
  readonly crawlParamsPreview: (url: string, prompt: string) => Promise<Record<string, unknown>>;
  readonly createMonitor: (request: M.FirecrawlCreateMonitorRequest) => Promise<M.FirecrawlMonitorData>;
  readonly deleteBrowser: (sessionId: string) => Promise<M.FirecrawlBrowserDeleteData>;
  readonly deleteMonitor: (monitorId: string) => Promise<boolean>;
  readonly getActiveCrawls: () => Promise<M.FirecrawlActiveCrawlsData>;
  readonly getAgentStatus: (jobId: string) => Promise<M.FirecrawlAgentStatusData>;
  readonly getBatchScrapeErrors: (jobId: string) => Promise<M.FirecrawlCrawlErrorsData>;
  readonly getBatchScrapeStatus: (
    jobId: string,
    pagination?: M.FirecrawlPaginationConfig
  ) => Promise<M.FirecrawlBatchScrapeJobData>;
  readonly getConcurrency: () => Promise<M.FirecrawlConcurrencyData>;
  readonly getCrawlErrors: (crawlId: string) => Promise<M.FirecrawlCrawlErrorsData>;
  readonly getCrawlStatus: (
    jobId: string,
    pagination?: M.FirecrawlPaginationConfig
  ) => Promise<M.FirecrawlCrawlJobData>;
  readonly getCreditUsage: () => Promise<M.FirecrawlCreditUsageData>;
  readonly getCreditUsageHistorical: (byApiKey?: boolean) => Promise<M.FirecrawlCreditUsageHistoricalData>;
  readonly getMonitor: (monitorId: string) => Promise<M.FirecrawlMonitorData>;
  readonly getMonitorCheck: (
    monitorId: string,
    checkId: string,
    options?: M.FirecrawlGetMonitorCheckOptions
  ) => Promise<M.FirecrawlMonitorCheckDetailData>;
  readonly getQueueStatus: () => Promise<M.FirecrawlQueueStatusData>;
  readonly getTokenUsage: () => Promise<M.FirecrawlTokenUsageData>;
  readonly getTokenUsageHistorical: (byApiKey?: boolean) => Promise<M.FirecrawlTokenUsageHistoricalData>;
  readonly interact: (jobId: string, request: M.FirecrawlInteractRequest) => Promise<M.FirecrawlInteractData>;
  readonly listBrowsers: (options?: M.FirecrawlListBrowsersOptions) => Promise<M.FirecrawlBrowserListData>;
  readonly listMonitorChecks: (
    monitorId: string,
    options?: M.FirecrawlListMonitorChecksOptions
  ) => Promise<M.FirecrawlMonitorCheckListData>;
  readonly listMonitors: (options?: M.FirecrawlListMonitorsOptions) => Promise<M.FirecrawlMonitorListData>;
  readonly map: (url: string, options?: M.FirecrawlMapOptions) => Promise<M.FirecrawlMapData>;
  readonly parse: (file: M.FirecrawlParseFile, options?: M.FirecrawlParseOptions) => Promise<M.FirecrawlDocument>;
  readonly runMonitor: (monitorId: string) => Promise<M.FirecrawlMonitorCheckData>;
  readonly scrape: (url: string, options?: M.FirecrawlScrapeOptions) => Promise<M.FirecrawlDocument>;
  readonly search: (query: string, request?: M.FirecrawlSearchOptions) => Promise<M.FirecrawlSearchData>;
  readonly startAgent: (request: M.FirecrawlAgentRequest) => Promise<M.FirecrawlAgentResponseData>;
  readonly startBatchScrape: (
    urls: Array<string>,
    options?: M.FirecrawlBatchScrapeOptions
  ) => Promise<M.FirecrawlBatchScrapeResponseData>;
  readonly startCrawl: (url: string, request?: M.FirecrawlCrawlOptions) => Promise<M.FirecrawlCrawlResponseData>;
  readonly stopInteraction: (jobId: string) => Promise<M.FirecrawlStopInteractionData>;
  readonly updateMonitor: (
    monitorId: string,
    request: M.FirecrawlUpdateMonitorRequest
  ) => Promise<M.FirecrawlMonitorData>;
  readonly watcher: (jobId: string, options?: M.FirecrawlWatcherOptions) => FirecrawlSdkWatcher;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.service.ts#L71)

Since v0.0.0

## FirecrawlSdkWatcher (type alias)

Minimal watcher contract consumed by `Firecrawl.makeLayerFromClient`.

**Example**

```ts
import type { FirecrawlSdkWatcher } from "@beep/firecrawl"

const watcher: FirecrawlSdkWatcher = {
  close: () => undefined,
  off: () => watcher,
  on: () => watcher,
  start: () => Promise.resolve()
}

console.log(watcher)
```

**Signature**

```ts
type FirecrawlSdkWatcher = {
  readonly close: () => void;
  readonly off: (eventName: FirecrawlSdkWatcherEventName, listener: FirecrawlSdkWatcherListener) => FirecrawlSdkWatcher;
  readonly on: (eventName: FirecrawlSdkWatcherEventName, listener: FirecrawlSdkWatcherListener) => FirecrawlSdkWatcher;
  readonly start: () => Promise<void>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.service.ts#L48)

Since v0.0.0

## FirecrawlShape (type alias)

Public Firecrawl service shape.

**Example**

```ts
import type { FirecrawlShape } from "@beep/firecrawl"

type FirecrawlMethod = keyof FirecrawlShape

const method: FirecrawlMethod = "scrape"
console.log(method)
```

**Signature**

```ts
type FirecrawlShape = {
  readonly agent: (payload: M.FirecrawlAgentPayload) => Effect.Effect<M.FirecrawlAgentSuccess, FirecrawlError>;
  readonly batchScrape: (
    payload: M.FirecrawlBatchScrapePayload
  ) => Effect.Effect<M.FirecrawlBatchScrapeSuccess, FirecrawlError>;
  readonly browser: (payload: M.FirecrawlBrowserPayload) => Effect.Effect<M.FirecrawlBrowserSuccess, FirecrawlError>;
  readonly browserExecute: (
    payload: M.FirecrawlBrowserExecutePayload
  ) => Effect.Effect<M.FirecrawlBrowserExecuteSuccess, FirecrawlError>;
  readonly cancelAgent: (
    payload: M.FirecrawlCancelAgentPayload
  ) => Effect.Effect<M.FirecrawlCancelAgentSuccess, FirecrawlError>;
  readonly cancelBatchScrape: (
    payload: M.FirecrawlCancelBatchScrapePayload
  ) => Effect.Effect<M.FirecrawlCancelBatchScrapeSuccess, FirecrawlError>;
  readonly cancelCrawl: (
    payload: M.FirecrawlCancelCrawlPayload
  ) => Effect.Effect<M.FirecrawlCancelCrawlSuccess, FirecrawlError>;
  readonly crawl: (payload: M.FirecrawlCrawlPayload) => Effect.Effect<M.FirecrawlCrawlSuccess, FirecrawlError>;
  readonly crawlParamsPreview: (
    payload: M.FirecrawlCrawlParamsPreviewPayload
  ) => Effect.Effect<M.FirecrawlCrawlParamsPreviewSuccess, FirecrawlError>;
  readonly createMonitor: (
    payload: M.FirecrawlCreateMonitorPayload
  ) => Effect.Effect<M.FirecrawlCreateMonitorSuccess, FirecrawlError>;
  readonly deleteBrowser: (
    payload: M.FirecrawlDeleteBrowserPayload
  ) => Effect.Effect<M.FirecrawlDeleteBrowserSuccess, FirecrawlError>;
  readonly deleteMonitor: (
    payload: M.FirecrawlDeleteMonitorPayload
  ) => Effect.Effect<M.FirecrawlDeleteMonitorSuccess, FirecrawlError>;
  readonly getActiveCrawls: (
    payload: M.FirecrawlGetActiveCrawlsPayload
  ) => Effect.Effect<M.FirecrawlGetActiveCrawlsSuccess, FirecrawlError>;
  readonly getAgentStatus: (
    payload: M.FirecrawlGetAgentStatusPayload
  ) => Effect.Effect<M.FirecrawlGetAgentStatusSuccess, FirecrawlError>;
  readonly getBatchScrapeErrors: (
    payload: M.FirecrawlGetBatchScrapeErrorsPayload
  ) => Effect.Effect<M.FirecrawlGetBatchScrapeErrorsSuccess, FirecrawlError>;
  readonly getBatchScrapeStatus: (
    payload: M.FirecrawlGetBatchScrapeStatusPayload
  ) => Effect.Effect<M.FirecrawlGetBatchScrapeStatusSuccess, FirecrawlError>;
  readonly getConcurrency: (
    payload: M.FirecrawlGetConcurrencyPayload
  ) => Effect.Effect<M.FirecrawlGetConcurrencySuccess, FirecrawlError>;
  readonly getCrawlErrors: (
    payload: M.FirecrawlGetCrawlErrorsPayload
  ) => Effect.Effect<M.FirecrawlGetCrawlErrorsSuccess, FirecrawlError>;
  readonly getCrawlStatus: (
    payload: M.FirecrawlGetCrawlStatusPayload
  ) => Effect.Effect<M.FirecrawlGetCrawlStatusSuccess, FirecrawlError>;
  readonly getCreditUsage: (
    payload: M.FirecrawlGetCreditUsagePayload
  ) => Effect.Effect<M.FirecrawlGetCreditUsageSuccess, FirecrawlError>;
  readonly getCreditUsageHistorical: (
    payload: M.FirecrawlGetCreditUsageHistoricalPayload
  ) => Effect.Effect<M.FirecrawlGetCreditUsageHistoricalSuccess, FirecrawlError>;
  readonly getMonitor: (
    payload: M.FirecrawlGetMonitorPayload
  ) => Effect.Effect<M.FirecrawlGetMonitorSuccess, FirecrawlError>;
  readonly getMonitorCheck: (
    payload: M.FirecrawlGetMonitorCheckPayload
  ) => Effect.Effect<M.FirecrawlGetMonitorCheckSuccess, FirecrawlError>;
  readonly getQueueStatus: (
    payload: M.FirecrawlGetQueueStatusPayload
  ) => Effect.Effect<M.FirecrawlGetQueueStatusSuccess, FirecrawlError>;
  readonly getTokenUsage: (
    payload: M.FirecrawlGetTokenUsagePayload
  ) => Effect.Effect<M.FirecrawlGetTokenUsageSuccess, FirecrawlError>;
  readonly getTokenUsageHistorical: (
    payload: M.FirecrawlGetTokenUsageHistoricalPayload
  ) => Effect.Effect<M.FirecrawlGetTokenUsageHistoricalSuccess, FirecrawlError>;
  readonly interact: (payload: M.FirecrawlInteractPayload) => Effect.Effect<M.FirecrawlInteractSuccess, FirecrawlError>;
  readonly listBrowsers: (
    payload: M.FirecrawlListBrowsersPayload
  ) => Effect.Effect<M.FirecrawlListBrowsersSuccess, FirecrawlError>;
  readonly listMonitorChecks: (
    payload: M.FirecrawlListMonitorChecksPayload
  ) => Effect.Effect<M.FirecrawlListMonitorChecksSuccess, FirecrawlError>;
  readonly listMonitors: (
    payload: M.FirecrawlListMonitorsPayload
  ) => Effect.Effect<M.FirecrawlListMonitorsSuccess, FirecrawlError>;
  readonly map: (payload: M.FirecrawlMapPayload) => Effect.Effect<M.FirecrawlMapSuccess, FirecrawlError>;
  readonly parse: (payload: M.FirecrawlParsePayload) => Effect.Effect<M.FirecrawlParseSuccess, FirecrawlError>;
  readonly runMonitor: (
    payload: M.FirecrawlRunMonitorPayload
  ) => Effect.Effect<M.FirecrawlRunMonitorSuccess, FirecrawlError>;
  readonly scrape: (payload: M.FirecrawlScrapePayload) => Effect.Effect<M.FirecrawlScrapeSuccess, FirecrawlError>;
  readonly search: (payload: M.FirecrawlSearchPayload) => Effect.Effect<M.FirecrawlSearchSuccess, FirecrawlError>;
  readonly startAgent: (
    payload: M.FirecrawlStartAgentPayload
  ) => Effect.Effect<M.FirecrawlStartAgentSuccess, FirecrawlError>;
  readonly startBatchScrape: (
    payload: M.FirecrawlStartBatchScrapePayload
  ) => Effect.Effect<M.FirecrawlStartBatchScrapeSuccess, FirecrawlError>;
  readonly startCrawl: (
    payload: M.FirecrawlStartCrawlPayload
  ) => Effect.Effect<M.FirecrawlStartCrawlSuccess, FirecrawlError>;
  readonly stopInteraction: (
    payload: M.FirecrawlStopInteractionPayload
  ) => Effect.Effect<M.FirecrawlStopInteractionSuccess, FirecrawlError>;
  readonly updateMonitor: (
    payload: M.FirecrawlUpdateMonitorPayload
  ) => Effect.Effect<M.FirecrawlUpdateMonitorSuccess, FirecrawlError>;
  readonly watcher: (payload: M.FirecrawlWatcherPayload) => Stream.Stream<M.FirecrawlWatcherEvent, FirecrawlError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.service.ts#L156)

Since v0.0.0