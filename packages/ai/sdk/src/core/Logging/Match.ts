import * as LogLevel from "effect/LogLevel"
import * as Match from "effect/Match"
import type { HookInput } from "../Schema/Hooks.js"
import type { SDKMessage } from "../Schema/Message.js"
import type { QueryEvent } from "../QuerySupervisor.js"
import type { AgentLogEvent } from "./Types.js"

const compact = (value: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== null)
  )

const compactData = (value: Record<string, unknown>) => compact(value)

const previewText = (value: string, limit = 200) =>
  value.length > limit ? `${value.slice(0, limit)}...` : value

const baseSdkAnnotations = (message: SDKMessage) =>
  compact({
    session_id: message.session_id,
    message_type: message.type,
    message_subtype: "subtype" in message ? message.subtype : undefined,
    message_uuid: "uuid" in message ? message.uuid : undefined
  })

const makeSdkEvent = (
  message: SDKMessage,
  {
    level,
    event,
    messageText,
    data,
    annotations
  }: {
    readonly level: LogLevel.LogLevel
    readonly event: string
    readonly messageText: string
    readonly data?: Record<string, unknown>
    readonly annotations?: Record<string, unknown>
  }
): AgentLogEvent => ({
  ...(data !== undefined
    ? { data: compactData(data) }
    : {}),
  level,
  category: "messages",
  event,
  message: messageText,
  annotations: {
    ...baseSdkAnnotations(message),
    ...compact(annotations ?? {})
  }
})

