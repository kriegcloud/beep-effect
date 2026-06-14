---
title: Firecrawl.models.ts
nav_order: 3
parent: "@beep/firecrawl"
---

## Firecrawl.models.ts overview

Schema-first request, response, failure, and watcher models for Firecrawl.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [FirecrawlActiveCrawlsData (type alias)](#firecrawlactivecrawlsdata-type-alias)
  - [FirecrawlAgentFailure (class)](#firecrawlagentfailure-class)
  - [FirecrawlAgentPayload (class)](#firecrawlagentpayload-class)
  - [FirecrawlAgentRequest (type alias)](#firecrawlagentrequest-type-alias)
  - [FirecrawlAgentResponseData (type alias)](#firecrawlagentresponsedata-type-alias)
  - [FirecrawlAgentStatus (type alias)](#firecrawlagentstatus-type-alias)
  - [FirecrawlAgentStatusData (type alias)](#firecrawlagentstatusdata-type-alias)
  - [FirecrawlAgentSuccess (class)](#firecrawlagentsuccess-class)
  - [FirecrawlAgentWaitRequest (type alias)](#firecrawlagentwaitrequest-type-alias)
  - [FirecrawlBatchScrapeFailure (class)](#firecrawlbatchscrapefailure-class)
  - [FirecrawlBatchScrapeJobData (type alias)](#firecrawlbatchscrapejobdata-type-alias)
  - [FirecrawlBatchScrapeOptions (type alias)](#firecrawlbatchscrapeoptions-type-alias)
  - [FirecrawlBatchScrapePayload (class)](#firecrawlbatchscrapepayload-class)
  - [FirecrawlBatchScrapeResponseData (type alias)](#firecrawlbatchscraperesponsedata-type-alias)
  - [FirecrawlBatchScrapeSuccess (class)](#firecrawlbatchscrapesuccess-class)
  - [FirecrawlBatchScrapeWaitOptions (type alias)](#firecrawlbatchscrapewaitoptions-type-alias)
  - [FirecrawlBrowserCreateData (type alias)](#firecrawlbrowsercreatedata-type-alias)
  - [FirecrawlBrowserDeleteData (type alias)](#firecrawlbrowserdeletedata-type-alias)
  - [FirecrawlBrowserExecuteData (type alias)](#firecrawlbrowserexecutedata-type-alias)
  - [FirecrawlBrowserExecuteFailure (class)](#firecrawlbrowserexecutefailure-class)
  - [FirecrawlBrowserExecutePayload (class)](#firecrawlbrowserexecutepayload-class)
  - [FirecrawlBrowserExecuteRequest (type alias)](#firecrawlbrowserexecuterequest-type-alias)
  - [FirecrawlBrowserExecuteSuccess (class)](#firecrawlbrowserexecutesuccess-class)
  - [FirecrawlBrowserFailure (class)](#firecrawlbrowserfailure-class)
  - [FirecrawlBrowserLanguage (type alias)](#firecrawlbrowserlanguage-type-alias)
  - [FirecrawlBrowserListData (type alias)](#firecrawlbrowserlistdata-type-alias)
  - [FirecrawlBrowserOptions (type alias)](#firecrawlbrowseroptions-type-alias)
  - [FirecrawlBrowserPayload (class)](#firecrawlbrowserpayload-class)
  - [FirecrawlBrowserSuccess (class)](#firecrawlbrowsersuccess-class)
  - [FirecrawlCancelAgentFailure (class)](#firecrawlcancelagentfailure-class)
  - [FirecrawlCancelAgentPayload (class)](#firecrawlcancelagentpayload-class)
  - [FirecrawlCancelAgentSuccess (class)](#firecrawlcancelagentsuccess-class)
  - [FirecrawlCancelBatchScrapeFailure (class)](#firecrawlcancelbatchscrapefailure-class)
  - [FirecrawlCancelBatchScrapePayload (class)](#firecrawlcancelbatchscrapepayload-class)
  - [FirecrawlCancelBatchScrapeSuccess (class)](#firecrawlcancelbatchscrapesuccess-class)
  - [FirecrawlCancelCrawlFailure (class)](#firecrawlcancelcrawlfailure-class)
  - [FirecrawlCancelCrawlPayload (class)](#firecrawlcancelcrawlpayload-class)
  - [FirecrawlCancelCrawlSuccess (class)](#firecrawlcancelcrawlsuccess-class)
  - [FirecrawlConcurrencyData (type alias)](#firecrawlconcurrencydata-type-alias)
  - [FirecrawlCrawlErrorsData (type alias)](#firecrawlcrawlerrorsdata-type-alias)
  - [FirecrawlCrawlFailure (class)](#firecrawlcrawlfailure-class)
  - [FirecrawlCrawlJobData (type alias)](#firecrawlcrawljobdata-type-alias)
  - [FirecrawlCrawlOptions (type alias)](#firecrawlcrawloptions-type-alias)
  - [FirecrawlCrawlParamsPreviewFailure (class)](#firecrawlcrawlparamspreviewfailure-class)
  - [FirecrawlCrawlParamsPreviewPayload (class)](#firecrawlcrawlparamspreviewpayload-class)
  - [FirecrawlCrawlParamsPreviewSuccess (class)](#firecrawlcrawlparamspreviewsuccess-class)
  - [FirecrawlCrawlPayload (class)](#firecrawlcrawlpayload-class)
  - [FirecrawlCrawlResponseData (type alias)](#firecrawlcrawlresponsedata-type-alias)
  - [FirecrawlCrawlSuccess (class)](#firecrawlcrawlsuccess-class)
  - [FirecrawlCrawlWaitOptions (type alias)](#firecrawlcrawlwaitoptions-type-alias)
  - [FirecrawlCreateMonitorFailure (class)](#firecrawlcreatemonitorfailure-class)
  - [FirecrawlCreateMonitorPayload (class)](#firecrawlcreatemonitorpayload-class)
  - [FirecrawlCreateMonitorRequest (type alias)](#firecrawlcreatemonitorrequest-type-alias)
  - [FirecrawlCreateMonitorSuccess (class)](#firecrawlcreatemonitorsuccess-class)
  - [FirecrawlCreditUsageData (type alias)](#firecrawlcreditusagedata-type-alias)
  - [FirecrawlCreditUsageHistoricalData (type alias)](#firecrawlcreditusagehistoricaldata-type-alias)
  - [FirecrawlDeleteBrowserFailure (class)](#firecrawldeletebrowserfailure-class)
  - [FirecrawlDeleteBrowserPayload (class)](#firecrawldeletebrowserpayload-class)
  - [FirecrawlDeleteBrowserSuccess (class)](#firecrawldeletebrowsersuccess-class)
  - [FirecrawlDeleteMonitorFailure (class)](#firecrawldeletemonitorfailure-class)
  - [FirecrawlDeleteMonitorPayload (class)](#firecrawldeletemonitorpayload-class)
  - [FirecrawlDeleteMonitorSuccess (class)](#firecrawldeletemonitorsuccess-class)
  - [FirecrawlDocument (type alias)](#firecrawldocument-type-alias)
  - [FirecrawlFormatType (type alias)](#firecrawlformattype-type-alias)
  - [FirecrawlGetActiveCrawlsFailure (class)](#firecrawlgetactivecrawlsfailure-class)
  - [FirecrawlGetActiveCrawlsPayload (class)](#firecrawlgetactivecrawlspayload-class)
  - [FirecrawlGetActiveCrawlsSuccess (class)](#firecrawlgetactivecrawlssuccess-class)
  - [FirecrawlGetAgentStatusFailure (class)](#firecrawlgetagentstatusfailure-class)
  - [FirecrawlGetAgentStatusPayload (class)](#firecrawlgetagentstatuspayload-class)
  - [FirecrawlGetAgentStatusSuccess (class)](#firecrawlgetagentstatussuccess-class)
  - [FirecrawlGetBatchScrapeErrorsFailure (class)](#firecrawlgetbatchscrapeerrorsfailure-class)
  - [FirecrawlGetBatchScrapeErrorsPayload (class)](#firecrawlgetbatchscrapeerrorspayload-class)
  - [FirecrawlGetBatchScrapeErrorsSuccess (class)](#firecrawlgetbatchscrapeerrorssuccess-class)
  - [FirecrawlGetBatchScrapeStatusFailure (class)](#firecrawlgetbatchscrapestatusfailure-class)
  - [FirecrawlGetBatchScrapeStatusPayload (class)](#firecrawlgetbatchscrapestatuspayload-class)
  - [FirecrawlGetBatchScrapeStatusSuccess (class)](#firecrawlgetbatchscrapestatussuccess-class)
  - [FirecrawlGetConcurrencyFailure (class)](#firecrawlgetconcurrencyfailure-class)
  - [FirecrawlGetConcurrencyPayload (class)](#firecrawlgetconcurrencypayload-class)
  - [FirecrawlGetConcurrencySuccess (class)](#firecrawlgetconcurrencysuccess-class)
  - [FirecrawlGetCrawlErrorsFailure (class)](#firecrawlgetcrawlerrorsfailure-class)
  - [FirecrawlGetCrawlErrorsPayload (class)](#firecrawlgetcrawlerrorspayload-class)
  - [FirecrawlGetCrawlErrorsSuccess (class)](#firecrawlgetcrawlerrorssuccess-class)
  - [FirecrawlGetCrawlStatusFailure (class)](#firecrawlgetcrawlstatusfailure-class)
  - [FirecrawlGetCrawlStatusPayload (class)](#firecrawlgetcrawlstatuspayload-class)
  - [FirecrawlGetCrawlStatusSuccess (class)](#firecrawlgetcrawlstatussuccess-class)
  - [FirecrawlGetCreditUsageFailure (class)](#firecrawlgetcreditusagefailure-class)
  - [FirecrawlGetCreditUsageHistoricalFailure (class)](#firecrawlgetcreditusagehistoricalfailure-class)
  - [FirecrawlGetCreditUsageHistoricalPayload (class)](#firecrawlgetcreditusagehistoricalpayload-class)
  - [FirecrawlGetCreditUsageHistoricalSuccess (class)](#firecrawlgetcreditusagehistoricalsuccess-class)
  - [FirecrawlGetCreditUsagePayload (class)](#firecrawlgetcreditusagepayload-class)
  - [FirecrawlGetCreditUsageSuccess (class)](#firecrawlgetcreditusagesuccess-class)
  - [FirecrawlGetMonitorCheckFailure (class)](#firecrawlgetmonitorcheckfailure-class)
  - [FirecrawlGetMonitorCheckOptions (type alias)](#firecrawlgetmonitorcheckoptions-type-alias)
  - [FirecrawlGetMonitorCheckPayload (class)](#firecrawlgetmonitorcheckpayload-class)
  - [FirecrawlGetMonitorCheckSuccess (class)](#firecrawlgetmonitorchecksuccess-class)
  - [FirecrawlGetMonitorFailure (class)](#firecrawlgetmonitorfailure-class)
  - [FirecrawlGetMonitorPayload (class)](#firecrawlgetmonitorpayload-class)
  - [FirecrawlGetMonitorSuccess (class)](#firecrawlgetmonitorsuccess-class)
  - [FirecrawlGetQueueStatusFailure (class)](#firecrawlgetqueuestatusfailure-class)
  - [FirecrawlGetQueueStatusPayload (class)](#firecrawlgetqueuestatuspayload-class)
  - [FirecrawlGetQueueStatusSuccess (class)](#firecrawlgetqueuestatussuccess-class)
  - [FirecrawlGetTokenUsageFailure (class)](#firecrawlgettokenusagefailure-class)
  - [FirecrawlGetTokenUsageHistoricalFailure (class)](#firecrawlgettokenusagehistoricalfailure-class)
  - [FirecrawlGetTokenUsageHistoricalPayload (class)](#firecrawlgettokenusagehistoricalpayload-class)
  - [FirecrawlGetTokenUsageHistoricalSuccess (class)](#firecrawlgettokenusagehistoricalsuccess-class)
  - [FirecrawlGetTokenUsagePayload (class)](#firecrawlgettokenusagepayload-class)
  - [FirecrawlGetTokenUsageSuccess (class)](#firecrawlgettokenusagesuccess-class)
  - [FirecrawlInteractData (type alias)](#firecrawlinteractdata-type-alias)
  - [FirecrawlInteractFailure (class)](#firecrawlinteractfailure-class)
  - [FirecrawlInteractPayload (class)](#firecrawlinteractpayload-class)
  - [FirecrawlInteractRequest (type alias)](#firecrawlinteractrequest-type-alias)
  - [FirecrawlInteractSuccess (class)](#firecrawlinteractsuccess-class)
  - [FirecrawlJobStatus (type alias)](#firecrawljobstatus-type-alias)
  - [FirecrawlListBrowsersFailure (class)](#firecrawllistbrowsersfailure-class)
  - [FirecrawlListBrowsersOptions (type alias)](#firecrawllistbrowsersoptions-type-alias)
  - [FirecrawlListBrowsersPayload (class)](#firecrawllistbrowserspayload-class)
  - [FirecrawlListBrowsersSuccess (class)](#firecrawllistbrowserssuccess-class)
  - [FirecrawlListMonitorChecksFailure (class)](#firecrawllistmonitorchecksfailure-class)
  - [FirecrawlListMonitorChecksOptions (type alias)](#firecrawllistmonitorchecksoptions-type-alias)
  - [FirecrawlListMonitorChecksPayload (class)](#firecrawllistmonitorcheckspayload-class)
  - [FirecrawlListMonitorChecksSuccess (class)](#firecrawllistmonitorcheckssuccess-class)
  - [FirecrawlListMonitorsFailure (class)](#firecrawllistmonitorsfailure-class)
  - [FirecrawlListMonitorsOptions (type alias)](#firecrawllistmonitorsoptions-type-alias)
  - [FirecrawlListMonitorsPayload (class)](#firecrawllistmonitorspayload-class)
  - [FirecrawlListMonitorsSuccess (class)](#firecrawllistmonitorssuccess-class)
  - [FirecrawlMapData (type alias)](#firecrawlmapdata-type-alias)
  - [FirecrawlMapFailure (class)](#firecrawlmapfailure-class)
  - [FirecrawlMapOptions (type alias)](#firecrawlmapoptions-type-alias)
  - [FirecrawlMapPayload (class)](#firecrawlmappayload-class)
  - [FirecrawlMapSuccess (class)](#firecrawlmapsuccess-class)
  - [FirecrawlMonitorCheckData (type alias)](#firecrawlmonitorcheckdata-type-alias)
  - [FirecrawlMonitorCheckDetailData (type alias)](#firecrawlmonitorcheckdetaildata-type-alias)
  - [FirecrawlMonitorCheckListData (type alias)](#firecrawlmonitorchecklistdata-type-alias)
  - [FirecrawlMonitorData (type alias)](#firecrawlmonitordata-type-alias)
  - [FirecrawlMonitorListData (type alias)](#firecrawlmonitorlistdata-type-alias)
  - [FirecrawlPaginationConfig (type alias)](#firecrawlpaginationconfig-type-alias)
  - [FirecrawlParseFailure (class)](#firecrawlparsefailure-class)
  - [FirecrawlParseFile (type alias)](#firecrawlparsefile-type-alias)
  - [FirecrawlParseOptions (type alias)](#firecrawlparseoptions-type-alias)
  - [FirecrawlParsePayload (class)](#firecrawlparsepayload-class)
  - [FirecrawlParseSuccess (class)](#firecrawlparsesuccess-class)
  - [FirecrawlQueueStatusData (type alias)](#firecrawlqueuestatusdata-type-alias)
  - [FirecrawlRunMonitorFailure (class)](#firecrawlrunmonitorfailure-class)
  - [FirecrawlRunMonitorPayload (class)](#firecrawlrunmonitorpayload-class)
  - [FirecrawlRunMonitorSuccess (class)](#firecrawlrunmonitorsuccess-class)
  - [FirecrawlScrapeActionType (type alias)](#firecrawlscrapeactiontype-type-alias)
  - [FirecrawlScrapeFailure (class)](#firecrawlscrapefailure-class)
  - [FirecrawlScrapeOptions (type alias)](#firecrawlscrapeoptions-type-alias)
  - [FirecrawlScrapePayload (class)](#firecrawlscrapepayload-class)
  - [FirecrawlScrapeSuccess (class)](#firecrawlscrapesuccess-class)
  - [FirecrawlSearchData (type alias)](#firecrawlsearchdata-type-alias)
  - [FirecrawlSearchFailure (class)](#firecrawlsearchfailure-class)
  - [FirecrawlSearchOptions (type alias)](#firecrawlsearchoptions-type-alias)
  - [FirecrawlSearchPayload (class)](#firecrawlsearchpayload-class)
  - [FirecrawlSearchSourceType (type alias)](#firecrawlsearchsourcetype-type-alias)
  - [FirecrawlSearchSuccess (class)](#firecrawlsearchsuccess-class)
  - [FirecrawlStartAgentFailure (class)](#firecrawlstartagentfailure-class)
  - [FirecrawlStartAgentPayload (class)](#firecrawlstartagentpayload-class)
  - [FirecrawlStartAgentSuccess (class)](#firecrawlstartagentsuccess-class)
  - [FirecrawlStartBatchScrapeFailure (class)](#firecrawlstartbatchscrapefailure-class)
  - [FirecrawlStartBatchScrapePayload (class)](#firecrawlstartbatchscrapepayload-class)
  - [FirecrawlStartBatchScrapeSuccess (class)](#firecrawlstartbatchscrapesuccess-class)
  - [FirecrawlStartCrawlFailure (class)](#firecrawlstartcrawlfailure-class)
  - [FirecrawlStartCrawlPayload (class)](#firecrawlstartcrawlpayload-class)
  - [FirecrawlStartCrawlSuccess (class)](#firecrawlstartcrawlsuccess-class)
  - [FirecrawlStopInteractionData (type alias)](#firecrawlstopinteractiondata-type-alias)
  - [FirecrawlStopInteractionFailure (class)](#firecrawlstopinteractionfailure-class)
  - [FirecrawlStopInteractionPayload (class)](#firecrawlstopinteractionpayload-class)
  - [FirecrawlStopInteractionSuccess (class)](#firecrawlstopinteractionsuccess-class)
  - [FirecrawlTokenUsageData (type alias)](#firecrawltokenusagedata-type-alias)
  - [FirecrawlTokenUsageHistoricalData (type alias)](#firecrawltokenusagehistoricaldata-type-alias)
  - [FirecrawlUpdateMonitorFailure (class)](#firecrawlupdatemonitorfailure-class)
  - [FirecrawlUpdateMonitorPayload (class)](#firecrawlupdatemonitorpayload-class)
  - [FirecrawlUpdateMonitorRequest (type alias)](#firecrawlupdatemonitorrequest-type-alias)
  - [FirecrawlUpdateMonitorSuccess (class)](#firecrawlupdatemonitorsuccess-class)
  - [FirecrawlWatcherEvent (type alias)](#firecrawlwatcherevent-type-alias)
  - [FirecrawlWatcherEventType (type alias)](#firecrawlwatchereventtype-type-alias)
  - [FirecrawlWatcherFailure (class)](#firecrawlwatcherfailure-class)
  - [FirecrawlWatcherKind (type alias)](#firecrawlwatcherkind-type-alias)
  - [FirecrawlWatcherOptions (type alias)](#firecrawlwatcheroptions-type-alias)
  - [FirecrawlWatcherPayload (class)](#firecrawlwatcherpayload-class)
  - [FirecrawlWatcherSuccess (class)](#firecrawlwatchersuccess-class)
- [schemas](#schemas)
  - [FirecrawlActiveCrawlsData](#firecrawlactivecrawlsdata)
  - [FirecrawlAgentRequest](#firecrawlagentrequest)
  - [FirecrawlAgentResponseData](#firecrawlagentresponsedata)
  - [FirecrawlAgentStatus](#firecrawlagentstatus)
  - [FirecrawlAgentStatusData](#firecrawlagentstatusdata)
  - [FirecrawlAgentWaitRequest](#firecrawlagentwaitrequest)
  - [FirecrawlBatchScrapeJobData](#firecrawlbatchscrapejobdata)
  - [FirecrawlBatchScrapeOptions](#firecrawlbatchscrapeoptions)
  - [FirecrawlBatchScrapeResponseData](#firecrawlbatchscraperesponsedata)
  - [FirecrawlBatchScrapeWaitOptions](#firecrawlbatchscrapewaitoptions)
  - [FirecrawlBrowserCreateData](#firecrawlbrowsercreatedata)
  - [FirecrawlBrowserDeleteData](#firecrawlbrowserdeletedata)
  - [FirecrawlBrowserExecuteData](#firecrawlbrowserexecutedata)
  - [FirecrawlBrowserExecuteRequest](#firecrawlbrowserexecuterequest)
  - [FirecrawlBrowserLanguage](#firecrawlbrowserlanguage)
  - [FirecrawlBrowserListData](#firecrawlbrowserlistdata)
  - [FirecrawlBrowserOptions](#firecrawlbrowseroptions)
  - [FirecrawlConcurrencyData](#firecrawlconcurrencydata)
  - [FirecrawlCrawlErrorsData](#firecrawlcrawlerrorsdata)
  - [FirecrawlCrawlJobData](#firecrawlcrawljobdata)
  - [FirecrawlCrawlOptions](#firecrawlcrawloptions)
  - [FirecrawlCrawlResponseData](#firecrawlcrawlresponsedata)
  - [FirecrawlCrawlWaitOptions](#firecrawlcrawlwaitoptions)
  - [FirecrawlCreateMonitorRequest](#firecrawlcreatemonitorrequest)
  - [FirecrawlCreditUsageData](#firecrawlcreditusagedata)
  - [FirecrawlCreditUsageHistoricalData](#firecrawlcreditusagehistoricaldata)
  - [FirecrawlDocument](#firecrawldocument)
  - [FirecrawlFormatType](#firecrawlformattype)
  - [FirecrawlGetMonitorCheckOptions](#firecrawlgetmonitorcheckoptions)
  - [FirecrawlInteractData](#firecrawlinteractdata)
  - [FirecrawlInteractRequest](#firecrawlinteractrequest)
  - [FirecrawlJobStatus](#firecrawljobstatus)
  - [FirecrawlListBrowsersOptions](#firecrawllistbrowsersoptions)
  - [FirecrawlListMonitorChecksOptions](#firecrawllistmonitorchecksoptions)
  - [FirecrawlListMonitorsOptions](#firecrawllistmonitorsoptions)
  - [FirecrawlMapData](#firecrawlmapdata)
  - [FirecrawlMapOptions](#firecrawlmapoptions)
  - [FirecrawlMonitorCheckData](#firecrawlmonitorcheckdata)
  - [FirecrawlMonitorCheckDetailData](#firecrawlmonitorcheckdetaildata)
  - [FirecrawlMonitorCheckListData](#firecrawlmonitorchecklistdata)
  - [FirecrawlMonitorData](#firecrawlmonitordata)
  - [FirecrawlMonitorListData](#firecrawlmonitorlistdata)
  - [FirecrawlPaginationConfig](#firecrawlpaginationconfig)
  - [FirecrawlParseFile](#firecrawlparsefile)
  - [FirecrawlParseOptions](#firecrawlparseoptions)
  - [FirecrawlQueueStatusData](#firecrawlqueuestatusdata)
  - [FirecrawlScrapeActionType](#firecrawlscrapeactiontype)
  - [FirecrawlScrapeOptions](#firecrawlscrapeoptions)
  - [FirecrawlSearchData](#firecrawlsearchdata)
  - [FirecrawlSearchOptions](#firecrawlsearchoptions)
  - [FirecrawlSearchSourceType](#firecrawlsearchsourcetype)
  - [FirecrawlStopInteractionData](#firecrawlstopinteractiondata)
  - [FirecrawlTokenUsageData](#firecrawltokenusagedata)
  - [FirecrawlTokenUsageHistoricalData](#firecrawltokenusagehistoricaldata)
  - [FirecrawlUpdateMonitorRequest](#firecrawlupdatemonitorrequest)
  - [FirecrawlWatcherDocumentEvent (class)](#firecrawlwatcherdocumentevent-class)
  - [FirecrawlWatcherDoneEvent (class)](#firecrawlwatcherdoneevent-class)
  - [FirecrawlWatcherErrorEvent (class)](#firecrawlwatchererrorevent-class)
  - [FirecrawlWatcherEvent](#firecrawlwatcherevent)
  - [FirecrawlWatcherEventType](#firecrawlwatchereventtype)
  - [FirecrawlWatcherKind](#firecrawlwatcherkind)
  - [FirecrawlWatcherOptions](#firecrawlwatcheroptions)
  - [FirecrawlWatcherSnapshotEvent (class)](#firecrawlwatchersnapshotevent-class)
---

# models

## FirecrawlActiveCrawlsData (type alias)

Type for `FirecrawlActiveCrawlsData`.

**Example**

```ts
import type { FirecrawlActiveCrawlsData } from "@beep/firecrawl"

const value: FirecrawlActiveCrawlsData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlActiveCrawlsData = typeof FirecrawlActiveCrawlsData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1330)

Since v0.0.0

## FirecrawlAgentFailure (class)

Firecrawl Agent Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlAgentFailure } from "@beep/firecrawl"

console.log(FirecrawlAgentFailure)
```

**Signature**

```ts
declare class FirecrawlAgentFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3768)

Since v0.0.0

## FirecrawlAgentPayload (class)

Firecrawl Agent Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlAgentPayload } from "@beep/firecrawl"

console.log(FirecrawlAgentPayload)
```

**Signature**

```ts
declare class FirecrawlAgentPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3734)

Since v0.0.0

## FirecrawlAgentRequest (type alias)

Type for `FirecrawlAgentRequest`.

**Example**

```ts
import type { FirecrawlAgentRequest } from "@beep/firecrawl"

const value: FirecrawlAgentRequest | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlAgentRequest = typeof FirecrawlAgentRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L909)

Since v0.0.0

## FirecrawlAgentResponseData (type alias)

Type for `FirecrawlAgentResponseData`.

**Example**

```ts
import type { FirecrawlAgentResponseData } from "@beep/firecrawl"

const value: FirecrawlAgentResponseData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlAgentResponseData = typeof FirecrawlAgentResponseData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1586)

Since v0.0.0

## FirecrawlAgentStatus (type alias)

Type for `FirecrawlAgentStatus`.

**Example**

```ts
import type { FirecrawlAgentStatus } from "@beep/firecrawl"

const status: FirecrawlAgentStatus = "processing"
console.log(status)
```

**Signature**

```ts
type FirecrawlAgentStatus = typeof FirecrawlAgentStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L299)

Since v0.0.0

## FirecrawlAgentStatusData (type alias)

Type for `FirecrawlAgentStatusData`.

**Example**

```ts
import type { FirecrawlAgentStatusData } from "@beep/firecrawl"

const value: FirecrawlAgentStatusData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlAgentStatusData = typeof FirecrawlAgentStatusData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1618)

Since v0.0.0

## FirecrawlAgentSuccess (class)

Firecrawl Agent Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlAgentSuccess } from "@beep/firecrawl"

console.log(FirecrawlAgentSuccess)
```

**Signature**

```ts
declare class FirecrawlAgentSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3751)

Since v0.0.0

## FirecrawlAgentWaitRequest (type alias)

Type for `FirecrawlAgentWaitRequest`.

**Example**

```ts
import type { FirecrawlAgentWaitRequest } from "@beep/firecrawl"

const value: FirecrawlAgentWaitRequest | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlAgentWaitRequest = typeof FirecrawlAgentWaitRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L942)

Since v0.0.0

## FirecrawlBatchScrapeFailure (class)

Firecrawl Batch Scrape Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlBatchScrapeFailure } from "@beep/firecrawl"

console.log(FirecrawlBatchScrapeFailure)
```

**Signature**

```ts
declare class FirecrawlBatchScrapeFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3600)

Since v0.0.0

## FirecrawlBatchScrapeJobData (type alias)

Type for `FirecrawlBatchScrapeJobData`.

**Example**

```ts
import type { FirecrawlBatchScrapeJobData } from "@beep/firecrawl"

const value: FirecrawlBatchScrapeJobData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlBatchScrapeJobData = typeof FirecrawlBatchScrapeJobData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1554)

Since v0.0.0

## FirecrawlBatchScrapeOptions (type alias)

Type for `FirecrawlBatchScrapeOptions`.

**Example**

```ts
import type { FirecrawlBatchScrapeOptions } from "@beep/firecrawl"

const value: FirecrawlBatchScrapeOptions | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlBatchScrapeOptions = typeof FirecrawlBatchScrapeOptions.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L844)

Since v0.0.0

## FirecrawlBatchScrapePayload (class)

Firecrawl Batch Scrape Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlBatchScrapePayload } from "@beep/firecrawl"

console.log(FirecrawlBatchScrapePayload)
```

**Signature**

```ts
declare class FirecrawlBatchScrapePayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3559)

Since v0.0.0

## FirecrawlBatchScrapeResponseData (type alias)

Type for `FirecrawlBatchScrapeResponseData`.

**Example**

```ts
import type { FirecrawlBatchScrapeResponseData } from "@beep/firecrawl"

const value: FirecrawlBatchScrapeResponseData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlBatchScrapeResponseData = typeof FirecrawlBatchScrapeResponseData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1522)

Since v0.0.0

## FirecrawlBatchScrapeSuccess (class)

Firecrawl Batch Scrape Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlBatchScrapeSuccess } from "@beep/firecrawl"

console.log(FirecrawlBatchScrapeSuccess)
```

**Signature**

```ts
declare class FirecrawlBatchScrapeSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3583)

Since v0.0.0

## FirecrawlBatchScrapeWaitOptions (type alias)

Type for `FirecrawlBatchScrapeWaitOptions`.

**Example**

```ts
import type { FirecrawlBatchScrapeWaitOptions } from "@beep/firecrawl"

const value: FirecrawlBatchScrapeWaitOptions | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlBatchScrapeWaitOptions = typeof FirecrawlBatchScrapeWaitOptions.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L876)

Since v0.0.0

## FirecrawlBrowserCreateData (type alias)

Type for `FirecrawlBrowserCreateData`.

**Example**

```ts
import type { FirecrawlBrowserCreateData } from "@beep/firecrawl"

const value: FirecrawlBrowserCreateData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlBrowserCreateData = typeof FirecrawlBrowserCreateData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1650)

Since v0.0.0

## FirecrawlBrowserDeleteData (type alias)

Type for `FirecrawlBrowserDeleteData`.

**Example**

```ts
import type { FirecrawlBrowserDeleteData } from "@beep/firecrawl"

const value: FirecrawlBrowserDeleteData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlBrowserDeleteData = typeof FirecrawlBrowserDeleteData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1714)

Since v0.0.0

## FirecrawlBrowserExecuteData (type alias)

Type for `FirecrawlBrowserExecuteData`.

**Example**

```ts
import type { FirecrawlBrowserExecuteData } from "@beep/firecrawl"

const value: FirecrawlBrowserExecuteData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlBrowserExecuteData = typeof FirecrawlBrowserExecuteData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1682)

Since v0.0.0

## FirecrawlBrowserExecuteFailure (class)

Firecrawl Browser Execute Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlBrowserExecuteFailure } from "@beep/firecrawl"

console.log(FirecrawlBrowserExecuteFailure)
```

**Signature**

```ts
declare class FirecrawlBrowserExecuteFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3936)

Since v0.0.0

## FirecrawlBrowserExecutePayload (class)

Firecrawl Browser Execute Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlBrowserExecutePayload } from "@beep/firecrawl"

console.log(FirecrawlBrowserExecutePayload)
```

**Signature**

```ts
declare class FirecrawlBrowserExecutePayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3894)

Since v0.0.0

## FirecrawlBrowserExecuteRequest (type alias)

Type for `FirecrawlBrowserExecuteRequest`.

**Example**

```ts
import type { FirecrawlBrowserExecuteRequest } from "@beep/firecrawl"

const value: FirecrawlBrowserExecuteRequest | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlBrowserExecuteRequest = typeof FirecrawlBrowserExecuteRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1040)

Since v0.0.0

## FirecrawlBrowserExecuteSuccess (class)

Firecrawl Browser Execute Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlBrowserExecuteSuccess } from "@beep/firecrawl"

console.log(FirecrawlBrowserExecuteSuccess)
```

**Signature**

```ts
declare class FirecrawlBrowserExecuteSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3915)

Since v0.0.0

## FirecrawlBrowserFailure (class)

Firecrawl Browser Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlBrowserFailure } from "@beep/firecrawl"

console.log(FirecrawlBrowserFailure)
```

**Signature**

```ts
declare class FirecrawlBrowserFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3876)

Since v0.0.0

## FirecrawlBrowserLanguage (type alias)

Type for `FirecrawlBrowserLanguage`.

**Example**

```ts
import type { FirecrawlBrowserLanguage } from "@beep/firecrawl"

const language: FirecrawlBrowserLanguage = "node"
console.log(language)
```

**Signature**

```ts
type FirecrawlBrowserLanguage = typeof FirecrawlBrowserLanguage.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L334)

Since v0.0.0

## FirecrawlBrowserListData (type alias)

Type for `FirecrawlBrowserListData`.

**Example**

```ts
import type { FirecrawlBrowserListData } from "@beep/firecrawl"

const value: FirecrawlBrowserListData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlBrowserListData = typeof FirecrawlBrowserListData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1746)

Since v0.0.0

## FirecrawlBrowserOptions (type alias)

Type for `FirecrawlBrowserOptions`.

**Example**

```ts
import type { FirecrawlBrowserOptions } from "@beep/firecrawl"

const value: FirecrawlBrowserOptions | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlBrowserOptions = typeof FirecrawlBrowserOptions.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L975)

Since v0.0.0

## FirecrawlBrowserPayload (class)

Firecrawl Browser Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlBrowserPayload } from "@beep/firecrawl"

console.log(FirecrawlBrowserPayload)
```

**Signature**

```ts
declare class FirecrawlBrowserPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3838)

Since v0.0.0

## FirecrawlBrowserSuccess (class)

Firecrawl Browser Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlBrowserSuccess } from "@beep/firecrawl"

console.log(FirecrawlBrowserSuccess)
```

**Signature**

```ts
declare class FirecrawlBrowserSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3859)

Since v0.0.0

## FirecrawlCancelAgentFailure (class)

Firecrawl Cancel Agent Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlCancelAgentFailure } from "@beep/firecrawl"

console.log(FirecrawlCancelAgentFailure)
```

**Signature**

```ts
declare class FirecrawlCancelAgentFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3820)

Since v0.0.0

## FirecrawlCancelAgentPayload (class)

Firecrawl Cancel Agent Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlCancelAgentPayload } from "@beep/firecrawl"

console.log(FirecrawlCancelAgentPayload)
```

**Signature**

```ts
declare class FirecrawlCancelAgentPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3786)

Since v0.0.0

## FirecrawlCancelAgentSuccess (class)

Firecrawl Cancel Agent Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlCancelAgentSuccess } from "@beep/firecrawl"

console.log(FirecrawlCancelAgentSuccess)
```

**Signature**

```ts
declare class FirecrawlCancelAgentSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3803)

Since v0.0.0

## FirecrawlCancelBatchScrapeFailure (class)

Firecrawl Cancel Batch Scrape Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlCancelBatchScrapeFailure } from "@beep/firecrawl"

console.log(FirecrawlCancelBatchScrapeFailure)
```

**Signature**

```ts
declare class FirecrawlCancelBatchScrapeFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3537)

Since v0.0.0

## FirecrawlCancelBatchScrapePayload (class)

Firecrawl Cancel Batch Scrape Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlCancelBatchScrapePayload } from "@beep/firecrawl"

console.log(FirecrawlCancelBatchScrapePayload)
```

**Signature**

```ts
declare class FirecrawlCancelBatchScrapePayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3495)

Since v0.0.0

## FirecrawlCancelBatchScrapeSuccess (class)

Firecrawl Cancel Batch Scrape Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlCancelBatchScrapeSuccess } from "@beep/firecrawl"

console.log(FirecrawlCancelBatchScrapeSuccess)
```

**Signature**

```ts
declare class FirecrawlCancelBatchScrapeSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3516)

Since v0.0.0

## FirecrawlCancelCrawlFailure (class)

Firecrawl Cancel Crawl Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlCancelCrawlFailure } from "@beep/firecrawl"

console.log(FirecrawlCancelCrawlFailure)
```

**Signature**

```ts
declare class FirecrawlCancelCrawlFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2529)

Since v0.0.0

## FirecrawlCancelCrawlPayload (class)

Firecrawl Cancel Crawl Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlCancelCrawlPayload } from "@beep/firecrawl"

console.log(FirecrawlCancelCrawlPayload)
```

**Signature**

```ts
declare class FirecrawlCancelCrawlPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2495)

Since v0.0.0

## FirecrawlCancelCrawlSuccess (class)

Firecrawl Cancel Crawl Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlCancelCrawlSuccess } from "@beep/firecrawl"

console.log(FirecrawlCancelCrawlSuccess)
```

**Signature**

```ts
declare class FirecrawlCancelCrawlSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2512)

Since v0.0.0

## FirecrawlConcurrencyData (type alias)

Type for `FirecrawlConcurrencyData`.

**Example**

```ts
import type { FirecrawlConcurrencyData } from "@beep/firecrawl"

const value: FirecrawlConcurrencyData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlConcurrencyData = typeof FirecrawlConcurrencyData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1778)

Since v0.0.0

## FirecrawlCrawlErrorsData (type alias)

Type for `FirecrawlCrawlErrorsData`.

**Example**

```ts
import type { FirecrawlCrawlErrorsData } from "@beep/firecrawl"

const value: FirecrawlCrawlErrorsData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlCrawlErrorsData = typeof FirecrawlCrawlErrorsData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1298)

Since v0.0.0

## FirecrawlCrawlFailure (class)

Firecrawl Crawl Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlCrawlFailure } from "@beep/firecrawl"

console.log(FirecrawlCrawlFailure)
```

**Signature**

```ts
declare class FirecrawlCrawlFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2588)

Since v0.0.0

## FirecrawlCrawlJobData (type alias)

Type for `FirecrawlCrawlJobData`.

**Example**

```ts
import type { FirecrawlCrawlJobData } from "@beep/firecrawl"

const value: FirecrawlCrawlJobData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlCrawlJobData = typeof FirecrawlCrawlJobData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1266)

Since v0.0.0

## FirecrawlCrawlOptions (type alias)

Type for `FirecrawlCrawlOptions`.

**Example**

```ts
import type { FirecrawlCrawlOptions } from "@beep/firecrawl"

const value: FirecrawlCrawlOptions | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlCrawlOptions = typeof FirecrawlCrawlOptions.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L581)

Since v0.0.0

## FirecrawlCrawlParamsPreviewFailure (class)

Firecrawl Crawl Params Preview Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlCrawlParamsPreviewFailure } from "@beep/firecrawl"

console.log(FirecrawlCrawlParamsPreviewFailure)
```

**Signature**

```ts
declare class FirecrawlCrawlParamsPreviewFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2776)

Since v0.0.0

## FirecrawlCrawlParamsPreviewPayload (class)

Firecrawl Crawl Params Preview Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlCrawlParamsPreviewPayload } from "@beep/firecrawl"

console.log(FirecrawlCrawlParamsPreviewPayload)
```

**Signature**

```ts
declare class FirecrawlCrawlParamsPreviewPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2734)

Since v0.0.0

## FirecrawlCrawlParamsPreviewSuccess (class)

Firecrawl Crawl Params Preview Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlCrawlParamsPreviewSuccess } from "@beep/firecrawl"

console.log(FirecrawlCrawlParamsPreviewSuccess)
```

**Signature**

```ts
declare class FirecrawlCrawlParamsPreviewSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2755)

Since v0.0.0

## FirecrawlCrawlPayload (class)

Firecrawl Crawl Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlCrawlPayload } from "@beep/firecrawl"

console.log(FirecrawlCrawlPayload)
```

**Signature**

```ts
declare class FirecrawlCrawlPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2547)

Since v0.0.0

## FirecrawlCrawlResponseData (type alias)

Type for `FirecrawlCrawlResponseData`.

**Example**

```ts
import type { FirecrawlCrawlResponseData } from "@beep/firecrawl"

const value: FirecrawlCrawlResponseData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlCrawlResponseData = typeof FirecrawlCrawlResponseData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1234)

Since v0.0.0

## FirecrawlCrawlSuccess (class)

Firecrawl Crawl Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlCrawlSuccess } from "@beep/firecrawl"

console.log(FirecrawlCrawlSuccess)
```

**Signature**

```ts
declare class FirecrawlCrawlSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2571)

Since v0.0.0

## FirecrawlCrawlWaitOptions (type alias)

Type for `FirecrawlCrawlWaitOptions`.

**Example**

```ts
import type { FirecrawlCrawlWaitOptions } from "@beep/firecrawl"

const value: FirecrawlCrawlWaitOptions | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlCrawlWaitOptions = typeof FirecrawlCrawlWaitOptions.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L613)

Since v0.0.0

## FirecrawlCreateMonitorFailure (class)

Firecrawl Create Monitor Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlCreateMonitorFailure } from "@beep/firecrawl"

console.log(FirecrawlCreateMonitorFailure)
```

**Signature**

```ts
declare class FirecrawlCreateMonitorFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2838)

Since v0.0.0

## FirecrawlCreateMonitorPayload (class)

Firecrawl Create Monitor Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlCreateMonitorPayload } from "@beep/firecrawl"

console.log(FirecrawlCreateMonitorPayload)
```

**Signature**

```ts
declare class FirecrawlCreateMonitorPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2798)

Since v0.0.0

## FirecrawlCreateMonitorRequest (type alias)

Type for `FirecrawlCreateMonitorRequest`.

**Example**

```ts
import type { FirecrawlCreateMonitorRequest } from "@beep/firecrawl"

const value: FirecrawlCreateMonitorRequest | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlCreateMonitorRequest = typeof FirecrawlCreateMonitorRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L679)

Since v0.0.0

## FirecrawlCreateMonitorSuccess (class)

Firecrawl Create Monitor Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlCreateMonitorSuccess } from "@beep/firecrawl"

console.log(FirecrawlCreateMonitorSuccess)
```

**Signature**

```ts
declare class FirecrawlCreateMonitorSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2817)

Since v0.0.0

## FirecrawlCreditUsageData (type alias)

Type for `FirecrawlCreditUsageData`.

**Example**

```ts
import type { FirecrawlCreditUsageData } from "@beep/firecrawl"

const value: FirecrawlCreditUsageData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlCreditUsageData = typeof FirecrawlCreditUsageData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1810)

Since v0.0.0

## FirecrawlCreditUsageHistoricalData (type alias)

Type for `FirecrawlCreditUsageHistoricalData`.

**Example**

```ts
import type { FirecrawlCreditUsageHistoricalData } from "@beep/firecrawl"

const value: FirecrawlCreditUsageHistoricalData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlCreditUsageHistoricalData = typeof FirecrawlCreditUsageHistoricalData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1874)

Since v0.0.0

## FirecrawlDeleteBrowserFailure (class)

Firecrawl Delete Browser Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlDeleteBrowserFailure } from "@beep/firecrawl"

console.log(FirecrawlDeleteBrowserFailure)
```

**Signature**

```ts
declare class FirecrawlDeleteBrowserFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3998)

Since v0.0.0

## FirecrawlDeleteBrowserPayload (class)

Firecrawl Delete Browser Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlDeleteBrowserPayload } from "@beep/firecrawl"

console.log(FirecrawlDeleteBrowserPayload)
```

**Signature**

```ts
declare class FirecrawlDeleteBrowserPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3958)

Since v0.0.0

## FirecrawlDeleteBrowserSuccess (class)

Firecrawl Delete Browser Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlDeleteBrowserSuccess } from "@beep/firecrawl"

console.log(FirecrawlDeleteBrowserSuccess)
```

**Signature**

```ts
declare class FirecrawlDeleteBrowserSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3977)

Since v0.0.0

## FirecrawlDeleteMonitorFailure (class)

Firecrawl Delete Monitor Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlDeleteMonitorFailure } from "@beep/firecrawl"

console.log(FirecrawlDeleteMonitorFailure)
```

**Signature**

```ts
declare class FirecrawlDeleteMonitorFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3080)

Since v0.0.0

## FirecrawlDeleteMonitorPayload (class)

Firecrawl Delete Monitor Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlDeleteMonitorPayload } from "@beep/firecrawl"

console.log(FirecrawlDeleteMonitorPayload)
```

**Signature**

```ts
declare class FirecrawlDeleteMonitorPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3040)

Since v0.0.0

## FirecrawlDeleteMonitorSuccess (class)

Firecrawl Delete Monitor Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlDeleteMonitorSuccess } from "@beep/firecrawl"

console.log(FirecrawlDeleteMonitorSuccess)
```

**Signature**

```ts
declare class FirecrawlDeleteMonitorSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3059)

Since v0.0.0

## FirecrawlDocument (type alias)

Type for `FirecrawlDocument`.

**Example**

```ts
import type { FirecrawlDocument } from "@beep/firecrawl"

const value: FirecrawlDocument | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlDocument = typeof FirecrawlDocument.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1138)

Since v0.0.0

## FirecrawlFormatType (type alias)

Type for `FirecrawlFormatType`.

**Example**

```ts
import type { FirecrawlFormatType } from "@beep/firecrawl"

const format: FirecrawlFormatType = "markdown"
console.log(format)
```

**Signature**

```ts
type FirecrawlFormatType = typeof FirecrawlFormatType.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L149)

Since v0.0.0

## FirecrawlGetActiveCrawlsFailure (class)

Firecrawl Get Active Crawls Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlGetActiveCrawlsFailure } from "@beep/firecrawl"

console.log(FirecrawlGetActiveCrawlsFailure)
```

**Signature**

```ts
declare class FirecrawlGetActiveCrawlsFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2712)

Since v0.0.0

## FirecrawlGetActiveCrawlsPayload (class)

Firecrawl Get Active Crawls Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlGetActiveCrawlsPayload } from "@beep/firecrawl"

console.log(FirecrawlGetActiveCrawlsPayload)
```

**Signature**

```ts
declare class FirecrawlGetActiveCrawlsPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2670)

Since v0.0.0

## FirecrawlGetActiveCrawlsSuccess (class)

Firecrawl Get Active Crawls Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlGetActiveCrawlsSuccess } from "@beep/firecrawl"

console.log(FirecrawlGetActiveCrawlsSuccess)
```

**Signature**

```ts
declare class FirecrawlGetActiveCrawlsSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2691)

Since v0.0.0

## FirecrawlGetAgentStatusFailure (class)

Firecrawl Get Agent Status Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlGetAgentStatusFailure } from "@beep/firecrawl"

console.log(FirecrawlGetAgentStatusFailure)
```

**Signature**

```ts
declare class FirecrawlGetAgentStatusFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3712)

Since v0.0.0

## FirecrawlGetAgentStatusPayload (class)

Firecrawl Get Agent Status Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlGetAgentStatusPayload } from "@beep/firecrawl"

console.log(FirecrawlGetAgentStatusPayload)
```

**Signature**

```ts
declare class FirecrawlGetAgentStatusPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3670)

Since v0.0.0

## FirecrawlGetAgentStatusSuccess (class)

Firecrawl Get Agent Status Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlGetAgentStatusSuccess } from "@beep/firecrawl"

console.log(FirecrawlGetAgentStatusSuccess)
```

**Signature**

```ts
declare class FirecrawlGetAgentStatusSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3691)

Since v0.0.0

## FirecrawlGetBatchScrapeErrorsFailure (class)

Firecrawl Get Batch Scrape Errors Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlGetBatchScrapeErrorsFailure } from "@beep/firecrawl"

console.log(FirecrawlGetBatchScrapeErrorsFailure)
```

**Signature**

```ts
declare class FirecrawlGetBatchScrapeErrorsFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3473)

Since v0.0.0

## FirecrawlGetBatchScrapeErrorsPayload (class)

Firecrawl Get Batch Scrape Errors Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlGetBatchScrapeErrorsPayload } from "@beep/firecrawl"

console.log(FirecrawlGetBatchScrapeErrorsPayload)
```

**Signature**

```ts
declare class FirecrawlGetBatchScrapeErrorsPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3431)

Since v0.0.0

## FirecrawlGetBatchScrapeErrorsSuccess (class)

Firecrawl Get Batch Scrape Errors Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlGetBatchScrapeErrorsSuccess } from "@beep/firecrawl"

console.log(FirecrawlGetBatchScrapeErrorsSuccess)
```

**Signature**

```ts
declare class FirecrawlGetBatchScrapeErrorsSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3452)

Since v0.0.0

## FirecrawlGetBatchScrapeStatusFailure (class)

Firecrawl Get Batch Scrape Status Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlGetBatchScrapeStatusFailure } from "@beep/firecrawl"

console.log(FirecrawlGetBatchScrapeStatusFailure)
```

**Signature**

```ts
declare class FirecrawlGetBatchScrapeStatusFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3409)

Since v0.0.0

## FirecrawlGetBatchScrapeStatusPayload (class)

Firecrawl Get Batch Scrape Status Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlGetBatchScrapeStatusPayload } from "@beep/firecrawl"

console.log(FirecrawlGetBatchScrapeStatusPayload)
```

**Signature**

```ts
declare class FirecrawlGetBatchScrapeStatusPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3362)

Since v0.0.0

## FirecrawlGetBatchScrapeStatusSuccess (class)

Firecrawl Get Batch Scrape Status Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlGetBatchScrapeStatusSuccess } from "@beep/firecrawl"

console.log(FirecrawlGetBatchScrapeStatusSuccess)
```

**Signature**

```ts
declare class FirecrawlGetBatchScrapeStatusSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3388)

Since v0.0.0

## FirecrawlGetConcurrencyFailure (class)

Firecrawl Get Concurrency Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlGetConcurrencyFailure } from "@beep/firecrawl"

console.log(FirecrawlGetConcurrencyFailure)
```

**Signature**

```ts
declare class FirecrawlGetConcurrencyFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4128)

Since v0.0.0

## FirecrawlGetConcurrencyPayload (class)

Firecrawl Get Concurrency Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlGetConcurrencyPayload } from "@beep/firecrawl"

console.log(FirecrawlGetConcurrencyPayload)
```

**Signature**

```ts
declare class FirecrawlGetConcurrencyPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4086)

Since v0.0.0

## FirecrawlGetConcurrencySuccess (class)

Firecrawl Get Concurrency Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlGetConcurrencySuccess } from "@beep/firecrawl"

console.log(FirecrawlGetConcurrencySuccess)
```

**Signature**

```ts
declare class FirecrawlGetConcurrencySuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4107)

Since v0.0.0

## FirecrawlGetCrawlErrorsFailure (class)

Firecrawl Get Crawl Errors Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlGetCrawlErrorsFailure } from "@beep/firecrawl"

console.log(FirecrawlGetCrawlErrorsFailure)
```

**Signature**

```ts
declare class FirecrawlGetCrawlErrorsFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2648)

Since v0.0.0

## FirecrawlGetCrawlErrorsPayload (class)

Firecrawl Get Crawl Errors Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlGetCrawlErrorsPayload } from "@beep/firecrawl"

console.log(FirecrawlGetCrawlErrorsPayload)
```

**Signature**

```ts
declare class FirecrawlGetCrawlErrorsPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2606)

Since v0.0.0

## FirecrawlGetCrawlErrorsSuccess (class)

Firecrawl Get Crawl Errors Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlGetCrawlErrorsSuccess } from "@beep/firecrawl"

console.log(FirecrawlGetCrawlErrorsSuccess)
```

**Signature**

```ts
declare class FirecrawlGetCrawlErrorsSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2627)

Since v0.0.0

## FirecrawlGetCrawlStatusFailure (class)

Firecrawl Get Crawl Status Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlGetCrawlStatusFailure } from "@beep/firecrawl"

console.log(FirecrawlGetCrawlStatusFailure)
```

**Signature**

```ts
declare class FirecrawlGetCrawlStatusFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2473)

Since v0.0.0

## FirecrawlGetCrawlStatusPayload (class)

Firecrawl Get Crawl Status Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlGetCrawlStatusPayload } from "@beep/firecrawl"

console.log(FirecrawlGetCrawlStatusPayload)
```

**Signature**

```ts
declare class FirecrawlGetCrawlStatusPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2426)

Since v0.0.0

## FirecrawlGetCrawlStatusSuccess (class)

Firecrawl Get Crawl Status Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlGetCrawlStatusSuccess } from "@beep/firecrawl"

console.log(FirecrawlGetCrawlStatusSuccess)
```

**Signature**

```ts
declare class FirecrawlGetCrawlStatusSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2452)

Since v0.0.0

## FirecrawlGetCreditUsageFailure (class)

Firecrawl Get Credit Usage Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlGetCreditUsageFailure } from "@beep/firecrawl"

console.log(FirecrawlGetCreditUsageFailure)
```

**Signature**

```ts
declare class FirecrawlGetCreditUsageFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4192)

Since v0.0.0

## FirecrawlGetCreditUsageHistoricalFailure (class)

Firecrawl Get Credit Usage Historical Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlGetCreditUsageHistoricalFailure } from "@beep/firecrawl"

console.log(FirecrawlGetCreditUsageHistoricalFailure)
```

**Signature**

```ts
declare class FirecrawlGetCreditUsageHistoricalFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4318)

Since v0.0.0

## FirecrawlGetCreditUsageHistoricalPayload (class)

Firecrawl Get Credit Usage Historical Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlGetCreditUsageHistoricalPayload } from "@beep/firecrawl"

console.log(FirecrawlGetCreditUsageHistoricalPayload)
```

**Signature**

```ts
declare class FirecrawlGetCreditUsageHistoricalPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4276)

Since v0.0.0

## FirecrawlGetCreditUsageHistoricalSuccess (class)

Firecrawl Get Credit Usage Historical Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlGetCreditUsageHistoricalSuccess } from "@beep/firecrawl"

console.log(FirecrawlGetCreditUsageHistoricalSuccess)
```

**Signature**

```ts
declare class FirecrawlGetCreditUsageHistoricalSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4297)

Since v0.0.0

## FirecrawlGetCreditUsagePayload (class)

Firecrawl Get Credit Usage Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlGetCreditUsagePayload } from "@beep/firecrawl"

console.log(FirecrawlGetCreditUsagePayload)
```

**Signature**

```ts
declare class FirecrawlGetCreditUsagePayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4150)

Since v0.0.0

## FirecrawlGetCreditUsageSuccess (class)

Firecrawl Get Credit Usage Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlGetCreditUsageSuccess } from "@beep/firecrawl"

console.log(FirecrawlGetCreditUsageSuccess)
```

**Signature**

```ts
declare class FirecrawlGetCreditUsageSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4171)

Since v0.0.0

## FirecrawlGetMonitorCheckFailure (class)

Firecrawl Get Monitor Check Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlGetMonitorCheckFailure } from "@beep/firecrawl"

console.log(FirecrawlGetMonitorCheckFailure)
```

**Signature**

```ts
declare class FirecrawlGetMonitorCheckFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3271)

Since v0.0.0

## FirecrawlGetMonitorCheckOptions (type alias)

Type for `FirecrawlGetMonitorCheckOptions`.

**Example**

```ts
import type { FirecrawlGetMonitorCheckOptions } from "@beep/firecrawl"

const value: FirecrawlGetMonitorCheckOptions | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlGetMonitorCheckOptions = typeof FirecrawlGetMonitorCheckOptions.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L811)

Since v0.0.0

## FirecrawlGetMonitorCheckPayload (class)

Firecrawl Get Monitor Check Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlGetMonitorCheckPayload } from "@beep/firecrawl"

console.log(FirecrawlGetMonitorCheckPayload)
```

**Signature**

```ts
declare class FirecrawlGetMonitorCheckPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3223)

Since v0.0.0

## FirecrawlGetMonitorCheckSuccess (class)

Firecrawl Get Monitor Check Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlGetMonitorCheckSuccess } from "@beep/firecrawl"

console.log(FirecrawlGetMonitorCheckSuccess)
```

**Signature**

```ts
declare class FirecrawlGetMonitorCheckSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3250)

Since v0.0.0

## FirecrawlGetMonitorFailure (class)

Firecrawl Get Monitor Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlGetMonitorFailure } from "@beep/firecrawl"

console.log(FirecrawlGetMonitorFailure)
```

**Signature**

```ts
declare class FirecrawlGetMonitorFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2960)

Since v0.0.0

## FirecrawlGetMonitorPayload (class)

Firecrawl Get Monitor Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlGetMonitorPayload } from "@beep/firecrawl"

console.log(FirecrawlGetMonitorPayload)
```

**Signature**

```ts
declare class FirecrawlGetMonitorPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2926)

Since v0.0.0

## FirecrawlGetMonitorSuccess (class)

Firecrawl Get Monitor Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlGetMonitorSuccess } from "@beep/firecrawl"

console.log(FirecrawlGetMonitorSuccess)
```

**Signature**

```ts
declare class FirecrawlGetMonitorSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2943)

Since v0.0.0

## FirecrawlGetQueueStatusFailure (class)

Firecrawl Get Queue Status Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlGetQueueStatusFailure } from "@beep/firecrawl"

console.log(FirecrawlGetQueueStatusFailure)
```

**Signature**

```ts
declare class FirecrawlGetQueueStatusFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4446)

Since v0.0.0

## FirecrawlGetQueueStatusPayload (class)

Firecrawl Get Queue Status Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlGetQueueStatusPayload } from "@beep/firecrawl"

console.log(FirecrawlGetQueueStatusPayload)
```

**Signature**

```ts
declare class FirecrawlGetQueueStatusPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4404)

Since v0.0.0

## FirecrawlGetQueueStatusSuccess (class)

Firecrawl Get Queue Status Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlGetQueueStatusSuccess } from "@beep/firecrawl"

console.log(FirecrawlGetQueueStatusSuccess)
```

**Signature**

```ts
declare class FirecrawlGetQueueStatusSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4425)

Since v0.0.0

## FirecrawlGetTokenUsageFailure (class)

Firecrawl Get Token Usage Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlGetTokenUsageFailure } from "@beep/firecrawl"

console.log(FirecrawlGetTokenUsageFailure)
```

**Signature**

```ts
declare class FirecrawlGetTokenUsageFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4254)

Since v0.0.0

## FirecrawlGetTokenUsageHistoricalFailure (class)

Firecrawl Get Token Usage Historical Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlGetTokenUsageHistoricalFailure } from "@beep/firecrawl"

console.log(FirecrawlGetTokenUsageHistoricalFailure)
```

**Signature**

```ts
declare class FirecrawlGetTokenUsageHistoricalFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4382)

Since v0.0.0

## FirecrawlGetTokenUsageHistoricalPayload (class)

Firecrawl Get Token Usage Historical Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlGetTokenUsageHistoricalPayload } from "@beep/firecrawl"

console.log(FirecrawlGetTokenUsageHistoricalPayload)
```

**Signature**

```ts
declare class FirecrawlGetTokenUsageHistoricalPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4340)

Since v0.0.0

## FirecrawlGetTokenUsageHistoricalSuccess (class)

Firecrawl Get Token Usage Historical Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlGetTokenUsageHistoricalSuccess } from "@beep/firecrawl"

console.log(FirecrawlGetTokenUsageHistoricalSuccess)
```

**Signature**

```ts
declare class FirecrawlGetTokenUsageHistoricalSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4361)

Since v0.0.0

## FirecrawlGetTokenUsagePayload (class)

Firecrawl Get Token Usage Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlGetTokenUsagePayload } from "@beep/firecrawl"

console.log(FirecrawlGetTokenUsagePayload)
```

**Signature**

```ts
declare class FirecrawlGetTokenUsagePayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4214)

Since v0.0.0

## FirecrawlGetTokenUsageSuccess (class)

Firecrawl Get Token Usage Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlGetTokenUsageSuccess } from "@beep/firecrawl"

console.log(FirecrawlGetTokenUsageSuccess)
```

**Signature**

```ts
declare class FirecrawlGetTokenUsageSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4233)

Since v0.0.0

## FirecrawlInteractData (type alias)

Type for `FirecrawlInteractData`.

**Example**

```ts
import type { FirecrawlInteractData } from "@beep/firecrawl"

const value: FirecrawlInteractData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlInteractData = typeof FirecrawlInteractData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1970)

Since v0.0.0

## FirecrawlInteractFailure (class)

Firecrawl Interact Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlInteractFailure } from "@beep/firecrawl"

console.log(FirecrawlInteractFailure)
```

**Signature**

```ts
declare class FirecrawlInteractFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2116)

Since v0.0.0

## FirecrawlInteractPayload (class)

Firecrawl Interact Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlInteractPayload } from "@beep/firecrawl"

console.log(FirecrawlInteractPayload)
```

**Signature**

```ts
declare class FirecrawlInteractPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2082)

Since v0.0.0

## FirecrawlInteractRequest (type alias)

Type for `FirecrawlInteractRequest`.

**Example**

```ts
import type { FirecrawlInteractRequest } from "@beep/firecrawl"

const value: FirecrawlInteractRequest | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlInteractRequest = typeof FirecrawlInteractRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1008)

Since v0.0.0

## FirecrawlInteractSuccess (class)

Firecrawl Interact Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlInteractSuccess } from "@beep/firecrawl"

console.log(FirecrawlInteractSuccess)
```

**Signature**

```ts
declare class FirecrawlInteractSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2099)

Since v0.0.0

## FirecrawlJobStatus (type alias)

Type for `FirecrawlJobStatus`.

**Example**

```ts
import type { FirecrawlJobStatus } from "@beep/firecrawl"

const status: FirecrawlJobStatus = "completed"
console.log(status)
```

**Signature**

```ts
type FirecrawlJobStatus = typeof FirecrawlJobStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L264)

Since v0.0.0

## FirecrawlListBrowsersFailure (class)

Firecrawl List Browsers Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlListBrowsersFailure } from "@beep/firecrawl"

console.log(FirecrawlListBrowsersFailure)
```

**Signature**

```ts
declare class FirecrawlListBrowsersFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4064)

Since v0.0.0

## FirecrawlListBrowsersOptions (type alias)

Type for `FirecrawlListBrowsersOptions`.

**Example**

```ts
import type { FirecrawlListBrowsersOptions } from "@beep/firecrawl"

const value: FirecrawlListBrowsersOptions | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlListBrowsersOptions = typeof FirecrawlListBrowsersOptions.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1072)

Since v0.0.0

## FirecrawlListBrowsersPayload (class)

Firecrawl List Browsers Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlListBrowsersPayload } from "@beep/firecrawl"

console.log(FirecrawlListBrowsersPayload)
```

**Signature**

```ts
declare class FirecrawlListBrowsersPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4020)

Since v0.0.0

## FirecrawlListBrowsersSuccess (class)

Firecrawl List Browsers Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlListBrowsersSuccess } from "@beep/firecrawl"

console.log(FirecrawlListBrowsersSuccess)
```

**Signature**

```ts
declare class FirecrawlListBrowsersSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4043)

Since v0.0.0

## FirecrawlListMonitorChecksFailure (class)

Firecrawl List Monitor Checks Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlListMonitorChecksFailure } from "@beep/firecrawl"

console.log(FirecrawlListMonitorChecksFailure)
```

**Signature**

```ts
declare class FirecrawlListMonitorChecksFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3201)

Since v0.0.0

## FirecrawlListMonitorChecksOptions (type alias)

Type for `FirecrawlListMonitorChecksOptions`.

**Example**

```ts
import type { FirecrawlListMonitorChecksOptions } from "@beep/firecrawl"

const value: FirecrawlListMonitorChecksOptions | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlListMonitorChecksOptions = typeof FirecrawlListMonitorChecksOptions.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L778)

Since v0.0.0

## FirecrawlListMonitorChecksPayload (class)

Firecrawl List Monitor Checks Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlListMonitorChecksPayload } from "@beep/firecrawl"

console.log(FirecrawlListMonitorChecksPayload)
```

**Signature**

```ts
declare class FirecrawlListMonitorChecksPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3154)

Since v0.0.0

## FirecrawlListMonitorChecksSuccess (class)

Firecrawl List Monitor Checks Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlListMonitorChecksSuccess } from "@beep/firecrawl"

console.log(FirecrawlListMonitorChecksSuccess)
```

**Signature**

```ts
declare class FirecrawlListMonitorChecksSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3180)

Since v0.0.0

## FirecrawlListMonitorsFailure (class)

Firecrawl List Monitors Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlListMonitorsFailure } from "@beep/firecrawl"

console.log(FirecrawlListMonitorsFailure)
```

**Signature**

```ts
declare class FirecrawlListMonitorsFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2904)

Since v0.0.0

## FirecrawlListMonitorsOptions (type alias)

Type for `FirecrawlListMonitorsOptions`.

**Example**

```ts
import type { FirecrawlListMonitorsOptions } from "@beep/firecrawl"

const value: FirecrawlListMonitorsOptions | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlListMonitorsOptions = typeof FirecrawlListMonitorsOptions.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L745)

Since v0.0.0

## FirecrawlListMonitorsPayload (class)

Firecrawl List Monitors Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlListMonitorsPayload } from "@beep/firecrawl"

console.log(FirecrawlListMonitorsPayload)
```

**Signature**

```ts
declare class FirecrawlListMonitorsPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2860)

Since v0.0.0

## FirecrawlListMonitorsSuccess (class)

Firecrawl List Monitors Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlListMonitorsSuccess } from "@beep/firecrawl"

console.log(FirecrawlListMonitorsSuccess)
```

**Signature**

```ts
declare class FirecrawlListMonitorsSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2883)

Since v0.0.0

## FirecrawlMapData (type alias)

Type for `FirecrawlMapData`.

**Example**

```ts
import type { FirecrawlMapData } from "@beep/firecrawl"

const value: FirecrawlMapData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlMapData = typeof FirecrawlMapData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1202)

Since v0.0.0

## FirecrawlMapFailure (class)

Firecrawl Map Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlMapFailure } from "@beep/firecrawl"

console.log(FirecrawlMapFailure)
```

**Signature**

```ts
declare class FirecrawlMapFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2351)

Since v0.0.0

## FirecrawlMapOptions (type alias)

Type for `FirecrawlMapOptions`.

**Example**

```ts
import type { FirecrawlMapOptions } from "@beep/firecrawl"

const value: FirecrawlMapOptions | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlMapOptions = typeof FirecrawlMapOptions.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L548)

Since v0.0.0

## FirecrawlMapPayload (class)

Firecrawl Map Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlMapPayload } from "@beep/firecrawl"

console.log(FirecrawlMapPayload)
```

**Signature**

```ts
declare class FirecrawlMapPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2312)

Since v0.0.0

## FirecrawlMapSuccess (class)

Firecrawl Map Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlMapSuccess } from "@beep/firecrawl"

console.log(FirecrawlMapSuccess)
```

**Signature**

```ts
declare class FirecrawlMapSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2334)

Since v0.0.0

## FirecrawlMonitorCheckData (type alias)

Type for `FirecrawlMonitorCheckData`.

**Example**

```ts
import type { FirecrawlMonitorCheckData } from "@beep/firecrawl"

const value: FirecrawlMonitorCheckData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlMonitorCheckData = typeof FirecrawlMonitorCheckData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1426)

Since v0.0.0

## FirecrawlMonitorCheckDetailData (type alias)

Type for `FirecrawlMonitorCheckDetailData`.

**Example**

```ts
import type { FirecrawlMonitorCheckDetailData } from "@beep/firecrawl"

const value: FirecrawlMonitorCheckDetailData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlMonitorCheckDetailData = typeof FirecrawlMonitorCheckDetailData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1490)

Since v0.0.0

## FirecrawlMonitorCheckListData (type alias)

Type for `FirecrawlMonitorCheckListData`.

**Example**

```ts
import type { FirecrawlMonitorCheckListData } from "@beep/firecrawl"

const value: FirecrawlMonitorCheckListData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlMonitorCheckListData = typeof FirecrawlMonitorCheckListData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1458)

Since v0.0.0

## FirecrawlMonitorData (type alias)

Type for `FirecrawlMonitorData`.

**Example**

```ts
import type { FirecrawlMonitorData } from "@beep/firecrawl"

const value: FirecrawlMonitorData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlMonitorData = typeof FirecrawlMonitorData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1362)

Since v0.0.0

## FirecrawlMonitorListData (type alias)

Type for `FirecrawlMonitorListData`.

**Example**

```ts
import type { FirecrawlMonitorListData } from "@beep/firecrawl"

const value: FirecrawlMonitorListData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlMonitorListData = typeof FirecrawlMonitorListData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1394)

Since v0.0.0

## FirecrawlPaginationConfig (type alias)

Type for `FirecrawlPaginationConfig`.

**Example**

```ts
import type { FirecrawlPaginationConfig } from "@beep/firecrawl"

const value: FirecrawlPaginationConfig | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlPaginationConfig = typeof FirecrawlPaginationConfig.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L646)

Since v0.0.0

## FirecrawlParseFailure (class)

Firecrawl Parse Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlParseFailure } from "@beep/firecrawl"

console.log(FirecrawlParseFailure)
```

**Signature**

```ts
declare class FirecrawlParseFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2237)

Since v0.0.0

## FirecrawlParseFile (type alias)

Type for `FirecrawlParseFile`.

**Example**

```ts
import type { FirecrawlParseFile } from "@beep/firecrawl"

const value: FirecrawlParseFile | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlParseFile = typeof FirecrawlParseFile.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L456)

Since v0.0.0

## FirecrawlParseOptions (type alias)

Type for `FirecrawlParseOptions`.

**Example**

```ts
import type { FirecrawlParseOptions } from "@beep/firecrawl"

const value: FirecrawlParseOptions | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlParseOptions = typeof FirecrawlParseOptions.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L482)

Since v0.0.0

## FirecrawlParsePayload (class)

Firecrawl Parse Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlParsePayload } from "@beep/firecrawl"

console.log(FirecrawlParsePayload)
```

**Signature**

```ts
declare class FirecrawlParsePayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2198)

Since v0.0.0

## FirecrawlParseSuccess (class)

Firecrawl Parse Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlParseSuccess } from "@beep/firecrawl"

console.log(FirecrawlParseSuccess)
```

**Signature**

```ts
declare class FirecrawlParseSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2220)

Since v0.0.0

## FirecrawlQueueStatusData (type alias)

Type for `FirecrawlQueueStatusData`.

**Example**

```ts
import type { FirecrawlQueueStatusData } from "@beep/firecrawl"

const value: FirecrawlQueueStatusData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlQueueStatusData = typeof FirecrawlQueueStatusData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1938)

Since v0.0.0

## FirecrawlRunMonitorFailure (class)

Firecrawl Run Monitor Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlRunMonitorFailure } from "@beep/firecrawl"

console.log(FirecrawlRunMonitorFailure)
```

**Signature**

```ts
declare class FirecrawlRunMonitorFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3136)

Since v0.0.0

## FirecrawlRunMonitorPayload (class)

Firecrawl Run Monitor Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlRunMonitorPayload } from "@beep/firecrawl"

console.log(FirecrawlRunMonitorPayload)
```

**Signature**

```ts
declare class FirecrawlRunMonitorPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3102)

Since v0.0.0

## FirecrawlRunMonitorSuccess (class)

Firecrawl Run Monitor Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlRunMonitorSuccess } from "@beep/firecrawl"

console.log(FirecrawlRunMonitorSuccess)
```

**Signature**

```ts
declare class FirecrawlRunMonitorSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3119)

Since v0.0.0

## FirecrawlScrapeActionType (type alias)

Type for `FirecrawlScrapeActionType`.

**Example**

```ts
import type { FirecrawlScrapeActionType } from "@beep/firecrawl"

const action: FirecrawlScrapeActionType = "click"
console.log(action)
```

**Signature**

```ts
type FirecrawlScrapeActionType = typeof FirecrawlScrapeActionType.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L194)

Since v0.0.0

## FirecrawlScrapeFailure (class)

Firecrawl Scrape Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlScrapeFailure } from "@beep/firecrawl"

console.log(FirecrawlScrapeFailure)
```

**Signature**

```ts
declare class FirecrawlScrapeFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2064)

Since v0.0.0

## FirecrawlScrapeOptions (type alias)

Type for `FirecrawlScrapeOptions`.

**Example**

```ts
import type { FirecrawlScrapeOptions } from "@beep/firecrawl"

const value: FirecrawlScrapeOptions | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlScrapeOptions = typeof FirecrawlScrapeOptions.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L430)

Since v0.0.0

## FirecrawlScrapePayload (class)

Firecrawl Scrape Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlScrapePayload } from "@beep/firecrawl"

console.log(FirecrawlScrapePayload)
```

**Signature**

```ts
declare class FirecrawlScrapePayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2025)

Since v0.0.0

## FirecrawlScrapeSuccess (class)

Firecrawl Scrape Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlScrapeSuccess } from "@beep/firecrawl"

console.log(FirecrawlScrapeSuccess)
```

**Signature**

```ts
declare class FirecrawlScrapeSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2047)

Since v0.0.0

## FirecrawlSearchData (type alias)

Type for `FirecrawlSearchData`.

**Example**

```ts
import type { FirecrawlSearchData } from "@beep/firecrawl"

const value: FirecrawlSearchData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlSearchData = typeof FirecrawlSearchData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1170)

Since v0.0.0

## FirecrawlSearchFailure (class)

Firecrawl Search Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlSearchFailure } from "@beep/firecrawl"

console.log(FirecrawlSearchFailure)
```

**Signature**

```ts
declare class FirecrawlSearchFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2294)

Since v0.0.0

## FirecrawlSearchOptions (type alias)

Type for `FirecrawlSearchOptions`.

**Example**

```ts
import type { FirecrawlSearchOptions } from "@beep/firecrawl"

const value: FirecrawlSearchOptions | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlSearchOptions = typeof FirecrawlSearchOptions.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L515)

Since v0.0.0

## FirecrawlSearchPayload (class)

Firecrawl Search Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlSearchPayload } from "@beep/firecrawl"

console.log(FirecrawlSearchPayload)
```

**Signature**

```ts
declare class FirecrawlSearchPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2255)

Since v0.0.0

## FirecrawlSearchSourceType (type alias)

Type for `FirecrawlSearchSourceType`.

**Example**

```ts
import type { FirecrawlSearchSourceType } from "@beep/firecrawl"

const source: FirecrawlSearchSourceType = "web"
console.log(source)
```

**Signature**

```ts
type FirecrawlSearchSourceType = typeof FirecrawlSearchSourceType.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L229)

Since v0.0.0

## FirecrawlSearchSuccess (class)

Firecrawl Search Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlSearchSuccess } from "@beep/firecrawl"

console.log(FirecrawlSearchSuccess)
```

**Signature**

```ts
declare class FirecrawlSearchSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2277)

Since v0.0.0

## FirecrawlStartAgentFailure (class)

Firecrawl Start Agent Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlStartAgentFailure } from "@beep/firecrawl"

console.log(FirecrawlStartAgentFailure)
```

**Signature**

```ts
declare class FirecrawlStartAgentFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3652)

Since v0.0.0

## FirecrawlStartAgentPayload (class)

Firecrawl Start Agent Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlStartAgentPayload } from "@beep/firecrawl"

console.log(FirecrawlStartAgentPayload)
```

**Signature**

```ts
declare class FirecrawlStartAgentPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3618)

Since v0.0.0

## FirecrawlStartAgentSuccess (class)

Firecrawl Start Agent Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlStartAgentSuccess } from "@beep/firecrawl"

console.log(FirecrawlStartAgentSuccess)
```

**Signature**

```ts
declare class FirecrawlStartAgentSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3635)

Since v0.0.0

## FirecrawlStartBatchScrapeFailure (class)

Firecrawl Start Batch Scrape Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlStartBatchScrapeFailure } from "@beep/firecrawl"

console.log(FirecrawlStartBatchScrapeFailure)
```

**Signature**

```ts
declare class FirecrawlStartBatchScrapeFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3340)

Since v0.0.0

## FirecrawlStartBatchScrapePayload (class)

Firecrawl Start Batch Scrape Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlStartBatchScrapePayload } from "@beep/firecrawl"

console.log(FirecrawlStartBatchScrapePayload)
```

**Signature**

```ts
declare class FirecrawlStartBatchScrapePayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3293)

Since v0.0.0

## FirecrawlStartBatchScrapeSuccess (class)

Firecrawl Start Batch Scrape Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlStartBatchScrapeSuccess } from "@beep/firecrawl"

console.log(FirecrawlStartBatchScrapeSuccess)
```

**Signature**

```ts
declare class FirecrawlStartBatchScrapeSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3319)

Since v0.0.0

## FirecrawlStartCrawlFailure (class)

Firecrawl Start Crawl Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlStartCrawlFailure } from "@beep/firecrawl"

console.log(FirecrawlStartCrawlFailure)
```

**Signature**

```ts
declare class FirecrawlStartCrawlFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2408)

Since v0.0.0

## FirecrawlStartCrawlPayload (class)

Firecrawl Start Crawl Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlStartCrawlPayload } from "@beep/firecrawl"

console.log(FirecrawlStartCrawlPayload)
```

**Signature**

```ts
declare class FirecrawlStartCrawlPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2369)

Since v0.0.0

## FirecrawlStartCrawlSuccess (class)

Firecrawl Start Crawl Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlStartCrawlSuccess } from "@beep/firecrawl"

console.log(FirecrawlStartCrawlSuccess)
```

**Signature**

```ts
declare class FirecrawlStartCrawlSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2391)

Since v0.0.0

## FirecrawlStopInteractionData (type alias)

Type for `FirecrawlStopInteractionData`.

**Example**

```ts
import type { FirecrawlStopInteractionData } from "@beep/firecrawl"

const value: FirecrawlStopInteractionData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlStopInteractionData = typeof FirecrawlStopInteractionData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2002)

Since v0.0.0

## FirecrawlStopInteractionFailure (class)

Firecrawl Stop Interaction Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlStopInteractionFailure } from "@beep/firecrawl"

console.log(FirecrawlStopInteractionFailure)
```

**Signature**

```ts
declare class FirecrawlStopInteractionFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2176)

Since v0.0.0

## FirecrawlStopInteractionPayload (class)

Firecrawl Stop Interaction Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlStopInteractionPayload } from "@beep/firecrawl"

console.log(FirecrawlStopInteractionPayload)
```

**Signature**

```ts
declare class FirecrawlStopInteractionPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2134)

Since v0.0.0

## FirecrawlStopInteractionSuccess (class)

Firecrawl Stop Interaction Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlStopInteractionSuccess } from "@beep/firecrawl"

console.log(FirecrawlStopInteractionSuccess)
```

**Signature**

```ts
declare class FirecrawlStopInteractionSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2155)

Since v0.0.0

## FirecrawlTokenUsageData (type alias)

Type for `FirecrawlTokenUsageData`.

**Example**

```ts
import type { FirecrawlTokenUsageData } from "@beep/firecrawl"

const value: FirecrawlTokenUsageData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlTokenUsageData = typeof FirecrawlTokenUsageData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1842)

Since v0.0.0

## FirecrawlTokenUsageHistoricalData (type alias)

Type for `FirecrawlTokenUsageHistoricalData`.

**Example**

```ts
import type { FirecrawlTokenUsageHistoricalData } from "@beep/firecrawl"

const value: FirecrawlTokenUsageHistoricalData | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlTokenUsageHistoricalData = typeof FirecrawlTokenUsageHistoricalData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1906)

Since v0.0.0

## FirecrawlUpdateMonitorFailure (class)

Firecrawl Update Monitor Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlUpdateMonitorFailure } from "@beep/firecrawl"

console.log(FirecrawlUpdateMonitorFailure)
```

**Signature**

```ts
declare class FirecrawlUpdateMonitorFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L3018)

Since v0.0.0

## FirecrawlUpdateMonitorPayload (class)

Firecrawl Update Monitor Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlUpdateMonitorPayload } from "@beep/firecrawl"

console.log(FirecrawlUpdateMonitorPayload)
```

**Signature**

```ts
declare class FirecrawlUpdateMonitorPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2978)

Since v0.0.0

## FirecrawlUpdateMonitorRequest (type alias)

Type for `FirecrawlUpdateMonitorRequest`.

**Example**

```ts
import type { FirecrawlUpdateMonitorRequest } from "@beep/firecrawl"

const value: FirecrawlUpdateMonitorRequest | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlUpdateMonitorRequest = typeof FirecrawlUpdateMonitorRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L712)

Since v0.0.0

## FirecrawlUpdateMonitorSuccess (class)

Firecrawl Update Monitor Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlUpdateMonitorSuccess } from "@beep/firecrawl"

console.log(FirecrawlUpdateMonitorSuccess)
```

**Signature**

```ts
declare class FirecrawlUpdateMonitorSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L2997)

Since v0.0.0

## FirecrawlWatcherEvent (type alias)

Type for `FirecrawlWatcherEvent`.

**Example**

```ts
import type { FirecrawlWatcherEvent } from "@beep/firecrawl"

const handle = (event: FirecrawlWatcherEvent) => event.type
console.log(handle)
```

**Signature**

```ts
type FirecrawlWatcherEvent = typeof FirecrawlWatcherEvent.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4658)

Since v0.0.0

## FirecrawlWatcherEventType (type alias)

Type for `FirecrawlWatcherEventType`.

**Example**

```ts
import type { FirecrawlWatcherEventType } from "@beep/firecrawl"

const eventType: FirecrawlWatcherEventType = "document"
console.log(eventType)
```

**Signature**

```ts
type FirecrawlWatcherEventType = typeof FirecrawlWatcherEventType.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L404)

Since v0.0.0

## FirecrawlWatcherFailure (class)

Firecrawl Watcher Failure decoded from a Firecrawl API failure body.

**Example**

```ts
import { FirecrawlWatcherFailure } from "@beep/firecrawl"

console.log(FirecrawlWatcherFailure)
```

**Signature**

```ts
declare class FirecrawlWatcherFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4509)

Since v0.0.0

## FirecrawlWatcherKind (type alias)

Type for `FirecrawlWatcherKind`.

**Example**

```ts
import type { FirecrawlWatcherKind } from "@beep/firecrawl"

const kind: FirecrawlWatcherKind = "crawl"
console.log(kind)
```

**Signature**

```ts
type FirecrawlWatcherKind = typeof FirecrawlWatcherKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L369)

Since v0.0.0

## FirecrawlWatcherOptions (type alias)

Type for `FirecrawlWatcherOptions`.

**Example**

```ts
import type { FirecrawlWatcherOptions } from "@beep/firecrawl"

const value: FirecrawlWatcherOptions | undefined = undefined
console.log(value)
```

**Signature**

```ts
type FirecrawlWatcherOptions = typeof FirecrawlWatcherOptions.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1105)

Since v0.0.0

## FirecrawlWatcherPayload (class)

Firecrawl Watcher Payload decoded before calling the Firecrawl SDK.

**Example**

```ts
import { FirecrawlWatcherPayload } from "@beep/firecrawl"

console.log(FirecrawlWatcherPayload)
```

**Signature**

```ts
declare class FirecrawlWatcherPayload
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4468)

Since v0.0.0

## FirecrawlWatcherSuccess (class)

Firecrawl Watcher Success decoded after a successful Firecrawl SDK call.

**Example**

```ts
import { FirecrawlWatcherSuccess } from "@beep/firecrawl"

console.log(FirecrawlWatcherSuccess)
```

**Signature**

```ts
declare class FirecrawlWatcherSuccess
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4492)

Since v0.0.0

# schemas

## FirecrawlActiveCrawlsData

Firecrawl Active Crawls Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlActiveCrawlsData } from "@beep/firecrawl"

console.log(FirecrawlActiveCrawlsData)
```

**Signature**

```ts
declare const FirecrawlActiveCrawlsData: S.Decoder<ActiveCrawlsResponse, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1312)

Since v0.0.0

## FirecrawlAgentRequest

Firecrawl Agent Request opaque SDK request schema.

**Example**

```ts
import { FirecrawlAgentRequest } from "@beep/firecrawl"

console.log(FirecrawlAgentRequest)
```

**Signature**

```ts
declare const FirecrawlAgentRequest: S.Decoder<FirecrawlSdkAgentRequest, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L891)

Since v0.0.0

## FirecrawlAgentResponseData

Firecrawl Agent Response Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlAgentResponseData } from "@beep/firecrawl"

console.log(FirecrawlAgentResponseData)
```

**Signature**

```ts
declare const FirecrawlAgentResponseData: S.Decoder<AgentResponse, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1568)

Since v0.0.0

## FirecrawlAgentStatus

Firecrawl agent status values.

**Example**

```ts
import { FirecrawlAgentStatus } from "@beep/firecrawl"

console.log(FirecrawlAgentStatus.is.processing("processing"))
```

**Signature**

```ts
declare const FirecrawlAgentStatus: AnnotatedSchema<LiteralKit<readonly ["processing", "completed", "failed"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L279)

Since v0.0.0

## FirecrawlAgentStatusData

Firecrawl Agent Status Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlAgentStatusData } from "@beep/firecrawl"

console.log(FirecrawlAgentStatusData)
```

**Signature**

```ts
declare const FirecrawlAgentStatusData: S.Decoder<AgentStatusResponse, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1600)

Since v0.0.0

## FirecrawlAgentWaitRequest

Firecrawl Agent Wait Request opaque SDK request schema.

**Example**

```ts
import { FirecrawlAgentWaitRequest } from "@beep/firecrawl"

console.log(FirecrawlAgentWaitRequest)
```

**Signature**

```ts
declare const FirecrawlAgentWaitRequest: S.Decoder<FirecrawlSdkAgentWaitRequest, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L924)

Since v0.0.0

## FirecrawlBatchScrapeJobData

Firecrawl Batch Scrape Job Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlBatchScrapeJobData } from "@beep/firecrawl"

console.log(FirecrawlBatchScrapeJobData)
```

**Signature**

```ts
declare const FirecrawlBatchScrapeJobData: S.Decoder<BatchScrapeJob, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1536)

Since v0.0.0

## FirecrawlBatchScrapeOptions

Firecrawl Batch Scrape Options opaque SDK options schema.

**Example**

```ts
import { FirecrawlBatchScrapeOptions } from "@beep/firecrawl"

console.log(FirecrawlBatchScrapeOptions)
```

**Signature**

```ts
declare const FirecrawlBatchScrapeOptions: S.Decoder<BatchScrapeOptions, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L826)

Since v0.0.0

## FirecrawlBatchScrapeResponseData

Firecrawl Batch Scrape Response Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlBatchScrapeResponseData } from "@beep/firecrawl"

console.log(FirecrawlBatchScrapeResponseData)
```

**Signature**

```ts
declare const FirecrawlBatchScrapeResponseData: S.Decoder<BatchScrapeResponse, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1504)

Since v0.0.0

## FirecrawlBatchScrapeWaitOptions

Firecrawl Batch Scrape Wait Options opaque SDK options schema.

**Example**

```ts
import { FirecrawlBatchScrapeWaitOptions } from "@beep/firecrawl"

console.log(FirecrawlBatchScrapeWaitOptions)
```

**Signature**

```ts
declare const FirecrawlBatchScrapeWaitOptions: S.Decoder<BatchScrapeOptions & { readonly pollInterval?: number; readonly timeout?: number; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L859)

Since v0.0.0

## FirecrawlBrowserCreateData

Firecrawl Browser Create Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlBrowserCreateData } from "@beep/firecrawl"

console.log(FirecrawlBrowserCreateData)
```

**Signature**

```ts
declare const FirecrawlBrowserCreateData: S.Decoder<BrowserCreateResponse, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1632)

Since v0.0.0

## FirecrawlBrowserDeleteData

Firecrawl Browser Delete Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlBrowserDeleteData } from "@beep/firecrawl"

console.log(FirecrawlBrowserDeleteData)
```

**Signature**

```ts
declare const FirecrawlBrowserDeleteData: S.Decoder<BrowserDeleteResponse, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1696)

Since v0.0.0

## FirecrawlBrowserExecuteData

Firecrawl Browser Execute Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlBrowserExecuteData } from "@beep/firecrawl"

console.log(FirecrawlBrowserExecuteData)
```

**Signature**

```ts
declare const FirecrawlBrowserExecuteData: S.Decoder<BrowserExecuteResponse, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1664)

Since v0.0.0

## FirecrawlBrowserExecuteRequest

Firecrawl Browser Execute Request opaque SDK request schema.

**Example**

```ts
import { FirecrawlBrowserExecuteRequest } from "@beep/firecrawl"

console.log(FirecrawlBrowserExecuteRequest)
```

**Signature**

```ts
declare const FirecrawlBrowserExecuteRequest: S.Decoder<{ code: string; language?: "python" | "node" | "bash"; timeout?: number; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1023)

Since v0.0.0

## FirecrawlBrowserLanguage

Firecrawl browser execution languages.

**Example**

```ts
import { FirecrawlBrowserLanguage } from "@beep/firecrawl"

console.log(FirecrawlBrowserLanguage.is.node("node"))
```

**Signature**

```ts
declare const FirecrawlBrowserLanguage: AnnotatedSchema<LiteralKit<readonly ["python", "node", "bash"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L314)

Since v0.0.0

## FirecrawlBrowserListData

Firecrawl Browser List Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlBrowserListData } from "@beep/firecrawl"

console.log(FirecrawlBrowserListData)
```

**Signature**

```ts
declare const FirecrawlBrowserListData: S.Decoder<BrowserListResponse, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1728)

Since v0.0.0

## FirecrawlBrowserOptions

Firecrawl Browser Options opaque SDK options schema.

**Example**

```ts
import { FirecrawlBrowserOptions } from "@beep/firecrawl"

console.log(FirecrawlBrowserOptions)
```

**Signature**

```ts
declare const FirecrawlBrowserOptions: S.Decoder<{ ttl?: number; activityTtl?: number; streamWebView?: boolean; profile?: { name: string; saveChanges?: boolean; }; integration?: string; origin?: string; } | undefined, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L957)

Since v0.0.0

## FirecrawlConcurrencyData

Firecrawl Concurrency Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlConcurrencyData } from "@beep/firecrawl"

console.log(FirecrawlConcurrencyData)
```

**Signature**

```ts
declare const FirecrawlConcurrencyData: S.Decoder<ConcurrencyCheck, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1760)

Since v0.0.0

## FirecrawlCrawlErrorsData

Firecrawl Crawl Errors Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlCrawlErrorsData } from "@beep/firecrawl"

console.log(FirecrawlCrawlErrorsData)
```

**Signature**

```ts
declare const FirecrawlCrawlErrorsData: S.Decoder<CrawlErrorsResponse, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1280)

Since v0.0.0

## FirecrawlCrawlJobData

Firecrawl Crawl Job Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlCrawlJobData } from "@beep/firecrawl"

console.log(FirecrawlCrawlJobData)
```

**Signature**

```ts
declare const FirecrawlCrawlJobData: S.Decoder<CrawlJob, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1248)

Since v0.0.0

## FirecrawlCrawlOptions

Firecrawl Crawl Options opaque SDK options schema.

**Example**

```ts
import { FirecrawlCrawlOptions } from "@beep/firecrawl"

console.log(FirecrawlCrawlOptions)
```

**Signature**

```ts
declare const FirecrawlCrawlOptions: S.Decoder<CrawlOptions, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L563)

Since v0.0.0

## FirecrawlCrawlResponseData

Firecrawl Crawl Response Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlCrawlResponseData } from "@beep/firecrawl"

console.log(FirecrawlCrawlResponseData)
```

**Signature**

```ts
declare const FirecrawlCrawlResponseData: S.Decoder<CrawlResponse, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1216)

Since v0.0.0

## FirecrawlCrawlWaitOptions

Firecrawl Crawl Wait Options opaque SDK options schema.

**Example**

```ts
import { FirecrawlCrawlWaitOptions } from "@beep/firecrawl"

console.log(FirecrawlCrawlWaitOptions)
```

**Signature**

```ts
declare const FirecrawlCrawlWaitOptions: S.Decoder<CrawlOptions & { readonly pollInterval?: number; readonly timeout?: number; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L596)

Since v0.0.0

## FirecrawlCreateMonitorRequest

Firecrawl Create Monitor Request opaque SDK request schema.

**Example**

```ts
import { FirecrawlCreateMonitorRequest } from "@beep/firecrawl"

console.log(FirecrawlCreateMonitorRequest)
```

**Signature**

```ts
declare const FirecrawlCreateMonitorRequest: S.Decoder<CreateMonitorRequest, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L661)

Since v0.0.0

## FirecrawlCreditUsageData

Firecrawl Credit Usage Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlCreditUsageData } from "@beep/firecrawl"

console.log(FirecrawlCreditUsageData)
```

**Signature**

```ts
declare const FirecrawlCreditUsageData: S.Decoder<CreditUsage, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1792)

Since v0.0.0

## FirecrawlCreditUsageHistoricalData

Firecrawl Credit Usage Historical Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlCreditUsageHistoricalData } from "@beep/firecrawl"

console.log(FirecrawlCreditUsageHistoricalData)
```

**Signature**

```ts
declare const FirecrawlCreditUsageHistoricalData: S.Decoder<CreditUsageHistoricalResponse, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1856)

Since v0.0.0

## FirecrawlDocument

Firecrawl Document schema.

**Example**

```ts
import { FirecrawlDocument } from "@beep/firecrawl"

console.log(FirecrawlDocument)
```

**Signature**

```ts
declare const FirecrawlDocument: S.Decoder<Document, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1120)

Since v0.0.0

## FirecrawlFormatType

Output formats accepted by Firecrawl scrape endpoints.

**Example**

```ts
import { FirecrawlFormatType } from "@beep/firecrawl"

console.log(FirecrawlFormatType.is.markdown("markdown"))
```

**Signature**

```ts
declare const FirecrawlFormatType: AnnotatedSchema<LiteralKit<readonly ["markdown", "html", "rawHtml", "links", "images", "screenshot", "summary", "changeTracking", "json", "attributes", "branding", "audio", "video", "pii"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L114)

Since v0.0.0

## FirecrawlGetMonitorCheckOptions

Firecrawl Get Monitor Check Options opaque SDK options schema.

**Example**

```ts
import { FirecrawlGetMonitorCheckOptions } from "@beep/firecrawl"

console.log(FirecrawlGetMonitorCheckOptions)
```

**Signature**

```ts
declare const FirecrawlGetMonitorCheckOptions: S.Decoder<GetMonitorCheckOptions, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L793)

Since v0.0.0

## FirecrawlInteractData

Firecrawl Interact Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlInteractData } from "@beep/firecrawl"

console.log(FirecrawlInteractData)
```

**Signature**

```ts
declare const FirecrawlInteractData: S.Decoder<BrowserExecuteResponse, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1952)

Since v0.0.0

## FirecrawlInteractRequest

Firecrawl Interact Request opaque SDK request schema.

**Example**

```ts
import { FirecrawlInteractRequest } from "@beep/firecrawl"

console.log(FirecrawlInteractRequest)
```

**Signature**

```ts
declare const FirecrawlInteractRequest: S.Decoder<ScrapeExecuteRequest, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L990)

Since v0.0.0

## FirecrawlJobStatus

Firecrawl crawl and batch status values.

**Example**

```ts
import { FirecrawlJobStatus } from "@beep/firecrawl"

console.log(FirecrawlJobStatus.is.completed("completed"))
```

**Signature**

```ts
declare const FirecrawlJobStatus: AnnotatedSchema<LiteralKit<readonly ["scraping", "completed", "failed", "cancelled"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L244)

Since v0.0.0

## FirecrawlListBrowsersOptions

Firecrawl List Browsers Options opaque SDK options schema.

**Example**

```ts
import { FirecrawlListBrowsersOptions } from "@beep/firecrawl"

console.log(FirecrawlListBrowsersOptions)
```

**Signature**

```ts
declare const FirecrawlListBrowsersOptions: S.Decoder<{ status?: "active" | "destroyed"; } | undefined, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1055)

Since v0.0.0

## FirecrawlListMonitorChecksOptions

Firecrawl List Monitor Checks Options opaque SDK options schema.

**Example**

```ts
import { FirecrawlListMonitorChecksOptions } from "@beep/firecrawl"

console.log(FirecrawlListMonitorChecksOptions)
```

**Signature**

```ts
declare const FirecrawlListMonitorChecksOptions: S.Decoder<ListMonitorsOptions, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L760)

Since v0.0.0

## FirecrawlListMonitorsOptions

Firecrawl List Monitors Options opaque SDK options schema.

**Example**

```ts
import { FirecrawlListMonitorsOptions } from "@beep/firecrawl"

console.log(FirecrawlListMonitorsOptions)
```

**Signature**

```ts
declare const FirecrawlListMonitorsOptions: S.Decoder<ListMonitorsOptions, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L727)

Since v0.0.0

## FirecrawlMapData

Firecrawl Map Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlMapData } from "@beep/firecrawl"

console.log(FirecrawlMapData)
```

**Signature**

```ts
declare const FirecrawlMapData: S.Decoder<MapData, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1184)

Since v0.0.0

## FirecrawlMapOptions

Firecrawl Map Options opaque SDK options schema.

**Example**

```ts
import { FirecrawlMapOptions } from "@beep/firecrawl"

console.log(FirecrawlMapOptions)
```

**Signature**

```ts
declare const FirecrawlMapOptions: S.Decoder<MapOptions, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L530)

Since v0.0.0

## FirecrawlMonitorCheckData

Firecrawl Monitor Check Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlMonitorCheckData } from "@beep/firecrawl"

console.log(FirecrawlMonitorCheckData)
```

**Signature**

```ts
declare const FirecrawlMonitorCheckData: S.Decoder<MonitorCheck, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1408)

Since v0.0.0

## FirecrawlMonitorCheckDetailData

Firecrawl Monitor Check Detail Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlMonitorCheckDetailData } from "@beep/firecrawl"

console.log(FirecrawlMonitorCheckDetailData)
```

**Signature**

```ts
declare const FirecrawlMonitorCheckDetailData: S.Decoder<MonitorCheckDetail, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1472)

Since v0.0.0

## FirecrawlMonitorCheckListData

Firecrawl Monitor Check List Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlMonitorCheckListData } from "@beep/firecrawl"

console.log(FirecrawlMonitorCheckListData)
```

**Signature**

```ts
declare const FirecrawlMonitorCheckListData: S.Decoder<ReadonlyArray<MonitorCheck>, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1440)

Since v0.0.0

## FirecrawlMonitorData

Firecrawl Monitor Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlMonitorData } from "@beep/firecrawl"

console.log(FirecrawlMonitorData)
```

**Signature**

```ts
declare const FirecrawlMonitorData: S.Decoder<Monitor, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1344)

Since v0.0.0

## FirecrawlMonitorListData

Firecrawl Monitor List Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlMonitorListData } from "@beep/firecrawl"

console.log(FirecrawlMonitorListData)
```

**Signature**

```ts
declare const FirecrawlMonitorListData: S.Decoder<ReadonlyArray<Monitor>, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1376)

Since v0.0.0

## FirecrawlPaginationConfig

Firecrawl Pagination Config schema.

**Example**

```ts
import { FirecrawlPaginationConfig } from "@beep/firecrawl"

console.log(FirecrawlPaginationConfig)
```

**Signature**

```ts
declare const FirecrawlPaginationConfig: S.Decoder<PaginationConfig, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L628)

Since v0.0.0

## FirecrawlParseFile

Opaque Firecrawl parse file accepted by the SDK.

**Signature**

```ts
declare const FirecrawlParseFile: S.Decoder<ParseFile, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L438)

Since v0.0.0

## FirecrawlParseOptions

Opaque Firecrawl parse options accepted by the SDK.

**Signature**

```ts
declare const FirecrawlParseOptions: S.Decoder<ParseOptions, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L464)

Since v0.0.0

## FirecrawlQueueStatusData

Firecrawl Queue Status Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlQueueStatusData } from "@beep/firecrawl"

console.log(FirecrawlQueueStatusData)
```

**Signature**

```ts
declare const FirecrawlQueueStatusData: S.Decoder<QueueStatusResponse, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1920)

Since v0.0.0

## FirecrawlScrapeActionType

Firecrawl scrape-browser action types.

**Example**

```ts
import { FirecrawlScrapeActionType } from "@beep/firecrawl"

console.log(FirecrawlScrapeActionType.is.click("click"))
```

**Signature**

```ts
declare const FirecrawlScrapeActionType: AnnotatedSchema<LiteralKit<readonly ["wait", "screenshot", "click", "write", "press", "scroll", "scrape", "executeJavascript", "pdf"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L164)

Since v0.0.0

## FirecrawlScrapeOptions

Opaque Firecrawl scrape options accepted by the SDK.

**Signature**

```ts
declare const FirecrawlScrapeOptions: S.Decoder<ScrapeOptions, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L412)

Since v0.0.0

## FirecrawlSearchData

Firecrawl Search Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlSearchData } from "@beep/firecrawl"

console.log(FirecrawlSearchData)
```

**Signature**

```ts
declare const FirecrawlSearchData: S.Decoder<SearchData, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1152)

Since v0.0.0

## FirecrawlSearchOptions

Firecrawl Search Options opaque SDK options schema.

**Example**

```ts
import { FirecrawlSearchOptions } from "@beep/firecrawl"

console.log(FirecrawlSearchOptions)
```

**Signature**

```ts
declare const FirecrawlSearchOptions: S.Decoder<Omit<SearchRequest, "query">, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L497)

Since v0.0.0

## FirecrawlSearchSourceType

Firecrawl search source types.

**Example**

```ts
import { FirecrawlSearchSourceType } from "@beep/firecrawl"

console.log(FirecrawlSearchSourceType.is.web("web"))
```

**Signature**

```ts
declare const FirecrawlSearchSourceType: AnnotatedSchema<LiteralKit<readonly ["web", "news", "images"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L209)

Since v0.0.0

## FirecrawlStopInteractionData

Firecrawl Stop Interaction Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlStopInteractionData } from "@beep/firecrawl"

console.log(FirecrawlStopInteractionData)
```

**Signature**

```ts
declare const FirecrawlStopInteractionData: S.Decoder<BrowserDeleteResponse, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1984)

Since v0.0.0

## FirecrawlTokenUsageData

Firecrawl Token Usage Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlTokenUsageData } from "@beep/firecrawl"

console.log(FirecrawlTokenUsageData)
```

**Signature**

```ts
declare const FirecrawlTokenUsageData: S.Decoder<TokenUsage, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1824)

Since v0.0.0

## FirecrawlTokenUsageHistoricalData

Firecrawl Token Usage Historical Data opaque SDK response schema.

**Example**

```ts
import { FirecrawlTokenUsageHistoricalData } from "@beep/firecrawl"

console.log(FirecrawlTokenUsageHistoricalData)
```

**Signature**

```ts
declare const FirecrawlTokenUsageHistoricalData: S.Decoder<TokenUsageHistoricalResponse, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1888)

Since v0.0.0

## FirecrawlUpdateMonitorRequest

Firecrawl Update Monitor Request opaque SDK request schema.

**Example**

```ts
import { FirecrawlUpdateMonitorRequest } from "@beep/firecrawl"

console.log(FirecrawlUpdateMonitorRequest)
```

**Signature**

```ts
declare const FirecrawlUpdateMonitorRequest: S.Decoder<UpdateMonitorRequest, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L694)

Since v0.0.0

## FirecrawlWatcherDocumentEvent (class)

Firecrawl Watcher Document Event watcher event schema.

**Example**

```ts
import { FirecrawlWatcherDocumentEvent } from "@beep/firecrawl"

console.log(FirecrawlWatcherDocumentEvent)
```

**Signature**

```ts
declare class FirecrawlWatcherDocumentEvent
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4529)

Since v0.0.0

## FirecrawlWatcherDoneEvent (class)

Firecrawl Watcher Done Event watcher event schema.

**Example**

```ts
import { FirecrawlWatcherDoneEvent } from "@beep/firecrawl"

console.log(FirecrawlWatcherDoneEvent)
```

**Signature**

```ts
declare class FirecrawlWatcherDoneEvent
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4576)

Since v0.0.0

## FirecrawlWatcherErrorEvent (class)

Firecrawl Watcher Error Event watcher event schema.

**Example**

```ts
import { FirecrawlWatcherErrorEvent } from "@beep/firecrawl"

console.log(FirecrawlWatcherErrorEvent)
```

**Signature**

```ts
declare class FirecrawlWatcherErrorEvent
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4604)

Since v0.0.0

## FirecrawlWatcherEvent

Tagged Firecrawl watcher event union.

**Example**

```ts
import { FirecrawlWatcherDocumentEvent } from "@beep/firecrawl"

const event = FirecrawlWatcherDocumentEvent.make({
  document: {},
  type: "document"
})

console.log(event.type)
```

**Signature**

```ts
declare const FirecrawlWatcherEvent: AnnotatedSchema<S.Union<readonly [typeof FirecrawlWatcherDocumentEvent, typeof FirecrawlWatcherSnapshotEvent, typeof FirecrawlWatcherDoneEvent, typeof FirecrawlWatcherErrorEvent]> & TaggedUnionUtils<"type", readonly [typeof FirecrawlWatcherDocumentEvent, typeof FirecrawlWatcherSnapshotEvent, typeof FirecrawlWatcherDoneEvent, typeof FirecrawlWatcherErrorEvent], [typeof FirecrawlWatcherDocumentEvent, typeof FirecrawlWatcherSnapshotEvent, typeof FirecrawlWatcherDoneEvent, typeof FirecrawlWatcherErrorEvent]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4632)

Since v0.0.0

## FirecrawlWatcherEventType

Firecrawl watcher event types.

**Example**

```ts
import { FirecrawlWatcherEventType } from "@beep/firecrawl"

console.log(FirecrawlWatcherEventType.is.document("document"))
```

**Signature**

```ts
declare const FirecrawlWatcherEventType: AnnotatedSchema<LiteralKit<readonly ["document", "snapshot", "done", "error"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L384)

Since v0.0.0

## FirecrawlWatcherKind

Firecrawl watcher job kinds.

**Example**

```ts
import { FirecrawlWatcherKind } from "@beep/firecrawl"

console.log(FirecrawlWatcherKind.is.crawl("crawl"))
```

**Signature**

```ts
declare const FirecrawlWatcherKind: AnnotatedSchema<LiteralKit<readonly ["crawl", "batch"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L349)

Since v0.0.0

## FirecrawlWatcherOptions

Firecrawl Watcher Options opaque SDK options schema.

**Example**

```ts
import { FirecrawlWatcherOptions } from "@beep/firecrawl"

console.log(FirecrawlWatcherOptions)
```

**Signature**

```ts
declare const FirecrawlWatcherOptions: S.Decoder<WatcherOptions, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L1087)

Since v0.0.0

## FirecrawlWatcherSnapshotEvent (class)

Firecrawl Watcher Snapshot Event watcher event schema.

**Example**

```ts
import { FirecrawlWatcherSnapshotEvent } from "@beep/firecrawl"

console.log(FirecrawlWatcherSnapshotEvent)
```

**Signature**

```ts
declare class FirecrawlWatcherSnapshotEvent
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.models.ts#L4553)

Since v0.0.0