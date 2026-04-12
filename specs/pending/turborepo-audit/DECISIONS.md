# Turborepo Audit Decisions

## Purpose

This file captures the implementation defaults and design choices agreed before the Turborepo audit artifacts were written. It exists so the per-topic files can stay focused on grounded findings instead of restating shared assumptions.

## Scope and Output Shape

- Audit support root: `specs/pending/turborepo-audit`
- Canonical topic outputs: `specs/pending/outputs/{topic-id}.md`
- Canonical summary output: `specs/pending/outputs/_turborepo-orchestrator-summary.md`
- Shared support doc: `specs/pending/turborepo-audit/OFFICIAL_TOPIC_SURFACE_MAP.md`
- This decisions log is intentionally separate from the orchestrator summary.
- The audit was initially drafted against a nested output folder during authoring, but the final deliverables were normalized into `specs/pending/outputs` to match the original output contract and avoid duplicate sources of truth.

## Locked Defaults

- Replacement bias: conservative. Recommend replacing bespoke repo tooling with first-party Turborepo features only when the Turbo path preserves correctness and clearly lowers maintenance burden.
- Package configuration bias: targeted package-level `turbo.json` adoption. Keep broad shared defaults in the root config and move package-specific task behavior, array overrides, or framework-specific details closer to the owning package.
- CI modernization bias: push hard toward modern affected-first workflows when the evidence supports it. Current `--filter=...[origin/main]` usage is audited as the baseline, not protected as the desired end state.
- Root command bias: keep a thin but stable root DX for the common entrypoints such as `build`, `check`, `test`, `lint`, and `dev`, while questioning specialty wrappers and root-only orchestration when Turbo or package-local scripts can own the work instead.
- Light-topic depth: readiness-oriented. Docker and multi-language topics still get full artifacts, but the analysis can focus on current stance, constraints, and future readiness when present usage is limited.
- Recommendation ordering: quick wins first, architecture second. Favor near-term CI/task/cache wins before broader structural cleanup.

## Research Rules

- Start with repo evidence, then validate claims against official Turborepo docs.
- Use exact repo file paths and exact commands wherever possible.
- Each topic artifact must include a score between `0` and `1`.
- A score of `1.0` should be rare and requires a clear preservation rationale.
- Any score below `1.0` must include a concrete, sequenced optimization plan.
- Tradeoffs must be explicit when relevant: speed, correctness, developer experience, CI cost, and maintenance burden.

## Source Rules

- Preferred official docs source for topic discovery: `https://turborepo.dev/llms.txt`
- Preferred official docs source for behavior guidance: canonical Turborepo docs URLs under `https://turborepo.dev/docs/...`
- Repo-local grounding should prioritize:
  - `turbo.json`
  - root `package.json`
  - `.github/workflows/check.yml`
  - `.github/workflows/release.yml`
  - `.github/workflows/data-sync.yml`
  - `syncpack.config.ts`
  - `biome.jsonc`
  - `docker-compose.yml`
  - package-level `turbo.json` files
  - UI toolchain files under `packages/common/ui`, `apps/editor-app`, and `apps/V2T`

## Execution Notes

- The platform caps concurrent agent threads at four, so worker execution may run in waves even though the audit design uses multiple topic owners.
- Graphiti memory status was healthy during this session, but fact search failed with a query-wrapper syntax error. Cross-session recall was therefore treated as unavailable and the audit proceeded with repo evidence plus official docs.
