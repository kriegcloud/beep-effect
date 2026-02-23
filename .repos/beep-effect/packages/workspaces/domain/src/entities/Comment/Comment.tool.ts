/**
 * Comment AI tool surface.
 *
 * Exposes selected Comment contracts as `@effect/ai` tools for agent runtimes.
 * Tool definitions are derived from the same contract schema used for RPC/HTTP.
 *
 * @module documents-domain/entities/Comment/Comment.tool
 * @since 1.0.0
 * @category ai
 */
import * as AiToolkit from "@effect/ai/Toolkit";
import { Create, Delete, Get, ListByDiscussion, Update } from "./contracts";

/**
 * Toolkit containing Comment tools.
 *
 * @since 1.0.0
 * @category ai
 */
export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  ListByDiscussion.Contract.Tool,
  Create.Contract.Tool,
  Update.Contract.Tool,
  Delete.Contract.Tool
);
