import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Entity } from "@beep/knowledge-domain/entities";
import { EntityNotFoundError } from "@beep/knowledge-domain/errors";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Entity/Search");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    query: S.String,
    organizationId: SharedEntityIds.OrganizationId,
    ontologyId: S.optional(KnowledgeEntityIds.OntologyId),
    types: S.optional(S.Array(S.String)),
    limit: S.optional(BS.PosInt),
    offset: S.optional(S.NonNegativeInt),
  },
  $I.annotations("Payload", {
    description: "entity_search payload",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    ...Entity.Model.select.pick("id", "_rowId", "mention", "types").fields,
    rank: S.Number,
  },
  $I.annotations("Success", {
    description: "entity_search succeeded",
  })
) {}

export const Error = EntityNotFoundError.annotations(
  $I.annotations("Error", {
    description: "entity_search failed",
  })
);

export const Contract = Rpc.make("search", {
  payload: Payload,
  success: Success,
  stream: true,
});
