import { EntityRepo } from "@beep/knowledge-server/db/repos/Entity.repo";
import type { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { Policy } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

interface Payload {
  readonly organizationId: SharedEntityIds.OrganizationId.Type;
  readonly ontologyId?: KnowledgeEntityIds.OntologyId.Type | undefined;
  readonly type?: string | undefined;
}

export const Handler = Effect.fn("entity_count")(
  function* (payload: Payload) {
    const { session } = yield* Policy.AuthContext;
    const repo = yield* EntityRepo;

    if (session.activeOrganizationId !== payload.organizationId) {
      return { count: 0 };
    }

    const count = yield* repo.countByOrganization(payload.organizationId);
    return { count };
  },
  Effect.catchTag("DatabaseError", () => Effect.succeed({ count: 0 })),
  Effect.withSpan("entity_count")
);
