import * as S from "effect/Schema"
import { withToolInput } from "./Annotations.js"

const AgentModel = S.Literals(["sonnet", "opus", "haiku"])

export const AgentInput = withToolInput(
  S.Struct({
    description: S.String,
    prompt: S.String,
    subagent_type: S.String,
    model: S.optional(AgentModel),
    resume: S.optional(S.String),
    run_in_background: S.optional(S.Boolean),
    max_turns: S.optional(S.Number)
  }),
  "AgentInput"
)

export type AgentInput = typeof AgentInput.Type
export type AgentInputEncoded = typeof AgentInput.Encoded

const SimulatedSedEdit = S.Struct({
  filePath: S.String,
  newContent: S.String
})

export const BashInput = withToolInput(
  S.Struct({
    command: S.String,
    timeout: S.optional(S.Number),
    description: S.optional(S.String),
    run_in_background: S.optional(S.Boolean),
    dangerouslyDisableSandbox: S.optional(S.Boolean),
    _simulatedSedEdit: S.optional(SimulatedSedEdit)
  }),
  "BashInput"
)

export type BashInput = typeof BashInput.Type
export type BashInputEncoded = typeof BashInput.Encoded

export const TaskOutputInput = withToolInput(
  S.Struct({
    task_id: S.String,
    block: S.Boolean,
    timeout: S.Number
  }),
  "TaskOutputInput"
)

export type TaskOutputInput = typeof TaskOutputInput.Type
export type TaskOutputInputEncoded = typeof TaskOutputInput.Encoded

const ExitPlanModePrompt = S.Struct({
  tool: S.Literal("Bash"),
  prompt: S.String
})

const ExitPlanModeBase = S.Struct({
  allowedPrompts: S.optional(S.Array(ExitPlanModePrompt)),
  pushToRemote: S.optional(S.Boolean),
  remoteSessionId: S.optional(S.String),
  remoteSessionUrl: S.optional(S.String)
})

export const ExitPlanModeInput = withToolInput(
  S.StructWithRest(ExitPlanModeBase, [S.Record( S.String, S.Unknown )]),
  "ExitPlanModeInput"
)

export type ExitPlanModeInput = typeof ExitPlanModeInput.Type
export type ExitPlanModeInputEncoded = typeof ExitPlanModeInput.Encoded

export const FileEditInput = withToolInput(
  S.Struct({
    file_path: S.String,
    old_string: S.String,
    new_string: S.String,
    replace_all: S.optional(S.Boolean)
  }),
  "FileEditInput"
)

export type FileEditInput = typeof FileEditInput.Type
export type FileEditInputEncoded = typeof FileEditInput.Encoded

export const FileReadInput = withToolInput(
  S.Struct({
    file_path: S.String,
    offset: S.optional(S.Number),
    limit: S.optional(S.Number)
  }),
  "FileReadInput"
)

export type FileReadInput = typeof FileReadInput.Type
export type FileReadInputEncoded = typeof FileReadInput.Encoded

export const FileWriteInput = withToolInput(
  S.Struct({
    file_path: S.String,
    content: S.String
  }),
  "FileWriteInput"
)

export type FileWriteInput = typeof FileWriteInput.Type
export type FileWriteInputEncoded = typeof FileWriteInput.Encoded

export const GlobInput = withToolInput(
  S.Struct({
    pattern: S.String,
    path: S.optional(S.String)
  }),
  "GlobInput"
)

export type GlobInput = typeof GlobInput.Type
export type GlobInputEncoded = typeof GlobInput.Encoded

const GrepOutputMode = S.Literals(["content", "files_with_matches", "count"])

export const GrepInput = withToolInput(
  S.Struct({
    pattern: S.String,
    path: S.optional(S.String),
    glob: S.optional(S.String),
    output_mode: S.optional(GrepOutputMode),
    "-B": S.optional(S.Number),
    "-A": S.optional(S.Number),
    "-C": S.optional(S.Number),
    "-n": S.optional(S.Boolean),
    "-i": S.optional(S.Boolean),
    type: S.optional(S.String),
    head_limit: S.optional(S.Number),
    offset: S.optional(S.Number),
    multiline: S.optional(S.Boolean)
  }),
  "GrepInput"
)

export type GrepInput = typeof GrepInput.Type
export type GrepInputEncoded = typeof GrepInput.Encoded

