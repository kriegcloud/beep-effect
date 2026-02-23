# Gemini CLI vs Claude Code vs GitHub Copilot: Architecture Comparison

Comparative analysis to inform support decisions for Gemini CLI adapter implementation.

## Executive Summary

Gemini CLI uses a fundamentally different architecture from Claude Code and GitHub Copilot:
- **No direct "agent" concept** - Uses configuration aliases instead
- **Different permission model** - Folder-level trust instead of tool patterns
- **Slash commands equivalent exists** - Custom commands in TOML format
- **Strong overlap in slash commands** - Good candidate for sync support
- **Weak/no overlap in agents and permissions** - Requires architectural decisions

## Three-Way Feature Comparison

### 1. Agents / Custom Assistants

| Feature | Claude Code | GitHub Copilot | Gemini CLI |
|---------|-------------|----------------|------------|
| **File Format** | Markdown (.md) | Markdown (.agent.md) | JSON (settings.json aliases) |
| **Location** | `~/.claude/agents/` | `.github/agents/` | `~/.gemini/settings.json` |
| **Instructions** | Full markdown prompt | Full markdown prompt | ❌ Not supported |
| **Model Selection** | Model name string | Model name string | Model name string |
| **Tool Restrictions** | Comma-separated list | YAML list | ❌ Not per-agent |
| **Generation Settings** | Model-specific defaults | Model-specific defaults | Per-alias settings |
| **Metadata** | YAML frontmatter | YAML frontmatter | JSON object |
| **Inheritance** | None | None | ✅ Via `extends` |

**Key Difference:** Gemini aliases are **model configuration presets**, not instruction-based agents.

#### Claude Agent Example
```markdown
---
description: Senior code reviewer
model: claude-3-5-sonnet-20241022
tools: Read, Grep, Glob
---

You are a senior code reviewer. Analyze code for:
- Security vulnerabilities
- Performance issues
- Best practices violations

Provide actionable feedback.
```

#### Copilot Agent Example
```markdown
---
name: code-reviewer
description: Senior code reviewer
model: claude-3-5-sonnet-20241022
tools:
  - Read
  - Grep
  - Glob
---

You are a senior code reviewer. Analyze code for:
- Security vulnerabilities
- Performance issues
- Best practices violations

Provide actionable feedback.
```

#### Gemini Alias Example
```json
{
  "customAliases": {
    "code-reviewer": {
      "model": "gemini-2.0-flash",
      "temperature": 0.3,
      "maxOutputTokens": 8192,
      "topP": 0.95
    }
  }
}
```

**Analysis:**
- Gemini alias has **no instructions field**
- Cannot store agent personality or behavior
- Only configures model parameters
- Not equivalent to Claude/Copilot agents

### 2. Slash Commands / Custom Commands

| Feature | Claude Code | GitHub Copilot | Gemini CLI |
|---------|-------------|----------------|------------|
| **File Format** | Markdown (.md) | Markdown (.prompt.md) | TOML (.toml) |
| **Location** | `~/.claude/commands/` | `.github/prompts/` | `~/.gemini/commands/` |
| **Instructions** | Markdown body | Markdown body | `prompt` field |
| **Description** | Optional | Optional | Optional |
| **Arguments** | `$ARGUMENTS` | `${input:name}` | `{{args}}` |
| **File Embedding** | `!backtick` commands | `#tool:Read` | `@{path}` |
| **Shell Execution** | `!backtick` commands | `#tool:Bash` | `!{command}` |
| **Model Override** | `model` field | `model` field | ❌ Not supported |
| **Tool Restrictions** | `allowed-tools` | `tools` list | ❌ Not supported |
| **Namespacing** | None | None | ✅ Via directories |

**Similarity:** ✅ Strong overlap - all three support custom reusable prompts

#### Variable Syntax Comparison

