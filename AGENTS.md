This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Principles
- Never use emojis.
- Never add Claude as a commit author.
- Always commit using the default git settings.
- Never create .md files unless explicitly instructed.

## Project Overview

This is a universal synchronization tool for AI coding agent configurations. It supports syncing between multiple AI tools (Claude Code, GitHub Copilot, Gemini CLI, and others) and multiple config types (agents, permissions, slash commands).

**Note:** Gemini CLI support is limited to custom commands (slash command equivalent only). Agents and permissions are not supported due to architectural differences. See `docs/gemini-vs-claude-copilot.md` for detailed comparison.

The project uses a hub-and-spoke architecture with canonical data models, enabling N-way sync with 2N converters instead of N² converters.

## Commands

### Installation
```bash
pip install -r requirements.txt
```

### CLI
```bash
# Universal sync between any formats (auto-detects all config types)
python -m cli.main \
  --source-dir ~/.claude \
  --target-dir .github \
  --source-format claude \
  --target-format copilot \
  --dry-run

# Sync only agents (skip permissions and commands)
python -m cli.main \
  --source-dir ~/.claude/agents \
  --target-dir .github/agents \
  --source-format claude \
  --target-format copilot \
  --only agents \
  --dry-run

# Single-file conversion
python -m cli.main \
  --convert-file ~/.claude/agents/planner.md \
  --target-format copilot \
  --output .github/agents/planner.agent.md

# Auto-detect formats and auto-generate output filename
python -m cli.main \
  --convert-file my-agent.md \
  --target-format copilot

# Sync only slash commands
python -m cli.main \
  --source-dir ~/.claude/commands \
  --target-dir .github/prompts \
  --source-format claude \
  --target-format copilot \
  --only commands \
  --dry-run

# Real bidirectional sync of live settings files (in-place merge)
# Merges changes from source into target without replacing entire file
python -m cli.main \
  --sync-file ~/.claude/settings.json \
  --target-file "C:/Users/user/AppData/Roaming/Code/User/settings.json" \
  --source-format claude \
  --target-format copilot \
  --only permissions \
  --dry-run

# Bidirectional in-place sync (syncs changes both ways)
python -m cli.main \
  --sync-file ~/.claude/settings.json \
  --target-file "C:/Users/user/AppData/Roaming/Code/User/settings.json" \
  --source-format claude \
  --target-format copilot \
  --only permissions \
  --bidirectional

# Sync custom commands with Gemini CLI
python -m cli.main \
  --source-dir ~/.gemini/commands \
  --target-dir ~/.claude/commands \
  --source-format gemini \
  --target-format claude \
  --only commands \
  --dry-run

# Convert single Gemini command to Copilot format
python -m cli.main \
  --convert-file ~/.gemini/commands/git/commit.toml \
  --target-format copilot \
  --output .github/prompts/git-commit.prompt.md
```

### Testing
```bash
# Run all tests
pytest tests/

# Run specific test module
pytest tests/test_adapters.py -v

# Run tests matching pattern
pytest tests/ -k "test_claude"
```

#### Testing Philosophy: Integration-Style Tests
This project uses integration-style testing rather than heavily mocked unit tests:

- **Real objects over mocks**: Tests use actual adapter implementations (ClaudeAdapter, CopilotAdapter) rather than mocking them
- **Real file I/O**: Tests use pytest's `tmp_path` fixture for actual file operations
- **Minimal mocking**: Only mock external dependencies like user input (`input()`) when necessary
- **Full pipeline verification**: Tests verify the complete conversion flow (file -> adapter -> canonical -> adapter -> file)

This approach catches real integration issues like format parsing errors, file extension handling, and encoding problems that mocked tests would miss.

## Architecture

### Hub-and-Spoke with Canonical Models

The architecture supports N formats with 2N converters instead of N²:

```
Format A → Canonical Model ← Format B
                ↓
            Format C
```

**Core Modules:**

1. **core/canonical_models.py**
   - `CanonicalAgent`: Universal agent representation
   - `CanonicalPermission`: Universal permission representation
   - `CanonicalSlashCommand`: Universal slash command representation
   - Metadata dictionary preserves format-specific fields for round-trip fidelity

