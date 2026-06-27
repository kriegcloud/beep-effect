import type { ToolName } from "@app/domain/api/chat-rpc";
import type * as Cause from "effect/Cause";

export type ToolStatus = {
  readonly id: string;
  readonly toolName: ToolName;
  readonly status: "start" | "success" | "failure";
  readonly input: string;
  readonly output: string | null;
};

export type ContentBlock =
  | { readonly _tag: "text"; readonly content: string; }
  | { readonly _tag: "reasoning"; readonly content: string; }
  | { readonly _tag: "tool_group"; readonly tools: readonly ToolStatus[]; };

export type UIMessage = {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly contentBlocks: readonly ContentBlock[];
  readonly error: Cause.Cause<unknown> | null;
};

export type StreamState = {
  readonly contentBlocks: readonly ContentBlock[];
};
