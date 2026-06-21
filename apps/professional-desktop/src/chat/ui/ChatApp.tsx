/**
 * Desktop chat surface: composes the {@link Sidebar}, {@link Thread}, and
 * {@link Composer} into the chat layout.
 *
 * The desktop is single-workspace for now, so a v1 default workspace id
 * ({@link DEFAULT_WORKSPACE_ID}) feeds {@link threadsAtoms} and
 * {@link createThreadAtom}. The active thread is the user's explicit
 * {@link selectedThreadAtom} selection, falling back to the most recent thread
 * in the list — mirroring the POC's "follow the list" behavior.
 *
 * @packageDocumentation
 * @category components
 * @since 0.0.0
 */
"use client";

import { selectedThreadAtom, threadsAtoms } from "@beep/agents-client/Chat.atoms";
import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import { OrbBackground } from "@beep/ui/components/orb-background";
import { A, DateTime, O } from "@beep/utils";
import { useAtomValue } from "@effect/atom-react";
import { Order } from "effect";
import * as S from "effect/Schema";
import { AsyncResult } from "effect/unstable/reactivity";
import { Composer } from "./Composer.tsx";
import { Sidebar } from "./Sidebar.tsx";
import { ThemeToggle } from "./ThemeToggle.tsx";
import { Thread } from "./Thread.tsx";
import type { JSX } from "react";

/**
 * The v1 default workspace the desktop chat operates in.
 *
 * The desktop chat surface is single-workspace for this increment; threads are
 * created and listed against this id. A workspace switcher arrives once the
 * desktop owns multiple workspaces.
 */
const DEFAULT_WORKSPACE_ID: WorkspaceIdentity.WorkspaceId = S.decodeUnknownSync(WorkspaceIdentity.WorkspaceId)(1);

const byUpdatedDesc = Order.mapInput(
  Order.Number,
  (thread: { readonly updatedAt: DateTime.DateTime }) => -DateTime.toEpochMillis(thread.updatedAt)
);

/**
 * The composed desktop chat application.
 *
 * @example
 * ```tsx
 * import { ChatApp } from "@/chat/ui/ChatApp"
 *
 * console.log(ChatApp.name) // "ChatApp"
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function ChatApp(): JSX.Element {
  const selected = useAtomValue(selectedThreadAtom);
  const threads = useAtomValue(threadsAtoms(DEFAULT_WORKSPACE_ID));

  // active thread: the explicit selection, else the most recent thread.
  const active = O.orElse(selected, () =>
    AsyncResult.isSuccess(threads)
      ? O.map(A.head(A.sort(threads.value, byUpdatedDesc)), (thread) => thread.id)
      : O.none()
  );

  return (
    <div
      className="relative isolate flex h-screen w-full flex-col overflow-hidden bg-background text-foreground"
      data-testid="chat-app"
    >
      <OrbBackground tone="green" intensity="vivid" />
      <header className="relative flex items-center justify-between gap-2 border-b bg-background/80 px-4 py-3 backdrop-blur">
        <span className="text-sm font-semibold">Professional Desktop — Chat</span>
        <ThemeToggle />
      </header>
      <div className="flex min-h-0 flex-1">
        <Sidebar workspaceId={DEFAULT_WORKSPACE_ID} />
        <main className="flex min-h-0 flex-1 flex-col">
          {O.match(active, {
            onNone: () => (
              <div className="flex flex-1 items-center justify-center text-center" data-testid="chat-no-thread">
                <div>
                  <h2 className="text-lg font-semibold">No thread selected</h2>
                  <p className="text-sm text-muted-foreground">Create a thread to get started.</p>
                </div>
              </div>
            ),
            onSome: (threadId) => (
              <>
                <Thread key={threadId} threadId={threadId} />
                <Composer threadId={threadId} />
              </>
            ),
          })}
        </main>
      </div>
    </div>
  );
}
