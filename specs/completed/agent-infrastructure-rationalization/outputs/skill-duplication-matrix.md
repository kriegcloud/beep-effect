# Skill Duplication Matrix

> P0 Inventory - Cross-directory skill mapping
> Generated: 2026-02-03

---

## Summary

| Metric | Value |
|--------|-------|
| Total Unique Skills | 53 |
| Fully Synced (symlinks) | 9 |
| Local Duplicates | 2 |
| Claude-Only | 52 |
| Broken Symlinks | 1 |

---

## Location Distribution

| Location | Count | Type | Notes |
|----------|-------|------|-------|
| `.claude/skills/` | 61 | 9 symlinks + 52 originals | Authoritative content repository |
| `.agents/skills/` | 9 | Directories with SKILL.md | Canonical source for agent skills |
| `.cursor/skills/` | 11 | 9 symlinks + 2 local copies | Partial coverage + legacy copies |
| `.windsurf/skills/` | 11 | 9 symlinks + 2 local copies | Partial coverage + legacy copies |
| `.codex/skills/` | 10 | 9 symlinks + 1 broken | Has dead link |
| `.opencode/skills/` | 9 | Symlinks only | Clean symlink-only |

---

## Complete Duplication Matrix

### Legend
- ✓ = Present (original or directory)
- ⟶ = Symlink to `.agents/`
- ✗ = Not present
- ⚠ = Broken symlink

### Synced Skills (Present in All Locations via Symlinks)

| Skill | .claude | .agents | .cursor | .windsurf | .codex | .opencode |
|-------|---------|---------|---------|-----------|--------|-----------|
| agentation | ⟶ | ✓ | ⟶ | ⟶ | ⟶ | ⟶ |
| better-auth-best-practices | ⟶ | ✓ | ⟶ | ⟶ | ⟶ | ⟶ |
| humanizer | ⟶ | ✓ | ⟶ | ⟶ | ⟶ | ⟶ |
| reflect | ⟶ | ✓ | ⟶ | ⟶ | ⟶ | ⟶ |
| session-handoff | ⟶ | ✓ | ⟶ | ⟶ | ⟶ | ⟶ |
| skill-creator | ⟶ | ✓ | ⟶ | ⟶ | ⟶ | ⟶ |
| skill-judge | ⟶ | ✓ | ⟶ | ⟶ | ⟶ | ⟶ |
| subagent-driven-development | ⟶ | ✓ | ⟶ | ⟶ | ⟶ | ⟶ |
| turborepo | ⟶ | ✓ | ⟶ | ⟶ | ⟶ | ⟶ |

### Local Duplicates (Content Divergence Risk)

| Skill | .claude | .agents | .cursor | .windsurf | .codex | .opencode |
|-------|---------|---------|---------|-----------|--------|-----------|
| Better Auth Best Practices | ✓ (16KB) | ✗ | ✓ (16KB) | ✓ (16KB) | ✗ | ✗ |
| Create Auth Skill | ✓ (17KB) | ✗ | ✓ (17KB) | ✓ (17KB) | ✗ | ✗ |

### Claude-Only Skills

| Skill | Size | Category |
|-------|------|----------|
| ai-context-writer | 11KB | Documentation |
| atom-state | 12KB | State Management |
| cli | 8KB | Tooling |
| command-executor | 14KB | Platform |
| context-witness | 7KB | Patterns |
| domain-modeling | 36KB | Domain Design |
| domain-predicates | 28KB | Domain Design |
| effect-ai-language-model | 13KB | Effect AI |
| effect-ai-prompt | 19KB | Effect AI |
| effect-ai-provider | 13KB | Effect AI |
| effect-ai-streaming | 13KB | Effect AI |
| effect-ai-tool | 28KB | Effect AI |
| effect-concurrency-testing | 14KB | Testing |
| error-handling | 32KB | Error Handling |
| filesystem | 13KB | Platform |
| layer-design | 18KB | Effect Patterns |
| legal-review | 15KB | Quality |
| parallel-explore | 7KB | Exploration |
| path | 13KB | Platform |
| pattern-matching | 28KB | Effect Patterns |
| platform-abstraction | 36KB | Platform |
| platform-layers | 13KB | Platform |
| prompt-refinement | 36KB | Agent Design |
| react-composition | 28KB | React |
| react-vm | 24KB | React |
| research-orchestration | 36KB | Orchestration |
| schema-composition | 32KB | Schema |
| service-implementation | 15KB | Effect Patterns |
| spec-driven-development | 32KB | Specifications |
| the-vm-standard | 14KB | Standards |
| typeclass-design | 13KB | Effect Patterns |
| wide-events | 4KB | Observability |
| writing-laws | 13KB | Standards |

*Plus 19 additional `.md` pattern files*

### Broken Symlinks

| Location | Target | Status |
|----------|--------|--------|
| `.codex/skills/shadcn-ui` | `.agents/skills/shadcn-ui` | ⚠ Target does not exist |

---

## Content Size Analysis

| Location | Total Size | Notes |
|----------|------------|-------|
| `.claude/skills/` | ~900KB | Mixed originals + symlinks |
| `.agents/skills/` | ~512KB | Authoritative agent skills |
| `.cursor/skills/` | ~100KB | Mostly symlinks + 2 copies |
| `.windsurf/skills/` | ~100KB | Mostly symlinks + 2 copies |
| `.codex/skills/` | ~0KB | Pure symlinks |
| `.opencode/skills/` | ~0KB | Pure symlinks |

---

## Issues Identified

### Critical

1. **Naming Inconsistency**
   - `better-auth-best-practices` (symlink to .agents)
   - `Better Auth Best Practices` (local directory with spaces)
   - Same concept, different names, different content sizes

2. **Content Divergence**
   - `.claude/skills/Better Auth Best Practices/`: 16KB
   - `.agents/skills/better-auth-best-practices/`: 6KB
   - 166% size difference indicates different content

3. **Broken Symlink**
   - `.codex/skills/shadcn-ui` → non-existent target

### Architecture Issues

1. **No clear hierarchy**: Skills scattered with no defined precedence
2. **Mixed strategies**: Some symlinks, some copies, some unique
3. **Empty placeholders**: `.codex/` and `.opencode/` provide no value

---

## Recommended Single-Source Strategy

### Tier 1: Authoritative Sources

| Source | Content | Strategy |
|--------|---------|----------|
| `.agents/skills/` | 9 core agent skills | Master copies, others symlink here |
| `.claude/skills/` | 52 extended skills | Secondary master for Claude-specific |

### Tier 2: Consumers (Symlinks Only)

| Consumer | Source | Action |
|----------|--------|--------|
| `.cursor/skills/` | → `.agents/` + `.claude/` | Remove local copies, use symlinks |
| `.windsurf/skills/` | → `.agents/` + `.claude/` | Remove local copies, use symlinks |
| `.codex/skills/` | → `.agents/` + `.claude/` | Fix broken link, keep symlink-only |
| `.opencode/skills/` | → `.agents/` + `.claude/` | Keep symlink-only (already clean) |

### Migration Actions

1. **Resolve naming**: Merge "Better Auth Best Practices" into `better-auth-best-practices`
2. **Remove duplicates**: Delete local copies from `.cursor/`, `.windsurf/`
3. **Fix broken link**: Remove `.codex/skills/shadcn-ui` or restore target
4. **Add CI check**: Prevent future duplication via commit hooks
5. **Consider consolidation**: Move `.agents/skills/` into `.claude/skills/` with symlinks for backwards compatibility
