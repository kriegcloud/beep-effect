/**
 * Schema-first Microsoft 365 MCP tool declarations.
 *
 * @remarks
 * The toolkit mirrors the read side of `@beep/m365`. No write, mutation, or
 * ingestion verbs are exposed here.
 *
 * @category tools
 * @since 0.1.0
 */

import { $M365McpId } from "@beep/identity/packages";
import {
  GraphEvent,
  GraphListItem,
  GraphMessage,
  GraphSite,
  M365DeltaDriveItemsRequest,
  M365DownloadDriveItemContentRequest,
  M365DriveCollection,
  M365DriveItemCollection,
  M365DriveItemDownload,
  M365DriveItemVersionCollection,
  M365EventCollection,
  M365GetEventRequest,
  M365GetListItemRequest,
  M365GetMessageRequest,
  M365GetSiteRequest,
  M365ListDriveItemVersionsRequest,
  M365ListDrivesRequest,
  M365ListEventsRequest,
  M365ListMessagesRequest,
  M365ListSitesRequest,
  M365MessageCollection,
  M365SiteCollection,
} from "@beep/m365";
import * as S from "effect/Schema";
import { Tool, Toolkit } from "effect/unstable/ai";

const $I = $M365McpId.create("M365Tools");

/**
 * Structured failure returned by Microsoft 365 MCP tools.
 *
 * @example
 * ```ts
 * import { M365ToolError } from "@beep/m365-mcp"
 *
 * const failure = M365ToolError.make({
 *   message: "Microsoft 365 listDrives failed: throttled",
 *   operation: "listDrives",
 *   reason: "throttled",
 *   retryable: true,
 *   toolName: "m365_list_drives"
 * })
 *
 * console.log(failure.retryable)
 * // true
 * ```
 *
 * @category tool-schemas
 * @since 0.1.0
 */
export class M365ToolError extends S.Class<M365ToolError>($I`M365ToolError`)(
  {
    message: S.String.annotateKey({
      description: "Human-readable failure message safe to return to an MCP tool caller.",
    }),
    operation: S.String.annotateKey({
      description: "Driver operation that failed.",
    }),
    reason: S.optionalKey(S.String).annotateKey({
      description: "Stable failure category or driver error reason.",
    }),
    retryable: S.Boolean.annotateKey({
      description: "Whether retrying the same tool call may reasonably succeed.",
    }),
    toolName: S.String.annotateKey({
      description: "MCP tool that returned the failure.",
    }),
  },
  $I.annote("M365ToolError", {
    description: "Structured Microsoft 365 MCP tool failure with retry metadata.",
  })
) {}

/**
 * Lists SharePoint and OneDrive drives visible through the configured tenant.
 *
 * @category tools
 * @since 0.1.0
 */
export const M365ListDrivesTool = Tool.make("m365_list_drives", {
  description: "List Microsoft 365 drives for an optional site.",
  failure: M365ToolError,
  failureMode: "return",
  parameters: M365ListDrivesRequest,
  success: M365DriveCollection,
})
  .annotate(Tool.Readonly, true)
  .annotate(Tool.Destructive, false)
  .annotate(Tool.Idempotent, true)
  .annotate(Tool.OpenWorld, true);

/**
 * Lists SharePoint sites visible through the configured tenant.
 *
 * @category tools
 * @since 0.1.0
 */
export const M365ListSitesTool = Tool.make("m365_list_sites", {
  description: "List Microsoft 365 SharePoint sites.",
  failure: M365ToolError,
  failureMode: "return",
  parameters: M365ListSitesRequest,
  success: M365SiteCollection,
})
  .annotate(Tool.Readonly, true)
  .annotate(Tool.Destructive, false)
  .annotate(Tool.Idempotent, true)
  .annotate(Tool.OpenWorld, true);

/**
 * Loads a single SharePoint site by id or path.
 *
 * @category tools
 * @since 0.1.0
 */
export const M365GetSiteTool = Tool.make("m365_get_site", {
  description: "Get a Microsoft 365 SharePoint site.",
  failure: M365ToolError,
  failureMode: "return",
  parameters: M365GetSiteRequest,
  success: GraphSite,
})
  .annotate(Tool.Readonly, true)
  .annotate(Tool.Destructive, false)
  .annotate(Tool.Idempotent, true)
  .annotate(Tool.OpenWorld, true);

/**
 * Reads a drive delta feed for changed drive items.
 *
 * @category tools
 * @since 0.1.0
 */
export const M365DeltaDriveItemsTool = Tool.make("m365_delta_drive_items", {
  description: "Read Microsoft 365 drive item delta changes.",
  failure: M365ToolError,
  failureMode: "return",
  parameters: M365DeltaDriveItemsRequest,
  success: M365DriveItemCollection,
})
  .annotate(Tool.Readonly, true)
  .annotate(Tool.Destructive, false)
  .annotate(Tool.Idempotent, true)
  .annotate(Tool.OpenWorld, true);

