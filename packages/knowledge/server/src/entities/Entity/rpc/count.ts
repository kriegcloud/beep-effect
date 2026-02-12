import { Entities } from "@beep/knowledge-domain";
import { Entity } from "@beep/knowledge-domain/rpc/Entity";
import { Policy } from "@beep/shared-domain";
import { thunkSucceedEffect } from "@beep/utils";
import * as Effect from "effect/Effect";

export const Handler = Effect.fn("entity_count")(
  function* (payload: Entity.Count.Payload) {
    const { session } = yield* Policy.AuthContext;
    const repo = yield* Entities.Entity.Repo;

    if (session.activeOrganizationId !== payload.organizationId) {
      return new Entity.Count.Success({ count: 0 });
    }

    const count = yield* repo.countByOrganization(payload.organizationId);
    return new Entity.Count.Success({ count });
  },
  Effect.catchTag("DatabaseError", thunkSucceedEffect(new Entity.Count.Success({ count: 0 }))),
  Effect.withSpan("entity_count")
);
