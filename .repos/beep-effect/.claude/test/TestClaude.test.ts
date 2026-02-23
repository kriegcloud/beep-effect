import { describe, it, expect } from "vitest"
import * as TestClaude from "./TestClaude"

describe("TestClaude tool constructors", () => {
  it("creates Task hook input with pre and post", () => {
    const hooks = TestClaude.Task({
      description: "Test task",
      prompt: "Do something",
      subagent_type: "test-agent",
    })

    expect(hooks.pre.hook_event_name).toBe("PreToolUse")
    expect(hooks.pre.tool_name).toBe("Task")
    expect(hooks.pre.tool_input.description).toBe("Test task")
    expect(hooks.pre.tool_input.prompt).toBe("Do something")
    expect(hooks.pre.tool_input.subagent_type).toBe("test-agent")

    expect(hooks.post.hook_event_name).toBe("PostToolUse")
    expect(hooks.post.tool_name).toBe("Task")
    expect(hooks.post.tool_input.description).toBe("Test task")
  })

  it("creates WebFetch hook input", () => {
    const hooks = TestClaude.WebFetch({
      url: "https://example.com",
    })

    expect(hooks.pre.hook_event_name).toBe("PreToolUse")
    expect(hooks.pre.tool_name).toBe("WebFetch")
    expect(hooks.pre.tool_input.url).toBe("https://example.com")

    expect(hooks.post.hook_event_name).toBe("PostToolUse")
    expect(hooks.post.tool_name).toBe("WebFetch")
  })

  it("creates WebSearch hook input", () => {
    const hooks = TestClaude.WebSearch({
      query: "Effect TypeScript tutorial",
    })

    expect(hooks.pre.hook_event_name).toBe("PreToolUse")
    expect(hooks.pre.tool_name).toBe("WebSearch")
    expect(hooks.pre.tool_input.query).toBe("Effect TypeScript tutorial")

    expect(hooks.post.hook_event_name).toBe("PostToolUse")
  })

  it("creates LSP hook input", () => {
    const hooks = TestClaude.LSP({
      operation: "references",
      file: "src/test.ts",
      line: 10,
      col: 5,
    })

    expect(hooks.pre.hook_event_name).toBe("PreToolUse")
    expect(hooks.pre.tool_name).toBe("LSP")
    expect(hooks.pre.tool_input.operation).toBe("references")
    expect(hooks.pre.tool_input.file).toBe("src/test.ts")
    expect(hooks.pre.tool_input.line).toBe(10)
    expect(hooks.pre.tool_input.col).toBe(5)

    expect(hooks.post.hook_event_name).toBe("PostToolUse")
  })

  it("creates NotebookEdit hook input", () => {
    const hooks = TestClaude.NotebookEdit({
      notebook_path: "/path/to/notebook.ipynb",
      cell_index: 0,
      new_content: "print('hello')",
    })

    expect(hooks.pre.hook_event_name).toBe("PreToolUse")
    expect(hooks.post.hook_event_name).toBe("PostToolUse")
    expect(hooks.post.tool_name).toBe("NotebookEdit")
    expect(hooks.post.tool_input.notebook_path).toBe("/path/to/notebook.ipynb")
    expect(hooks.post.tool_input.cell_index).toBe(0)
    expect(hooks.post.tool_input.new_content).toBe("print('hello')")
  })

  it("creates TodoWrite hook input", () => {
    const hooks = TestClaude.TodoWrite({
      content: "- [ ] Fix bug\n- [ ] Add tests",
    })

    expect(hooks.pre.hook_event_name).toBe("PreToolUse")
    expect(hooks.post.hook_event_name).toBe("PostToolUse")
    expect(hooks.post.tool_name).toBe("TodoWrite")
    expect(hooks.post.tool_input.content).toBe("- [ ] Fix bug\n- [ ] Add tests")
  })

  it("supports Task with optional parameters", () => {
    const hooks = TestClaude.Task({
      description: "Background task",
      prompt: "Process data",
      subagent_type: "worker",
      model: "claude-3-5-sonnet-20241022",
      run_in_background: true,
    })

    expect(hooks.pre.tool_input.model).toBe("claude-3-5-sonnet-20241022")
    expect(hooks.pre.tool_input.run_in_background).toBe(true)
    expect(hooks.post.tool_input.model).toBe("claude-3-5-sonnet-20241022")
  })

  it("supports LSP with optional newName for rename", () => {
    const hooks = TestClaude.LSP({
      operation: "rename",
      file: "src/utils.ts",
      line: 5,
      col: 10,
      newName: "newFunctionName",
    })

    expect(hooks.pre.tool_input.newName).toBe("newFunctionName")
    expect(hooks.post.tool_input.newName).toBe("newFunctionName")
  })

  it("provides both pre and post for all tools", () => {
    const bashHooks = TestClaude.Bash({ command: "ls -la" })
    expect(bashHooks.pre.hook_event_name).toBe("PreToolUse")
    expect(bashHooks.post.hook_event_name).toBe("PostToolUse")

    const readHooks = TestClaude.Read({ file_path: "/etc/passwd" })
    expect(readHooks.pre.hook_event_name).toBe("PreToolUse")
    expect(readHooks.post.hook_event_name).toBe("PostToolUse")

    const writeHooks = TestClaude.Write({ file_path: "/tmp/test", content: "hello" })
    expect(writeHooks.pre.hook_event_name).toBe("PreToolUse")
    expect(writeHooks.post.hook_event_name).toBe("PostToolUse")

    const editHooks = TestClaude.Edit({ file_path: "/tmp/test", old_string: "a", new_string: "b" })
    expect(editHooks.pre.hook_event_name).toBe("PreToolUse")
    expect(editHooks.post.hook_event_name).toBe("PostToolUse")

    const grepHooks = TestClaude.Grep({ pattern: "test" })
    expect(grepHooks.pre.hook_event_name).toBe("PreToolUse")
    expect(grepHooks.post.hook_event_name).toBe("PostToolUse")

    const globHooks = TestClaude.Glob({ pattern: "**/*.ts" })
    expect(globHooks.pre.hook_event_name).toBe("PreToolUse")
    expect(globHooks.post.hook_event_name).toBe("PostToolUse")
  })
})
