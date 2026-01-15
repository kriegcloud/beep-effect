# Windsurf Integration Spec

> Synchronize Claude Code configurations with Windsurf IDE through symlinks or compatible file structures.

---

## Purpose

Enable the beep-effect monorepo to work seamlessly with both Claude Code CLI and Windsurf IDE by:
1. Understanding configuration compatibility between `.claude/` and `.windsurf/` structures
2. Implementing symlinks or mirroring strategies to maintain a single source of truth
3. Ensuring rules, skills, and agents work correctly across both platforms

## Problem Statement

The repository has extensive Claude Code configurations in `.claude/`:
- `rules/` - Behavioral and coding pattern rules
- `skills/` - Reusable prompts and patterns
- `agents/` - Specialized sub-agent definitions
- `commands/` - Custom commands
- `settings.json` - Configuration settings

Windsurf uses a similar but distinct structure in `.windsurf/`:
- `rules/` - Markdown rule files (6,000 char limit per file, 12,000 total)
- `global_rules.md` - Global workspace rules
- `AGENTS.md` - Directory-scoped guidance (similar to nested CLAUDE.md)

The goal is to maintain parity without duplicating maintenance effort.

## Success Criteria

### Research Phase (Complete)
- [x] Windsurf configuration structure documented
- [x] Claude Code configuration audited
- [x] Compatibility matrix created
- [x] Implementation plan with detailed checklist

### Implementation Phase (Partial)
- [x] `AGENTS.md` created at project root for Windsurf directory-scoped guidance
- [ ] `.windsurf/rules` symlink to `.claude/rules` created and verified
- [ ] Windsurf Cascade loads all 3 rule files (behavioral, general, effect-patterns)
- [ ] Effect patterns enforced in Windsurf coding sessions

### Validation Phase (Not Started)
- [ ] No breaking changes to existing Claude Code workflow verified
- [ ] Cross-platform compatibility documented (Linux/macOS/Windows)
- [ ] Team documentation updated in CLAUDE.md or README

## Scope

### In Scope
- `.claude/rules/` ↔ `.windsurf/rules/` synchronization (symlink or copy)
- Assessment of skills/agents compatibility (concluded: incompatible due to 6KB limit and missing agent concept)
- `AGENTS.md` creation for Windsurf directory-scoped guidance
- Cross-platform symlink considerations (Linux, macOS, Windows)

### Out of Scope
- Windsurf-specific features not available in Claude Code
- Migration of project away from Claude Code
- Enterprise/system-level Windsurf configurations

## Expected Outputs

| Artifact | Location |
|----------|----------|
| Windsurf research report | `outputs/windsurf-research.md` |
| Claude config audit | `outputs/claude-config-audit.md` |
| Compatibility matrix | `outputs/compatibility-matrix.md` |
| Master research synthesis | `outputs/MASTER_RESEARCH.md` |
| Implementation plan | `PLAN.md` |
| Orchestrator handoff | `handoffs/HANDOFF_P1.md` |

## Current Status

**Phase 0 Complete**: Research, synthesis, and planning artifacts created.
**Partial Implementation**: `AGENTS.md` created, but `.windsurf/` directory and symlink not yet configured.
**Next Step**: Execute full implementation via HANDOFF_P1.md

## Phase Overview

| Phase | Focus | Agents | Status |
|-------|-------|--------|--------|
| 0 | Scaffolding & Research | web-researcher, codebase-researcher, doc-writer | **Complete** |
| 1 | Synthesis & Planning | doc-writer | **Complete** |
| 2 | Symlink Validation | orchestrator | **Partial** (AGENTS.md exists, symlink pending) |
| 3 | Frontmatter Testing | orchestrator | **Not Started** |
| 4 | Documentation & Finalization | orchestrator | **Not Started** |

## Key Documents

- [PLAN.md](PLAN.md) - Implementation checklist
- [REFLECTION_LOG.md](REFLECTION_LOG.md) - Cumulative learnings
- [outputs/](outputs/) - Research artifacts
- [handoffs/](handoffs/) - Orchestrator handoff documents

---

## Quick Start

```bash
# After implementation, Windsurf should automatically detect rules via symlink
ls -la .windsurf/rules  # Should point to .claude/rules or equivalent
```

---

## Related Documentation

- [Windsurf Memories & Rules](https://docs.windsurf.com/plugins/cascade/memories)
- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [SPEC_CREATION_GUIDE](../SPEC_CREATION_GUIDE.md)
