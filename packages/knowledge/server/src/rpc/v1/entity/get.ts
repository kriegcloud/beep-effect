import { Errors } from "@beep/knowledge-domain";
import type { Entity } from "@beep/knowledge-domain/rpc/Entity";
import { EntityRepo } from "@beep/knowledge-server/db/repos/Entity.repo";
import { Policy } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

export const Handler = Effect.fn("entity_get")(function* (payload: Entity.Get.Payload) {
  const { session } = yield* Policy.AuthContext;
  const repo = yield* EntityRepo;

  if (session.activeOrganizationId !== payload.organizationId) {
    return yield* new Errors.EntityNotFoundError({
      id: payload.id,
      message: "Entity not found or access denied",
    });
  }

  const entities = yield* repo.findByIds([payload.id], payload.organizationId).pipe(
    Effect.catchTag("DatabaseError", (e) =>
      Effect.fail(
        new Errors.EntityNotFoundError({
          id: payload.id,
          message: `Database error: ${e.message}`,
        })
      )
    )
  );
  const first = A.head(entities);

  return yield* O.match(first, {
    onNone: () =>
      new Errors.EntityNotFoundError({
        id: payload.id,
        message: "Entity not found",
      }),
    onSome: Effect.succeed,
  });
}, Effect.withSpan("entity_get"));
