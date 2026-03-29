import { expect, test } from "@effect/vitest";
import * as S from "effect/Schema";
import {
  PostToolUseCommandInput,
  PostToolUseCommandOutput,
  PreToolUseCommandInput,
  PreToolUseCommandOutput,
  SessionStartCommandInput,
  SessionStartHookSpecificOutput,
  StopCommandInput,
  StopCommandOutput,
  UserPromptSubmitCommandInput,
  UserPromptSubmitCommandOutput,
} from "../../Domain/Hooks/index.ts";

test("PreToolUse input decodes the generated Bash wire shape", () => {
  const decode = S.decodeUnknownSync(PreToolUseCommandInput);
  const decoded = decode({
    cwd: "/workspace",
    hook_event_name: "PreToolUse",
    model: "gpt-5.4",
    permission_mode: "plan",
    session_id: "session-1",
    tool_input: {
      command: "git status",
    },
    tool_name: "Bash",
    tool_use_id: "tool-1",
    transcript_path: null,
    turn_id: "turn-1",
  });

  expect(decoded).toBeInstanceOf(PreToolUseCommandInput);
  expect(decoded.tool_input.command).toBe("git status");
  expect(decoded.transcript_path).toBeNull();
});

test("PreToolUse input rejects unknown keys", () => {
  const decode = S.decodeUnknownSync(PreToolUseCommandInput);

  expect(() =>
    decode({
      cwd: "/workspace",
      extra: true,
      hook_event_name: "PreToolUse",
      model: "gpt-5.4",
      permission_mode: "plan",
      session_id: "session-1",
      tool_input: {
        command: "git status",
      },
      tool_name: "Bash",
      tool_use_id: "tool-1",
      transcript_path: "/tmp/transcript.jsonl",
      turn_id: "turn-1",
    })
  ).toThrow();
});

test("PreToolUse output accepts legacy decision shape and rejects null optional fields", () => {
  const decode = S.decodeUnknownSync(PreToolUseCommandOutput);
  const decoded = decode({
    decision: "block",
    reason: "Do not run that command.",
  });

  expect(decoded.decision).toBe("block");
  expect(() => decode({ reason: null })).toThrow();
});

test("PostToolUse input accepts arbitrary JSON tool responses", () => {
  const decode = S.decodeUnknownSync(PostToolUseCommandInput);
  const decoded = decode({
    cwd: "/workspace",
    hook_event_name: "PostToolUse",
    model: "gpt-5.4",
    permission_mode: "default",
    session_id: "session-1",
    tool_input: {
      command: "bun test",
    },
    tool_name: "Bash",
    tool_response: {
      exitCode: 1,
      stderr: "failed",
    },
    tool_use_id: "tool-2",
    transcript_path: "/tmp/transcript.jsonl",
    turn_id: "turn-2",
  });

  expect(decoded.tool_response).toEqual({
    exitCode: 1,
    stderr: "failed",
  });
});

test("PostToolUse output supports hook-specific additional context", () => {
  const decode = S.decodeUnknownSync(PostToolUseCommandOutput);
  const decoded = decode({
    decision: "block",
    hookSpecificOutput: {
      additionalContext: "Generated files changed.",
      hookEventName: "PostToolUse",
    },
    reason: "Review the generated output before continuing.",
  });

  expect(decoded.hookSpecificOutput?.additionalContext).toBe("Generated files changed.");
});

test("SessionStart input accepts clear as a generated-schema source value", () => {
  const decode = S.decodeUnknownSync(SessionStartCommandInput);
  const decoded = decode({
    cwd: "/workspace",
    hook_event_name: "SessionStart",
    model: "gpt-5.4",
    permission_mode: "acceptEdits",
    session_id: "session-1",
    source: "clear",
    transcript_path: null,
  });

  expect(decoded.source).toBe("clear");
});

test("SessionStart hook-specific output mirrors the generated hook event-name union", () => {
  const decode = S.decodeUnknownSync(SessionStartHookSpecificOutput);
  const decoded = decode({
    hookEventName: "Stop",
  });

  expect(decoded.hookEventName).toBe("Stop");
});

test("Stop input accepts a nullable last assistant message", () => {
  const decode = S.decodeUnknownSync(StopCommandInput);
  const decoded = decode({
    cwd: "/workspace",
    hook_event_name: "Stop",
    last_assistant_message: null,
    model: "gpt-5.4",
    permission_mode: "dontAsk",
    session_id: "session-1",
    stop_hook_active: false,
    transcript_path: "/tmp/transcript.jsonl",
    turn_id: "turn-3",
  });

  expect(decoded.last_assistant_message).toBeNull();
});

test("Stop output rejects explicit null for optional fields", () => {
  const decode = S.decodeUnknownSync(StopCommandOutput);

  expect(() => decode({ decision: "block", reason: null })).toThrow();
});

test("UserPromptSubmit input decodes the generated turn-scoped wire shape", () => {
  const decode = S.decodeUnknownSync(UserPromptSubmitCommandInput);
  const decoded = decode({
    cwd: "/workspace",
    hook_event_name: "UserPromptSubmit",
    model: "gpt-5.4",
    permission_mode: "bypassPermissions",
    prompt: "Please summarize the test failures.",
    session_id: "session-1",
    transcript_path: null,
    turn_id: "turn-4",
  });

  expect(decoded.prompt).toBe("Please summarize the test failures.");
});

test("UserPromptSubmit output permits blocking with hook-specific context", () => {
  const decode = S.decodeUnknownSync(UserPromptSubmitCommandOutput);
  const decoded = decode({
    decision: "block",
    hookSpecificOutput: {
      additionalContext: "Ask for confirmation before editing production configs.",
      hookEventName: "UserPromptSubmit",
    },
    reason: "Confirm the production change first.",
  });

  expect(decoded.reason).toBe("Confirm the production change first.");
  expect(decoded.hookSpecificOutput?.hookEventName).toBe("UserPromptSubmit");
});
