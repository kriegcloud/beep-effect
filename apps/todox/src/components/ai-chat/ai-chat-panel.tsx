"use client";

import { MiniSidebarPanel } from "@beep/todox/components/mini-sidebar";
import { useSidePanel } from "@beep/todox/components/side-panel";
import { Button } from "@beep/todox/components/ui/button";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@beep/todox/components/ui/tooltip";
import { cn } from "@beep/todox/lib/utils";

import {
  ArrowLineLeftIcon,
  ArrowUpIcon,
  ClockCounterClockwiseIcon,
  PaperclipIcon,
  PencilSimpleIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import * as React from "react";

const AI_CHAT_WIDTH = "368px"; // 320px content + 48px for mini sidebar

interface AIChatPanelTriggerProps {
  readonly className?: string;
}

function AIChatPanelTrigger({ className }: AIChatPanelTriggerProps) {
  const { open, togglePanel } = useSidePanel();

  if (open) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant="ghost" size="sm" className={cn("gap-2", className)} onClick={togglePanel}>
              <SparkleIcon className="size-4" />
              <span>Chat</span>
            </Button>
          }
        />
        <TooltipContent side="bottom">Open AI Chat</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface AIChatPanelProps {
  readonly className?: string;
}

/**
 * AIChatPanel - The content of the AI Chat panel.
 * Renders the chat interface with the MiniSidebar positioned flush with the inner edge.
 * Should be rendered inside a SidePanel component.
 */
function AIChatPanel({ className }: AIChatPanelProps) {
  const { togglePanel } = useSidePanel();
  const [inputValue, setInputValue] = React.useState("");

  return (
    <TooltipProvider>
      <div
        data-slot="ai-chat-panel"
        className="relative flex h-full flex-col rounded-lg border border-sidebar-border bg-sidebar shadow-sm"
      >
        {/* MiniSidebar - positioned flush with the inner left edge */}
        <MiniSidebarPanel position="left" />

        {/* Header */}
        <div className="flex h-14 shrink-0 items-center justify-end gap-1 border-b border-sidebar-border px-3">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon" className="size-8">
                  <PencilSimpleIcon className="size-4" />
                </Button>
              }
            />
            <TooltipContent side="bottom">New Chat</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon" className="size-8">
                  <ClockCounterClockwiseIcon className="size-4" />
                </Button>
              }
            />
            <TooltipContent side="bottom">Chat History</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon" className="size-8" onClick={togglePanel}>
                  <ArrowLineLeftIcon className="size-4" />
                </Button>
              }
            />
            <TooltipContent side="bottom">Collapse Panel</TooltipContent>
          </Tooltip>
        </div>

        {/* Content Area */}
        <div className={cn("flex-1 overflow-auto p-4", className)}>
          {/* Placeholder for chat messages */}
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <SparkleIcon className="mx-auto size-12 mb-4 opacity-50" />
              <p className="text-sm">Start a conversation</p>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="shrink-0 border-t border-sidebar-border bg-background px-3 pb-3 pt-2">
          <textarea
            placeholder="What would you like to do next?"
            className="min-h-[60px] w-full resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7 gap-1.5 rounded-full text-xs">
                <SparkleIcon className="size-3" />
                Genesis
              </Button>
              <Button variant="ghost" size="icon" className="size-7">
                <svg
                  role={"img"}
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              </Button>
              <Button variant="ghost" size="icon" className="size-7">
                <svg
                  role="image"
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                </svg>
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="size-7">
                <PaperclipIcon className="size-4" />
              </Button>
              <Button
                size="icon"
                className="size-7 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!inputValue.trim()}
              >
                <ArrowUpIcon className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export { AI_CHAT_WIDTH, AIChatPanel, AIChatPanelTrigger };
