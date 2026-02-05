import { $KnowledgeDomainId } from "@beep/identity/packages";
import { CountResult } from "@beep/knowledge-domain/value-objects";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Entity/Count");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    type: S.optional(S.String),
    ontologyId: S.optional(KnowledgeEntityIds.OntologyId),
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description: "entity_count payload",
  })
) {}

export class Success extends CountResult.extend<Success>($I`Success`)(
  {},
  $I.annotations("Success", {
    description: "entity_count succeeded",
  })
) {}

export const Contract = Rpc.make("count", {
  payload: Payload,
  success: Success,
});
