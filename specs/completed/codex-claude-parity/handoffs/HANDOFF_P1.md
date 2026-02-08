# Handoff: Phase 1 - Gap Analysis

> Context document for P1 execution after P0 discovery baseline completion.

---

## Working Context (<=2,000 tokens)

Current objective:

- Convert P0 inventory into an implementation-ready parity decision set for `.codex`.

P0 artifacts completed:

- `specs/codex-claude-parity/outputs/P0_BASELINE.md`
- `specs/codex-claude-parity/outputs/parity-capability-matrix.md`

Most important P0 findings to carry forward:

1. `.codex/` is absent.
2. `.claude` counts are measurement-sensitive (top-level vs recursive):
- `agents`: 29 recursive files
- `commands`: 13 recursive files
- `hooks`: 10 top-level entries, 34 recursive files
- `skills`: 60 top-level entries, 37 structured `SKILL.md` files
3. Highest parity risk is hook-driven behavior in `.claude/settings.json` + `.claude/hooks/**`.

Immediate P1 outputs:

- `specs/codex-claude-parity/outputs/P1_GAP_ANALYSIS.md`
- `specs/codex-claude-parity/outputs/parity-decision-log.md`

Blocking condition:

- Do not proceed to P2 until every `required` capability from matrix has classification and rationale.

---

## Episodic Context (<=1,000 tokens)

Completed in P0:

- Timestamped baseline inventory captured.
- Required capability set explicitly defined.
- Strategy seed labels applied (`direct-port`, `adaptation`, `investigate`).
- P1 open questions documented.

Carry-forward concern:

- If hook/runtime parity is assumed without proof, P2 may implement brittle or non-functional equivalents.

---

## Semantic Context (<=500 tokens)

Stable rules:

- `.claude/` is reference source of truth.
- `.codex/` is target implementation.
- Every non-direct mapping requires rationale.
- Every completed phase requires both handoff files.

P1 classification taxonomy (from master orchestration):

- `direct-port`
- `adaptation`
- `unsupported`
- `defer`

---

## Procedural Context (links only)

- `specs/codex-claude-parity/README.md`
- `specs/codex-claude-parity/MASTER_ORCHESTRATION.md`
- `specs/codex-claude-parity/RUBRICS.md`
- `specs/codex-claude-parity/outputs/P0_BASELINE.md`
- `specs/codex-claude-parity/outputs/parity-capability-matrix.md`

---

## P1 Priority Questions

1. Which hook behaviors are required for acceptance, and which can be documented as manual workflow substitutions?
2. What is the canonical skill parity denominator (60 entries vs 37 structured skills)?
3. How should `agents-manifest.yaml` be represented in Codex (direct artifact vs guidance mapping)?
4. Which source files are safe symlink candidates versus copy-required due to tool syntax drift?

---

## Exit Criteria

- [ ] Every `required` capability classified (`direct-port` / `adaptation` / `unsupported` / `defer`)
- [ ] All non-direct mappings include rationale + mitigation
- [ ] Symlink portability criteria and fallback copy rules documented
- [ ] P2 prerequisites are explicit and actionable
- [ ] P2 handoff pair created
