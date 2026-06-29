# Gold-intake research note: runtime governance primitives — previewable bulk mutation + tamper-evident agent audit trace (2026-06-29)

> Non-invasive Case-A extend. This is a research note for the goal owner to act
> on later. It does **not** change this packet's SPEC, PLAN, GOAL, phases, or
> scope. It records two deferred governance capabilities surfaced by the
> gold-intake pass and proposes how the owner *could* fold them in.

## Source

- **Gold nuggets**
  - `agentmemory#10` (repo `agentmemory`, Apache-2.0) — "Governance delete/bulk-delete
    with dry-run, filter predicates, batched deletes, and append-only audit
    trail." Source: `agentmemory/src/functions/governance.ts:54-104`. Priority P2,
    recommendation `port`.
  - `research-squad#12` (repo `research-squad`, MIT) — "HAR/API tool-call audit
    extractor." Source: `research-squad/src/validation/parsers/har-parser.effect.ts:97-113`.
    Priority P3, recommendation `reference`.
- **GOLD_SYNTHESIS sections** (`explorations/_gold-intake/GOLD_SYNTHESIS.md`)
  - `### Governance & ops` (line ~1800) — the umbrella for the approval boundary,
    ethical/confidentiality walls, and audit/observability gaps.
  - `#### Governance bulk-delete with dry-run + filter-gated mutation + audit trail`
    (line ~1911) — maps `agentmemory#10`; beep-target named as "beep
    governance/approval-gate bulk-mutation op + audit log over `@beep/epistemic`
    authoritative graph."
  - `#### Observability: upload-lifecycle tracing + LLM/tool-call audit extractor`
    (line ~1991) — maps the HAR half (`research-squad#12`); beep-target named as
    "`@beep/observability` request-lifecycle spans around ingestion + agent
    activity/tool-call audit trace."
- **Routing cluster** (`explorations/_gold-intake/routing.json`) — cluster
  "Governance control plane (bulk-mutation dry-run, audit trace)", `route:
  extend-goal`, `primaryTarget: goals/agent-governance-control-plane`, wave P2.
  Secondary targets: `goals/agentic-professional-runtime`,
  `packages/epistemic/server`, `packages/foundation/capability/observability`.
  Routing cautions on record: "Attach as dated research notes, not new packets"
  and "Audit trace must be tamper-evident and ethical-wall aware."

## What goals/agent-governance-control-plane already covers

This packet is the canonical **process / agent-development** governance control
plane, not a runtime data-plane. Per `SPEC.md` it already establishes:

- the repo-law canon for agent-driven work (the 13 Core Governance Laws),
- the canonical agent topology (orchestrators, workers, adversarial auditors),
- the universal category loop `Research -> Plan -> Implement -> Refine -> Validate`,
- reusable packet contracts and prompt assets downstream initiatives inherit,
- the enforcement/verification contract mapping laws to commands and reviewers
  (ADR-003: "repo laws require both commands and adversarial reviewers"), and
- the consumer-integration model where downstream specs stay thin and inherit
  this packet (ADR-005, plus `ops/prompt-assets/CONSUMER_SPEC_BOOTSTRAP_TEMPLATE.md`).

