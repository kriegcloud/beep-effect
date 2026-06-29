# MCP Auth-Gated Registration & Progressive Disclosure — Decisions

<!--
Stage 2 (align) seed. Pre-drafted from RESEARCH.md + CAPTURE.md. Each question
poses a branch-closing fork with a RECOMMENDED answer and grounded rationale,
left **open** for the user to resolve via `/grill-with-docs
mcp-auth-gated-registration`. Do not treat recommendations as decided.
-->

## Q1: Is this packet patterns-only (a reusable MCP auth + progressive-disclosure kit), or does it also build the gov-legal MCP host and its drivers?

**Recommended:** Patterns-only. Ship a reusable kit (conditional/credential-keyed
`Toolkit` composition, `api_key_required` envelope, tier-gate dispatch wrapper,
progressive field-tier projection) and prove it against exactly one thin first
consumer. The MCP host package and the gov-legal/USPTO driver builds stay in
their own goals and are cross-linked, never absorbed. Keep the multi-provider
LLM dispatch/fallback work a boundary-with, sharing only the `Config.redacted`
primitive.

**Rationale:** CAPTURE seeds this explicitly as "about PATTERNS … layered onto
the TWO existing Effect MCP servers — NOT a third server," and the cluster
rationale justifies a new packet precisely because it is a *cross-cutting gap*,
not a driver build. RESEARCH confirms NLP surface expansion is owned by
`goals/nlp-adjunct-port` (DONE), USPTO driver depth by `uspto-patent-driver-depth`,
and gov-legal driver builds by `gov-legal-data-driver-codegen`; and that
`requiresAuth`/`api_key_required`/tier-gate/named-field-tiers are genuine NOT
FOUND gaps with no real src. Absorbing the host + drivers would re-scope a P2
wedge into a multi-goal program and collide with goals that already own that
work.

**Status:** open (for /grill-with-docs)

## Q2: Which concrete MCP surface proves the kit first — a new dedicated gov-legal/USPTO MCP package reusing the `Layer.mergeAll` seam, or an extension of `@beep/nlp-mcp` / `@beep/m365-mcp`?

**Recommended:** A new dedicated gov-legal/USPTO MCP package that reuses the
`nlp-mcp` `Layer.mergeAll(McpServer.toolkit(...).pipe(Layer.provide(...)))` seam
verbatim, with `@beep/uspto` as its first toolkit. Do NOT extend NLP or M365.

**Rationale:** RESEARCH (locked decisions, filesystem-verified 2026-06-29) found
neither `@beep/nlp-mcp` nor `@beep/m365-mcp` imports any gov-legal driver — they
are domain-specific hosts — and that the conditional-credential research itself
assumes a new gov-legal `makeServerLayer`, contradicting the literal "do NOT
scaffold a third" reading. The seed's real intent is "don't re-scaffold the
`Toolkit`/`layerStdio` machinery," which reusing the seam honors. `@beep/uspto`
is the only driver already built key-optional (`apiKey: Option<Redacted>`,
`X-API-KEY` only when present — the in-repo Shape C precedent) and carries the
25,000-token reshaping pressure (`documentBag`), making it the natural,
highest-signal first consumer. (Subordinate to Q1: only relevant if a host is in
scope at all.)

**Status:** open (for /grill-with-docs)

## Q3: Build the patterns natively on `effect/unstable/ai`, or wrap a third-party MCP framework (`@modelcontextprotocol/sdk`, FastMCP-style)?

**Recommended:** Reimplement native to `effect/unstable/ai`. No third-party MCP
runtime; port prior-art *shapes* into Effect idiom only.

**Rationale:** The repo already runs `effect@4.0.0-beta.91` with both MCP drivers
on `effect/unstable/ai` `{Tool, Toolkit}` + `McpServer.layerStdio` — the runtime
is chosen, and the kit's gating depends on Effect's typed `Toolkit`/`Layer`/
`Config` substrate (build-time layer composition, `Config.option`, `failureMode`,
`Context.Reference` hints). RESEARCH's licensing gravity makes "buy/copy"
infeasible regardless: MIT sources (`mcp-uspto`, `patents-mcp-server`,
`uspto_pfw_mcp`, `us-gov-open-data-mcp`, `us-legal-tools`) are port-but-reimplement
(idiom, not literal copy), `screenpipe` is NOASSERTION, and `mike` is
AGPL/unknown — both copy-forbidden. Wrapping a JS SDK would fork the server off
the Effect substrate the whole kit is built on.

**Status:** open (for /grill-with-docs)

## Q4: Where does the shared kit live — a new `@beep/mcp-kit` driver package, foundation/capability, or inlined per host?

**Recommended:** A new shared driver-tier package `@beep/mcp-kit`
(`packages/drivers/mcp-kit`) housing the host-construction helpers: the
`api_key_required` envelope, the `SourceAuth` gate registry, the `tools/call`
tier-gate dispatch wrapper, and the progressive field-tier projector / columnar
reshaper. Park the schema-first, domain-agnostic models (the `SourceAuth`
`{name, envVar, gate, signupUrl}` record, named field-tier Schema variants) in
`foundation/capability` if a cycle-free home is needed; keep host wiring in
`mcp-kit`. Every `*-mcp` host depends on the one kit.

