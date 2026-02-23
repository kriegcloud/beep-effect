/**
 * Shared Schema Definitions
 *
 * This file contains all shared schemas for the hook system.
 * All encoding/decoding should use Schema.encode/decode directly instead of sync versions.
 */

import * as Schema from "effect/Schema"

// FileLock schema - represents a lock held by an agent on a specific file
export const FileLock = Schema.Struct({
  agentId: Schema.String,
  acquiredAt: Schema.String, // ISO timestamp
  lastModified: Schema.String
})

export type FileLock = Schema.Schema.Type<typeof FileLock>

// FileLocks - map of file path → lock
export const FileLocks = Schema.Record({
  key: Schema.String,
  value: FileLock
})

export type FileLocks = Schema.Schema.Type<typeof FileLocks>

// ToolUseInput schema - represents tool usage in PreToolUse/PostToolUse hooks
export const ToolUseInput = Schema.Struct({
  session_id: Schema.String,
  transcript_path: Schema.String,
  cwd: Schema.String,
  permission_mode: Schema.String,
  hook_event_name: Schema.String,
  tool_name: Schema.String,
  tool_input: Schema.Struct({
    file_path: Schema.optional(Schema.String),
    notebook_path: Schema.optional(Schema.String),
  }),
})

export type ToolUseInput = Schema.Schema.Type<typeof ToolUseInput>

// UserPromptInput schema - represents user input in UserPromptSubmit hook
export const UserPromptInput = Schema.Struct({
  session_id: Schema.String,
  transcript_path: Schema.String,
  cwd: Schema.String,
  permission_mode: Schema.String,
  hook_event_name: Schema.String,
  prompt: Schema.String,
})

export type UserPromptInput = Schema.Schema.Type<typeof UserPromptInput>
