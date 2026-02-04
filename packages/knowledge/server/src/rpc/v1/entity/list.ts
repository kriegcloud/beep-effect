/**
 * Entity List RPC Handler
 *
 * Streams entities with optional filtering by ontology or type.
 *
 * @module knowledge-server/rpc/v1/entity/list
 * @since 0.1.0
 */
import type { Entities } from "@beep/knowledge-domain";
import type { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { Policy } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as Stream from "effect/Stream";
import { EntityRepo } from "../../../db/repos/Entity.repo";

interface Payload {
  readonly organizationId: SharedEntityIds.OrganizationId.Type;
  readonly ontologyId?: KnowledgeEntityIds.OntologyId.Type | undefined;
  readonly type?: string | undefined;
  readonly cursor?: KnowledgeEntityIds.KnowledgeEntityId.Type | undefined;
  readonly limit?: number | undefined;
}

export const Handler = (
  payload: Payload
): Stream.Stream<Entities.Entity.Model, never, EntityRepo | Policy.AuthContext> =>
  Stream.unwrap(
    Effect.gen(function* () {
      const { session } = yield* Policy.AuthContext;
      const repo = yield* EntityRepo;

      if (session.activeOrganizationId !== payload.organizationId) {
        return Stream.empty;
      }

      const limit = payload.limit ?? 100;
      const typeOpt = O.fromNullable(payload.type);
      const ontologyOpt = O.fromNullable(payload.ontologyId);

      if (O.isSome(typeOpt)) {
        const entities = yield* repo.findByType(typeOpt.value, payload.organizationId, limit);
        return Stream.fromIterable(entities);
      }

      if (O.isSome(ontologyOpt)) {
        const entities = yield* repo.findByOntology(ontologyOpt.value, payload.organizationId, limit);
        return Stream.fromIterable(entities);
      }

      const entities = yield* repo.findByOntology("", payload.organizationId, limit);
      return Stream.fromIterable(entities);
    }).pipe(Effect.catchTag("DatabaseError", () => Effect.succeed(Stream.empty)))
  );
