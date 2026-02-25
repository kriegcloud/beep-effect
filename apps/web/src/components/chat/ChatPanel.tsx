"use client";

import {
  chatContextNodeAtom,
  chatInputAtom,
  chatLatestGraphSnippetAtom,
  chatMessagesAtom,
  clearChatContextNodeAtom,
  sendChatMessageAtom,
} from "@beep/web/state/chat.atoms";
import { useAtom, useAtomValue } from "@effect/atom-react";
import { Match, pipe, String as Str } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult";
import { useCallback, useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";

export function ChatPanel() {
  const messages = useAtomValue(chatMessagesAtom);
  const contextNode = useAtomValue(chatContextNodeAtom);
  const latestSnippet = useAtomValue(chatLatestGraphSnippetAtom);

  const [input, setInput] = useAtom(chatInputAtom);
  const [sendResult, sendMessage] = useAtom(sendChatMessageAtom);
  const [, clearContextNode] = useAtom(clearChatContextNodeAtom);

  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const content = Str.trim(input);

      Match.value(Str.isNonEmpty(content)).pipe(
        Match.when(false, () => undefined),
        Match.orElse(() => {
          sendMessage({
            content,
          });
          return undefined;
        })
      );
    },
    [input, sendMessage]
  );

  const sending = sendResult.waiting;

  const statusCopy = Match.value(sendResult.waiting).pipe(
    Match.when(true, () => "Streaming response..."),
    Match.orElse(() =>
      pipe(
        sendResult,
        AsyncResult.matchWithError({
          onInitial: () => "Ready",
          onError: (error) => `Send failed: ${error}`,
          onDefect: (defect) => `Send failed: ${String(defect)}`,
          onSuccess: () => "Ready",
        })
      )
    )
  );

  return (
    <section className="flex h-full min-h-0 flex-col border-l border-slate-800 bg-slate-900 text-slate-100">
      <header className="border-b border-slate-800 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Chat Workspace</h2>
        <p className="mt-1 text-xs text-slate-400">{statusCopy}</p>

        {pipe(
          contextNode,
          O.match({
            onNone: () => null,
            onSome: (node) => (
              <div className="mt-3 flex items-center justify-between rounded-md border border-sky-700/60 bg-sky-950/50 p-2 text-xs">
                <p>
                  Context: <span className="font-semibold text-sky-300">{node.name}</span>
                </p>
                <button
                  type="button"
                  onClick={() => clearContextNode(undefined)}
                  className="rounded border border-sky-700 px-2 py-1 text-[10px] text-sky-200 hover:bg-sky-900"
                >
                  Clear
                </button>
              </div>
            ),
          })
        )}

        {pipe(
          latestSnippet,
          O.match({
            onNone: () => null,
            onSome: (snippet) => (
              <p className="mt-2 text-xs text-emerald-300">
                Highlighted from tools: {snippet.nodes.length} nodes, {snippet.links.length} links
              </p>
            ),
          })
        )}
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {Match.value(A.isReadonlyArrayNonEmpty(messages)).pipe(
          Match.when(false, () => (
            <p className="rounded-md border border-dashed border-slate-700 p-3 text-sm text-slate-400">
              Ask a question to start a grounded chat session.
            </p>
          )),
          Match.orElse(() =>
            pipe(
              messages,
              A.map((message) => <MessageBubble key={message.id} message={message} />)
            )
          )
        )}
        <div ref={bottomAnchorRef} />
      </div>

      <form onSubmit={onSubmit} className="border-t border-slate-800 px-4 py-3">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about Effect v4 patterns, services, or migration steps..."
            rows={3}
            className="min-h-[72px] flex-1 resize-none rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !Str.isNonEmpty(Str.trim(input))}
            className="h-10 self-end rounded-md bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </section>
  );
}
