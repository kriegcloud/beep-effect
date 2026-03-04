/**
 * Shared schema definitions for Claude hooks.
 */

import { $ClaudeId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $ClaudeId.create("hooks/schemas/index");

/**
 * Base fields present in all hook inputs.
 */
export class HookInputBase extends S.Class<HookInputBase>($I`HookInputBase`)(
  {
    session_id: S.String,
    transcript_path: S.String,
    cwd: S.String,
    permission_mode: S.String,
    hook_event_name: S.String,
  },
  $I.annote("HookInputBase", {
    description: "Shared hook input base fields.",
  })
) {}

/**
 * Edit tool input.
 */
export class EditToolInput extends S.Class<EditToolInput>($I`EditToolInput`)(
  {
    file_path: S.String,
    old_string: S.String,
    new_string: S.String,
    replace_all: S.optionalKey(S.UndefinedOr(S.Boolean)),
  },
  $I.annote("EditToolInput", {
    description: "Edit tool payload for hook tool_input.",
  })
) {}

/**
 * Write tool input.
 */
export class WriteToolInput extends S.Class<WriteToolInput>($I`WriteToolInput`)(
  {
    file_path: S.String,
    content: S.String,
  },
  $I.annote("WriteToolInput", {
    description: "Write tool payload for hook tool_input.",
  })
) {}

/**
 * Task tool input (for spawning subagents).
 */
export class TaskToolInput extends S.Class<TaskToolInput>($I`TaskToolInput`)(
  {
    description: S.String,
    prompt: S.String,
    subagent_type: S.String,
    model: S.optionalKey(S.UndefinedOr(S.String)),
    run_in_background: S.optionalKey(S.UndefinedOr(S.Boolean)),
    resume: S.optionalKey(S.UndefinedOr(S.String)),
  },
  $I.annote("TaskToolInput", {
    description: "Task tool payload for subagent orchestration.",
  })
) {}

/**
 * Generic tool input with common optional fields.
 */
export class GenericToolInput extends S.Class<GenericToolInput>($I`GenericToolInput`)(
  {
    file_path: S.optionalKey(S.UndefinedOr(S.String)),
    notebook_path: S.optionalKey(S.UndefinedOr(S.String)),
    content: S.optionalKey(S.UndefinedOr(S.String)),
    old_string: S.optionalKey(S.UndefinedOr(S.String)),
    new_string: S.optionalKey(S.UndefinedOr(S.String)),
  },
  $I.annote("GenericToolInput", {
    description: "Lenient tool_input payload shared across hook events.",
  })
) {}

/**
 * Structured patch entry in Edit/Write responses.
 */
export class StructuredPatchEntry extends S.Class<StructuredPatchEntry>($I`StructuredPatchEntry`)(
  {
    oldStart: S.Number,
    oldLines: S.Number,
    newStart: S.Number,
    newLines: S.Number,
    lines: S.Array(S.String),
  },
  $I.annote("StructuredPatchEntry", {
    description: "Structured patch row for tool responses.",
  })
) {}

/**
 * Edit tool response.
 */
export class EditToolResponse extends S.Class<EditToolResponse>($I`EditToolResponse`)(
  {
    filePath: S.String,
    oldString: S.String,
    newString: S.String,
    originalFile: S.String,
    structuredPatch: S.Array(StructuredPatchEntry),
    userModified: S.Boolean,
    replaceAll: S.Boolean,
  },
  $I.annote("EditToolResponse", {
    description: "Edit tool response payload.",
  })
) {}

/**
 * Write tool response.
 */
export class WriteToolResponse extends S.Class<WriteToolResponse>($I`WriteToolResponse`)(
  {
    type: S.String,
    filePath: S.String,
    content: S.String,
    structuredPatch: S.Array(StructuredPatchEntry),
    originalFile: S.NullOr(S.String),
  },
  $I.annote("WriteToolResponse", {
    description: "Write tool response payload.",
  })
) {}

/**
 * PreToolUse hook input.
 */
export class PreToolUseInput extends S.Class<PreToolUseInput>($I`PreToolUseInput`)(
  {
    session_id: S.String,
    transcript_path: S.String,
    cwd: S.String,
    permission_mode: S.String,
    hook_event_name: S.Literal("PreToolUse"),
    tool_name: S.String,
    tool_input: GenericToolInput,
    tool_use_id: S.String,
  },
  $I.annote("PreToolUseInput", {
    description: "Hook payload received before tool execution.",
  })
) {}

/**
 * PostToolUse hook input.
 */
export class PostToolUseInput extends S.Class<PostToolUseInput>($I`PostToolUseInput`)(
  {
    session_id: S.String,
    transcript_path: S.String,
    cwd: S.String,
    permission_mode: S.String,
    hook_event_name: S.Literal("PostToolUse"),
    tool_name: S.String,
    tool_input: GenericToolInput,
    tool_response: S.Unknown,
    tool_use_id: S.String,
  },
  $I.annote("PostToolUseInput", {
    description: "Hook payload received after tool execution.",
  })
) {}

/**
 * Combined ToolUseInput schema for backward compatibility.
 */
export class ToolUseInput extends S.Class<ToolUseInput>($I`ToolUseInput`)(
  {
    session_id: S.String,
    transcript_path: S.String,
    cwd: S.String,
    permission_mode: S.String,
    hook_event_name: S.String,
    tool_name: S.String,
    tool_input: GenericToolInput,
    tool_response: S.optionalKey(S.UndefinedOr(S.Unknown)),
    tool_use_id: S.String,
  },
  $I.annote("ToolUseInput", {
    description: "Legacy combined tool hook payload.",
  })
) {}

/**
 * UserPromptSubmit hook input.
 */
export class UserPromptInput extends S.Class<UserPromptInput>($I`UserPromptInput`)(
  {
    session_id: S.String,
    transcript_path: S.String,
    cwd: S.String,
    permission_mode: S.String,
    hook_event_name: S.Literal("UserPromptSubmit"),
    prompt: S.String,
  },
  $I.annote("UserPromptInput", {
    description: "User prompt hook payload.",
  })
) {}

/**
 * SessionStart hook input.
 */
export class SessionStartInput extends S.Class<SessionStartInput>($I`SessionStartInput`)(
  {
    session_id: S.String,
    transcript_path: S.String,
    cwd: S.String,
    permission_mode: S.String,
    hook_event_name: S.Literal("SessionStart"),
  },
  $I.annote("SessionStartInput", {
    description: "Session start hook payload.",
  })
) {}

class HookSpecificOutput extends S.Class<HookSpecificOutput>($I`HookSpecificOutput`)(
  {
    hookEventName: S.String,
    permissionDecision: S.optionalKey(S.UndefinedOr(S.String)),
    permissionDecisionReason: S.optionalKey(S.UndefinedOr(S.String)),
    additionalContext: S.optionalKey(S.UndefinedOr(S.String)),
  },
  $I.annote("HookSpecificOutput", {
    description: "Hook-specific output payload for hook responses.",
  })
) {}

/**
 * Standard hook output format.
 */
export class HookOutput extends S.Class<HookOutput>($I`HookOutput`)(
  {
    hookSpecificOutput: HookSpecificOutput,
  },
  $I.annote("HookOutput", {
    description: "Standardized hook output wrapper.",
  })
) {}
