import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Model as Entity } from "../entities/entity/entity.model";

const $I = $KnowledgeDomainId.create("value-objects/EntityCandidate");

export class EntityCandidate extends S.Class<EntityCandidate>($I`EntityCandidate`)(
  {
    entity: Entity,
    similarityScore: S.Number.pipe(S.between(0, 1)),
  },
  $I.annotations("EntityCandidate", {
    description: "Entity candidate with similarity score for resolution",
  })
) {}