**Rationale:** `ls packages/drivers` confirms no shared MCP/driver kit exists —
both servers (`@beep/nlp-mcp`, `@beep/m365-mcp`) are standalone driver packages,
and reusable NLP capability already lives in `packages/foundation/capability/nlp`.
A new sibling driver package mirrors the existing `*-mcp` placement and lets the
two current hosts plus the proposed gov-legal host share one kit without import
cycles. Per the CLAUDE.md search-first rule, `rg`/`ls` confirmed no `@beep/mcp-*`
package to reuse, so this is genuinely net-new placement, not duplication.

**Status:** open (for /grill-with-docs)

## Q5: How is per-source auth modeled, and does an absent key make a tool vanish (build-time composition) or degrade gracefully (call-time guard)?

**Recommended:** Model source auth as a 3-value `gate: none | soft | hard` enum,
keyed off the *optional-secret* credential class (`Config.redacted(...).pipe(
Config.option)`) only. Default to call-time graceful degradation (Shape C: tool
stays registered, returns `api_key_required` content) for `none`/`soft`/key-optional
sources; reserve build-time layer composition (Shapes A/B, tool disappears) for
`hard`-gated sources that are useless without the key. Model CourtListener as
`soft` (optional-token + degradation), and lock its exact tier before decompose.

**Rationale:** RESEARCH shows "auth required" collapses three real gate strengths
— `none` (eCFR, Federal Register), `hard` (GovInfo 401 `API_KEY_MISSING`, DOL
APIv4), `soft` (CourtListener, open-by-default + throttled) — so a boolean
mis-gates CourtListener. The in-repo credential primitive splits four classes and
only the optional-secret class lets a tool vanish; `@beep/uspto` is the existing
Shape C precedent. CourtListener's 2026 auth is genuinely contradictory across
sources (wiki "open by default" vs changelog "anonymous 401 / membership-gated
since 2026-05-07"), so optional-token degradation is robust to either outcome and
must not be hard-coded.

**Status:** open (for /grill-with-docs)

## Q6: `api_key_required` wire channel — adopt the success-with-error-JSON contract, or wrap `tools/call` to emit `isError: true`?

**Recommended:** Adopt the success-with-error-JSON contract by default: return the
typed failure as a normal result and mirror the structured payload into
`content[].text` as JSON (`{error:"api_key_required", tool, envVar, registration}`),
not `structuredContent` alone. Add a `tools/call` registration wrapper that maps
typed failures onto `isError:true` only if a concrete target client mishandles the
success channel. Pin the channel to MCP `2025-06-18` semantics.

**Rationale:** RESEARCH verified (`McpServer.ts:708-738`) that `McpServer` ships
every successfully-returned encoded result — success *or* a `failureMode:"return"`
typed failure — as `CallToolResult({ isError:false, … })`; `isError:true` is
reserved for a *failed Effect cause*. So `failureMode:"return"` does **not** yield
`isError:true` (this corrects a prior assumption). The `mcp-uspto` contract is
spec-correct against the installed `2025-06-18` target (a missing key is a
recoverable tool-execution outcome, which clients "SHOULD provide … to enable
self-correction"), and several clients drop `structuredContent` — hence the
`content[].text` mirror. The bundled `effect@4.0.0-beta.91` `McpServer` does not
speak `2025-11-25`, so any reliance on it is spec drift requiring an effect
dependency-upgrade + reverification task first.

**Status:** open (for /grill-with-docs)

## Q7: Where is the candidate→approved write-tool wall enforced, and how is a gated `tools/call` audited?

**Recommended:** Enforce at BOTH layers — filter the `tools/list` surface via the
built-in `McpSchema.EnabledWhen` predicate AND re-check at the `tools/call`
dispatch boundary with a `ClaimGate`-shaped wrapper that returns refusal as
structured content (fail-closed, refusal-as-value, never a thrown error);
annotations remain untrusted UX hints only. For audit, record each gated call in
`UsageRecord.metadata` (and drop the "one persisted `Activity` per call" promise)
rather than adding an `Activity` table in this packet — unless persisted
`Activity` is independently required. Gate this on first adding a sanitized span
wrapper + proof test.

**Rationale:** RESEARCH is emphatic that MCP annotations are "untrusted hints,
never the security boundary," and that `EnabledWhen` filters `tools/list` only —
`tools/call` dispatches by name *without* re-checking it (`McpServer.ts:1490-1512`
vs `708-738`) — so defense-in-depth needs both axes. `ClaimGate`
(`@beep/epistemic-use-cases`) is the in-repo total-engine, refusal-as-value
precedent to mirror. On persistence: `@beep/epistemic-tables` exports only
`UsageRecord` + the `usageRecord` table and has **no** `Activity` table/converter
(`rg "Activity" … → zero hits`), so "one `Activity` + one `UsageRecord` per call"
is not buildable today; `UsageRecord.metadata` is the lower-friction sink.
Span-hygiene caveat: `Toolkit.ts:263-266` annotates every tool span with full
`parameters`, so raw user text (e.g. `@beep/nlp` `Analyze`) leaks into spans
despite handler-level discipline — a sanitized span wrapper + proof test is
required before claiming audit/span hygiene.

**Status:** open (for /grill-with-docs)