export const matchSdkMessage = Match.type<SDKMessage>().pipe(
  Match.when({ type: "assistant", error: Match.string }, (message) =>
    makeSdkEvent(message, {
      level: LogLevel.Error,
      event: "sdk.message.assistant.error",
      messageText: "assistant message error",
      annotations: {
        parent_tool_use_id: message.parent_tool_use_id
      },
      data: {
        error: message.error,
        message: message.message,
        parent_tool_use_id: message.parent_tool_use_id
      }
    })
  ),
  Match.when({ type: "assistant" }, (message) =>
    makeSdkEvent(message, {
      level: LogLevel.Debug,
      event: "sdk.message.assistant",
      messageText: "assistant message",
      annotations: {
        parent_tool_use_id: message.parent_tool_use_id
      },
      data: {
        message: message.message,
        parent_tool_use_id: message.parent_tool_use_id
      }
    })
  ),
  Match.when({ type: "user", isReplay: true }, (message) =>
    makeSdkEvent(message, {
      level: LogLevel.Debug,
      event: "sdk.message.user.replay",
      messageText: "user message replay",
      annotations: {
        parent_tool_use_id: message.parent_tool_use_id
      },
      data: {
        message: message.message,
        parent_tool_use_id: message.parent_tool_use_id,
        isSynthetic: message.isSynthetic,
        tool_use_result: message.tool_use_result,
        isReplay: true
      }
    })
  ),
  Match.when({ type: "user" }, (message) =>
    makeSdkEvent(message, {
      level: LogLevel.Debug,
      event: "sdk.message.user",
      messageText: "user message",
      annotations: {
        parent_tool_use_id: message.parent_tool_use_id
      },
      data: {
        message: message.message,
        parent_tool_use_id: message.parent_tool_use_id,
        isSynthetic: message.isSynthetic,
        tool_use_result: message.tool_use_result
      }
    })
  ),
  Match.when({ type: "result", subtype: "success" }, (message) =>
    makeSdkEvent(message, {
      level: LogLevel.Info,
      event: "sdk.message.result.success",
      messageText: "result success",
      data: {
        duration_ms: message.duration_ms,
        duration_api_ms: message.duration_api_ms,
        num_turns: message.num_turns,
        total_cost_usd: message.total_cost_usd,
        usage: message.usage,
        modelUsage: message.modelUsage,
        permission_denials: message.permission_denials,
        structured_output: message.structured_output,
        result_preview: previewText(message.result),
        result_length: message.result.length
      }
    })
  ),
  Match.whenOr(
    { type: "result", subtype: "error_during_execution" },
    { type: "result", subtype: "error_max_turns" },
    { type: "result", subtype: "error_max_budget_usd" },
    { type: "result", subtype: "error_max_structured_output_retries" },
    (message) =>
      makeSdkEvent(message, {
        level: LogLevel.Error,
        event: "sdk.message.result.error",
        messageText: "result error",
        data: {
          subtype: message.subtype,
          duration_ms: message.duration_ms,
          duration_api_ms: message.duration_api_ms,
          num_turns: message.num_turns,
          total_cost_usd: message.total_cost_usd,
          usage: message.usage,
          modelUsage: message.modelUsage,
          permission_denials: message.permission_denials,
          errors: message.errors
        }
      })
  ),
  Match.when({ type: "system", subtype: "init" }, (message) =>
    makeSdkEvent(message, {
      level: LogLevel.Info,
      event: "sdk.message.system.init",
      messageText: "system init",
      data: {
        model: message.model,
        cwd: message.cwd,
        permissionMode: message.permissionMode,
        apiKeySource: message.apiKeySource,
        claude_code_version: message.claude_code_version,
        output_style: message.output_style,
        tools: message.tools,
        agents: message.agents,
        betas: message.betas,
        skills: message.skills,
        slash_commands: message.slash_commands,
        mcp_servers: message.mcp_servers,
        plugins: message.plugins
      }
    })
  ),
  Match.when({ type: "system", subtype: "compact_boundary" }, (message) =>
    makeSdkEvent(message, {
      level: LogLevel.Info,
      event: "sdk.message.system.compact_boundary",
      messageText: "system compact boundary",
      data: {
        trigger: message.compact_metadata.trigger,
        pre_tokens: message.compact_metadata.pre_tokens
      }
    })
  ),
  Match.when({ type: "system", subtype: "status" }, (message) =>
    makeSdkEvent(message, {
      level: LogLevel.Info,
      event: "sdk.message.system.status",
      messageText: "system status",
      data: {
        status: message.status
      }
    })
  ),
  Match.when({ type: "system", subtype: "hook_started" }, (message) =>
    makeSdkEvent(message, {
      level: LogLevel.Debug,
      event: "sdk.message.system.hook_started",
      messageText: "hook started",
      annotations: {
        hook_id: message.hook_id,
        hook_name: message.hook_name,
        hook_event: message.hook_event
      }
    })
  ),
  Match.when({ type: "system", subtype: "hook_progress" }, (message) =>
    makeSdkEvent(message, {
      level: LogLevel.Debug,
      event: "sdk.message.system.hook_progress",
      messageText: "hook progress",
      annotations: {
        hook_id: message.hook_id,
        hook_name: message.hook_name,
        hook_event: message.hook_event
      },
      data: {
        hook_id: message.hook_id,
        hook_name: message.hook_name,
        hook_event: message.hook_event,
        output_preview: previewText(message.output),
        stdout_preview: previewText(message.stdout),
        stderr_preview: previewText(message.stderr),
        output_length: message.output.length,
        stdout_length: message.stdout.length,
        stderr_length: message.stderr.length
      }
    })
  ),
  Match.when({ type: "system", subtype: "hook_response" }, (message) =>
    makeSdkEvent(message, {
      level: LogLevel.Debug,
      event: "sdk.message.system.hook_response",
      messageText: "hook response",
      annotations: {
        hook_id: message.hook_id,
        hook_name: message.hook_name,
        hook_event: message.hook_event
      },
      data: {
        hook_id: message.hook_id,
        hook_name: message.hook_name,
        hook_event: message.hook_event,
        exit_code: message.exit_code,
        outcome: message.outcome,
        output_preview: previewText(message.output),
        stdout_preview: previewText(message.stdout),
        stderr_preview: previewText(message.stderr),
        output_length: message.output.length,
        stdout_length: message.stdout.length,
        stderr_length: message.stderr.length
      }
    })
  ),
  Match.when({ type: "system", subtype: "files_persisted" }, (message) =>
    makeSdkEvent(message, {
      level: LogLevel.Info,
      event: "sdk.message.system.files_persisted",
      messageText: "files persisted",
      data: {
        processed_at: message.processed_at,
        files: message.files,
        failed: message.failed
      }
    })
  ),
  Match.when({ type: "system", subtype: "task_notification" }, (message) => {
    const level = message.status === "failed"
      ? LogLevel.Error
      : message.status === "stopped"
        ? LogLevel.Warning
        : LogLevel.Info
    return makeSdkEvent(message, {
      level,
      event: "sdk.message.system.task_notification",
      messageText: "task notification",
      data: {
        task_id: message.task_id,
        status: message.status,
        output_file: message.output_file,
        summary: message.summary
      }
    })
  }),
  Match.when({ type: "system", subtype: "task_started" }, (message) =>
    makeSdkEvent(message, {
      level: LogLevel.Info,
      event: "sdk.message.system.task_started",
      messageText: "task started",
      data: {
        task_id: message.task_id,
        description: message.description,
        tool_use_id: message.tool_use_id,
        task_type: message.task_type
      }
    })
  ),
  Match.when({ type: "stream_event" }, (message) =>
    makeSdkEvent(message, {
      level: LogLevel.Trace,
      event: "sdk.message.stream_event",
      messageText: "assistant stream event",
      annotations: {
        parent_tool_use_id: message.parent_tool_use_id
      },
      data: {
        parent_tool_use_id: message.parent_tool_use_id,
        event: message.event
      }
    })
  ),
  Match.when({ type: "tool_progress" }, (message) =>
    makeSdkEvent(message, {
      level: LogLevel.Debug,
      event: "sdk.message.tool_progress",
      messageText: "tool progress",
      annotations: {
        tool_use_id: message.tool_use_id,
        tool_name: message.tool_name,
        parent_tool_use_id: message.parent_tool_use_id
      },
      data: {
        tool_use_id: message.tool_use_id,
        tool_name: message.tool_name,
        parent_tool_use_id: message.parent_tool_use_id,
        elapsed_time_seconds: message.elapsed_time_seconds
      }
    })
  ),
  Match.when({ type: "tool_use_summary" }, (message) =>
    makeSdkEvent(message, {
      level: LogLevel.Info,
      event: "sdk.message.tool_use_summary",
      messageText: "tool use summary",
      data: {
        summary: message.summary,
        preceding_tool_use_ids: message.preceding_tool_use_ids
      }
    })
  ),
  Match.when({ type: "auth_status" }, (message) =>
    makeSdkEvent(message, {
      level: message.error ? LogLevel.Warning : LogLevel.Info,
      event: message.error ? "sdk.message.auth_status.error" : "sdk.message.auth_status",
      messageText: message.error ? "auth status error" : "auth status",
      data: {
        error: message.error,
        output: message.output,
        isAuthenticating: message.isAuthenticating
      }
    })
  ),
  Match.exhaustive
)

