# AI Documentation Inventory

**Generated**: 2026-01-11
**Scope**: `.claude/` directory + root files
**Total Files**: 43

---

## File Summary

| Type | Count | Lines |
|------|-------|-------|
| Agents | 18 | 8,919 |
| Skills | 12 | 2,215 |
| Commands | 6 | 1,353 |
| Rules | 3 | 210 |
| Templates | 1 | 291 |
| Config | 1 | 23 |
| Root | 2 | 240 |
| **Total** | **43** | **13,251** |

---

## Complete Inventory

### Root Files

| File | Lines | Frontmatter | References |
|------|-------|-------------|------------|
| CLAUDE.md | 129 | No | 8 |
| AGENTS.md | 111 | No | 8 |

### Config

| File | Lines | Type |
|------|-------|------|
| .claude/settings.json | 23 | JSON config |

### Rules (`.claude/rules/`)

| File | Lines | Frontmatter | References |
|------|-------|-------------|------------|
| behavioral.md | 50 | No | 0 |
| effect-patterns.md | 101 | Yes | 2 |
| general.md | 59 | No | 3 |

### Agents (`.claude/agents/`)

| File | Lines | Frontmatter | References |
|------|-------|-------------|------------|
| agents-md-updater.md | 179 | Yes | 4 |
| architecture-pattern-enforcer.md | 549 | Yes | 12 |
| codebase-researcher.md | 450 | Yes | 8 |
| code-observability-writer.md | 383 | Yes | 6 |
| code-reviewer.md | 458 | Yes | 10 |
| doc-writer.md | 505 | Yes | 8 |
| effect-predicate-master.md | 761 | Yes | 5 |
| effect-researcher.md | 380 | Yes | 15 |
| effect-schema-expert.md | 895 | Yes | 12 |
| jsdoc-fixer.md | 587 | Yes | 6 |
| mcp-researcher.md | 324 | Yes | 4 |
| package-error-fixer.md | 96 | Yes | 2 |
| prompt-refiner.md | 406 | Yes | 3 |
| readme-updater.md | 771 | Yes | 8 |
| reflector.md | 326 | Yes | 6 |
| test-writer.md | 1,199 | Yes | 20 |
| tsconfig-auditor.md | 308 | Yes | 4 |
| web-researcher.md | 342 | Yes | 3 |

### Templates (`.claude/agents/templates/`)

| File | Lines | References |
|------|-------|------------|
| agents-md-template.md | 291 | 5 |

### Skills (`.claude/skills/`)

| File | Lines | Frontmatter | References |
|------|-------|-------------|------------|
| collection-patterns.md | 149 | No | 2 |
| datetime-patterns.md | 143 | No | 2 |
| effect-imports.md | 126 | Yes | 3 |
| forbidden-patterns.md | 147 | Yes | 3 |
| match-patterns.md | 138 | No | 2 |

### Skills - Prompt Refinement (`.claude/skills/prompt-refinement/`)

| File | Lines | Frontmatter | References |
|------|-------|-------------|------------|
| COSTAR_CRISPE_FORMAT.md | 136 | No | 0 |
| CRITIC_CHECKLIST.md | 121 | No | 0 |
| EFFECT_CONSTRAINTS.md | 259 | No | 4 |
| SKILL.md | 172 | No | 3 |

### Skills - Research Orchestration (`.claude/skills/research-orchestration/`)

| File | Lines | Frontmatter | References |
|------|-------|-------------|------------|
| AGENT_DEPLOYMENT.md | 281 | No | 2 |
| PROMPT_TEMPLATE.md | 258 | No | 1 |
| SKILL.md | 285 | No | 4 |

### Commands (`.claude/commands/`)

| File | Lines | Frontmatter | References |
|------|-------|-------------|------------|
| done-feature.md | 187 | No | 4 |
| new-feature.md | 163 | No | 5 |
| port.md | 9 | No | 1 |
| refine-prompt.md | 27 | No | 1 |
| write-test.md | 195 | No | 6 |

### Commands - Patterns (`.claude/commands/patterns/`)

| File | Lines | Frontmatter | References |
|------|-------|-------------|------------|
| effect-testing-patterns.md | 772 | No | 15 |

---

## Reference Graph

### Reference Types Summary

