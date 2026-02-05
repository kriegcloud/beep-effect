import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { Confidence } from "../../value-objects";

const $I = $KnowledgeDomainId.create("entities/EntityCluster");

export class Model extends M.Class<Model>($I`EntityClusterModel`)(
  makeFields(KnowledgeEntityIds.EntityClusterId, {
    organizationId: SharedEntityIds.OrganizationId,
    canonicalEntityId: KnowledgeEntityIds.KnowledgeEntityId,
    memberIds: S.NonEmptyArray(KnowledgeEntityIds.KnowledgeEntityId),
    cohesion: Confidence,
    sharedTypes: S.Array(S.String),
    ontologyId: BS.FieldOptionOmittable(KnowledgeEntityIds.OntologyId),
  }),
  $I.annotations("EntityClusterModel", {
    description: "Entity resolution cluster grouping same-entity references",
  })
) {
  static readonly utils = modelKit(Model);
}
