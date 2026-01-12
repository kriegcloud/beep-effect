# Spec Bootstrapper

> CLI command and skill for streamlining spec creation in the beep-effect monorepo.

---

## Purpose

Create a unified, automated approach to bootstrapping new specifications:

1. **`bun run beep bootstrap-spec`** - CLI command to scaffold spec folder structure
2. **`/new-spec` skill** - Claude skill providing interactive guidance that invokes the CLI command

---

## Problem Statement

Currently, spec creation requires:
- Manual folder structure creation
- Copy-pasting from META_SPEC_TEMPLATE
- Remembering all required files
- Consulting SPEC_CREATION_GUIDE.md for proper structure

This leads to inconsistent spec structures and missed components.

---

## Success Criteria

- [ ] CLI command creates consistent spec folder structure
- [ ] Skill provides guided spec creation workflow
- [ ] Generated specs follow META_SPEC_TEMPLATE pattern
- [ ] Agent prompts embedded for each phase
- [ ] Templates auto-populated with spec context

---

## Expected Outputs

### Phase 0: Research
- `outputs/cli-research.md` - CLI implementation patterns
- `outputs/skill-research.md` - Skill creation patterns

### Phase 1: Implementation
- `tooling/cli/src/commands/bootstrap-spec/` - CLI command
- `.claude/skills/new-spec.md` - Claude skill

### Phase 2: Documentation
- Updated `tooling/cli/CLAUDE.md` with new command
- Updated `specs/SPEC_CREATION_GUIDE.md` with automation

---

## Phase Overview

| Phase | Focus | Agents |
|-------|-------|--------|
| 0 | Research existing patterns | codebase-researcher |
| 1 | Implement CLI + Skill | doc-writer |
| 2 | Test and validate | architecture-pattern-enforcer |
| 3 | Documentation | doc-writer |

---

## Quick Start

```bash
# After implementation:
bun run beep bootstrap-spec --name my-feature --description "Feature description"

# Or use the skill:
/new-spec my-feature
```

---

## Related

- [SPEC_CREATION_GUIDE.md](../SPEC_CREATION_GUIDE.md)
- [META_SPEC_TEMPLATE.md](../ai-friendliness-audit/META_SPEC_TEMPLATE.md)
- [CLI CLAUDE.md](../../tooling/cli/CLAUDE.md)
