# MCP Auth-Gated Registration & Progressive Disclosure

## Status

Stage: `research`
Status: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Spark

beep already ships two Effect-native MCP servers (`@beep/nlp-mcp`,
`@beep/m365-mcp`) that register every tool unconditionally — this exploration
layers the missing *patterns* onto them: credential-keyed conditional `Toolkit`
composition, tier-gating write-vs-read tools at the candidate→approved wall, a
structured `api_key_required` helper, and progressive-disclosure field tiers so
verbose source payloads (USPTO/CourtListener/GovInfo/DOL) never blow the LLM
context budget.

## Next Open Question

**Q1 (highest-leverage):** Is this packet patterns-only (a reusable MCP auth +
progressive-disclosure kit), or does it also build the gov-legal MCP host and its
drivers? This root fork gates the whole packet shape — including Q2 (which host
proves the kit first) and Q4 (where the shared kit lives). Recommended answer
pre-drafted in [`DECISIONS.md`](./DECISIONS.md); resolve the full set with
`/grill-with-docs mcp-auth-gated-registration`.

## Read This First

1. [`ops/manifest.json`](./ops/manifest.json) - machine state: stage, status, open questions.
2. [`CAPTURE.md`](./CAPTURE.md) - raw dump (stage 0).
3. [`RESEARCH.md`](./RESEARCH.md) - prior art + capability inventory (stage 1, if present).
4. [`DECISIONS.md`](./DECISIONS.md) - grilling log (stage 2, if present).
5. [`BRIEF.md`](./BRIEF.md) - shaped pitch (stage 3, if present).
6. [`MAP.md`](./MAP.md) - decomposition (stage 4, if present).

## Sources & provenance

[`research/SOURCES.md`](./research/SOURCES.md) - the gold-intake provenance
ledger: every mined nugget (upstream repo + `file:line`), each upstream
repository's license and port discipline (clean-room vs port-with-attribution),
the external research citations, and the `@beep/*` capabilities this packet
composes. Derived from the gold-intake cluster "MCP server design (conditional
registration, multi-provider auth, progressive disclosure)" - see
[`../_gold-intake/ROUTING.md`](../_gold-intake/ROUTING.md).

## Trail

<Dated one-liners, newest first: what each session did and where it stopped.>

- 2026-06-29: research-complete — RESEARCH.md synthesized, codex gate-1 folded, DECISIONS pre-drafted.
- 2026-06-29: packet opened from gold-intake cluster 'MCP server design (conditional registration, multi-provider auth, progressive disclosure)' (28 nuggets).
