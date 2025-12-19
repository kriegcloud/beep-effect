import * as Layer from "effect/Layer";
import { CommentHandlersLive } from "./Comment.handlers";
import { DiscussionHandlersLive } from "./Discussion.handlers";
import { DocumentHandlersLive } from "./Document.handlers";

export { CommentHandlersLive } from "./Comment.handlers";
export { DiscussionHandlersLive } from "./Discussion.handlers";
export { DocumentHandlersLive } from "./Document.handlers";

/**
 * Combined layer providing all document RPC handlers.
 * Merges Document, Discussion, and Comment handlers into a single layer.
 */
export const DocumentsHandlersLive = Layer.mergeAll(DocumentHandlersLive, DiscussionHandlersLive, CommentHandlersLive);
