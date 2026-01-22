# Evaluation Rubrics: Todox Design

> Measurable criteria for evaluating spec execution quality.

---

## Overall Spec Quality

### Structure Compliance (0-100)

| Score | Criteria |
|-------|----------|
| 100 | All required files present, follows spec template exactly |
| 80 | All required files present, minor deviations |
| 60 | Missing optional files, structure mostly correct |
| 40 | Missing required files or significant deviations |
| 20 | Incomplete structure |
| 0 | No recognizable spec structure |

**Required Files**:
- README.md
- REFLECTION_LOG.md
- MASTER_ORCHESTRATION.md
- QUICK_START.md
- handoffs/P0_ORCHESTRATOR_PROMPT.md

**Optional Files**:
- AGENT_PROMPTS.md
- RUBRICS.md
- templates/*
- outputs/*

---

## Phase Execution Quality

### P0: Foundation (0-100)

| Dimension | Weight | Criteria |
|-----------|--------|----------|
| Schema Design | 30% | RLS policies complete, org_id on all tables |
| PowerSync Spike | 30% | Sync demonstrated, patterns documented |
| FlexLayout Plan | 20% | Clear migration path, component mapping |
| Documentation | 20% | Outputs generated, REFLECTION_LOG updated |

**Scoring**:
- 90-100: All dimensions fully addressed, no issues
- 70-89: All dimensions addressed, minor gaps
- 50-69: Some dimensions incomplete
- <50: Significant gaps

### P1: WorkSpaces (0-100)

| Dimension | Weight | Criteria |
|-----------|--------|----------|
| Domain Model | 25% | Entities defined with Effect Schema |
| Tables | 25% | Tables created, RLS policies, migrations |
| Server Handlers | 25% | CRUD operations, permission checks |
| Tests | 25% | Unit + integration coverage |

### P2: FlexLayout (0-100)

| Dimension | Weight | Criteria |
|-----------|--------|----------|
| Layout Component | 30% | FlexLayout integrated, tabs work |
| Persistence | 30% | Layout saves/restores <100ms |
| Route Migration | 20% | Root route uses FlexLayout |
| Responsiveness | 20% | Mobile/desktop breakpoints |

### P3: Email (0-100)

| Dimension | Weight | Criteria |
|-----------|--------|----------|
| OAuth Flow | 25% | Gmail OAuth complete, tokens stored |
| Email Sync | 30% | Emails sync, incremental updates |
| AI Extraction | 25% | Action items extracted |
| Client Linking | 20% | Emails linked to clients |

### P4: Agent Framework (0-100)

| Dimension | Weight | Criteria |
|-----------|--------|----------|
| Domain Model | 20% | Agent config, permissions defined |
| MCP Servers | 30% | Tools respond correctly |
| Runtime | 30% | Agents execute with context |
| Audit Logging | 20% | Executions logged |

---

## Code Quality Rubrics

### Effect Pattern Compliance (0-100)

| Score | Criteria |
|-------|----------|
| 100 | All namespace imports, Effect.gen everywhere, no async/await |
| 80 | Mostly compliant, 1-2 minor violations |
| 60 | Some violations, async/await in isolated places |
| 40 | Significant violations, mixed patterns |
| 20 | Minimal compliance |
| 0 | No Effect patterns |

**Mandatory Checks**:
- [ ] Namespace imports: `import * as Effect from "effect/Effect"`
- [ ] Schema decoding: `yield* S.decodeUnknown(Schema)(data)`
- [ ] Error handling: `IamError.fromUnknown` or equivalent
- [ ] No `any` types
- [ ] No `@ts-ignore`

### @effect/ai Integration (0-100)

| Score | Criteria |
|-------|----------|
| 100 | All tools use Effect Schema, McpServer pattern, Effect.gen handlers |
| 80 | Mostly compliant, minor schema gaps |
| 60 | Some tools use Effect Schema |
| 40 | Mixed patterns |
| 0 | No @effect/ai usage |

**Mandatory Checks**:
- [ ] Tool parameters are Effect Schema
- [ ] Tool handlers use Effect.gen
- [ ] No Zod or manual type definitions
- [ ] McpServer.tool pattern used

### Multi-Tenancy Compliance (0-100)

| Score | Criteria |
|-------|----------|
| 100 | All tables have org_id, RLS complete, sync rules match |
| 80 | All tables have org_id, RLS mostly complete |
| 60 | Most tables have org_id, some RLS gaps |
| 40 | Significant gaps in isolation |
| 0 | No multi-tenancy implementation |

**Mandatory Checks**:
- [ ] org_id on ALL tenant-scoped tables
- [ ] RLS policy on each table
- [ ] SET LOCAL app.current_org_id in session
- [ ] PowerSync sync rules filter by org_id

---

## Documentation Quality

### REFLECTION_LOG.md (0-100)

| Score | Criteria |
|-------|----------|
| 100 | Entry after each phase, patterns extracted, improvements applied |
| 80 | Entries exist, some patterns extracted |
| 60 | Basic entries, minimal analysis |
| 40 | Sparse entries |
| 0 | Empty or missing |

### Handoff Quality (0-100)

| Score | Criteria |
|-------|----------|
| 100 | Follows HANDOFF_STANDARDS.md, source verification, complete schemas |
| 80 | Mostly follows standards, minor gaps |
| 60 | Basic handoff, missing some details |
| 40 | Incomplete handoff |
| 0 | Missing or unusable |

---

## Verification Checklist

### Per-Phase Verification

```bash
# Type check
bun run check --filter @beep/[package]

# Lint
bun run lint:fix --filter @beep/[package]

# Tests
bun run test --filter @beep/[package]
```

### Spec-Level Verification

Run spec-reviewer agent:
```
Use spec-reviewer agent to evaluate specs/todox-design/

Check:
- Structure compliance
- Effect pattern compliance
- Documentation quality
- Handoff completeness
```

---

## Scoring Summary

| Area | Weight | Target Score |
|------|--------|--------------|
| Structure Compliance | 15% | >80 |
| Phase Execution | 40% | >70 per phase |
| Code Quality | 25% | >80 |
| Documentation | 20% | >70 |

**Overall Target**: 75+ average across all areas
