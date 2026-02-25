"use client";

import type { ChatMessage } from "@beep/web/state/chat.atoms";
import { Match, pipe, String as Str } from "effect";
import { ToolCallTrace } from "./ToolCallTrace";

interface MessageBubbleProps {
  readonly message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const fromUser = message.role === "user";

  return (
    <article className={fromUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          fromUser
            ? "max-w-[85%] rounded-xl rounded-br-sm bg-sky-600 px-3 py-2 text-sm text-white"
            : "max-w-[85%] rounded-xl rounded-bl-sm border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        }
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>

        {Match.value(message.streaming).pipe(
          Match.when(true, () => <p className="mt-2 text-xs text-amber-300">Streaming...</p>),
          Match.orElse(() => null)
        )}

        {pipe(Str.trim(message.content), (content) =>
          Match.value(Str.isNonEmpty(content)).pipe(
            Match.when(true, () => null),
            Match.orElse(() => <p className="mt-2 text-xs text-slate-400">Awaiting model text output...</p>)
          )
        )}

        <ToolCallTrace traces={message.toolCalls} />
      </div>
    </article>
  );
}
