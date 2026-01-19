/**
 * ClassDefinition Repository
 *
 * Database operations for ClassDefinition entities.
 *
 * @module knowledge-server/db/repos/ClassDefinition
 * @since 0.1.0
 */
import { $KnowledgeServerId } from "@beep/identity/packages";
import { Entities } from "@beep/knowledge-domain";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-domain/factories";
import * as Effect from "effect/Effect";
import { dependencies } from "./_common";

const $I = $KnowledgeServerId.create("db/repos/ClassDefinitionRepo");

/**
 * ClassDefinitionRepo Effect.Service
 *
 * Provides CRUD operations for ClassDefinition entities.
 *
 * @since 0.1.0
 * @category services
 */
export class ClassDefinitionRepo extends Effect.Service<ClassDefinitionRepo>()($I`ClassDefinitionRepo`, {
  dependencies,
  accessors: true,
  effect: DbRepo.make(KnowledgeEntityIds.ClassDefinitionId, Entities.ClassDefinition.Model, Effect.succeed({})),
}) {}
