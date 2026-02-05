import type { Entities } from "@beep/knowledge-domain";
import type { Entity } from "@beep/knowledge-domain/rpc/Entity";
import { EntityRepo } from "@beep/knowledge-server/db/repos/Entity.repo";
import { Policy } from "@beep/shared-domain";
import { thunkSucceedEffect } from "@beep/utils";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as Stream from "effect/Stream";

export const Handler = (
  payload: Entity.List.Payload
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
    }).pipe(Effect.catchTag("DatabaseError", thunkSucceedEffect(Stream.empty)))
  );
