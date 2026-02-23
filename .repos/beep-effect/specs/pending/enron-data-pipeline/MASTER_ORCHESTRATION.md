# Master Orchestration: Enron Data Pipeline

> Full workflow orchestration for the 6-phase Enron data pipeline spec.

---

## Workflow State Machine

```
P0 (Research) ──guard: outputs exist──> P1 (Parsing Infrastructure)
                                         │
                                         guard: check + test pass
                                         │
                                         v
                                        P2 (Subset Curation)
                                         │
                                         guard: curated subset in S3
                                         │
                                         v
                                        P3 (CLI Loader)
                                         │
                                         guard: `enron download` works
                                         │
                                         v
                                        P4 (Knowledge Integration)
                                         │
                                         guard: extraction produces entities
                                         │
                                         v
                                        P5 (Meeting Prep Validation)
                                         │
                                         guard: evidence chains validate
                                         │
                                         v
                                        COMPLETE
```

**Critical Path**: P0 -> P1 -> P2 -> P3 -> P4 -> P5 (strictly sequential)
**Parallelizable**: None (each phase depends on previous output)

---

## Phase Transition Guards

### P0 -> P1: Research Complete

| Guard | Check |
|-------|-------|
| Raw dataset in S3 | `aws s3 ls s3://static.vaultctx.com/todox/test-data/enron/raw/` returns objects |
| Dataset evaluation | `outputs/dataset-evaluation.md` exists and has content |
| Library evaluation | `outputs/parsing-library-evaluation.md` exists and has content |
| Parsing library selected | Evaluation document contains explicit recommendation |
| Handoff created | `handoffs/HANDOFF_P1.md` and `handoffs/P1_ORCHESTRATOR_PROMPT.md` exist |

### P1 -> P2: Parsing Infrastructure Complete

| Guard | Check |
|-------|-------|
| Schemas defined | `tooling/cli/src/commands/enron/schemas.ts` exists |
| Parser builds | `bun run check --filter @beep/tooling-cli` passes |
| Tests pass | `bun run test --filter @beep/tooling-cli` passes |
| Thread reconstruction works | Test exercises real Enron email threading |
| Document bridge works | Test exercises EnronEmail -> TodoX document conversion |
| Handoff created | `handoffs/HANDOFF_P2.md` and `handoffs/P2_ORCHESTRATOR_PROMPT.md` exist |

### P2 -> P3: Curated Subset Ready

| Guard | Check |
|-------|-------|
| Curated JSON in S3 | `aws s3 ls s3://static.vaultctx.com/todox/test-data/enron/curated/` returns objects |
| Manifest exists | `s3://static.vaultctx.com/todox/test-data/enron/curated/manifest.json` accessible |
| Subset size correct | Manifest shows 1-5K messages |
| Scoring tests pass | Thread scoring algorithm has test coverage |
| Handoff created | `handoffs/HANDOFF_P3.md` and `handoffs/P3_ORCHESTRATOR_PROMPT.md` exist |

### P3 -> P4: CLI Loader Operational

| Guard | Check |
|-------|-------|
| Download works | `bun run repo-cli enron download` succeeds |
| Info works | `bun run repo-cli enron info` shows stats |
| Cache works | Second download uses cache (no S3 fetch) |
| Build passes | `bun run check --filter @beep/tooling-cli` passes |
| Tests pass | `bun run test --filter @beep/tooling-cli` passes |
| Handoff created | `handoffs/HANDOFF_P4.md` and `handoffs/P4_ORCHESTRATOR_PROMPT.md` exist |

### P4 -> P5: Extraction Pipeline Validated

| Guard | Check |
|-------|-------|
| Extraction runs | Harness processes curated subset without crashing |
| Entities produced | Extraction yields entities matching ontology classes |
| Relations produced | Extraction yields relations with valid predicates |
| Evidence spans valid | Spans map back to source text accurately |
| Results documented | `outputs/extraction-results.md` exists |
| Handoff created | `handoffs/HANDOFF_P5.md` and `handoffs/P5_ORCHESTRATOR_PROMPT.md` exist |

