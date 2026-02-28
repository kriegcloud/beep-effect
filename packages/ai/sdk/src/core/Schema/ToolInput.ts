import * as S from "effect/Schema";
import { withToolInput } from "./Annotations.js";

const AgentModel = S.Literals(["sonnet", "opus", "haiku"]);

/**
 * @since 0.0.0
 */
export const AgentInput = withToolInput(
  S.Struct({
    description: S.String,
    prompt: S.String,
    subagent_type: S.String,
    model: S.optional(AgentModel),
    resume: S.optional(S.String),
    run_in_background: S.optional(S.Boolean),
    max_turns: S.optional(S.Number),
  }),
  "AgentInput"
);

/**
 * @since 0.0.0
 */
export type AgentInput = typeof AgentInput.Type;
/**
 * @since 0.0.0
 */
export type AgentInputEncoded = typeof AgentInput.Encoded;

const SimulatedSedEdit = S.Struct({
  filePath: S.String,
  newContent: S.String,
});

/**
 * @since 0.0.0
 */
export const BashInput = withToolInput(
  S.Struct({
    command: S.String,
    timeout: S.optional(S.Number),
    description: S.optional(S.String),
    run_in_background: S.optional(S.Boolean),
    dangerouslyDisableSandbox: S.optional(S.Boolean),
    _simulatedSedEdit: S.optional(SimulatedSedEdit),
  }),
  "BashInput"
);

/**
 * @since 0.0.0
 */
export type BashInput = typeof BashInput.Type;
/**
 * @since 0.0.0
 */
export type BashInputEncoded = typeof BashInput.Encoded;

/**
 * @since 0.0.0
 */
export const TaskOutputInput = withToolInput(
  S.Struct({
    task_id: S.String,
    block: S.Boolean,
    timeout: S.Number,
  }),
  "TaskOutputInput"
);

/**
 * @since 0.0.0
 */
export type TaskOutputInput = typeof TaskOutputInput.Type;
/**
 * @since 0.0.0
 */
export type TaskOutputInputEncoded = typeof TaskOutputInput.Encoded;

const ExitPlanModePrompt = S.Struct({
  tool: S.Literal("Bash"),
  prompt: S.String,
});

const ExitPlanModeBase = S.Struct({
  allowedPrompts: S.optional(S.Array(ExitPlanModePrompt)),
  pushToRemote: S.optional(S.Boolean),
  remoteSessionId: S.optional(S.String),
  remoteSessionUrl: S.optional(S.String),
});

/**
 * @since 0.0.0
 */
export const ExitPlanModeInput = withToolInput(
  S.StructWithRest(ExitPlanModeBase, [S.Record(S.String, S.Unknown)]),
  "ExitPlanModeInput"
);

/**
 * @since 0.0.0
 */
export type ExitPlanModeInput = typeof ExitPlanModeInput.Type;
/**
 * @since 0.0.0
 */
export type ExitPlanModeInputEncoded = typeof ExitPlanModeInput.Encoded;

/**
 * @since 0.0.0
 */
export const FileEditInput = withToolInput(
  S.Struct({
    file_path: S.String,
    old_string: S.String,
    new_string: S.String,
    replace_all: S.optional(S.Boolean),
  }),
  "FileEditInput"
);

/**
 * @since 0.0.0
 */
export type FileEditInput = typeof FileEditInput.Type;
/**
 * @since 0.0.0
 */
export type FileEditInputEncoded = typeof FileEditInput.Encoded;

/**
 * @since 0.0.0
 */
export const FileReadInput = withToolInput(
  S.Struct({
    file_path: S.String,
    offset: S.optional(S.Number),
    limit: S.optional(S.Number),
  }),
  "FileReadInput"
);

/**
 * @since 0.0.0
 */
export type FileReadInput = typeof FileReadInput.Type;
/**
 * @since 0.0.0
 */
export type FileReadInputEncoded = typeof FileReadInput.Encoded;

/**
 * @since 0.0.0
 */
export const FileWriteInput = withToolInput(
  S.Struct({
    file_path: S.String,
    content: S.String,
  }),
  "FileWriteInput"
);

/**
 * @since 0.0.0
 */
export type FileWriteInput = typeof FileWriteInput.Type;
/**
 * @since 0.0.0
 */
export type FileWriteInputEncoded = typeof FileWriteInput.Encoded;

/**
 * @since 0.0.0
 */
export const GlobInput = withToolInput(
  S.Struct({
    pattern: S.String,
    path: S.optional(S.String),
  }),
  "GlobInput"
);

/**
 * @since 0.0.0
 */
export type GlobInput = typeof GlobInput.Type;
/**
 * @since 0.0.0
 */
export type GlobInputEncoded = typeof GlobInput.Encoded;

const GrepOutputMode = S.Literals(["content", "files_with_matches", "count"]);

/**
 * @since 0.0.0
 */
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
    multiline: S.optional(S.Boolean),
  }),
  "GrepInput"
);

/**
 * @since 0.0.0
 */
export type GrepInput = typeof GrepInput.Type;
/**
 * @since 0.0.0
 */
export type GrepInputEncoded = typeof GrepInput.Encoded;

/**
 * @since 0.0.0
 */
export const KillShellInput = withToolInput(
  S.Struct({
    shell_id: S.String,
  }),
  "KillShellInput"
);

/**
 * @since 0.0.0
 */
export type KillShellInput = typeof KillShellInput.Type;
/**
 * @since 0.0.0
 */
