# Claude Code Slash Commands Format Specification

**Source**: https://code.claude.com/docs/en/slash-commands.md

## Overview

Custom slash commands allow you to define frequently used prompts as Markdown files that Claude Code can execute. Commands are organized by scope (project-specific or personal) and support namespacing through directory structures.

## File Locations

### Project Commands
- **Location**: `.claude/commands/`
- **Scope**: Shared with team via version control
- **Display**: "(project)" label in `/help`
- **Precedence**: Overrides user commands with same name

### Personal Commands
- **Location**: `~/.claude/commands/`
- **Scope**: Available across all projects
- **Display**: "(user)" label in `/help`

## File Naming

- **Extension**: `.md` (Markdown)
- **Command name**: Derived from filename without extension
  - `optimize.md` → `/optimize`
  - `security-review.md` → `/security-review`

## Namespacing

Use subdirectories to group related commands. Subdirectories appear in the command description but don't affect the command name.

**Examples**:
- `.claude/commands/frontend/component.md` → `/component` with "(project:frontend)"
- `.claude/commands/backend/test.md` → `/test` with "(project:backend)"
- `~/.claude/commands/component.md` → `/component` with "(user)"

**Name collision rules**:
- Project commands take precedence over user commands
- Commands in different subdirectories can share names (distinguished by subdirectory label)

## Frontmatter Fields

All frontmatter fields are optional. Format is YAML within `---` delimiters.

| Field | Type | Purpose | Default |
|-------|------|---------|---------|
| `description` | string | Brief description shown in command list | First line of prompt |
| `allowed-tools` | string | List of tools the command can use | Inherits from conversation |
| `argument-hint` | string | Arguments expected (shown in autocomplete) | None |
| `model` | string | Specific model (see Claude models documentation) | Inherits from conversation |
| `disable-model-invocation` | boolean | Prevents `SlashCommand` tool from calling | `false` |

### Field Details

#### `description`
Brief text describing what the command does. Shown when users type `/` to see available commands.

```yaml
description: Create a git commit
```

#### `allowed-tools`
Restricts which tools Claude can use during command execution. Uses pattern matching syntax.

**Syntax**: `Tool(pattern:*), Tool(pattern:*), ...`

**Examples**:
```yaml
# Allow specific git operations
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)

# Allow all git commands
allowed-tools: Bash(git:*)

# Allow only git diff
allowed-tools: Bash(git:diff)

# Multiple tools
allowed-tools: Bash(git:*), Read, Write, Grep
```

#### `argument-hint`
Provides hint text for expected arguments. Helps with autocomplete and user guidance.

**Conventions**:
- `[arg]` - Optional argument
- `arg` - Required argument
- `...` - Multiple arguments accepted
- `|` - Alternative formats
- `(optional)` - Explicitly mark optional

**Examples**:
```yaml
argument-hint: [description] | [multi-commit request]
argument-hint: [path/to/file]... (optional)
argument-hint: [branch-name] [path]
argument-hint: [pr-number] [priority] [assignee]
```

#### `model`
Specifies which Claude model to use for command execution.

**Example values**:
```yaml
model: claude-3-5-haiku-20241022  # Fast, lightweight
model: claude-3-5-sonnet-20241022  # Balanced
model: claude-3-opus-20240229      # Most capable
```

#### `disable-model-invocation`
Prevents Claude from automatically invoking this command via the `SlashCommand` tool.

```yaml
disable-model-invocation: true
```

Use when:
- Command should only be manually invoked
- Command has side effects requiring human review
- Command requires explicit user approval

## Argument Handling

### `$ARGUMENTS`
Captures all arguments passed to the command as a single string.

**Example command** (`fix-issue.md`):
```markdown
Fix issue #$ARGUMENTS following our coding standards
```

**Usage**:
```
> /fix-issue 123 high-priority
```
Results in: `$ARGUMENTS = "123 high-priority"`

### Positional Arguments: `$1`, `$2`, etc.
Access specific arguments individually.

**Example command** (`review-pr.md`):
```markdown
Review PR #$1 with priority $2 and assign to $3
```

**Usage**:
```
> /review-pr 456 high alice
```
Results in:
- `$1 = "456"`
- `$2 = "high"`
- `$3 = "alice"`

## Special Features

### Bash Command Execution
Execute bash commands before the slash command runs using the `!` prefix. Output is included in command context.

**Requirements**:
- Must include `allowed-tools` with `Bash` tool
- Can specify which bash commands are allowed

**Syntax**: `!<backtick>command<backtick>`

**Example**:
```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
description: Create a git commit
---

## Context

- Current git status: !`git status`
- Current git diff: !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Your task

Based on the above changes, create a single git commit.
```

### File References
Include file contents using the `@` prefix.

**Examples**:
```markdown
# Single file
Review the implementation in @src/utils/helpers.js

# Multiple files
Compare @src/old-version.js with @src/new-version.js
```

### Thinking Mode
Slash commands can trigger extended thinking by including extended thinking keywords in the prompt.

## Complete Example

```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
argument-hint: [message]
description: Create a git commit
model: claude-3-5-haiku-20241022
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Your task

Create a git commit with message: $ARGUMENTS

Follow these guidelines:
- Use conventional commit format
- Keep message concise but descriptive
- Stage relevant files before committing
```

## SlashCommand Tool

The `SlashCommand` tool allows Claude to execute custom slash commands programmatically during conversation.

### Supported Commands
Only supports custom slash commands that:
- Are user-defined (not built-in commands)
- Have `description` frontmatter field populated
- Do not have `disable-model-invocation: true`

### Permission Rules
- **Exact match**: `SlashCommand:/commit` (allows only `/commit` with no arguments)
- **Prefix match**: `SlashCommand:/review-pr:*` (allows `/review-pr` with any arguments)

### Character Budget
- **Default limit**: 15,000 characters for all command descriptions
- **Custom limit**: Set via `SLASH_COMMAND_TOOL_CHAR_BUDGET` environment variable
- When exceeded, Claude sees only a subset of available commands

### Disable SlashCommand Tool
To prevent Claude from executing any slash commands:
```bash
/permissions
# Add to deny rules: SlashCommand
```

To prevent specific command:
```yaml
disable-model-invocation: true  # in command frontmatter
```

## Best Practices

1. **Use project commands** for team-shared workflows
2. **Use personal commands** for individual preferences
3. **Add descriptions** to make commands discoverable in `/help`
4. **Use argument-hint** to guide users on expected inputs
5. **Restrict tools** via `allowed-tools` for security
6. **Organize with subdirectories** for related command groups
7. **Include context** via bash execution for dynamic commands
8. **Test commands** before committing to version control
