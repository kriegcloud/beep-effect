# Gemini CLI Format Research

Research findings for Google Gemini CLI configuration format and structure.

## Overview

Gemini CLI is Google's command-line interface for interacting with Gemini AI models. It uses a different architectural approach compared to Claude Code and GitHub Copilot, with unique features and configuration patterns.

## Directory Structure

### Configuration Locations

**Global Configuration:**
- `~/.gemini/commands/` - Global custom commands
- `~/.gemini/settings.json` - Global settings
- `~/.gemini/trustedFolders.json` - Trusted folder permissions

**Project Configuration:**
- `<project-root>/.gemini/commands/` - Project-specific custom commands
- `<project-root>/.gemini/settings.json` - Project-specific settings
- `<project-root>/.gemini/GEMINI.md` - Hierarchical context (similar to CLAUDE.md)
- `<project-root>/.geminiignore` - File exclusion patterns

**Hierarchy:**
- Project settings override global settings
- Project commands override global commands with identical names

## Config Type 1: Custom Commands (Slash Commands Equivalent)

### File Format
- **Format:** TOML (v1)
- **Extension:** `.toml`
- **Location:** `~/.gemini/commands/` or `<project-root>/.gemini/commands/`

### Naming Convention
Command names derive from file paths relative to the `commands` directory:
- Subdirectories create namespaced commands
- Path separator (`/` or `\`) converts to colon (`:`)
- Example: `commands/git/commit.toml` → `/git:commit`

### TOML Structure

**Required Fields:**
```toml
prompt = """
Your instruction text here.
Can be single or multi-line.
"""
```

**Optional Fields:**
```toml
description = "Brief one-line explanation for help menus"
```

### Supported Placeholders

1. **`{{args}}`** - Injects user-provided arguments
   - Raw injection in prompts
   - Shell-escaped inside `!{...}` blocks
   - If omitted, arguments are appended to prompt with two newlines

2. **`!{...}`** - Executes shell commands and embeds output
   - Requires user confirmation before execution
   - Uses bash (Linux/macOS) or PowerShell (Windows)
   - Example: `!{git status}`

3. **`@{...}`** - Embeds file content or directory listings
   - Supports images, PDFs, audio, and video
   - Processed before shell commands and argument substitution
   - Example: `@{README.md}`, `@{src/}`

### Example Custom Command

```toml
# File: ~/.gemini/commands/git/commit.toml
# Invoked as: /git:commit

description = "Create a git commit with AI-generated message"

prompt = """
Review the following git status and diff:

!{git status}
!{git diff --staged}

Create a conventional commit message for these changes.
{{args}}
"""
```

### Field Mapping to CanonicalSlashCommand

| Gemini Field | Canonical Field | Notes |
|--------------|----------------|-------|
| `prompt` | `instructions` | Direct mapping |
| `description` | `description` | Direct mapping |
| filename → command name | `name` | Derived from file path with `:` separator |
| N/A | `argument_hint` | Not supported in Gemini |
| N/A | `model` | Not supported per-command (use aliases in settings) |
| N/A | `allowed_tools` | Not supported per-command |

**Gemini-Specific Features (preserve in metadata):**
- `{{args}}` placeholder syntax
- `!{...}` shell command execution
- `@{...}` file embedding
- Namespace support via directory structure

## Config Type 2: Settings and Configuration

### File Format
- **Format:** JSON
- **Location:** `~/.gemini/settings.json` or `<project-root>/.gemini/settings.json`

### Structure

```json
{
  "customAliases": {
    "alias-name": {
      "model": "gemini-2.0-flash",
      "temperature": 0.7,
      "maxOutputTokens": 8192,
      "extends": "parent-alias-name"
    }
  },
  "overrides": [
    {
      "model": "gemini-2.0-flash",
      "overrideScope": "agent-name",
      "temperature": 0.5
    }
  ],
  "tools": {
    "sandbox": true,
    "other-tool-settings": {}
  },
  "folderTrust": {
    "enabled": true
  }
}
```

### Generation Settings

**Core Parameters:**
- `temperature` - Controls randomness (0.0 = deterministic, >0.7 = creative)
- `topP` - Nucleus sampling probability
- `maxOutputTokens` - Response length limit
- `thinkingConfig` - For reasoning-capable models:
  - `thinkingBudget` - Token allocation for reasoning
  - `includeThoughts` - Boolean to expose reasoning process

### Custom Aliases
Reusable named presets for model configurations:
- Support inheritance via `extends` property
- Allow configuration inheritance chains
- Enable parameter overrides

### Overrides
Conditional rules applying configurations based on runtime context:
- Match by model identifier
- Match by `overrideScope` (typically agent name)
- Sorted by specificity (more criteria = higher priority)

### Model Names

Gemini uses its own model naming convention:
- `gemini-2.0-flash` - Fast, efficient model
- `gemini-2.0-flash-thinking-exp` - Reasoning-capable
- `gemini-1.5-pro` - Previous generation
- `gemini-1.5-flash` - Previous generation fast model

**No direct mapping to Claude model tiers** (sonnet, opus, haiku) - would need custom conversion table.

## Config Type 3: Permissions (Trusted Folders)

### File Format
- **Format:** JSON
- **Location:** `~/.gemini/trustedFolders.json`

### Structure

```json
{
  "/path/to/trusted/project": {
    "trusted": true,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Trust System Behavior

**Enabled State:**
- Controlled by `folderTrust.enabled` in settings.json
- Disabled by default
- When enabled, prompts for folder approval

**Trust Options:**
1. Trust folder - Approves current directory
2. Trust parent folder - Approves parent + all subdirectories
3. Don't trust - Restricts to safe mode

**Safe Mode Restrictions (when untrusted):**
1. Workspace settings (`.gemini/settings.json`)
2. Environment variable loading (`.env` files)
3. Extension management
4. Tool auto-acceptance
5. Automatic memory file loading
6. MCP server connections
7. Custom command loading

### Permission Management
- Interactive: `/permissions` command
- Manual: Edit `~/.gemini/trustedFolders.json`

## Config Type 4: Sandbox Settings

### Configuration Methods (by priority)

1. **Command flag:** `-s` or `--sandbox`
2. **Environment variable:** `GEMINI_SANDBOX=true|docker|podman|sandbox-exec`
3. **Settings file:** `"sandbox": true` in tools object

### macOS Seatbelt Profiles

Set via `SEATBELT_PROFILE` environment variable:
- `permissive-open` (default) - Write restrictions, network allowed
- `permissive-closed` - Restricts writes and disables network
- `permissive-proxied` - Write restrictions, network via proxy only
- `restrictive-open` - Strict restrictions, network allowed
- `restrictive-closed` - Maximum restrictions

### Advanced Options
- `SANDBOX_FLAGS` - Custom Docker/Podman parameters
- `SANDBOX_SET_UID_GID` - User permission control (Linux)

## Additional Features

### Command Types (Interactive CLI)

**Slash commands (`/`):**
- Meta-level CLI control
- Session management, settings, tool discovery
- Built-in commands (not user-customizable)

**At commands (`@`):**
- File and directory content injection
- Git-aware filtering (excludes `.gitignore` patterns)
- Examples: `@README.md`, `@src/`

**Shell commands (`!):**
- Direct system shell interaction
- Bash (Linux/macOS) or PowerShell (Windows)
- Examples: `!git status`, `!ls -la`

### Context System

**GEMINI.md:**
- Hierarchical context files
- Similar to CLAUDE.md in Claude Code
- Provides project-specific instructions

**.geminiignore:**
- File exclusion patterns
- Similar to .gitignore syntax

### Session Management
- Session snapshots via checkpointing
- Chat save/resume functionality
- Project-specific chat storage

## Tool Representation

Gemini CLI uses a different approach to tools compared to Claude/Copilot:
- Tools are enabled/configured in settings.json under `tools` object
- No granular per-command tool restrictions like Claude's `allowed-tools`
- Security controlled via sandbox settings and trusted folders
- Shell commands available via `!{...}` placeholder in custom commands

## Conversion Challenges

### To Canonical Models

**CanonicalSlashCommand:**
- ✅ Straightforward mapping for basic fields
- ⚠️ No `argument-hint` support in Gemini
- ⚠️ No per-command `model` override
- ⚠️ No `allowed-tools` per command
- ⚠️ Different placeholder syntax (`{{args}}` vs `$ARGUMENTS` vs `${input}`)
- ⚠️ Gemini-specific features: `!{...}`, `@{...}`, namespace with `:`

**CanonicalAgent:**
- ❌ No direct equivalent in Gemini CLI
- 🤔 Could map to `customAliases` in settings.json
- 🤔 Aliases configure model behavior but aren't "agents" in Claude/Copilot sense
- See comparison document for detailed analysis

**CanonicalPermission:**
- ⚠️ Different permission model (trusted folders vs tool patterns)
- ⚠️ Gemini uses folder-level trust, not pattern-based allow/deny
- ⚠️ Sandbox settings provide security, not granular tool permissions
- ❌ Cannot map directly to Claude's tool permission patterns

### From Canonical Models

**To Gemini Custom Command:**
- ✅ Can convert basic slash command structure
- ⚠️ Need to translate placeholder syntax
- ⚠️ `argument-hint` would be lost (could preserve in comment)
- ⚠️ `model` override not supported (could document workaround with aliases)
- ⚠️ `allowed-tools` not supported (document limitation)

**To Gemini Settings:**
- 🤔 Could create custom alias for each CanonicalAgent
- ⚠️ Would lose agent-specific instructions (no instruction field in aliases)
- ⚠️ Permission patterns cannot convert to trusted folders

## Gemini-Specific Features to Preserve

When converting to/from Gemini format, preserve these in metadata:

1. **Custom Commands:**
   - `gemini_namespace` - Directory-based namespace (e.g., "git:commit")
   - `gemini_shell_placeholders` - List of `!{...}` blocks
   - `gemini_file_placeholders` - List of `@{...}` blocks

2. **Aliases:**
   - `gemini_extends` - Inheritance chain
   - `gemini_override_scope` - Override matching rules
   - `gemini_thinking_config` - Reasoning model settings

3. **Permissions:**
   - `gemini_trusted_parent` - Whether parent was trusted (affects subdirs)
   - `gemini_trust_timestamp` - When trust was granted

## Support Recommendations

### Fully Supported
**Custom Commands (Slash Commands):**
- Clear mapping to CanonicalSlashCommand
- TOML format is well-defined
- Can handle format-specific features via metadata

### Partially Supported / Needs Decision
**Agents (Custom Aliases):**
- Gemini aliases are configuration presets, not full agents
- No instruction/prompt field in aliases
- See `docs/gemini-vs-claude-copilot.md` for detailed comparison

### Not Supported
**Permissions:**
- Fundamentally different model (folder trust vs tool patterns)
- Cannot meaningfully convert between formats
- Recommend documenting incompatibility

## Sample Files Location

See `tests/fixtures/gemini/` for example files demonstrating:
- Custom commands with various placeholder types
- Settings with aliases and overrides
- Trusted folders configuration
