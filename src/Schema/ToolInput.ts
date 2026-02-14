import * as Schema from "effect/Schema"
import { withToolInput } from "./Annotations.js"

const AgentModel = Schema.Literal("sonnet", "opus", "haiku")

export const AgentInput = withToolInput(
  Schema.Struct({
    description: Schema.String,
    prompt: Schema.String,
    subagent_type: Schema.String,
    model: Schema.optional(AgentModel),
    resume: Schema.optional(Schema.String),
    run_in_background: Schema.optional(Schema.Boolean),
    max_turns: Schema.optional(Schema.Number)
  }),
  "AgentInput"
)

export type AgentInput = typeof AgentInput.Type
export type AgentInputEncoded = typeof AgentInput.Encoded

const SimulatedSedEdit = Schema.Struct({
  filePath: Schema.String,
  newContent: Schema.String
})

export const BashInput = withToolInput(
  Schema.Struct({
    command: Schema.String,
    timeout: Schema.optional(Schema.Number),
    description: Schema.optional(Schema.String),
    run_in_background: Schema.optional(Schema.Boolean),
    dangerouslyDisableSandbox: Schema.optional(Schema.Boolean),
    _simulatedSedEdit: Schema.optional(SimulatedSedEdit)
  }),
  "BashInput"
)

export type BashInput = typeof BashInput.Type
export type BashInputEncoded = typeof BashInput.Encoded

export const TaskOutputInput = withToolInput(
  Schema.Struct({
    task_id: Schema.String,
    block: Schema.Boolean,
    timeout: Schema.Number
  }),
  "TaskOutputInput"
)

export type TaskOutputInput = typeof TaskOutputInput.Type
export type TaskOutputInputEncoded = typeof TaskOutputInput.Encoded

const ExitPlanModePrompt = Schema.Struct({
  tool: Schema.Literal("Bash"),
  prompt: Schema.String
})

const ExitPlanModeBase = Schema.Struct({
  allowedPrompts: Schema.optional(Schema.Array(ExitPlanModePrompt)),
  pushToRemote: Schema.optional(Schema.Boolean),
  remoteSessionId: Schema.optional(Schema.String),
  remoteSessionUrl: Schema.optional(Schema.String)
})

export const ExitPlanModeInput = withToolInput(
  ExitPlanModeBase.pipe(
    Schema.extend(Schema.Record({ key: Schema.String, value: Schema.Unknown }))
  ),
  "ExitPlanModeInput"
)

export type ExitPlanModeInput = typeof ExitPlanModeInput.Type
export type ExitPlanModeInputEncoded = typeof ExitPlanModeInput.Encoded

export const FileEditInput = withToolInput(
  Schema.Struct({
    file_path: Schema.String,
    old_string: Schema.String,
    new_string: Schema.String,
    replace_all: Schema.optional(Schema.Boolean)
  }),
  "FileEditInput"
)

export type FileEditInput = typeof FileEditInput.Type
export type FileEditInputEncoded = typeof FileEditInput.Encoded

export const FileReadInput = withToolInput(
  Schema.Struct({
    file_path: Schema.String,
    offset: Schema.optional(Schema.Number),
    limit: Schema.optional(Schema.Number)
  }),
  "FileReadInput"
)

export type FileReadInput = typeof FileReadInput.Type
export type FileReadInputEncoded = typeof FileReadInput.Encoded

export const FileWriteInput = withToolInput(
  Schema.Struct({
    file_path: Schema.String,
    content: Schema.String
  }),
  "FileWriteInput"
)

export type FileWriteInput = typeof FileWriteInput.Type
export type FileWriteInputEncoded = typeof FileWriteInput.Encoded

export const GlobInput = withToolInput(
  Schema.Struct({
    pattern: Schema.String,
    path: Schema.optional(Schema.String)
  }),
  "GlobInput"
)

export type GlobInput = typeof GlobInput.Type
export type GlobInputEncoded = typeof GlobInput.Encoded

const GrepOutputMode = Schema.Literal("content", "files_with_matches", "count")

export const GrepInput = withToolInput(
  Schema.Struct({
    pattern: Schema.String,
    path: Schema.optional(Schema.String),
    glob: Schema.optional(Schema.String),
    output_mode: Schema.optional(GrepOutputMode),
    "-B": Schema.optional(Schema.Number),
    "-A": Schema.optional(Schema.Number),
    "-C": Schema.optional(Schema.Number),
    "-n": Schema.optional(Schema.Boolean),
    "-i": Schema.optional(Schema.Boolean),
    type: Schema.optional(Schema.String),
    head_limit: Schema.optional(Schema.Number),
    offset: Schema.optional(Schema.Number),
    multiline: Schema.optional(Schema.Boolean)
  }),
  "GrepInput"
)

export type GrepInput = typeof GrepInput.Type
export type GrepInputEncoded = typeof GrepInput.Encoded

