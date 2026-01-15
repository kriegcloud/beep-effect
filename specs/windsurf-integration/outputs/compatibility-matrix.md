# Claude Code ↔ Windsurf Compatibility Matrix

**Date**: 2026-01-14
**Purpose**: Feature-by-feature compatibility assessment for integration planning

---

## ⚠️ Critical Warnings

**BEFORE PROCEEDING**: This matrix identifies several areas requiring careful attention:

1. **Symlink Support Unverified**: Windsurf documentation does not explicitly confirm symlink support for configuration files. All symlink-based strategies require empirical testing before implementation.

2. **AGENTS.md ≠ CLAUDE.md**: These serve different purposes (directory-scoped vs global config) and cannot be directly swapped despite similar filenames.

3. **Frontmatter Transformation Required**: ALL skills require frontmatter transformation to work with Windsurf (add `trigger` field, rename `paths` to `globs`).

4. **Agent Concept Doesn't Exist**: The 20-agent system in Claude Code has no Windsurf equivalent. Migration would require complete redesign as rules or manual workflows.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Fully compatible - direct mapping exists |
| ⚠️ | Partially compatible - requires transformation or verification |
| ❌ | Not compatible - no equivalent concept |

---

## Configuration Structure Comparison

| Component | Claude Code | Windsurf | Status | Notes |
|-----------|-------------|----------|--------|-------|
| **Rules Directory** | `.claude/rules/` | `.windsurf/rules/` | ⚠️ | Same concept, symlink support unverified |
| **Main Config** | `CLAUDE.md` | N/A | ❌ | Windsurf uses global_rules.md |
| **Directory Config** | Nested `CLAUDE.md` | `AGENTS.md` | ❌ | Different scoping mechanisms |
| **Global Rules** | `~/.claude/rules/` | `~/.codeium/windsurf/memories/global_rules.md` | ⚠️ | Different locations |
| **Settings** | `.claude/settings.json` | GUI-managed | ❌ | No file equivalent |
| **Agents** | `.claude/agents/` | N/A | ❌ | Concept doesn't exist |
| **Skills** | `.claude/skills/` | Workflows (partial) | ⚠️ | Limited mapping |
| **Commands** | `.claude/commands/` | Workflows | ⚠️ | Different invocation model |
| **Manifest** | `agents-manifest.yaml` | N/A | ❌ | Concept doesn't exist |

---

## Rules File Compatibility

| Rule File | Claude Size | Windsurf Limit | Status | Action Required |
|-----------|-------------|----------------|--------|-----------------|
| behavioral.md | 1,826 | 6,000 | ✅ | Copy or symlink (test first) |
| general.md | 2,449 | 6,000 | ✅ | Copy or symlink (test first) |
| effect-patterns.md | 3,702 | 6,000 | ✅ | Copy or symlink (test first) |
| **TOTAL** | **7,977** | **12,000** | ✅ | All rules under size limits |

### Frontmatter Compatibility

| Field | Claude Code | Windsurf | Mapping |
|-------|-------------|----------|---------|
| description | Yes | Yes (required) | Direct |
| tools | Yes | N/A | Not applicable |
| paths | Yes | globs | Rename required |
| trigger | N/A | Yes (required) | Must add |

**Transformation Required**:
```yaml
# Claude Code
---
description: TypeScript patterns
paths: ["**/*.ts"]
---

# Windsurf (transformed)
---
trigger: glob
description: TypeScript patterns
globs: "**/*.ts"
---
```

---

## Agent Compatibility Assessment

