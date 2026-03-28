/**
 * @module @beep/codex/Domain/Hooks
 * @since 0.0.0
 */
import {$ScratchId} from "@beep/identity"
import * as S from "effect/Schema";
import {NonEmptyTrimmedStr, FilePath, LiteralKit} from "@beep/schema";

const $I = $ScratchId.create("Domain/Hooks");

/**
 * wildcard match string
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const WildcardMatchStr = LiteralKit(
  [
    "",
    "*"
  ]
)
  .pipe(
    $I.annoteSchema(
      "WildcardMatchStr",
      {
        description: "wildcard match string"
      }
    )
  );

/**
 * Type of {@link WildcardMatchStr} {@inheritDoc WildcardMatchStr}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type WildcardMatchStr = typeof WildcardMatchStr.Type;


const l = new RegExp(/w/)
/**
 * A valid Codex Hook name.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const HookName = LiteralKit(
  [
    "SessionStart",
    "PreToolUse",
    "PostToolUse",
    "UserPromptSubmit",
    "Stop",
  ]
)
  .pipe(
    $I.annoteSchema(
      "HookName",
      {
        description: "A valid Codex Hook name."
      }
    )
  );

/**
 * Type of {@link HookName} {@inheritDoc HookName}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type HookName = typeof HookName.Type;

/**
 * A Codex Session ID.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const SessionId = NonEmptyTrimmedStr.pipe(
  S.brand("SessionId"),
  $I.annoteSchema(
    "SessionId",
    {
      description: "A Codex Session ID."
    }
  )
)

/**
 * Type of {@link SessionId}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type SessionId = typeof SessionId.Type;

/**
 * A Codex Thread ID.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const ThreadId = NonEmptyTrimmedStr.pipe(
  S.brand("ThreadId"),
  $I.annoteSchema(
    "ThreadId",
    {
      description: "A Codex Thread ID."
    }
  )
)

/**
 * Type of {@link ThreadId}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type ThreadId = typeof ThreadId.Type;

/**
 * Every command hook receives one JSON object on stdin.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class CommonCommandInput extends S.Class<CommonCommandInput>($I`CommonCommandInput`)(
  {
    /** Current session or thread id. */
    session_id: S.Union([
      SessionId,
      ThreadId
    ])
      .annotateKey({
        description: "Current session or thread id."
      }),
    /** Path to the session transcript file, if any */
    transcript_path: S.OptionFromNullOr(FilePath)
      .annotateKey({
        description: "Path to the session transcript file, if any"
      }),
    /** Working directory for the session */
    cwd: FilePath.annotateKey({
      description: "Working directory for the session"
    }),
    /** Current hook event name */
    hook_event_name: NonEmptyTrimmedStr.annotateKey({
      description: "Current hook event name."
    }),
    /** Active model slug */
    model: NonEmptyTrimmedStr.annotateKey({
      description: "Active model slug."
    })
  },
  $I.annote(
    "CommonCommandInput",
    {
      description: "Every command hook receives one JSON object on stdin."
    }
  )
) {
}

/**
 * {@link SessionStart}, {@link UserPromptSubmit} and {@link Stop} support
 * these shared JSON fields
 *
 * Exit 0 with no output is treated as success and Codex continues.
 *
 * PreToolUse supports systemMessage, but continue, stopReason, and suppressOutput are not currently supported for that event.
 *
 * PostToolUse supports systemMessage, continue: false, and stopReason. suppressOutput is parsed but not currently supported for that event.
 */
export class CommonOutput extends S.Class<CommonOutput>($I`CommonOutput`)(
  {
    /** If `false`, marks that hook run as stopped */
    continue: S.Boolean.annotateKey({
      description: "If `false`, marks that hook run as stopped"
    }),
    /** Recorded as the reason for stopping */
    stopReason: S.OptionFromOptionalKey(S.String)
      .annotateKey({
        description: "Recorded as the reason for stopping"
      }),
    /** Surfaced as a warning in the UI or event stream */
    systemMessage: S.OptionFromOptionalKey(S.String)
      .annotateKey({
        description: "Surfaced as a warning in the UI or event stream"
      }),
    /** Parsed today but not yet implemented */
    suppressOutput: S.Boolean.annotateKey({
      description: "Parsed today but not yet implemented"
    })
  },
  $I.annote(
    "CommonOutput",
    {
      description: "{@link SessionStart}, {@link UserPromptSubmit} and" +
        " {@link Stop} support\nthese shared JSON fields",
      documentation: "Exit 0 with no output is treated as success and Codex continues.\n" +
        "\n" +
        "PreToolUse supports systemMessage, but continue, stopReason, and suppressOutput are not currently supported for that event.\n" +
        "\n" +
        "PostToolUse supports systemMessage, continue: false, and stopReason. suppressOutput is parsed but not currently supported for that event."
    }
  )
) {
}

/**
 * PostToolUseToolInput - A codex hook for Post tool use tool input.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class PostToolUseToolInput extends S.Class<PostToolUseToolInput>($I`PostToolUseToolInput`)(
  {
    command: NonEmptyTrimmedStr,
  },
  $I.annote(
    "PostToolUseToolInput",
    {
      description: "A codex hook for Post tool use tool input.",
    }
  )
) {
}


/**
 * PostToolUseCommandInput -
 */
