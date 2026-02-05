import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Ontology } from "@beep/knowledge-domain/entities";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Ontology/List");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    status: S.optional(Ontology.OntologyStatus),
    cursor: S.optional(KnowledgeEntityIds.OntologyId),
    limit: S.optional(BS.PosInt),
  },
  $I.annotations("Payload", {
    description: "ontology_list payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  Ontology.Model.json,
  $I.annotations("Success", {
    description: "ontology_list succeeded",
  })
) {}

export const Contract = Rpc.make("list", {
  payload: Payload,
  success: Success,
  error: S.Never,
  stream: true,
});
