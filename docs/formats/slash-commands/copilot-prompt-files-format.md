# GitHub Copilot Prompt Files Format Specification

**Source**: https://code.visualstudio.com/docs/copilot/customization/prompt-files

## Overview

Prompt files are reusable, task-specific prompts defined in Markdown files with the `.prompt.md` extension. They enable developers to create standardized workflows for common and repeatable development tasks.

**Status**: Public preview (available in VS Code, Visual Studio, and JetBrains IDEs)

## File Locations

### Workspace-Level (Project-Specific)
- **Location**: `.github/prompts/` directory
- **Scope**: Available only within that workspace
- **Use case**: Project-specific prompts

### User-Level (Cross-Workspace)
- **Location**: VS Code profile folder
- **Scope**: Available across all workspaces
- **Synchronization**: Syncs across devices via Settings Sync when "Prompts and Instructions" is enabled

**Additional locations** can be configured via `chat.promptFilesLocations` setting.

## File Extension

All prompt files must use the `.prompt.md` extension.

**Naming convention**: `[name].prompt.md`

**Invocation**: Type `/[name]` in Copilot Chat (e.g., `/explain-code` for `explain-code.prompt.md`)

## File Structure

Prompt files consist of two parts:

1. **YAML frontmatter** (optional): Metadata and configuration
2. **Markdown body**: The actual prompt instructions

### Example Structure

```markdown
---
description: 'Generate a clear code explanation with examples'
name: 'explain-code'
argument-hint: 'code snippet to explain'
agent: 'ask'
model: 'gpt-4o'
tools:
  - 'githubRepo'
  - 'search/codebase'
---

Explain the following code in a clear, beginner-friendly way:

Code to explain: ${input:code:Paste your code here}
Target audience: ${input:audience:Who is this explanation for?}

Please provide:
* A brief overview of what the code does
* A step-by-step breakdown of the main parts
* Explanation of any key concepts or terminology
```

## Frontmatter Fields

All frontmatter fields are optional:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `description` | string | Short description of the prompt's purpose | `'Generate a clear code explanation'` |
| `name` | string | The name used after typing `/` in chat | `'explain-code'` |
| `argument-hint` | string | Guidance text displayed in chat input | `'code snippet to explain'` |
| `agent` | string | Agent type: `ask`, `edit`, `agent`, or custom agent name | `'ask'` |
| `model` | string | Language model selection (uses default if omitted) | `'gpt-4o'` |
| `tools` | array | List of tool or tool set names available for this prompt | `['githubRepo', 'search/codebase']` |

**Note**: Documentation also shows `mode` as an alternative to `agent` in some examples (appears to be legacy or interchangeable).

### Field Details

#### `description`
Brief explanation of what the prompt does. Helps users understand the prompt's purpose.

```yaml
description: 'Generate unit tests for the selected code'
```

#### `name`
Custom display name for the prompt. If omitted, filename is used.

```yaml
name: 'explain-code'
```

#### `argument-hint`
Guidance text shown in the chat input field when the prompt is selected.

```yaml
argument-hint: 'code snippet to explain'
argument-hint: 'file path or code block'
```

#### `agent`
Specifies which agent executes the prompt.

**Agent types**:
- `ask`: Standard chat interaction
- `edit`: Code editing mode
- `agent`: Generic agent mode
- Custom agent names: Reference custom-defined agents

```yaml
agent: 'ask'
agent: 'edit'
agent: 'my-custom-agent'
```

#### `model`
Selects which language model to use. Defaults to user's current model choice if omitted.

```yaml
model: 'gpt-4o'
model: 'gpt-4'
model: 'gpt-3.5-turbo'
```

#### `tools`
Specifies which tools are available for the prompt.

**Tool formats**:
- Built-in tool names (e.g., `githubRepo`)
- Tool set names (e.g., `search/codebase`)
- MCP tools
- Extension-contributed tools
- MCP server tools using `<server name>/*` format

```yaml
tools:
  - 'githubRepo'
  - 'search/codebase'
  - 'myMcpServer/*'
```

**Tool priority hierarchy** (when multiple sources specify tools):
1. Tools from the prompt file (highest priority)
2. Tools from referenced custom agent
3. Default agent tools (lowest priority)

**Note**: Unavailable tools are silently ignored during execution.

## Body Syntax

The prompt body contains instructions for the LLM and supports several special syntaxes:

### Variable Substitution

