# Gov/Legal Data Driver Codegen Plan

## Status

Status: `pending`

Current phase: **P0** (govinfo-finish + transformer-incubate).

## Phases

This wedge graduates as ONE cohesive multi-phase goal; the phases below are its
sequenced internal slices, not separate goal packets. P2 is **gated** on the
data/source-terms matrix (Q8 default-deny).

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 govinfo-finish + transformer-incubate | pending | Repair `@beep/govinfo` manifest (`@beep/identity` + `@beep/schema`); add hand-authored `Govinfo.service.ts` / `Govinfo.config.ts` (client/config/auth/retry/cache/rate-limit) on top of the existing `Search` contract + value models; **incubate the shared transformer inside govinfo** applied via `HttpApiClient.make`'s `transformClient`; api.data.gov `api_key` query-param auth via `Config.redacted("GOVINFO_API_KEY")`. | A recorded-response / fake-`HttpClient` test proves `X-RateLimit-*` parsing + limiter-state update + cache-hit-on-repeat (transport call-count == 1) **without live credentials**; the live `Search` round-trip (auth attached, value-model decode) is an optional manual check when `GOVINFO_API_KEY` is set; `bun run check --filter @beep/govinfo` green offline. |
| P1 keyless-driver + generator-spike | pending | Build the **2nd** driver (eCFR or FedReg) on the raw-client (`HttpClient.mapRequest`) path with **zero auth surface**, consuming the incubated transformer (the 2nd consumer that unlocks promotion); run the `@effect/openapi-generator` Swagger-2.0 normalization spike on eCFR's `api/v1.json` (**mandatory even if FedReg is the selected keyless driver**), recording dialect warnings; per-driver `scripts/generate.ts` + committed spec + package-private `src/_generated/*`. | Keyless driver builds network-free from its committed spec; the keyless `*.service.ts` consumes the transformer via `mapRequest` (grep-verifiable); eCFR spike warnings recorded; bespoke-renderer fallback decision documented; ≥2 named transformer consumers that actually import it exist. |
| P2 authed-drivers (GATED) | pending | CourtListener (Token-header) + DOL (`X-API-KEY`) auth families branched in the now-shared transformer; CourtListener caching **in-process/ephemeral only**; third-party legal content **excluded from committed fixtures**. | **GATED** on the data/source-terms matrix (required pre-shape research item, default-deny per Q8) + the metadata/auth-enforcement spike. Until the matrix file exists, default-deny is observable as: no committed CL/DOL fixtures, no persistent CL cache, no enabled CL/DOL exports. Do not start until the matrix exists. |
| P3 verify + promote | pending | Per-package generate-first audit + CI `git diff --exit-code` drift check **wired in committed CI config (grep-able), not just a local rerun**; pin exact versions in each codegen template; **promote the transformer to `foundation/capability/<name>`** with a README promotion record naming ≥2 current consumers that actually import it; closeout reflection. | Drift check green and wired in committed CI; promotion record names ≥2 grep-verified importers (the `07-non-slice-families` gate); reflection written and `bun run beep lint reflection-artifacts` passes. |

## P3 Closeout Checklist

Before marking the packet closed (and `status` → `completed-retained` / `complete`):

1. Write a closeout reflection via the `/reflect` skill (or copy
   `_template/history/reflections/_TEMPLATE.md`) to
   `history/reflections/<YYYY-MM-DD>-<agent>.md`. Critique the repo **tooling**
   (what worked, what didn't, what was frustrating, what you wished existed), the
   **implementation** (improvement opportunities), and the **goal/prompt** (would
   you revise it to be clearer/easier/more efficient?). Capture TODOs worth
   codifying. Its YAML frontmatter must validate against `ReflectionFrontmatter`.
2. Run `bun run beep lint reflection-artifacts` (this packet has
   `reflectionRequired: true`, so a missing/invalid reflection blocks closeout).
3. Update `README.md` (status, latest evidence) and `ops/manifest.json` phase
   statuses + `initiative.status`.
4. Confirm the transformer promotion record names ≥2 current consumers and the
   codegen-drift check is wired before closing.

## Execution Notes

- Preserve unrelated worktree changes.
- Keep `SPEC.md` normative and update it only when the contract changes.
- Keep this plan current; archive old run outputs under `history/`.
- Do NOT enter P2 before the data/source-terms matrix exists (Q8 default-deny).
- The `gov-legal-mcp` sibling server and any patents work are out of scope here.

## Verification Commands

```sh
test "$(wc -m < goals/gov-legal-data-driver-codegen/GOAL.md)" -le 4000
jq . goals/gov-legal-data-driver-codegen/ops/manifest.json
rg -n "gov-legal-data-driver-codegen|GOAL.md|agentLaunchers|packetAnchorDocument" goals/gov-legal-data-driver-codegen
git diff --check -- goals/gov-legal-data-driver-codegen
```
