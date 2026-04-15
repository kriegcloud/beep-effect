# Effect Governance Replacement - Candidate Scorecard

## Status

**VALIDATED**

## Intended Use

Use this file during P2 to rank the validated shortlist before the final implementation plan is written.

## Fixed Scoring Rule

Use a `1` to `5` scale for each scored dimension unless a later phase records a justified exception in the manifest and the active phase artifact.

- `Default Steering Strength` weight: `0.30`
- `Parity Potential` weight: `0.25`
- `Performance Upside` weight: `0.20`
- `Operational Complexity` penalty weight: `0.10`
- `Maintenance Burden` penalty weight: `0.10`
- `Migration Risk` penalty weight: `0.05`
- `Generalizability` is a tie-breaker only and must not outrank the repo-local objective

Recommended weighted formula:

`score = 0.30*default_steering + 0.25*parity + 0.20*performance - 0.10*operational_complexity - 0.10*maintenance_burden - 0.05*migration_risk`

Validation gates outrank weighted score. A candidate can still be rejected even if its raw score is not the absolute lowest when it fails a parity blocker.

## Validated P1 Rows

| Candidate | Deployment Surface | Default Steering Strength | Parity Potential | Performance Upside | Operational Complexity | Maintenance Burden | Migration Risk | Weighted Score | P1 Status | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| Hybrid staged cutover: repo-local Biome diagnostics + repaired or expanded repo-local parity surfaces + allowlist-backed `no-native-runtime` runner + hook and instruction support | multi-surface | 5 | 5 | 4 | 4 | 4 | 3 | 2.60 | shortlist | validated frontrunner |
| Hybrid staged cutover accelerated by external `linteffect` seed plus repo-local overlays | multi-surface | 5 | 4 | 4 | 4 | 4 | 3 | 2.35 | shortlist | validated accelerator variant |
| Pure repo-local Biome-only replacement | Biome | 4 | 2 | 5 | 4 | 4 | 4 | 1.70 | rejected | strong component, not a credible sole answer |
| Hook-first steering stack using Claude or Codex hooks and repo-authored patterns | hooks | 4 | 1 | 4 | 3 | 3 | 2 | 1.55 | rejected | strong support layer, weak primary governance answer |
| Existing CLI and inventory stack only | repo-local CLI | 2 | 2 | 4 | 2 | 3 | 2 | 1.30 | rejected | `schema-first` is strong, but the other lanes are partial and default steering is too weak |
| External `linteffect` as a drop-in replacement | Biome | 3 | 1 | 4 | 3 | 3 | 3 | 1.20 | rejected | credible seed, not a drop-in |
| Skills, AGENTS, and specialist subagent registry only | instructions | 1 | 1 | 5 | 1 | 3 | 2 | 1.05 | rejected | advisory only, and some current guidance conflicts with the target steering direction |
| Repo-memory idiom search or recommendation CLI only | retrieval | 1 | 1 | 3 | 3 | 3 | 2 | 0.45 | rejected | useful substrate, not primary governance |

## P1 Reading Notes

- The validated frontrunner is still hybrid because P1 confirmed the current governance lane is already hybrid in practice and because `no-native-runtime` needs an explicit parity surface.
- `schema-first` survived by moving to a stronger existing inventory lane rather than by cloning its ESLint behavior.
- `effect-import-style` and `terse-effect-style` both fell from "credible exact CLI parity" to "partial parity that needs repair or expansion."
- The external reference repo survives only as an accelerator for the Biome layer, not as a primary replacement product.

## P2 Final Ranking

| Rank | Candidate | Final Planning Call |
|---|---|---|
| 1 | Hybrid staged cutover: repo-local Biome diagnostics + repaired or expanded repo-local parity surfaces + allowlist-backed `no-native-runtime` runner + hook and instruction support | chosen primary path |
| 2 | Hybrid staged cutover accelerated by external `linteffect` seed plus repo-local overlays | retain as optional reference only |
| 3 | Pure repo-local Biome-only replacement | rejected |
| 4 | Hook-first steering stack using Claude or Codex hooks and repo-authored patterns | rejected |
| 5 | Existing CLI and inventory stack only | rejected |
| 6 | External `linteffect` as a drop-in replacement | rejected |
| 7 | Skills, AGENTS, and specialist subagent registry only | rejected |
| 8 | Repo-memory idiom search or recommendation CLI only | rejected |

## P2 Decision Notes

- The repo-local hybrid path stays ranked first because root Biome already exists and because the repo-specific parity blockers still need deterministic repo-local surfaces.
- The external `linteffect` variant remains useful as inspiration, but it is no longer allowed to expand into a required dependency or vendored critical-path bundle for P3.
- The chosen execution target is staged cutover first, with final `full replacement` eligibility deferred to P4 evidence.
