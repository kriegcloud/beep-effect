# Agent Governance Control Plane — Sources & Provenance

Provenance ledger for the gold-intake note `research/gold-intake-governance-controls.md`.
It derives from the gold-intake cluster **"Governance control plane (bulk-mutation
dry-run, audit trace)"** — two verified nuggets that attach to this packet as dated
research, not as new scope.

- **Cluster:** Governance control plane (bulk-mutation dry-run, audit trace) — theme `governance-ops`, wave P2
- **Route:** `extend-goal` → primary target `goals/agent-governance-control-plane` (this packet)
- **Gold-intake provenance:**
  - `explorations/_gold-intake/ROUTING.md` — cluster routing decisions
  - `explorations/_gold-intake/routing.json` — machine-readable cluster record
  - `explorations/_gold-intake/GOLD_SYNTHESIS.md` — `### Governance & ops` (umbrella),
    `#### Governance bulk-delete with dry-run + filter-gated mutation + audit trail`,
    `#### Observability: upload-lifecycle tracing + LLM/tool-call audit extractor`
- **Packet note this ledger backs:** `research/gold-intake-governance-controls.md`
- **Codex review:** none on disk (`reviews/` and `research/` carry no separate review artifact)

## 1. Mined source corpus (gold nuggets)

| Nugget | Title | Upstream (repo) | Source (file:line) | Theme | Priority | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| `agentmemory#10` | Governance delete/bulk-delete with dry-run, filter predicates, batched deletes, and append-only audit trail | agentmemory (T1, Apache-2.0) | `src/functions/governance.ts:54-104` | governance-ops | P2 | **port** (port-with-attribution; reimplement into schema-first/Effect-first) |
| `research-squad#12` | HAR/API tool-call audit extractor | research-squad (T1, MIT) | `src/validation/parsers/har-parser.effect.ts:97-113` | governance-ops | P3 | **reference** (pattern only; do not adopt HAR parsing literally) |

### How these inform this packet

Both nuggets are **runtime data-plane** primitives that attach to a **process-governance**
packet only because the name collides. The packet owns the *governance contract* (the
13 Core Governance Laws, phase gates, the approval boundary, ADR-003 evidence discipline);
these nuggets supply *primitives a future consumer overlay would implement* against
`@beep/epistemic` + `@beep/observability`. Keep the altitude separation — do not splice
runtime mutation/audit mechanics into the law-canon SPEC.

**Previewable, filter-gated bulk mutation (`agentmemory#10` — take the pattern).**
The load-bearing contract is the refusal guard plus dry-run preview:

```
const hasFilter = (data.type && data.type.length > 0) || data.dateFrom || data.dateTo || data.qualityBelow !== undefined;
if (!hasFilter && !data.dryRun) return { success: false, error: "At least one filter is required for non-dryRun bulk delete" };
...
if (data.dryRun) return { success: true, dryRun: true, wouldDelete: candidates.length, ids: candidates.map(m => m.id) };
```

Take: (a) require ≥1 filter for any non-`dryRun` mutation, (b) `dryRun` returns
`wouldDelete` + affected ids and mutates nothing, (c) fixed-size batches (`BATCH_SIZE`),
(d) append-only audit trail. This is the missing "preview-then-apply with refusal guard"
shape for beep's `ApprovalGate` **stub**. Leave: the plain TypeScript shape and the bare
"append-only" claim — by itself it does **not** meet the tamper-evidence bar (see §3).

**Agent activity / tool-call audit trace (`research-squad#12` — reference only).**
Take the idea: endpoint-pattern matching (`CLAUDE_API_PATTERNS` → `anthropic.com/api`,
`/v1/messages`, `/chat/completions`) + structured reconstruction of which LLM/tool calls
an agent ran, to give a defensible record behind the ethical wall. Leave: the `.har`
file parser (browser-capture-oriented, de-facto-only standard) and the Anthropic-only
patterns — reconstruct from beep's own OTel/Effect span source and generalize across the
four LLM drivers (`anthropic`, `openai-compat`, `xai`, `venice-ai`).

This is a single-cluster goal-note, not a split — no sibling-shared nuggets.

## 2. Upstream repositories & licenses