const makeQueryEvent = (
  event: QueryEvent,
  {
    level,
    eventName,
    messageText,
    data,
    annotations
  }: {
    readonly level: LogLevel.LogLevel
    readonly eventName: string
    readonly messageText: string
    readonly data?: Record<string, unknown>
    readonly annotations?: Record<string, unknown>
  }
): AgentLogEvent => ({
  ...(data !== undefined
    ? { data: compactData(data) }
    : {}),
  level,
  category: "queryEvents",
  event: eventName,
  message: messageText,
  annotations: {
    query_id: event.queryId,
    ...compact(annotations ?? {})
  }
})

export const matchQueryEvent = Match.type<QueryEvent>().pipe(
  Match.tag("QueryQueued", (event) =>
    makeQueryEvent(event, {
      level: LogLevel.Info,
      eventName: "agent.query.queued",
      messageText: "query queued",
      data: {
        submittedAt: event.submittedAt
      }
    })
  ),
  Match.tag("QueryStarted", (event) =>
    makeQueryEvent(event, {
      level: LogLevel.Info,
      eventName: "agent.query.started",
      messageText: "query started",
      data: {
        startedAt: event.startedAt
      }
    })
  ),
  Match.tag("QueryCompleted", (event) =>
    makeQueryEvent(event, {
      level: event.status === "success" ? LogLevel.Info : LogLevel.Warning,
      eventName: "agent.query.completed",
      messageText: "query completed",
      annotations: {
        status: event.status
      },
      data: {
        completedAt: event.completedAt,
        status: event.status
      }
    })
  ),
  Match.tag("QueryStartFailed", (event) =>
    makeQueryEvent(event, {
      level: LogLevel.Error,
      eventName: "agent.query.start_failed",
      messageText: "query start failed",
      annotations: {
        error_tag: event.errorTag
      },
      data: {
        failedAt: event.failedAt,
        errorTag: event.errorTag
      }
    })
  ),
  Match.exhaustive
)

