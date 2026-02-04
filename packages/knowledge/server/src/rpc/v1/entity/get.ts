/**
 * Entity Get RPC Handler
 *
 * Retrieves a single entity by ID with organization scoping.
 *
 * @module knowledge-server/rpc/v1/entity/get
 * @since 0.1.0
 */
import { Entities } from "@beep/knowledge-domain";
import { EntityRepo } from "../../../db/repos/Entity.repo";
import type { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { Policy } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

interface Payload {
  readonly id: KnowledgeEntityIds.KnowledgeEntityId.Type;
  readonly organizationId: SharedEntityIds.OrganizationId.Type;
}

export const Handler = Effect.fn("entity_get")(
  function* (payload: Payload) {
    const { session } = yield* Policy.AuthContext;
    const repo = yield* EntityRepo;

    if (session.activeOrganizationId !== payload.organizationId) {
      return yield* new Entities.Entity.Rpc.EntityNotFoundError({
        id: payload.id,
        message: "Entity not found or access denied",
      });
    }

    const entities = yield* repo.findByIds([payload.id], payload.organizationId);
    const first = A.head(entities);

    return yield* O.match(first, {
      onNone: () =>
        new Entities.Entity.Rpc.EntityNotFoundError({
          id: payload.id,
          message: "Entity not found",
        }),
      onSome: Effect.succeed,
    });
  },
  Effect.catchTag("DatabaseError", (e) =>
    Effect.fail(
      new Entities.Entity.Rpc.EntityNotFoundError({
        id: "" as KnowledgeEntityIds.KnowledgeEntityId.Type,
        message: `Database error: ${e.message}`,
      })
    )
  ),
  Effect.withSpan("entity_get")
);
