/**
 * @module @beep/ai-sdk/codex/codexOptions
 * @since 0.0.0
 */
import { $AiSdkId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";
import { ContentBlock } from "../Mcp.ts";

const $I = $AiSdkId.create("core/codex/codexOptions");

/**
 * The status of a command execution.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const CommandExecutionStatus = LiteralKit(["in_progress", "completed", "failed"]).pipe(
  $I.annoteSchema("CommandExecutionStatus", {
    description: "The status of a command execution.",
  })
);

/**
 * Type of {@link CommandExecutionStatus} {@inheritDoc CommandExecutionStatus}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type CommandExecutionStatus = typeof CommandExecutionStatus.Type;

/**
 *  Base class for A command executed by the agent
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class CommandExecutionItemBase extends S.Class<CommandExecutionItemBase>($I`CommandExecutionItemBase`)(
  {
    type: S.tag("command_execution"),
    id: S.String,
    /** The command line executed by the agent. */
    command: S.String.annotateKey({
      description: "The command line executed by the agent.",
    }),
    /** Aggregated stdout and stderr captured while the command was running. */
    aggregated_output: S.String.annotateKey({
      description: "Aggregated stdout and stderr captured while the command was running.",
    }),
    /** Set when the command exits; omitted while still running. */
    exit_code: S.OptionFromOptionalKey(S.Number).annotateKey({
      description: "Set when the command exits; omitted while still running.",
    }),
  },
  $I.annote("CommandExecutionItemBase", {
    description: "Base class for A command executed by the agent",
  })
) {}

/**
 * Command execution item emitted while the command is still running.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class CommandExecutionInProgress extends CommandExecutionItemBase.extend<CommandExecutionInProgress>(
  $I`CommandExecutionInProgress`
)(
  {
    /** Current status of the command execution. */
    status: S.tag(CommandExecutionStatus.Enum.in_progress).annotateKey({
      description: "Current status of the command execution.",
    }),
  },
  $I.annote("CommandExecutionInProgress", {
    description: "",
  })
) {}

/**
 * Command execution item emitted after the command completed successfully.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class CommandExecutionCompleted extends CommandExecutionItemBase.extend<CommandExecutionCompleted>(
  $I`CommandExecutionCompleted`
)(
  {
    /** Current status of the command execution. */
    status: S.tag(CommandExecutionStatus.Enum.completed).annotateKey({
      description: "Current status of the command execution.",
    }),
  },
  $I.annote("CommandExecutionCompleted", {
    description: "",
  })
) {}

/**
 * Command execution item emitted after the command failed.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class CommandExecutionFailed extends CommandExecutionItemBase.extend<CommandExecutionFailed>(
  $I`CommandExecutionFailed`
)(
  {
    /** Current status of the command execution. */
    status: S.tag(CommandExecutionStatus.Enum.failed).annotateKey({
      description: "Current status of the command execution.",
    }),
  },
  $I.annote("CommandExecutionFailed", {
    description: "",
  })
) {}

