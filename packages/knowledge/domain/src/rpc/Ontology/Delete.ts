import { $KnowledgeDomainId } from "@beep/identity/packages";
import { OntologyNotFoundError } from "@beep/knowledge-domain/errors";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("rpc/Ontology/Delete");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: KnowledgeEntityIds.OntologyId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description: "ontology_delete payload",
  })
) {}

export const Error = OntologyNotFoundError.annotations(
  $I.annotations("Error", {
    description: "ontology_delete failed",
  })
);

export const Contract = Rpc.make("delete", {
  payload: Payload,
  success: S.Void,
  error: Error,
});
