/**
 * Comment HTTP/OpenAPI surface.
 *
 * The documents system is RPC-first. This module exists to expose selected operations
 * as documented HTTP endpoints (primarily for OpenAPI/Scalar), derived from contracts.
 *
 * @module documents-domain/entities/Comment/Comment.http
 * @since 1.0.0
 * @category http
 */
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Create, Delete, Get, ListByDiscussion, Update } from "./contracts";

/**
 * HTTP API group for Comment endpoints.
 *
 * @since 1.0.0
 * @category http
 */
export class Http extends HttpApiGroup.make("comments")
  .add(Get.Contract.Http)
  .add(ListByDiscussion.Contract.Http)
  .add(Create.Contract.Http)
  .add(Update.Contract.Http)
  .add(Delete.Contract.Http)
  .prefix("/comments") {}