Relevant anchor points these two nuggets attach to:
- The packet's mandate explicitly includes the approval boundary and evidence
  discipline (ADR-003, Law #13 "ship without a remediation backlog"). A
  previewable, filter-gated mutation surface and a tamper-evident audit trace are
  *concrete enforcement primitives* under that mandate.
- The tree-snapshot routing home confirms this packet is where
  "governance approval-gate/audit/bulk-mutation" lands, and notes the wider
  substrate already in place: `@beep/epistemic` ships `ClaimGate`/`ClaimLifecycle`
  with an `ApprovalGate` **stub** (no previewable mutation surface yet), and
  `@beep/observability` (OTel) covers tracing but has **no** agent-trace /
  tool-call audit replay.

So this is an extend, not a rebuild: the packet owns the *governance contract*;
these nuggets supply *runtime primitives* that a future consumer overlay would
implement against `@beep/epistemic` + `@beep/observability`.

## Net-new this contributes

- **Previewable, filter-gated bulk-mutation primitive** (`agentmemory#10`):
  a single op that (a) **requires at least one filter** (type/date/quality) for
  any non-`dryRun` mutation — refusing an unfiltered bulk delete; (b) in `dryRun`
  mode returns a preview (`wouldDelete` count + the affected ids) and mutates
  nothing; (c) executes in fixed batches (the reference uses `BATCH_SIZE = 50`);
  and (d) emits an **append-only audit trail** of what was changed. This is the
  missing "preview-then-apply with a refusal guard" shape for beep's
  `ApprovalGate` stub over the authoritative `@beep/epistemic` graph.
- **Tamper-evident agent activity / LLM+tool-call audit trace** (`research-squad#12`
  + the observability synthesis section): reconstruct and replay *which* LLM and
  tool calls an agent actually made by matching provider API endpoints
  (`CLAUDE_API_PATTERNS` matches `anthropic.com/api`, `/v1/messages`,
  `/chat/completions`) against captured network/trace records. The reusable
  pattern is **endpoint-pattern matching + structured reconstruction of an agent
  run**, giving a defensible record of retrieval/tool activity behind the ethical
  wall. This is the audit/replay half `@beep/observability` does not yet have.
- **External grounding for the two technical claims:**
  - The `research-squad` extractor parses **HAR** (HTTP Archive) captures — a
    JSON format where a top-level `log` holds an array of `entries`, each one HTTP
    request/response pair with method, URL, headers, body, and timing. HAR is a
    *de facto, community-driven* standard: a 2012 draft was submitted to the W3C
    Web Performance WG but abandoned and never formally published.
    ([w3c.github.io HAR Overview](https://w3c.github.io/web-performance/specs/HAR/Overview.html),
    [Wikipedia: HAR file format](https://en.wikipedia.org/wiki/HAR_(file_format)))
  - "Tamper-evident" is a load-bearing requirement (routing caution), and a plain
    append-only table does **not** satisfy it. The established designs are
    **hash-chaining** (each entry chained to the prior via SHA-256, so any edit or
    deletion breaks the chain on recompute) and **Merkle-tree inclusion proofs**,
    as productionized by **Certificate Transparency / RFC 6962**.
    ([Design Gurus: tamper-evident audit logs](https://www.designgurus.io/answers/detail/how-do-you-design-tamperevident-audit-logs-merkle-trees-hashing),
    [research!rsc: Transparent Logs for Skeptical Clients](https://research.swtch.com/tlog))

## Recommended integration (non-invasive)

These are **runtime data-plane** primitives, while this packet's SPEC governs the
**agent-development process**. Keep that altitude separation; do not splice
runtime mutation/audit mechanics into the law-canon SPEC. Suggested folds, in
order of least-invasive:

1. **Preferred — downstream consumer overlay.** Treat both as a future consumer
   initiative that *inherits* this packet via
   `ops/prompt-assets/CONSUMER_SPEC_BOOTSTRAP_TEMPLATE.md`, with implementation
   landing in the routing secondary targets: the bulk-mutation primitive in
   `packages/epistemic/server` (over the authoritative graph, atop the existing
   `ApprovalGate`/`ClaimGate` spine), and the audit trace in
   `packages/foundation/capability/observability` (`@beep/observability`) paired
   with `goals/agentic-professional-runtime`. This packet supplies the governance
   contract; the consumer supplies the code.
2. **If the owner wants visibility inside this packet** without touching SPEC:
   add a durable design slice (e.g. `design/runtime-governance-primitives.md`)
   referenced from the design index, or fold the two primitives into the P4
   *Enforcement And Verification Contract* output as enforcement evidence — both
   are additive, neither changes phases or scope.
3. **Map to the existing Core Governance Laws** when specced: `dryRun` previews +
   typed refusal align with Law #3 (typed failures via `Effect`/`Result`/`Exit`)
   and Law #6 (decode at the boundary); batched mutation state aligns with Law #10
   (`Ref`-family primitives, not ad-hoc mutable state); the append-only audit
   trail is the "evidence" leg of ADR-003.

## Cautions

- **Licensing — reimplement, do not copy.** `agentmemory` is Apache-2.0 and
  `research-squad` is MIT; both are permissive and safe to reuse **with
  attribution**, but port the *patterns* into beep's schema-first / Effect-first
  conventions rather than copying source. `agentmemory` is plain TypeScript;
  `research-squad` is Effect **v3** (`Effect.Service`-era) — migrate to this
  repo's Effect v4 helper-module import discipline.
- **Do not adopt HAR-file parsing literally.** HAR is browser-capture-oriented
  and only a de-facto standard; beep should reconstruct agent runs from its own
  OTel/Effect span source, reusing the *endpoint-pattern + structured
  reconstruction* idea, not a `.har` parser. `CLAUDE_API_PATTERNS` is
  Anthropic-specific — generalize across the four LLM drivers (`anthropic`,
  `openai-compat`, `xai`, `venice-ai`) so the trace is provider-neutral.
- **Tamper-evidence is a hard requirement, not a nice-to-have** (routing caution).
  An append-only table alone is insufficient; if the audit trace must be
  defensible, the owner needs to decide on hash-chaining (minimum) or Merkle
  inclusion proofs. Flag this as an open design decision rather than assuming the
  `agentmemory` "append-only" trail meets the bar — it does not by itself.
- **Ethical-wall awareness** (routing caution). The audit trace runs behind the
  matter-isolation ethical wall: it must be per-tenant / per-matter scoped and
  must not leak cross-matter activity. This aligns with the per-tenant
  `CurrentUser` / `RpcMiddleware` identity pattern catalogued elsewhere in the
  gold pass and with the conflict-of-interest wall theme.
- **Altitude / scope-creep risk.** These are runtime primitives entering a
  process-governance packet only because the name collides. Resist pulling
  data-plane implementation scope into this packet's SPEC; placement (inheriting
  parent vs. a dedicated runtime consumer spec) is the owner's call. No
  locked-decision conflict was found within this packet's SPEC.
