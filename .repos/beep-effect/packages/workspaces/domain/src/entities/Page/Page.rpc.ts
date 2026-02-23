/**
 * Page RPC group.
 *
 * This module defines the RPC surface area for Pages. Prefer contract-derived RPCs
 * (`Contracts.*.Contract.Rpc`) to keep RPC/HTTP/AI tool schemas aligned.
 *
 * @module documents-domain/entities/Page/Page.rpc
 * @since 1.0.0
 * @category rpcs
 */
import * as RpcGroup from "@effect/rpc/RpcGroup";
import {
  Archive,
  Breadcrumbs,
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
 * RPC contract for Page entity operations.
 * All RPCs require authentication via RpcAuthMiddleware.
 *
 * @since 1.0.0
 * @category rpcs
 */
export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  List.Contract.Rpc,
  ListChildren.Contract.Rpc,
  ListTrash.Contract.Rpc,
  Search.Contract.Rpc,
  Create.Contract.Rpc,
  Update.Contract.Rpc,
  Delete.Contract.Rpc,
  Archive.Contract.Rpc,
  Restore.Contract.Rpc,
  Lock.Contract.Rpc,
  Unlock.Contract.Rpc,
  Move.Contract.Rpc,
  Publish.Contract.Rpc,
  UnPublish.Contract.Rpc,
  Breadcrumbs.Contract.Rpc
) {}