| Purpose | Claude | Copilot | Gemini |
|---------|--------|---------|--------|
| User arguments | `$ARGUMENTS` | `${input:name:prompt}` | `{{args}}` |
| Current selection | N/A | `${selection}` | N/A |
| Current file | `!cat $FILE` | `${file}` | `@{$FILE}` |
| Shell command | `!git status` | `#tool:Bash(git status)` | `!{git status}` |
| File content | `!cat path` | `#tool:Read(path)` | `@{path}` |

**Analysis:**
- All three support custom commands
- Different syntax but same concepts
- Conversion requires syntax translation
- Good candidate for sync support

### 3. Permissions / Tool Access Control

| Feature | Claude Code | GitHub Copilot | Gemini CLI |
|---------|-------------|----------------|------------|
| **File Format** | JSON (settings.json) | JSON (settings.perm.json) | JSON (trustedFolders.json) |
| **Scope** | Tool patterns | Tool patterns | Folder paths |
| **Allow List** | ✅ Tool patterns | ✅ Tool patterns | ✅ Folder paths |
| **Deny List** | ✅ Tool patterns | ✅ Tool patterns | ❌ Not applicable |
| **Ask List** | ✅ Tool patterns | ✅ Tool patterns | ❌ Safe mode instead |
| **Granularity** | Per-tool pattern | Per-tool pattern | Per-folder |
| **Sandboxing** | Via tool patterns | Via tool patterns | Separate sandbox system |

**Key Difference:** Gemini uses **folder-level trust** instead of **tool-pattern permissions**.

#### Claude Permission Example
```json
{
  "allowedTools": [
    "Bash(git status:*)",
    "Bash(git diff:*)",
    "Read(//project/**)"
  ],
  "deniedTools": [
    "Bash(rm:*)"
  ]
}
```

#### Gemini Trust Example
```json
{
  "/Users/user/projects/trusted-project": {
    "trusted": true,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Analysis:**
- Fundamentally different permission models
- Cannot meaningfully convert between formats
- Gemini's model is simpler but less granular
- Not a good candidate for sync support

## Architectural Philosophy Differences

### Claude Code / GitHub Copilot Approach
**Granular, per-agent control:**
- Each agent is self-contained with instructions
- Fine-grained tool permissions per pattern
- Agents are portable configuration files
- Configuration distributed across multiple files

**Philosophy:** "Define specialized AI assistants with specific capabilities"

### Gemini CLI Approach
**Centralized, configuration-driven:**
- Model behavior configured via aliases
- Instructions provided at runtime via custom commands
- Folder-level security boundaries
- Configuration centralized in settings.json

**Philosophy:** "Configure model parameters, provide instructions dynamically"

## Use Case Comparison

### Creating a Code Review Assistant

**Claude/Copilot:**
1. Create agent file with review instructions
2. Configure allowed tools (Read, Grep, Glob)
3. Set model (e.g., claude-3-5-sonnet)
4. Agent ready to use with `/task` or direct invocation

**Gemini:**
1. Create custom command `/review` with review instructions
2. Optionally create alias with preferred temperature/model
3. Enable folder trust for the project
4. Run `/review` to execute

**Analysis:** Gemini requires instructions to be in custom commands, not reusable across different contexts like agents.

## Adapter Implementation Recommendations

### Option 1: Custom Commands Only (Recommended)
**Implement:** Gemini custom commands ↔ Canonical slash commands
- ✅ Strong feature overlap
- ✅ Clear conversion path
- ✅ Preserves core functionality
- ⚠️ Syntax translation needed for placeholders

**Skip:** Agent and permission sync
- ❌ Weak/no overlap
- ❌ Architectural mismatch
- ❌ Poor user experience (confusing conversions)

### Option 2: Alias-to-Agent Mapping (Not Recommended)
**Implement:** Gemini aliases ↔ Canonical agents
- ❌ Aliases have no instructions
- ❌ Would create empty/useless agents
- ❌ Misleading user expectations
- ❌ Round-trip conversion loses data

**Why not recommended:**
Converting a Claude agent to Gemini alias would:
1. Strip all instructions (core value)
2. Only preserve model config (minimal value)
3. User expects agent behavior, gets only model settings
4. Confusing and error-prone

### Option 3: Hybrid Approach (Complex)
**Implement:** Aliases + Custom Commands = Pseudo-Agents
- Create Gemini alias for model config
- Create Gemini custom command with agent instructions
- Link them via naming convention

**Challenges:**
- ❌ No native linking mechanism
- ❌ Two-file solution for one concept
- ❌ Fragile naming conventions
- ❌ Doesn't match Gemini's design philosophy

### Option 4: Documentation-Only
**Document incompatibility:**
- Clearly state Gemini doesn't support agents
- Explain architectural differences
- Provide manual migration guide
- Focus adapter on custom commands only

**Benefits:**
- ✅ Honest about capabilities
- ✅ Sets correct expectations
- ✅ Focuses effort on valuable features
- ✅ Avoids confusing half-solutions

## Detailed Feature Matrix

### Custom Commands / Slash Commands

| Capability | Support Level | Notes |
|------------|--------------|-------|
| Basic prompt | ✅ Full | Direct mapping |
| Description | ✅ Full | Direct mapping |
| User arguments | ⚠️ Syntax translation | `{{args}}` vs `$ARGUMENTS` vs `${input}` |
| File embedding | ⚠️ Syntax translation | `@{path}` vs `!cat` vs `#tool:Read` |
| Shell execution | ⚠️ Syntax translation | `!{cmd}` vs `!cmd` vs `#tool:Bash` |
| Model override | ❌ Workaround | Create alias, document limitation |
| Tool restrictions | ❌ Not supported | Document limitation |
| Namespacing | ✅ Preserve | Use metadata to track Gemini namespaces |

