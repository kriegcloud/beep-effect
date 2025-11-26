import { KnowledgePageRepo } from "@beep/knowledge-management-infra/adapters";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import * as Effect from "effect/Effect";
import { Api } from "./root.ts";

export const KnowledgePageRouterLive = HttpApiBuilder.group(
  Api,
  "knowledgePage",
  Effect.fnUntraced(function* (handlers) {
    const knowledgePageRepo = yield* KnowledgePageRepo;
    return handlers.handle("get", ({ urlParams }) => knowledgePageRepo.findById(urlParams));
  })
);
