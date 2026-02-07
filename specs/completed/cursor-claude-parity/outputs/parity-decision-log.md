# Parity Decision Log

Each required capability from the parity-capability-matrix has a final classification and rationale. P2 implementation must follow these decisions.

---

## Classification Legend

| Classification | Meaning | P2 Action |
|----------------|---------|-----------|
| **direct-port** | Reuse as-is or via existing sync | No new implementation; verify existing |
| **adaptation** | Same intent, Cursor-specific form | Implement in .cursor/ per P1 gap analysis |
| **unsupported** | No Cursor equivalent; cannot achieve | Document; exclude from parity scope |
| **defer** | Postpone; not blocking parity | Record rationale; revisit post-P3 |

---

## Required Capabilities — Decisions

### Instruction domain

| Capability | Classification | Rationale | Mitigation |
|------------|----------------|-----------|------------|
| core guardrails (general.md) | direct-port | Already synced via sync-cursor-rules | Maintain sync; no P2 change |
| behavioral | direct-port | Already synced | Maintain sync |
| Effect conventions (effect-patterns.md) | direct-port | Already synced | Ensure full sync; no truncation |
| code standards | direct-port | Already synced | Maintain sync |
| meta-thinking | direct-port | Already synced | Maintain sync |

---

### Skill catalog

| Capability | Classification | Rationale | Mitigation |
|------------|----------------|-----------|------------|
| Structured skills (37 in .claude) | adaptation | Cursor uses SKILL.md in dirs; format compatible. 9 required skills identified in P1 gap analysis | Port 9 required skills to .cursor/skills/; defer 28 with documented rationale |

---

### Command/workflow domain

| Capability | Classification | Rationale | Mitigation |
|------------|----------------|-----------|------------|
| spec lifecycle (new-spec, handoff) | adaptation | Cursor has no /command; map to skill + doc | Create "Spec Lifecycle" skill; document in .cursor/README.md |
| completion lifecycle (done-feature) | adaptation | Same | Create "Done Feature" skill |
| debug/explore/write-test | adaptation | Same | Create skill(s); 1 consolidated or 3 separate |

---

### Agent and workflow

| Capability | Classification | Rationale | Mitigation |
|------------|----------------|-----------|------------|
| Agent delegation registry | adaptation | Cursor has no 1:1 agent model; map intents to skills/rules | Update AGENTS.md with Cursor entry points; map tiers to skills |
| Session handoff | adaptation | Flow is tool-agnostic; paths/triggers need Cursor mapping | Create skill or doc; reference specs/ handoff patterns |
| Spec orchestration | direct-port | Largely tool-agnostic; spec exists | Document entry in .cursor/README.md; no new artifact |

---

### Context and safety

| Capability | Classification | Rationale | Mitigation |
|------------|----------------|-----------|------------|
| Context discoverability | adaptation | AGENTS.md exists; no .cursor-specific index | Create .cursor/README.md with index and pointers |
| Safety permissions | adaptation | Cursor mechanism TBD; preserve critical denies | Document in .cursor/README.md; adapt if Cursor has permission config |

---

### Verification

| Capability | Classification | Rationale | Mitigation |
|------------|----------------|-----------|------------|
| Verification (scenario suite) | direct-port | Define and run in P3; evidence in P3_VALIDATION_REPORT | No P2 action; P3 executes scenario suite |

---

## Optional Capabilities — Decisions

| Capability | Classification | Rationale | Mitigation |
|------------|----------------|-----------|------------|
| Skill catalog (flat .md) | defer | Absorb into rules/docs or skip; low priority | P2: skip; revisit if gaps emerge |
| modules/context | defer | Lower priority; AGENTS.md covers discovery | Document in .cursor/README.md; defer skill creation |
| Pattern library (code-smells, dangerous) | defer | May embed in rules/skills | P2: skip; optional per matrix |
| Hook orchestration | defer | Cursor lifecycle unknown | Do not block parity |
| Self-healing / skill-suggester | defer | High behavior risk; optional | Do not block parity |

---

## Summary

| Classification | Count (required) | Count (optional) |
|----------------|------------------|------------------|
| direct-port | 8 | 0 |
| adaptation | 7 | 0 |
| unsupported | 0 | 0 |
| defer | 0 | 5 |

**Blocking condition satisfied**: Every required capability has a classification and rationale. No critical blockers.

---

## P2 Readiness

- [x] All required capabilities classified
- [x] Every non-direct mapping has rationale and mitigation
- [x] P2 implementation prerequisites documented in P1_GAP_ANALYSIS.md
- [x] P2 handoff pair populated (HANDOFF_P2 Episodic Context)

Proceed to P2.
