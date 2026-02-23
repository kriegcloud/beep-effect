/**
 * Comment RPC group.
 *
 * This module defines the RPC surface area for Comments. Prefer contract-derived RPCs
 * (`Contracts.*.Contract.Rpc`) to keep RPC/HTTP/AI tool schemas aligned.
 *
 * @module documents-domain/entities/Comment/Comment.rpc
 * @since 1.0.0
 * @category rpcs
 */
import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Create, Delete, Get, ListByDiscussion, Update } from "./contracts";

/**
 * RPC contract for Comment entity operations.
 * All RPCs require authentication via RpcAuthMiddleware.
 *
 * @since 1.0.0
 * @category rpcs
 */
export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  ListByDiscussion.Contract.Rpc,
  Create.Contract.Rpc,
  Update.Contract.Rpc,
  Delete.Contract.Rpc
) {}
