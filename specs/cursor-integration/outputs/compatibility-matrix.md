# Compatibility Matrix: Claude Code ↔ Cursor IDE

**Date**: 2026-01-14
**Purpose**: Feature-by-feature mapping between Claude Code and Cursor IDE configuration systems

---

## Executive Summary

This matrix maps features from Claude Code's `.claude/` configuration to Cursor IDE's `.cursor/` configuration, identifying:
- ✅ **Directly compatible** features
- ⚠️ **Requires transformation** features
- ❌ **Cannot migrate** features

---

## Rules System Comparison

| Feature | Claude Code | Cursor IDE | Compatible? | Notes |
|---------|-------------|------------|-------------|-------|
| **Rules Directory** | `.claude/rules/` | `.cursor/rules/` | ✅ Yes | Both support directory-based rules |
| **File Format** | Markdown (`.md`) | MDC (`.mdc`) | ⚠️ Transform | MDC is Markdown + required frontmatter |
| **File Extension** | `.md` | `.mdc` | ⚠️ Transform | Simple rename + frontmatter addition |
| **Plain Markdown Rules** | Supported | Supported | ✅ Yes | After adding required frontmatter |
| **Frontmatter Support** | Optional | Required | ⚠️ Transform | Cursor requires `description:` field |
| **Path Scoping** | `paths:` (array) | `globs:` (array/string) | ⚠️ Transform | Field name change, format compatible |
| **Always Applied Rules** | All rules in `.claude/rules/` | `alwaysApply: true` | ⚠️ Transform | Need to add frontmatter field |
| **Nested Rules** | Supported | Supported | ✅ Yes | Both support nested directories |
| **Symlink Support** | Supported | ❌ Broken | ❌ No | Cursor no longer follows symlinks |
| **Character Limits** | No explicit limit | ~500 lines (best practice) | ✅ Yes | Current files well under limit |
| **Legacy Format** | N/A | `.cursorrules` (deprecated) | N/A | Not applicable to Claude Code |

---

## Frontmatter Field Mapping

| Claude Code Field | Cursor Field | Transformation |
|------------------|--------------|----------------|
| `paths:` (array) | `globs:` (array/string) | Rename field, format compatible |
| (none) | `description:` (required) | **Must add** - Cursor requires this |
| (none) | `alwaysApply:` (boolean) | **Should add** - Controls activation mode |

### Example Transformation

**Claude Code format** (`effect-patterns.md`):
```yaml
---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---
```

**Cursor format** (`effect-patterns.mdc`):
```yaml
---
description: Effect patterns for TypeScript files
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: false
---
```

---

## Activation Modes Comparison

| Claude Code Behavior | Cursor Equivalent | Mapping |
|---------------------|-------------------|---------|
| All rules always loaded | `alwaysApply: true` | ✅ Direct mapping |
| Rules with `paths:` scoped | `globs:` with `alwaysApply: false` | ⚠️ Transform `paths` → `globs` |
| N/A | `Agent Requested` mode | ❌ No equivalent in Claude Code |
| N/A | `Manual` mode (`@ruleName`) | ❌ No equivalent in Claude Code |

---

## Skills and Agents Comparison

| Feature | Claude Code | Cursor IDE | Compatible? | Notes |
|---------|-------------|------------|-------------|-------|
| **Skills System** | `.claude/skills/` | ❌ No equivalent | ❌ No | Cursor has no skills concept |
| **Agents System** | `.claude/agents/` | ❌ No equivalent | ❌ No | Cursor has no subagents concept |
| **Commands** | `.claude/commands/` | ❌ No equivalent | ❌ No | Cursor has no slash commands |
| **Settings** | `.claude/settings.json` | User Settings (UI) | ⚠️ Partial | Different configuration methods |

---

## File Structure Comparison

| Component | Claude Code | Cursor IDE | Migration Strategy |
|-----------|-------------|------------|-------------------|
| **Main Config** | `CLAUDE.md` | User Rules (global) | ⚠️ Manual migration to User Rules |
| **Project Rules** | `.claude/rules/*.md` | `.cursor/rules/*.mdc` | ⚠️ Transform and copy |
| **Nested Rules** | Nested `CLAUDE.md` | Nested `.cursor/rules/` | ⚠️ Transform and copy |
| **Global Rules** | `~/.claude/rules/` | User Rules (UI) | ⚠️ Manual migration |

---

## Symlink Strategy

| Approach | Claude Code | Cursor IDE | Recommendation |
|----------|-------------|------------|----------------|
| **Directory Symlink** | ✅ Supported | ❌ Broken | ❌ **Avoid** - Use file copy instead |
| **File Symlink** | ✅ Supported | ❌ Broken | ❌ **Avoid** - Use file copy instead |
| **File Copy** | ✅ Supported | ✅ Supported | ✅ **Recommended** |
| **Transformation Script** | N/A | ✅ Supported | ✅ **Recommended** - Use Effect FileSystem |

---

## Character/Size Limits

| Metric | Claude Code | Cursor IDE | Status |
|--------|-------------|------------|--------|
| **Per-File Limit** | No explicit limit | ~500 lines (best practice) | ✅ Current files compatible |
| **Total Limit** | Context window dependent | No documented limit | ✅ No concern |
| **Current Usage** | 3 files, ~260 lines total | Well under limits | ✅ Safe |

---

## Migration Decision Matrix

### ✅ Can Be Directly Migrated

- Rule content (markdown text)
- File organization (directory structure)
- Nested rules (directory-based scoping)

### ⚠️ Requires Transformation

- File extension (`.md` → `.mdc`)
- Frontmatter fields (`paths:` → `globs:`, add `description:`, add `alwaysApply:`)
- Always-applied rules (add `alwaysApply: true`)

### ❌ Cannot Migrate

- Skills system (`.claude/skills/`)
- Agents system (`.claude/agents/`)
- Commands system (`.claude/commands/`)
- Symlink approach (Cursor has broken symlink support)

---

## Recommended Migration Strategy

### Phase 1: Rules Migration
1. ✅ Transform `.claude/rules/*.md` → `.cursor/rules/*.mdc`
2. ✅ Add required frontmatter fields
3. ✅ Transform `paths:` → `globs:` where applicable
4. ✅ Set `alwaysApply: true` for always-loaded rules

### Phase 2: Content Migration
1. ⚠️ Extract key concepts from `CLAUDE.md` → Cursor User Rules (manual)
2. ❌ Skills/Agents: Document as non-migratable
3. ❌ Commands: Document as non-migratable

### Phase 3: Maintenance
1. ✅ Create Effect-based sync script
2. ✅ Document transformation process
3. ✅ Set up verification checks

---

## Compatibility Summary

| Category | Compatible | Requires Transform | Cannot Migrate |
|----------|------------|-------------------|----------------|
| **Rules** | ✅ 3/3 files | ⚠️ Frontmatter | - |
| **Skills** | - | - | ❌ 0/10+ skills |
| **Agents** | - | - | ❌ 0/20 agents |
| **Commands** | - | - | ❌ 0/6 commands |
| **Settings** | ⚠️ Partial | ⚠️ Manual | - |

**Overall Compatibility**: ~15% (rules only; skills/agents/commands cannot migrate)

---

*Matrix generated: 2026-01-14*
