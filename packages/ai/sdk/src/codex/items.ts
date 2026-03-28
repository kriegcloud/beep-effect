/**
 * @module @beep/ai-sdk/codex/codexOptions
 * @since 0.0.0
 */
import { $AiSdkId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

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

export class FileUpdateBase extends S.Class<FileUpdateBase>($I`FileUpdateBase`)({
  path: S.String,
}) {}

export class FileUpdateAdd extends FileUpdateBase.extend<FileUpdateAdd>($I`FileUpdateAdd`)(
  {
    kind: S.tag(PathChangeKind.Enum.add),
  },
  $I.annote("FileUpdateAdd", {
    description: "",
  })
) {}

export class FileUpdateDelete extends FileUpdateBase.extend<FileUpdateDelete>($I`FileUpdateDelete`)(
  {
    kind: S.tag(PathChangeKind.Enum.delete),
  },
  $I.annote("FileUpdateDelete", {
    description: "",
  })
) {}

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
  {},
  $I.annote("McpToolCallResult", {
    description: "Result payload returned by the MCP server for successful calls.",
  })
) {}
