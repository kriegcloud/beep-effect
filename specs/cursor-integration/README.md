# Cursor IDE Integration Spec

> Synchronize Claude Code configurations (`.claude/`) with Cursor IDE (`.cursor/` or `.cursorrules`), following the established spec creation workflow in this repository.

---

## Purpose

Enable the beep-effect monorepo to work seamlessly with both Claude Code CLI and Cursor IDE by:
1. Understanding configuration compatibility between `.claude/` and `.cursor/` structures
2. Implementing symlinks, copies, or transformation strategies to maintain a single source of truth
3. Ensuring rules, skills, and agents work correctly across both platforms

## Problem Statement

The repository has extensive Claude Code configurations in `.claude/`:
- `rules/` - Behavioral and coding pattern rules (3 files, ~7,977 bytes total)
- `skills/` - Reusable prompts and patterns (10 standalone + 2 suites)
- `agents/` - Specialized sub-agent definitions (20 agents)
- `commands/` - Custom commands
- `settings.json` - Configuration settings

Cursor IDE uses a similar but distinct structure:
- `.cursor/rules/` - MDC format rule files with frontmatter (preferred)
- `.cursorrules` - Legacy flat file format (deprecated)
- User Rules - Global rules via Cursor settings (plain text only)

The goal is to maintain parity without duplicating maintenance effort.

## Success Criteria

### Research Phase (Complete)
- [x] Cursor configuration structure documented
- [x] Claude Code configuration audited
- [x] Compatibility matrix created
- [x] Implementation plan with detailed checklist

### Implementation Phase (Not Started)
- [ ] `.cursor/rules/` directory created and configured
- [ ] Rule files transformed from `.md` to `.mdc` format
- [ ] Frontmatter compatibility verified
- [ ] Cursor loads all rule files correctly
- [ ] Effect patterns enforced in Cursor coding sessions

### Validation Phase (Not Started)
- [ ] No breaking changes to existing Claude Code workflow verified
- [ ] Cross-platform compatibility documented (Linux/macOS/Windows)
- [ ] Team documentation updated in CLAUDE.md or README

## Scope

### In Scope
- `.claude/rules/` ↔ `.cursor/rules/` synchronization (transform or copy)
- Assessment of skills/agents compatibility
- Frontmatter transformation requirements
- Cross-platform symlink considerations (Linux, macOS, Windows)

### Out of Scope
- Cursor-specific features not available in Claude Code
- Migration of project away from Claude Code
- Enterprise/system-level Cursor configurations

## Expected Outputs

| Artifact | Location |
|----------|----------|
| Cursor research report | `outputs/cursor-research.md` |
| Claude config audit | `outputs/claude-config-audit.md` |
| Compatibility matrix | `outputs/compatibility-matrix.md` |
| Master research synthesis | `outputs/MASTER_RESEARCH.md` |
| Implementation plan | `PLAN.md` |
| Orchestrator handoff | `handoffs/HANDOFF_P1.md` |

## Current Status

**Phase 0 Complete**: Research, synthesis, and planning artifacts created.
**Next Step**: Execute full implementation via HANDOFF_P1.md

## Phase Overview

| Phase | Focus | Agents | Status |
|-------|-------|--------|--------|
| 0 | Scaffolding & Research | web-researcher, codebase-researcher, doc-writer | **Complete** |
| 1 | Synthesis & Planning | doc-writer | **Complete** |
| 2 | Transformation & Migration | orchestrator | **Not Started** |
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
# After implementation, Cursor should automatically detect rules
ls -la .cursor/rules/  # Should contain .mdc files
```

---

## Related Documentation

- [Cursor Rules Documentation](https://docs.cursor.com/context/rules)
- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [Windsurf Integration Spec](../windsurf-integration/README.md) - Similar integration pattern
- [SPEC_CREATION_GUIDE](../SPEC_CREATION_GUIDE.md)
