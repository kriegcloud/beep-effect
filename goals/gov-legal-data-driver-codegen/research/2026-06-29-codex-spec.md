# Codex spec-gate critique — gov-legal-data-driver-codegen (2026-06-29)

## Blocking

- Verification Matrix is not a 1-to-1 verifier for the Acceptance Criteria. SPEC Acceptance Criteria #1-#9 (`SPEC.md` "Acceptance Criteria") require live govinfo behavior, transformer seam use, raw-client consumption, eCFR spike evidence, generated-output boundary checks, CI drift wiring, promotion README evidence, CourtListener/DOL gating, and no unrelated churn. The Verification Matrix only lists launcher size, manifest JSON, whitespace, `bun run check --filter @beep/govinfo`, local codegen rerun/diff, keyless build, and reflection lint (`SPEC.md` "Verification Matrix"). Concrete gaps:
  - AC #1 live `Search` with api.data.gov auth, `X-RateLimit-*` honored, and cache hit has no live or fake-transport verifier; the govinfo row only says `bun run check --filter @beep/govinfo` "Passes offline".
  - AC #2 transformClient application/importability has no static or runtime verifier.
  - AC #3 raw-client path and transformer consumption are only partially covered by "Keyless driver build"; build success does not prove `HttpClient.mapRequest` or transformer use.
  - AC #4 eCFR spike warnings and fallback decision have no verifier.
  - AC #5 generated output boundary has no verifier that inspects `src/_generated/*` for transport imports/wiring.
  - AC #6 requires a CI `git diff --exit-code` codegen-drift check, but the verifier is only a local rerun/diff and does not prove CI wiring.
  - AC #7 README promotion record naming >=2 consumers has no verifier; "Reflection at P3" maps to PLAN closeout, not the AC.
  - AC #8 CourtListener/DOL matrix gate has no verifier that checks for the matrix before build/cache/fixtures.
  - AC #9 no unrelated refactors/formatting churn is not verified by `git diff --check`; that only catches whitespace errors.
  Conversely, "Packet launcher size", "Manifest JSON", and "Reflection at P3" are useful operational checks but do not map to a SPEC acceptance criterion.

- Some Acceptance Criteria are not falsifiable enough as written. AC #1 says `X-RateLimit-*` must be "honored", but neither SPEC nor PLAN defines the observable behavior: parse headers, set limiter state, delay, retry, expose metadata, or assert call counts. AC #5 says "no transport leaks into `src/_generated/*`", but it does not define a banned import/symbol set. AC #8 allows CourtListener/DOL to remain "unbuilt (or default-deny)", but "default-deny" is not reduced to an observable state such as no persistent cache, no fixtures, no enabled exports, or failing config gate. AC #9 says "No unrelated refactors or formatting churn", which is reviewable but not a crisp pass/fail acceptance criterion without a diff-scope rule.

- The ODP/official-source constraint is weak and internally ambiguous. SPEC "Constraints" says "Official sources only; NEVER PatentsView" and then immediately treats CourtListener as in-scope by saying "CourtListener/DOL have no clean OpenAPI — any hand-authored spec is original repo work". SPEC "Target Surfaces" also includes `packages/drivers/{courtlistener,dol}` as gated targets, and PLAN P2 includes CourtListener work. DECISIONS Q8 explicitly says "CourtListener is not a US-Gov publisher" and may expose PACER/RECAP-sourced content. If the intended constraint is ODP-only data sourcing, SPEC "Constraints" needs to name the rule and the allowed exception/gate for CourtListener; as written, "Official sources only" conflicts with the later CourtListener scope.

## Advisory

- Objective and Non-Goals are broadly faithful to DECISIONS.md, but the "three auth families" wording is easy to over-read. SPEC "Objective" says the packet proves two reference verticals: govinfo and one keyless driver. The same Objective also requires "One shared, hand-authored transport transformer ... over three auth families". DECISIONS Q5 defines those families as CourtListener Token-header, GovInfo `api_key`, and DOL `X-API-KEY`; PLAN P2 places CourtListener and DOL behind the data/source-terms matrix. That is coherent if the whole multi-phase goal includes P2, but P0/P1 only prove api.data.gov plus keyless. Add phase-specific acceptance/verifiers for the Token-header and `X-API-KEY` branches, or explicitly state those branches are configured but not exercised until P2.

