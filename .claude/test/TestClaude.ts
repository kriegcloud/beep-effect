import * as S from "effect/Schema";

const BashInput = S.Struct({
  command: S.String,
  restart: S.optional(S.Boolean),
});

const ReadInput = S.Struct({
  file_path: S.String,
  offset: S.optional(S.Number),
  limit: S.optional(S.Number),
});

const WriteInput = S.Struct({
  file_path: S.String,
  content: S.String,
});

const EditInput = S.Struct({
  file_path: S.String,
  old_string: S.String,
  new_string: S.String,
  replace_all: S.optional(S.Boolean),
});

const GrepInput = S.Struct({
  pattern: S.String,
  path: S.optional(S.String),
  glob: S.optional(S.String),
  type: S.optional(S.String),
  output_mode: S.optional(S.Literals(["content", "files_with_matches", "count"])),
});

const GlobInput = S.Struct({
  pattern: S.String,
  path: S.optional(S.String),
});

const TaskInput = S.Struct({
  description: S.String,
  prompt: S.String,
  subagent_type: S.String,
  model: S.optional(S.String),
  run_in_background: S.optional(S.Boolean),
  resume: S.optional(S.String),
});

const WebFetchInput = S.Struct({
  url: S.String,
});

const WebSearchInput = S.Struct({
  query: S.String,
});

const LSPInput = S.Struct({
  operation: S.String,
  file: S.String,
  line: S.Number,
  col: S.Number,
  newName: S.optional(S.String),
});

const NotebookEditInput = S.Struct({
  notebook_path: S.String,
  cell_index: S.Number,
  new_content: S.String,
});

const TodoWriteInput = S.Struct({
  content: S.String,
  append: S.optional(S.Boolean),
});

const UserPromptSubmitInput = S.Struct({
  session_id: S.String,
  transcript_path: S.String,
  cwd: S.String,
  permission_mode: S.String,
  hook_event_name: S.Literal("UserPromptSubmit"),
  prompt: S.String,
});

const SessionStartInput = S.Struct({
  session_id: S.String,
  transcript_path: S.String,
  cwd: S.String,
  permission_mode: S.String,
  hook_event_name: S.Literal("SessionStart"),
});

export const HookInput = S.Struct({
  hook_event_name: S.Literals(["PreToolUse", "PostToolUse"]),
  tool_name: S.String,
  tool_input: S.Unknown,
});

export type HookInput = S.Schema.Type<typeof HookInput>;

export const HookOutput = S.Struct({
  hookSpecificOutput: S.Struct({
    hookEventName: S.String,
    permissionDecision: S.optional(S.String),
    permissionDecisionReason: S.optional(S.String),
    additionalContext: S.optional(S.String),
  }),
});

export type HookOutput = S.Schema.Type<typeof HookOutput>;

type ToolHooks<T> = {
  readonly pre: HookInput & { tool_input: T };
  readonly post: HookInput & { tool_input: T };
};

const makeTool =
  <T>(toolName: string) =>
  (input: T): ToolHooks<T> => ({
    pre: { hook_event_name: "PreToolUse", tool_name: toolName, tool_input: input },
    post: { hook_event_name: "PostToolUse", tool_name: toolName, tool_input: input },
  });

export const Bash = makeTool<S.Schema.Type<typeof BashInput>>("Bash");
export const Read = makeTool<S.Schema.Type<typeof ReadInput>>("Read");
export const Write = makeTool<S.Schema.Type<typeof WriteInput>>("Write");
export const Edit = makeTool<S.Schema.Type<typeof EditInput>>("Edit");
export const Grep = makeTool<S.Schema.Type<typeof GrepInput>>("Grep");
export const Glob = makeTool<S.Schema.Type<typeof GlobInput>>("Glob");
export const Task = makeTool<S.Schema.Type<typeof TaskInput>>("Task");
export const WebFetch = makeTool<S.Schema.Type<typeof WebFetchInput>>("WebFetch");
export const WebSearch = makeTool<S.Schema.Type<typeof WebSearchInput>>("WebSearch");
export const LSP = makeTool<S.Schema.Type<typeof LSPInput>>("LSP");
export const NotebookEdit = makeTool<S.Schema.Type<typeof NotebookEditInput>>("NotebookEdit");
export const TodoWrite = makeTool<S.Schema.Type<typeof TodoWriteInput>>("TodoWrite");

export const UserPromptSubmit = (
  input: Omit<S.Schema.Type<typeof UserPromptSubmitInput>, "hook_event_name">
): S.Schema.Type<typeof UserPromptSubmitInput> => ({
  hook_event_name: "UserPromptSubmit",
  ...input,
});

export const SessionStart = (
  input: Omit<S.Schema.Type<typeof SessionStartInput>, "hook_event_name">
): S.Schema.Type<typeof SessionStartInput> => ({
  hook_event_name: "SessionStart",
  ...input,
});

export const isAsk = (output: HookOutput | null) => output?.hookSpecificOutput.permissionDecision === "ask";

export const isDeny = (output: HookOutput | null) => output?.hookSpecificOutput.permissionDecision === "deny";

export const isAllow = (output: HookOutput | null) => output?.hookSpecificOutput.permissionDecision === "allow";

export const reason = (output: HookOutput | null) => output?.hookSpecificOutput.permissionDecisionReason;

export const context = (output: HookOutput | null) => output?.hookSpecificOutput.additionalContext;
