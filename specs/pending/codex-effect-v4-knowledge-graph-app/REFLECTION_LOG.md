# Reflection Log: Codex Effect v4 Knowledge Graph App

Cumulative learnings across this spec lifecycle.

---

## P0: Spec Scaffolding, Canonicalization, and Review (2026-02-22)

**What worked:**
- Starting from local completed-spec patterns (README + quick navigation + phase tables + ADRs + risk/dependency/verification sections) made the spec easier to execute and review.
- Separating research notes from implementation spec kept architecture decisions clean and auditable.
- Locking the private-beta auth model early removed unnecessary tenant complexity.

**What we learned:**
1. For this objective, tenant/user graph partitioning adds complexity without clear beta value.
2. A shared toolkit across chat and graph retrieval services is a strong reliability constraint that prevents API drift.
3. For this private beta, auth simplicity is important, but proof-of-email ownership matters more than zero-DB purity.
4. Canonical spec shape materially improves handoff and execution readiness.

**Decisions captured:**
- AD-001 through AD-010 in `README.md`.

**Remaining follow-through:**
- Implement P1 foundation and validate allowlist enforcement with tests before moving to ingestion/runtime features.

## P0 Addendum: Canonical Pattern Hardening (2026-02-22)

**What changed:**
- Re-reviewed a broader completed-spec corpus and extracted dominant section patterns.
- Normalized `README.md` to explicit problem/solution/goals/non-goals/required-outputs structure.
- Added full `handoffs/` continuity (`HANDOFF_P1..P6` + `P1..P6_ORCHESTRATOR_PROMPT.md`).

**What we learned:**
1. Canonical quality is not just section headings; it also requires explicit orchestration continuity.
2. Multi-phase specs are materially easier to resume when each phase has both context handoff and copy-paste prompt.
3. A dedicated canonical-audit artifact reduces ambiguity during later spec reviews.

## P0 Addendum: Auth Re-Decision (2026-02-22)

**What changed:**
- Revisited auth design and switched to Better Auth magic-link + Drizzle + Neon.
- Kept server-side allowlist enforcement as the core gate for all protected routes.

**Why:**
1. Magic-link flow provides proof-of-email ownership while preserving a simple beta UX.
2. Neon + Drizzle setup remains lightweight enough for v1 while improving security posture.
