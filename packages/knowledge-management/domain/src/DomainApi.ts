import * as HttpApi from "@effect/platform/HttpApi";
import { KnowledgePage } from "./entities.ts";

export class DomainApi extends HttpApi.make("domain")
  .add(KnowledgePage.Contract)
  .prefix("/api/v1/knowledge-management") {}
