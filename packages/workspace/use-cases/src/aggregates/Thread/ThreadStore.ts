/**
 * Cross-concept ThreadStore port.
 *
 * The ThreadStore coordinates the Thread, Turn, and Message concepts behind a
 * single persistence boundary. It is allowed under the std-01 cross-concept
 * escape hatch because a single appended turn must atomically write a Turn and
 * its first Message.
 *
 * @packageDocumentation
 * @category repositories
 * @since 0.0.0
 */

import { $WorkspaceUseCasesId } from "@beep/identity/packages";
import { Context } from "effect";
import type { Document } from "@beep/md/Md.model";
import type * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import type { Message, MessageRole } from "@beep/workspace-domain/entities/Message";
import type { Thread } from "@beep/workspace-domain/entities/Thread";
import type { Turn } from "@beep/workspace-domain/entities/Turn";
import type { Effect, Option } from "effect";
import type { ThreadStoreConflict, ThreadStoreNotFound, ThreadStoreUnavailable } from "./Thread.errors.ts";
import type { ThreadTimeline } from "./ThreadTimeline.ts";

const $I = $WorkspaceUseCasesId.create("aggregates/Thread/ThreadStore");

/**
 * Input accepted by {@link ThreadStoreShape.createThread}.
 *
 * @example
 * ```ts
 * import type { CreateThreadInput } from "@beep/workspace-use-cases/aggregates/Thread/server"
 *
 * const value = {} as CreateThreadInput
 * console.log(value)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export interface CreateThreadInput {
  readonly title: string;
  readonly workspaceId: WorkspaceIdentity.WorkspaceId;
}

/**
 * Input accepted by {@link ThreadStoreShape.appendTurn}.
 *
 * @example
 * ```ts
 * import type { AppendTurnInput } from "@beep/workspace-use-cases/aggregates/Thread/server"
 *
 * const value = {} as AppendTurnInput
 * console.log(value)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export interface AppendTurnInput {
  readonly content: Document;
  readonly parentTurnId: Option.Option<WorkspaceIdentity.TurnId>;
  readonly role: MessageRole;
  readonly threadId: WorkspaceIdentity.ThreadId;
}

/**
 * Result returned by {@link ThreadStoreShape.appendTurn}.
 *
 * @example
 * ```ts
 * import type { AppendTurnResult } from "@beep/workspace-use-cases/aggregates/Thread/server"
 *
 * const value = {} as AppendTurnResult
 * console.log(value)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export interface AppendTurnResult {
  readonly message: Message;
  readonly turn: Turn;
}

/**
 * Cross-concept ThreadStore contract.
 *
 * @example
 * ```ts
 * import type { ThreadStoreShape } from "@beep/workspace-use-cases/aggregates/Thread/server"
 *
 * const value = {} as ThreadStoreShape
 * console.log(value)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export interface ThreadStoreShape {
  readonly appendTurn: (
    input: AppendTurnInput
  ) => Effect.Effect<AppendTurnResult, ThreadStoreNotFound | ThreadStoreConflict | ThreadStoreUnavailable>;
  readonly createThread: (
    input: CreateThreadInput
  ) => Effect.Effect<Thread, ThreadStoreConflict | ThreadStoreUnavailable>;
  readonly listThreads: (
    workspaceId: WorkspaceIdentity.WorkspaceId
  ) => Effect.Effect<ReadonlyArray<Thread>, ThreadStoreUnavailable>;
  readonly timeline: (
    threadId: WorkspaceIdentity.ThreadId
  ) => Effect.Effect<ThreadTimeline, ThreadStoreNotFound | ThreadStoreUnavailable>;
}

/**
 * Cross-concept ThreadStore service.
 *
 * @example
 * ```ts
 * import { ThreadStore } from "@beep/workspace-use-cases/aggregates/Thread/server"
 *
 * console.log(ThreadStore)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export class ThreadStore extends Context.Service<ThreadStore, ThreadStoreShape>()($I`ThreadStore`) {}
