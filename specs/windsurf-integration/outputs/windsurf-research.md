# Windsurf IDE Configuration System Research Report

**Date**: 2026-01-14
**Author**: Web Researcher Agent
**Purpose**: Comprehensive analysis of Windsurf IDE configuration for integration planning

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Rules Directory System](#rules-directory-system)
3. [Global Rules Configuration](#global-rules-configuration)
4. [AGENTS.md Files](#agentsmd-files)
5. [Rule Syntax and Format](#rule-syntax-and-format)
6. [Multi-Workspace and Monorepo Support](#multi-workspace-and-monorepo-support)
7. [Ignore Files](#ignore-files)
8. [Symlink Compatibility](#symlink-compatibility)
9. [Enterprise Configuration](#enterprise-configuration)
10. [Comparison with Claude Code](#comparison-with-claude-code)
11. [Key Findings for Integration](#key-findings-for-integration)

---

## Executive Summary

Windsurf is an AI-native code editor developed by Codeium, built as a VS Code fork with integrated AI capabilities called "Cascade". The configuration system supports multiple levels of rules (global, workspace, system) with four activation modes and automatic discovery mechanisms.

**Key Takeaways:**
- Rules are markdown files stored in `.windsurf/rules/` directories
- Character limits: **12,000 per file** (official docs), **6,000 legacy limit**, **12,000 total combined** (global + workspace)
- Four activation modes: Manual, Always On, Model Decision, Glob
- Automatic discovery traverses parent directories to git root
- Legacy `.windsurfrules` format is deprecated in favor of `.windsurf/rules/`
- No explicit documentation on symlink support found
- ⚠️ **YAML frontmatter structure is community convention, not officially documented**

---

## Rules Directory System

### Directory Structure

Rules are stored as markdown files in the `.windsurf/rules/` directory at the repository root.

**Current Structure (Wave 8+):**
```
project-root/
├── .windsurf/
│   ├── rules/
│   │   ├── coding-standards.md
│   │   ├── security.md
│   │   └── testing.md
│   └── workflows/
│       └── deploy.md
```

**Legacy Format (Pre-Wave 8):**
```
project-root/
├── .windsurfrules    # Plain text, numbered list format
```

> "Rules are defined in markdown (.md) files within the repository's root folder of `.windsurf/rules`." - [DEV Community](https://dev.to/yardenporat/codium-windsurf-ide-rules-file-1hn9)

### Automatic Discovery

Windsurf automatically discovers rules from multiple locations:

1. **Current workspace and sub-directories**: All `.windsurf/rules` directories within workspace
2. **Git repository structure**: Searches up to git root directory for parent rules
3. **Multiple workspace support**: Rules are deduplicated using shortest relative path

> "For git repositories, Windsurf also searches up to the git root directory to find rules in parent directories." - [Windsurf Docs](https://docs.windsurf.com/windsurf/cascade/memories)

### Character Limits

⚠️ **CORRECTION**: Character limits have conflicting information across sources and versions.

| Scope | Limit | Source |
|-------|-------|--------|
| Individual rule file | **12,000 characters** | [Official Docs (Current)](https://docs.windsurf.com/windsurf/cascade/memories) |
| Individual rule file (legacy) | 6,000 characters | Community reports for `.windsurfrules` format |
| Total combined (global + workspace) | 12,000 characters | Multiple sources |

**Clarification**:
- **Official documentation** states "Rules files are limited to 12000 characters each"
- **Community sources** report 6,000 character per-file limits, which may apply to:
  - Legacy `.windsurfrules` format (deprecated)
  - Older Windsurf versions
  - `global_rules.md` specifically

**Truncation Priority**: If combined limit exceeded:
1. Global rules (highest priority)
2. Workspace rules
3. Excess truncated

**Recommendation**: Assume **6,000 character per-file limit** for maximum compatibility across versions.

---

## Global Rules Configuration

### File Location

Global rules are stored at:
```
~/.codeium/windsurf/memories/global_rules.md
```

### Purpose

Global rules apply across all workspaces and define organization-wide standards. They serve as the "constitution" for all projects.

### Access Methods

1. **GUI**: Click "Customizations" icon in Cascade's top-right menu, navigate to "Rules", click "+ Global"
2. **Settings**: "Windsurf - Settings" in bottom-right corner -> "Edit global rules"
3. **Direct file access**: Edit `~/.codeium/windsurf/memories/global_rules.md`

---

## AGENTS.md Files

Windsurf supports AGENTS.md files as a simpler alternative to the full rules system.

### How They Work

> "AGENTS.md files provide a simple way to give Cascade context-aware instructions that automatically apply based on where the file is located in your project." - [Windsurf Docs](https://docs.windsurf.com/windsurf/cascade/agents-md)

### Location-Based Scoping

- **Root directory**: Instructions apply globally
- **Subdirectories**: Instructions apply only to files within that directory and children

### File Format

- Filename: `AGENTS.md` or `agents.md` (case-insensitive)
- Format: Plain markdown, no frontmatter required
- Discovery: Automatic throughout workspace and parent directories to git root

### Example Structure

```
my-project/
├── AGENTS.md                    # Global instructions
├── frontend/
│   └── AGENTS.md                # Frontend-specific guidance
└── backend/
    └── AGENTS.md                # Backend-specific guidance
```

### Comparison: AGENTS.md vs Rules

| Feature | AGENTS.md | Rules |
|---------|-----------|-------|
| Location | Project directories | `.windsurf/rules/` or global |
| Scoping | Automatic by file location | Manual activation options |
| Format | Plain markdown | Markdown with YAML frontmatter |
| Best for | Directory conventions | Complex activation logic |

---

## Rule Syntax and Format

⚠️ **IMPORTANT CAVEAT**: The following frontmatter structure is **inferred from community examples and the Cascade Customizations Catalog**. The official Windsurf documentation does **not explicitly specify YAML frontmatter requirements** for rules files. Activation modes appear to be configurable through the GUI rather than necessarily through frontmatter.

### YAML Frontmatter Structure (Community Convention)

Based on community examples, rule files may include YAML frontmatter:

```yaml
---
trigger: always_on
description: Brief description of the rule
globs: "*.ts,*.tsx"
labels: typescript, coding-standards
author: developer-name
modified: 2026-01-14
---

# Rule Content Here

Your markdown-formatted instructions...
```

**Alternative frontmatter structure** (found in [Snyk integration example](https://docs.snyk.io/integrations/snyk-studio-agentic-integrations/quickstart-guides-for-snyk-studio/windsurf-guide)):

```yaml
---
alwaysApply: true
always_on: true
trigger: always_on
applyTo: "**"
description: Snyk Security At Incept
---
```

### Frontmatter Fields (Unverified)

⚠️ **Note**: These field requirements are **not documented in official Windsurf docs**. They appear to be community conventions.

| Field | Description | Required? | Source |
|-------|-------------|-----------|--------|
| `trigger` | Activation mode (always_on, model_decision, glob, manual) | Unclear | Community examples |
| `description` | Brief explanation of rule purpose | Unclear | Community examples |
| `globs` or `applyTo` | File patterns for glob-based activation | Only for glob trigger | Snyk example uses `applyTo` |
| `labels` | Comma-separated tags for categorization | No | Cascade Catalog |
| `author` | Creator's name or username | No | Cascade Catalog |
| `modified` | Last modification date (YYYY-MM-DD) | No | Cascade Catalog |
| `alwaysApply` | Boolean for always-on behavior | Unclear | Snyk example |

### Four Activation Modes

1. **Manual**: Activated via `@mention` in Cascade's input box
2. **Always On**: Applied to every user message
3. **Model Decision**: AI determines when to apply based on description
4. **Glob**: Applied to files matching specified patterns (e.g., `*.js`, `src/**/*.ts`)

### Content Best Practices

> "Keep rules simple, concise, and specific. Rules that are too long or vague may confuse Cascade." - [Windsurf Docs](https://docs.windsurf.com/windsurf/cascade/memories)

**Recommended:**
- Use bullet points, numbered lists, markdown formatting
- Be specific with concrete examples
- Use XML tags to group related rules
- Focus on project-specific constraints

**Avoid:**
- Generic rules (e.g., "write good code") - already in training data
- Long paragraphs without structure
- Vague instructions

### Example Rule Content

```markdown
---
trigger: glob
globs: "*.ts,*.tsx"
description: TypeScript coding standards
---

# TypeScript Standards

## Import Conventions
- Use namespace imports for Effect modules: `import * as Effect from "effect/Effect"`
- Use single-letter aliases: `import * as S from "effect/Schema"`

## Type Safety
- NEVER use `any` type
- NEVER use `@ts-ignore`
- Always validate external data with Schema

## Formatting
- Run `bun run lint:fix` before committing
```

---

## Multi-Workspace and Monorepo Support

### Automatic Discovery in Monorepos

Windsurf handles monorepo structures by:

1. **Traversing parent directories**: Searches up to git root for `.windsurf/rules/` directories
2. **Sub-directory discovery**: Finds all rules in workspace sub-directories
3. **Deduplication**: When multiple folders open, rules deduplicated with shortest relative path

### Example Monorepo Structure

```
monorepo/
├── .windsurf/
│   └── rules/
│       └── global-standards.md    # Applies to entire monorepo
├── packages/
│   ├── frontend/
│   │   └── .windsurf/
│   │       └── rules/
│   │           └── react-rules.md  # Frontend-specific
│   └── backend/
│       └── .windsurf/
│           └── rules/
│               └── api-rules.md    # Backend-specific
```

### Multi-Workspace Behavior

> "When multiple folders are open in the same workspace, rules are deduplicated and displayed with the shortest relative path." - [Windsurf Docs](https://docs.windsurf.com/windsurf/cascade/memories)

---

## Ignore Files

### .codeiumignore

Purpose: Control which files Windsurf ignores during indexing.

**Location**: Repository root (local) or `~/.codeium/` (global)

**Syntax**: Same as `.gitignore`

> "If you'd like Cascade to ignore files, you can add your files to `.codeiumignore` at the root of your workspace. This will prevent Cascade from viewing, editing or creating files inside of the paths designated." - [Windsurf Docs](https://docs.windsurf.com/context-awareness/windsurf-ignore)

### Default Ignore Behavior

Windsurf automatically ignores:
- Paths specified in `.gitignore`
- Files in `node_modules`
- Hidden pathnames (starting with ".")

### Global .codeiumignore (Enterprise)

Enterprise customers can place a global `.codeiumignore` in `~/.codeium/` folder to enforce uniform ignore policies across all workspaces.

### Known Limitations

> "There's a known issue where the `.codeiumignore` file's exception rules (`!pattern`) are not taking precedence over `.gitignore` rules." - [GitHub Issue #133](https://github.com/Exafunction/codeium/issues/133)

---

## Symlink Compatibility

### Research Findings

**No explicit documentation found** regarding symlink support for configuration files or rules directories.

### Known Symlink References

The only symlink-related documentation found concerns installation issues:

> "If you get an error along the lines of 'EEXIST: file already exists, symlink...' when installing, you'll need to add the path to your shell config file." - [Windsurf Installation Guide](https://university.windsurf.build/setup/installation)

### Implications for Integration

1. **Testing Required**: Symlink behavior must be empirically tested
2. **Cross-Platform Concerns**: Windows/macOS/Linux may behave differently
3. **Safe Assumption**: Cannot rely on symlink following without verification

### Recommended Testing Approach

```bash
# Test symlinked rules directory
cd project-root
mkdir -p ~/.windsurf-shared/rules
ln -s ~/.windsurf-shared/rules .windsurf/rules
# Add rules and verify Cascade reads them
```

---

## Enterprise Configuration

### System-Level Rules

Enterprise organizations can deploy system-level rules that cannot be modified by end users.

**OS-Specific Locations:**

| Platform | Path |
|----------|------|
| macOS | `/Library/Application Support/Windsurf/rules/*.md` |
| Linux/WSL | `/etc/windsurf/rules/*.md` |
| Windows | `C:\ProgramData\Windsurf\rules\*.md` |

### Precedence Hierarchy

```
System Rules (highest priority)
    ↓
Workspace Rules
    ↓
Global Rules
    ↓
Built-in Rules (lowest priority)
```

> "System-level rules... apply globally across all workspaces and cannot be modified by end users without administrator permissions." - [Windsurf Docs](https://docs.windsurf.com/windsurf/cascade/memories)

### Enterprise Features

- SSO integration (Okta, Azure AD, Google, SAML)
- SCIM provisioning for automated user management
- Feature toggles (Models, MCP Servers, App Deploys, etc.)
- Analytics dashboards

---

## Comparison with Claude Code

### Configuration File Comparison

| Feature | Windsurf | Claude Code |
|---------|----------|-------------|
| **Rules Directory** | `.windsurf/rules/` | `.claude/rules/` |
| **Main Config File** | `global_rules.md` | `CLAUDE.md` |
| **Settings File** | JSON via UI | `.claude/settings.json` |
| **Legacy Format** | `.windsurfrules` | N/A |
| **Directory-Scoped** | `AGENTS.md` | Nested `CLAUDE.md` |
| **Ignore File** | `.codeiumignore` | Via `permissions.deny` |

### Activation/Trigger Comparison

| Windsurf Mode | Claude Code Equivalent |
|---------------|------------------------|
| Manual (`@mention`) | Slash commands (`.claude/commands/`) |
| Always On | CLAUDE.md (always loaded) |
| Model Decision | N/A |
| Glob | `paths:` frontmatter in rules |

### Character Limits

| Platform | Per-File Limit | Total Limit |
|----------|----------------|-------------|
| Windsurf | 6,000 | 12,000 |
| Claude Code | No explicit limit | Context window dependent |

### Key Architectural Differences

1. **Approach**: Windsurf uses GUI-centric configuration; Claude Code is file-first
2. **Activation Logic**: Windsurf has explicit activation modes; Claude Code relies on file location
3. **Context Handling**: Windsurf auto-indexes codebase; Claude Code manual context addition
4. **Enterprise**: Both support system-level managed configs

### Migration Considerations

To maintain compatibility with both systems:

1. **Use markdown format** for rules (both support it)
2. **Organize by directory** (both traverse parent directories)
3. **Keep content under 6,000 characters** per file (Windsurf limit)
4. **Use descriptive filenames** (both use filename for identification)

---

## Key Findings for Integration

### Critical Integration Points

1. **Directory Structure Compatibility**
   - Claude Code: `.claude/rules/`
   - Windsurf: `.windsurf/rules/`
   - **Solution**: Maintain separate directories or use symlinks (requires testing)

2. **Character Limits**
   - Windsurf enforces 6,000 chars/file, 12,000 total
   - **Solution**: Keep shared rules under these limits

3. **Activation Modes**
   - Windsurf requires YAML frontmatter with `trigger` field
   - Claude Code uses file location and `paths:` frontmatter
   - **Solution**: Windsurf rules need additional frontmatter transformation

4. **Global Rules Location**
   - Windsurf: `~/.codeium/windsurf/memories/global_rules.md`
   - Claude Code: `~/.claude/CLAUDE.md` or `~/.claude/rules/`
   - **Solution**: Cannot share global rules without duplication

5. **AGENTS.md vs CLAUDE.md**
   - Both serve similar directory-scoped purposes
   - Different filenames prevent direct sharing
   - **Solution**: Potential symlink or build-time copy

### Recommended Integration Strategy

```
project-root/
├── .windsurf/
│   └── rules/
│       ├── effect-patterns.md      # Windsurf-specific frontmatter
│       └── code-quality.md
├── .claude/
│   └── rules/
│       ├── effect-patterns.md      # Claude Code format
│       └── code-quality.md
├── CLAUDE.md                        # Claude Code main config
├── AGENTS.md                        # Windsurf directory-scoped
└── .shared-rules/                   # Source of truth
    └── templates/
        ├── effect-patterns.tmpl.md
        └── code-quality.tmpl.md
```

### Gaps Requiring Further Investigation

1. **Symlink Behavior**: No documentation found; requires empirical testing
2. **MCP Integration**: Both support MCP but configuration differs
3. **Workflow Portability**: Windsurf workflows (`.windsurf/workflows/`) have no Claude Code equivalent

---

## Sources

### Official Documentation
- [Windsurf Cascade Memories](https://docs.windsurf.com/windsurf/cascade/memories)
- [Windsurf AGENTS.md](https://docs.windsurf.com/windsurf/cascade/agents-md)
- [Windsurf Workflows](https://docs.windsurf.com/windsurf/cascade/workflows)
- [Windsurf Ignore](https://docs.windsurf.com/context-awareness/windsurf-ignore)
- [Windsurf Guide for Admins](https://docs.windsurf.com/windsurf/guide-for-admins)
- [Claude Code Settings](https://code.claude.com/docs/en/settings)

### Community Resources
- [DEV Community: Windsurf IDE Rules File](https://dev.to/yardenporat/codium-windsurf-ide-rules-file-1hn9)
- [Cascade Customizations Catalog](https://github.com/Windsurf-Samples/cascade-customizations-catalog)
- [Awesome Windsurf](https://github.com/ichoosetoaccept/awesome-windsurf)

### Comparison Articles
- [Windsurf vs Cursor - DataCamp](https://www.datacamp.com/blog/windsurf-vs-cursor)
- [Claude Code vs Cursor - Qodo](https://www.qodo.ai/blog/claude-code-vs-cursor/)
- [Comparing Vibe Coding Tools - Appwrite](https://appwrite.io/blog/post/comparing-vibe-coding-tools)

---

## Critical Review & Corrections

**Review Date**: 2026-01-14
**Reviewer**: Spec Review Agent

### Inaccuracies Identified and Corrected

#### 1. Character Limit Confusion ⚠️ CRITICAL

**Original Claim**: "Individual rule file: 6,000 characters"

**Correction**: Official Windsurf documentation states "Rules files are limited to 12000 characters each." The 6,000 character limit appears to apply to:
- Legacy `.windsurfrules` format (deprecated)
- `global_rules.md` specifically in some versions
- Older Windsurf releases

**Evidence**: [Official Cascade Memories Documentation](https://docs.windsurf.com/windsurf/cascade/memories)

**Impact**: LOW - Recommended to use 6,000 character limit for backward compatibility, but newer versions support 12,000.

#### 2. YAML Frontmatter Documentation Status ⚠️ SIGNIFICANT

**Original Claim**: Presented frontmatter structure as documented fact with specific required fields.

**Correction**: The YAML frontmatter structure with `trigger`, `description`, etc. is **not explicitly documented in official Windsurf docs**. This appears to be:
- A community convention from the Cascade Customizations Catalog
- Possibly GUI-generated metadata
- Inferred from third-party integrations (e.g., Snyk)

**Evidence**:
- Official docs do not describe frontmatter structure
- [AGENTS.md documentation](https://docs.windsurf.com/windsurf/cascade/agents-md) explicitly states "plain markdown with no special frontmatter required"
- [Snyk integration example](https://docs.snyk.io/integrations/snyk-studio-agentic-integrations/quickstart-guides-for-snyk-studio/windsurf-guide) uses different field names (`alwaysApply`, `applyTo`)

**Impact**: MEDIUM - Integration strategy should not assume specific frontmatter structure. Test empirically.

#### 3. Frontmatter Field Requirements ⚠️ UNVERIFIED

**Original Claim**: Marked `trigger` and `description` as "Required" fields.

**Correction**: No official documentation specifies which frontmatter fields are required vs optional. Activation modes appear configurable through GUI rather than frontmatter.

**Evidence**: Official documentation focuses on GUI configuration, not file frontmatter.

**Impact**: MEDIUM - Cannot rely on frontmatter for programmatic rule generation without testing.

#### 4. Symlink Support Assessment ✅ ACCURATE

**Claim**: "No explicit documentation found"

**Verification**: CORRECT - No official documentation about symlink support. Community examples show usage but this is undocumented behavior.

**Evidence**: Extensive search found no official symlink documentation. Community repos show symlink usage between different AI tool configs.

**Impact**: Requires empirical testing before relying on symlinks.

### Recommendations for Integration

1. **Character Limits**: Use 6,000 character per-file limit for maximum compatibility
2. **Frontmatter**: Test frontmatter structure empirically; do not assume documented behavior
3. **Activation Modes**: Verify whether GUI configuration is required vs frontmatter
4. **Symlinks**: Test symlink behavior across platforms before deployment
5. **Version Differences**: Account for potential differences between Windsurf versions

### Verification Needed

The following claims require empirical testing:

- [ ] Actual frontmatter fields recognized by Windsurf
- [ ] Required vs optional frontmatter fields
- [ ] Symlink following for `.windsurf/rules/` directories
- [ ] Character limit enforcement (per-file vs total)
- [ ] Field name variations (`globs` vs `applyTo`, `trigger` vs `alwaysApply`)

---

*Report generated: 2026-01-14*
*Critical review completed: 2026-01-14*
