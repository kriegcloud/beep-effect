/**
 * Page AI tool surface.
 *
 * Exposes selected Page contracts as `@effect/ai` tools for agent runtimes.
 * Tool definitions are derived from the same contract schema used for RPC/HTTP.
 *
 * @module documents-domain/entities/Page/Page.tool
 * @since 1.0.0
 * @category ai
 */
import * as AiToolkit from "@effect/ai/Toolkit";
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
 * Toolkit containing Page tools.
 *
 * @since 1.0.0
 * @category ai
 */
export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  List.Contract.Tool,
  ListChildren.Contract.Tool,
  ListTrash.Contract.Tool,
  Search.Contract.Tool,
  Create.Contract.Tool,
  Update.Contract.Tool,
  Delete.Contract.Tool,
  Archive.Contract.Tool,
  Restore.Contract.Tool,
  Lock.Contract.Tool,
  Unlock.Contract.Tool,
  Move.Contract.Tool,
  Publish.Contract.Tool,
  UnPublish.Contract.Tool
);
