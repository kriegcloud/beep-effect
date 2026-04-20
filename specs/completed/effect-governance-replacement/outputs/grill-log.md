# Effect Governance Replacement - Grill Log

## Locked Decisions

### 2026-04-15

- Optimize first for immediate behavior change in `beep-effect`, then score generalizability second.
- Rank ideas partly by how much they reduce reliance on agent opt-in.
- Require execution-ready recommendations, not just brainstorming.
- Separate recommendations by deployment surface:
  - shared repo-level mechanisms
  - Claude-specific mechanisms
  - Codex-specific mechanisms
- Separate the Effect-specific governance lane from the JSDoc and TSDoc governance lane.
- Explicitly allow disruptive replacement exploration for the Effect-specific lane.
- Require a parity matrix for the current Effect-specific governance surface.
- Structure the work as a full spec package under `specs/pending/`.
- Use phased orchestrator prompts.
- Primary target: replace the Effect-specific `beep-laws` / ESLint governance lane with a faster multi-surface steering system that improves default agent idiomaticity.
- Let P1 narrow the field to a validated shortlist.
- Let P3 implement only the top-ranked path plus necessary glue.
- Require P4 evidence in three buckets:
  - parity
  - performance
  - steering
- Permit `full replacement`, `staged cutover`, or `no-go yet`.
- Make P0, P1, and P2 read-only outside the spec package.
- Lock a fixed steering evaluation corpus in P1 and reuse it in P4.
- Include combined router assets and machine-routable tracking files.
- Treat hybrid staged cutover as the only validated primary architecture entering P2.
- Treat external `linteffect` as a seed or accelerator only, not a drop-in replacement.
- Reject pure Biome-only, CLI-only, hook-only, instruction-only, and retrieval-only paths as primary replacements.
- Let `schema-first` move to the stronger inventory lane rather than forcing ESLint-shaped parity.
- Lock the P1 steering corpus as a mix of binary parity cases plus strong or soft steering-review cases.
- Choose the repo-local hybrid staged cutover as the single primary path entering P3.
- Keep `linteffect` off the P3 critical path; it may inform local Biome patterns but not define the implementation.
- Accept `schema-first` widening on day one and fix the known inventory drift during P3.
- Build a repo-local `no-native-runtime` parity runner while keeping the allowlist format unchanged.
- Keep the legacy effect-law ESLint implementation available for rollback through P4, but remove it from the blocking Effect-lane path during P3.
- Defer full root-level ESLint dependency removal to the separate JSDoc or TSDoc lane.
- Lock the P3 cutover on `lint:effect-governance` as the blocking Effect-governance path.
- Treat shared hotspot definitions as the authority for both the legacy and repo-local `no-native-runtime` implementations.
- Accept repaired repo-local parity for `effect-import-style` and widened repo-local coverage for `terse-effect-style` as the implemented exact surfaces entering P4.
- Carry the two remaining non-hotspot `no-native-runtime` warnings forward as explicit P4 verification items rather than silently normalizing them away.
- Lock the P4 verdict to `staged cutover`.
- Keep `lint:effect-governance` as the blocking Effect-governance path after P4.
- Do not claim `full replacement` until a real fast default steering surface exists for the locked idiomaticity cases.
- Treat the still-conflicting matcher guidance in `effect-first-development` as a routed execution follow-up, not as a reason to hide or reverse the P3 cutover.
- Treat post-P4 steering follow-up as an execution delta, not as an automatic verdict promotion.
- Fold the new `check:effect-steering` gate into `lint:effect-governance` once the hook and skill surfaces are implemented.
- Promote the package verdict to `full replacement` only after a fresh explicit re-review confirms that the shipped default steering layer now covers `IDI-01` through `IDI-03`.
- Treat the legacy `lint:effect-laws` lane as rollback or comparison scaffolding only after promotion; it is no longer the authoritative Effect-specific governance surface.
- The fresh explicit re-review confirmed that the shipped steering layer covers `IDI-01` through `IDI-03`, so the package verdict is now `full replacement`.
