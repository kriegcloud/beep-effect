/**
 * Page HTTP/OpenAPI surface.
 *
 * The documents system is RPC-first. This module exists to expose selected operations
 * as documented HTTP endpoints (primarily for OpenAPI/Scalar), derived from contracts.
 *
 * @module documents-domain/entities/Page/Page.http
 * @since 1.0.0
 * @category http
 */
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import {
  Archive,
  Create,
  Delete,
  Get,
  List,
  ListChildren,
  ListTrash,
  Lock,
  Move,
  Publish,
  Restore,
  Search,
  Unlock,
  UnPublish,
  Update,
} from "./contracts";

/**
 * HTTP API group for Page endpoints.
 *
 * @since 1.0.0
 * @category http
 */
export class Http extends HttpApiGroup.make("pages")
  .add(Get.Contract.Http)
  .add(List.Contract.Http)
  .add(ListChildren.Contract.Http)
  .add(ListTrash.Contract.Http)
  .add(Search.Contract.Http)
  .add(Create.Contract.Http)
  .add(Update.Contract.Http)
  .add(Delete.Contract.Http)
  .add(Archive.Contract.Http)
  .add(Restore.Contract.Http)
  .add(Lock.Contract.Http)
  .add(Unlock.Contract.Http)
  .add(Move.Contract.Http)
  .add(Publish.Contract.Http)
  .add(UnPublish.Contract.Http)
  .prefix("/pages") {}
