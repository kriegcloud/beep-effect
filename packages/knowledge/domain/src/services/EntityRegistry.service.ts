import { $KnowledgeDomainId } from "@beep/identity/packages";
import type { Entity, MentionRecord } from "@beep/knowledge-domain/entities";
import type { RegistryError } from "@beep/knowledge-domain/errors/Registry.errors";
import type { EntityCandidate } from "@beep/knowledge-domain/value-objects/EntityCandidate.value";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";

const $I = $KnowledgeDomainId.create("services/EntityRegistry");

export interface EntityRegistryService {
  readonly findCandidates: (
    mention: MentionRecord.Model
  ) => Effect.Effect<ReadonlyArray<EntityCandidate>, RegistryError>;

  readonly bloomFilterCheck: (normalizedText: string) => Effect.Effect<boolean, RegistryError>;

  readonly fetchTextMatches: (normalizedText: string) => Effect.Effect<ReadonlyArray<Entity.Model>, RegistryError>;

  readonly rankBySimilarity: (
    mention: MentionRecord.Model,
    candidates: ReadonlyArray<Entity.Model>
  ) => Effect.Effect<ReadonlyArray<EntityCandidate>, RegistryError>;
}

export class EntityRegistry extends Context.Tag($I`EntityRegistry`)<EntityRegistry, EntityRegistryService>() {}