2. **core/adapter_interface.py**
   - `FormatAdapter`: Abstract base class for all format converters
   - Defines contract: `to_canonical()` and `from_canonical()`
   - Each format implements this interface once

3. **core/registry.py**
   - `FormatRegistry`: Central directory of available adapters
   - Auto-detects format from file paths
   - Validates format support for config types

4. **core/orchestrator.py**
   - `UniversalSyncOrchestrator`: Coordinates sync operations
   - Works with any source/target format pair
   - Handles conflicts, state tracking, dry-run mode

5. **core/state_manager.py**
   - `SyncStateManager`: Tracks sync history in `~/.agent_sync_state.json`
   - Enables intelligent change detection
   - Prevents unnecessary syncs

**Format Adapters:**

6. **adapters/shared/** - Shared utilities and handler interface
7. **adapters/claude/** - Claude Code adapter with agent and permission handlers
8. **adapters/copilot/** - GitHub Copilot adapter with agent and permission handlers
9. **adapters/gemini/** - Gemini CLI adapter (slash commands only)
10. **adapters/example/** - Template for new adapter implementations

### Key Design Decisions

- **Canonical Model**: All formats convert to/from universal representation
- **Information Preservation**: Metadata dict stores format-specific fields
- **Scalability**: Adding format N+1 requires only 2 converters, not 2N
- **File matching**: Agents matched by base name (e.g., `planner.md` ↔ `planner.agent.md`)
- **Conflict resolution**: Without `--force`, prompts user; with `--force`, uses newest file
- **State tracking**: Stored in `~/.agent_sync_state.json` to work across projects
- **Layered Validation**: CLI validates paths exist and are accessible (fail fast at user boundary); Orchestrator validates format/config type compatibility (business logic)

### Conversion Flow

```
Source Format → Adapter.read() → to_canonical() → CanonicalAgent
    ↓
CanonicalAgent → from_canonical() → Adapter.write() → Target Format
```

Each adapter handles:
- Parsing format-specific structure
- Normalizing field names and types
- Model name mapping
- Tool format conversion
- Preserving unique fields in metadata

## Config Type Details

### Agents
Custom AI assistants with specialized instructions, tool access, and model preferences.

**File patterns:**
- Claude: `agent-name.md` (in `~/.claude/agents/`)
- Copilot: `agent-name.agent.md` (in `.github/agents/`)

### Permissions
Tool and URL access control configurations.

**File patterns:**
- Claude: `settings.json` (in `~/.claude/`)
- Copilot: `settings.perm.json` (in `.github/`)

**Lossy Conversions and Strict Mode:**

When syncing permissions from Claude to VS Code (Copilot), some conversions are lossy because VS Code doesn't support all permission categories:

- **Claude `deny` rules** → **VS Code `false` (require approval)**
  - Claude can block commands entirely with `deny`
  - VS Code only supports `true` (auto-approve) or `false` (require approval)
  - Deny rules are downgraded to "require approval" with a warning

**Using --strict flag:**
```bash
# Error on lossy conversions for security-critical scenarios
python -m cli.main \
  --source-dir ~/.claude \
  --target-dir .github \
  --source-format claude \
  --target-format copilot \
  --only permissions \
  --strict

# Strict mode with bidirectional in-place sync
# Checks both directions before any writes
python -m cli.main \
  --sync-file ~/.claude/settings.json \
  --target-file "C:/Users/user/AppData/Roaming/Code/User/settings.json" \
  --source-format claude \
  --target-format copilot \
  --only permissions \
  --bidirectional \
  --strict
```

When `--strict` is enabled:
- **With `--sync-file` (in-place sync):**
  - Lossy conversions trigger an error (exit code 1) **before any files are modified**
  - In bidirectional mode, both directions are checked for warnings before any writes occur
  - If either direction produces warnings, the entire operation fails and no files are modified
- **With directory sync (`--source-dir` / `--target-dir`):**
  - Lossy conversions still trigger an error (exit code 1), but validation happens after files are written
  - If warnings or lossy conversions are detected, remaining writes are aborted, but previously written files are not rolled back
- In all cases, warnings are displayed showing which rules were affected
- Useful for ensuring no security rules are silently downgraded
- Recommended for production permission sync workflows

Without `--strict`:
- Lossy conversions generate warnings but sync succeeds
- Files are written despite warnings
- Warnings are logged to stderr for visibility
- Appropriate for development and testing scenarios

### Slash Commands
Reusable prompt templates invoked via special syntax. Slash commands allow users to define custom workflows with variable substitution and tool restrictions.

**File patterns:**
- Claude: `command-name.md` (in `~/.claude/commands/`)
- Copilot: `command-name.prompt.md` (in `.github/prompts/`)
- Gemini: `command-name.toml` (in `~/.gemini/commands/`)

**Field Mapping:**

| Field | Claude | Copilot | Gemini | Conversion Notes |
|-------|--------|---------|--------|------------------|
| `name` | Optional (from filename) | Required in frontmatter | From file path (namespaced) | Auto-derived from filename; Gemini uses `:` separator |
| `description` | Optional | Optional | Optional | Direct mapping |
| `instructions` | Markdown body | Markdown body | `prompt` field | Direct mapping |
| `argument-hint` | Optional | Optional | Not supported | Lost when converting to Gemini |
| `model` | Optional | Optional | Not supported per-command | Lost when converting to Gemini (use aliases) |
| `allowed-tools` | Comma-separated string | YAML list | Not supported per-command | Lost when converting to Gemini |
| `disable-model-invocation` | Claude-specific | - | - | Preserved in metadata |
| `agent` | - | Copilot-specific | - | Preserved in metadata |

**Variable Syntax Differences:**

Claude, Copilot, and Gemini use different variable syntaxes (not automatically converted):
- Claude: `$ARGUMENTS`, `!backtick commands` (e.g., `!git status`)
- Copilot: `${selection}`, `${file}`, `${input:name:prompt}`, `#tool:name`
- Gemini: `{{args}}`, `!{command}` (e.g., `!{git status}`), `@{file}` (e.g., `@{README.md}`)

**Conversion Examples:**

*Claude slash command:*
```markdown
---
description: Create a git commit
allowed-tools: Bash(git add:*), Bash(git status:*)
argument-hint: [message]
model: claude-3-5-haiku-20241022
---

Create a git commit: $ARGUMENTS

Follow conventional commit format.
```

*Converts to Copilot:*
```markdown
---
name: commit
description: Create a git commit
tools:
  - Bash(git add:*)
  - Bash(git status:*)
argument-hint: [message]
model: claude-3-5-haiku-20241022
---

Create a git commit: $ARGUMENTS

Follow conventional commit format.
```

**Metadata Preservation:**
- `claude_disable_model_invocation`: Preserved for round-trip Claude → Copilot → Claude
- `copilot_agent`: Preserved for round-trip Copilot → Claude → Copilot

*Converts to Gemini:*
```toml
# File: ~/.gemini/commands/commit.toml
# Invoked as: /commit

description = "Create a git commit"

prompt = """
Create a git commit: {{args}}

Follow conventional commit format.
"""
```

**Gemini Namespace Example:**

*Gemini custom command with namespace:*
```toml
# File: ~/.gemini/commands/git/review.toml
# Invoked as: /git:review

description = "Review git changes before commit"

prompt = """
Review the following changes:

!{git status}
!{git diff --staged}

Provide a code review and suggest improvements.
{{args}}
"""
```

*Converts to Claude:*
```markdown
---
description: Review git changes before commit
---

Review the following changes:

!git status
!git diff --staged

Provide a code review and suggest improvements.
$ARGUMENTS
```

**Conversion Limitations:**
- Variable syntax not automatically converted (must manually adjust `$ARGUMENTS` vs `${selection}` vs `{{args}}`)
- File reference syntax differs (`!backtick` vs `#tool:` vs `@{file}`)
- Gemini shell syntax `!{...}` vs Claude `!backtick` requires manual conversion
- No model name mapping (passed through as-is)
- Gemini's per-command model/tool restrictions not supported (lost in conversion)
- Gemini namespace (e.g., `git:review`) preserved in metadata but affects file naming
- Format-specific features preserved in metadata but not actively used

## In-Place Sync Mode (Bidirectional)

Real bidirectional synchronization of live settings files with intelligent merging. Instead of converting and creating new files, this mode **merges changes directly into existing files** while preserving entries that aren't being synced.

### Use Case
Keep your configuration files synchronized across multiple AI tools:
- You have 9 approved terminal commands in Claude
- You have the same 9 approved commands in VS Code
- You add a 10th command to Claude
- Running in-place sync automatically adds the 10th command to VS Code without replacing the entire file

### Merge Behavior

**Permissions (Allow/Deny/Ask):**
- Adds new rules from source to target without duplicates
- Preserves all existing target rules
- Merges across all three permission categories (allow, deny, ask)
- Example: If source has `["git status"]` and target has `["bash"]`, merged result is `["bash", "git status"]`

**Agents:**
- Updates agent content from source
- Preserves target-only metadata
- Ensures format-specific fields are maintained through round-trip conversion

**Slash Commands:**
- Updates command content from source
- Preserves target-only metadata
- Maintains format-specific fields

### How It Works

1. **Parse both files** to canonical representation
2. **Merge intelligently** based on config type:
   - Permissions: Add new rules, avoid duplicates
   - Agents/Commands: Update content, preserve metadata
3. **Convert merged result** back to target format
4. **Write target file** with merged content
5. **Optional: Bidirectional sync** reverses process (target → source)

### Limitations

- **Same file types only**: Syncing different config types requires separate operations
- **Conflict handling**: If both source and target have been modified since last sync, last write wins
- **No state tracking** for in-place sync (unlike directory sync which tracks via state manager)
- **Format-specific syntax** not converted (e.g., permission rule patterns must be compatible)

### Examples

**Basic one-way sync (dry-run preview):**
```bash
python -m cli.main \
  --sync-file ~/.claude/settings.json \
  --target-file "C:/Users/user/AppData/Roaming/Code/User/settings.json" \
  --source-format claude \
  --target-format copilot \
  --only permissions \
  --dry-run
```

**Execute sync (write to target):**
```bash
python -m cli.main \
  --sync-file ~/.claude/settings.json \
  --target-file "C:/Users/user/AppData/Roaming/Code/User/settings.json" \
  --source-format claude \
  --target-format copilot \
  --only permissions
```

**Bidirectional sync (merge both ways):**
```bash
python -m cli.main \
  --sync-file ~/.claude/settings.json \
  --target-file "C:/Users/user/AppData/Roaming/Code/User/settings.json" \
  --source-format claude \
  --target-format copilot \
  --only permissions \
  --bidirectional
```

**Sync agents (in-place):**
```bash
python -m cli.main \
  --sync-file ~/.claude/agents/planner.md \
  --target-file ~/.vscode/agents/planner.agent.md \
  --source-format claude \
  --target-format copilot \
  --only agents
```

## Dependencies

- Python 3.x
- PyYAML: For parsing YAML frontmatter in agent files
- requests: For HTTP fetching in documentation sync
- beautifulsoup4: For HTML parsing
- html2text: For HTML to markdown conversion

## File Locations

### Project Structure
```
agent-sync/
├── core/                      # Core architecture modules
│   ├── canonical_models.py    # Universal data models
│   ├── adapter_interface.py   # Adapter contract
│   ├── registry.py            # Format registry
│   ├── orchestrator.py        # Sync orchestrator
│   └── state_manager.py       # State tracking
├── adapters/                  # Format adapters
│   ├── shared/               # Shared utilities and handler interface
│   ├── claude/               # Claude Code adapter (coordinator + handlers)
│   ├── copilot/              # GitHub Copilot adapter (coordinator + handlers)
│   └── example/              # Template for new adapters
├── cli/                       # Command-line interface
│   └── main.py               # CLI entry point
├── scripts/                   # Utility scripts
│   └── sync_docs.py          # Documentation sync script
├── docs/                      # Documentation
│   └── permissions/          # Permission research docs
├── tests/                     # Test suite
│   ├── test_adapters.py      # Adapter tests
│   ├── test_registry.py      # Registry tests
│   ├── test_orchestrator.py  # Orchestrator tests
│   ├── test_state_manager.py # State manager tests
│   ├── test_cli.py           # CLI tests
│   ├── test_sync_docs.py     # Documentation sync tests
│   └── fixtures/             # Sample files
├── requirements.txt
└── CLAUDE.md
```

### Configuration Locations
- User sync state: `~/.agent_sync_state.json` (auto-created)
- Claude agents: `~/.claude/agents/` or `.claude/agents/`
- Claude slash commands: `~/.claude/commands/` or `.claude/commands/`
- Copilot agents: `.github/agents/`
- Copilot prompts: `.github/prompts/`
- Gemini custom commands: `~/.gemini/commands/` or `<project>/.gemini/commands/`

## Development Status

**Functional:**
- Core canonical models (agents, permissions, slash commands)
- Claude and Copilot adapters (agents, permissions, slash commands)
- Gemini adapter (slash commands only)
- Format registry
- State manager
- CLI interface (directory sync and single-file conversion)
- Universal orchestrator
- Bidirectional permission conversion (Copilot ↔ Claude)
- Bidirectional slash-command conversion (Copilot ↔ Claude ↔ Gemini)

**In Development:**
- Additional format adapters

## Adding New Format Support

1. Copy template directory:
   ```bash
   cp -r adapters/example adapters/newformat
   ```

2. Implement adapter coordinator in `adapters/newformat/adapter.py`:
   - Rename `ExampleAdapter` to `NewFormatAdapter`
   - Update `format_name`, `file_extension`, `can_handle()`
   - Register handlers for each config type in `__init__()`

3. Implement handlers in `adapters/newformat/handlers/`:
   - `agent_handler.py`: Implement `to_canonical()` and `from_canonical()` for agents
   - `permission_handler.py`: Implement permission conversion logic
   - `slash_command_handler.py`: Implement slash command conversion logic
   - Use shared utilities from `adapters/shared/` where applicable

4. Register in application:
   ```python
   from adapters import NewFormatAdapter
   registry.register(NewFormatAdapter())
   ```

5. Add tests in `tests/test_adapters.py`
6. Add fixtures in `tests/fixtures/newformat/`

See `adapters/example/` for a complete template with detailed TODOs and examples.

### Lessons Learned from Gemini Implementation

**Partial Format Support Pattern:**
- Not all formats support all config types (agents, permissions, slash commands)
- Gemini only supports slash commands due to architectural differences
- Document limitations clearly in project overview and adapter implementation
- Use `supported_config_types` in adapter to enforce restrictions at runtime

**TOML Parsing Requirements:**
- Add `tomli` (Python < 3.11) and `tomli-w` (all versions) dependencies
- Include in both `requirements.txt` and `pyproject.toml` for consistency
- Use conditional imports to handle Python 3.11+ built-in `tomllib`

**Metadata Preservation for Format-Specific Features:**
- Preserve unique syntax in metadata dict (e.g., `gemini_namespace`, shell placeholders)
- Enable round-trip fidelity even when features don't map 1:1
- Document what's preserved vs what's lost in conversion

**Cross-Format Syntax Translation:**
- Variable syntax differs across formats (`$ARGUMENTS` vs `${input}` vs `{{args}}`)
- Shell command syntax varies (`!backtick` vs `#tool:Bash` vs `!{command}`)
- Document that manual adjustment may be needed post-conversion
- Consider adding syntax translation helpers for common patterns

**Namespace and File Structure Differences:**
- Gemini uses directory structure for namespacing (e.g., `git/commit.toml` → `/git:commit`)
- Other formats use flat file structure
- Preserve namespace info in metadata for round-trip conversion
- Handle file naming edge cases (subdirectories, special characters)

**Testing Philosophy:**
- Write comprehensive integration tests for each format pair (N² tests for N formats)
- Test round-trip conversion to verify metadata preservation
- Include edge cases (empty fields, special characters, format-specific features)
- Verify CLI integration for all supported operations

**Documentation Requirements:**
- Create detailed format research document (see `docs/gemini-format.md`)
- Add comparison document when architectures differ significantly (see `docs/gemini-vs-claude-copilot.md`)
- Update main documentation (AGENTS.md) with practical examples
- Clearly state what's supported vs not supported

- Keep all documentation very concise. Only what the engineers need to know.
- All documentation is for the application developers. Not for the users!
