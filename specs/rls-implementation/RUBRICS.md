# Evaluation Rubrics: RLS Implementation

> Criteria for evaluating each phase of the RLS implementation spec.

---

## Phase 0: Research & Discovery

### Completeness (40%)

| Score | Criteria |
|-------|----------|
| 4 | All org-scoped tables identified; all research topics covered |
| 3 | Most tables identified; research has minor gaps |
| 2 | Significant tables missing; research incomplete |
| 1 | Major gaps in table inventory or research |

### Accuracy (30%)

| Score | Criteria |
|-------|----------|
| 4 | Research findings are technically accurate and verified |
| 3 | Minor inaccuracies or unverified claims |
| 2 | Some incorrect information that could affect design |
| 1 | Significant errors in research findings |

### Provider Evaluation (30%)

| Score | Criteria |
|-------|----------|
| 4 | Thorough comparison with clear recommendation |
| 3 | Good comparison but recommendation unclear |
| 2 | Superficial comparison of providers |
| 1 | Provider evaluation missing or inadequate |

---

## Phase 1: Design & Architecture

### Policy Design (35%)

| Score | Criteria |
|-------|----------|
| 4 | Clear, consistent policy naming; granularity justified |
| 3 | Policy design is adequate but could be cleaner |
| 2 | Policy design has inconsistencies |
| 1 | Policy design is unclear or incomplete |

### Service Architecture (35%)

| Score | Criteria |
|-------|----------|
| 4 | TenantContext service follows Effect patterns; well-documented |
| 3 | Service design is correct but documentation lacking |
| 2 | Service design has issues with Effect patterns |
| 1 | Service design does not follow codebase patterns |

### Migration Templates (30%)

| Score | Criteria |
|-------|----------|
| 4 | Templates are reusable, well-documented, cover all cases |
| 3 | Templates work but missing edge cases |
| 2 | Templates have errors or are incomplete |
| 1 | Templates missing or non-functional |

---

## Phase 2: IAM Slice Implementation

### RLS Migration (40%)

| Score | Criteria |
|-------|----------|
| 4 | All IAM org-scoped tables have correct RLS policies |
| 3 | Most tables covered; minor issues in policies |
| 2 | Significant tables missing RLS |
| 1 | Migration fails or is fundamentally broken |

### TenantContext Service (35%)

| Score | Criteria |
|-------|----------|
| 4 | Service implemented, tested, integrated correctly |
| 3 | Service works but integration incomplete |
| 2 | Service has bugs or doesn't follow patterns |
| 1 | Service missing or non-functional |

### Build Verification (25%)

| Score | Criteria |
|-------|----------|
| 4 | `bun run check` and `bun run db:migrate` pass |
| 3 | Minor warnings but builds succeed |
| 2 | Some packages fail to build |
| 1 | Build failures across multiple packages |

---

## Phase 3: Shared Utilities & Test Helpers

### Test Utilities (40%)

| Score | Criteria |
|-------|----------|
| 4 | Comprehensive test helpers for RLS verification |
| 3 | Basic test helpers work but coverage limited |
| 2 | Test helpers have issues or are incomplete |
| 1 | Test helpers missing or broken |

### Integration Tests (40%)

| Score | Criteria |
|-------|----------|
| 4 | Tests verify tenant isolation across all scenarios |
| 3 | Tests cover main scenarios but miss edge cases |
| 2 | Tests are incomplete or have failures |
| 1 | Integration tests missing or all failing |

### Export Structure (20%)

| Score | Criteria |
|-------|----------|
| 4 | TenantContext properly exported; follows conventions |
| 3 | Exports work but organization could improve |
| 2 | Export issues causing import problems |
| 1 | Critical export missing |

---

## Phase 4: Documentation

### Pattern Documentation (50%)

| Score | Criteria |
|-------|----------|
| 4 | Clear, complete guide for adding RLS to new slices |
| 3 | Guide is useful but missing some details |
| 2 | Guide is incomplete or unclear |
| 1 | Documentation missing or unhelpful |

### AGENTS.md Updates (30%)

| Score | Criteria |
|-------|----------|
| 4 | All relevant AGENTS.md files updated with RLS guidance |
| 3 | Most files updated but some missing |
| 2 | Updates are incomplete or incorrect |
| 1 | No AGENTS.md updates made |

### Troubleshooting Guide (20%)

| Score | Criteria |
|-------|----------|
| 4 | Comprehensive troubleshooting for common issues |
| 3 | Basic troubleshooting but gaps exist |
| 2 | Troubleshooting is minimal |
| 1 | No troubleshooting guide |

---

## Phase 5: Verification & Performance

### Test Coverage (40%)

| Score | Criteria |
|-------|----------|
| 4 | All RLS scenarios tested; 100% pass rate |
| 3 | Most scenarios tested; minor failures |
| 2 | Significant test gaps or failures |
| 1 | Tests failing or missing |

### Performance (30%)

| Score | Criteria |
|-------|----------|
| 4 | RLS impact measured; within acceptable limits |
| 3 | Performance measured but borderline acceptable |
| 2 | Performance degradation detected |
| 1 | Performance not measured or severe degradation |

### Final Checklist (30%)

| Score | Criteria |
|-------|----------|
| 4 | All success criteria met; ready for other slices |
| 3 | Most criteria met; minor items outstanding |
| 2 | Several criteria not met |
| 1 | Major success criteria missing |

---

## Overall Scoring

| Total Score | Rating |
|-------------|--------|
| 3.5 - 4.0 | Excellent |
| 2.5 - 3.4 | Good |
| 1.5 - 2.4 | Needs Improvement |
| < 1.5 | Unsatisfactory |

---

## Security Rubric (Cross-Phase)

### RLS Policy Security (Critical)

| Score | Criteria |
|-------|----------|
| PASS | Policies correctly isolate tenant data; no leakage possible |
| FAIL | Any scenario where cross-tenant data access is possible |

**Note**: Security is pass/fail. Any identified vulnerability blocks spec completion.

### Session Context Security

| Score | Criteria |
|-------|----------|
| PASS | Session context cannot be manipulated by client |
| FAIL | Client can influence session context to access other tenants |

### Bypass Mechanism Security

| Score | Criteria |
|-------|----------|
| PASS | Admin bypass is properly controlled and audited |
| FAIL | Bypass mechanism could be exploited for unauthorized access |
