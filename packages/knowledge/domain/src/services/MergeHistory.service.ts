import { $KnowledgeDomainId } from "@beep/identity/packages";
import type * as Entities from "@beep/knowledge-domain/entities";
import type { MergeError } from "@beep/knowledge-domain/errors/Merge.errors";
import type { MergeParams } from "@beep/knowledge-domain/value-objects/MergeParams.value";
import type { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";

const $I = $KnowledgeDomainId.create("services/MergeHistory");

export interface MergeHistoryService {
  readonly recordMerge: (params: MergeParams) => Effect.Effect<Entities.MergeHistory.Model, MergeError>;

  readonly getMergeHistory: (
    entityId: KnowledgeEntityIds.KnowledgeEntityId.Type
  ) => Effect.Effect<ReadonlyArray<Entities.MergeHistory.Model>, MergeError>;

  readonly getMergesByUser: (
    userId: SharedEntityIds.UserId.Type
  ) => Effect.Effect<ReadonlyArray<Entities.MergeHistory.Model>, MergeError>;
}

export class MergeHistory extends Context.Tag($I`MergeHistory`)<MergeHistory, MergeHistoryService>() {}
