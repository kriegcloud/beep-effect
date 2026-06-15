/**
 * ThreadStore server-only port errors.
 *
 * @packageDocumentation
 * @category errors
 * @since 0.0.0
 */

import { $WorkspaceUseCasesId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import * as S from "effect/Schema";

const $I = $WorkspaceUseCasesId.create("aggregates/Thread/Thread.errors");

/**
 * Persistence failure raised when a Thread row is absent.
 *
 * @example
 * ```ts
 * import { ThreadStoreNotFound } from "@beep/workspace-use-cases/aggregates/Thread/server"
 *
 * console.log(ThreadStoreNotFound)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class ThreadStoreNotFound extends TaggedErrorClass<ThreadStoreNotFound>($I`ThreadStoreNotFound`)(
  "ThreadStoreNotFound",
  {
    threadId: WorkspaceIdentity.ThreadId,
  },
  $I.annote("ThreadStoreNotFound", {
    title: "Thread store not found",
    description: "The ThreadStore could not find the requested thread.",
  })
) {}

/**
 * Persistence failure raised when a ThreadStore write conflicts.
 *
 * @example
 * ```ts
 * import { ThreadStoreConflict } from "@beep/workspace-use-cases/aggregates/Thread/server"
 *
 * console.log(ThreadStoreConflict)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class ThreadStoreConflict extends TaggedErrorClass<ThreadStoreConflict>($I`ThreadStoreConflict`)(
  "ThreadStoreConflict",
  {
    threadId: WorkspaceIdentity.ThreadId,
    reason: S.String,
  },
  $I.annote("ThreadStoreConflict", {
    title: "Thread store conflict",
    description: "The ThreadStore rejected a conflicting write.",
  })
) {}

/**
 * Persistence failure raised when the ThreadStore is unavailable.
 *
 * @example
 * ```ts
 * import { ThreadStoreUnavailable } from "@beep/workspace-use-cases/aggregates/Thread/server"
 *
 * console.log(ThreadStoreUnavailable)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class ThreadStoreUnavailable extends TaggedErrorClass<ThreadStoreUnavailable>($I`ThreadStoreUnavailable`)(
  "ThreadStoreUnavailable",
  {
    reason: S.String,
  },
  $I.annote("ThreadStoreUnavailable", {
    title: "Thread store unavailable",
    description: "The ThreadStore could not serve the request.",
  })
) {}

/**
 * ThreadStore port failure.
 *
 * @example
 * ```ts
 * import type { ThreadStoreError } from "@beep/workspace-use-cases/aggregates/Thread/server"
 *
 * const value = {} as ThreadStoreError
 * console.log(value)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export type ThreadStoreError = ThreadStoreNotFound | ThreadStoreConflict | ThreadStoreUnavailable;