### P5 -> COMPLETE: Meeting Prep Validated

| Guard | Check |
|-------|-------|
| Briefings generated | 3-5 meeting prep briefings from Enron data |
| Evidence chains valid | Bullets link to source spans |
| Quality documented | `outputs/meeting-prep-quality.md` exists |
| REFLECTION_LOG final | All 6 phases have reflection entries |

---

## Context Budget Management

Each phase handoff must stay under the 4,000 token budget per the spec guide.

| Section | Token Budget | Content |
|---------|--------------|---------|
| Working Memory | <=2,000 | Current tasks, success criteria, blocking issues |
| Episodic Memory | <=1,000 | Previous phase summary, key decisions |
| Semantic Memory | <=500 | Constants (S3 paths, package names) |
| Procedural Memory | Links only | File path references, no inline content |

### Checkpoint Strategy

- **Per-phase checkpoint**: REFLECTION_LOG.md entry after each phase
- **Mid-phase checkpoint**: For phases with 5+ work items, checkpoint after task 3
- **Decision checkpoint**: Before any irreversible action (S3 upload, schema decision)

---

## Critical Decision Points

### D1: Dataset Format (P0)

**Decision**: Kaggle CSV vs CMU maildir vs HuggingFace pre-processed
**Current selection**: Kaggle CSV (single file, easier parsing)
**Fallback**: CMU maildir if Kaggle requires authentication
**Impact**: Affects P1 parser design (CSV column parsing vs maildir traversal)

### D2: Parsing Library (P0)

**Decision**: `mailparser` vs `postal-mime` vs `emailjs-mime-parser` vs custom
**Selection criteria**: TypeScript types, MIME handling, minimal dependencies
**Impact**: Affects P1 parser implementation, P3 CLI dependencies

### D3: Subset Size (P2)

**Decision**: Target message count within 1-5K range
**Constraints**: Must include diverse thread types (financial, action items, multi-party)
**Impact**: Affects P4 extraction runtime, P5 meeting prep coverage

### D4: Ontology Mapping (P4)

**Decision**: How Enron entities map to TodoX wealth management ontology
**Constraints**: Must produce entities compatible with existing `Entity`/`Relation` schemas
**Impact**: Affects extraction quality and meeting prep relevance

---

## Quality Gates

| Phase | Package | Type Check | Test | Additional |
|-------|---------|------------|------|------------|
| P1 | `@beep/tooling-cli` | `bun run check --filter @beep/tooling-cli` | `bun run test --filter @beep/tooling-cli` | - |
| P2 | `@beep/tooling-cli` | `bun run check --filter @beep/tooling-cli` | `bun run test --filter @beep/tooling-cli` | S3 upload verified |
| P3 | `@beep/tooling-cli` | `bun run check --filter @beep/tooling-cli` | `bun run test --filter @beep/tooling-cli` | CLI commands functional |
| P4 | `@beep/knowledge-server` | `bun run check --filter @beep/knowledge-server` | `bun run test --filter @beep/knowledge-server` | `bun run services:up` |
| P5 | `@beep/knowledge-server` | `bun run check --filter @beep/knowledge-server` | `bun run test --filter @beep/knowledge-server` | LLM API key configured |

---

## Recovery Procedures

### Phase Retry

If a phase fails its transition guards:
1. Review REFLECTION_LOG.md for the failed phase
2. Identify specific failing guard(s)
3. Create targeted fix tasks (do not re-execute entire phase)
4. Re-run only the failing guard checks

### Context Recovery

If an agent loses context mid-phase:
1. Read the current phase's `HANDOFF_P[N].md` for full context
2. Check `REFLECTION_LOG.md` for any mid-phase learnings
3. Resume from the last completed task within the phase

### Rollback

If a phase produces incorrect output:
1. S3 data: Re-upload corrected data (objects are overwritable)
2. Code: Git revert to pre-phase commit
3. Database: Re-run migrations after schema fix
