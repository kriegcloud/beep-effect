import { $KnowledgeDomainId } from "@beep/identity/packages";
import type { Entity } from "@beep/knowledge-domain/entities";
import type { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import type { SplitError } from "../errors/split.errors";

const $I = $KnowledgeDomainId.create("services/SplitService");

export interface SplitServiceShape {
  readonly splitEntity: (params: {
    readonly entityId: KnowledgeEntityIds.KnowledgeEntityId.Type;
    readonly mentionRecordIds: ReadonlyArray<KnowledgeEntityIds.MentionRecordId.Type>;
  }) => Effect.Effect<
    {
      originalEntity: Entity.Model;
      newEntity: Entity.Model;
    },
    SplitError,
    never
  >;

  readonly unmerge: (
    mergeHistoryId: KnowledgeEntityIds.MergeHistoryId.Type
  ) => (entityId?: undefined | KnowledgeEntityIds.KnowledgeEntityId.Type) => Effect.Effect<void, SplitError, never>;
}

export class SplitService extends Context.Tag($I`SplitService`)<SplitService, SplitServiceShape>() {}
