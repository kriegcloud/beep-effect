/**
 * Chat wire contract: the rpc declarations the desktop chat surface speaks to
 * its app sidecar. These are declarations only — handler implementations live
 * in the sidecar (a later increment), and the streaming turns are produced by
 * the assistant-turn kernel behind it.
 *
 * @packageDocumentation
 * @category protocols
 * @since 0.0.0
 */

import { AssistantBlock } from "@beep/agents-domain/values/AssistantContent";
import { Document } from "@beep/md/Md.model";
import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import { Thread } from "@beep/workspace-domain";
import { Thread as ThreadUseCases } from "@beep/workspace-use-cases/public";
import * as S from "effect/Schema";
import * as Rpc from "effect/unstable/rpc/Rpc";
import * as RpcGroup from "effect/unstable/rpc/RpcGroup";
import { ChatActionError } from "./Chat.errors.ts";

/**
 * Lists the threads in a workspace, most recent activity first.
 *
 * @example
 * ```ts
 * import { ListThreadsRpc } from "@beep/agents-use-cases/public"
 *
 * console.log(ListThreadsRpc)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const ListThreadsRpc = Rpc.make("ListThreads", {
  payload: { workspaceId: WorkspaceIdentity.WorkspaceId },
  success: S.Array(Thread),
  error: ChatActionError,
});

/**
 * Creates a new thread in a workspace.
 *
 * @example
 * ```ts
 * import { CreateThreadRpc } from "@beep/agents-use-cases/public"
 *
 * console.log(CreateThreadRpc)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const CreateThreadRpc = Rpc.make("CreateThread", {
  payload: { workspaceId: WorkspaceIdentity.WorkspaceId, title: S.String },
  success: Thread,
  error: ChatActionError,
});

/**
 * Reads the persisted timeline read-model for a thread.
 *
 * @example
 * ```ts
 * import { GetTimelineRpc } from "@beep/agents-use-cases/public"
 *
 * console.log(GetTimelineRpc)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const GetTimelineRpc = Rpc.make("GetTimeline", {
  payload: { threadId: WorkspaceIdentity.ThreadId },
  success: ThreadUseCases.ThreadTimeline,
  error: ChatActionError,
});

/**
 * Sends a message to a thread and streams the assistant turn back, one
 * rich-text block at a time as each finishes generating.
 *
 * @example
 * ```ts
 * import { SendMessageRpc } from "@beep/agents-use-cases/public"
 *
 * console.log(SendMessageRpc)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const SendMessageRpc = Rpc.make("SendMessage", {
  payload: { threadId: WorkspaceIdentity.ThreadId, content: Document },
  success: AssistantBlock,
  error: ChatActionError,
  stream: true,
});

/**
 * Edits an existing turn's message and re-streams the regenerated assistant
 * turn back, one rich-text block at a time.
 *
 * @example
 * ```ts
 * import { EditMessageRpc } from "@beep/agents-use-cases/public"
 *
 * console.log(EditMessageRpc)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const EditMessageRpc = Rpc.make("EditMessage", {
  payload: {
    threadId: WorkspaceIdentity.ThreadId,
    turnId: WorkspaceIdentity.TurnId,
    content: Document,
  },
  success: AssistantBlock,
  error: ChatActionError,
  stream: true,
});

/**
 * The chat protocol the desktop chat surface speaks to its app sidecar:
 * thread listing/creation, the timeline read-model, and the two streaming
 * message turns ({@link SendMessageRpc}, {@link EditMessageRpc}).
 *
 * @example
 * ```ts
 * import { ChatRpcs } from "@beep/agents-use-cases/public"
 *
 * console.log(ChatRpcs.requests)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export const ChatRpcs = RpcGroup.make(ListThreadsRpc, CreateThreadRpc, GetTimelineRpc, SendMessageRpc, EditMessageRpc);
