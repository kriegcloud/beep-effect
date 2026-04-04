import * as Editor from "@beep/editor";
import { $EditorProtocolId } from "@beep/identity/packages";
import * as RuntimeProtocol from "@beep/runtime-protocol";
import { Slug } from "@beep/schema";
import * as S from "effect/Schema";
import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

const $I = $EditorProtocolId.create("index");

/**
 * @since 0.0.0
 * @category Re-exports
 */
export * from "@beep/editor";
/**
 * @since 0.0.0
 * @category Re-exports
 */
export * from "@beep/runtime-protocol";
/**
 * Union of deterministic sidecar control-plane payload errors.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category DomainModel
 */
export type EditorControlPlaneErrorPayload = typeof EditorControlPlaneErrorPayload.Type;

/**
 * Union of deterministic status-aware sidecar resource errors.
 *
 * @since 0.0.0
 * @category Integration
 */
export const EditorControlPlaneResourceError = S.Union([
  RuntimeProtocol.SidecarBadRequest,
  RuntimeProtocol.SidecarNotFound,
  RuntimeProtocol.SidecarInternalError,
]);
/**
 * @since 0.0.0
 * @category Integration
 */
export type EditorControlPlaneResourceError = typeof EditorControlPlaneResourceError.Type;

/**
 * Workspace summary projection returned by the editor control plane.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category Integration
 */
export class EditorControlPlaneApi extends HttpApi.make("editor-control-plane")
  .add(SystemGroup, WorkspaceGroup, PagesGroup)
  .prefix("/api/v0") {}