Variables use `${variableName}` format:

#### Workspace Variables
- `${workspaceFolder}`: Full path to workspace folder
- `${workspaceFolderBasename}`: Workspace folder name

#### Selection Variables
- `${selection}`: Currently selected text
- `${selectedText}`: Currently selected text (alternative)

#### File Context Variables
- `${file}`: Full file path
- `${fileBasename}`: File name with extension
- `${fileDirname}`: Directory path
- `${fileBasenameNoExtension}`: File name without extension

#### Input Variables (Prompt User for Values)
- `${input:variableName}`: Prompt for input with variable name
- `${input:variableName:placeholder}`: Prompt with placeholder text

**Example**:
```markdown
Code to explain: ${input:code:Paste your code here}
Target audience: ${input:audience:Who is this explanation for?}
Current file: ${file}
Selected code: ${selection}
```

### Tool References

Use `#tool:<tool-name>` syntax to reference tools:

**Example**:
```markdown
Use #tool:githubRepo to search the repository for similar implementations.
Check the codebase with #tool:search/codebase for existing patterns.
```

### File References

Use Markdown link syntax with relative paths:

**Example**:
```markdown
Review the implementation in [config.ts](../src/config.ts)
Compare with [old version](./archive/config-v1.ts)
```

## Invocation Methods

Prompts can be invoked in three ways:

1. **Chat input**: Type `/promptname` in Copilot Chat
2. **Command Palette**: Use "Chat: Run Prompt" command
3. **Editor**: Click the play button within the prompt file

## Key Features

### Scope and Precedence
- Workspace prompts override user prompts with the same name
- Prompt tools override agent tools (tool priority hierarchy applies)

### Settings Sync
User-level prompt files can be synchronized across devices when "Prompts and Instructions" is enabled in Settings Sync.

### Recommendations
The `chat.promptFilesRecommendations` setting controls which prompts appear in recommended suggestions.

### Extra Chat Input
Additional parameters can be passed when invoking prompts:
```
/prompt-name param=value
```
This extra input augments the prompt execution.

## Complete Examples

### Basic Prompt (Minimal Frontmatter)

```markdown
---
description: 'Explain code in simple terms'
---

Explain the following code: ${selection}

Make it beginner-friendly and include examples.
```

### Advanced Prompt (Full Features)

```markdown
---
description: 'Generate comprehensive unit tests'
name: 'generate-tests'
argument-hint: 'file path or code selection'
agent: 'edit'
model: 'gpt-4o'
tools:
  - 'githubRepo'
  - 'search/codebase'
---

# Unit Test Generation

Generate comprehensive unit tests for: ${selection}

## Requirements

1. Use the testing framework from ${workspaceFolder}/package.json
2. Follow patterns in existing tests: #tool:search/codebase
3. Include edge cases and error scenarios
4. Add descriptive test names

## Context

- File: ${file}
- Project: ${workspaceFolderBasename}

## Coverage Goals

Aim for ${input:coverage:Target coverage percentage (e.g., 80%)} coverage.
```

### Prompt with Input Variables

```markdown
---
description: 'Create API endpoint documentation'
agent: 'ask'
---

Document the API endpoint: ${input:endpoint:Enter endpoint path (e.g., /api/users)}

Include:
- HTTP method: ${input:method:GET, POST, PUT, DELETE}
- Request parameters
- Response format
- Example usage
- Error codes
```

## Best Practices

1. **Use workspace prompts** for project-specific workflows
2. **Use user prompts** for personal productivity tools
3. **Add descriptions** to make prompts discoverable
4. **Use argument-hint** to guide users on expected inputs
5. **Specify tools** via `tools` field for consistent results
6. **Leverage input variables** for dynamic, reusable prompts
7. **Test with play button** before sharing with team
8. **Use agent field** to route to appropriate execution mode
9. **Include context variables** for file and selection awareness
10. **Organize in .github/prompts/** for team collaboration

## Copilot-Specific Features

### Variable Substitution System
- Rich variable interpolation for workspace context
- User input variables with placeholder support
- Automatic substitution at runtime

### Agent Selection
- Flexible agent routing via `agent` field
- Supports built-in and custom agents
- Agent-specific behavior and capabilities

### Tool Integration
- Explicit tool specification via `tools` field
- Priority-based tool resolution
- Silent handling of unavailable tools

### File Context Awareness
- Direct file and workspace references
- Relative path resolution
- Selection-aware prompts