export const KillShellInput = withToolInput(
  S.Struct({
    shell_id: S.String
  }),
  "KillShellInput"
)

export type KillShellInput = typeof KillShellInput.Type
export type KillShellInputEncoded = typeof KillShellInput.Encoded

export const ListMcpResourcesInput = withToolInput(
  S.Struct({
    server: S.optional(S.String)
  }),
  "ListMcpResourcesInput"
)

export type ListMcpResourcesInput = typeof ListMcpResourcesInput.Type
export type ListMcpResourcesInputEncoded = typeof ListMcpResourcesInput.Encoded

export const McpInput = withToolInput(
  S.Record( S.String,  S.Unknown ),
  "McpInput"
)

export type McpInput = typeof McpInput.Type
export type McpInputEncoded = typeof McpInput.Encoded

const NotebookCellType = S.Literals(["code", "markdown"])
const NotebookEditMode = S.Literals(["replace", "insert", "delete"])

export const NotebookEditInput = withToolInput(
  S.Struct({
    notebook_path: S.String,
    cell_id: S.optional(S.String),
    new_source: S.String,
    cell_type: S.optional(NotebookCellType),
    edit_mode: S.optional(NotebookEditMode)
  }),
  "NotebookEditInput"
)

export type NotebookEditInput = typeof NotebookEditInput.Type
export type NotebookEditInputEncoded = typeof NotebookEditInput.Encoded

export const ReadMcpResourceInput = withToolInput(
  S.Struct({
    server: S.String,
    uri: S.String
  }),
  "ReadMcpResourceInput"
)

export type ReadMcpResourceInput = typeof ReadMcpResourceInput.Type
export type ReadMcpResourceInputEncoded = typeof ReadMcpResourceInput.Encoded

const TodoStatus = S.Literals(["pending", "in_progress", "completed"])

const TodoItem = S.Struct({
  content: S.String,
  status: TodoStatus,
  activeForm: S.String
})

export const TodoWriteInput = withToolInput(
  S.Struct({
    todos: S.Array(TodoItem)
  }),
  "TodoWriteInput"
)

export type TodoWriteInput = typeof TodoWriteInput.Type
export type TodoWriteInputEncoded = typeof TodoWriteInput.Encoded

export const WebFetchInput = withToolInput(
  S.Struct({
    url: S.String,
    prompt: S.String
  }),
  "WebFetchInput"
)

export type WebFetchInput = typeof WebFetchInput.Type
export type WebFetchInputEncoded = typeof WebFetchInput.Encoded

export const WebSearchInput = withToolInput(
  S.Struct({
    query: S.String,
    allowed_domains: S.optional(S.Array(S.String)),
    blocked_domains: S.optional(S.Array(S.String))
  }),
  "WebSearchInput"
)

export type WebSearchInput = typeof WebSearchInput.Type
export type WebSearchInputEncoded = typeof WebSearchInput.Encoded

const QuestionOption = S.Struct({
  label: S.String,
  description: S.String
})

const Question = S.Struct({
  question: S.String,
  header: S.String,
  options: S.Array(QuestionOption).check(
    S.makeFilterGroup(
[
  S.isMinLength(2),
  S.isMaxLength(4)
]
    )
  ),
  multiSelect: S.Boolean
})

const QuestionMetadata = S.Struct({
  source: S.optional(S.String)
})

export const AskUserQuestionInput = withToolInput(
  S.Struct({
    questions: S.Array(Question).check(
    S.makeFilterGroup([
        S.isMinLength(1),
      S.isMaxLength(4)
    ])
    ),
    answers: S.optional(S.Record( S.String, S.String)),
    metadata: S.optional(QuestionMetadata)
  }),
  "AskUserQuestionInput"
)

export type AskUserQuestionInput = typeof AskUserQuestionInput.Type
export type AskUserQuestionInputEncoded = typeof AskUserQuestionInput.Encoded

export const ConfigInput = withToolInput(
  S.Struct({
    setting: S.String,
    value: S.optional(S.Union([S.String, S.Boolean, S.Number]))
  }),
  "ConfigInput"
)

export type ConfigInput = typeof ConfigInput.Type
export type ConfigInputEncoded = typeof ConfigInput.Encoded

export const ToolInput = S.Union(
  [
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
    ConfigInput]
)

export type ToolInput = typeof ToolInput.Type
export type ToolInputEncoded = typeof ToolInput.Encoded
