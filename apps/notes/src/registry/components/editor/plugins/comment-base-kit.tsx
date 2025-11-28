import { CommentLeafStatic } from "@beep/notes/registry/ui/comment-node-static";
import { BaseCommentPlugin } from "@platejs/comment";

export const BaseCommentKit = [BaseCommentPlugin.withComponent(CommentLeafStatic)];
