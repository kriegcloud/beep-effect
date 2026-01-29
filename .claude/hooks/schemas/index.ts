/**
 * Shared Schema Definitions
 *
 * This file contains all shared schemas for the hook system.
 * All encoding/decoding should use Schema.encode/decode directly instead of sync versions.
 */

import * as Schema from "effect/Schema"

// =============================================================================
// Common Base Fields
// =============================================================================

/**
 * Base fields present in all hook inputs
 */
export const HookInputBase = Schema.Struct({
  session_id: Schema.String,
  transcript_path: Schema.String,
  cwd: Schema.String,
  permission_mode: Schema.String,
  hook_event_name: Schema.String,
})

// =============================================================================
// Tool Input Schemas (for tool_input field)
// =============================================================================

/**
 * Edit tool input
 */
export const EditToolInput = Schema.Struct({
  file_path: Schema.String,
  old_string: Schema.String,
  new_string: Schema.String,
  replace_all: Schema.optional(Schema.Boolean),
})

/**
 * Write tool input
 */
export const WriteToolInput = Schema.Struct({
  file_path: Schema.String,
  content: Schema.String,
})

/**
 * Task tool input (for spawning subagents)
 */
export const TaskToolInput = Schema.Struct({
  description: Schema.String,
  prompt: Schema.String,
  subagent_type: Schema.String,
  model: Schema.optional(Schema.String),
  run_in_background: Schema.optional(Schema.Boolean),
  resume: Schema.optional(Schema.String),
})

/**
 * Generic tool input with common optional fields
 */
export const GenericToolInput = Schema.Struct({
  file_path: Schema.optional(Schema.String),
  notebook_path: Schema.optional(Schema.String),
  content: Schema.optional(Schema.String),
  old_string: Schema.optional(Schema.String),
  new_string: Schema.optional(Schema.String),
})

// =============================================================================
// Tool Response Schemas (for tool_response field in PostToolUse)
// =============================================================================

/**
 * Structured patch entry in Edit/Write responses
 */
export const StructuredPatchEntry = Schema.Struct({
  oldStart: Schema.Number,
  oldLines: Schema.Number,
  newStart: Schema.Number,
  newLines: Schema.Number,
  lines: Schema.Array(Schema.String),
})

/**
 * Edit tool response
 */
export const EditToolResponse = Schema.Struct({
  filePath: Schema.String,
  oldString: Schema.String,
  newString: Schema.String,
  originalFile: Schema.String,
  structuredPatch: Schema.Array(StructuredPatchEntry),
  userModified: Schema.Boolean,
  replaceAll: Schema.Boolean,
})

/**
 * Write tool response
 */
export const WriteToolResponse = Schema.Struct({
  type: Schema.String, // "create" | "overwrite"
  filePath: Schema.String,
  content: Schema.String,
  structuredPatch: Schema.Array(StructuredPatchEntry),
  originalFile: Schema.NullOr(Schema.String),
})

// =============================================================================
// PreToolUse Hook Input
// =============================================================================

/**
 * PreToolUse hook input - received before tool execution
 */
export const PreToolUseInput = Schema.Struct({
  session_id: Schema.String,
  transcript_path: Schema.String,
  cwd: Schema.String,
  permission_mode: Schema.String,
  hook_event_name: Schema.Literal("PreToolUse"),
  tool_name: Schema.String,
  tool_input: GenericToolInput,
  tool_use_id: Schema.String,
})

export type PreToolUseInput = Schema.Schema.Type<typeof PreToolUseInput>

// =============================================================================
// PostToolUse Hook Input
// =============================================================================

/**
 * PostToolUse hook input - received after tool execution
 * Includes tool_response with the result
 */
export const PostToolUseInput = Schema.Struct({
  session_id: Schema.String,
  transcript_path: Schema.String,
  cwd: Schema.String,
  permission_mode: Schema.String,
  hook_event_name: Schema.Literal("PostToolUse"),
  tool_name: Schema.String,
  tool_input: GenericToolInput,
  tool_response: Schema.Unknown, // Varies by tool
  tool_use_id: Schema.String,
})

export type PostToolUseInput = Schema.Schema.Type<typeof PostToolUseInput>

// =============================================================================
// Legacy/Combined ToolUseInput (for backward compatibility)
// =============================================================================

/**
 * Combined ToolUseInput schema - works for both PreToolUse and PostToolUse
 * @deprecated Use PreToolUseInput or PostToolUseInput for better type safety
 */
export const ToolUseInput = Schema.Struct({
  session_id: Schema.String,
  transcript_path: Schema.String,
  cwd: Schema.String,
  permission_mode: Schema.String,
  hook_event_name: Schema.String,
  tool_name: Schema.String,
  tool_input: GenericToolInput,
  tool_response: Schema.optional(Schema.Unknown),
  tool_use_id: Schema.String,
})

export type ToolUseInput = Schema.Schema.Type<typeof ToolUseInput>

// =============================================================================
// UserPromptSubmit Hook Input
// =============================================================================

/**
 * UserPromptSubmit hook input - received when user submits a prompt
 */
export const UserPromptInput = Schema.Struct({
  session_id: Schema.String,
  transcript_path: Schema.String,
  cwd: Schema.String,
  permission_mode: Schema.String,
  hook_event_name: Schema.Literal("UserPromptSubmit"),
  prompt: Schema.String,
})

export type UserPromptInput = Schema.Schema.Type<typeof UserPromptInput>

// =============================================================================
// SessionStart Hook Input
// =============================================================================

/**
 * SessionStart hook input - received when a new session starts
 */
export const SessionStartInput = Schema.Struct({
  session_id: Schema.String,
  transcript_path: Schema.String,
  cwd: Schema.String,
  permission_mode: Schema.String,
  hook_event_name: Schema.Literal("SessionStart"),
})

export type SessionStartInput = Schema.Schema.Type<typeof SessionStartInput>

// =============================================================================
// Hook Output Schemas
// =============================================================================

/**
 * Standard hook output format
 */
export const HookOutput = Schema.Struct({
  hookSpecificOutput: Schema.Struct({
    hookEventName: Schema.String,
    permissionDecision: Schema.optional(Schema.String),
    permissionDecisionReason: Schema.optional(Schema.String),
    additionalContext: Schema.optional(Schema.String),
  }),
})

export type HookOutput = Schema.Schema.Type<typeof HookOutput>
