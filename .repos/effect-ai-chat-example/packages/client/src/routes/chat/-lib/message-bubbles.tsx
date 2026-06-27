import * as Cause from "effect/Cause";
import * as React from "react";
import type { UIMessage } from "./chat-types.js";
import { ContentBlockRenderer } from "./content-blocks.js";
import { Markdown } from "./markdown.js";

export const UserBubble = React.memo(function UserBubble({
  message,
}: {
  readonly message: UIMessage;
}) {
  return (
    <div className="flex justify-end px-4 py-2">
      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-user-bubble text-user-bubble-foreground">
        <Markdown content={message.content} className="text-sm [&_p]:m-0" />
      </div>
    </div>
  );
});

export const AssistantMessage = React.memo(function AssistantMessage({
  message,
  isStreaming,
}: {
  readonly message: UIMessage;
  readonly isStreaming: boolean;
}) {
  return (
    <div className="px-4 py-2 max-w-[80%]">
      {message.error !== null
        ? (
          <div className="text-danger">
            <pre className="text-sm whitespace-pre-wrap">{Cause.pretty(message.error)}</pre>
          </div>
        )
        : message.contentBlocks.length > 0
        ? (
          <div className="space-y-1">
            {message.contentBlocks.map((block, i) => (
              <ContentBlockRenderer key={i} block={block} isStreaming={isStreaming} />
            ))}
          </div>
        )
        : isStreaming && !message.content
        ? <span className="text-muted text-sm animate-pulse">Thinking...</span>
        : message.content
        ? <Markdown content={message.content} />
        : <span className="text-muted text-sm italic">(no response)</span>}
    </div>
  );
});
