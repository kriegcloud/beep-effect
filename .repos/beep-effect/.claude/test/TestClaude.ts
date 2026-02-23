import * as Schema from "effect/Schema"

const BashInput = Schema.Struct({
  command: Schema.String,
  restart: Schema.optional(Schema.Boolean),
})

const ReadInput = Schema.Struct({
  file_path: Schema.String,
  offset: Schema.optional(Schema.Number),
  limit: Schema.optional(Schema.Number),
})

const WriteInput = Schema.Struct({
  file_path: Schema.String,
  content: Schema.String,
})

const EditInput = Schema.Struct({
  file_path: Schema.String,
  old_string: Schema.String,
  new_string: Schema.String,
  replace_all: Schema.optional(Schema.Boolean),
})

const GrepInput = Schema.Struct({
  pattern: Schema.String,
  path: Schema.optional(Schema.String),
  glob: Schema.optional(Schema.String),
  type: Schema.optional(Schema.String),
  output_mode: Schema.optional(Schema.Literal("content", "files_with_matches", "count")),
})

const GlobInput = Schema.Struct({
  pattern: Schema.String,
  path: Schema.optional(Schema.String),
})

const TaskInput = Schema.Struct({
  description: Schema.String,
  prompt: Schema.String,
  subagent_type: Schema.String,
  model: Schema.optional(Schema.String),
  run_in_background: Schema.optional(Schema.Boolean),
  resume: Schema.optional(Schema.String),
})

const WebFetchInput = Schema.Struct({
  url: Schema.String,
})

const WebSearchInput = Schema.Struct({
  query: Schema.String,
})

const LSPInput = Schema.Struct({
  operation: Schema.String,
  file: Schema.String,
  line: Schema.Number,
  col: Schema.Number,
  newName: Schema.optional(Schema.String),
})

const NotebookEditInput = Schema.Struct({
  notebook_path: Schema.String,
  cell_index: Schema.Number,
  new_content: Schema.String,
})

const TodoWriteInput = Schema.Struct({
  content: Schema.String,
  append: Schema.optional(Schema.Boolean),
})

const UserPromptSubmitInput = Schema.Struct({
  session_id: Schema.String,
  transcript_path: Schema.String,
  cwd: Schema.String,
  permission_mode: Schema.String,
  hook_event_name: Schema.Literal("UserPromptSubmit"),
  prompt: Schema.String,
})

const SessionStartInput = Schema.Struct({
  session_id: Schema.String,
  transcript_path: Schema.String,
  cwd: Schema.String,
  permission_mode: Schema.String,
  hook_event_name: Schema.Literal("SessionStart"),
})

export const HookInput = Schema.Struct({
  hook_event_name: Schema.Literal("PreToolUse", "PostToolUse"),
  tool_name: Schema.String,
  tool_input: Schema.Unknown,
})

export type HookInput = Schema.Schema.Type<typeof HookInput>

export const HookOutput = Schema.Struct({
  hookSpecificOutput: Schema.Struct({
    hookEventName: Schema.String,
    permissionDecision: Schema.optional(Schema.String),
    permissionDecisionReason: Schema.optional(Schema.String),
    additionalContext: Schema.optional(Schema.String),
  }),
})

export type HookOutput = Schema.Schema.Type<typeof HookOutput>

type ToolHooks<T> = {
  readonly pre: HookInput & { tool_input: T }
  readonly post: HookInput & { tool_input: T }
}

const makeTool =
  <T>(toolName: string) =>
  (input: T): ToolHooks<T> => ({
    pre: { hook_event_name: "PreToolUse", tool_name: toolName, tool_input: input },
    post: { hook_event_name: "PostToolUse", tool_name: toolName, tool_input: input },
  })

export const Bash = makeTool<Schema.Schema.Type<typeof BashInput>>("Bash")
export const Read = makeTool<Schema.Schema.Type<typeof ReadInput>>("Read")
export const Write = makeTool<Schema.Schema.Type<typeof WriteInput>>("Write")
export const Edit = makeTool<Schema.Schema.Type<typeof EditInput>>("Edit")
export const Grep = makeTool<Schema.Schema.Type<typeof GrepInput>>("Grep")
export const Glob = makeTool<Schema.Schema.Type<typeof GlobInput>>("Glob")
export const Task = makeTool<Schema.Schema.Type<typeof TaskInput>>("Task")
export const WebFetch = makeTool<Schema.Schema.Type<typeof WebFetchInput>>("WebFetch")
export const WebSearch = makeTool<Schema.Schema.Type<typeof WebSearchInput>>("WebSearch")
export const LSP = makeTool<Schema.Schema.Type<typeof LSPInput>>("LSP")
export const NotebookEdit = makeTool<Schema.Schema.Type<typeof NotebookEditInput>>("NotebookEdit")
export const TodoWrite = makeTool<Schema.Schema.Type<typeof TodoWriteInput>>("TodoWrite")

export const UserPromptSubmit = (input: Omit<Schema.Schema.Type<typeof UserPromptSubmitInput>, "hook_event_name">): Schema.Schema.Type<typeof UserPromptSubmitInput> => ({
  hook_event_name: "UserPromptSubmit",
  ...input,
})

export const SessionStart = (input: Omit<Schema.Schema.Type<typeof SessionStartInput>, "hook_event_name">): Schema.Schema.Type<typeof SessionStartInput> => ({
  hook_event_name: "SessionStart",
  ...input,
})

export const isAsk = (output: HookOutput | null) =>
  output?.hookSpecificOutput.permissionDecision === "ask"

export const isDeny = (output: HookOutput | null) =>
  output?.hookSpecificOutput.permissionDecision === "deny"

export const isAllow = (output: HookOutput | null) =>
  output?.hookSpecificOutput.permissionDecision === "allow"

export const reason = (output: HookOutput | null) =>
  output?.hookSpecificOutput.permissionDecisionReason

export const context = (output: HookOutput | null) =>
  output?.hookSpecificOutput.additionalContext
