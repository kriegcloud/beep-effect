import { $KnowledgeDomainId } from "@beep/identity/packages";
import { CountResult } from "@beep/knowledge-domain/value-objects";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Relation/Count");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    entityId: S.optional(KnowledgeEntityIds.KnowledgeEntityId),
    predicate: S.optional(S.String),
  },
  $I.annotations("Payload", {
    description: "relation_count payload",
  })
) {}

export class Success extends CountResult.extend<Success>($I`Success`)(
  {},
  $I.annotations("Success", {
    description: "relation_count succeeded",
  })
) {}

export const Contract = Rpc.make("count", {
  payload: Payload,
  success: Success,
});
