import { $AiSdkId } from "@beep/identity/packages";
import { FilePath, LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";
import { toolInputParseOptions, withToolInput } from "./Annotations.js";

const $I = $AiSdkId.create("core/Schema/ToolInput");

const AgentModel = LiteralKit(["sonnet", "opus", "haiku"]);

const toolInputAnnotation = (name: string, description: string) => ({
  ...$I.annote(name, { description }),
  parseOptions: toolInputParseOptions,
});

/**
 * @since 0.0.0
 * @category Validation
 */
class AgentInputData extends S.Class<AgentInputData>($I`AgentInput`)(
  {
    description: S.String,
    prompt: S.String,
    subagent_type: S.String,
    model: S.optional(AgentModel),
    resume: S.optional(S.String),
    run_in_background: S.optional(S.Boolean),
    max_turns: S.optional(S.Number),
  },
  toolInputAnnotation("AgentInput", "Tool input for launching a subagent with prompt, model, and turn limits.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const AgentInput = AgentInputData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type AgentInput = typeof AgentInput.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type AgentInputEncoded = typeof AgentInput.Encoded;

class SimulatedSedEditData extends S.Class<SimulatedSedEditData>($I`SimulatedSedEdit`)(
  {
    filePath: FilePath,
    newContent: S.String,
  },
  $I.annote("SimulatedSedEdit", {
    description: "Synthetic edit payload attached to bash tool requests for simulated sed rewrites.",
  })
) {}

const SimulatedSedEdit = SimulatedSedEditData;

/**
 * @since 0.0.0
 * @category Validation
 */
class BashInputData extends S.Class<BashInputData>($I`BashInput`)(
  {
    command: S.String,
    timeout: S.optional(S.Number),
    description: S.optional(S.String),
    run_in_background: S.optional(S.Boolean),
    dangerouslyDisableSandbox: S.optional(S.Boolean),
    _simulatedSedEdit: S.optional(SimulatedSedEdit),
  },
  toolInputAnnotation(
    "BashInput",
    "Tool input for shell command execution with optional timeout and sandbox overrides."
  )
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const BashInput = BashInputData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type BashInput = typeof BashInput.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type BashInputEncoded = typeof BashInput.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class TaskOutputInputData extends S.Class<TaskOutputInputData>($I`TaskOutputInput`)(
  {
    task_id: S.String,
    block: S.Boolean,
    timeout: S.Number,
  },
  toolInputAnnotation("TaskOutputInput", "Tool input for reading buffered output from a background task.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const TaskOutputInput = TaskOutputInputData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type TaskOutputInput = typeof TaskOutputInput.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type TaskOutputInputEncoded = typeof TaskOutputInput.Encoded;

class ExitPlanModePromptData extends S.Class<ExitPlanModePromptData>($I`ExitPlanModePrompt`)(
  {
    tool: S.Literal("Bash"),
    prompt: S.String,
  },
  $I.annote("ExitPlanModePrompt", {
    description: "Allowed plan-exit prompt paired with the tool that may issue it.",
  })
) {}

const ExitPlanModePrompt = ExitPlanModePromptData;

class ExitPlanModeBaseData extends S.Class<ExitPlanModeBaseData>($I`ExitPlanModeBase`)(
  {
    allowedPrompts: S.optional(ExitPlanModePrompt.pipe(S.Array)),
    pushToRemote: S.optional(S.Boolean),
    remoteSessionId: S.optional(S.String),
    remoteSessionUrl: S.optional(S.String),
  },
  $I.annote("ExitPlanModeBase", {
    description: "Base plan-exit payload shared by plan mode exit requests with arbitrary extra keys.",
  })
) {}

const ExitPlanModeBase = ExitPlanModeBaseData;

/**
 * @since 0.0.0
 * @category Validation
 */
export const ExitPlanModeInput = withToolInput(
  S.StructWithRest(S.Struct(ExitPlanModeBase.fields), [S.Record(S.String, S.Unknown)]),
  $I.annote("ExitPlanModeInput", {
    description: "Tool input for exiting plan mode while preserving allowed prompts and remote session metadata.",
  })
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type ExitPlanModeInput = typeof ExitPlanModeInput.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type ExitPlanModeInputEncoded = typeof ExitPlanModeInput.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class FileEditInputData extends S.Class<FileEditInputData>($I`FileEditInput`)(
  {
    file_path: FilePath,
    old_string: S.String,
    new_string: S.String,
    replace_all: S.optional(S.Boolean),
  },
  toolInputAnnotation("FileEditInput", "Tool input for in-place string replacement edits within a file.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const FileEditInput = FileEditInputData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type FileEditInput = typeof FileEditInput.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type FileEditInputEncoded = typeof FileEditInput.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class FileReadInputData extends S.Class<FileReadInputData>($I`FileReadInput`)(
  {
    file_path: FilePath,
    offset: S.optional(S.Number),
    limit: S.optional(S.Number),
  },
  toolInputAnnotation("FileReadInput", "Tool input for reading a slice of a file from disk.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const FileReadInput = FileReadInputData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type FileReadInput = typeof FileReadInput.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type FileReadInputEncoded = typeof FileReadInput.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class FileWriteInputData extends S.Class<FileWriteInputData>($I`FileWriteInput`)(
  {
    file_path: FilePath,
    content: S.String,
  },
  toolInputAnnotation("FileWriteInput", "Tool input for overwriting file contents.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const FileWriteInput = FileWriteInputData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type FileWriteInput = typeof FileWriteInput.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type FileWriteInputEncoded = typeof FileWriteInput.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class GlobInputData extends S.Class<GlobInputData>($I`GlobInput`)(
  {
    pattern: S.String,
    path: S.optional(S.String),
  },
  toolInputAnnotation("GlobInput", "Tool input for glob-based file discovery.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const GlobInput = GlobInputData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type GlobInput = typeof GlobInput.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type GlobInputEncoded = typeof GlobInput.Encoded;

const GrepOutputMode = LiteralKit(["content", "files_with_matches", "count"]);

/**
 * @since 0.0.0
 * @category Validation
 */
class GrepInputData extends S.Class<GrepInputData>($I`GrepInput`)(
  {
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
  },
  toolInputAnnotation("GrepInput", "Tool input for repository grep with rg-compatible flags and output controls.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const GrepInput = GrepInputData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type GrepInput = typeof GrepInput.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type GrepInputEncoded = typeof GrepInput.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class KillShellInputData extends S.Class<KillShellInputData>($I`KillShellInput`)(
  {
    shell_id: S.String,
  },
  toolInputAnnotation("KillShellInput", "Tool input for terminating a running shell session.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const KillShellInput = KillShellInputData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type KillShellInput = typeof KillShellInput.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type KillShellInputEncoded = typeof KillShellInput.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class ListMcpResourcesInputData extends S.Class<ListMcpResourcesInputData>($I`ListMcpResourcesInput`)(
  {
    server: S.optional(S.String),
  },
  toolInputAnnotation("ListMcpResourcesInput", "Tool input for listing resources from an MCP server.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const ListMcpResourcesInput = ListMcpResourcesInputData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type ListMcpResourcesInput = typeof ListMcpResourcesInput.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type ListMcpResourcesInputEncoded = typeof ListMcpResourcesInput.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
export const McpInput = withToolInput(
  S.Record(S.String, S.Unknown),
  $I.annote("McpInput", {
    description: "Opaque tool input forwarded directly to an MCP tool invocation.",
  })
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type McpInput = typeof McpInput.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type McpInputEncoded = typeof McpInput.Encoded;

const NotebookCellType = LiteralKit(["code", "markdown"]);
const NotebookEditMode = LiteralKit(["replace", "insert", "delete"]);

/**
 * @since 0.0.0
 * @category Validation
 */
class NotebookEditInputData extends S.Class<NotebookEditInputData>($I`NotebookEditInput`)(
  {
    notebook_path: FilePath,
    cell_id: S.optional(S.String),
    new_source: S.String,
    cell_type: S.optional(NotebookCellType),
    edit_mode: S.optional(NotebookEditMode),
  },
  toolInputAnnotation("NotebookEditInput", "Tool input for editing notebook cells by id or position.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const NotebookEditInput = NotebookEditInputData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type NotebookEditInput = typeof NotebookEditInput.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type NotebookEditInputEncoded = typeof NotebookEditInput.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class ReadMcpResourceInputData extends S.Class<ReadMcpResourceInputData>($I`ReadMcpResourceInput`)(
  {
    server: S.String,
    uri: S.String,
  },
  toolInputAnnotation("ReadMcpResourceInput", "Tool input for reading a specific MCP resource by server and URI.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const ReadMcpResourceInput = ReadMcpResourceInputData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type ReadMcpResourceInput = typeof ReadMcpResourceInput.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type ReadMcpResourceInputEncoded = typeof ReadMcpResourceInput.Encoded;

const TodoStatus = LiteralKit(["pending", "in_progress", "completed"]);

class TodoItemData extends S.Class<TodoItemData>($I`TodoItem`)(
  {
    content: S.String,
    status: TodoStatus,
    activeForm: S.String,
  },
  $I.annote("TodoItem", {
    description: "Single todo item emitted through the todo write tool.",
  })
) {}

const TodoItem = TodoItemData;

/**
 * @since 0.0.0
 * @category Validation
 */
class TodoWriteInputData extends S.Class<TodoWriteInputData>($I`TodoWriteInput`)(
  {
    todos: S.Array(TodoItem),
  },
  toolInputAnnotation("TodoWriteInput", "Tool input for replacing the tracked todo list.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const TodoWriteInput = TodoWriteInputData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type TodoWriteInput = typeof TodoWriteInput.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type TodoWriteInputEncoded = typeof TodoWriteInput.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class WebFetchInputData extends S.Class<WebFetchInputData>($I`WebFetchInput`)(
  {
    url: S.String,
    prompt: S.String,
  },
  toolInputAnnotation("WebFetchInput", "Tool input for fetching a URL and answering a prompt against its contents.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const WebFetchInput = WebFetchInputData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type WebFetchInput = typeof WebFetchInput.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type WebFetchInputEncoded = typeof WebFetchInput.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class WebSearchInputData extends S.Class<WebSearchInputData>($I`WebSearchInput`)(
  {
    query: S.String,
    allowed_domains: S.optional(S.String.pipe(S.Array)),
    blocked_domains: S.optional(S.String.pipe(S.Array)),
  },
  toolInputAnnotation("WebSearchInput", "Tool input for running a web search with optional domain filters.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const WebSearchInput = WebSearchInputData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type WebSearchInput = typeof WebSearchInput.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type WebSearchInputEncoded = typeof WebSearchInput.Encoded;

class QuestionOptionData extends S.Class<QuestionOptionData>($I`QuestionOption`)(
  {
    label: S.String,
    description: S.String,
  },
  $I.annote("QuestionOption", {
    description: "Selectable answer option presented to the user.",
  })
) {}

const QuestionOption = QuestionOptionData;

class QuestionData extends S.Class<QuestionData>($I`Question`)(
  {
    question: S.String,
    header: S.String,
    options: S.Array(QuestionOption).check(S.makeFilterGroup([S.isMinLength(2), S.isMaxLength(4)])),
    multiSelect: S.Boolean,
  },
  $I.annote("Question", {
    description: "Interactive question payload containing answer options and selection mode.",
  })
) {}

const Question = QuestionData;

class QuestionMetadataData extends S.Class<QuestionMetadataData>($I`QuestionMetadata`)(
  {
    source: S.optional(S.String),
  },
  $I.annote("QuestionMetadata", {
    description: "Supplemental metadata passed alongside interactive questions.",
  })
) {}

const QuestionMetadata = QuestionMetadataData;

/**
 * @since 0.0.0
 * @category Validation
 */
class AskUserQuestionInputData extends S.Class<AskUserQuestionInputData>($I`AskUserQuestionInput`)(
  {
    questions: S.Array(Question).check(S.makeFilterGroup([S.isMinLength(1), S.isMaxLength(4)])),
    answers: S.optional(S.Record(S.String, S.String)),
    metadata: S.optional(QuestionMetadata),
  },
  toolInputAnnotation("AskUserQuestionInput", "Tool input for asking one or more structured questions of the user.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const AskUserQuestionInput = AskUserQuestionInputData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type AskUserQuestionInput = typeof AskUserQuestionInput.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type AskUserQuestionInputEncoded = typeof AskUserQuestionInput.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class ConfigInputData extends S.Class<ConfigInputData>($I`ConfigInput`)(
  {
    setting: S.String,
    value: S.optional(S.Union([S.String, S.Boolean, S.Number])),
  },
  toolInputAnnotation("ConfigInput", "Tool input for reading or updating a named SDK setting.")
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const ConfigInput = ConfigInputData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type ConfigInput = typeof ConfigInput.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type ConfigInputEncoded = typeof ConfigInput.Encoded;

/**
 * @since 0.0.0
 * @category Validation
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
 * @category Validation
 */
export type ToolInput = typeof ToolInput.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type ToolInputEncoded = typeof ToolInput.Encoded;