- P0 is mostly the smallest defensible vertical, but its proof surface needs tightening. PLAN P0 is bounded to govinfo manifest repair, `Govinfo.service.ts` / `Govinfo.config.ts`, and the `HttpApiClient.make` `transformClient` seam. That matches DECISIONS Q4 and avoids the keyless driver until P1. The risk is that P0 exit criteria require a "Live `Search`" with auth, rate-limit headers, and cache hit while also requiring offline `bun run check --filter @beep/govinfo`; add a fake-transport or recorded-response proof so cache/rate-limit behavior is testable without live credentials.

- License gravity is present but does not yet specify data-license propagation rules. SPEC "Constraints" says "License gravity (reimplement, don't copy)" and "Code/spec licensing != data/API-use terms — the latter is OPEN for CourtListener". DECISIONS Q8 names the matrix fields: data license, API ToS, commercial-use limits, caching/retention permission, redistribution/fixture rules, attribution, and source-of-authority caveat. The missing piece is where those terms must propagate after the matrix exists: fixture metadata, README warnings, package docs, generated artifacts, cache policy, or exported schemas. Add that to SPEC "Constraints" before P2.

- GOAL.md passes the size gate but is not fully standalone. The observed size is 3581 characters, so it satisfies the SPEC Verification Matrix launcher check (`test "$(wc -m < .../GOAL.md)" -le 4000`). It is readable as a launcher, but not standalone without SPEC because it says "Treat the packet files as the detailed contract" and its first Acceptance bullet is "`SPEC.md` acceptance criteria are satisfied". If GOAL.md is meant to be executable context by itself, inline the concrete SPEC acceptance bullets or a compact verifier map.

- The eCFR spike is not scope creep, but the conditional driver choice should be explicit. SPEC AC #3 allows "One keyless driver (eCFR or FedReg)", while AC #4 still requires the eCFR Swagger-2.0 generator spike. DECISIONS Q1 justifies that eCFR spike, and PLAN P1 includes it. To prevent an implementer choosing FedReg and skipping eCFR evidence, state that the eCFR spike is mandatory even if FedReg is the selected keyless driver.

## Confirmed sound

- All four requested files existed and were read in full: `SPEC.md`, `PLAN.md`, `GOAL.md`, and `explorations/.../DECISIONS.md`.

- Objective and Non-Goals are mostly coherent and faithful to resolved decisions. SPEC Objective/Non-Goals match Q1 tiered codegen, Q2 generated boundary, Q3 MCP deferral, Q4 govinfo first and keyless second, Q5 shared transformer over three auth families, Q6 incubate-then-promote, Q7 per-package drift checking/no global turbo edge, and Q8 default-deny CourtListener data terms.

- MCP server scope is correctly deferred. SPEC Non-Goals says `packages/drivers/gov-legal-mcp` is a follow-on gated behind >=2 proven drivers, SPEC Stop Conditions block MCP leakage into v1, PLAN Execution Notes keep it out of scope, and DECISIONS Q3 resolves it as "DEFERRED ... NOT in the v1 graduation slice".

- CourtListener caching before the matrix is explicitly blocked. SPEC Non-Goals forbids "CourtListener caching or third-party-content fixtures" before the matrix, SPEC Stop Conditions stop work if CourtListener/DOL are reached before the matrix, PLAN P2 is gated on the matrix, and DECISIONS Q8 sets default-deny with ephemeral-only caching and no committed third-party fixtures.

- The offline/air-gap build constraint is present. SPEC "Constraints" says download is codegen-only and committed spec + `_generated/` make build/check network-free; PLAN P1 requires the keyless driver to build network-free from committed spec; PLAN P3 requires drift checking rather than a global build-codegen edge.

- The >=2-consumer transformer graduation gate is present. SPEC "Constraints" requires ">=2 named consumers currently importing" at PR review, SPEC AC #7 requires a README promotion record naming >=2 current consumers, PLAN P3 repeats the same importers/promotion record exit criteria, and DECISIONS Q6 resolves the incubate-then-promote path.

- GOAL.md is under the 4000-character launcher limit. `wc -m goals/gov-legal-data-driver-codegen/GOAL.md` returned `3581`, and the GOAL includes repo, outcome, scope, workflow, acceptance summary, verification commands, stop conditions, launch text, and done condition.
