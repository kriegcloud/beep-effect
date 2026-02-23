import { describe, it, expect } from "vitest"
import * as Schema from "effect/Schema"
import * as Effect from "effect/Effect"
import * as Schemas from "."

const decode = <A, I>(schema: Schema.Schema<A, I>) => (input: unknown) =>
  Schema.decodeUnknownSync(schema)(input)

const encode = <A, I>(schema: Schema.Schema<A, I>) => (value: A) =>
  Schema.encodeSync(schema)(value)

describe("schemas", () => {
  describe("HookInputBase", () => {
    it("decodes valid base input", () => {
      const input = {
        session_id: "session-123",
        transcript_path: "/tmp/transcript.json",
        cwd: "/home/user/project",
        permission_mode: "ask",
        hook_event_name: "PreToolUse",
      }

      const result = decode(Schemas.HookInputBase)(input)
      expect(result.session_id).toBe("session-123")
      expect(result.hook_event_name).toBe("PreToolUse")
    })

    it("fails on missing required fields", () => {
      const input = {
        session_id: "session-123",
      }

      expect(() => decode(Schemas.HookInputBase)(input)).toThrow()
    })
  })

  describe("EditToolInput", () => {
    it("decodes edit tool input", () => {
      const input = {
        file_path: "/path/to/file.ts",
        old_string: "const x = 1",
        new_string: "const x = 2",
      }

      const result = decode(Schemas.EditToolInput)(input)
      expect(result.file_path).toBe("/path/to/file.ts")
      expect(result.old_string).toBe("const x = 1")
      expect(result.new_string).toBe("const x = 2")
    })

    it("handles optional replace_all", () => {
      const input = {
        file_path: "/path/to/file.ts",
        old_string: "old",
        new_string: "new",
        replace_all: true,
      }

      const result = decode(Schemas.EditToolInput)(input)
      expect(result.replace_all).toBe(true)
    })

    it("allows omitted replace_all", () => {
      const input = {
        file_path: "/path/to/file.ts",
        old_string: "old",
        new_string: "new",
      }

      const result = decode(Schemas.EditToolInput)(input)
      expect(result.replace_all).toBeUndefined()
    })
  })

  describe("WriteToolInput", () => {
    it("decodes write tool input", () => {
      const input = {
        file_path: "/path/to/file.ts",
        content: "const hello = 'world'",
      }

      const result = decode(Schemas.WriteToolInput)(input)
      expect(result.file_path).toBe("/path/to/file.ts")
      expect(result.content).toBe("const hello = 'world'")
    })
  })

  describe("TaskToolInput", () => {
    it("decodes task tool input", () => {
      const input = {
        description: "Write tests",
        prompt: "Add unit tests for module X",
        subagent_type: "implementer",
      }

      const result = decode(Schemas.TaskToolInput)(input)
      expect(result.description).toBe("Write tests")
      expect(result.prompt).toBe("Add unit tests for module X")
      expect(result.subagent_type).toBe("implementer")
    })

    it("handles all optional fields", () => {
      const input = {
        description: "Write tests",
        prompt: "Add unit tests",
        subagent_type: "implementer",
        model: "claude-opus-4",
        run_in_background: true,
        resume: "prev-task-id",
      }

      const result = decode(Schemas.TaskToolInput)(input)
      expect(result.model).toBe("claude-opus-4")
      expect(result.run_in_background).toBe(true)
      expect(result.resume).toBe("prev-task-id")
    })
  })

  describe("GenericToolInput", () => {
    it("decodes with all optional fields", () => {
      const input = {
        file_path: "/path/to/file.ts",
        content: "some content",
      }

      const result = decode(Schemas.GenericToolInput)(input)
      expect(result.file_path).toBe("/path/to/file.ts")
      expect(result.content).toBe("some content")
    })

    it("decodes with empty object", () => {
      const input = {}
      const result = decode(Schemas.GenericToolInput)(input)
      expect(result).toEqual({})
    })
  })

  describe("StructuredPatchEntry", () => {
    it("decodes structured patch entry", () => {
      const input = {
        oldStart: 1,
        oldLines: 2,
        newStart: 1,
        newLines: 3,
        lines: ["+added line", " unchanged", "-removed"],
      }

      const result = decode(Schemas.StructuredPatchEntry)(input)
      expect(result.oldStart).toBe(1)
      expect(result.lines).toHaveLength(3)
    })
  })

  describe("EditToolResponse", () => {
    it("decodes edit tool response", () => {
      const input = {
        filePath: "/path/to/file.ts",
        oldString: "old",
        newString: "new",
        originalFile: "original content",
        structuredPatch: [],
        userModified: false,
        replaceAll: false,
      }

      const result = decode(Schemas.EditToolResponse)(input)
      expect(result.filePath).toBe("/path/to/file.ts")
      expect(result.userModified).toBe(false)
    })
  })

  describe("WriteToolResponse", () => {
    it("decodes create response", () => {
      const input = {
        type: "create",
        filePath: "/path/to/new-file.ts",
        content: "new content",
        structuredPatch: [],
        originalFile: null,
      }

      const result = decode(Schemas.WriteToolResponse)(input)
      expect(result.type).toBe("create")
      expect(result.originalFile).toBeNull()
    })

    it("decodes overwrite response", () => {
      const input = {
        type: "overwrite",
        filePath: "/path/to/existing-file.ts",
        content: "updated content",
        structuredPatch: [],
        originalFile: "old content",
      }

      const result = decode(Schemas.WriteToolResponse)(input)
      expect(result.type).toBe("overwrite")
      expect(result.originalFile).toBe("old content")
    })
  })

  describe("PreToolUseInput", () => {
    it("decodes PreToolUse input", () => {
      const input = {
        session_id: "session-123",
        transcript_path: "/tmp/transcript.json",
        cwd: "/home/user/project",
        permission_mode: "ask",
        hook_event_name: "PreToolUse",
        tool_name: "Edit",
        tool_input: { file_path: "/path/to/file.ts" },
        tool_use_id: "use-123",
      }

      const result = decode(Schemas.PreToolUseInput)(input)
      expect(result.hook_event_name).toBe("PreToolUse")
      expect(result.tool_name).toBe("Edit")
      expect(result.tool_use_id).toBe("use-123")
    })

    it("enforces literal hook_event_name", () => {
      const input = {
        session_id: "session-123",
        transcript_path: "/tmp/transcript.json",
        cwd: "/home/user/project",
        permission_mode: "ask",
        hook_event_name: "PostToolUse",
        tool_name: "Edit",
        tool_input: {},
        tool_use_id: "use-123",
      }

      expect(() => decode(Schemas.PreToolUseInput)(input)).toThrow()
    })
  })

  describe("PostToolUseInput", () => {
    it("decodes PostToolUse input", () => {
      const input = {
        session_id: "session-123",
        transcript_path: "/tmp/transcript.json",
        cwd: "/home/user/project",
        permission_mode: "ask",
        hook_event_name: "PostToolUse",
        tool_name: "Edit",
        tool_input: { file_path: "/path/to/file.ts" },
        tool_response: { filePath: "/path/to/file.ts" },
        tool_use_id: "use-123",
      }

      const result = decode(Schemas.PostToolUseInput)(input)
      expect(result.hook_event_name).toBe("PostToolUse")
      expect(result.tool_response).toBeTruthy()
    })

    it("enforces literal hook_event_name", () => {
      const input = {
        session_id: "session-123",
        transcript_path: "/tmp/transcript.json",
        cwd: "/home/user/project",
        permission_mode: "ask",
        hook_event_name: "PreToolUse",
        tool_name: "Edit",
        tool_input: {},
        tool_response: {},
        tool_use_id: "use-123",
      }

      expect(() => decode(Schemas.PostToolUseInput)(input)).toThrow()
    })
  })

  describe("UserPromptInput", () => {
    it("decodes user prompt input", () => {
      const input = {
        session_id: "session-123",
        transcript_path: "/tmp/transcript.json",
        cwd: "/home/user/project",
        permission_mode: "ask",
        hook_event_name: "UserPromptSubmit",
        prompt: "Help me write tests",
      }

      const result = decode(Schemas.UserPromptInput)(input)
      expect(result.hook_event_name).toBe("UserPromptSubmit")
      expect(result.prompt).toBe("Help me write tests")
    })

    it("enforces literal hook_event_name", () => {
      const input = {
        session_id: "session-123",
        transcript_path: "/tmp/transcript.json",
        cwd: "/home/user/project",
        permission_mode: "ask",
        hook_event_name: "SessionStart",
        prompt: "Hello",
      }

      expect(() => decode(Schemas.UserPromptInput)(input)).toThrow()
    })
  })

  describe("SessionStartInput", () => {
    it("decodes session start input", () => {
      const input = {
        session_id: "session-123",
        transcript_path: "/tmp/transcript.json",
        cwd: "/home/user/project",
        permission_mode: "ask",
        hook_event_name: "SessionStart",
      }

      const result = decode(Schemas.SessionStartInput)(input)
      expect(result.hook_event_name).toBe("SessionStart")
      expect(result.session_id).toBe("session-123")
    })

    it("enforces literal hook_event_name", () => {
      const input = {
        session_id: "session-123",
        transcript_path: "/tmp/transcript.json",
        cwd: "/home/user/project",
        permission_mode: "ask",
        hook_event_name: "PreToolUse",
      }

      expect(() => decode(Schemas.SessionStartInput)(input)).toThrow()
    })
  })

  describe("HookOutput", () => {
    it("decodes hook output", () => {
      const input = {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          additionalContext: "Some context here",
        },
      }

      const result = decode(Schemas.HookOutput)(input)
      expect(result.hookSpecificOutput.hookEventName).toBe("PreToolUse")
      expect(result.hookSpecificOutput.additionalContext).toBe("Some context here")
    })

    it("encodes hook output", () => {
      const value: Schemas.HookOutput = {
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: "Context",
        },
      }

      const result = encode(Schemas.HookOutput)(value)
      expect(result.hookSpecificOutput.hookEventName).toBe("PostToolUse")
    })
  })

  describe("ToolUseInput (legacy)", () => {
    it("decodes both PreToolUse and PostToolUse", () => {
      const preInput = {
        session_id: "session-123",
        transcript_path: "/tmp/transcript.json",
        cwd: "/home/user/project",
        permission_mode: "ask",
        hook_event_name: "PreToolUse",
        tool_name: "Edit",
        tool_input: {},
        tool_use_id: "use-123",
      }

      const result1 = decode(Schemas.ToolUseInput)(preInput)
      expect(result1.hook_event_name).toBe("PreToolUse")
      expect(result1.tool_response).toBeUndefined()

      const postInput = {
        ...preInput,
        hook_event_name: "PostToolUse",
        tool_response: { result: "done" },
      }

      const result2 = decode(Schemas.ToolUseInput)(postInput)
      expect(result2.hook_event_name).toBe("PostToolUse")
      expect(result2.tool_response).toBeTruthy()
    })
  })
})