| Repo | Tier | License | Port discipline | What we take |
| --- | --- | --- | --- | --- |
| agentmemory | T1 | Apache-2.0 | Port-with-attribution (permissive; reimplement patterns into schema-first/Effect-first, do not vendor source) | Filter-gated + dry-run bulk-mutation op with refusal guard, batched deletes, append-only audit trail |
| research-squad | T1 | MIT | Port-with-attribution (permissive; reference the pattern, port nothing literally) | Endpoint-pattern matching + structured reconstruction of an agent run for tamper-evident tool-call audit |

> **Cautions (echoed from routing + note):**
> - **Attach as dated research notes, not new packets** — these nuggets must not
>   expand this packet's SPEC/PLAN/GOAL scope.
> - **Audit trace must be tamper-evident and ethical-wall aware** — append-only is
>   insufficient; the trace must be per-tenant / per-matter scoped and must not leak
>   cross-matter activity.
> - Both upstreams are permissive (Apache-2.0 / MIT) so porting **with attribution**
>   is allowed, but `research-squad` is Effect **v3** (`Effect.Service`-era) — migrate
>   to this repo's Effect v4 helper-module import discipline. `agentmemory` is plain
>   TypeScript and must be reshaped to beep conventions.

## 3. External research sources

URLs present on disk in `research/gold-intake-governance-controls.md` ("Net-new" §):

- **HAR file format (de-facto standard, never formally published):**
  [w3c.github.io — HAR Overview](https://w3c.github.io/web-performance/specs/HAR/Overview.html),
  [Wikipedia — HAR (file format)](https://en.wikipedia.org/wiki/HAR_(file_format))
- **Tamper-evident audit logs (hash-chaining + Merkle inclusion proofs; CT/RFC 6962):**
  [Design Gurus — tamper-evident audit logs](https://www.designgurus.io/answers/detail/how-do-you-design-tamperevident-audit-logs-merkle-trees-hashing),
  [research!rsc — Transparent Logs for Skeptical Clients](https://research.swtch.com/tlog)

These ground the two technical claims: that the `research-squad` extractor parses HAR
(a community-driven, non-W3C-published format) and that "tamper-evident" requires
hash-chaining or Merkle proofs, not a plain append-only table.

## 4. In-repo capability references

The `@beep/*` bricks this note's primitives compose against (from bundle `secondaryTargets`
and the note's in-repo inventory):

| Capability | Package path | Disposition |
| --- | --- | --- |
| `@beep/epistemic` — `ClaimGate` / `ClaimLifecycle` spine, `ApprovalGate` **stub** | `packages/epistemic/server` (services in `packages/epistemic/use-cases/src/ClaimGate`, `.../ClaimLifecycle`) | **extend** — the bulk-mutation op lands here, atop the existing approval spine |
| `@beep/observability` (OTel tracing) | `packages/foundation/capability/observability` | **extend** — adds the agent-trace / tool-call audit replay it does not yet have |
| Agentic professional runtime (consumer overlay pairing) | `goals/agentic-professional-runtime` | **reuse** — secondary target; pairs with the audit-trace work |
| Previewable filter-gated bulk-mutation op + dry-run preview + audit trail | — | **NET-NEW** (`netNew[0]`) |
| Tamper-evident agent activity / LLM+tool-call audit trace (behind ethical wall) | — | **NET-NEW** (`netNew[1]`) |

## 5. Cross-links & provenance

- **Cluster id:** "Governance control plane (bulk-mutation dry-run, audit trace)"
  (`route: extend-goal`, `primaryTarget: goals/agent-governance-control-plane`, wave P2)
- **Secondary targets / sibling links:** `goals/agentic-professional-runtime`,
  `packages/epistemic/server`, `packages/foundation/capability/observability`
- **Packet artifacts:** this packet's note `research/gold-intake-governance-controls.md`
  (the governing analysis); SPEC governance contract in `SPEC.md` and design slices under
  `design/` (notably `design/enforcement-and-verification-contract.md`, ADR-003);
  consumer-inheritance model in `ops/prompt-assets/CONSUMER_SPEC_BOOTSTRAP_TEMPLATE.md`.
  No `DECISIONS.md` and no `reviews/` artifact exist in this packet.
- **Gold-intake source:** `explorations/_gold-intake/` — `ROUTING.md`, `routing.json`,
  and `GOLD_SYNTHESIS.md` (`### Governance & ops` and the two `####` mapping sections above).
