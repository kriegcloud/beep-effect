/**
 * Ontology Repository
 *
 * Database operations for Ontology entities.
 *
 * @module knowledge-server/db/repos/Ontology
 * @since 0.1.0
 */
import { $KnowledgeServerId } from "@beep/identity/packages";
import { Entities } from "@beep/knowledge-domain";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-domain/factories";
import * as Effect from "effect/Effect";
import { dependencies } from "./_common";

const $I = $KnowledgeServerId.create("db/repos/OntologyRepo");

/**
 * OntologyRepo Effect.Service
 *
 * Provides CRUD operations for Ontology entities.
 *
 * @since 0.1.0
 * @category services
 */
export class OntologyRepo extends Effect.Service<OntologyRepo>()($I`OntologyRepo`, {
  dependencies,
  accessors: true,
  effect: DbRepo.make(KnowledgeEntityIds.OntologyId, Entities.Ontology.Model, Effect.succeed({})),
}) {}
