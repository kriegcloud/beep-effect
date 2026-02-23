# Agent Sync

A universal synchronization tool for custom agents, permissions, and slash commands (saved prompts) between **Claude Code** and **GitHub Copilot**.

**Support for Codex and Gemini CLI coming soon!**

Manage your configuration in your preferred tool's native settings files, and automatically sync and convert those changes to all your other supported AI coding agents.

## Features

- **Bidirectional Sync:** Automatically syncs changes in both directions between Claude and Copilot configurations.
- **Permission Management:** Translates and syncs permission configurations (Claude `settings.json` ↔ Copilot `.perm.json`).
- **Slash Commands:** Syncs slash command definitions and prompt files.
- **Smart Conflict Resolution:** Detects conflicts and offers interactive or automatic resolution strategies.
- **State Tracking:** Intelligently tracks file modifications and deletions to keep directories clean.
- **Format Conversion:** Seamlessly converts between format-specific schemas (e.g., Markdown structure, YAML frontmatter).
- **Dry-Run Mode:** Preview changes safely before applying them to your file system.

## Installation

The recommended way to install Agent Sync is via pip:

```bash
pip install agent-sync
```

### Building from Source

If you prefer to build from source:

**Requirements:** Python 3.8+

```bash
# Clone the repository
git clone https://github.com/ZacheryGlass/agent-sync.git
cd agent-sync

# Install dependencies
pip install -r requirements.txt

# Run via module
python -m cli.main
```

## Usage

Agent Sync is a Command Line Interface (CLI) tool.

### CLI Mode

The general syntax for the CLI is:

```bash
agent-sync [options]
```

### CLI Options

The tool offers various flags to customize the synchronization process.

#### Core Configuration
- **`--source-dir`**: Specifies the directory containing your source configuration files.
- **`--target-dir`**: Specifies the directory where files should be synced to.
- **`--source-format`**: Defines the format of the source files (`claude` or `copilot`).
- **`--target-format`**: Defines the format for the destination files (`claude` or `copilot`).
- **`--config-type`**: Determines what type of data is being synced. Options are:
    - `agent`: For AI agent definitions.
    - `permission`: For tool use permissions and settings.
    - `slash-command`: For prompt and command definitions.
- **`--direction`**: Controls the synchronization flow.
    - `both`: Bidirectional sync (default).
    - `source-to-target`: One-way sync from source to target.
    - `target-to-source`: One-way sync from target to source.

#### Operation Control
- **`--dry-run`**: Simulates the operation and prints what would happen without modifying any files.
- **`--force`**: Automatically resolves conflicts by choosing the newest file, bypassing interactive prompts.
- **`--state-file`**: Path to a custom state file (defaults to `~/.agent_sync_state.json`). This file tracks sync history.
- **`--verbose`, `-v`**: Enables detailed logging output for debugging.

#### Single File Operations
- **`--convert-file`**: Path to a single file to convert. Mutually exclusive with directory options.
- **`--output`**: Destination path for the single converted file.
- **`--sync-file`** & **`--target-file`**: Used for in-place merging of two specific files.

#### Format-Specific Flags
- **`--add-argument-hint`**: Adds an `argument-hint` field (useful for Copilot) based on the description when converting from Claude.
- **`--add-handoffs`**: Adds a `handoffs` placeholder field when converting to Copilot format.

## Configuration Details

### File Matching Strategy
Files are matched between formats based on their base names:
- **Agents:** `planner.md` (Claude) ↔ `planner.agent.md` (Copilot)
- **Permissions:** `settings.json` (Claude) ↔ `settings.perm.json` (Copilot)
- **Slash Commands:** `command.md` (Claude) ↔ `command.prompt.md` (Copilot)

### Field Mapping

#### Claude → Copilot
| Claude Field | Copilot Field | Notes |
|--------------|---------------|-------|
| `name` | `name` | Direct mapping |
| `description` | `description` | Direct mapping |
| `description` | `argument-hint` | Optional (requires `--add-argument-hint`) |
| `tools` | `tools` | Converts comma-separated string to array |
| `model` | `model` | Maps model names (e.g., `sonnet` → `Claude Sonnet 4`) |
| `permissionMode` | - | Dropped (handled via Permission Sync) |

#### Copilot → Claude
| Copilot Field | Claude Field | Notes |
|---------------|--------------|-------|
| `name` | `name` | Direct mapping |
| `description` | `description` | Direct mapping |
| `tools` | `tools` | Converts array to comma-separated string |
| `model` | `model` | Maps model names (e.g., `Claude Sonnet 4` → `sonnet`) |
| `argument-hint` | - | Dropped |

### Permission Conversion

The tool handles complex logic to translate between Claude's permission system and VS Code's (Copilot) permission structure.

**VS Code (Copilot)** uses specific boolean flags for commands and URLs (e.g., `"chat.tools.terminal.autoApprove"`).
**Claude Code** uses categories (`allow`, `ask`, `deny`) with specific patterns.

- **Auto-Approve:** Maps between VS Code `true` and Claude `allow`.
- **Require Approval:** Maps between VS Code `false` and Claude `ask`.
- **Regex Patterns:** Preserved as-is during conversion.
- **Lossy Conversions:** Since VS Code does not support a hard "deny" (block) state, Claude `deny` rules are converted to "require approval" in VS Code, and a warning is logged.

## Contributing

Contributions are welcome! Please submit a Pull Request or open an issue to discuss proposed changes.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
