# editor-keyboard-shortcuts-qa (Phase 1)
> Quality assurance of all Lexical editor keyboard shortcuts in apps/todox

---

## Status
**SCAFFOLDING** - Bootstrapped spec with keyboard shortcut inventory. Ready for QA execution.

---

## Purpose
Systematic quality assurance of all keyboard shortcuts in the Lexical rich text editor (`apps/todox/src/app/lexical/`). The editor has 65+ keyboard shortcuts and triggers spanning custom shortcuts (ShortcutsPlugin), Lexical built-ins, AI assistant controls, markdown auto-transforms, and typeahead triggers. Each shortcut needs manual verification via browser automation to confirm it fires the correct action.

---

## Complexity Classification

| Factor | Value | Contribution |
|--------|-------|-------------|
| Phases | 1 | 2 |
| Agents | 1 | 3 |
| CrossPkg | 0 | 0 |
| ExtDeps | 0 | 0 |
| Uncertainty | 1 | 5 |
| Research | 1 | 2 |

**Classification: Simple** (12 points)

---

## Goals
1. Verify every registered keyboard shortcut fires its intended action
2. Identify broken, non-functional, or misbehaving shortcuts
3. Document platform-specific behavior (Mac vs Linux/Windows)
4. Produce a pass/fail report for each shortcut

---

## Non-Goals
- NOT implementing new shortcuts
- NOT refactoring the ShortcutsPlugin architecture
- NOT testing mouse-based toolbar interactions
- NOT testing mobile/touch interactions

---

## Deliverables
| Document | Purpose | Location |
|----------|---------|----------|
| keyboard-shortcuts-inventory.md | Complete shortcut catalog | outputs/ |
| qa-results.md | Pass/fail results per shortcut | outputs/ (TBD) |

---

## Phase Overview
| Phase | Description | Agent | Output |
|-------|-------------|-------|--------|
| **P0** | Inventory all shortcuts | Explore agent | keyboard-shortcuts-inventory.md |
| **P1** | QA each shortcut via browser | Claude in Chrome | qa-results.md |

---

## Success Criteria
- [ ] All shortcuts inventoried with source file references
- [ ] Each shortcut tested and marked pass/fail
- [ ] Broken shortcuts documented with reproduction steps

---

## References
- `apps/todox/src/app/lexical/plugins/ShortcutsPlugin/` - Custom shortcut definitions
- `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/` - AI panel shortcuts
- `apps/todox/src/app/lexical/plugins/MarkdownTransformers/` - Markdown auto-transforms
- `apps/todox/src/app/lexical/Editor.tsx` - Plugin composition
