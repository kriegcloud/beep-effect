# Cursor IDE Configuration System Research Report

**Date**: 2026-01-14
**Author**: Web Researcher Agent
**Purpose**: Comprehensive analysis of Cursor IDE configuration for integration planning

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Rules System](#project-rules-system)
3. [User Rules Configuration](#user-rules-configuration)
4. [Legacy .cursorrules Format](#legacy-cursorrules-format)
5. [Rule File Format (MDC)](#rule-file-format-mdc)
6. [Rule Activation Modes](#rule-activation-modes)
7. [Nested Rules Support](#nested-rules-support)
8. [Character and Size Limits](#character-and-size-limits)
9. [Symlink Compatibility](#symlink-compatibility)
10. [Comparison with Claude Code](#comparison-with-claude-code)
11. [Key Findings for Integration](#key-findings-for-integration)

---

## Executive Summary

Cursor IDE is an AI-powered code editor that uses a rules-based system for configuring AI behavior. The configuration system supports multiple levels of rules (project, user, system) with four activation modes and automatic discovery mechanisms.

**Key Takeaways:**
- Rules are stored in `.cursor/rules/` directories as MDC (`.mdc`) files
- Character limits: **Best practice ~500 lines per file** (no hard technical limit documented)
- Four activation modes: Always, Auto Attached, Agent Requested, Manual
- Automatic discovery traverses nested directories
- Legacy `.cursorrules` format is deprecated in favor of `.cursor/rules/`
- ⚠️ **Symlink support is broken/unreliable** - recent bug reports indicate Cursor no longer follows symlinks in `.cursor/rules/`

---

## Project Rules System

### Directory Structure

Rules are stored as MDC (`.mdc`) files in the `.cursor/rules/` directory at the repository root.

**Current Structure (Preferred):**
```
project-root/
├── .cursor/
│   └── rules/
│       ├── coding-standards.mdc
│       ├── security.mdc
│       └── testing.mdc
```

**Legacy Format (Deprecated):**
```
project-root/
├── .cursorrules    # Plain text, flat file format
```

> "Project Rules are stored in `.cursor/rules/` directories, version controlled, and scoped to your codebase." - [Cursor Docs](https://docs.cursor.com/context/rules)

### Automatic Discovery

Cursor automatically discovers rules from multiple locations:

1. **Current workspace**: All `.cursor/rules/` directories within workspace
2. **Nested directories**: Rules in subdirectories apply when files in that directory are referenced
3. **Git repository structure**: Rules are version controlled and shared with team

> "Rules in a subdirectory apply when files in that directory are referenced." - [Cursor Docs](https://docs.cursor.com/context/rules)

---

## User Rules Configuration

### Global Rules

User Rules are global rules defined via Cursor Settings → Rules. They are:
- **Plain text only** (no MDC frontmatter)
- **Always applied** across all workspaces
- **User-specific** (not version controlled)

**Location**: Configured via Cursor Settings UI, stored in user settings.

> "User Rules are global rules defined via Cursor Settings → Rules; plain text (no MDC frontmatter) and always applied." - [Cursor Docs](https://docs.cursor.com/context/rules)

---

## Legacy .cursorrules Format

### Status

The `.cursorrules` file format is:
- **Still supported** but **deprecated**
- **Less flexible** than Project Rules
- **Flat file format** (no directory structure)
- **Project root only** (no nested support)

> "Legacy `.cursorrules` file: Still supported but deprecated; project rules are preferred." - [Cursor Docs](https://docs.cursor.com/en/context/rules)

### Migration Path

Projects are encouraged to migrate from `.cursorrules` to `.cursor/rules/*.mdc` files for:
- Better organization
- Scoped rules (via globs)
- Multiple activation modes
- Nested directory support

---

## Rule File Format (MDC)

### File Extension

Rules use the **MDC** (`.mdc`) file format, which is Markdown with YAML frontmatter.

### Frontmatter Structure

Each rule file includes YAML frontmatter with metadata:

```yaml
---
description: Brief description of the rule
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: true
---
```

### Frontmatter Fields

| Field | Type | Required? | Description |
|-------|------|-----------|-------------|
| `description` | string | **Yes** | Brief explanation of rule purpose |
| `globs` | array/string | No | File patterns for Auto Attached mode |
| `alwaysApply` | boolean | No | If true, rule is always included (Always mode) |

**Note**: Frontmatter requirements are based on official documentation. Some fields may have undocumented constraints.

### Content Format

The content after frontmatter is standard Markdown:

```markdown
---
description: TypeScript coding standards
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: false
---

# TypeScript Standards

## Import Conventions
- Use namespace imports for Effect modules
- Use single-letter aliases for frequently used modules

## Type Safety
- NEVER use `any` type
- NEVER use `@ts-ignore`
```

---

## Rule Activation Modes

Cursor supports four activation modes for rules:

### 1. Always

Rules with `alwaysApply: true` are always included in the model context.

```yaml
---
description: Always applied rule
alwaysApply: true
---
```

### 2. Auto Attached

Rules automatically applied when files matching specified glob patterns are touched.

```yaml
---
description: TypeScript rules
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: false
---
```

### 3. Agent Requested

AI may choose to include these rules based on the description. Requires a clear description.

```yaml
---
description: Security best practices for authentication
alwaysApply: false
# No globs = Agent Requested mode
---
```

### 4. Manual

Only included when explicitly invoked with `@ruleName` tag in chat.

```yaml
---
description: Manual testing checklist
alwaysApply: false
# Manual mode - must be invoked explicitly
---
```

> "Rule types include Always, Auto Attached (via `globs`), Agent Requested, Manual." - [Cursor Docs](https://docs.cursor.com/en/context/rules)

---

## Nested Rules Support

### Directory-Based Scoping

Cursor supports nested `.cursor/rules/` directories for scoped rules:

```
monorepo/
├── .cursor/
│   └── rules/
│       └── global-standards.mdc    # Applies to entire monorepo
├── packages/
│   ├── frontend/
│   │   └── .cursor/
│   │       └── rules/
│   │           └── react-rules.mdc  # Frontend-specific
│   └── backend/
│       └── .cursor/
│           └── rules/
│               └── api-rules.mdc    # Backend-specific
```

### Automatic Application

Rules in nested directories automatically apply when:
- Files in that directory are referenced
- The AI is working on code in that directory
- Context includes files matching the directory scope

> "Rules in a subdirectory apply when files in that directory are referenced." - [Cursor Docs](https://docs.cursor.com/context/rules)

---

## Character and Size Limits

### Best Practices

**Recommended**: Keep individual rule files under **~500 lines** for maintainability.

> "Best practices suggest keeping rules files under ~500 lines for maintainability." - [Cursor Docs](https://docs.cursor.com/en/context/rules)

### Technical Limits

**No explicit hard technical size limit** documented in official documentation. However:
- Very large files may degrade effectiveness
- AI may miss parts of context in oversized files
- Performance may degrade with many large rules

### Community Reports

Community discussions suggest:
- Legacy `.cursorrules` has no enforced hard size limit
- Large files (>1000 lines) may cause issues
- Splitting large rules into multiple files is recommended

---

## Symlink Compatibility

### Current Status

⚠️ **CRITICAL**: Recent bug reports indicate that **Cursor no longer follows symlinks** in `.cursor/rules/` directories.

> "Cursor no longer can follow symlinks to rules .mdc files" - [Cursor Forum](https://forum.cursor.com/t/cursor-no-longer-can-follow-symlinks-to-rules-mdc-files/146010)

### Implications for Integration

1. **Symlinks are unreliable**: Cannot rely on symlink following without verification
2. **Copy approach required**: Must use file copy instead of symlinks
3. **Cross-platform concerns**: Windows/macOS/Linux may behave differently
4. **Testing required**: Empirical testing needed to confirm current behavior

### Recommended Approach

- **Avoid symlinks** for rule files until support is confirmed
- **Use file copy** or transformation scripts
- **Test empirically** if symlinks are attempted

---

## Comparison with Claude Code

### Configuration File Comparison

| Feature | Cursor | Claude Code |
|---------|--------|-------------|
| **Rules Directory** | `.cursor/rules/` | `.claude/rules/` |
| **File Format** | MDC (`.mdc`) with frontmatter | Markdown (`.md`) with optional frontmatter |
| **Legacy Format** | `.cursorrules` (deprecated) | N/A |
| **Main Config File** | User Rules (global) | `CLAUDE.md` |
| **Settings File** | JSON via UI | `.claude/settings.json` |
| **Directory-Scoped** | Nested `.cursor/rules/` | Nested `CLAUDE.md` |

### Activation/Trigger Comparison

| Cursor Mode | Claude Code Equivalent |
|-------------|------------------------|
| Always (`alwaysApply: true`) | Rules in `.claude/rules/` (always loaded) |
| Auto Attached (`globs`) | `paths:` frontmatter in rules |
| Agent Requested | N/A (Claude Code doesn't have this concept) |
| Manual (`@ruleName`) | Slash commands (`.claude/commands/`) |

### Character Limits

| Platform | Per-File Limit | Total Limit |
|----------|----------------|-------------|
| Cursor | ~500 lines (best practice) | No documented limit |
| Claude Code | No explicit limit | Context window dependent |

### Key Architectural Differences

1. **File Format**: Cursor uses MDC (`.mdc`), Claude Code uses Markdown (`.md`)
2. **Frontmatter**: Cursor requires `description`, uses `globs`; Claude Code uses `paths`
3. **Activation Logic**: Cursor has explicit activation modes; Claude Code relies on file location
4. **Symlink Support**: Cursor has broken symlink support; Claude Code supports symlinks
5. **Skills/Agents**: Cursor doesn't have equivalent to Claude Code's skills/agents system

---

## Key Findings for Integration

### Critical Integration Points

1. **File Format Transformation Required**
   - Claude Code: `.md` files
   - Cursor: `.mdc` files
   - **Solution**: Transform `.md` → `.mdc` with frontmatter adjustments

2. **Frontmatter Differences**
   - Claude Code: `paths:` (array)
   - Cursor: `globs:` (array or string)
   - **Solution**: Transform `paths` → `globs` in frontmatter

3. **Symlink Support Broken**
   - Cursor no longer follows symlinks reliably
   - **Solution**: Use file copy or transformation script instead of symlinks

4. **Character Limits**
   - Cursor: Best practice ~500 lines per file
   - Current `.claude/rules/` files: All under limits
   - **Solution**: No splitting needed for current rules

5. **Activation Modes**
   - Claude Code: Rules always loaded
   - Cursor: Multiple activation modes available
   - **Solution**: Map always-loaded rules to `alwaysApply: true`

### Recommended Integration Strategy

```
project-root/
├── .claude/
│   └── rules/
│       ├── behavioral.md      # Source of truth
│       ├── general.md
│       └── effect-patterns.md
│
├── .cursor/
│   └── rules/
│       ├── behavioral.mdc     # Transformed copy
│       ├── general.mdc
│       └── effect-patterns.mdc
│
└── scripts/
    └── sync-cursor-rules.ts   # Effect-based transformation script
```

### Gaps Requiring Further Investigation

1. **Symlink Behavior**: Broken per recent reports; requires empirical testing
2. **Frontmatter Field Requirements**: Some fields may be undocumented
3. **Agent Requested Mode**: How does AI decide when to include rules?
4. **Nested Rules Precedence**: How are conflicts resolved?

---

## Sources

### Official Documentation
- [Cursor Rules Documentation](https://docs.cursor.com/context/rules)
- [Cursor Rules (Alternative URL)](https://docs.cursor.com/en/context/rules)

### Community Resources
- [Cursor Forum: Symlink Issue](https://forum.cursor.com/t/cursor-no-longer-can-follow-symlinks-to-rules-mdc-files/146010)
- [Cursor Forum: File Size Limits](https://forum.cursor.com/t/maximum-file-size-for-cursorrules-in-cursor-ide/39374)

### Comparison Articles
- [Windsurf Integration Spec](../windsurf-integration/README.md) - Similar integration pattern

---

## Critical Review & Verification Needed

The following claims require empirical testing:

- [ ] Actual symlink behavior in current Cursor version
- [ ] Frontmatter field requirements (required vs optional)
- [ ] Character/line limits enforcement
- [ ] Agent Requested mode triggering behavior
- [ ] Nested rules precedence and conflict resolution

---

*Report generated: 2026-01-14*