const baseHookAnnotations = (input: HookInput) =>
  compact({
    session_id: input.session_id,
    hook_event: input.hook_event_name
  })

const makeHookEvent = (
  input: HookInput,
  {
    level,
    eventName,
    messageText,
    data,
    annotations
  }: {
    readonly level: LogLevel.LogLevel
    readonly eventName: string
    readonly messageText: string
    readonly data?: Record<string, unknown>
    readonly annotations?: Record<string, unknown>
  }
): AgentLogEvent => ({
  ...(data !== undefined
    ? { data: compactData(data) }
    : {}),
  level,
  category: "hooks",
  event: eventName,
  message: messageText,
  annotations: {
    ...baseHookAnnotations(input),
    ...compact(annotations ?? {})
  }
})

export const matchHookInput = Match.type<HookInput>().pipe(
  Match.when({ hook_event_name: "PreToolUse" }, (input) =>
    makeHookEvent(input, {
      level: LogLevel.Debug,
      eventName: "agent.hook.pre_tool_use",
      messageText: "hook pre tool use",
      annotations: {
        tool_name: input.tool_name,
        tool_use_id: input.tool_use_id
      },
      data: {
        tool_name: input.tool_name,
        tool_use_id: input.tool_use_id,
        tool_input: input.tool_input,
        cwd: input.cwd,
        transcript_path: input.transcript_path,
        permission_mode: input.permission_mode
      }
    })
  ),
  Match.when({ hook_event_name: "PostToolUse" }, (input) =>
    makeHookEvent(input, {
      level: LogLevel.Debug,
      eventName: "agent.hook.post_tool_use",
      messageText: "hook post tool use",
      annotations: {
        tool_name: input.tool_name,
        tool_use_id: input.tool_use_id
      },
      data: {
        tool_name: input.tool_name,
        tool_use_id: input.tool_use_id,
        tool_input: input.tool_input,
        tool_response: input.tool_response,
        cwd: input.cwd,
        transcript_path: input.transcript_path,
        permission_mode: input.permission_mode
      }
    })
  ),
  Match.when({ hook_event_name: "PostToolUseFailure" }, (input) =>
    makeHookEvent(input, {
      level: LogLevel.Error,
      eventName: "agent.hook.post_tool_use_failure",
      messageText: "hook post tool use failure",
      annotations: {
        tool_name: input.tool_name,
        tool_use_id: input.tool_use_id
      },
      data: {
        tool_name: input.tool_name,
        tool_use_id: input.tool_use_id,
        tool_input: input.tool_input,
        error: input.error,
        is_interrupt: input.is_interrupt,
        cwd: input.cwd,
        transcript_path: input.transcript_path,
        permission_mode: input.permission_mode
      }
    })
  ),
  Match.when({ hook_event_name: "Notification" }, (input) =>
    makeHookEvent(input, {
      level: LogLevel.Info,
      eventName: "agent.hook.notification",
      messageText: "hook notification",
      data: {
        title: input.title,
        message: input.message,
        notification_type: input.notification_type,
        cwd: input.cwd,
        transcript_path: input.transcript_path,
        permission_mode: input.permission_mode
      }
    })
  ),
  Match.when({ hook_event_name: "UserPromptSubmit" }, (input) =>
    makeHookEvent(input, {
      level: LogLevel.Debug,
      eventName: "agent.hook.user_prompt_submit",
      messageText: "hook user prompt submit",
      data: {
        prompt: input.prompt,
        cwd: input.cwd,
        transcript_path: input.transcript_path,
        permission_mode: input.permission_mode
      }
    })
  ),
  Match.when({ hook_event_name: "SessionStart" }, (input) =>
    makeHookEvent(input, {
      level: LogLevel.Info,
      eventName: "agent.hook.session_start",
      messageText: "hook session start",
      data: {
        source: input.source,
        agent_type: input.agent_type,
        model: input.model,
        cwd: input.cwd,
        transcript_path: input.transcript_path,
        permission_mode: input.permission_mode
      }
    })
  ),
  Match.when({ hook_event_name: "SessionEnd" }, (input) =>
    makeHookEvent(input, {
      level: LogLevel.Info,
      eventName: "agent.hook.session_end",
      messageText: "hook session end",
      data: {
        reason: input.reason,
        cwd: input.cwd,
        transcript_path: input.transcript_path,
        permission_mode: input.permission_mode
      }
    })
  ),
  Match.when({ hook_event_name: "Stop" }, (input) =>
    makeHookEvent(input, {
      level: LogLevel.Warning,
      eventName: "agent.hook.stop",
      messageText: "hook stop",
      data: {
        stop_hook_active: input.stop_hook_active,
        cwd: input.cwd,
        transcript_path: input.transcript_path,
        permission_mode: input.permission_mode
      }
    })
  ),
  Match.when({ hook_event_name: "SubagentStart" }, (input) =>
    makeHookEvent(input, {
      level: LogLevel.Debug,
      eventName: "agent.hook.subagent_start",
      messageText: "hook subagent start",
      annotations: {
        agent_id: input.agent_id
      },
      data: {
        agent_id: input.agent_id,
        agent_type: input.agent_type,
        cwd: input.cwd,
        transcript_path: input.transcript_path,
        permission_mode: input.permission_mode
      }
    })
  ),
  Match.when({ hook_event_name: "SubagentStop" }, (input) =>
    makeHookEvent(input, {
      level: LogLevel.Debug,
      eventName: "agent.hook.subagent_stop",
      messageText: "hook subagent stop",
      annotations: {
        agent_id: input.agent_id
      },
      data: {
        agent_id: input.agent_id,
        stop_hook_active: input.stop_hook_active,
        agent_transcript_path: input.agent_transcript_path,
        cwd: input.cwd,
        transcript_path: input.transcript_path,
        permission_mode: input.permission_mode
      }
    })
  ),
  Match.when({ hook_event_name: "PreCompact" }, (input) =>
    makeHookEvent(input, {
      level: LogLevel.Info,
      eventName: "agent.hook.pre_compact",
      messageText: "hook pre compact",
      data: {
        trigger: input.trigger,
        custom_instructions: input.custom_instructions,
        cwd: input.cwd,
        transcript_path: input.transcript_path,
        permission_mode: input.permission_mode
      }
    })
  ),
  Match.when({ hook_event_name: "PermissionRequest" }, (input) =>
    makeHookEvent(input, {
      level: LogLevel.Warning,
      eventName: "agent.hook.permission_request",
      messageText: "hook permission request",
      annotations: {
        tool_name: input.tool_name
      },
      data: {
        tool_name: input.tool_name,
        tool_input: input.tool_input,
        permission_suggestions: input.permission_suggestions,
        cwd: input.cwd,
        transcript_path: input.transcript_path,
        permission_mode: input.permission_mode
      }
    })
  ),
  Match.when({ hook_event_name: "Setup" }, (input) =>
    makeHookEvent(input, {
      level: LogLevel.Info,
      eventName: "agent.hook.setup",
      messageText: "hook setup",
      data: {
        trigger: input.trigger,
        cwd: input.cwd,
        transcript_path: input.transcript_path,
        permission_mode: input.permission_mode
      }
    })
  ),
  Match.when({ hook_event_name: "TeammateIdle" }, (input) =>
    makeHookEvent(input, {
      level: LogLevel.Info,
      eventName: "agent.hook.teammate_idle",
      messageText: "hook teammate idle",
      data: {
        teammate_name: input.teammate_name,
        team_name: input.team_name,
        cwd: input.cwd,
        transcript_path: input.transcript_path,
        permission_mode: input.permission_mode
      }
    })
  ),
  Match.when({ hook_event_name: "TaskCompleted" }, (input) =>
    makeHookEvent(input, {
      level: LogLevel.Info,
      eventName: "agent.hook.task_completed",
      messageText: "hook task completed",
      data: {
        task_id: input.task_id,
        task_subject: input.task_subject,
        task_description: input.task_description,
        teammate_name: input.teammate_name,
        team_name: input.team_name,
        cwd: input.cwd,
        transcript_path: input.transcript_path,
        permission_mode: input.permission_mode
      }
    })
  ),
  Match.exhaustive
)