/**
 * A command executed by the agent.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const CommandExecutionItem = S.Union([
  CommandExecutionInProgress,
  CommandExecutionCompleted,
  CommandExecutionFailed,
]).pipe(
  S.toTaggedUnion("status"),
  $I.annoteSchema("CommandExecutionItem", {
    description: "A command executed by the agent.",
  })
);

/**
 * Type of {@link CommandExecutionItem} {@inheritDoc CommandExecutionItem}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type CommandExecutionItem = typeof CommandExecutionItem.Type;

/**
 * Indicates the type of the file changed
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const PathChangeKind = LiteralKit(["add", "delete", "update"]).pipe(
  $I.annoteSchema("PathChangeKind", {
    description: "Indicates the type of the file changed",
  })
);

/**
 * Type of {@link PathChangeKind} {@inheritDoc PathChangeKind}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type PathChangeKind = typeof PathChangeKind.Type;

/**
 * Base file update payload emitted by Codex for changed paths.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class FileUpdateBase extends S.Class<FileUpdateBase>($I`FileUpdateBase`)({
  path: S.String,
}) {}

/**
 * File update payload for newly added paths.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class FileUpdateAdd extends FileUpdateBase.extend<FileUpdateAdd>($I`FileUpdateAdd`)(
  {
    kind: S.tag(PathChangeKind.Enum.add),
  },
  $I.annote("FileUpdateAdd", {
    description: "",
  })
) {}

/**
 * File update payload for deleted paths.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class FileUpdateDelete extends FileUpdateBase.extend<FileUpdateDelete>($I`FileUpdateDelete`)(
  {
    kind: S.tag(PathChangeKind.Enum.delete),
  },
  $I.annote("FileUpdateDelete", {
    description: "",
  })
) {}

/**
 * File update payload for modified paths.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class FileUpdateUpdate extends FileUpdateBase.extend<FileUpdateUpdate>($I`FileUpdateUpdate`)(
  {
    kind: S.tag(PathChangeKind.Enum.update),
  },
  $I.annote("FileUpdateUpdate", {
    description: "",
  })
) {}

/**
 * A set of file changes by the agent.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const FileUpdateChange = S.Union([FileUpdateAdd, FileUpdateUpdate, FileUpdateDelete]).pipe(
  S.toTaggedUnion("kind"),
  $I.annoteSchema("FileUpdateChange", {
    description: "A set of file changes by the agent.",
  })
);

/**
 * Type of {@link FileUpdateChange} {@inheritDoc FileUpdateChange}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type FileUpdateChange = typeof FileUpdateChange.Type;

/**
 * The status of a file change.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const PatchApplyStatus = LiteralKit(["completed", "failed"]).pipe(
  $I.annoteSchema("PatchApplyStatus", {
    description: "The status of a file change.",
  })
);

/**
 * Type of {@link PatchApplyStatus} {@inheritDoc PatchApplyStatus}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type PatchApplyStatus = typeof PatchApplyStatus.Type;

/**
 * A set of file changes by the agent. Emitted once the patch succeeds or fails.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class FileChangeItem extends S.Class<FileChangeItem>($I`FileChangeItem`)(
  {
    id: S.String,
    type: S.tag("file_change"),
    /** Individual file changes that comprise the patch. */
    changes: S.Array(FileUpdateChange).annotateKey({
      description: "Individual file changes that comprise the patch.",
    }),
    /** Whether the patch ultimately succeeded or failed. */
    status: PatchApplyStatus.annotateKey({
      description: "Whether the patch ultimately succeeded or failed.",
    }),
  },
  $I.annote("FileChangeItem", {
    description: "A set of file changes by the agent. Emitted once the patch succeeds or fails.",
  })
) {}

/**
 * The status of an MCP tool call.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const McpToolCallStatus = LiteralKit(["in_progress", "completed", "failed"]).pipe(
  $I.annoteSchema("McpToolCallStatus", {
    description: "The status of an MCP tool call.",
  })
);

/**
 * Type of {@link McpToolCallStatus} {@inheritDoc McpToolCallStatus}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type McpToolCallStatus = typeof McpToolCallStatus.Type;

/**
 * Result payload returned by the MCP server for successful calls.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class McpToolCallResult extends S.Class<McpToolCallResult>($I`McpToolCallResult`)(
  {
    content: S.Array(ContentBlock),
    structured_content: S.Unknown,
  },
  $I.annote("McpToolCallResult", {
    description: "Result payload returned by the MCP server for successful calls.",
  })
) {}

/**
 * Error message reported for failed calls.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class McpToolCallError extends S.Class<McpToolCallError>($I`McpToolCallError`)(
  {
    message: S.String,
  },
  $I.annote("McpToolCallError", {
    description: "Error message reported for failed calls.",
  })
) {}

/**
 * Represents a call to an MCP tool. The item starts when the invocation is dispatched and completes when the MCP server reports success or failure.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class McpToolCallItem extends S.Class<McpToolCallItem>($I`McpToolCallItem`)(
  {
    id: S.String,
    type: S.tag("mcp_tool_call"),
    /** Name of the MCP server handling the request. */
    server: S.String.annotateKey({
      description: "Name of the MCP server handling the request.",
    }),
    /** The tool invoked on the MCP server. */
    tool: S.String.annotateKey({
      description: "The tool invoked on the MCP server.",
    }),
    /** Arguments forwarded to the tool invocation. */
    arguments: S.Unknown.annotateKey({
      description: "Arguments forwarded to the tool invocation.",
    }),
    /** Result payload returned by the MCP server for successful calls. */
    result: S.OptionFromOptionalKey(McpToolCallResult).annotateKey({
      description: "Result payload returned by the MCP server for successful calls.",
    }),
    /** Error message reported for failed calls. */
    error: S.OptionFromOptionalKey(McpToolCallError).annotateKey({
      description: "Error message reported for failed calls.",
    }),
    /** Current status of the tool invocation. */
    status: McpToolCallStatus.annotateKey({
      description: "Current status of the tool invocation.",
    }),
  },
  $I.annote("McpToolCallItem", {
    description:
      "Represents a call to an MCP tool. The item starts when the invocation is dispatched and completes when the MCP server reports success or failure.",
  })
) {}