export const KillShellInput = withToolInput(
  Schema.Struct({
    shell_id: Schema.String
  }),
  "KillShellInput"
)

export type KillShellInput = typeof KillShellInput.Type
export type KillShellInputEncoded = typeof KillShellInput.Encoded

export const ListMcpResourcesInput = withToolInput(
  Schema.Struct({
    server: Schema.optional(Schema.String)
  }),
  "ListMcpResourcesInput"
)

export type ListMcpResourcesInput = typeof ListMcpResourcesInput.Type
export type ListMcpResourcesInputEncoded = typeof ListMcpResourcesInput.Encoded

export const McpInput = withToolInput(
  Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  "McpInput"
)

export type McpInput = typeof McpInput.Type
export type McpInputEncoded = typeof McpInput.Encoded

const NotebookCellType = Schema.Literal("code", "markdown")
const NotebookEditMode = Schema.Literal("replace", "insert", "delete")

export const NotebookEditInput = withToolInput(
  Schema.Struct({
    notebook_path: Schema.String,
    cell_id: Schema.optional(Schema.String),
    new_source: Schema.String,
    cell_type: Schema.optional(NotebookCellType),
    edit_mode: Schema.optional(NotebookEditMode)
  }),
  "NotebookEditInput"
)

export type NotebookEditInput = typeof NotebookEditInput.Type
export type NotebookEditInputEncoded = typeof NotebookEditInput.Encoded

export const ReadMcpResourceInput = withToolInput(
  Schema.Struct({
    server: Schema.String,
    uri: Schema.String
  }),
  "ReadMcpResourceInput"
)

export type ReadMcpResourceInput = typeof ReadMcpResourceInput.Type
export type ReadMcpResourceInputEncoded = typeof ReadMcpResourceInput.Encoded

const TodoStatus = Schema.Literal("pending", "in_progress", "completed")

const TodoItem = Schema.Struct({
  content: Schema.String,
  status: TodoStatus,
  activeForm: Schema.String
})

export const TodoWriteInput = withToolInput(
  Schema.Struct({
    todos: Schema.Array(TodoItem)
  }),
  "TodoWriteInput"
)

export type TodoWriteInput = typeof TodoWriteInput.Type
export type TodoWriteInputEncoded = typeof TodoWriteInput.Encoded

export const WebFetchInput = withToolInput(
  Schema.Struct({
    url: Schema.String,
    prompt: Schema.String
  }),
  "WebFetchInput"
)

export type WebFetchInput = typeof WebFetchInput.Type
export type WebFetchInputEncoded = typeof WebFetchInput.Encoded

export const WebSearchInput = withToolInput(
  Schema.Struct({
    query: Schema.String,
    allowed_domains: Schema.optional(Schema.Array(Schema.String)),
    blocked_domains: Schema.optional(Schema.Array(Schema.String))
  }),
  "WebSearchInput"
)

export type WebSearchInput = typeof WebSearchInput.Type
export type WebSearchInputEncoded = typeof WebSearchInput.Encoded

const QuestionOption = Schema.Struct({
  label: Schema.String,
  description: Schema.String
})

const Question = Schema.Struct({
  question: Schema.String,
  header: Schema.String,
  options: Schema.Array(QuestionOption).pipe(
    Schema.minItems(2),
    Schema.maxItems(4)
  ),
  multiSelect: Schema.Boolean
})

const QuestionMetadata = Schema.Struct({
  source: Schema.optional(Schema.String)
})

export const AskUserQuestionInput = withToolInput(
  Schema.Struct({
    questions: Schema.Array(Question).pipe(
      Schema.minItems(1),
      Schema.maxItems(4)
    ),
    answers: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String })),
    metadata: Schema.optional(QuestionMetadata)
  }),
  "AskUserQuestionInput"
)

export type AskUserQuestionInput = typeof AskUserQuestionInput.Type
export type AskUserQuestionInputEncoded = typeof AskUserQuestionInput.Encoded

export const ConfigInput = withToolInput(
  Schema.Struct({
    setting: Schema.String,
    value: Schema.optional(Schema.Union(Schema.String, Schema.Boolean, Schema.Number))
  }),
  "ConfigInput"
)

export type ConfigInput = typeof ConfigInput.Type
export type ConfigInputEncoded = typeof ConfigInput.Encoded

export const ToolInput = Schema.Union(
  AgentInput,
  BashInput,
  TaskOutputInput,
  ExitPlanModeInput,
  FileEditInput,
  FileReadInput,
  FileWriteInput,
  GlobInput,
  GrepInput,
  KillShellInput,
  ListMcpResourcesInput,
  McpInput,
  NotebookEditInput,
  ReadMcpResourceInput,
  TodoWriteInput,
  WebFetchInput,
  WebSearchInput,
  AskUserQuestionInput,
  ConfigInput
)

export type ToolInput = typeof ToolInput.Type
export type ToolInputEncoded = typeof ToolInput.Encoded