**Recommendation:** Implement with syntax translation and metadata preservation.

### Agents

| Capability | Support Level | Notes |
|------------|--------------|-------|
| Instructions | ❌ Not supported | Aliases have no instruction field |
| Model config | ✅ Full | Direct mapping to alias |
| Tool restrictions | ❌ Not supported | No per-alias tool control |
| Metadata | ⚠️ Partial | Can preserve in alias object |
| Inheritance | ✅ Gemini-only | `extends` feature unique to Gemini |

**Recommendation:** Mark as unsupported OR implement hybrid approach (document decision rationale).

### Permissions

| Capability | Support Level | Notes |
|------------|--------------|-------|
| Allow patterns | ❌ Incompatible | Folder trust vs tool patterns |
| Deny patterns | ❌ Incompatible | No deny concept in Gemini |
| Ask patterns | ❌ Incompatible | Safe mode is binary on/off |
| Folder trust | ✅ Gemini-only | Unique to Gemini |

**Recommendation:** Mark as unsupported, document incompatibility.

## Conversion Examples

### Slash Command: Claude → Gemini

**Input (Claude):**
```markdown
---
description: Create a git commit
allowed-tools: Bash(git add:*), Bash(git status:*)
model: claude-3-5-haiku-20241022
---

Create a git commit: $ARGUMENTS

Review git status:
!git status

Review staged changes:
!git diff --staged

Follow conventional commit format.
```

**Output (Gemini):**
```toml
description = "Create a git commit"

prompt = """
Create a git commit: {{args}}

Review git status:
!{git status}

Review staged changes:
!{git diff --staged}

Follow conventional commit format.
"""

# METADATA (preserved for round-trip):
# claude_model: claude-3-5-haiku-20241022
# claude_allowed_tools: ["Bash(git add:*)", "Bash(git status:*)"]
```

**Loss/Limitations:**
- `model` field → Lost (document alias workaround)
- `allowed-tools` → Lost (document as limitation)
- Syntax translation: `$ARGUMENTS` → `{{args}}`, `!cmd` → `!{cmd}`

### Agent: Claude → Gemini (If Implemented)

**Input (Claude):**
```markdown
---
description: Senior code reviewer
model: claude-3-5-sonnet-20241022
tools: Read, Grep, Glob
---

You are a senior code reviewer. Analyze code for security issues.
```

**Output Option 1 (Alias Only - Poor):**
```json
{
  "customAliases": {
    "code-reviewer": {
      "model": "gemini-2.0-flash",
      "temperature": 0.7
    }
  }
}
```
❌ **Problem:** Lost all instructions! Alias is nearly useless.