export type KillShellInputEncoded = typeof KillShellInput.Encoded;

/**
 * @since 0.0.0
 */
export const ListMcpResourcesInput = withToolInput(
  S.Struct({
    server: S.optional(S.String),
  }),
  "ListMcpResourcesInput"
);

/**
 * @since 0.0.0
 */
export type ListMcpResourcesInput = typeof ListMcpResourcesInput.Type;
/**
 * @since 0.0.0
 */
export type ListMcpResourcesInputEncoded = typeof ListMcpResourcesInput.Encoded;

/**
 * @since 0.0.0
 */
export const McpInput = withToolInput(S.Record(S.String, S.Unknown), "McpInput");

/**
 * @since 0.0.0
 */
export type McpInput = typeof McpInput.Type;
/**
 * @since 0.0.0
 */
export type McpInputEncoded = typeof McpInput.Encoded;

const NotebookCellType = S.Literals(["code", "markdown"]);
const NotebookEditMode = S.Literals(["replace", "insert", "delete"]);

/**
 * @since 0.0.0
 */
export const NotebookEditInput = withToolInput(
  S.Struct({
    notebook_path: S.String,
    cell_id: S.optional(S.String),
    new_source: S.String,
    cell_type: S.optional(NotebookCellType),
    edit_mode: S.optional(NotebookEditMode),
  }),
  "NotebookEditInput"
);

/**
 * @since 0.0.0
 */
export type NotebookEditInput = typeof NotebookEditInput.Type;
/**
 * @since 0.0.0
 */
export type NotebookEditInputEncoded = typeof NotebookEditInput.Encoded;

/**
 * @since 0.0.0
 */
export const ReadMcpResourceInput = withToolInput(
  S.Struct({
    server: S.String,
    uri: S.String,
  }),
  "ReadMcpResourceInput"
);

/**
 * @since 0.0.0
 */
export type ReadMcpResourceInput = typeof ReadMcpResourceInput.Type;
/**
 * @since 0.0.0
 */
export type ReadMcpResourceInputEncoded = typeof ReadMcpResourceInput.Encoded;

const TodoStatus = S.Literals(["pending", "in_progress", "completed"]);

const TodoItem = S.Struct({
  content: S.String,
  status: TodoStatus,
  activeForm: S.String,
});

/**
 * @since 0.0.0
 */
export const TodoWriteInput = withToolInput(
  S.Struct({
    todos: S.Array(TodoItem),
  }),
  "TodoWriteInput"
);

/**
 * @since 0.0.0
 */
export type TodoWriteInput = typeof TodoWriteInput.Type;
/**
 * @since 0.0.0
 */
export type TodoWriteInputEncoded = typeof TodoWriteInput.Encoded;

/**
 * @since 0.0.0
 */
export const WebFetchInput = withToolInput(
  S.Struct({
    url: S.String,
    prompt: S.String,
  }),
  "WebFetchInput"
);

/**
 * @since 0.0.0
 */
export type WebFetchInput = typeof WebFetchInput.Type;
/**
 * @since 0.0.0
 */
export type WebFetchInputEncoded = typeof WebFetchInput.Encoded;

/**
 * @since 0.0.0
 */
export const WebSearchInput = withToolInput(
  S.Struct({
    query: S.String,
    allowed_domains: S.optional(S.Array(S.String)),
    blocked_domains: S.optional(S.Array(S.String)),
  }),
  "WebSearchInput"
);

/**
 * @since 0.0.0
 */
export type WebSearchInput = typeof WebSearchInput.Type;
/**
 * @since 0.0.0
 */
export type WebSearchInputEncoded = typeof WebSearchInput.Encoded;

const QuestionOption = S.Struct({
  label: S.String,
  description: S.String,
});

const Question = S.Struct({
  question: S.String,
  header: S.String,
  options: S.Array(QuestionOption).check(S.makeFilterGroup([S.isMinLength(2), S.isMaxLength(4)])),
  multiSelect: S.Boolean,
});

const QuestionMetadata = S.Struct({
  source: S.optional(S.String),
});

/**
 * @since 0.0.0
 */
export const AskUserQuestionInput = withToolInput(
  S.Struct({
    questions: S.Array(Question).check(S.makeFilterGroup([S.isMinLength(1), S.isMaxLength(4)])),
    answers: S.optional(S.Record(S.String, S.String)),
    metadata: S.optional(QuestionMetadata),
  }),
  "AskUserQuestionInput"
);

/**
 * @since 0.0.0
 */
export type AskUserQuestionInput = typeof AskUserQuestionInput.Type;
/**
 * @since 0.0.0
 */
export type AskUserQuestionInputEncoded = typeof AskUserQuestionInput.Encoded;

/**
 * @since 0.0.0
 */
export const ConfigInput = withToolInput(
  S.Struct({
    setting: S.String,
    value: S.optional(S.Union([S.String, S.Boolean, S.Number])),
  }),
  "ConfigInput"
);

/**
 * @since 0.0.0
 */
export type ConfigInput = typeof ConfigInput.Type;
/**
 * @since 0.0.0
 */
export type ConfigInputEncoded = typeof ConfigInput.Encoded;

/**
 * @since 0.0.0
 */
export const ToolInput = S.Union([
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
  ConfigInput,
]);

/**
 * @since 0.0.0
 */
export type ToolInput = typeof ToolInput.Type;
/**
 * @since 0.0.0
 */
export type ToolInputEncoded = typeof ToolInput.Encoded;