| Agent | Size (bytes) | Under 6KB? | Windsurf Strategy |
|-------|-------------|------------|-------------------|
| effect-predicate-master | 35,916 | ❌ | Split or exclude |
| test-writer | 30,738 | ❌ | Split or exclude |
| effect-schema-expert | 26,220 | ❌ | Split or exclude |
| readme-updater | 23,691 | ❌ | Split or exclude |
| spec-reviewer | 21,290 | ❌ | Split or exclude |
| architecture-pattern-enforcer | 18,433 | ❌ | Split or exclude |
| jsdoc-fixer | 18,291 | ❌ | Split or exclude |
| doc-writer | 13,250 | ❌ | Split or exclude |
| reflector | 12,712 | ❌ | Split or exclude |
| effect-researcher | 12,977 | ❌ | Split or exclude |
| ai-trends-researcher | 12,069 | ❌ | Split or exclude |
| tsconfig-auditor | 12,072 | ❌ | Split or exclude |
| code-observability-writer | 11,953 | ❌ | Split or exclude |
| codebase-researcher | 11,483 | ❌ | Split or exclude |
| code-reviewer | 10,887 | ❌ | Split or exclude |
| mcp-researcher | 10,689 | ❌ | Split or exclude |
| web-researcher | 8,232 | ❌ | Split or exclude |
| agents-md-updater | 6,957 | ❌ | Trim or split |
| package-error-fixer | 5,691 | ✅ | Only agent under 6KB limit |
| prompt-refiner | 12,592 | ❌ | Split or exclude |

**Summary**: 19/20 agents exceed Windsurf's 6KB limit.

**Recommendation**: Agents as a concept don't map to Windsurf. Consider:
1. Creating condensed "rule summaries" of key agent behaviors
2. Not migrating agents (Claude Code-specific feature)
3. Using AGENTS.md for critical agent guidance

---

## Skills Compatibility Assessment

| Skill | Size (bytes) | Under 6KB? | Migration Strategy |
|-------|-------------|------------|-------------------|
| visual-testing.md | 12,054 | ❌ | Split into multiple files |
| atomic-component.md | 11,627 | ❌ | Split into multiple files |
| form-field.md | 10,619 | ❌ | Split into multiple files |
| effect-check.md | 9,387 | ❌ | Split into multiple files |
| mui-component-override.md | 8,117 | ❌ | Split into multiple files |
| match-patterns.md | 3,734 | ✅ | Transform frontmatter |
| collection-patterns.md | 3,654 | ✅ | Transform frontmatter |
| effect-imports.md | 3,348 | ✅ | Transform frontmatter |
| datetime-patterns.md | 3,192 | ✅ | Transform frontmatter |
| forbidden-patterns.md | 3,089 | ✅ | Transform frontmatter |

**Summary**: 5/10 standalone skills under size limit. All require frontmatter transformation.

---

## Commands → Workflows Mapping

| Claude Command | Purpose | Windsurf Workflow? | Notes |
|----------------|---------|-------------------|-------|
| /new-feature | Feature development | ⚠️ Partial | Multi-phase logic not supported |
| /done-feature | Completion workflow | ⚠️ Partial | Simpler version possible |
| /write-test | Test generation | ✅ | Simple trigger possible |
| /refine-prompt | Prompt refinement | ✅ | Simple trigger possible |
| /port | API porting | ✅ | Simple trigger possible |
| patterns/effect-testing | Reference doc | ❌ | Not a workflow |

---

## Activation Mode Mapping

| Claude Code Pattern | Windsurf Trigger | Mapping Quality |
|--------------------|------------------|-----------------|
| Always loaded (CLAUDE.md) | `always_on` | ✅ Direct |
| Path-based (`paths:`) | `glob` | ⚠️ Syntax differs |
| Slash command | `manual` | ⚠️ @mention instead |
| Context-dependent | `model_decision` | ✅ New capability |

---

## Symlink Strategy Matrix

### ⚠️ Symlinks Require Testing (Unverified Support)

**IMPORTANT**: Windsurf documentation does not explicitly confirm symlink support. Empirical testing required before relying on symlinks.

```
.claude/rules/behavioral.md     → .windsurf/rules/behavioral.md  (if symlinks work)
.claude/rules/general.md        → .windsurf/rules/general.md     (if symlinks work)
.claude/rules/effect-patterns.md → .windsurf/rules/effect-patterns.md (if symlinks work)
```

**Testing Required**: Create test symlink and verify Windsurf reads rules correctly across platforms (macOS/Linux/Windows).