/**
 * Downloads drive item bytes or reports that an encrypted item was skipped.
 *
 * @category tools
 * @since 0.1.0
 */
export const M365DownloadDriveItemContentTool = Tool.make("m365_download_drive_item_content", {
  description: "Download Microsoft 365 drive item content bytes.",
  failure: M365ToolError,
  failureMode: "return",
  parameters: M365DownloadDriveItemContentRequest,
  success: M365DriveItemDownload,
})
  .annotate(Tool.Readonly, true)
  .annotate(Tool.Destructive, false)
  .annotate(Tool.Idempotent, true)
  .annotate(Tool.OpenWorld, true);

/**
 * Loads a drive item's SharePoint list item fields.
 *
 * @category tools
 * @since 0.1.0
 */
export const M365GetListItemTool = Tool.make("m365_get_list_item", {
  description: "Get Microsoft 365 list item fields for a drive item.",
  failure: M365ToolError,
  failureMode: "return",
  parameters: M365GetListItemRequest,
  success: GraphListItem,
})
  .annotate(Tool.Readonly, true)
  .annotate(Tool.Destructive, false)
  .annotate(Tool.Idempotent, true)
  .annotate(Tool.OpenWorld, true);

/**
 * Lists versions for a drive item.
 *
 * @category tools
 * @since 0.1.0
 */
export const M365ListDriveItemVersionsTool = Tool.make("m365_list_drive_item_versions", {
  description: "List Microsoft 365 drive item versions.",
  failure: M365ToolError,
  failureMode: "return",
  parameters: M365ListDriveItemVersionsRequest,
  success: M365DriveItemVersionCollection,
})
  .annotate(Tool.Readonly, true)
  .annotate(Tool.Destructive, false)
  .annotate(Tool.Idempotent, true)
  .annotate(Tool.OpenWorld, true);

/**
 * Lists Outlook mail messages.
 *
 * @category tools
 * @since 0.1.0
 */
export const M365ListMessagesTool = Tool.make("m365_list_messages", {
  description: "List Microsoft 365 Outlook mail messages.",
  failure: M365ToolError,
  failureMode: "return",
  parameters: M365ListMessagesRequest,
  success: M365MessageCollection,
})
  .annotate(Tool.Readonly, true)
  .annotate(Tool.Destructive, false)
  .annotate(Tool.Idempotent, true)
  .annotate(Tool.OpenWorld, true);

/**
 * Loads a single Outlook mail message.
 *
 * @category tools
 * @since 0.1.0
 */
export const M365GetMessageTool = Tool.make("m365_get_message", {
  description: "Get a Microsoft 365 Outlook mail message.",
  failure: M365ToolError,
  failureMode: "return",
  parameters: M365GetMessageRequest,
  success: GraphMessage,
})
  .annotate(Tool.Readonly, true)
  .annotate(Tool.Destructive, false)
  .annotate(Tool.Idempotent, true)
  .annotate(Tool.OpenWorld, true);

/**
 * Lists Outlook calendar events.
 *
 * @category tools
 * @since 0.1.0
 */
export const M365ListEventsTool = Tool.make("m365_list_events", {
  description: "List Microsoft 365 Outlook calendar events.",
  failure: M365ToolError,
  failureMode: "return",
  parameters: M365ListEventsRequest,
  success: M365EventCollection,
})
  .annotate(Tool.Readonly, true)
  .annotate(Tool.Destructive, false)
  .annotate(Tool.Idempotent, true)
  .annotate(Tool.OpenWorld, true);

/**
 * Loads a single Outlook calendar event.
 *
 * @category tools
 * @since 0.1.0
 */
export const M365GetEventTool = Tool.make("m365_get_event", {
  description: "Get a Microsoft 365 Outlook calendar event.",
  failure: M365ToolError,
  failureMode: "return",
  parameters: M365GetEventRequest,
  success: GraphEvent,
})
  .annotate(Tool.Readonly, true)
  .annotate(Tool.Destructive, false)
  .annotate(Tool.Idempotent, true)
  .annotate(Tool.OpenWorld, true);

/**
 * Read-only Microsoft 365 MCP toolkit.
 *
 * @category tools
 * @since 0.1.0
 */
export const M365Toolkit = Toolkit.make(
  M365ListDrivesTool,
  M365ListSitesTool,
  M365GetSiteTool,
  M365DeltaDriveItemsTool,
  M365DownloadDriveItemContentTool,
  M365GetListItemTool,
  M365ListDriveItemVersionsTool,
  M365ListMessagesTool,
  M365GetMessageTool,
  M365ListEventsTool,
  M365GetEventTool
);

/**
 * Read-only Microsoft 365 MCP toolkit type.
 *
 * @category tools
 * @since 0.1.0
 */
export type M365Toolkit = typeof M365Toolkit;
