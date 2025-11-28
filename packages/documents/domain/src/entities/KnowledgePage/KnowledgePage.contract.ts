import { DocumentsEntityIds } from "@beep/shared-domain";
import { UserAuthMiddleware } from "@beep/shared-domain/Policy";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { KnowledgePageNotFoundError } from "./KnowledgePage.errors.ts";
import { Model } from "./KnowledgePage.model.ts";
// import * as UrlParams from "@effect/platform/UrlParams";

export class Contract extends HttpApiGroup.make("knowledgePage")
  .middleware(UserAuthMiddleware)
  .add(
    HttpApiEndpoint.get("get", "/get/:id")
      .setUrlParams(DocumentsEntityIds.KnowledgePageId)
      .addError(KnowledgePageNotFoundError)
      .addSuccess(Model)
  ) {}
