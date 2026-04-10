import { $I as $RootId } from "@beep/identity/packages";
import {
  SidecarBadRequest,
  SidecarBootstrap,
  SidecarInternalError,
  SidecarNotFound,
} from "@beep/runtime-protocol";
import { NonEmptyTrimmedStr, UUID } from "@beep/schema";
import * as S from "effect/Schema";
import { HttpApi, HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";

const $I = $RootId.create("VT2/protocol");

/**
 * A persisted VT2 document.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2Document extends S.Class<Vt2Document>($I`Vt2Document`)(
  {
    id: UUID,
    title: NonEmptyTrimmedStr,
    body: S.String,
    createdAt: S.DateTimeUtcFromMillis,
  },
  $I.annote("Vt2Document", {
    description: "SQLite-backed VT2 document exposed through the control plane.",
  })
) {}

/**
 * Payload used to create a VT2 document.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CreateVt2DocumentInput extends S.Class<CreateVt2DocumentInput>($I`CreateVt2DocumentInput`)(
  {
    title: NonEmptyTrimmedStr,
    body: S.String,
  },
  $I.annote("CreateVt2DocumentInput", {
    description: "Client payload for creating a VT2 document.",
  })
) {}

/**
 * Route params for VT2 document endpoints.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2DocumentIdParams extends S.Class<Vt2DocumentIdParams>($I`Vt2DocumentIdParams`)(
  {
    documentId: UUID,
  },
  $I.annote("Vt2DocumentIdParams", {
    description: "Route params for document-specific VT2 endpoints.",
  })
) {}

const Vt2DocumentCreated = Vt2Document.pipe(HttpApiSchema.status(201));

class SystemGroup extends HttpApiGroup.make("system", { topLevel: true }).add(
  HttpApiEndpoint.get("health", "/health", {
    success: SidecarBootstrap,
    error: SidecarInternalError,
  })
) {}

class DocumentsGroup extends HttpApiGroup.make("documents", { topLevel: true })
  .add(
    HttpApiEndpoint.get("listDocuments", "/documents", {
      success: S.Array(Vt2Document),
      error: SidecarInternalError,
    })
  )
  .add(
    HttpApiEndpoint.get("getDocument", "/documents/:documentId", {
      params: Vt2DocumentIdParams,
      success: Vt2Document,
      error: S.Union([SidecarBadRequest, SidecarNotFound, SidecarInternalError]),
    })
  )
  .add(
    HttpApiEndpoint.post("createDocument", "/documents", {
      payload: CreateVt2DocumentInput,
      success: Vt2DocumentCreated,
      error: S.Union([SidecarBadRequest, SidecarNotFound, SidecarInternalError]),
    })
  ) {}

/**
 * VT2 control-plane HTTP API.
 *
 * @since 0.0.0
 * @category Integration
 */
export class Vt2ControlPlaneApi extends HttpApi.make("vt2-control-plane")
  .add(SystemGroup, DocumentsGroup)
  .prefix("/api/v0") {}
