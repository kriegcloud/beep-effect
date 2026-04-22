/**
 * Public HTTP protocol schemas for the local editor sidecar runtime.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as Editor from "@beep/editor-domain";
import { $EditorProtocolId } from "@beep/identity/packages";
import * as RuntimeProtocol from "@beep/runtime-protocol";
import { Slug } from "@beep/schema";
import * as S from "effect/Schema";
import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

const $I = $EditorProtocolId.create("index");

/**
 * @since 0.0.0
 * @category re-exports
 */
export * from "@beep/editor-domain";
/**
 * @since 0.0.0
 * @category re-exports
 */
export * from "@beep/runtime-protocol";
/**
 * Union of deterministic sidecar control-plane payload errors.
 *
 * @example
 * ```ts
 * import { EditorControlPlaneErrorPayload } from "@beep/editor-protocol"
 *
 * const schema = EditorControlPlaneErrorPayload
 * void schema
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const EditorControlPlaneErrorPayload = S.Union([
  RuntimeProtocol.SidecarBadRequestPayload,
  RuntimeProtocol.SidecarNotFoundPayload,
  RuntimeProtocol.SidecarInternalErrorPayload,
]).annotate(
  $I.annote("EditorControlPlaneErrorPayload", {
    description: "Union of deterministic error payloads returned by the editor control plane.",
  })
);
/**
 * Type for deterministic sidecar control-plane payload errors.
 *
 * @example
 * ```ts
 * import type { EditorControlPlaneErrorPayload } from "@beep/editor-protocol"
 *
 * const status = (payload: EditorControlPlaneErrorPayload) => payload.status
 * void status
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type EditorControlPlaneErrorPayload = typeof EditorControlPlaneErrorPayload.Type;

/**
 * Union of deterministic status-aware sidecar resource errors.
 *
 * @example
 * ```ts
 * import { EditorControlPlaneResourceError } from "@beep/editor-protocol"
 *
 * const schema = EditorControlPlaneResourceError
 * void schema
 * ```
 *
 * @category error handling
 * @since 0.0.0
 */
export const EditorControlPlaneResourceError = S.Union([
  RuntimeProtocol.SidecarBadRequest,
  RuntimeProtocol.SidecarNotFound,
  RuntimeProtocol.SidecarInternalError,
]);
/**
 * Type for deterministic status-aware sidecar resource errors.
 *
 * @example
 * ```ts
 * import type { EditorControlPlaneResourceError } from "@beep/editor-protocol"
 *
 * const status = (error: EditorControlPlaneResourceError) => error.status
 * void status
 * ```
 *
 * @category error handling
 * @since 0.0.0
 */
export type EditorControlPlaneResourceError = typeof EditorControlPlaneResourceError.Type;

