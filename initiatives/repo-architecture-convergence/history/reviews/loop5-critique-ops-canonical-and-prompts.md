Remaining findings: 4

1. High - Phase-local startup instructions still weaken the canonical read contract
Why it matters: `SPEC.md` and `ops/README.md` make `ops/README.md`, `ops/handoffs/README.md`, the matching orchestrator prompt, `ops/prompts/agent-prompts.md`, and the named prompt assets mandatory startup inputs. The shared prompt layer and the active phase handoff/prompt still compress that into a shorter list and only point workers at `ops/prompt-assets/README.md`, so a worker following the live phase packet can skip required control-plane docs and the blocker/review/manifest assets that actually govern closure.
Exact file references: `SPEC.md:94-108`, `ops/README.md:13-23`, `ops/manifest.json:27-38`, `ops/manifest.json:303-357`, `ops/prompts/agent-prompts.md:8-11`, `ops/handoffs/HANDOFF_P0.md:15-21`, `ops/handoffs/P0_ORCHESTRATOR_PROMPT.md:3-9`. The same shortened contract pattern repeats across the remaining phase handoffs and per-phase orchestrator prompts under `ops/handoffs/`.
Concrete fix: Normalize the shared prompt, every phase handoff, and every orchestrator prompt to repeat the full canonical read set and to require loading the specific prompt asset files named by `promptAssetIds`, not just the README index.

2. High - Shared verification rules and phase packets still disagree on which search-audit families are mandatory
Why it matters: the reusable verification layer says every phase evidence pack must include exact `rg` commands across all seven proof families, but the manifest and handoffs only require phase-specific subsets. That leaves the packet with two incompatible answers about what a worker must prove, so a phase can satisfy its handoff and still violate the shared verification layer.
Exact file references: `ops/prompt-assets/verification-checks.md:22-37`, `ops/manifest.json:508-515`, `ops/manifest.json:618-621`, `ops/handoffs/HANDOFF_P0.md:55-62`, `ops/handoffs/HANDOFF_P1.md:55-59`, `ops/handoffs/HANDOFF_P2.md:64-71`.
Concrete fix: Choose one rule and encode it everywhere. Either make `ops/prompt-assets/verification-checks.md` explicitly defer to each phase's `requiredSearchAuditIds`, or expand each phase's manifest and handoff audit requirements until they match the shared seven-family rule.

3. Medium - The machine-readable manifest still never declares what directory its paths are relative to
Why it matters: `ops/README.md` presents `ops/manifest.json` as the machine-readable control-plane index, but the manifest mixes `README.md`, `ops/compatibility-ledger.md`, and `../../standards/...` without declaring a path base. Those strings only resolve correctly if consumers already know they are initiative-root relative; a normal self-relative resolution from `ops/manifest.json` points at the wrong files.
Exact file references: `ops/README.md:70-80`, `ops/manifest.json:27-56`, `ops/manifest.json:59-77`, `ops/manifest.json:453-467`.
Concrete fix: Add an explicit manifest path-base field such as `initiativeRoot`, and normalize every path-bearing field to that contract, or rewrite all manifest paths to be unambiguously relative to `ops/manifest.json`.

4. Medium - Phase blocker catalogs do not cover all universal closure blockers that their own gates can trigger
Why it matters: the blocker protocol says `required-command-failed` and `graphiti-obligation-unmet` are taxonomy-backed closure blockers, and the phases themselves require `graphiti-bootstrap` plus command gates. But P0 has neither blocker id, P1 omits `required-command-failed`, and later phases such as P2 still omit `graphiti-obligation-unmet`. That means the manifest and handoff blocker surfaces cannot fully represent failures of their own required gates.
Exact file references: `ops/prompt-assets/blocker-protocol.md:3-17`, `ops/manifest.json:504-523`, `ops/manifest.json:614-633`, `ops/manifest.json:742-748`, `ops/handoffs/HANDOFF_P0.md:50-70`, `ops/handoffs/HANDOFF_P1.md:50-66`, `ops/handoffs/HANDOFF_P2.md:54-80`.
Concrete fix: Make each phase's `blockerIds` and `## Blocking Conditions` include every universally applicable closure blocker that its required gates can emit, at minimum `required-command-failed` wherever a command gate is mandatory and `graphiti-obligation-unmet` wherever Graphiti bootstrap/writeback is mandatory.

Scope verdict: changes needed
