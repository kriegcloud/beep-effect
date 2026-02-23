# cursor-claude-parity Quick Start

> Deterministic startup path for a fresh Cursor (or Claude/Codex) session.

---

## 1. Preflight

```bash
pwd
ls -la specs/cursor-claude-parity
```

Required files:

- `README.md`
- `MASTER_ORCHESTRATION.md`
- `RUBRICS.md`
- `AGENT_PROMPTS.md`
- `REFLECTION_LOG.md`
- `handoffs/`
- `outputs/`

---

## 2. Read Order

1. `specs/cursor-claude-parity/README.md`
2. `specs/cursor-claude-parity/handoffs/HANDOFF_P0.md`
3. `specs/cursor-claude-parity/handoffs/P0_ORCHESTRATOR_PROMPT.md`
4. `specs/cursor-claude-parity/MASTER_ORCHESTRATION.md`
5. `specs/cursor-claude-parity/RUBRICS.md`

---

## 3. Phase Selection

| Current State | Next Phase |
|---------------|------------|
| No outputs | P0 |
| P0 outputs done, no P1 outputs | P1 |
| P1 done, `.cursor/` not implemented | P2 |
| `.cursor/` implemented, no validation | P3 |
| Validation done, cleanup remains | P4 |

---

## 4. P0 Skeleton

```bash
find .cursor -type f | sort
find .claude -maxdepth 2 -type d | sort
find .codex -maxdepth 2 -type d | sort
ls -1 .cursor/rules | wc -l
ls -1 .cursor/skills | wc -l
ls -1 .claude/skills | wc -l
```

---

## 5. Output Contract

| Phase | Required Files |
|-------|----------------|
| P0 | `outputs/P0_BASELINE.md`, `outputs/parity-capability-matrix.md` |
| P1 | `outputs/P1_GAP_ANALYSIS.md`, `outputs/parity-decision-log.md` |
| P2 | `outputs/P2_IMPLEMENTATION_REPORT.md` + `.cursor/**` |
| P3 | `outputs/P3_VALIDATION_REPORT.md`, `outputs/parity-scorecard.md` |
| P4 | `outputs/P4_HARDENING.md` + reflection update |

---

## 6. Handoff Discipline

Each completed phase must produce both:

- `handoffs/HANDOFF_P[N].md`
- `handoffs/P[N]_ORCHESTRATOR_PROMPT.md`

---

## 7. First Session Done

- [ ] Current phase identified
- [ ] Required outputs produced
- [ ] Next-phase handoff pair created
- [ ] `REFLECTION_LOG.md` updated
