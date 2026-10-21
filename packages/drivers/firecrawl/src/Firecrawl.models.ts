/**
 * Schema-first request, response, failure, and watcher models for Firecrawl.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $FirecrawlId } from "@beep/identity/packages";
import { LiteralKit, SchemaUtils } from "@beep/schema";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Response from "./internal/Firecrawl.responses.ts";
import type {
  AgentWebhookConfig,
  BatchScrapeOptions,
  CrawlOptions,
  CreateMonitorRequest,
  GetMonitorCheckOptions,
  ListMonitorChecksOptions,
  ListMonitorsOptions,
  MapOptions,
  PaginationConfig,
  ParseFile,
  ParseOptions,
  ScrapeExecuteRequest,
  ScrapeOptions,
  SearchRequest,
  UpdateMonitorRequest,
  WatcherOptions,
} from "firecrawl";

const $I = $FirecrawlId.create("Firecrawl.models");

const isSdkObject = S.is(S.Record(S.String, S.Unknown));
const typedUnknown = <A>(name: string, description: string): S.Codec<A> =>
  S.declare<A>((value: unknown): value is A => isSdkObject(value), {
    description,
    expected: "FirecrawlSdkObject",
  }).pipe(
    $I.annoteSchema(name, {
      description,
    })
  );

const optionalString = S.OptionFromOptionalKey(S.String).pipe(
  S.withConstructorDefault(Effect.succeed(O.none<string>()))
);
const optionalNumber = S.OptionFromOptionalKey(S.Finite).pipe(
  S.withConstructorDefault(Effect.succeed(O.none<number>()))
);
const optionalBoolean = S.OptionFromOptionalKey(S.Boolean).pipe(
  S.withConstructorDefault(Effect.succeed(O.none<boolean>()))
);
const optionalUnknown = S.OptionFromOptionalKey(S.Unknown).pipe(
  S.withConstructorDefault(Effect.succeed(O.none<unknown>()))
);

type FirecrawlSdkAgentRequest = {
  readonly integration?: string;
  readonly maxCredits?: number;
  readonly model?: "spark-1-mini" | "spark-1-pro";
  readonly origin?: string;
  readonly prompt: string;
  readonly schema?: Record<string, unknown>;
  readonly strictConstrainToURLs?: boolean;
  readonly urls?: Array<string>;
  readonly webhook?: string | AgentWebhookConfig;
};

type FirecrawlSdkAgentWaitRequest = FirecrawlSdkAgentRequest & {
  readonly pollInterval?: number;
  readonly timeout?: number;
};

const FirecrawlFormatTypeBase = LiteralKit([
  "markdown",
  "html",
  "rawHtml",
  "links",
  "images",
  "screenshot",
  "summary",
  "changeTracking",
  "json",
  "attributes",
  "branding",
  "audio",
  "video",
  "pii",
]);

/**
 * Output formats accepted by Firecrawl scrape endpoints.
 *
 * **Example** (Check markdown format type)
 *
 * ```ts
 * import { FirecrawlFormatType } from "@beep/firecrawl"
 *
 * console.log(FirecrawlFormatType.is.markdown("markdown"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlFormatType = FirecrawlFormatTypeBase.pipe(
  $I.annoteSchema("FirecrawlFormatType", {
    description: "Output formats accepted by Firecrawl scrape endpoints.",
  }),
  SchemaUtils.withLiteralKitStatics(FirecrawlFormatTypeBase)
);

/**
 * Type for {@link FirecrawlFormatType}.
 *
 * **Example** (Assign markdown format type)
 *
 * ```ts
 * import type { FirecrawlFormatType } from "@beep/firecrawl"
 *
 * const format: FirecrawlFormatType = "markdown"
 * console.log(format)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlFormatType = typeof FirecrawlFormatType.Type;

const FirecrawlScrapeActionTypeBase = LiteralKit([
  "wait",
  "screenshot",
  "click",
  "write",
  "press",
  "scroll",
  "scrape",
  "executeJavascript",
  "pdf",
]);

/**
 * Firecrawl scrape-browser action types.
 *
 * **Example** (Check click action type)
 *
 * ```ts
 * import { FirecrawlScrapeActionType } from "@beep/firecrawl"
 *
 * console.log(FirecrawlScrapeActionType.is.click("click"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlScrapeActionType = FirecrawlScrapeActionTypeBase.pipe(
  $I.annoteSchema("FirecrawlScrapeActionType", {
    description: "Firecrawl scrape-browser action types.",
  }),
  SchemaUtils.withLiteralKitStatics(FirecrawlScrapeActionTypeBase)
);

/**
 * Type for {@link FirecrawlScrapeActionType}.
 *
 * **Example** (Assign click action type)
 *
 * ```ts
 * import type { FirecrawlScrapeActionType } from "@beep/firecrawl"
 *
 * const action: FirecrawlScrapeActionType = "click"
 * console.log(action)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlScrapeActionType = typeof FirecrawlScrapeActionType.Type;

const FirecrawlSearchSourceTypeBase = LiteralKit(["web", "news", "images"]);

/**
 * Firecrawl search source types.
 *
 * **Example** (Check web source type)
 *
 * ```ts
 * import { FirecrawlSearchSourceType } from "@beep/firecrawl"
 *
 * console.log(FirecrawlSearchSourceType.is.web("web"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlSearchSourceType = FirecrawlSearchSourceTypeBase.pipe(
  $I.annoteSchema("FirecrawlSearchSourceType", {
    description: "Firecrawl search source types.",
  }),
  SchemaUtils.withLiteralKitStatics(FirecrawlSearchSourceTypeBase)
);

/**
 * Type for {@link FirecrawlSearchSourceType}.
 *
 * **Example** (Assign web source type)
 *
 * ```ts
 * import type { FirecrawlSearchSourceType } from "@beep/firecrawl"
 *
 * const source: FirecrawlSearchSourceType = "web"
 * console.log(source)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlSearchSourceType = typeof FirecrawlSearchSourceType.Type;

const FirecrawlJobStatusBase = LiteralKit(["scraping", "completed", "failed", "cancelled"]);

/**
 * Firecrawl crawl and batch status values.
 *
 * **Example** (Check completed job status)
 *
 * ```ts
 * import { FirecrawlJobStatus } from "@beep/firecrawl"
 *
 * console.log(FirecrawlJobStatus.is.completed("completed"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlJobStatus = FirecrawlJobStatusBase.pipe(
  $I.annoteSchema("FirecrawlJobStatus", {
    description: "Firecrawl crawl and batch status values.",
  }),
  SchemaUtils.withLiteralKitStatics(FirecrawlJobStatusBase)
);

/**
 * Type for {@link FirecrawlJobStatus}.
 *
 * **Example** (Assign completed job status)
 *
 * ```ts
 * import type { FirecrawlJobStatus } from "@beep/firecrawl"
 *
 * const status: FirecrawlJobStatus = "completed"
 * console.log(status)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlJobStatus = typeof FirecrawlJobStatus.Type;

const FirecrawlAgentStatusBase = LiteralKit(["processing", "completed", "failed"]);

/**
 * Firecrawl agent status values.
 *
 * **Example** (Check processing agent status)
 *
 * ```ts
 * import { FirecrawlAgentStatus } from "@beep/firecrawl"
 *
 * console.log(FirecrawlAgentStatus.is.processing("processing"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlAgentStatus = FirecrawlAgentStatusBase.pipe(
  $I.annoteSchema("FirecrawlAgentStatus", {
    description: "Firecrawl agent status values.",
  }),
  SchemaUtils.withLiteralKitStatics(FirecrawlAgentStatusBase)
);

/**
 * Type for {@link FirecrawlAgentStatus}.
 *
 * **Example** (Assign processing agent status)
 *
 * ```ts
 * import type { FirecrawlAgentStatus } from "@beep/firecrawl"
 *
 * const status: FirecrawlAgentStatus = "processing"
 * console.log(status)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlAgentStatus = typeof FirecrawlAgentStatus.Type;

const FirecrawlBrowserLanguageBase = LiteralKit(["python", "node", "bash"]);

/**
 * Firecrawl browser execution languages.
 *
 * **Example** (Check node browser language)
 *
 * ```ts
 * import { FirecrawlBrowserLanguage } from "@beep/firecrawl"
 *
 * console.log(FirecrawlBrowserLanguage.is.node("node"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlBrowserLanguage = FirecrawlBrowserLanguageBase.pipe(
  $I.annoteSchema("FirecrawlBrowserLanguage", {
    description: "Firecrawl browser execution languages.",
  }),
  SchemaUtils.withLiteralKitStatics(FirecrawlBrowserLanguageBase)
);

/**
 * Type for {@link FirecrawlBrowserLanguage}.
 *
 * **Example** (Assign node browser language)
 *
 * ```ts
 * import type { FirecrawlBrowserLanguage } from "@beep/firecrawl"
 *
 * const language: FirecrawlBrowserLanguage = "node"
 * console.log(language)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlBrowserLanguage = typeof FirecrawlBrowserLanguage.Type;

const FirecrawlWatcherKindBase = LiteralKit(["crawl", "batch"]);

/**
 * Firecrawl watcher job kinds.
 *
 * **Example** (Check crawl watcher kind)
 *
 * ```ts
 * import { FirecrawlWatcherKind } from "@beep/firecrawl"
 *
 * console.log(FirecrawlWatcherKind.is.crawl("crawl"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlWatcherKind = FirecrawlWatcherKindBase.pipe(
  $I.annoteSchema("FirecrawlWatcherKind", {
    description: "Firecrawl watcher job kinds.",
  }),
  SchemaUtils.withLiteralKitStatics(FirecrawlWatcherKindBase)
);

/**
 * Type for {@link FirecrawlWatcherKind}.
 *
 * **Example** (Assign crawl watcher kind)
 *
 * ```ts
 * import type { FirecrawlWatcherKind } from "@beep/firecrawl"
 *
 * const kind: FirecrawlWatcherKind = "crawl"
 * console.log(kind)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlWatcherKind = typeof FirecrawlWatcherKind.Type;

const FirecrawlWatcherEventTypeBase = LiteralKit(["document", "snapshot", "done", "error"]);

/**
 * Firecrawl watcher event types.
 *
 * **Example** (Check document event type)
 *
 * ```ts
 * import { FirecrawlWatcherEventType } from "@beep/firecrawl"
 *
 * console.log(FirecrawlWatcherEventType.is.document("document"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlWatcherEventType = FirecrawlWatcherEventTypeBase.pipe(
  $I.annoteSchema("FirecrawlWatcherEventType", {
    description: "Firecrawl watcher event types emitted by the SDK watcher.",
  }),
  SchemaUtils.withLiteralKitStatics(FirecrawlWatcherEventTypeBase)
);

/**
 * Type for {@link FirecrawlWatcherEventType}.
 *
 * **Example** (Assign document event type)
 *
 * ```ts
 * import type { FirecrawlWatcherEventType } from "@beep/firecrawl"
 *
 * const eventType: FirecrawlWatcherEventType = "document"
 * console.log(eventType)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlWatcherEventType = typeof FirecrawlWatcherEventType.Type;

/**
 * Opaque Firecrawl scrape options accepted by the SDK.
 *
 * **Example** (Log scrape options schema)
 *
 * ```ts
 * import { FirecrawlScrapeOptions } from "@beep/firecrawl"
 *
 * console.log(FirecrawlScrapeOptions)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlScrapeOptions = typedUnknown<ScrapeOptions>(
  "FirecrawlScrapeOptions",
  "Opaque Firecrawl scrape options accepted by the SDK."
);
/**
 * Type for {@link FirecrawlScrapeOptions}.
 *
 * **Example** (Type optional scrape options)
 *
 * ```ts
 * import type { FirecrawlScrapeOptions } from "@beep/firecrawl"
 *
 * const value: FirecrawlScrapeOptions | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlScrapeOptions = typeof FirecrawlScrapeOptions.Type;

/**
 * Opaque Firecrawl parse file accepted by the SDK.
 *
 * **Example** (Log parse file schema)
 *
 * ```ts
 * import { FirecrawlParseFile } from "@beep/firecrawl"
 *
 * console.log(FirecrawlParseFile)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlParseFile = typedUnknown<ParseFile>(
  "FirecrawlParseFile",
  "Opaque Firecrawl parse file accepted by the SDK."
);
/**
 * Type for {@link FirecrawlParseFile}.
 *
 * **Example** (Type optional parse file)
 *
 * ```ts
 * import type { FirecrawlParseFile } from "@beep/firecrawl"
 *
 * const value: FirecrawlParseFile | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlParseFile = typeof FirecrawlParseFile.Type;

/**
 * Opaque Firecrawl parse options accepted by the SDK.
 *
 * **Example** (Log parse options schema)
 *
 * ```ts
 * import { FirecrawlParseOptions } from "@beep/firecrawl"
 *
 * console.log(FirecrawlParseOptions)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlParseOptions = typedUnknown<ParseOptions>(
  "FirecrawlParseOptions",
  "Opaque Firecrawl parse options accepted by the SDK."
);
/**
 * Type for {@link FirecrawlParseOptions}.
 *
 * **Example** (Type optional parse options)
 *
 * ```ts
 * import type { FirecrawlParseOptions } from "@beep/firecrawl"
 *
 * const value: FirecrawlParseOptions | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlParseOptions = typeof FirecrawlParseOptions.Type;

/**
 * Firecrawl Search Options opaque SDK options schema.
 *
 * **Example** (Log search options schema)
 *
 * ```ts
 * import { FirecrawlSearchOptions } from "@beep/firecrawl"
 *
 * console.log(FirecrawlSearchOptions)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlSearchOptions = typedUnknown<Omit<SearchRequest, "query">>(
  "FirecrawlSearchOptions",
  "Opaque Firecrawl search options accepted by the SDK."
);
/**
 * Type for {@link FirecrawlSearchOptions}.
 *
 * **Example** (Type optional search options)
 *
 * ```ts
 * import type { FirecrawlSearchOptions } from "@beep/firecrawl"
 *
 * const value: FirecrawlSearchOptions | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlSearchOptions = typeof FirecrawlSearchOptions.Type;

/**
 * Firecrawl Map Options opaque SDK options schema.
 *
 * **Example** (Log map options schema)
 *
 * ```ts
 * import { FirecrawlMapOptions } from "@beep/firecrawl"
 *
 * console.log(FirecrawlMapOptions)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlMapOptions = typedUnknown<MapOptions>(
  "FirecrawlMapOptions",
  "Opaque Firecrawl map options accepted by the SDK."
);
/**
 * Type for {@link FirecrawlMapOptions}.
 *
 * **Example** (Type optional map options)
 *
 * ```ts
 * import type { FirecrawlMapOptions } from "@beep/firecrawl"
 *
 * const value: FirecrawlMapOptions | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlMapOptions = typeof FirecrawlMapOptions.Type;

/**
 * Firecrawl Crawl Options opaque SDK options schema.
 *
 * **Example** (Log crawl options schema)
 *
 * ```ts
 * import { FirecrawlCrawlOptions } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCrawlOptions)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlCrawlOptions = typedUnknown<CrawlOptions>(
  "FirecrawlCrawlOptions",
  "Opaque Firecrawl crawl options accepted by the SDK."
);
/**
 * Type for {@link FirecrawlCrawlOptions}.
 *
 * **Example** (Type optional crawl options)
 *
 * ```ts
 * import type { FirecrawlCrawlOptions } from "@beep/firecrawl"
 *
 * const value: FirecrawlCrawlOptions | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlCrawlOptions = typeof FirecrawlCrawlOptions.Type;

/**
 * Firecrawl Crawl Wait Options opaque SDK options schema.
 *
 * **Example** (Log crawl wait options)
 *
 * ```ts
 * import { FirecrawlCrawlWaitOptions } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCrawlWaitOptions)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlCrawlWaitOptions = typedUnknown<
  CrawlOptions & { readonly pollInterval?: number; readonly timeout?: number }
>("FirecrawlCrawlWaitOptions", "Opaque Firecrawl crawl waiter options accepted by the SDK.");
/**
 * Type for {@link FirecrawlCrawlWaitOptions}.
 *
 * **Example** (Type optional crawl wait options)
 *
 * ```ts
 * import type { FirecrawlCrawlWaitOptions } from "@beep/firecrawl"
 *
 * const value: FirecrawlCrawlWaitOptions | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlCrawlWaitOptions = typeof FirecrawlCrawlWaitOptions.Type;

/**
 * Firecrawl Pagination Config schema.
 *
 * **Example** (Log pagination config schema)
 *
 * ```ts
 * import { FirecrawlPaginationConfig } from "@beep/firecrawl"
 *
 * console.log(FirecrawlPaginationConfig)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlPaginationConfig = typedUnknown<PaginationConfig>(
  "FirecrawlPaginationConfig",
  "Opaque Firecrawl pagination config accepted by the SDK."
);
/**
 * Type for {@link FirecrawlPaginationConfig}.
 *
 * **Example** (Type optional pagination config)
 *
 * ```ts
 * import type { FirecrawlPaginationConfig } from "@beep/firecrawl"
 *
 * const value: FirecrawlPaginationConfig | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlPaginationConfig = typeof FirecrawlPaginationConfig.Type;

/**
 * Firecrawl Create Monitor Request opaque SDK request schema.
 *
 * **Example** (Log create monitor request)
 *
 * ```ts
 * import { FirecrawlCreateMonitorRequest } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCreateMonitorRequest)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlCreateMonitorRequest = typedUnknown<CreateMonitorRequest>(
  "FirecrawlCreateMonitorRequest",
  "Opaque Firecrawl monitor creation request accepted by the SDK."
);
/**
 * Type for {@link FirecrawlCreateMonitorRequest}.
 *
 * **Example** (Type optional create monitor request)
 *
 * ```ts
 * import type { FirecrawlCreateMonitorRequest } from "@beep/firecrawl"
 *
 * const value: FirecrawlCreateMonitorRequest | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlCreateMonitorRequest = typeof FirecrawlCreateMonitorRequest.Type;

/**
 * Firecrawl Update Monitor Request opaque SDK request schema.
 *
 * **Example** (Log update monitor request)
 *
 * ```ts
 * import { FirecrawlUpdateMonitorRequest } from "@beep/firecrawl"
 *
 * console.log(FirecrawlUpdateMonitorRequest)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlUpdateMonitorRequest = typedUnknown<UpdateMonitorRequest>(
  "FirecrawlUpdateMonitorRequest",
  "Opaque Firecrawl monitor update request accepted by the SDK."
);
/**
 * Type for {@link FirecrawlUpdateMonitorRequest}.
 *
 * **Example** (Type optional update monitor request)
 *
 * ```ts
 * import type { FirecrawlUpdateMonitorRequest } from "@beep/firecrawl"
 *
 * const value: FirecrawlUpdateMonitorRequest | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlUpdateMonitorRequest = typeof FirecrawlUpdateMonitorRequest.Type;

/**
 * Firecrawl List Monitors Options opaque SDK options schema.
 *
 * **Example** (Log list monitors options)
 *
 * ```ts
 * import { FirecrawlListMonitorsOptions } from "@beep/firecrawl"
 *
 * console.log(FirecrawlListMonitorsOptions)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlListMonitorsOptions = typedUnknown<ListMonitorsOptions>(
  "FirecrawlListMonitorsOptions",
  "Opaque Firecrawl monitor list options accepted by the SDK."
);
/**
 * Type for {@link FirecrawlListMonitorsOptions}.
 *
 * **Example** (Type optional list monitors options)
 *
 * ```ts
 * import type { FirecrawlListMonitorsOptions } from "@beep/firecrawl"
 *
 * const value: FirecrawlListMonitorsOptions | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlListMonitorsOptions = typeof FirecrawlListMonitorsOptions.Type;

/**
 * Firecrawl List Monitor Checks Options opaque SDK options schema.
 *
 * **Example** (Log list monitor checks options)
 *
 * ```ts
 * import { FirecrawlListMonitorChecksOptions } from "@beep/firecrawl"
 *
 * console.log(FirecrawlListMonitorChecksOptions)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlListMonitorChecksOptions = typedUnknown<ListMonitorChecksOptions>(
  "FirecrawlListMonitorChecksOptions",
  "Opaque Firecrawl monitor check list options accepted by the SDK."
);
/**
 * Type for {@link FirecrawlListMonitorChecksOptions}.
 *
 * **Example** (Type optional list monitor checks options)
 *
 * ```ts
 * import type { FirecrawlListMonitorChecksOptions } from "@beep/firecrawl"
 *
 * const value: FirecrawlListMonitorChecksOptions | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlListMonitorChecksOptions = typeof FirecrawlListMonitorChecksOptions.Type;

/**
 * Firecrawl Get Monitor Check Options opaque SDK options schema.
 *
 * **Example** (Log get monitor check options)
 *
 * ```ts
 * import { FirecrawlGetMonitorCheckOptions } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetMonitorCheckOptions)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlGetMonitorCheckOptions = typedUnknown<GetMonitorCheckOptions>(
  "FirecrawlGetMonitorCheckOptions",
  "Opaque Firecrawl monitor check pagination options accepted by the SDK."
);
/**
 * Type for {@link FirecrawlGetMonitorCheckOptions}.
 *
 * **Example** (Type optional get monitor check options)
 *
 * ```ts
 * import type { FirecrawlGetMonitorCheckOptions } from "@beep/firecrawl"
 *
 * const value: FirecrawlGetMonitorCheckOptions | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlGetMonitorCheckOptions = typeof FirecrawlGetMonitorCheckOptions.Type;

/**
 * Firecrawl Batch Scrape Options opaque SDK options schema.
 *
 * **Example** (Log batch scrape options)
 *
 * ```ts
 * import { FirecrawlBatchScrapeOptions } from "@beep/firecrawl"
 *
 * console.log(FirecrawlBatchScrapeOptions)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlBatchScrapeOptions = typedUnknown<BatchScrapeOptions>(
  "FirecrawlBatchScrapeOptions",
  "Opaque Firecrawl batch scrape options accepted by the SDK."
);
/**
 * Type for {@link FirecrawlBatchScrapeOptions}.
 *
 * **Example** (Type optional batch scrape options)
 *
 * ```ts
 * import type { FirecrawlBatchScrapeOptions } from "@beep/firecrawl"
 *
 * const value: FirecrawlBatchScrapeOptions | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlBatchScrapeOptions = typeof FirecrawlBatchScrapeOptions.Type;

/**
 * Firecrawl Batch Scrape Wait Options opaque SDK options schema.
 *
 * **Example** (Log batch scrape wait options)
 *
 * ```ts
 * import { FirecrawlBatchScrapeWaitOptions } from "@beep/firecrawl"
 *
 * console.log(FirecrawlBatchScrapeWaitOptions)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlBatchScrapeWaitOptions = typedUnknown<
  BatchScrapeOptions & { readonly pollInterval?: number; readonly timeout?: number }
>("FirecrawlBatchScrapeWaitOptions", "Opaque Firecrawl batch scrape waiter options accepted by the SDK.");
/**
 * Type for {@link FirecrawlBatchScrapeWaitOptions}.
 *
 * **Example** (Type optional batch scrape wait options)
 *
 * ```ts
 * import type { FirecrawlBatchScrapeWaitOptions } from "@beep/firecrawl"
 *
 * const value: FirecrawlBatchScrapeWaitOptions | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlBatchScrapeWaitOptions = typeof FirecrawlBatchScrapeWaitOptions.Type;

/**
 * Firecrawl Agent Request opaque SDK request schema.
 *
 * **Example** (Log agent request schema)
 *
 * ```ts
 * import { FirecrawlAgentRequest } from "@beep/firecrawl"
 *
 * console.log(FirecrawlAgentRequest)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlAgentRequest = typedUnknown<FirecrawlSdkAgentRequest>(
  "FirecrawlAgentRequest",
  "Opaque Firecrawl agent request accepted by the SDK."
);
/**
 * Type for {@link FirecrawlAgentRequest}.
 *
 * **Example** (Type optional agent request)
 *
 * ```ts
 * import type { FirecrawlAgentRequest } from "@beep/firecrawl"
 *
 * const value: FirecrawlAgentRequest | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlAgentRequest = typeof FirecrawlAgentRequest.Type;

/**
 * Firecrawl Agent Wait Request opaque SDK request schema.
 *
 * **Example** (Log agent wait request)
 *
 * ```ts
 * import { FirecrawlAgentWaitRequest } from "@beep/firecrawl"
 *
 * console.log(FirecrawlAgentWaitRequest)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlAgentWaitRequest = typedUnknown<FirecrawlSdkAgentWaitRequest>(
  "FirecrawlAgentWaitRequest",
  "Opaque Firecrawl agent waiter request accepted by the SDK."
);
/**
 * Type for {@link FirecrawlAgentWaitRequest}.
 *
 * **Example** (Type optional agent wait request)
 *
 * ```ts
 * import type { FirecrawlAgentWaitRequest } from "@beep/firecrawl"
 *
 * const value: FirecrawlAgentWaitRequest | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlAgentWaitRequest = typeof FirecrawlAgentWaitRequest.Type;

/**
 * Firecrawl Browser Options opaque SDK options schema.
 *
 * **Example** (Log browser options schema)
 *
 * ```ts
 * import { FirecrawlBrowserOptions } from "@beep/firecrawl"
 *
 * console.log(FirecrawlBrowserOptions)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlBrowserOptions = typedUnknown<Parameters<import("firecrawl").FirecrawlClient["browser"]>[0]>(
  "FirecrawlBrowserOptions",
  "Opaque Firecrawl browser session options accepted by the SDK."
);
/**
 * Type for {@link FirecrawlBrowserOptions}.
 *
 * **Example** (Type optional browser options)
 *
 * ```ts
 * import type { FirecrawlBrowserOptions } from "@beep/firecrawl"
 *
 * const value: FirecrawlBrowserOptions | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlBrowserOptions = typeof FirecrawlBrowserOptions.Type;

/**
 * Firecrawl Interact Request opaque SDK request schema.
 *
 * **Example** (Log interact request schema)
 *
 * ```ts
 * import { FirecrawlInteractRequest } from "@beep/firecrawl"
 *
 * console.log(FirecrawlInteractRequest)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlInteractRequest = typedUnknown<ScrapeExecuteRequest>(
  "FirecrawlInteractRequest",
  "Opaque Firecrawl scrape interaction request accepted by the SDK."
);
/**
 * Type for {@link FirecrawlInteractRequest}.
 *
 * **Example** (Type optional interact request)
 *
 * ```ts
 * import type { FirecrawlInteractRequest } from "@beep/firecrawl"
 *
 * const value: FirecrawlInteractRequest | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlInteractRequest = typeof FirecrawlInteractRequest.Type;

/**
 * Firecrawl Browser Execute Request opaque SDK request schema.
 *
 * **Example** (Log browser execute request)
 *
 * ```ts
 * import { FirecrawlBrowserExecuteRequest } from "@beep/firecrawl"
 *
 * console.log(FirecrawlBrowserExecuteRequest)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlBrowserExecuteRequest = typedUnknown<
  Parameters<import("firecrawl").FirecrawlClient["browserExecute"]>[1]
>("FirecrawlBrowserExecuteRequest", "Opaque Firecrawl browser execution request accepted by the SDK.");
/**
 * Type for {@link FirecrawlBrowserExecuteRequest}.
 *
 * **Example** (Type optional browser execute request)
 *
 * ```ts
 * import type { FirecrawlBrowserExecuteRequest } from "@beep/firecrawl"
 *
 * const value: FirecrawlBrowserExecuteRequest | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlBrowserExecuteRequest = typeof FirecrawlBrowserExecuteRequest.Type;

/**
 * Firecrawl List Browsers Options opaque SDK options schema.
 *
 * **Example** (Log list browsers options)
 *
 * ```ts
 * import { FirecrawlListBrowsersOptions } from "@beep/firecrawl"
 *
 * console.log(FirecrawlListBrowsersOptions)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlListBrowsersOptions = typedUnknown<
  Parameters<import("firecrawl").FirecrawlClient["listBrowsers"]>[0]
>("FirecrawlListBrowsersOptions", "Opaque Firecrawl browser list options accepted by the SDK.");
/**
 * Type for {@link FirecrawlListBrowsersOptions}.
 *
 * **Example** (Type optional list browsers options)
 *
 * ```ts
 * import type { FirecrawlListBrowsersOptions } from "@beep/firecrawl"
 *
 * const value: FirecrawlListBrowsersOptions | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlListBrowsersOptions = typeof FirecrawlListBrowsersOptions.Type;

/**
 * Firecrawl Watcher Options opaque SDK options schema.
 *
 * **Example** (Log watcher options schema)
 *
 * ```ts
 * import { FirecrawlWatcherOptions } from "@beep/firecrawl"
 *
 * console.log(FirecrawlWatcherOptions)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlWatcherOptions = typedUnknown<WatcherOptions>(
  "FirecrawlWatcherOptions",
  "Opaque Firecrawl watcher options accepted by the SDK."
);
/**
 * Type for {@link FirecrawlWatcherOptions}.
 *
 * **Example** (Type optional watcher options)
 *
 * ```ts
 * import type { FirecrawlWatcherOptions } from "@beep/firecrawl"
 *
 * const value: FirecrawlWatcherOptions | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlWatcherOptions = typeof FirecrawlWatcherOptions.Type;

/**
 * Firecrawl Document schema.
 *
 * **Example** (Log document schema)
 *
 * ```ts
 * import { FirecrawlDocument } from "@beep/firecrawl"
 *
 * console.log(FirecrawlDocument)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlDocument = Response.FirecrawlDocument;
/**
 * Type for {@link FirecrawlDocument}.
 *
 * **Example** (Type optional document)
 *
 * ```ts
 * import type { FirecrawlDocument } from "@beep/firecrawl"
 *
 * const value: FirecrawlDocument | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlDocument = typeof FirecrawlDocument.Type;
/**
 * Structurally validated Firecrawl search response schema.
 *
 * **Example** (Log search data schema)
 *
 * ```ts
 * import { FirecrawlSearchData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlSearchData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlSearchData = Response.FirecrawlSearchData;
/**
 * Type for {@link FirecrawlSearchData}.
 *
 * **Example** (Type optional search data)
 *
 * ```ts
 * import type { FirecrawlSearchData } from "@beep/firecrawl"
 *
 * const value: FirecrawlSearchData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlSearchData = typeof FirecrawlSearchData.Type;
/**
 * Structurally validated Firecrawl map response schema.
 *
 * **Example** (Log map data schema)
 *
 * ```ts
 * import { FirecrawlMapData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlMapData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlMapData = Response.FirecrawlMapData;
/**
 * Type for {@link FirecrawlMapData}.
 *
 * **Example** (Type optional map data)
 *
 * ```ts
 * import type { FirecrawlMapData } from "@beep/firecrawl"
 *
 * const value: FirecrawlMapData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlMapData = typeof FirecrawlMapData.Type;
/**
 * Structurally validated Firecrawl crawl-start response schema.
 *
 * **Example** (Log crawl response data)
 *
 * ```ts
 * import { FirecrawlCrawlResponseData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCrawlResponseData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlCrawlResponseData = Response.FirecrawlCrawlResponseData;
/**
 * Type for {@link FirecrawlCrawlResponseData}.
 *
 * **Example** (Type optional crawl response data)
 *
 * ```ts
 * import type { FirecrawlCrawlResponseData } from "@beep/firecrawl"
 *
 * const value: FirecrawlCrawlResponseData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlCrawlResponseData = typeof FirecrawlCrawlResponseData.Type;
/**
 * Structurally validated Firecrawl crawl-job response schema.
 *
 * **Example** (Log crawl job data)
 *
 * ```ts
 * import { FirecrawlCrawlJobData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCrawlJobData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlCrawlJobData = Response.FirecrawlCrawlJobData;
/**
 * Type for {@link FirecrawlCrawlJobData}.
 *
 * **Example** (Type optional crawl job data)
 *
 * ```ts
 * import type { FirecrawlCrawlJobData } from "@beep/firecrawl"
 *
 * const value: FirecrawlCrawlJobData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlCrawlJobData = typeof FirecrawlCrawlJobData.Type;
/**
 * Structurally validated Firecrawl crawl-errors response schema.
 *
 * **Example** (Log crawl errors data)
 *
 * ```ts
 * import { FirecrawlCrawlErrorsData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCrawlErrorsData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlCrawlErrorsData = Response.FirecrawlCrawlErrorsData;
/**
 * Type for {@link FirecrawlCrawlErrorsData}.
 *
 * **Example** (Type optional crawl errors data)
 *
 * ```ts
 * import type { FirecrawlCrawlErrorsData } from "@beep/firecrawl"
 *
 * const value: FirecrawlCrawlErrorsData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlCrawlErrorsData = typeof FirecrawlCrawlErrorsData.Type;
/**
 * Structurally validated Firecrawl active-crawls response schema.
 *
 * **Example** (Log active crawls data)
 *
 * ```ts
 * import { FirecrawlActiveCrawlsData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlActiveCrawlsData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlActiveCrawlsData = Response.FirecrawlActiveCrawlsData;
/**
 * Type for {@link FirecrawlActiveCrawlsData}.
 *
 * **Example** (Type optional active crawls data)
 *
 * ```ts
 * import type { FirecrawlActiveCrawlsData } from "@beep/firecrawl"
 *
 * const value: FirecrawlActiveCrawlsData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlActiveCrawlsData = typeof FirecrawlActiveCrawlsData.Type;
/**
 * Structurally validated Firecrawl monitor response schema.
 *
 * **Example** (Log monitor data schema)
 *
 * ```ts
 * import { FirecrawlMonitorData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlMonitorData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlMonitorData = Response.FirecrawlMonitorData;
/**
 * Type for {@link FirecrawlMonitorData}.
 *
 * **Example** (Type optional monitor data)
 *
 * ```ts
 * import type { FirecrawlMonitorData } from "@beep/firecrawl"
 *
 * const value: FirecrawlMonitorData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlMonitorData = typeof FirecrawlMonitorData.Type;
/**
 * Structurally validated Firecrawl monitor-list response schema.
 *
 * **Example** (Log monitor list data)
 *
 * ```ts
 * import { FirecrawlMonitorListData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlMonitorListData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlMonitorListData = Response.FirecrawlMonitorListData;
/**
 * Type for {@link FirecrawlMonitorListData}.
 *
 * **Example** (Type optional monitor list data)
 *
 * ```ts
 * import type { FirecrawlMonitorListData } from "@beep/firecrawl"
 *
 * const value: FirecrawlMonitorListData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlMonitorListData = typeof FirecrawlMonitorListData.Type;
/**
 * Structurally validated Firecrawl monitor-check response schema.
 *
 * **Example** (Log monitor check data)
 *
 * ```ts
 * import { FirecrawlMonitorCheckData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlMonitorCheckData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlMonitorCheckData = Response.FirecrawlMonitorCheckData;
/**
 * Type for {@link FirecrawlMonitorCheckData}.
 *
 * **Example** (Type optional monitor check data)
 *
 * ```ts
 * import type { FirecrawlMonitorCheckData } from "@beep/firecrawl"
 *
 * const value: FirecrawlMonitorCheckData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlMonitorCheckData = typeof FirecrawlMonitorCheckData.Type;
/**
 * Structurally validated Firecrawl monitor-check-list response schema.
 *
 * **Example** (Log monitor check list data)
 *
 * ```ts
 * import { FirecrawlMonitorCheckListData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlMonitorCheckListData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlMonitorCheckListData = Response.FirecrawlMonitorCheckListData;
/**
 * Type for {@link FirecrawlMonitorCheckListData}.
 *
 * **Example** (Type optional monitor check list data)
 *
 * ```ts
 * import type { FirecrawlMonitorCheckListData } from "@beep/firecrawl"
 *
 * const value: FirecrawlMonitorCheckListData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlMonitorCheckListData = typeof FirecrawlMonitorCheckListData.Type;
/**
 * Structurally validated Firecrawl monitor-check-detail response schema.
 *
 * **Example** (Log monitor check detail data)
 *
 * ```ts
 * import { FirecrawlMonitorCheckDetailData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlMonitorCheckDetailData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlMonitorCheckDetailData = Response.FirecrawlMonitorCheckDetailData;
/**
 * Type for {@link FirecrawlMonitorCheckDetailData}.
 *
 * **Example** (Type optional monitor check detail data)
 *
 * ```ts
 * import type { FirecrawlMonitorCheckDetailData } from "@beep/firecrawl"
 *
 * const value: FirecrawlMonitorCheckDetailData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlMonitorCheckDetailData = typeof FirecrawlMonitorCheckDetailData.Type;
/**
 * Structurally validated Firecrawl batch-scrape-start response schema.
 *
 * **Example** (Log batch scrape response data)
 *
 * ```ts
 * import { FirecrawlBatchScrapeResponseData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlBatchScrapeResponseData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlBatchScrapeResponseData = Response.FirecrawlBatchScrapeResponseData;
/**
 * Type for {@link FirecrawlBatchScrapeResponseData}.
 *
 * **Example** (Type optional batch scrape response data)
 *
 * ```ts
 * import type { FirecrawlBatchScrapeResponseData } from "@beep/firecrawl"
 *
 * const value: FirecrawlBatchScrapeResponseData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlBatchScrapeResponseData = typeof FirecrawlBatchScrapeResponseData.Type;
/**
 * Structurally validated Firecrawl batch-scrape-job response schema.
 *
 * **Example** (Log batch scrape job data)
 *
 * ```ts
 * import { FirecrawlBatchScrapeJobData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlBatchScrapeJobData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlBatchScrapeJobData = Response.FirecrawlBatchScrapeJobData;
/**
 * Type for {@link FirecrawlBatchScrapeJobData}.
 *
 * **Example** (Type optional batch scrape job data)
 *
 * ```ts
 * import type { FirecrawlBatchScrapeJobData } from "@beep/firecrawl"
 *
 * const value: FirecrawlBatchScrapeJobData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlBatchScrapeJobData = typeof FirecrawlBatchScrapeJobData.Type;
/**
 * Structurally validated Firecrawl agent-start response schema.
 *
 * **Example** (Log agent response data)
 *
 * ```ts
 * import { FirecrawlAgentResponseData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlAgentResponseData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlAgentResponseData = Response.FirecrawlAgentResponseData;
/**
 * Type for {@link FirecrawlAgentResponseData}.
 *
 * **Example** (Type optional agent response data)
 *
 * ```ts
 * import type { FirecrawlAgentResponseData } from "@beep/firecrawl"
 *
 * const value: FirecrawlAgentResponseData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlAgentResponseData = typeof FirecrawlAgentResponseData.Type;
/**
 * Structurally validated Firecrawl agent-status response schema.
 *
 * **Example** (Log agent status data)
 *
 * ```ts
 * import { FirecrawlAgentStatusData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlAgentStatusData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlAgentStatusData = Response.FirecrawlAgentStatusData;
/**
 * Type for {@link FirecrawlAgentStatusData}.
 *
 * **Example** (Type optional agent status data)
 *
 * ```ts
 * import type { FirecrawlAgentStatusData } from "@beep/firecrawl"
 *
 * const value: FirecrawlAgentStatusData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlAgentStatusData = typeof FirecrawlAgentStatusData.Type;
/**
 * Structurally validated Firecrawl browser-create response schema.
 *
 * **Example** (Log browser create data)
 *
 * ```ts
 * import { FirecrawlBrowserCreateData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlBrowserCreateData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlBrowserCreateData = Response.FirecrawlBrowserCreateData;
/**
 * Type for {@link FirecrawlBrowserCreateData}.
 *
 * **Example** (Type optional browser create data)
 *
 * ```ts
 * import type { FirecrawlBrowserCreateData } from "@beep/firecrawl"
 *
 * const value: FirecrawlBrowserCreateData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlBrowserCreateData = typeof FirecrawlBrowserCreateData.Type;
/**
 * Structurally validated Firecrawl browser-execute response schema.
 *
 * **Example** (Log browser execute data)
 *
 * ```ts
 * import { FirecrawlBrowserExecuteData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlBrowserExecuteData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlBrowserExecuteData = Response.FirecrawlBrowserExecuteData;
/**
 * Type for {@link FirecrawlBrowserExecuteData}.
 *
 * **Example** (Type optional browser execute data)
 *
 * ```ts
 * import type { FirecrawlBrowserExecuteData } from "@beep/firecrawl"
 *
 * const value: FirecrawlBrowserExecuteData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlBrowserExecuteData = typeof FirecrawlBrowserExecuteData.Type;
/**
 * Structurally validated Firecrawl browser-delete response schema.
 *
 * **Example** (Log browser delete data)
 *
 * ```ts
 * import { FirecrawlBrowserDeleteData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlBrowserDeleteData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlBrowserDeleteData = Response.FirecrawlBrowserDeleteData;
/**
 * Type for {@link FirecrawlBrowserDeleteData}.
 *
 * **Example** (Type optional browser delete data)
 *
 * ```ts
 * import type { FirecrawlBrowserDeleteData } from "@beep/firecrawl"
 *
 * const value: FirecrawlBrowserDeleteData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlBrowserDeleteData = typeof FirecrawlBrowserDeleteData.Type;
/**
 * Structurally validated Firecrawl browser-list response schema.
 *
 * **Example** (Log browser list data)
 *
 * ```ts
 * import { FirecrawlBrowserListData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlBrowserListData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlBrowserListData = Response.FirecrawlBrowserListData;
/**
 * Type for {@link FirecrawlBrowserListData}.
 *
 * **Example** (Type optional browser list data)
 *
 * ```ts
 * import type { FirecrawlBrowserListData } from "@beep/firecrawl"
 *
 * const value: FirecrawlBrowserListData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlBrowserListData = typeof FirecrawlBrowserListData.Type;
/**
 * Structurally validated Firecrawl concurrency response schema.
 *
 * **Example** (Log concurrency data schema)
 *
 * ```ts
 * import { FirecrawlConcurrencyData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlConcurrencyData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlConcurrencyData = Response.FirecrawlConcurrencyData;
/**
 * Type for {@link FirecrawlConcurrencyData}.
 *
 * **Example** (Type optional concurrency data)
 *
 * ```ts
 * import type { FirecrawlConcurrencyData } from "@beep/firecrawl"
 *
 * const value: FirecrawlConcurrencyData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlConcurrencyData = typeof FirecrawlConcurrencyData.Type;
/**
 * Structurally validated Firecrawl credit-usage response schema.
 *
 * **Example** (Log credit usage data)
 *
 * ```ts
 * import { FirecrawlCreditUsageData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCreditUsageData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlCreditUsageData = Response.FirecrawlCreditUsageData;
/**
 * Type for {@link FirecrawlCreditUsageData}.
 *
 * **Example** (Type optional credit usage data)
 *
 * ```ts
 * import type { FirecrawlCreditUsageData } from "@beep/firecrawl"
 *
 * const value: FirecrawlCreditUsageData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlCreditUsageData = typeof FirecrawlCreditUsageData.Type;
/**
 * Structurally validated Firecrawl token-usage response schema.
 *
 * **Example** (Log token usage data)
 *
 * ```ts
 * import { FirecrawlTokenUsageData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlTokenUsageData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlTokenUsageData = Response.FirecrawlTokenUsageData;
/**
 * Type for {@link FirecrawlTokenUsageData}.
 *
 * **Example** (Type optional token usage data)
 *
 * ```ts
 * import type { FirecrawlTokenUsageData } from "@beep/firecrawl"
 *
 * const value: FirecrawlTokenUsageData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlTokenUsageData = typeof FirecrawlTokenUsageData.Type;
/**
 * Structurally validated Firecrawl historical credit-usage response schema.
 *
 * **Example** (Log historical credit usage data)
 *
 * ```ts
 * import { FirecrawlCreditUsageHistoricalData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCreditUsageHistoricalData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlCreditUsageHistoricalData = Response.FirecrawlCreditUsageHistoricalData;
/**
 * Type for {@link FirecrawlCreditUsageHistoricalData}.
 *
 * **Example** (Type optional historical credit usage data)
 *
 * ```ts
 * import type { FirecrawlCreditUsageHistoricalData } from "@beep/firecrawl"
 *
 * const value: FirecrawlCreditUsageHistoricalData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlCreditUsageHistoricalData = typeof FirecrawlCreditUsageHistoricalData.Type;
/**
 * Structurally validated Firecrawl historical token-usage response schema.
 *
 * **Example** (Log historical token usage data)
 *
 * ```ts
 * import { FirecrawlTokenUsageHistoricalData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlTokenUsageHistoricalData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlTokenUsageHistoricalData = Response.FirecrawlTokenUsageHistoricalData;
/**
 * Type for {@link FirecrawlTokenUsageHistoricalData}.
 *
 * **Example** (Type optional historical token usage data)
 *
 * ```ts
 * import type { FirecrawlTokenUsageHistoricalData } from "@beep/firecrawl"
 *
 * const value: FirecrawlTokenUsageHistoricalData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlTokenUsageHistoricalData = typeof FirecrawlTokenUsageHistoricalData.Type;
/**
 * Structurally validated Firecrawl queue-status response schema.
 *
 * **Example** (Log queue status data)
 *
 * ```ts
 * import { FirecrawlQueueStatusData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlQueueStatusData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlQueueStatusData = Response.FirecrawlQueueStatusData;
/**
 * Type for {@link FirecrawlQueueStatusData}.
 *
 * **Example** (Type optional queue status data)
 *
 * ```ts
 * import type { FirecrawlQueueStatusData } from "@beep/firecrawl"
 *
 * const value: FirecrawlQueueStatusData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlQueueStatusData = typeof FirecrawlQueueStatusData.Type;
/**
 * Structurally validated Firecrawl interaction response schema.
 *
 * **Example** (Log interact data schema)
 *
 * ```ts
 * import { FirecrawlInteractData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlInteractData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlInteractData = Response.FirecrawlInteractData;
/**
 * Type for {@link FirecrawlInteractData}.
 *
 * **Example** (Type optional interact data)
 *
 * ```ts
 * import type { FirecrawlInteractData } from "@beep/firecrawl"
 *
 * const value: FirecrawlInteractData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlInteractData = typeof FirecrawlInteractData.Type;
/**
 * Structurally validated Firecrawl stop-interaction response schema.
 *
 * **Example** (Log stop interaction data)
 *
 * ```ts
 * import { FirecrawlStopInteractionData } from "@beep/firecrawl"
 *
 * console.log(FirecrawlStopInteractionData)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlStopInteractionData = Response.FirecrawlStopInteractionData;
/**
 * Type for {@link FirecrawlStopInteractionData}.
 *
 * **Example** (Type optional stop interaction data)
 *
 * ```ts
 * import type { FirecrawlStopInteractionData } from "@beep/firecrawl"
 *
 * const value: FirecrawlStopInteractionData | undefined = undefined
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlStopInteractionData = typeof FirecrawlStopInteractionData.Type;

const failureFields = {
  code: optionalString,
  details: optionalUnknown,
  error: S.String,
  status: optionalNumber,
  success: S.tag(false),
};

/**
 * Firecrawl Scrape Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log scrape payload schema)
 *
 * ```ts
 * import { FirecrawlScrapePayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlScrapePayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlScrapePayload extends S.Opaque<FirecrawlScrapePayload, { readonly brand: unique symbol }>()(
  S.Struct({
    options: S.OptionFromOptionalKey(FirecrawlScrapeOptions).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<ScrapeOptions>()))
    ),
    url: S.String,
  }).pipe(
    $I.annoteSchema("FirecrawlScrapePayload", { description: "Payload decoded before calling Firecrawl scrape." })
  )
) {}
/**
 * Firecrawl Scrape Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log scrape success schema)
 *
 * ```ts
 * import { FirecrawlScrapeSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlScrapeSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlScrapeSuccess extends S.Opaque<FirecrawlScrapeSuccess, { readonly brand: unique symbol }>()(
  S.Struct({ data: FirecrawlDocument }).pipe(
    $I.annoteSchema("FirecrawlScrapeSuccess", { description: "Decoded success value returned by Firecrawl scrape." })
  )
) {}
/**
 * Firecrawl Scrape Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log scrape failure schema)
 *
 * ```ts
 * import { FirecrawlScrapeFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlScrapeFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlScrapeFailure extends S.Opaque<FirecrawlScrapeFailure, { readonly brand: unique symbol }>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlScrapeFailure", { description: "Decoded failure shape returned by Firecrawl scrape." })
  )
) {}

/**
 * Firecrawl Interact Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log interact payload schema)
 *
 * ```ts
 * import { FirecrawlInteractPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlInteractPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlInteractPayload extends S.Opaque<FirecrawlInteractPayload, { readonly brand: unique symbol }>()(
  S.Struct({ args: FirecrawlInteractRequest, jobId: S.String }).pipe(
    $I.annoteSchema("FirecrawlInteractPayload", { description: "Payload decoded before calling Firecrawl interact." })
  )
) {}
/**
 * Firecrawl Interact Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log interact success schema)
 *
 * ```ts
 * import { FirecrawlInteractSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlInteractSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlInteractSuccess extends S.Opaque<FirecrawlInteractSuccess, { readonly brand: unique symbol }>()(
  S.Struct({ data: FirecrawlInteractData }).pipe(
    $I.annoteSchema("FirecrawlInteractSuccess", {
      description: "Decoded success value returned by Firecrawl interact.",
    })
  )
) {}
/**
 * Firecrawl Interact Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log interact failure schema)
 *
 * ```ts
 * import { FirecrawlInteractFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlInteractFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlInteractFailure extends S.Opaque<FirecrawlInteractFailure, { readonly brand: unique symbol }>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlInteractFailure", {
      description: "Decoded failure shape returned by Firecrawl interact.",
    })
  )
) {}

/**
 * Firecrawl Stop Interaction Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log stop interaction payload)
 *
 * ```ts
 * import { FirecrawlStopInteractionPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlStopInteractionPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlStopInteractionPayload extends S.Opaque<
  FirecrawlStopInteractionPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({ jobId: S.String }).pipe(
    $I.annoteSchema("FirecrawlStopInteractionPayload", {
      description: "Payload decoded before calling Firecrawl stopInteraction.",
    })
  )
) {}
/**
 * Firecrawl Stop Interaction Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log stop interaction success)
 *
 * ```ts
 * import { FirecrawlStopInteractionSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlStopInteractionSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlStopInteractionSuccess extends S.Opaque<
  FirecrawlStopInteractionSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlStopInteractionData }).pipe(
    $I.annoteSchema("FirecrawlStopInteractionSuccess", {
      description: "Decoded success value returned by Firecrawl stopInteraction.",
    })
  )
) {}
/**
 * Firecrawl Stop Interaction Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log stop interaction failure)
 *
 * ```ts
 * import { FirecrawlStopInteractionFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlStopInteractionFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlStopInteractionFailure extends S.Opaque<
  FirecrawlStopInteractionFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlStopInteractionFailure", {
      description: "Decoded failure shape returned by Firecrawl stopInteraction.",
    })
  )
) {}

/**
 * Firecrawl Parse Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log parse payload schema)
 *
 * ```ts
 * import { FirecrawlParsePayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlParsePayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlParsePayload extends S.Opaque<FirecrawlParsePayload, { readonly brand: unique symbol }>()(
  S.Struct({
    file: FirecrawlParseFile,
    options: S.OptionFromOptionalKey(FirecrawlParseOptions).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<ParseOptions>()))
    ),
  }).pipe($I.annoteSchema("FirecrawlParsePayload", { description: "Payload decoded before calling Firecrawl parse." }))
) {}
/**
 * Firecrawl Parse Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log parse success schema)
 *
 * ```ts
 * import { FirecrawlParseSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlParseSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlParseSuccess extends S.Opaque<FirecrawlParseSuccess, { readonly brand: unique symbol }>()(
  S.Struct({ data: FirecrawlDocument }).pipe(
    $I.annoteSchema("FirecrawlParseSuccess", { description: "Decoded success value returned by Firecrawl parse." })
  )
) {}
/**
 * Firecrawl Parse Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log parse failure schema)
 *
 * ```ts
 * import { FirecrawlParseFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlParseFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlParseFailure extends S.Opaque<FirecrawlParseFailure, { readonly brand: unique symbol }>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlParseFailure", { description: "Decoded failure shape returned by Firecrawl parse." })
  )
) {}

/**
 * Firecrawl Search Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log search payload schema)
 *
 * ```ts
 * import { FirecrawlSearchPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlSearchPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlSearchPayload extends S.Opaque<FirecrawlSearchPayload, { readonly brand: unique symbol }>()(
  S.Struct({
    query: S.String,
    request: S.OptionFromOptionalKey(FirecrawlSearchOptions).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<Omit<SearchRequest, "query">>()))
    ),
  }).pipe(
    $I.annoteSchema("FirecrawlSearchPayload", { description: "Payload decoded before calling Firecrawl search." })
  )
) {}
/**
 * Firecrawl Search Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log search success schema)
 *
 * ```ts
 * import { FirecrawlSearchSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlSearchSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlSearchSuccess extends S.Opaque<FirecrawlSearchSuccess, { readonly brand: unique symbol }>()(
  S.Struct({ data: FirecrawlSearchData }).pipe(
    $I.annoteSchema("FirecrawlSearchSuccess", { description: "Decoded success value returned by Firecrawl search." })
  )
) {}
/**
 * Firecrawl Search Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log search failure schema)
 *
 * ```ts
 * import { FirecrawlSearchFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlSearchFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlSearchFailure extends S.Opaque<FirecrawlSearchFailure, { readonly brand: unique symbol }>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlSearchFailure", { description: "Decoded failure shape returned by Firecrawl search." })
  )
) {}

/**
 * Firecrawl Map Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log map payload schema)
 *
 * ```ts
 * import { FirecrawlMapPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlMapPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlMapPayload extends S.Opaque<FirecrawlMapPayload, { readonly brand: unique symbol }>()(
  S.Struct({
    options: S.OptionFromOptionalKey(FirecrawlMapOptions).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<MapOptions>()))
    ),
    url: S.String,
  }).pipe($I.annoteSchema("FirecrawlMapPayload", { description: "Payload decoded before calling Firecrawl map." }))
) {}
/**
 * Firecrawl Map Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log map success schema)
 *
 * ```ts
 * import { FirecrawlMapSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlMapSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlMapSuccess extends S.Opaque<FirecrawlMapSuccess, { readonly brand: unique symbol }>()(
  S.Struct({ data: FirecrawlMapData }).pipe(
    $I.annoteSchema("FirecrawlMapSuccess", { description: "Decoded success value returned by Firecrawl map." })
  )
) {}
/**
 * Firecrawl Map Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log map failure schema)
 *
 * ```ts
 * import { FirecrawlMapFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlMapFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlMapFailure extends S.Opaque<FirecrawlMapFailure, { readonly brand: unique symbol }>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlMapFailure", { description: "Decoded failure shape returned by Firecrawl map." })
  )
) {}

/**
 * Firecrawl Start Crawl Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log start crawl payload)
 *
 * ```ts
 * import { FirecrawlStartCrawlPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlStartCrawlPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlStartCrawlPayload extends S.Opaque<
  FirecrawlStartCrawlPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    request: S.OptionFromOptionalKey(FirecrawlCrawlOptions).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<CrawlOptions>()))
    ),
    url: S.String,
  }).pipe(
    $I.annoteSchema("FirecrawlStartCrawlPayload", {
      description: "Payload decoded before calling Firecrawl startCrawl.",
    })
  )
) {}
/**
 * Firecrawl Start Crawl Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log start crawl success)
 *
 * ```ts
 * import { FirecrawlStartCrawlSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlStartCrawlSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlStartCrawlSuccess extends S.Opaque<
  FirecrawlStartCrawlSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlCrawlResponseData }).pipe(
    $I.annoteSchema("FirecrawlStartCrawlSuccess", {
      description: "Decoded success value returned by Firecrawl startCrawl.",
    })
  )
) {}
/**
 * Firecrawl Start Crawl Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log start crawl failure)
 *
 * ```ts
 * import { FirecrawlStartCrawlFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlStartCrawlFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlStartCrawlFailure extends S.Opaque<
  FirecrawlStartCrawlFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlStartCrawlFailure", {
      description: "Decoded failure shape returned by Firecrawl startCrawl.",
    })
  )
) {}

/**
 * Firecrawl Get Crawl Status Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log get crawl status payload)
 *
 * ```ts
 * import { FirecrawlGetCrawlStatusPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetCrawlStatusPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetCrawlStatusPayload extends S.Opaque<
  FirecrawlGetCrawlStatusPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    jobId: S.String,
    pagination: S.OptionFromOptionalKey(FirecrawlPaginationConfig).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<PaginationConfig>()))
    ),
  }).pipe(
    $I.annoteSchema("FirecrawlGetCrawlStatusPayload", {
      description: "Payload decoded before calling Firecrawl getCrawlStatus.",
    })
  )
) {}
/**
 * Firecrawl Get Crawl Status Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log get crawl status success)
 *
 * ```ts
 * import { FirecrawlGetCrawlStatusSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetCrawlStatusSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetCrawlStatusSuccess extends S.Opaque<
  FirecrawlGetCrawlStatusSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlCrawlJobData }).pipe(
    $I.annoteSchema("FirecrawlGetCrawlStatusSuccess", {
      description: "Decoded success value returned by Firecrawl getCrawlStatus.",
    })
  )
) {}
/**
 * Firecrawl Get Crawl Status Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log get crawl status failure)
 *
 * ```ts
 * import { FirecrawlGetCrawlStatusFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetCrawlStatusFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetCrawlStatusFailure extends S.Opaque<
  FirecrawlGetCrawlStatusFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlGetCrawlStatusFailure", {
      description: "Decoded failure shape returned by Firecrawl getCrawlStatus.",
    })
  )
) {}

/**
 * Firecrawl Cancel Crawl Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log cancel crawl payload)
 *
 * ```ts
 * import { FirecrawlCancelCrawlPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCancelCrawlPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlCancelCrawlPayload extends S.Opaque<
  FirecrawlCancelCrawlPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({ jobId: S.String }).pipe(
    $I.annoteSchema("FirecrawlCancelCrawlPayload", {
      description: "Payload decoded before calling Firecrawl cancelCrawl.",
    })
  )
) {}
/**
 * Firecrawl Cancel Crawl Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log cancel crawl success)
 *
 * ```ts
 * import { FirecrawlCancelCrawlSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCancelCrawlSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlCancelCrawlSuccess extends S.Opaque<
  FirecrawlCancelCrawlSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ cancelled: S.Boolean }).pipe(
    $I.annoteSchema("FirecrawlCancelCrawlSuccess", {
      description: "Decoded success value returned by Firecrawl cancelCrawl.",
    })
  )
) {}
/**
 * Firecrawl Cancel Crawl Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log cancel crawl failure)
 *
 * ```ts
 * import { FirecrawlCancelCrawlFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCancelCrawlFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlCancelCrawlFailure extends S.Opaque<
  FirecrawlCancelCrawlFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlCancelCrawlFailure", {
      description: "Decoded failure shape returned by Firecrawl cancelCrawl.",
    })
  )
) {}

/**
 * Firecrawl Crawl Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log crawl payload schema)
 *
 * ```ts
 * import { FirecrawlCrawlPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCrawlPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlCrawlPayload extends S.Opaque<FirecrawlCrawlPayload, { readonly brand: unique symbol }>()(
  S.Struct({
    request: S.OptionFromOptionalKey(FirecrawlCrawlWaitOptions).pipe(
      S.withConstructorDefault(
        Effect.succeed(O.none<CrawlOptions & { readonly pollInterval?: number; readonly timeout?: number }>())
      )
    ),
    url: S.String,
  }).pipe($I.annoteSchema("FirecrawlCrawlPayload", { description: "Payload decoded before calling Firecrawl crawl." }))
) {}
/**
 * Firecrawl Crawl Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log crawl success schema)
 *
 * ```ts
 * import { FirecrawlCrawlSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCrawlSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlCrawlSuccess extends S.Opaque<FirecrawlCrawlSuccess, { readonly brand: unique symbol }>()(
  S.Struct({ data: FirecrawlCrawlJobData }).pipe(
    $I.annoteSchema("FirecrawlCrawlSuccess", { description: "Decoded success value returned by Firecrawl crawl." })
  )
) {}
/**
 * Firecrawl Crawl Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log crawl failure schema)
 *
 * ```ts
 * import { FirecrawlCrawlFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCrawlFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlCrawlFailure extends S.Opaque<FirecrawlCrawlFailure, { readonly brand: unique symbol }>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlCrawlFailure", { description: "Decoded failure shape returned by Firecrawl crawl." })
  )
) {}

/**
 * Firecrawl Get Crawl Errors Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log get crawl errors payload)
 *
 * ```ts
 * import { FirecrawlGetCrawlErrorsPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetCrawlErrorsPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetCrawlErrorsPayload extends S.Opaque<
  FirecrawlGetCrawlErrorsPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({ crawlId: S.String }).pipe(
    $I.annoteSchema("FirecrawlGetCrawlErrorsPayload", {
      description: "Payload decoded before calling Firecrawl getCrawlErrors.",
    })
  )
) {}
/**
 * Firecrawl Get Crawl Errors Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log get crawl errors success)
 *
 * ```ts
 * import { FirecrawlGetCrawlErrorsSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetCrawlErrorsSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetCrawlErrorsSuccess extends S.Opaque<
  FirecrawlGetCrawlErrorsSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlCrawlErrorsData }).pipe(
    $I.annoteSchema("FirecrawlGetCrawlErrorsSuccess", {
      description: "Decoded success value returned by Firecrawl getCrawlErrors.",
    })
  )
) {}
/**
 * Firecrawl Get Crawl Errors Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log get crawl errors failure)
 *
 * ```ts
 * import { FirecrawlGetCrawlErrorsFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetCrawlErrorsFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetCrawlErrorsFailure extends S.Opaque<
  FirecrawlGetCrawlErrorsFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlGetCrawlErrorsFailure", {
      description: "Decoded failure shape returned by Firecrawl getCrawlErrors.",
    })
  )
) {}

/**
 * Firecrawl Get Active Crawls Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log get active crawls payload)
 *
 * ```ts
 * import { FirecrawlGetActiveCrawlsPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetActiveCrawlsPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetActiveCrawlsPayload extends S.Opaque<
  FirecrawlGetActiveCrawlsPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({}).pipe(
    $I.annoteSchema("FirecrawlGetActiveCrawlsPayload", {
      description: "Payload decoded before calling Firecrawl getActiveCrawls.",
    })
  )
) {}
/**
 * Firecrawl Get Active Crawls Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log get active crawls success)
 *
 * ```ts
 * import { FirecrawlGetActiveCrawlsSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetActiveCrawlsSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetActiveCrawlsSuccess extends S.Opaque<
  FirecrawlGetActiveCrawlsSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlActiveCrawlsData }).pipe(
    $I.annoteSchema("FirecrawlGetActiveCrawlsSuccess", {
      description: "Decoded success value returned by Firecrawl getActiveCrawls.",
    })
  )
) {}
/**
 * Firecrawl Get Active Crawls Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log get active crawls failure)
 *
 * ```ts
 * import { FirecrawlGetActiveCrawlsFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetActiveCrawlsFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetActiveCrawlsFailure extends S.Opaque<
  FirecrawlGetActiveCrawlsFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlGetActiveCrawlsFailure", {
      description: "Decoded failure shape returned by Firecrawl getActiveCrawls.",
    })
  )
) {}

/**
 * Firecrawl Crawl Params Preview Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log crawl params preview payload)
 *
 * ```ts
 * import { FirecrawlCrawlParamsPreviewPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCrawlParamsPreviewPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlCrawlParamsPreviewPayload extends S.Opaque<
  FirecrawlCrawlParamsPreviewPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({ prompt: S.String, url: S.String }).pipe(
    $I.annoteSchema("FirecrawlCrawlParamsPreviewPayload", {
      description: "Payload decoded before calling Firecrawl crawlParamsPreview.",
    })
  )
) {}
/**
 * Firecrawl Crawl Params Preview Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log crawl params preview success)
 *
 * ```ts
 * import { FirecrawlCrawlParamsPreviewSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCrawlParamsPreviewSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlCrawlParamsPreviewSuccess extends S.Opaque<
  FirecrawlCrawlParamsPreviewSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: S.Record(S.String, S.Unknown) }).pipe(
    $I.annoteSchema("FirecrawlCrawlParamsPreviewSuccess", {
      description: "Decoded success value returned by Firecrawl crawlParamsPreview.",
    })
  )
) {}
/**
 * Firecrawl Crawl Params Preview Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log crawl params preview failure)
 *
 * ```ts
 * import { FirecrawlCrawlParamsPreviewFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCrawlParamsPreviewFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlCrawlParamsPreviewFailure extends S.Opaque<
  FirecrawlCrawlParamsPreviewFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlCrawlParamsPreviewFailure", {
      description: "Decoded failure shape returned by Firecrawl crawlParamsPreview.",
    })
  )
) {}

/**
 * Firecrawl Create Monitor Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log create monitor payload)
 *
 * ```ts
 * import { FirecrawlCreateMonitorPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCreateMonitorPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlCreateMonitorPayload extends S.Opaque<
  FirecrawlCreateMonitorPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({ request: FirecrawlCreateMonitorRequest }).pipe(
    $I.annoteSchema("FirecrawlCreateMonitorPayload", {
      description: "Payload decoded before calling Firecrawl createMonitor.",
    })
  )
) {}
/**
 * Firecrawl Create Monitor Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log create monitor success)
 *
 * ```ts
 * import { FirecrawlCreateMonitorSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCreateMonitorSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlCreateMonitorSuccess extends S.Opaque<
  FirecrawlCreateMonitorSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlMonitorData }).pipe(
    $I.annoteSchema("FirecrawlCreateMonitorSuccess", {
      description: "Decoded success value returned by Firecrawl createMonitor.",
    })
  )
) {}
/**
 * Firecrawl Create Monitor Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log create monitor failure)
 *
 * ```ts
 * import { FirecrawlCreateMonitorFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCreateMonitorFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlCreateMonitorFailure extends S.Opaque<
  FirecrawlCreateMonitorFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlCreateMonitorFailure", {
      description: "Decoded failure shape returned by Firecrawl createMonitor.",
    })
  )
) {}

/**
 * Firecrawl List Monitors Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log list monitors payload)
 *
 * ```ts
 * import { FirecrawlListMonitorsPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlListMonitorsPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlListMonitorsPayload extends S.Opaque<
  FirecrawlListMonitorsPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    options: S.OptionFromOptionalKey(FirecrawlListMonitorsOptions).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<ListMonitorsOptions>()))
    ),
  }).pipe(
    $I.annoteSchema("FirecrawlListMonitorsPayload", {
      description: "Payload decoded before calling Firecrawl listMonitors.",
    })
  )
) {}
/**
 * Firecrawl List Monitors Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log list monitors success)
 *
 * ```ts
 * import { FirecrawlListMonitorsSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlListMonitorsSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlListMonitorsSuccess extends S.Opaque<
  FirecrawlListMonitorsSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlMonitorListData }).pipe(
    $I.annoteSchema("FirecrawlListMonitorsSuccess", {
      description: "Decoded success value returned by Firecrawl listMonitors.",
    })
  )
) {}
/**
 * Firecrawl List Monitors Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log list monitors failure)
 *
 * ```ts
 * import { FirecrawlListMonitorsFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlListMonitorsFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlListMonitorsFailure extends S.Opaque<
  FirecrawlListMonitorsFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlListMonitorsFailure", {
      description: "Decoded failure shape returned by Firecrawl listMonitors.",
    })
  )
) {}

/**
 * Firecrawl Get Monitor Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log get monitor payload)
 *
 * ```ts
 * import { FirecrawlGetMonitorPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetMonitorPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetMonitorPayload extends S.Opaque<
  FirecrawlGetMonitorPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({ monitorId: S.String }).pipe(
    $I.annoteSchema("FirecrawlGetMonitorPayload", {
      description: "Payload decoded before calling Firecrawl getMonitor.",
    })
  )
) {}
/**
 * Firecrawl Get Monitor Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log get monitor success)
 *
 * ```ts
 * import { FirecrawlGetMonitorSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetMonitorSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetMonitorSuccess extends S.Opaque<
  FirecrawlGetMonitorSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlMonitorData }).pipe(
    $I.annoteSchema("FirecrawlGetMonitorSuccess", {
      description: "Decoded success value returned by Firecrawl getMonitor.",
    })
  )
) {}
/**
 * Firecrawl Get Monitor Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log get monitor failure)
 *
 * ```ts
 * import { FirecrawlGetMonitorFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetMonitorFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetMonitorFailure extends S.Opaque<
  FirecrawlGetMonitorFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlGetMonitorFailure", {
      description: "Decoded failure shape returned by Firecrawl getMonitor.",
    })
  )
) {}

/**
 * Firecrawl Update Monitor Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log update monitor payload)
 *
 * ```ts
 * import { FirecrawlUpdateMonitorPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlUpdateMonitorPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlUpdateMonitorPayload extends S.Opaque<
  FirecrawlUpdateMonitorPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({ monitorId: S.String, request: FirecrawlUpdateMonitorRequest }).pipe(
    $I.annoteSchema("FirecrawlUpdateMonitorPayload", {
      description: "Payload decoded before calling Firecrawl updateMonitor.",
    })
  )
) {}
/**
 * Firecrawl Update Monitor Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log update monitor success)
 *
 * ```ts
 * import { FirecrawlUpdateMonitorSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlUpdateMonitorSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlUpdateMonitorSuccess extends S.Opaque<
  FirecrawlUpdateMonitorSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlMonitorData }).pipe(
    $I.annoteSchema("FirecrawlUpdateMonitorSuccess", {
      description: "Decoded success value returned by Firecrawl updateMonitor.",
    })
  )
) {}
/**
 * Firecrawl Update Monitor Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log update monitor failure)
 *
 * ```ts
 * import { FirecrawlUpdateMonitorFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlUpdateMonitorFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlUpdateMonitorFailure extends S.Opaque<
  FirecrawlUpdateMonitorFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlUpdateMonitorFailure", {
      description: "Decoded failure shape returned by Firecrawl updateMonitor.",
    })
  )
) {}

/**
 * Firecrawl Delete Monitor Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log delete monitor payload)
 *
 * ```ts
 * import { FirecrawlDeleteMonitorPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlDeleteMonitorPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlDeleteMonitorPayload extends S.Opaque<
  FirecrawlDeleteMonitorPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({ monitorId: S.String }).pipe(
    $I.annoteSchema("FirecrawlDeleteMonitorPayload", {
      description: "Payload decoded before calling Firecrawl deleteMonitor.",
    })
  )
) {}
/**
 * Firecrawl Delete Monitor Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log delete monitor success)
 *
 * ```ts
 * import { FirecrawlDeleteMonitorSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlDeleteMonitorSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlDeleteMonitorSuccess extends S.Opaque<
  FirecrawlDeleteMonitorSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ deleted: S.Boolean }).pipe(
    $I.annoteSchema("FirecrawlDeleteMonitorSuccess", {
      description: "Decoded success value returned by Firecrawl deleteMonitor.",
    })
  )
) {}
/**
 * Firecrawl Delete Monitor Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log delete monitor failure)
 *
 * ```ts
 * import { FirecrawlDeleteMonitorFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlDeleteMonitorFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlDeleteMonitorFailure extends S.Opaque<
  FirecrawlDeleteMonitorFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlDeleteMonitorFailure", {
      description: "Decoded failure shape returned by Firecrawl deleteMonitor.",
    })
  )
) {}

/**
 * Firecrawl Run Monitor Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log run monitor payload)
 *
 * ```ts
 * import { FirecrawlRunMonitorPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlRunMonitorPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlRunMonitorPayload extends S.Opaque<
  FirecrawlRunMonitorPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({ monitorId: S.String }).pipe(
    $I.annoteSchema("FirecrawlRunMonitorPayload", {
      description: "Payload decoded before calling Firecrawl runMonitor.",
    })
  )
) {}
/**
 * Firecrawl Run Monitor Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log run monitor success)
 *
 * ```ts
 * import { FirecrawlRunMonitorSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlRunMonitorSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlRunMonitorSuccess extends S.Opaque<
  FirecrawlRunMonitorSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlMonitorCheckData }).pipe(
    $I.annoteSchema("FirecrawlRunMonitorSuccess", {
      description: "Decoded success value returned by Firecrawl runMonitor.",
    })
  )
) {}
/**
 * Firecrawl Run Monitor Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log run monitor failure)
 *
 * ```ts
 * import { FirecrawlRunMonitorFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlRunMonitorFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlRunMonitorFailure extends S.Opaque<
  FirecrawlRunMonitorFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlRunMonitorFailure", {
      description: "Decoded failure shape returned by Firecrawl runMonitor.",
    })
  )
) {}

/**
 * Firecrawl List Monitor Checks Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log list monitor checks payload)
 *
 * ```ts
 * import { FirecrawlListMonitorChecksPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlListMonitorChecksPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlListMonitorChecksPayload extends S.Opaque<
  FirecrawlListMonitorChecksPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    monitorId: S.String,
    options: S.OptionFromOptionalKey(FirecrawlListMonitorChecksOptions).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<ListMonitorChecksOptions>()))
    ),
  }).pipe(
    $I.annoteSchema("FirecrawlListMonitorChecksPayload", {
      description: "Payload decoded before calling Firecrawl listMonitorChecks.",
    })
  )
) {}
/**
 * Firecrawl List Monitor Checks Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log list monitor checks success)
 *
 * ```ts
 * import { FirecrawlListMonitorChecksSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlListMonitorChecksSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlListMonitorChecksSuccess extends S.Opaque<
  FirecrawlListMonitorChecksSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlMonitorCheckListData }).pipe(
    $I.annoteSchema("FirecrawlListMonitorChecksSuccess", {
      description: "Decoded success value returned by Firecrawl listMonitorChecks.",
    })
  )
) {}
/**
 * Firecrawl List Monitor Checks Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log list monitor checks failure)
 *
 * ```ts
 * import { FirecrawlListMonitorChecksFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlListMonitorChecksFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlListMonitorChecksFailure extends S.Opaque<
  FirecrawlListMonitorChecksFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlListMonitorChecksFailure", {
      description: "Decoded failure shape returned by Firecrawl listMonitorChecks.",
    })
  )
) {}

/**
 * Firecrawl Get Monitor Check Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log get monitor check payload)
 *
 * ```ts
 * import { FirecrawlGetMonitorCheckPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetMonitorCheckPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetMonitorCheckPayload extends S.Opaque<
  FirecrawlGetMonitorCheckPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    checkId: S.String,
    monitorId: S.String,
    options: S.OptionFromOptionalKey(FirecrawlGetMonitorCheckOptions).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<GetMonitorCheckOptions>()))
    ),
  }).pipe(
    $I.annoteSchema("FirecrawlGetMonitorCheckPayload", {
      description: "Payload decoded before calling Firecrawl getMonitorCheck.",
    })
  )
) {}
/**
 * Firecrawl Get Monitor Check Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log get monitor check success)
 *
 * ```ts
 * import { FirecrawlGetMonitorCheckSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetMonitorCheckSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetMonitorCheckSuccess extends S.Opaque<
  FirecrawlGetMonitorCheckSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlMonitorCheckDetailData }).pipe(
    $I.annoteSchema("FirecrawlGetMonitorCheckSuccess", {
      description: "Decoded success value returned by Firecrawl getMonitorCheck.",
    })
  )
) {}
/**
 * Firecrawl Get Monitor Check Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log get monitor check failure)
 *
 * ```ts
 * import { FirecrawlGetMonitorCheckFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetMonitorCheckFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetMonitorCheckFailure extends S.Opaque<
  FirecrawlGetMonitorCheckFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlGetMonitorCheckFailure", {
      description: "Decoded failure shape returned by Firecrawl getMonitorCheck.",
    })
  )
) {}

/**
 * Firecrawl Start Batch Scrape Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log start batch scrape payload)
 *
 * ```ts
 * import { FirecrawlStartBatchScrapePayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlStartBatchScrapePayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlStartBatchScrapePayload extends S.Opaque<
  FirecrawlStartBatchScrapePayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    options: S.OptionFromOptionalKey(FirecrawlBatchScrapeOptions).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<BatchScrapeOptions>()))
    ),
    urls: S.Array(S.String),
  }).pipe(
    $I.annoteSchema("FirecrawlStartBatchScrapePayload", {
      description: "Payload decoded before calling Firecrawl startBatchScrape.",
    })
  )
) {}
/**
 * Firecrawl Start Batch Scrape Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log start batch scrape success)
 *
 * ```ts
 * import { FirecrawlStartBatchScrapeSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlStartBatchScrapeSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlStartBatchScrapeSuccess extends S.Opaque<
  FirecrawlStartBatchScrapeSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlBatchScrapeResponseData }).pipe(
    $I.annoteSchema("FirecrawlStartBatchScrapeSuccess", {
      description: "Decoded success value returned by Firecrawl startBatchScrape.",
    })
  )
) {}
/**
 * Firecrawl Start Batch Scrape Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log start batch scrape failure)
 *
 * ```ts
 * import { FirecrawlStartBatchScrapeFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlStartBatchScrapeFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlStartBatchScrapeFailure extends S.Opaque<
  FirecrawlStartBatchScrapeFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlStartBatchScrapeFailure", {
      description: "Decoded failure shape returned by Firecrawl startBatchScrape.",
    })
  )
) {}

/**
 * Firecrawl Get Batch Scrape Status Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log get batch scrape status payload)
 *
 * ```ts
 * import { FirecrawlGetBatchScrapeStatusPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetBatchScrapeStatusPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetBatchScrapeStatusPayload extends S.Opaque<
  FirecrawlGetBatchScrapeStatusPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    jobId: S.String,
    pagination: S.OptionFromOptionalKey(FirecrawlPaginationConfig).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<PaginationConfig>()))
    ),
  }).pipe(
    $I.annoteSchema("FirecrawlGetBatchScrapeStatusPayload", {
      description: "Payload decoded before calling Firecrawl getBatchScrapeStatus.",
    })
  )
) {}
/**
 * Firecrawl Get Batch Scrape Status Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log get batch scrape status success)
 *
 * ```ts
 * import { FirecrawlGetBatchScrapeStatusSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetBatchScrapeStatusSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetBatchScrapeStatusSuccess extends S.Opaque<
  FirecrawlGetBatchScrapeStatusSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlBatchScrapeJobData }).pipe(
    $I.annoteSchema("FirecrawlGetBatchScrapeStatusSuccess", {
      description: "Decoded success value returned by Firecrawl getBatchScrapeStatus.",
    })
  )
) {}
/**
 * Firecrawl Get Batch Scrape Status Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log get batch scrape status failure)
 *
 * ```ts
 * import { FirecrawlGetBatchScrapeStatusFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetBatchScrapeStatusFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetBatchScrapeStatusFailure extends S.Opaque<
  FirecrawlGetBatchScrapeStatusFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlGetBatchScrapeStatusFailure", {
      description: "Decoded failure shape returned by Firecrawl getBatchScrapeStatus.",
    })
  )
) {}

/**
 * Firecrawl Get Batch Scrape Errors Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log get batch scrape errors payload)
 *
 * ```ts
 * import { FirecrawlGetBatchScrapeErrorsPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetBatchScrapeErrorsPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetBatchScrapeErrorsPayload extends S.Opaque<
  FirecrawlGetBatchScrapeErrorsPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({ jobId: S.String }).pipe(
    $I.annoteSchema("FirecrawlGetBatchScrapeErrorsPayload", {
      description: "Payload decoded before calling Firecrawl getBatchScrapeErrors.",
    })
  )
) {}
/**
 * Firecrawl Get Batch Scrape Errors Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log get batch scrape errors success)
 *
 * ```ts
 * import { FirecrawlGetBatchScrapeErrorsSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetBatchScrapeErrorsSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetBatchScrapeErrorsSuccess extends S.Opaque<
  FirecrawlGetBatchScrapeErrorsSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlCrawlErrorsData }).pipe(
    $I.annoteSchema("FirecrawlGetBatchScrapeErrorsSuccess", {
      description: "Decoded success value returned by Firecrawl getBatchScrapeErrors.",
    })
  )
) {}
/**
 * Firecrawl Get Batch Scrape Errors Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log get batch scrape errors failure)
 *
 * ```ts
 * import { FirecrawlGetBatchScrapeErrorsFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetBatchScrapeErrorsFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetBatchScrapeErrorsFailure extends S.Opaque<
  FirecrawlGetBatchScrapeErrorsFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlGetBatchScrapeErrorsFailure", {
      description: "Decoded failure shape returned by Firecrawl getBatchScrapeErrors.",
    })
  )
) {}

/**
 * Firecrawl Cancel Batch Scrape Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log cancel batch scrape payload)
 *
 * ```ts
 * import { FirecrawlCancelBatchScrapePayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCancelBatchScrapePayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlCancelBatchScrapePayload extends S.Opaque<
  FirecrawlCancelBatchScrapePayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({ jobId: S.String }).pipe(
    $I.annoteSchema("FirecrawlCancelBatchScrapePayload", {
      description: "Payload decoded before calling Firecrawl cancelBatchScrape.",
    })
  )
) {}
/**
 * Firecrawl Cancel Batch Scrape Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log cancel batch scrape success)
 *
 * ```ts
 * import { FirecrawlCancelBatchScrapeSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCancelBatchScrapeSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlCancelBatchScrapeSuccess extends S.Opaque<
  FirecrawlCancelBatchScrapeSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ cancelled: S.Boolean }).pipe(
    $I.annoteSchema("FirecrawlCancelBatchScrapeSuccess", {
      description: "Decoded success value returned by Firecrawl cancelBatchScrape.",
    })
  )
) {}
/**
 * Firecrawl Cancel Batch Scrape Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log cancel batch scrape failure)
 *
 * ```ts
 * import { FirecrawlCancelBatchScrapeFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCancelBatchScrapeFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlCancelBatchScrapeFailure extends S.Opaque<
  FirecrawlCancelBatchScrapeFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlCancelBatchScrapeFailure", {
      description: "Decoded failure shape returned by Firecrawl cancelBatchScrape.",
    })
  )
) {}

/**
 * Firecrawl Batch Scrape Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log batch scrape payload)
 *
 * ```ts
 * import { FirecrawlBatchScrapePayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlBatchScrapePayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlBatchScrapePayload extends S.Opaque<
  FirecrawlBatchScrapePayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    options: S.OptionFromOptionalKey(FirecrawlBatchScrapeWaitOptions).pipe(
      S.withConstructorDefault(
        Effect.succeed(O.none<BatchScrapeOptions & { readonly pollInterval?: number; readonly timeout?: number }>())
      )
    ),
    urls: S.Array(S.String),
  }).pipe(
    $I.annoteSchema("FirecrawlBatchScrapePayload", {
      description: "Payload decoded before calling Firecrawl batchScrape.",
    })
  )
) {}
/**
 * Firecrawl Batch Scrape Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log batch scrape success)
 *
 * ```ts
 * import { FirecrawlBatchScrapeSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlBatchScrapeSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlBatchScrapeSuccess extends S.Opaque<
  FirecrawlBatchScrapeSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlBatchScrapeJobData }).pipe(
    $I.annoteSchema("FirecrawlBatchScrapeSuccess", {
      description: "Decoded success value returned by Firecrawl batchScrape.",
    })
  )
) {}
/**
 * Firecrawl Batch Scrape Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log batch scrape failure)
 *
 * ```ts
 * import { FirecrawlBatchScrapeFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlBatchScrapeFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlBatchScrapeFailure extends S.Opaque<
  FirecrawlBatchScrapeFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlBatchScrapeFailure", {
      description: "Decoded failure shape returned by Firecrawl batchScrape.",
    })
  )
) {}

/**
 * Firecrawl Start Agent Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log start agent payload)
 *
 * ```ts
 * import { FirecrawlStartAgentPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlStartAgentPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlStartAgentPayload extends S.Opaque<
  FirecrawlStartAgentPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({ request: FirecrawlAgentRequest }).pipe(
    $I.annoteSchema("FirecrawlStartAgentPayload", {
      description: "Payload decoded before calling Firecrawl startAgent.",
    })
  )
) {}
/**
 * Firecrawl Start Agent Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log start agent success)
 *
 * ```ts
 * import { FirecrawlStartAgentSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlStartAgentSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlStartAgentSuccess extends S.Opaque<
  FirecrawlStartAgentSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlAgentResponseData }).pipe(
    $I.annoteSchema("FirecrawlStartAgentSuccess", {
      description: "Decoded success value returned by Firecrawl startAgent.",
    })
  )
) {}
/**
 * Firecrawl Start Agent Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log start agent failure)
 *
 * ```ts
 * import { FirecrawlStartAgentFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlStartAgentFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlStartAgentFailure extends S.Opaque<
  FirecrawlStartAgentFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlStartAgentFailure", {
      description: "Decoded failure shape returned by Firecrawl startAgent.",
    })
  )
) {}

/**
 * Firecrawl Get Agent Status Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log get agent status payload)
 *
 * ```ts
 * import { FirecrawlGetAgentStatusPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetAgentStatusPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetAgentStatusPayload extends S.Opaque<
  FirecrawlGetAgentStatusPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({ jobId: S.String }).pipe(
    $I.annoteSchema("FirecrawlGetAgentStatusPayload", {
      description: "Payload decoded before calling Firecrawl getAgentStatus.",
    })
  )
) {}
/**
 * Firecrawl Get Agent Status Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log get agent status success)
 *
 * ```ts
 * import { FirecrawlGetAgentStatusSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetAgentStatusSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetAgentStatusSuccess extends S.Opaque<
  FirecrawlGetAgentStatusSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlAgentStatusData }).pipe(
    $I.annoteSchema("FirecrawlGetAgentStatusSuccess", {
      description: "Decoded success value returned by Firecrawl getAgentStatus.",
    })
  )
) {}
/**
 * Firecrawl Get Agent Status Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log get agent status failure)
 *
 * ```ts
 * import { FirecrawlGetAgentStatusFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetAgentStatusFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetAgentStatusFailure extends S.Opaque<
  FirecrawlGetAgentStatusFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlGetAgentStatusFailure", {
      description: "Decoded failure shape returned by Firecrawl getAgentStatus.",
    })
  )
) {}

/**
 * Firecrawl Agent Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log agent payload schema)
 *
 * ```ts
 * import { FirecrawlAgentPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlAgentPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlAgentPayload extends S.Opaque<FirecrawlAgentPayload, { readonly brand: unique symbol }>()(
  S.Struct({ request: FirecrawlAgentWaitRequest }).pipe(
    $I.annoteSchema("FirecrawlAgentPayload", { description: "Payload decoded before calling Firecrawl agent." })
  )
) {}
/**
 * Firecrawl Agent Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log agent success schema)
 *
 * ```ts
 * import { FirecrawlAgentSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlAgentSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlAgentSuccess extends S.Opaque<FirecrawlAgentSuccess, { readonly brand: unique symbol }>()(
  S.Struct({ data: FirecrawlAgentStatusData }).pipe(
    $I.annoteSchema("FirecrawlAgentSuccess", { description: "Decoded success value returned by Firecrawl agent." })
  )
) {}
/**
 * Firecrawl Agent Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log agent failure schema)
 *
 * ```ts
 * import { FirecrawlAgentFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlAgentFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlAgentFailure extends S.Opaque<FirecrawlAgentFailure, { readonly brand: unique symbol }>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlAgentFailure", { description: "Decoded failure shape returned by Firecrawl agent." })
  )
) {}

/**
 * Firecrawl Cancel Agent Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log cancel agent payload)
 *
 * ```ts
 * import { FirecrawlCancelAgentPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCancelAgentPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlCancelAgentPayload extends S.Opaque<
  FirecrawlCancelAgentPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({ jobId: S.String }).pipe(
    $I.annoteSchema("FirecrawlCancelAgentPayload", {
      description: "Payload decoded before calling Firecrawl cancelAgent.",
    })
  )
) {}
/**
 * Firecrawl Cancel Agent Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log cancel agent success)
 *
 * ```ts
 * import { FirecrawlCancelAgentSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCancelAgentSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlCancelAgentSuccess extends S.Opaque<
  FirecrawlCancelAgentSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ cancelled: S.Boolean }).pipe(
    $I.annoteSchema("FirecrawlCancelAgentSuccess", {
      description: "Decoded success value returned by Firecrawl cancelAgent.",
    })
  )
) {}
/**
 * Firecrawl Cancel Agent Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log cancel agent failure)
 *
 * ```ts
 * import { FirecrawlCancelAgentFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlCancelAgentFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlCancelAgentFailure extends S.Opaque<
  FirecrawlCancelAgentFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlCancelAgentFailure", {
      description: "Decoded failure shape returned by Firecrawl cancelAgent.",
    })
  )
) {}

/**
 * Firecrawl Browser Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log browser payload schema)
 *
 * ```ts
 * import { FirecrawlBrowserPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlBrowserPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlBrowserPayload extends S.Opaque<FirecrawlBrowserPayload, { readonly brand: unique symbol }>()(
  S.Struct({
    options: S.OptionFromOptionalKey(FirecrawlBrowserOptions).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<FirecrawlBrowserOptions>()))
    ),
  }).pipe(
    $I.annoteSchema("FirecrawlBrowserPayload", { description: "Payload decoded before calling Firecrawl browser." })
  )
) {}
/**
 * Firecrawl Browser Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log browser success schema)
 *
 * ```ts
 * import { FirecrawlBrowserSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlBrowserSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlBrowserSuccess extends S.Opaque<FirecrawlBrowserSuccess, { readonly brand: unique symbol }>()(
  S.Struct({ data: FirecrawlBrowserCreateData }).pipe(
    $I.annoteSchema("FirecrawlBrowserSuccess", { description: "Decoded success value returned by Firecrawl browser." })
  )
) {}
/**
 * Firecrawl Browser Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log browser failure schema)
 *
 * ```ts
 * import { FirecrawlBrowserFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlBrowserFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlBrowserFailure extends S.Opaque<FirecrawlBrowserFailure, { readonly brand: unique symbol }>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlBrowserFailure", { description: "Decoded failure shape returned by Firecrawl browser." })
  )
) {}

/**
 * Firecrawl Browser Execute Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log browser execute payload)
 *
 * ```ts
 * import { FirecrawlBrowserExecutePayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlBrowserExecutePayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlBrowserExecutePayload extends S.Opaque<
  FirecrawlBrowserExecutePayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({ request: FirecrawlBrowserExecuteRequest, sessionId: S.String }).pipe(
    $I.annoteSchema("FirecrawlBrowserExecutePayload", {
      description: "Payload decoded before calling Firecrawl browserExecute.",
    })
  )
) {}
/**
 * Firecrawl Browser Execute Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log browser execute success)
 *
 * ```ts
 * import { FirecrawlBrowserExecuteSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlBrowserExecuteSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlBrowserExecuteSuccess extends S.Opaque<
  FirecrawlBrowserExecuteSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlBrowserExecuteData }).pipe(
    $I.annoteSchema("FirecrawlBrowserExecuteSuccess", {
      description: "Decoded success value returned by Firecrawl browserExecute.",
    })
  )
) {}
/**
 * Firecrawl Browser Execute Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log browser execute failure)
 *
 * ```ts
 * import { FirecrawlBrowserExecuteFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlBrowserExecuteFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlBrowserExecuteFailure extends S.Opaque<
  FirecrawlBrowserExecuteFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlBrowserExecuteFailure", {
      description: "Decoded failure shape returned by Firecrawl browserExecute.",
    })
  )
) {}

/**
 * Firecrawl Delete Browser Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log delete browser payload)
 *
 * ```ts
 * import { FirecrawlDeleteBrowserPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlDeleteBrowserPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlDeleteBrowserPayload extends S.Opaque<
  FirecrawlDeleteBrowserPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({ sessionId: S.String }).pipe(
    $I.annoteSchema("FirecrawlDeleteBrowserPayload", {
      description: "Payload decoded before calling Firecrawl deleteBrowser.",
    })
  )
) {}
/**
 * Firecrawl Delete Browser Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log delete browser success)
 *
 * ```ts
 * import { FirecrawlDeleteBrowserSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlDeleteBrowserSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlDeleteBrowserSuccess extends S.Opaque<
  FirecrawlDeleteBrowserSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlBrowserDeleteData }).pipe(
    $I.annoteSchema("FirecrawlDeleteBrowserSuccess", {
      description: "Decoded success value returned by Firecrawl deleteBrowser.",
    })
  )
) {}
/**
 * Firecrawl Delete Browser Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log delete browser failure)
 *
 * ```ts
 * import { FirecrawlDeleteBrowserFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlDeleteBrowserFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlDeleteBrowserFailure extends S.Opaque<
  FirecrawlDeleteBrowserFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlDeleteBrowserFailure", {
      description: "Decoded failure shape returned by Firecrawl deleteBrowser.",
    })
  )
) {}

/**
 * Firecrawl List Browsers Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log list browsers payload)
 *
 * ```ts
 * import { FirecrawlListBrowsersPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlListBrowsersPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlListBrowsersPayload extends S.Opaque<
  FirecrawlListBrowsersPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    options: S.OptionFromOptionalKey(FirecrawlListBrowsersOptions).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<FirecrawlListBrowsersOptions>()))
    ),
  }).pipe(
    $I.annoteSchema("FirecrawlListBrowsersPayload", {
      description: "Payload decoded before calling Firecrawl listBrowsers.",
    })
  )
) {}
/**
 * Firecrawl List Browsers Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log list browsers success)
 *
 * ```ts
 * import { FirecrawlListBrowsersSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlListBrowsersSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlListBrowsersSuccess extends S.Opaque<
  FirecrawlListBrowsersSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlBrowserListData }).pipe(
    $I.annoteSchema("FirecrawlListBrowsersSuccess", {
      description: "Decoded success value returned by Firecrawl listBrowsers.",
    })
  )
) {}
/**
 * Firecrawl List Browsers Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log list browsers failure)
 *
 * ```ts
 * import { FirecrawlListBrowsersFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlListBrowsersFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlListBrowsersFailure extends S.Opaque<
  FirecrawlListBrowsersFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlListBrowsersFailure", {
      description: "Decoded failure shape returned by Firecrawl listBrowsers.",
    })
  )
) {}

/**
 * Firecrawl Get Concurrency Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log get concurrency payload)
 *
 * ```ts
 * import { FirecrawlGetConcurrencyPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetConcurrencyPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetConcurrencyPayload extends S.Opaque<
  FirecrawlGetConcurrencyPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({}).pipe(
    $I.annoteSchema("FirecrawlGetConcurrencyPayload", {
      description: "Payload decoded before calling Firecrawl getConcurrency.",
    })
  )
) {}
/**
 * Firecrawl Get Concurrency Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log get concurrency success)
 *
 * ```ts
 * import { FirecrawlGetConcurrencySuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetConcurrencySuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetConcurrencySuccess extends S.Opaque<
  FirecrawlGetConcurrencySuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlConcurrencyData }).pipe(
    $I.annoteSchema("FirecrawlGetConcurrencySuccess", {
      description: "Decoded success value returned by Firecrawl getConcurrency.",
    })
  )
) {}
/**
 * Firecrawl Get Concurrency Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log get concurrency failure)
 *
 * ```ts
 * import { FirecrawlGetConcurrencyFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetConcurrencyFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetConcurrencyFailure extends S.Opaque<
  FirecrawlGetConcurrencyFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlGetConcurrencyFailure", {
      description: "Decoded failure shape returned by Firecrawl getConcurrency.",
    })
  )
) {}

/**
 * Firecrawl Get Credit Usage Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log get credit usage payload)
 *
 * ```ts
 * import { FirecrawlGetCreditUsagePayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetCreditUsagePayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetCreditUsagePayload extends S.Opaque<
  FirecrawlGetCreditUsagePayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({}).pipe(
    $I.annoteSchema("FirecrawlGetCreditUsagePayload", {
      description: "Payload decoded before calling Firecrawl getCreditUsage.",
    })
  )
) {}
/**
 * Firecrawl Get Credit Usage Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log get credit usage success)
 *
 * ```ts
 * import { FirecrawlGetCreditUsageSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetCreditUsageSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetCreditUsageSuccess extends S.Opaque<
  FirecrawlGetCreditUsageSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlCreditUsageData }).pipe(
    $I.annoteSchema("FirecrawlGetCreditUsageSuccess", {
      description: "Decoded success value returned by Firecrawl getCreditUsage.",
    })
  )
) {}
/**
 * Firecrawl Get Credit Usage Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log get credit usage failure)
 *
 * ```ts
 * import { FirecrawlGetCreditUsageFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetCreditUsageFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetCreditUsageFailure extends S.Opaque<
  FirecrawlGetCreditUsageFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlGetCreditUsageFailure", {
      description: "Decoded failure shape returned by Firecrawl getCreditUsage.",
    })
  )
) {}

/**
 * Firecrawl Get Token Usage Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log get token usage payload)
 *
 * ```ts
 * import { FirecrawlGetTokenUsagePayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetTokenUsagePayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetTokenUsagePayload extends S.Opaque<
  FirecrawlGetTokenUsagePayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({}).pipe(
    $I.annoteSchema("FirecrawlGetTokenUsagePayload", {
      description: "Payload decoded before calling Firecrawl getTokenUsage.",
    })
  )
) {}
/**
 * Firecrawl Get Token Usage Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log get token usage success)
 *
 * ```ts
 * import { FirecrawlGetTokenUsageSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetTokenUsageSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetTokenUsageSuccess extends S.Opaque<
  FirecrawlGetTokenUsageSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlTokenUsageData }).pipe(
    $I.annoteSchema("FirecrawlGetTokenUsageSuccess", {
      description: "Decoded success value returned by Firecrawl getTokenUsage.",
    })
  )
) {}
/**
 * Firecrawl Get Token Usage Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log get token usage failure)
 *
 * ```ts
 * import { FirecrawlGetTokenUsageFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetTokenUsageFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetTokenUsageFailure extends S.Opaque<
  FirecrawlGetTokenUsageFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlGetTokenUsageFailure", {
      description: "Decoded failure shape returned by Firecrawl getTokenUsage.",
    })
  )
) {}

/**
 * Firecrawl Get Credit Usage Historical Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log historical credit usage payload)
 *
 * ```ts
 * import { FirecrawlGetCreditUsageHistoricalPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetCreditUsageHistoricalPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetCreditUsageHistoricalPayload extends S.Opaque<
  FirecrawlGetCreditUsageHistoricalPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({ byApiKey: optionalBoolean }).pipe(
    $I.annoteSchema("FirecrawlGetCreditUsageHistoricalPayload", {
      description: "Payload decoded before calling Firecrawl getCreditUsageHistorical.",
    })
  )
) {}
/**
 * Firecrawl Get Credit Usage Historical Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log historical credit usage success)
 *
 * ```ts
 * import { FirecrawlGetCreditUsageHistoricalSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetCreditUsageHistoricalSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetCreditUsageHistoricalSuccess extends S.Opaque<
  FirecrawlGetCreditUsageHistoricalSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlCreditUsageHistoricalData }).pipe(
    $I.annoteSchema("FirecrawlGetCreditUsageHistoricalSuccess", {
      description: "Decoded success value returned by Firecrawl getCreditUsageHistorical.",
    })
  )
) {}
/**
 * Firecrawl Get Credit Usage Historical Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log historical credit usage failure)
 *
 * ```ts
 * import { FirecrawlGetCreditUsageHistoricalFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetCreditUsageHistoricalFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetCreditUsageHistoricalFailure extends S.Opaque<
  FirecrawlGetCreditUsageHistoricalFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlGetCreditUsageHistoricalFailure", {
      description: "Decoded failure shape returned by Firecrawl getCreditUsageHistorical.",
    })
  )
) {}

/**
 * Firecrawl Get Token Usage Historical Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log historical token usage payload)
 *
 * ```ts
 * import { FirecrawlGetTokenUsageHistoricalPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetTokenUsageHistoricalPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetTokenUsageHistoricalPayload extends S.Opaque<
  FirecrawlGetTokenUsageHistoricalPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({ byApiKey: optionalBoolean }).pipe(
    $I.annoteSchema("FirecrawlGetTokenUsageHistoricalPayload", {
      description: "Payload decoded before calling Firecrawl getTokenUsageHistorical.",
    })
  )
) {}
/**
 * Firecrawl Get Token Usage Historical Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log historical token usage success)
 *
 * ```ts
 * import { FirecrawlGetTokenUsageHistoricalSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetTokenUsageHistoricalSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetTokenUsageHistoricalSuccess extends S.Opaque<
  FirecrawlGetTokenUsageHistoricalSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlTokenUsageHistoricalData }).pipe(
    $I.annoteSchema("FirecrawlGetTokenUsageHistoricalSuccess", {
      description: "Decoded success value returned by Firecrawl getTokenUsageHistorical.",
    })
  )
) {}
/**
 * Firecrawl Get Token Usage Historical Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log historical token usage failure)
 *
 * ```ts
 * import { FirecrawlGetTokenUsageHistoricalFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetTokenUsageHistoricalFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetTokenUsageHistoricalFailure extends S.Opaque<
  FirecrawlGetTokenUsageHistoricalFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlGetTokenUsageHistoricalFailure", {
      description: "Decoded failure shape returned by Firecrawl getTokenUsageHistorical.",
    })
  )
) {}

/**
 * Firecrawl Get Queue Status Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log get queue status payload)
 *
 * ```ts
 * import { FirecrawlGetQueueStatusPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetQueueStatusPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetQueueStatusPayload extends S.Opaque<
  FirecrawlGetQueueStatusPayload,
  { readonly brand: unique symbol }
>()(
  S.Struct({}).pipe(
    $I.annoteSchema("FirecrawlGetQueueStatusPayload", {
      description: "Payload decoded before calling Firecrawl getQueueStatus.",
    })
  )
) {}
/**
 * Firecrawl Get Queue Status Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log get queue status success)
 *
 * ```ts
 * import { FirecrawlGetQueueStatusSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetQueueStatusSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetQueueStatusSuccess extends S.Opaque<
  FirecrawlGetQueueStatusSuccess,
  { readonly brand: unique symbol }
>()(
  S.Struct({ data: FirecrawlQueueStatusData }).pipe(
    $I.annoteSchema("FirecrawlGetQueueStatusSuccess", {
      description: "Decoded success value returned by Firecrawl getQueueStatus.",
    })
  )
) {}
/**
 * Firecrawl Get Queue Status Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log get queue status failure)
 *
 * ```ts
 * import { FirecrawlGetQueueStatusFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlGetQueueStatusFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlGetQueueStatusFailure extends S.Opaque<
  FirecrawlGetQueueStatusFailure,
  { readonly brand: unique symbol }
>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlGetQueueStatusFailure", {
      description: "Decoded failure shape returned by Firecrawl getQueueStatus.",
    })
  )
) {}

/**
 * Firecrawl Watcher Payload decoded before calling the Firecrawl SDK.
 *
 * **Example** (Log watcher payload schema)
 *
 * ```ts
 * import { FirecrawlWatcherPayload } from "@beep/firecrawl"
 *
 * console.log(FirecrawlWatcherPayload)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlWatcherPayload extends S.Opaque<FirecrawlWatcherPayload, { readonly brand: unique symbol }>()(
  S.Struct({
    jobId: S.String,
    options: S.OptionFromOptionalKey(FirecrawlWatcherOptions).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<WatcherOptions>()))
    ),
  }).pipe(
    $I.annoteSchema("FirecrawlWatcherPayload", {
      description: "Payload decoded before constructing a Firecrawl watcher stream.",
    })
  )
) {}
/**
 * Firecrawl Watcher Success decoded after a successful Firecrawl SDK call.
 *
 * **Example** (Log watcher success schema)
 *
 * ```ts
 * import { FirecrawlWatcherSuccess } from "@beep/firecrawl"
 *
 * console.log(FirecrawlWatcherSuccess)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlWatcherSuccess extends S.Opaque<FirecrawlWatcherSuccess, { readonly brand: unique symbol }>()(
  S.Struct({ jobId: S.String }).pipe(
    $I.annoteSchema("FirecrawlWatcherSuccess", {
      description: "Decoded success value for Firecrawl watcher construction.",
    })
  )
) {}
/**
 * Firecrawl Watcher Failure decoded from a Firecrawl API failure body.
 *
 * **Example** (Log watcher failure schema)
 *
 * ```ts
 * import { FirecrawlWatcherFailure } from "@beep/firecrawl"
 *
 * console.log(FirecrawlWatcherFailure)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FirecrawlWatcherFailure extends S.Opaque<FirecrawlWatcherFailure, { readonly brand: unique symbol }>()(
  S.Struct(failureFields).pipe(
    $I.annoteSchema("FirecrawlWatcherFailure", {
      description: "Decoded failure shape emitted while constructing or running a Firecrawl watcher.",
    })
  )
) {}

/**
 * Firecrawl Watcher Document Event watcher event schema.
 *
 * **Example** (Log watcher document event)
 *
 * ```ts
 * import { FirecrawlWatcherDocumentEvent } from "@beep/firecrawl"
 *
 * console.log(FirecrawlWatcherDocumentEvent)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class FirecrawlWatcherDocumentEvent extends S.Opaque<
  FirecrawlWatcherDocumentEvent,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    document: FirecrawlDocument,
    id: optionalString,
    type: S.tag("document"),
  }).pipe($I.annoteSchema("FirecrawlWatcherDocumentEvent", { description: "Firecrawl watcher document event." }))
) {}

/**
 * Firecrawl Watcher Snapshot Event watcher event schema.
 *
 * **Example** (Log watcher snapshot event)
 *
 * ```ts
 * import { FirecrawlWatcherSnapshotEvent } from "@beep/firecrawl"
 *
 * console.log(FirecrawlWatcherSnapshotEvent)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class FirecrawlWatcherSnapshotEvent extends S.Opaque<
  FirecrawlWatcherSnapshotEvent,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    snapshot: S.Unknown,
    type: S.tag("snapshot"),
  }).pipe($I.annoteSchema("FirecrawlWatcherSnapshotEvent", { description: "Firecrawl watcher snapshot event." }))
) {}

/**
 * Firecrawl Watcher Done Event watcher event schema.
 *
 * **Example** (Log watcher done event)
 *
 * ```ts
 * import { FirecrawlWatcherDoneEvent } from "@beep/firecrawl"
 *
 * console.log(FirecrawlWatcherDoneEvent)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class FirecrawlWatcherDoneEvent extends S.Opaque<FirecrawlWatcherDoneEvent, { readonly brand: unique symbol }>()(
  S.Struct({
    completed: optionalNumber,
    creditsUsed: optionalNumber,
    data: S.OptionFromOptionalKey(FirecrawlDocument.pipe(S.Array)).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<ReadonlyArray<FirecrawlDocument>>()))
    ),
    id: optionalString,
    status: optionalString,
    total: optionalNumber,
    type: S.tag("done"),
  }).pipe($I.annoteSchema("FirecrawlWatcherDoneEvent", { description: "Firecrawl watcher terminal done event." }))
) {}

/**
 * Firecrawl Watcher Error Event watcher event schema.
 *
 * **Example** (Log watcher error event)
 *
 * ```ts
 * import { FirecrawlWatcherErrorEvent } from "@beep/firecrawl"
 *
 * console.log(FirecrawlWatcherErrorEvent)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class FirecrawlWatcherErrorEvent extends S.Opaque<
  FirecrawlWatcherErrorEvent,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    error: S.String,
    id: optionalString,
    status: optionalString,
    type: S.tag("error"),
  }).pipe($I.annoteSchema("FirecrawlWatcherErrorEvent", { description: "Firecrawl watcher error event." }))
) {}

/**
 * Tagged Firecrawl watcher event union.
 *
 * **Example** (Make document watcher event)
 *
 * ```ts
 * import { FirecrawlWatcherDocumentEvent } from "@beep/firecrawl"
 *
 * const event = FirecrawlWatcherDocumentEvent.make({
 *   document: {},
 *   type: "document"
 * })
 *
 * console.log(event.type)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FirecrawlWatcherEvent = S.Union([
  FirecrawlWatcherDocumentEvent,
  FirecrawlWatcherSnapshotEvent,
  FirecrawlWatcherDoneEvent,
  FirecrawlWatcherErrorEvent,
]).pipe(
  S.toTaggedUnion("type"),
  $I.annoteSchema("FirecrawlWatcherEvent", {
    description: "Tagged Firecrawl watcher event union decoded from SDK watcher events.",
  })
);

/**
 * Type for {@link FirecrawlWatcherEvent}.
 *
 * **Example** (Handle watcher event type)
 *
 * ```ts
 * import type { FirecrawlWatcherEvent } from "@beep/firecrawl"
 *
 * const handle = (event: FirecrawlWatcherEvent) => event.type
 * console.log(handle)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FirecrawlWatcherEvent = typeof FirecrawlWatcherEvent.Type;
