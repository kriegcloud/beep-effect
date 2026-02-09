import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import * as Errors from "./document-version.errors";

const $I = $DocumentsDomainId.create("entities/document-version/document-version.rpc");

export class GetContentPayload extends S.Class<GetContentPayload>($I`GetContentPayload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    id: DocumentsEntityIds.DocumentVersionId,
  },
  $I.annotations("GetContentPayload", {
    description:
      "Fetch the immutable canonical content snapshot for a specific document version (C-05).",
  })
) {}

export class GetContentSuccess extends S.Class<GetContentSuccess>($I`GetContentSuccess`)(
  {
    documentId: DocumentsEntityIds.DocumentId,
    documentVersionId: DocumentsEntityIds.DocumentVersionId,
    content: S.String,
  },
  $I.annotations("GetContentSuccess", {
    description:
      "Immutable canonical text snapshot pinned to documentVersionId (used for evidence highlighting).",
  })
) {}

export class Rpcs extends RpcGroup.make(
  Rpc.make("DocumentVersion.getContent", {
    payload: GetContentPayload,
    success: GetContentSuccess,
    error: Errors.DocumentVersionNotFoundError,
  })
) {}

