/**
 * PropertyDefinition Repository
 *
 * Database operations for PropertyDefinition entities.
 *
 * @module knowledge-server/db/repos/PropertyDefinition
 * @since 0.1.0
 */
import { $KnowledgeServerId } from "@beep/identity/packages";
import { Entities } from "@beep/knowledge-domain";
import { KnowledgeDb } from "@beep/knowledge-server/db";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-domain/factories";
import * as Effect from "effect/Effect";
import { dependencies } from "./_common";

const $I = $KnowledgeServerId.create("db/repos/PropertyDefinitionRepo");

/**
 * PropertyDefinitionRepo Effect.Service
 *
 * Provides CRUD operations for PropertyDefinition entities.
 *
 * @since 0.1.0
 * @category services
 */
export class PropertyDefinitionRepo extends Effect.Service<PropertyDefinitionRepo>()($I`PropertyDefinitionRepo`, {
  dependencies,
  accessors: true,
  effect: Effect.gen(function* () {
    yield* KnowledgeDb.Db;

    return yield* DbRepo.make(
      KnowledgeEntityIds.PropertyDefinitionId,
      Entities.PropertyDefinition.Model,
      Effect.succeed({})
    );
  }),
}) {}
