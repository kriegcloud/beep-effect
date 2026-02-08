# codex-claude-parity Quick Start

> Deterministic startup path for a fresh Codex session.

---

## 1. Preflight

```bash
pwd
ls -la specs/codex-claude-parity
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

1. `specs/codex-claude-parity/README.md`
2. `specs/codex-claude-parity/handoffs/HANDOFF_P0.md`
3. `specs/codex-claude-parity/handoffs/P0_ORCHESTRATOR_PROMPT.md`
4. `specs/codex-claude-parity/MASTER_ORCHESTRATION.md`
5. `specs/codex-claude-parity/RUBRICS.md`

---

## 3. Phase Selection

| Current State | Next Phase |
|---------------|------------|
| No outputs | P0 |
| P0 outputs done, no P1 outputs | P1 |
| P1 done, `.codex/` not implemented | P2 |
| `.codex/` implemented, no validation | P3 |
| Validation done, cleanup remains | P4 |

---

## 4. P0 Skeleton

```bash
find .claude -maxdepth 2 -type d | sort
ls -1 .claude/agents | wc -l
ls -1 .claude/skills | wc -l
ls -1 .claude/commands | wc -l
ls -1 .claude/rules | wc -l
ls -1 .claude/hooks | wc -l
ls -la .codex
```

If `.codex` is missing, treat as baseline fact.

---

## 5. Output Contract

| Phase | Required Files |
|------|----------------|
| P0 | `outputs/P0_BASELINE.md`, `outputs/parity-capability-matrix.md` |
| P1 | `outputs/P1_GAP_ANALYSIS.md`, `outputs/parity-decision-log.md` |
| P2 | `outputs/P2_IMPLEMENTATION_REPORT.md` + `.codex/**` |
| P3 | `outputs/P3_VALIDATION_REPORT.md`, `outputs/parity-scorecard.md` |
| P4 | `outputs/P4_HARDENING.md` + reflection update |

---

## 6. Handoff Discipline

Each completed phase must produce both:

- `handoffs/HANDOFF_P[N].md`
- `handoffs/P[N]_ORCHESTRATOR_PROMPT.md`

---

## 7. Context Budget

Per handoff file:

- Working <= 2,000 tokens
- Episodic <= 1,000 tokens
- Semantic <= 500 tokens
- Procedural links only
- Total <= 4,000 tokens

Estimate:

```bash
wc -w handoffs/HANDOFF_PN.md
```

---

## 8. Symlink Rule

Prefer symlinks to reduce duplication only when portable in your execution environment.
If not portable, use explicit copy strategy and document rationale in decision log.

---

## 9. First Session Done

- [ ] Current phase identified
- [ ] Required outputs produced
- [ ] Next-phase handoff pair created
- [ ] `REFLECTION_LOG.md` updated
