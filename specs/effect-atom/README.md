# Effect Atom Skill Specification

## Purpose

Create a Claude Code skill that teaches correct usage of `@effect-atom/atom-react`, explicitly preventing confusion with `jotai` due to naming similarity.

### Problem Statement

Claude Code frequently misapplies jotai patterns when working with `@effect-atom/atom-react`:

| Incorrect (jotai)   | Correct (effect-atom)                     |
|---------------------|-------------------------------------------|
| `useAtom(atom)`     | `useAtomValue(atom)` / `useAtomSet(atom)` |
| `atom()` primitive  | `Atom.make()` for atom creation           |
| Derived atoms       | `Atom.make((get) => ...)`                 |
| No runtime required | `Atom.context()` for runtime creation     |

The skill must explicitly contrast these libraries and demonstrate correct patterns from the beep-effect codebase.

## Success Criteria

- [ ] Skill created at `.claude/skills/effect-atom.md`
- [ ] Passes code-reviewer validation (no hallucinated APIs)
- [ ] Passes architecture-pattern-enforcer validation
- [ ] Contains explicit jotai vs effect-atom comparison table
- [ ] Includes real codebase examples from `packages/shared/client/src/atom/*`

## Phase Overview

| Phase | Description                  | Status   | Outputs                                                                   |
|-------|------------------------------|----------|---------------------------------------------------------------------------|
| 0     | Scaffold spec structure      | Complete | `README.md`, directories                                                  |
| 1     | Parallel research (4 agents) | Complete | `outputs/*.md` (4 files)                                                  |
| 2     | Synthesis                    | Complete | `outputs/SYNTHESIS.md`                                                    |
| 3     | Validation review            | Complete | `outputs/*-review.md`                                                     |
| 4     | Create spec documents        | Complete | `PLAN.md`, `handoffs/HANDOFF_P1.md`, `handoffs/P1_ORCHESTRATOR_PROMPT.md` |
| 5     | Spec review                  | Complete | `outputs/spec-review.md`                                                  |
| 6     | Address issues               | Complete | Updated documents                                                         |
| 7     | Reflection                   | Complete | `REFLECTION_LOG.md`                                                       |
| 8     | Skill implementation test    | Complete | `IMPROVEMENT_NOTES.md`, reCAPTCHA atoms refactor                          |
| 9     | Type safety refactor         | Pending  | `handoffs/HANDOFF_P2.md` - Remove unsafe `as` assertions                  |

## External Research Targets

| Source        | URL                                                                               |
|---------------|-----------------------------------------------------------------------------------|
| README        | https://raw.githubusercontent.com/tim-smart/effect-atom/refs/heads/main/README.md |
| Source Code   | https://github.com/tim-smart/effect-atom                                          |
| NPM Package   | https://www.npmjs.com/package/@effect-atom/atom-react                             |
| API Reference | https://tim-smart.github.io/effect-atom/docs/atom-react                           |

## Codebase Research Targets

| Location                                              | Purpose                                  |
|-------------------------------------------------------|------------------------------------------|
| `packages/runtime/client/src/services/ka-services.ts` | `useAtomMount` & `makeAtomRuntime` usage |
| `packages/runtime/client/src/runtime.ts`              | `makeAtomRuntime` definition             |
| `packages/shared/client/src/atom/*`                   | Exhaustive usage patterns                |

## Directory Structure

```
specs/effect-atom/
├── README.md              # This file
├── REFLECTION_LOG.md      # Session learnings
├── PLAN.md                # Implementation plan (Phase 4)
├── IMPROVEMENT_NOTES.md   # Skill improvement notes (Phase 8)
├── outputs/
│   ├── external-research.md      # Phase 1
│   ├── atom-module-analysis.md   # Phase 1
│   ├── runtime-analysis.md       # Phase 1
│   ├── effect-patterns.md        # Phase 1
│   ├── SYNTHESIS.md              # Phase 2
│   ├── synthesis-review.md       # Phase 3
│   ├── architecture-review.md    # Phase 3
│   └── spec-review.md            # Phase 5
├── handoffs/
│   ├── HANDOFF_P1.md             # Skill implementation handoff
│   ├── P1_ORCHESTRATOR_PROMPT.md # Implementation prompt
│   └── HANDOFF_P2.md             # Type safety refactor handoff
└── templates/             # Reusable templates
```

## Final Skill Output Location

`.claude/skills/effect-atom.md`
