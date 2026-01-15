# Master Research Synthesis: Cursor Integration

**Date**: 2026-01-14
**Purpose**: Synthesized findings from all research agents for integration planning

---

## Executive Summary

This document synthesizes research from:
- `cursor-research.md` - Cursor IDE configuration analysis
- `claude-config-audit.md` - Existing .claude/ structure audit
- `compatibility-matrix.md` - Feature-by-feature mapping

### Key Findings

1. **Direct Migration is VIABLE for Rules**: All 3 rule files (7,977 bytes, ~260 lines) are under Cursor's ~500 line per-file limit and can be transformed to MDC format.

2. **File Format Transformation Required**: Cursor uses MDC (`.mdc`) format with required frontmatter, while Claude Code uses Markdown (`.md`) with optional frontmatter.

3. **Frontmatter Transformation Required**: 
   - `paths:` → `globs:` (field name change)
   - Add `description:` field (required by Cursor)
   - Add `alwaysApply:` field (controls activation mode)

4. **Symlink Support is Broken**: Cursor no longer follows symlinks in `.cursor/rules/` directories. Must use file copy/transform approach.

5. **Skills/Agents Cannot Migrate**: Cursor has no equivalent to Claude Code's skills or agents systems. These remain Claude Code-only features.

---

## Integration Decision Matrix

### What CAN Be Shared

| Component | Sharing Method | Confidence |
|-----------|---------------|------------|
| Rules (3 files) | Transform `.md` → `.mdc` with frontmatter | High |
| Rule content | Direct copy (markdown compatible) | High |
| Nested rules | Transform and copy to nested `.cursor/rules/` | High |

### What CANNOT Be Shared

| Component | Reason | Alternative |
|-----------|--------|-------------|
| Skills (10+ files) | Concept doesn't exist in Cursor | Document as non-migratable |
| Agents (20 files) | Concept doesn't exist in Cursor | Document as non-migratable |
| Commands (6 files) | No slash command system in Cursor | Document as non-migratable |
| Symlinks | Cursor has broken symlink support | Use file copy/transform |

---

## Technical Analysis

### File Format Transformation

**Claude Code** (`.claude/rules/behavioral.md`):
```markdown
# Behavioral Rules

## Critical Thinking Requirements
NEVER use phrases like "you are right"...
```

**Cursor** (`.cursor/rules/behavioral.mdc`):
```yaml
---
description: Behavioral rules for critical thinking and workflow standards
alwaysApply: true
---

# Behavioral Rules

## Critical Thinking Requirements
NEVER use phrases like "you are right"...
```

### Frontmatter Transformation

**Claude Code** (`effect-patterns.md`):
```yaml
---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---
```

**Cursor** (`effect-patterns.mdc`):
```yaml
---
description: Effect patterns for TypeScript files
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: false
---
```

### Transformation Logic

1. **Read** `.claude/rules/*.md` files using Effect FileSystem
2. **Parse** existing frontmatter (if present)
3. **Transform**:
   - `paths:` → `globs:` (rename field)
   - Add `description:` (extract from content or generate)
   - Add `alwaysApply:` (true for always-loaded, false for scoped)
4. **Write** `.cursor/rules/*.mdc` files

---

## Recommended Architecture

### Option 1: Transformation Script (Recommended)

```
project-root/
├── .claude/
│   └── rules/
│       ├── behavioral.md          # Source of truth
│       ├── general.md
│       └── effect-patterns.md
│
├── .cursor/
│   └── rules/
│       ├── behavioral.mdc         # Generated
│       ├── general.mdc
│       └── effect-patterns.mdc
│
└── scripts/
    └── sync-cursor-rules.ts       # Effect-based transformation
```

**Pros**:
- Single source of truth (`.claude/rules/`)
- Automated synchronization
- Platform-specific transformations
- Version controlled

**Cons**:
- Requires script maintenance
- Build step needed

### Option 2: Manual Copy (Fallback)

If transformation script is not viable:
- Manually copy and transform files
- Document transformation process
- Update manually when rules change

**Pros**:
- Simple, no tooling required
- Full control

**Cons**:
- Manual maintenance burden
- Risk of drift between systems

---

## Implementation Phases

### Phase 1: Proof of Concept (1-2 hours)

1. Create `.cursor/rules/` directory
2. Manually transform one rule file (e.g., `behavioral.md` → `behavioral.mdc`)
3. Test in Cursor: verify rule loads and applies
4. Verify frontmatter format is correct

### Phase 2: Transformation Script (2-3 hours)

1. Write Effect FileSystem script to:
   - Read all `.claude/rules/*.md` files
   - Transform frontmatter
   - Write `.cursor/rules/*.mdc` files
2. Test script on all 3 rule files
3. Verify output matches expected format

### Phase 3: Integration (1 hour)

1. Run transformation script
2. Verify all rules load in Cursor
3. Test rule application in Cursor sessions
4. Document process

### Phase 4: Documentation (30 minutes)

1. Update project documentation
2. Add setup instructions
3. Document transformation process
4. Version control `.cursor/rules/`

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Frontmatter format incorrect | Medium | Medium | Test with one file first |
| Cursor doesn't recognize rules | Low | High | Verify in Cursor UI before full migration |
| Transformation script errors | Medium | Medium | Use Effect error handling, test thoroughly |
| File format drift | Low | Low | Version control both directories |
| Symlink attempt fails | High | High | **Avoid symlinks** - use file copy |

---

## Success Criteria

1. **Transformation Working**: All 3 rule files successfully transformed to `.mdc` format
2. **Rules Loaded**: All rules appear in Cursor's rules UI
3. **Behavior Applied**: Verify via test prompts that:
   - Critical thinking patterns are followed (from behavioral.mdc)
   - Effect pattern enforcement occurs (from effect-patterns.mdc)
   - Code quality rules are referenced (from general.mdc)
4. **No Claude Code Regression**: Claude Code continues working unchanged
5. **Documentation Complete**: Setup process documented for team

---

## Open Questions

1. **Does Cursor require specific frontmatter field order?**
   - Status: Requires testing
   - If yes: Document required order

2. **How does Cursor handle rules without `globs` field?**
   - Status: Expected to default to always-applied
   - If no: Add explicit `alwaysApply: true`

3. **Can Cursor rules reference other files?**
   - Status: Unknown
   - If yes: Could enable more complex rule organization

4. **What happens if both `.cursorrules` and `.cursor/rules/` exist?**
   - Status: Requires testing
   - Expected: `.cursor/rules/` takes precedence

---

## Conclusion

**Recommended Approach**: Use transformation script (Option 1) to convert `.claude/rules/*.md` → `.cursor/rules/*.mdc` with proper frontmatter. This maintains a single source of truth while enabling Cursor compatibility.

**Estimated Effort**: 4-6 hours for complete implementation (proof of concept + script + integration + documentation).

**Key Constraint**: Symlinks are not viable due to Cursor's broken symlink support. File copy/transform is required.

---

*Synthesis completed: 2026-01-14*