/**
 * Workspace summary projection returned by the editor control plane.
 *
 * @example
 * ```ts
 * import { EditorWorkspaceSnapshot } from "@beep/editor-protocol"
 *
 * const schema = EditorWorkspaceSnapshot
 * void schema
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class EditorWorkspaceSnapshot extends S.Class<EditorWorkspaceSnapshot>($I`EditorWorkspaceSnapshot`)(
  {
    workspace: Editor.WorkspaceManifest,
    pages: S.Array(Editor.PageSummary),
    exportFormats: S.Array(Editor.ExportFormat),
  },
  $I.annote("EditorWorkspaceSnapshot", {
    description: "Summary projection for the current local editor workspace.",
  })
) {}

/**
 * Page resource returned by the editor control plane.
 *
 * @example
 * ```ts
 * import { EditorPageResource } from "@beep/editor-protocol"
 *
 * const schema = EditorPageResource
 * void schema
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class EditorPageResource extends S.Class<EditorPageResource>($I`EditorPageResource`)(
  {
    page: Editor.PageDocument,
    backlinks: S.Array(Editor.PageSummary),
  },
  $I.annote("EditorPageResource", {
    description: "Page document plus backlink summary projection.",
  })
) {}

/**
 * Query params for page search.
 *
 * @example
 * ```ts
 * import { PageSearchQuery } from "@beep/editor-protocol"
 *
 * const query = new PageSearchQuery({ query: "home" })
 * void query
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PageSearchQuery extends S.Class<PageSearchQuery>($I`PageSearchQuery`)(
  {
    query: S.String,
  },
  $I.annote("PageSearchQuery", {
    description: "Search query used against the local editor workspace.",
  })
) {}

/**
 * Path params for page-specific routes.
 *
 * @example
 * ```ts
 * import { normalizePageSlug, PageSlugParams } from "@beep/editor-protocol"
 *
 * const params = new PageSlugParams({ slug: normalizePageSlug("home") })
 * void params
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PageSlugParams extends S.Class<PageSlugParams>($I`PageSlugParams`)(
  {
    slug: Slug,
  },
  $I.annote("PageSlugParams", {
    description: "Route params for page-specific editor sidecar endpoints.",
  })
) {}

/**
 * Path params for page export routes.
 *
 * @example
 * ```ts
 * import { normalizePageSlug, PageExportParams } from "@beep/editor-protocol"
 *
 * const params = new PageExportParams({
 *   slug: normalizePageSlug("home"),
 *   format: "markdown",
 * })
 * void params
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PageExportParams extends S.Class<PageExportParams>($I`PageExportParams`)(
  {
    slug: Slug,
    format: Editor.ExportFormat,
  },
  $I.annote("PageExportParams", {
    description: "Route params for page export endpoints.",
  })
) {}

class SystemGroup extends HttpApiGroup.make("system", { topLevel: true }).add(
  HttpApiEndpoint.get("health", "/health", {
    success: RuntimeProtocol.SidecarBootstrap,
    error: RuntimeProtocol.SidecarInternalError,
  })
) {}

class WorkspaceGroup extends HttpApiGroup.make("workspace", { topLevel: true }).add(
  HttpApiEndpoint.get("getWorkspace", "/workspace", {
    success: EditorWorkspaceSnapshot,
    error: RuntimeProtocol.SidecarInternalError,
  })
) {}

class PagesGroup extends HttpApiGroup.make("pages", { topLevel: true })
  .add(
    HttpApiEndpoint.get("listPages", "/pages", {
      success: S.Array(Editor.PageSummary),
      error: RuntimeProtocol.SidecarInternalError,
    })
  )
  .add(
    HttpApiEndpoint.get("searchPages", "/search", {
      query: PageSearchQuery,
      success: S.Array(Editor.PageSummary),
      error: RuntimeProtocol.SidecarInternalError,
    })
  )
  .add(
    HttpApiEndpoint.get("getPage", "/pages/:slug", {
      params: PageSlugParams,
      success: EditorPageResource,
      error: EditorControlPlaneResourceError,
    })
  )
  .add(
    HttpApiEndpoint.put("savePage", "/pages/:slug", {
      params: PageSlugParams,
      payload: Editor.PageDocument,
      success: EditorPageResource,
      error: EditorControlPlaneResourceError,
    })
  )
  .add(
    HttpApiEndpoint.get("exportPage", "/pages/:slug/export/:format", {
      params: PageExportParams,
      success: Editor.PageExport,
      error: EditorControlPlaneResourceError,
    })
  ) {}

/**
 * Editor control-plane API.
 *
 * @example
 * ```ts
 * import { EditorControlPlaneApi } from "@beep/editor-protocol"
 *
 * const api = EditorControlPlaneApi
 * void api
 * ```
 *
 * @category interop
 * @since 0.0.0
 */
export class EditorControlPlaneApi extends HttpApi.make("editor-control-plane")
  .add(SystemGroup, WorkspaceGroup, PagesGroup)
  .prefix("/api/v0") {}
