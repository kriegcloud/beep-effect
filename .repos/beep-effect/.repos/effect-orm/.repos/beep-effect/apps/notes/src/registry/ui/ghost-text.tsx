"use client";

import { CopilotPlugin } from "@platejs/ai/react";
import { useElement, usePluginOption } from "platejs/react";
import ReactMarkdown, { type Components } from "react-markdown";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

const MarkdownComponents: Components = {
  a: ({ children, href }) => (
    <a
      className="font-medium underline decoration-primary underline-offset-4"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => <span>{children}</span>,
  code: ({ children }) => (
    <code className="rounded-md bg-muted px-[0.3em] py-[0.2em] font-mono text-sm whitespace-pre-wrap">{children}</code>
  ),
  em: ({ children }) => <em>{children}</em>,
  h1: ({ children }) => <>{children}</>,
  h2: ({ children }) => <>{children}</>,
  h3: ({ children }) => <>{children}</>,
  h4: ({ children }) => <>{children}</>,
  h5: ({ children }) => <>{children}</>,
  h6: ({ children }) => <>{children}</>,
  li: ({ children }) => <>{children}</>,
  ol: ({ children }) => <>{children}</>,
  p: ({ children }) => <>{children}</>,
  pre: ({ children }) => <>{children}</>,
  strong: ({ children }) => <strong>{children}</strong>,
  text: ({ children }) => {
    return <span>{children}</span>;
  },
};

export function GhostText() {
  const element = useElement();

  const isSuggested = usePluginOption(CopilotPlugin, "isSuggested", element.id as string);

  if (!isSuggested) return null;

  return <GhostTextContent />;
}

function GhostTextContent() {
  const suggestionText = usePluginOption(CopilotPlugin, "suggestionText");
  const hasLeadingSpace = suggestionText?.startsWith(" ");

  return (
    <HoverCard>
      <HoverCardTrigger
        asChild
        onMouseDown={(e) => {
          e.preventDefault();
        }}
      >
        <span className="text-muted-foreground max-sm:hidden" contentEditable={false}>
          {hasLeadingSpace && <span> </span>}

          {suggestionText && <ReactMarkdown components={MarkdownComponents}>{suggestionText}</ReactMarkdown>}
        </span>
      </HoverCardTrigger>

      <HoverCardContent
        className="flex w-auto items-center justify-between p-2 text-sm"
        onMouseDown={(e) => {
          e.preventDefault();
        }}
        align="start"
        contentEditable={false}
        side="top"
      >
        <div className="mr-3 flex items-center">
          <span className="mr-1 shrink-0">Accept All:</span>
          <kbd className="rounded border bg-muted px-2 py-0.5 text-muted-foreground">Tab</kbd>
        </div>

        <div className="mr-3 flex items-center">
          <span className="mr-1 shrink-0">Accept Word:</span>
          <kbd className="rounded border bg-muted px-2 py-0.5 text-muted-foreground">⌘</kbd>
          <span className="mx-px">+</span>
          <kbd className="rounded border bg-muted px-2 py-0.5 text-muted-foreground">→</kbd>
        </div>

        <div className="flex items-center">
          <span className="mr-1 shrink-0">Cancel:</span>
          <kbd className="rounded border bg-muted px-2 py-0.5 text-muted-foreground">Esc</kbd>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