### ⚠️ Requires Frontmatter Transformation

**All skills require frontmatter transformation** from Claude Code format to Windsurf format (add `trigger`, rename `paths` to `globs`).

```
.claude/skills/match-patterns.md      → Transform → .windsurf/rules/match-patterns.md
.claude/skills/collection-patterns.md → Transform → .windsurf/rules/collection-patterns.md
.claude/skills/effect-imports.md      → Transform → .windsurf/rules/effect-imports.md
.claude/skills/datetime-patterns.md   → Transform → .windsurf/rules/datetime-patterns.md
.claude/skills/forbidden-patterns.md  → Transform → .windsurf/rules/forbidden-patterns.md
```

**Note**: Larger skills (visual-testing, atomic-component, form-field, effect-check, mui-component-override) also need splitting due to 6KB limit.

### ❌ Cannot Migrate

```
.claude/agents/*          - Concept doesn't exist in Windsurf
.claude/agents-manifest.yaml - Claude Code specific
.claude/settings.json     - Permissions not applicable
.claude/commands/*        - Partial workflow mapping only
```

---

## Integration Options Summary

### Option A: Symlink Rules Only (Minimal) ⚠️ UNVERIFIED

**Effort**: Low (if symlinks work)
**Coverage**: 3 files
**Risk**: Medium (symlink support unverified)

```bash
ln -s ../.claude/rules .windsurf/rules
# THEN: Test that Windsurf actually reads the symlinked files
```

**Pros**: Immediate if works, zero maintenance
**Cons**: Limited scope, no skills/agents, **requires verification**
**CRITICAL**: Must test symlink support before relying on this approach

### Option B: Copy + Transform (Moderate) - RECOMMENDED

**Effort**: Medium
**Coverage**: 8 files (3 rules + 5 small skills)
**Risk**: Low

```bash
# Build script to copy and transform
bun run scripts/sync-windsurf.ts
# - Copies .claude/rules/*.md to .windsurf/rules/
# - Transforms skill frontmatter (paths → globs, add trigger)
# - Validates 6KB limit compliance
```

**Pros**: Known to work, maintainable, version-controlled
**Cons**: Requires build script, not DRY (duplication)
**Note**: Avoids reliance on unverified symlink support

### Option C: Shared Source of Truth (Comprehensive)

**Effort**: High
**Coverage**: All compatible content
**Risk**: Higher complexity

```
.shared/rules/           # Source templates
├── behavioral.tmpl.md
├── general.tmpl.md
└── effect-patterns.tmpl.md

.claude/rules/           # Generated with Claude frontmatter
.windsurf/rules/         # Generated with Windsurf frontmatter
```

**Pros**: True single source, full control
**Cons**: Build complexity, maintenance overhead

---

## Recommended Path

**Phase 0: Verify Symlink Support (CRITICAL FIRST STEP)**
- Test symlink with single rule file
- Verify Windsurf reads symlinked content
- Document findings for macOS/Linux/Windows
- **Decision point**: If symlinks don't work, skip to Phase 1b

**Phase 1a: Symlink Rules (If Verified)**
- Symlink `.claude/rules/` → `.windsurf/rules/`
- Verify all 3 rules load correctly

**Phase 1b: Copy Rules (If Symlinks Don't Work)**
- Create build script to copy `.claude/rules/*.md` to `.windsurf/rules/`
- Add to package.json scripts: `bun run sync:windsurf`

**Phase 2: Add AGENTS.md (Quick Win)**
- Create root `AGENTS.md` with core behavioral rules
- Note: Different purpose than CLAUDE.md (directory-scoped vs global)

**Phase 3: Skill Transformation**
- Build script to transform 5 small skills
- Transform frontmatter: add `trigger`, rename `paths` → `globs`

**Phase 4: Evaluate Agent Migration (Long-term)**
- Agents concept doesn't exist in Windsurf
- Consider condensed "rule summaries" of critical agent behaviors

---

*Matrix generated: 2026-01-14*
