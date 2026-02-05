import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Extraction } from "@beep/knowledge-domain/entities";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Extraction/List");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    documentId: S.optional(DocumentsEntityIds.DocumentId),
    status: S.optional(Extraction.ExtractionStatus),
    limit: S.optional(BS.PosInt),
  },
  $I.annotations("Payload", {
    description: "extraction_list payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  Extraction.Model.json,
  $I.annotations("Success", {
    description: "extraction_list succeeded",
  })
) {}

export const Contract = Rpc.make("list", {
  payload: Payload,
  success: Success,
  stream: true,
});