| Reference Type | Count | Broken |
|----------------|-------|--------|
| Markdown links | 8 | 0 |
| Path references | 35 | 0 |
| @beep/ packages | 61 | 0 |
| Documentation refs | 3 | 0 |
| Specs refs | 6 | 0 |
| External URLs | 3 | 0 |

### Internal References (File → File)

| Source | Target | Line | Type |
|--------|--------|------|------|
| CLAUDE.md | documentation/PACKAGE_STRUCTURE.md | 25 | markdown-link |
| CLAUDE.md | documentation/EFFECT_PATTERNS.md | 35 | markdown-link |
| CLAUDE.md | specs/SPEC_CREATION_GUIDE.md | 68 | markdown-link |
| CLAUDE.md | specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md | 69 | markdown-link |
| CLAUDE.md | specs/README.md | 70 | markdown-link |
| CLAUDE.md | specs/agents/README.md | 71 | markdown-link |
| AGENTS.md | documentation/PACKAGE_STRUCTURE.md | 25 | markdown-link |
| AGENTS.md | documentation/EFFECT_PATTERNS.md | 35 | markdown-link |
| AGENTS.md | specs/SPEC_CREATION_GUIDE.md | 68 | markdown-link |

### Top @beep/ Package References

| Package | Count | Status |
|---------|-------|--------|
| @beep/testkit | 47 | Valid |
| @beep/schema | 42 | Valid |
| @beep/shared-domain | 19 | Valid |
| @beep/utils | 17 | Valid |
| @beep/iam-domain | 15 | Valid |
| @beep/types | 14 | Valid |
| @beep/identity | 14 | Valid |
| @beep/iam-server | 13 | Valid |

### External URLs

| File | Line | URL |
|------|------|-----|
| Multiple | Various | https://claude.ai/code |
| test-writer.md | 15 | https://effect.website/docs/testing |

---

## Missing References

**None found.** All referenced files and paths exist.

---

## Orphaned Files

Files that exist but are never referenced from other AI documentation:

| File | Last Modified | Notes |
|------|---------------|-------|
| .claude/skills/prompt-refinement/COSTAR_CRISPE_FORMAT.md | Recent | Self-contained reference |
| .claude/skills/prompt-refinement/CRITIC_CHECKLIST.md | Recent | Self-contained reference |
| .claude/rules/behavioral.md | Recent | Loaded automatically by Claude |

**Note**: These are not true orphans - they are loaded by the system automatically or are self-contained skill components.

---

## Hub Files (Most Referenced)

| File | Incoming References |
|------|---------------------|
| documentation/EFFECT_PATTERNS.md | 15+ |
| documentation/PACKAGE_STRUCTURE.md | 10+ |
| @beep/testkit | 47 |
| @beep/schema | 42 |
| specs/SPEC_CREATION_GUIDE.md | 8 |

---

## Frontmatter Analysis

| Category | With Frontmatter | Without |
|----------|------------------|---------|
| Agents | 18 (100%) | 0 |
| Skills | 2 (17%) | 10 |
| Commands | 0 (0%) | 6 |
| Rules | 1 (33%) | 2 |
| Templates | 0 (0%) | 1 |

---

## Stale Package Reference Check

### Deleted Packages (Verified NOT Referenced)

| Package | Status | AI Docs Reference |
|---------|--------|-------------------|
| @beep/mock | DELETED | Not referenced |
| @beep/yjs | DELETED | Not referenced |
| @beep/lexical-schemas | DELETED | Not referenced |

**Result**: AI documentation has been properly cleaned of stale references.

---

## Key Findings

### Strengths
1. **100% Reference Integrity** - Zero broken references
2. **Clean Package References** - No stale @beep/ packages
3. **Comprehensive Coverage** - 43 files, 13,251 lines
4. **All Agents Have Frontmatter** - Consistent metadata

### Observations
1. **Large Files**: test-writer.md (1,199 lines), effect-schema-expert.md (895 lines)
2. **Placeholder Examples**: ~10 @beep/package-X placeholders used in examples (appropriate)
3. **Skills Lack Frontmatter**: Only 2 of 12 skills have frontmatter

---

## Next Steps

Proceed to Phase 2: Evaluation
- **2.1**: Deploy `code-reviewer` for accuracy audit
- **2.2**: Deploy `architecture-pattern-enforcer` for cross-reference validation
