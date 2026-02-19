# R16 Gaps Audit: TodoX WM Knowledge MVP

Scope: audit the existing spec bundle under `specs/pending/todox-wealth-mgmt-knowledge-mvp` against the stated goals (Gmail -> Documents -> Knowledge graph -> Evidence -> TodoX demo) and the user constraints (apps/server owns auth+gmail, providerAccountId required, thread aggregation planned P0).

I do not see a flaw in the request itself. The requested scope and outputs are concrete, and the spec bundle includes the relevant artifacts needed to audit (README, R0/R3/R4/R7/R8/R9/R10/R11/R12, P0/P1), so this is actionable without extra input.

## Update (2026-02-09)

The following gaps called out below have since been addressed in the authoritative plan/contracts:

- Thread aggregation is now explicitly scheduled as `PR2B` in `outputs/P1_PR_BREAKDOWN.md`.
- Multi-account selection and `providerAccountId` enforcement is now explicitly scheduled as `PR2A` in `outputs/P1_PR_BREAKDOWN.md`.
- Meeting-prep evidence persistence is now treated as a demo requirement (`PR5`), and `/knowledge` UI (`PR4`) is blocked on `PR3 + PR5`.
- `Evidence.List` is now locked as a canonical contract in `outputs/P0_DECISIONS.md` (C-02), including `documentVersionId` per C-05.

## Critical Gaps

1. Thread aggregation is planned but not locked or scheduled in P0/P1.
   - Constraint: thread aggregation planned P0.
   - Reality: R10 defines the aggregation design, but P0 decisions do not lock it and P1 PR breakdown has no PR for it. The demo narrative expects thread-level context for meeting prep and evidence continuity, so this is a direct gap.

2. Multi-account selection and providerAccountId handling are not enforced end-to-end.
   - Constraint: providerAccountId required.
   - Reality: D-03 locks providerAccountId = IAM account.id, but R11 shows AuthContext OAuth APIs still accept only {providerId, userId} and pick the first account, which is ambiguous and can pull data from the wrong account. The spec does not include a PR to add account selection and org-level connection records, so providerAccountId is not actually enforced.

3. Meeting-prep evidence persistence is deferred, but the MVP requires persisted evidence.
   - Goal: Evidence and meeting prep are grounded in persisted evidence for the demo.
   - Reality: README and R0 require evidence for meeting-prep bullets, but P1 puts meeting-prep evidence persistence in PR5 (P2 hardening). That defers a core demo requirement (persisted evidence for meeting prep) beyond the MVP phase.

4. Auth + Gmail ownership by apps/server is not reflected in the plan.
   - Constraint: apps/server owns auth+gmail.
   - Reality: the plan discusses IAM and integrations slices, but P1 does not explicitly call out runtime server mounting or the apps/server ownership boundary (e.g., where the auth/gmail RPCs are exposed and how UI calls them). R4 notes missing runtime RPC wiring, but it is not turned into a PR gate tied to apps/server. This creates a deployment-level gap: the demo may work in isolation but not on the actual server entrypoint.

## Medium Gaps

1. Evidence.List contract drift (resolved).
   - This was true earlier (R8 vs R12 vs P0). It has since been resolved by locking C-02 in `outputs/P0_DECISIONS.md` (canonical shape includes `documentVersionId` and typed `source`), and aligning R8/R9/R12 and PR gates to it.

2. Document_source tombstone semantics vs thread aggregation stability (mitigated by PR gates).
   - D-07 locks strict uniqueness with tombstone/resurrect; R10 assumes thread aggregation uses message rows that keep stable ingest sequencing even when content changes.
   - This is now explicitly called out as a PR2B deliverable + acceptance gate in `outputs/P1_PR_BREAKDOWN.md` (do not duplicate messages; do not renumber `ingestSeq`).

3. Ontology registry wiring (resolved).
   - This is now scheduled as PR2C in `outputs/P1_PR_BREAKDOWN.md` with explicit acceptance gates (select ontology by id; unknown id fails typed).

4. Relation evidence backfill scheduling (resolved).
   - A best-effort migration/backfill step is now explicitly included as a PR3 deliverable in `outputs/P1_PR_BREAKDOWN.md` so legacy data does not break the demo.

## Low Gaps

1. D-13 storage posture says “AWS S3 only” while R0 also references GCP compute/IaC; this is inconsistent language but not demo-blocking.

2. R9 UI plan assumes a new /knowledge route, but the route decision is already locked in D-11; no conflict, just redundant wording.

3. R7 includes a `userId` column in document_source, but the main flow is org-scoped and keyed by providerAccountId. Not harmful, but it adds ambiguity about whether userId is required in all queries.

## Mapping to the Authoritative PR Plan

This report’s “next PRs” are now integrated into `outputs/P1_PR_BREAKDOWN.md`:

- Thread aggregation: PR2B
- Multi-account selection + `providerAccountId` enforcement: PR2A
- Meeting-prep evidence persistence (demo requirement): PR5
- Ontology registry wiring: PR2C
- Evidence.List canonicalization + relation evidence-of-record + backfill: PR3
- apps/server ownership boundary: enforced via PR0 acceptance gate + global rules (TodoX calls only `apps/server`)
