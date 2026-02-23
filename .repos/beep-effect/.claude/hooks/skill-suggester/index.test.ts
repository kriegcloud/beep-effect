import { describe, it, expect } from "vitest"
import * as TestClaude from "../../test/TestClaude"

describe("skill-suggester", () => {
  describe("TestClaude.UserPromptSubmit", () => {
    it("creates properly shaped UserPromptSubmit hook input", () => {
      const input = TestClaude.UserPromptSubmit({
        session_id: "test-session",
        transcript_path: "/tmp/transcript.json",
        cwd: "/project",
        permission_mode: "ask",
        prompt: "help me write tests with vitest",
      })

      expect(input.hook_event_name).toBe("UserPromptSubmit")
      expect(input.prompt).toBe("help me write tests with vitest")
      expect(input.session_id).toBe("test-session")
      expect(input.cwd).toBe("/project")
      expect(input.permission_mode).toBe("ask")
      expect(input.transcript_path).toBe("/tmp/transcript.json")
    })

    it("automatically sets hook_event_name", () => {
      const input = TestClaude.UserPromptSubmit({
        session_id: "test",
        transcript_path: "/tmp/transcript.json",
        cwd: "/project",
        permission_mode: "ask",
        prompt: "test prompt",
      })

      expect(input.hook_event_name).toBe("UserPromptSubmit")
    })

    it("preserves all input fields", () => {
      const input = TestClaude.UserPromptSubmit({
        session_id: "session-123",
        transcript_path: "/path/to/transcript.json",
        cwd: "/workspace/project",
        permission_mode: "allow",
        prompt: "help with editor configuration",
      })

      expect(input).toEqual({
        hook_event_name: "UserPromptSubmit",
        session_id: "session-123",
        transcript_path: "/path/to/transcript.json",
        cwd: "/workspace/project",
        permission_mode: "allow",
        prompt: "help with editor configuration",
      })
    })
  })

  describe("TestClaude.HookOutput", () => {
    it("validates output shape with additionalContext", () => {
      const output: TestClaude.HookOutput = {
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          additionalContext: "<system-hints>\n<skills>effect-testing</skills>\n</system-hints>",
        },
      }

      expect(output.hookSpecificOutput.hookEventName).toBe("UserPromptSubmit")
      expect(output.hookSpecificOutput.additionalContext).toBeTruthy()
    })

    it("allows optional permission fields", () => {
      const output: TestClaude.HookOutput = {
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          additionalContext: "<tip>Use parallel tool calls</tip>",
        },
      }

      expect(output.hookSpecificOutput.permissionDecision).toBeUndefined()
      expect(output.hookSpecificOutput.permissionDecisionReason).toBeUndefined()
    })

    it("supports all optional fields", () => {
      const output: TestClaude.HookOutput = {
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          permissionDecision: "allow",
          permissionDecisionReason: "Safe operation",
          additionalContext: "<context>Additional info</context>",
        },
      }

      expect(output.hookSpecificOutput.permissionDecision).toBe("allow")
      expect(output.hookSpecificOutput.permissionDecisionReason).toBe("Safe operation")
      expect(output.hookSpecificOutput.additionalContext).toBe("<context>Additional info</context>")
    })
  })

  describe("TestClaude output helpers", () => {
    it("isAllow identifies allow decision", () => {
      const output: TestClaude.HookOutput = {
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          permissionDecision: "allow",
        },
      }

      expect(TestClaude.isAllow(output)).toBe(true)
      expect(TestClaude.isAsk(output)).toBe(false)
      expect(TestClaude.isDeny(output)).toBe(false)
    })

    it("isAsk identifies ask decision", () => {
      const output: TestClaude.HookOutput = {
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          permissionDecision: "ask",
        },
      }

      expect(TestClaude.isAsk(output)).toBe(true)
      expect(TestClaude.isAllow(output)).toBe(false)
      expect(TestClaude.isDeny(output)).toBe(false)
    })

    it("isDeny identifies deny decision", () => {
      const output: TestClaude.HookOutput = {
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          permissionDecision: "deny",
        },
      }

      expect(TestClaude.isDeny(output)).toBe(true)
      expect(TestClaude.isAllow(output)).toBe(false)
      expect(TestClaude.isAsk(output)).toBe(false)
    })

    it("reason extracts permissionDecisionReason", () => {
      const output: TestClaude.HookOutput = {
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          permissionDecision: "deny",
          permissionDecisionReason: "Dangerous operation",
        },
      }

      expect(TestClaude.reason(output)).toBe("Dangerous operation")
    })

    it("context extracts additionalContext", () => {
      const output: TestClaude.HookOutput = {
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          additionalContext: "<skills>effect-testing</skills>",
        },
      }

      expect(TestClaude.context(output)).toBe("<skills>effect-testing</skills>")
    })

    it("helpers handle null input", () => {
      expect(TestClaude.isAllow(null)).toBe(false)
      expect(TestClaude.isAsk(null)).toBe(false)
      expect(TestClaude.isDeny(null)).toBe(false)
      expect(TestClaude.reason(null)).toBeUndefined()
      expect(TestClaude.context(null)).toBeUndefined()
    })
  })
})