/**
 * Response from the agent. Either natural-language text or JSON when structured output is requested.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class AgentMessageItem extends S.Class<AgentMessageItem>($I`AgentMessageItem`)(
  {
    id: S.String,
    type: S.tag("agent_message"),
    /** Either natural-language text or JSON when structured output is requested. */
    text: S.String.annotateKey({
      description: "Either natural-language text or JSON when structured output is requested.",
    }),
  },
  $I.annote("AgentMessageItem", {
    description: "Response from the agent. Either natural-language text or JSON when structured output is requested.",
  })
) {}

/**
 * Agent's reasoning summary.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ReasoningItem extends S.Class<ReasoningItem>($I`ReasoningItem`)(
  {
    id: S.String,
    type: S.tag("reasoning"),
    text: S.String,
  },
  $I.annote("ReasoningItem", {
    description: "Agent's reasoning summary.",
  })
) {}

/**
 * Captures a web search request. Completes when results are returned to the agent.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class WebSearchItem extends S.Class<WebSearchItem>($I`WebSearchItem`)(
  {
    id: S.String,
    type: S.tag("reasoning"),
    query: S.String,
  },
  $I.annote("WebSearchItem", {
    description: "Captures a web search request. Completes when results are returned to the agent.",
  })
) {}

/**
 * Describes a non-fatal error surfaced as an item.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ErrorItem extends S.Class<ErrorItem>($I`ErrorItem`)(
  {
    id: S.String,
    type: S.tag("error"),
    message: S.String,
  },
  $I.annote("ErrorItem", {
    description: "Describes a non-fatal error surfaced as an item.",
  })
) {}

/**
 * An item in the agent's to-do list.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class TodoItem extends S.Class<TodoItem>($I`TodoItem`)(
  {
    text: S.String,
    completed: S.Boolean,
  },
  $I.annote("TodoItem", {
    description: "An item in the agent's to-do list.",
  })
) {}

/**
 * Tracks the agent's running to-do list. Starts when the plan is issued, updates as steps change,and completes when the turn ends.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class TodoListItem extends S.Class<TodoListItem>($I`TodoListItem`)(
  {
    id: S.String,
    type: S.tag("todo_list"),
    items: S.Array(TodoItem),
  },
  $I.annote("TodoListItem", {
    description:
      "Tracks the agent's running to-do list. Starts when the plan is issued, updates as steps change,and completes when the turn ends.",
  })
) {}

/**
 * Canonical union of thread items and their type-specific payloads.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const ThreadItem = S.Union([
  AgentMessageItem,
  ReasoningItem,
  CommandExecutionInProgress,
  CommandExecutionCompleted,
  CommandExecutionFailed,
  FileChangeItem,
  McpToolCallItem,
  WebSearchItem,
  TodoListItem,
  ErrorItem,
]).pipe(
  S.toTaggedUnion("type"),
  $I.annoteSchema("ThreadItem", {
    description: "Canonical union of thread items and their type-specific payloads.",
  })
);

/**
 * Type of {@link ThreadItem} {@inheritDoc ThreadItem}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type ThreadItem = typeof ThreadItem.Type;
