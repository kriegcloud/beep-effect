/**
 * Shared Schema Definitions
 *
 * This file contains all shared schemas for the hook system.
 * All encoding/decoding should use S.encode/decode directly instead of sync versions.
 */

import * as S from "effect/Schema";

// =============================================================================
// Common Base Fields
// =============================================================================

/**
 * Base fields present in all hook inputs
 */
export const HookInputBase = S.Struct({
  session_id: S.String,
  transcript_path: S.String,
  cwd: S.String,
  permission_mode: S.String,
  hook_event_name: S.String,
});

// =============================================================================
// Tool Input Schemas (for tool_input field)
// =============================================================================

/**
 * Edit tool input
 */
export const EditToolInput = S.Struct({
  file_path: S.String,
  old_string: S.String,
  new_string: S.String,
  replace_all: S.optional(S.Boolean),
});

/**
 * Write tool input
 */
export const WriteToolInput = S.Struct({
  file_path: S.String,
  content: S.String,
});

/**
 * Task tool input (for spawning subagents)
 */
export const TaskToolInput = S.Struct({
  description: S.String,
  prompt: S.String,
  subagent_type: S.String,
  model: S.optional(S.String),
  run_in_background: S.optional(S.Boolean),
  resume: S.optional(S.String),
});

/**
 * Generic tool input with common optional fields
 */
export const GenericToolInput = S.Struct({
  file_path: S.optional(S.String),
  notebook_path: S.optional(S.String),
  content: S.optional(S.String),
  old_string: S.optional(S.String),
  new_string: S.optional(S.String),
});

// =============================================================================
// Tool Response Schemas (for tool_response field in PostToolUse)
// =============================================================================

/**
 * Structured patch entry in Edit/Write responses
 */
export const StructuredPatchEntry = S.Struct({
  oldStart: S.Number,
  oldLines: S.Number,
  newStart: S.Number,
  newLines: S.Number,
  lines: S.Array(S.String),
});

/**
 * Edit tool response
 */
export const EditToolResponse = S.Struct({
  filePath: S.String,
  oldString: S.String,
  newString: S.String,
  originalFile: S.String,
  structuredPatch: S.Array(StructuredPatchEntry),
  userModified: S.Boolean,
  replaceAll: S.Boolean,
});

/**
 * Write tool response
 */
export const WriteToolResponse = S.Struct({
  type: S.String, // "create" | "overwrite"
  filePath: S.String,
  content: S.String,
  structuredPatch: S.Array(StructuredPatchEntry),
  originalFile: S.NullOr(S.String),
});

// =============================================================================
// PreToolUse Hook Input
// =============================================================================

/**
 * PreToolUse hook input - received before tool execution
 */
export const PreToolUseInput = S.Struct({
  session_id: S.String,
  transcript_path: S.String,
  cwd: S.String,
  permission_mode: S.String,
  hook_event_name: S.Literal("PreToolUse"),
  tool_name: S.String,
  tool_input: GenericToolInput,
  tool_use_id: S.String,
});

export type PreToolUseInput = S.Schema.Type<typeof PreToolUseInput>;

// =============================================================================
// PostToolUse Hook Input
// =============================================================================

/**
 * PostToolUse hook input - received after tool execution
 * Includes tool_response with the result
 */
export const PostToolUseInput = S.Struct({
  session_id: S.String,
  transcript_path: S.String,
  cwd: S.String,
  permission_mode: S.String,
  hook_event_name: S.Literal("PostToolUse"),
  tool_name: S.String,
  tool_input: GenericToolInput,
  tool_response: S.Unknown, // Varies by tool
  tool_use_id: S.String,
});

export type PostToolUseInput = S.Schema.Type<typeof PostToolUseInput>;

// =============================================================================
// Legacy/Combined ToolUseInput (for backward compatibility)
// =============================================================================

/**
 * Combined ToolUseInput schema - works for both PreToolUse and PostToolUse
 * @deprecated Use PreToolUseInput or PostToolUseInput for better type safety
 */
export const ToolUseInput = S.Struct({
  session_id: S.String,
  transcript_path: S.String,
  cwd: S.String,
  permission_mode: S.String,
  hook_event_name: S.String,
  tool_name: S.String,
  tool_input: GenericToolInput,
  tool_response: S.optional(S.Unknown),
  tool_use_id: S.String,
});

export type ToolUseInput = S.Schema.Type<typeof ToolUseInput>;

// =============================================================================
// UserPromptSubmit Hook Input
// =============================================================================

/**
 * UserPromptSubmit hook input - received when user submits a prompt
 */
export const UserPromptInput = S.Struct({
  session_id: S.String,
  transcript_path: S.String,
  cwd: S.String,
  permission_mode: S.String,
  hook_event_name: S.Literal("UserPromptSubmit"),
  prompt: S.String,
});

export type UserPromptInput = S.Schema.Type<typeof UserPromptInput>;

// =============================================================================
// SessionStart Hook Input
// =============================================================================

/**
 * SessionStart hook input - received when a new session starts
 */
export const SessionStartInput = S.Struct({
  session_id: S.String,
  transcript_path: S.String,
  cwd: S.String,
  permission_mode: S.String,
  hook_event_name: S.Literal("SessionStart"),
});

export type SessionStartInput = S.Schema.Type<typeof SessionStartInput>;

// =============================================================================
// Hook Output Schemas
// =============================================================================

/**
 * Standard hook output format
 */
export const HookOutput = S.Struct({
  hookSpecificOutput: S.Struct({
    hookEventName: S.String,
    permissionDecision: S.optional(S.String),
    permissionDecisionReason: S.optional(S.String),
    additionalContext: S.optional(S.String),
  }),
});

export type HookOutput = S.Schema.Type<typeof HookOutput>;