**Output Option 2 (Hybrid - Complex):**
```toml
# File: ~/.gemini/commands/agents/code-reviewer.toml
description = "Senior code reviewer"

prompt = """
You are a senior code reviewer. Analyze code for security issues.

{{args}}
"""
```
```json
{
  "customAliases": {
    "code-reviewer": {
      "model": "gemini-2.0-flash",
      "temperature": 0.7
    }
  }
}
```
⚠️ **Problem:** Two-file solution, no native linking, confusing UX.

**Output Option 3 (Documentation - Recommended):**
```
ERROR: Agents not supported in Gemini CLI.

Gemini uses custom commands for reusable prompts and aliases for model configuration.

To migrate manually:
1. Create custom command: ~/.gemini/commands/code-reviewer.toml
2. Optionally create alias in settings.json for model config
3. See docs/gemini-format.md for details
```

## Decision Framework

When deciding whether to support a config type for Gemini:

### Questions to Ask:
1. **Does Gemini have an equivalent feature?**
   - Custom commands: ✅ Yes (TOML commands)
   - Agents: ❌ No (aliases are not equivalent)
   - Permissions: ❌ No (folder trust is different)

2. **Can we convert without major data loss?**
   - Custom commands: ✅ Yes (syntax translation needed)
   - Agents: ❌ No (instructions lost)
   - Permissions: ❌ No (granularity lost)

3. **Will the converted output be useful?**
   - Custom commands: ✅ Yes (functional prompts)
   - Agents: ❌ No (config without instructions)
   - Permissions: ❌ No (incompatible models)

4. **Can users understand what happened?**
   - Custom commands: ✅ Yes (clear syntax differences)
   - Agents: ❌ No (confusing why instructions vanished)
   - Permissions: ❌ No (completely different concepts)

### Recommendation Matrix:

| Config Type | Implement? | Rationale |
|-------------|-----------|-----------|
| **Custom Commands** | ✅ **Yes** | Strong overlap, clear conversion path, valuable feature |
| **Agents** | ❌ **No** | Architectural mismatch, major data loss, confusing UX |
| **Permissions** | ❌ **No** | Incompatible models, cannot meaningfully convert |

## Implementation Priorities

If implementing Gemini adapter:

### Phase 1: Custom Commands (High Value)
1. Implement `GeminiSlashCommandHandler`
2. Support TOML parsing and generation
3. Implement syntax translation:
   - `{{args}}` ↔ `$ARGUMENTS` ↔ `${input}`
   - `!{cmd}` ↔ `!cmd` ↔ `#tool:Bash`
   - `@{path}` ↔ `!cat` ↔ `#tool:Read`
4. Preserve namespace in metadata
5. Document model/tool limitations

### Phase 2: Agents (Decision Required)
**Option A (Recommended):** Mark as unsupported
- Document why in README and adapter
- Provide manual migration guide
- Focus on custom commands instead

**Option B:** Implement hybrid approach
- Create custom command with instructions
- Create alias with model config
- Document two-file limitation
- Add tooling to link them

**Option C:** Wait for Gemini feature updates
- Monitor Gemini CLI development
- Implement when/if agent-like feature added

### Phase 3: Permissions (Low Priority)
- Mark as unsupported
- Document architectural differences
- No implementation planned

## Conclusion

**Recommended approach for Gemini adapter:**
1. **Implement:** Custom commands ↔ Slash commands sync
2. **Skip:** Agent sync (document incompatibility)
3. **Skip:** Permission sync (document incompatibility)
4. **Focus:** High-quality custom command conversion with clear documentation

**Rationale:**
- Gemini's architecture is fundamentally different
- Forcing agent conversion creates poor UX
- Custom commands provide real value
- Honest documentation better than confusing half-solutions

**User value:**
- Users can sync their custom slash commands across tools
- Clear understanding of what's supported vs not
- No confusing behavior or data loss
- Focus on features that actually work well
