# Ingestion Security + Secret/PII Governance — Decisions

<!--
ALIGN seed (stage 2, pre-draft). Each entry is a load-bearing branch-closing
fork posed with a RECOMMENDED answer and grounded rationale, but left OPEN.
The user resolves these via `/grill-with-docs ingestion-security-secret-governance`,
one at a time, recommended-answer-first; resolutions then rewrite each entry to
the resolved-log form (Question / Answer / Rationale) and clear the matching
manifest `openQuestions` entry. Do NOT self-resolve here.
Grounding: RESEARCH.md (external landscape + in-repo inventory, Codex gate-1
folded 2026-06-29) and CAPTURE.md (gold-intake seed, 10 nuggets / 6 net-new).
-->

## Q1: Scope boundary — one ingestion-security wedge vs split content-security gate + shared secret-governance spine

**Recommended:** Carry one exploration packet through `shape`, then split at the
MAP into **two** graduated goals: (A) an **ingestion content-security gate** —
injection detector + secret/PII/OOXML scrub + scored audit + PDF x-ray + HTML
sanitizer + `GuardedHttpClient` — converging on the `@beep/file-processing`
retrieval pass; and (B) a **secret-governance spine** — ordered resolver chain +
per-user vault — homed platform-adjacent and **shared** with
`multi-provider-llm-dispatch-fallback`. Do not graduate them as one goal.

**Rationale:** CAPTURE clusters six net-new items, but they sit on two different
seams with different consumers and lifecycles. The content-security pieces
(net-new #1/#4/#5/#6) all land on a single retrieval pass — RESEARCH Constraints
"Pre-LLM scrub boundary" puts the injection detector and the scrub on "the same
`@beep/file-processing` retrieval pass … one pass, two checks." The
secret-governance pieces (net-new #2/#3) are **not** file-processing-scoped: the
resolver "must be the single resolver shared with `multi-provider-llm-dispatch-fallback`"
(RESEARCH gap #2 + Locked decision "ONE secret resolver, not two"), and the vault
needs a `node:crypto`/persistence home. Fusing them would drag the
file-processing boundary into the LLM-dispatch resolver's dependency graph (or
strand the resolver inside a content-security goal). This is the most
structurally consequential fork — it frames every package-placement and
first-slice question below.

**Status:** open (for /grill-with-docs)

## Q2: First slice — which net-new capability to build first

**Recommended:** The retrieval-boundary **prompt-injection detector** (net-new
#1): the deterministic three-pass, flag-not-block, char-span detector
(invisible-Unicode normalize/range-strip → regex heuristic banks → hidden-content
render-vs-extract diff) at the `@beep/file-processing` boundary.

**Rationale:** Highest defensive value-per-risk. It is the wedge's signature
capability (CAPTURE "defensive ingestion gate"); it has the cleanest license path
(both donors permissive — doc-haus MIT `PATTERN_RULES`, `uspto_pfw_mcp` MIT
examiner-disclosure banks; PhantomLint BSD-3 for the render-diff); it needs no new
infrastructure ("no ML model on the hot path", RESEARCH §1); and it reuses the
in-repo `TextAnchor` span substrate plus the `@beep/epistemic-domain`
`EvidenceSpan` scored-finding precedent (RESEARCH inventory). The secret resolver
is gated on cross-exploration coordination, and the vault and x-ray carry
unresolved spikes (crypto/KDF choice; pdf.js fill-color exposure), so neither is
the cheap first cut. Building the detector first also forces the flag-not-block
contract and the scored-`InjectionFinding` home (Q4) that the rest of the
content-security gate reuses.

**Status:** open (for /grill-with-docs)

## Q3: Package placement — secret resolver + per-user vault home (platform-adjacent, NOT `@beep/identity`)

**Recommended:** A new **platform-adjacent capability package** (working name e.g.
`@beep/secrets`) permitted to import `node:crypto`, persistence, and
child-process/SDK layers, holding **both** the ordered resolver service and the
per-user vault. Wrap the existing `@beep/onepassword-cli` driver as the first
(secure-storage) provider; keep the `op://vault/item/field` value object in shared
domain (`OnePasswordReference` already lives there). Do **not** home any of this
in `@beep/identity`.

**Rationale:** RESEARCH corrects the CAPTURE assumption head-on:
`@beep/identity` is "a pure modeling/identity-composer package … it cannot host
`node:crypto`, persistence, or child-process/SDK layers" (inventory + Routing
cautions + gaps #1/#2). The prescribed split: composers/branded-IDs stay in
`@beep/identity`; the `op://` reference value stays in shared domain
(`OnePasswordReference.model.ts:14-23`); the 1Password integration stays in
`@beep/onepassword-cli` (`OnePasswordCli.service.ts:54-57`/`:118-125` already
exposes `probeReference`/`read`/`whoami` returning `Redacted`); DB-backed vault
crypto + the resolver go in a server/use-case or new platform-adjacent capability
package. Keeping resolver+vault under one home preserves the "ONE secret
resolver" contract and avoids standing up a second 1Password integration.

**Status:** open (for /grill-with-docs)

## Q4: Package placement — content-security modules, HTML sanitizer, and scored-findings home

**Recommended:** Home the injection detector, secret/PII/OOXML scrub, scored
`RedactionAuditRow`, and PDF x-ray in `@beep/file-processing` (extend-home —
OCR/PDF-diagnostics is spec-deferred scope there, not a dup). Define
`InjectionFinding` and the scored `RedactionAuditRow` in that consuming slice
**mirroring `@beep/epistemic-domain` `EvidenceSpan`** (`TextAnchorFields` +
`Confidence`), **not** in `@beep/provenance`. Home the runtime HTML sanitizer as
an `Html.sanitize` module inside `@beep/html` consuming its own `ELEMENT_META`
allowlist, with a dedicated `SafeHtmlAttributes` subset.

**Rationale:** RESEARCH "Retrieval-boundary home — `@beep/file-processing`" plus
"`@beep/file-processing` OCR/PDF-diagnostics is spec-deferred" establish the
extend-home (the adjacent `PathSafety` module is an in-repo safety precedent).
The scored-findings routing is explicit: `TextAnchor.ts:4-8` reserves provenance
for "pure, judgement-free anchor substrate," so `category`/`ruleId`/`confidence`
findings "do NOT belong in `@beep/provenance`" and must mirror `EvidenceSpan`
(`EvidenceSpan.model.ts:52-57`/`:76-83`). The sanitizer home is the one routing
caution RESEARCH flags as **unsettled** (`@beep/html` `Html.sanitize` vs a
file-processing module) — recommending `@beep/html` co-locates the allowlist data
with its consumer, but it carries the CRITICAL fix: derive the element allowlist
from `ELEMENT_META` yet define a `SafeHtmlAttributes` subset that **excludes**
`EventHandlerAttributes` (`Html.attributes.ts:385-390`/`:292-374`) and `style`,
or the typed-AST/server-normalized path ships `onerror`/`onclick` script sinks
(DOMPurify only covers the render path). Confirm the sanitizer home in grill.

**Status:** open (for /grill-with-docs)

## Q5: Build-vs-buy — reimplement-not-copy (x-ray on pdf.js, deterministic injection, Presidio contract)

**Recommended:** Build/reimplement from primitives across the board; take **zero**
AGPL or SaaS runtime deps. Specifically: (a) PDF x-ray **TS-native on Mozilla
pdf.js** (Apache-2.0), reproducing the `{page:[{bbox,text}]}` contract, treating a
shell-out to `freelawproject/x-ray` as an optional, license-isolated,
offline/internal-only batch path; (b) injection detection stays **deterministic**
(regex banks + Unicode-range scan + render-vs-extract diff) emitting advisory
char-spans — **no ML on the hot path** and explicitly **no RL trusted/untrusted
token classifier**; (c) PII: port the **Presidio recognizer/operator contract**,
not the Python/REST runtime; (d) reimplement the unknown/AGPL donors (`mike`
vault/SSRF/sanitizer, `courtlistener` opinion-HTML), adapt only the permissive
donors (doc-haus MIT, `uspto_pfw_mcp` MIT, `sanitize-html` MIT, DOMPurify).

**Rationale:** Licensing gravity is decisive — PyMuPDF and `mupdf.js` are AGPL-3.0
and a hosted legal runtime triggers whole-application source disclosure (RESEARCH
Constraints "Licensing gravity"); `freelawproject/x-ray` is BSD-2 but inherits
AGPL via PyMuPDF, whereas pdf.js's `getOperatorList()`/`getTextContent()`
reproduce x-ray's rect-on-text heuristic with no Python sidecar and no AGPL.
PATENT CAUTION: US12118471B2 broadly claims RL-based trusted/untrusted token
tagging — staying on the detector/flag side reads outside the independent claims
(RESEARCH "PATENT CAUTION"). LLM Guard's DeBERTa is "explicitly not for
jailbreak/system/document content" (wrong threat model) and Lakera is SaaS that
sends text off-box — disqualified for privileged material (RESEARCH §1 +
"Privilege-safe = local-only"). Presidio ownership moved to `data-privacy-stack`
in 2025 (maintenance-risk) and its half-open `RecognizerResult` spans already
match the in-repo `TextAnchor`, so port the contract. `mike`/`courtlistener` are
unknown/AGPL (CAPTURE cautions) → reimplement. Open spike: whether pdf.js exposes
fill-color for the uniform-fill test without a raster `ImageData` pass.

**Status:** open (for /grill-with-docs)

## Q6: Vendor/auth — 1Password first provider + ordered-resolution placeholder-rejection mechanism

**Recommended:** Wrap the existing `@beep/onepassword-cli` driver as the
resolver's first (secure-storage) provider; reach for `@1password/sdk` only if a
CLI-free runtime becomes a hard requirement (and record that reason).
Implement ordered resolution as an **explicit sequential resolver** that catches
**only** typed `MissingSecret`/`PlaceholderRejected` errors — or normalizes
placeholders/too-short keys to `undefined` (absence) **inside** the secure-storage
provider before `ConfigProvider.orElse`. Do **not** rely on `orElse`
refinement-failure fallback.

**Rationale:** RESEARCH §2 (corrected): the repo "already ships a 1Password
substrate" — `@beep/onepassword-cli` (`OnePasswordCli.service.ts:54-57`/`:118-125`)
shells `op read … --no-newline` returning `Redacted.make`, and the `op://`
reference is already modeled — so a second integration via the beta
`@1password/sdk` (`v0.5.0-beta.1`, 2026-06-16) is avoidable. The
placeholder-rejection mechanism is the load-bearing correction: the installed
Effect source (`ConfigProvider.ts:421-422`/`:451-452`) falls back **only** on
`undefined` and **propagates** a refinement `SourceError`, so the
`uspto_pfw_mcp#6` donor's placeholder + suspiciously-short-key rejection (CAPTURE)
re-expressed as a naive refinement would **stop** resolution instead of falling
back, while catching all failures would mask real transport/auth errors. The
required tests are spelled out in RESEARCH §2 (placeholder → env fallback
succeeds; transport/auth failure → no fallback, error surfaces).

**Status:** open (for /grill-with-docs)

## Q7: Per-user vault cryptography — AES-256-GCM per-user subkeys vs XChaCha20-Poly1305 + KDF floor

**Recommended:** AES-256-GCM via Node `crypto` with **per-user/per-secret derived
subkeys** (random 96-bit IV, `getAuthTag()`, `setAuthTag` before `final()`),
source-tracked `env|user|vault`, secret values never serialized (`Redacted` /
`RedactedFromValue`). Log the explicit decision that **no key is ever
passphrase-derived** (so Node `scrypt` default N is acceptable; otherwise raise to
OWASP N=2^17 or Argon2id). Hold `@noble/ciphers` `xchacha20poly1305` as the
documented fallback if a no-AES-NI or nonce-collision-elimination requirement
emerges.

**Rationale:** RESEARCH §2 "per-user AES-256-GCM vault" plus the `mike#9` donor
(CAPTURE: `randomBytes(12)` / `createCipheriv("aes-256-gcm")` / `getAuthTag`) give
the canonical shape; per-user/per-secret subkeys keep message counts far under the
libsodium ~350 GB single-key ceiling, so random-IV birthday collisions are not in
play. The KDF gotcha is explicit: Node `scrypt` defaults are 8× below OWASP's
low-entropy-password floor, but "a 32-byte random master key only needs
domain-separation, so default N is acceptable **only if no key is ever
passphrase-derived** — log this decision explicitly." XChaCha20-Poly1305 (192-bit
nonce) removes the nonce-collision class entirely and is constant-time without
AES-NI — the right fallback. Caveat: Effect issue #5932 strips the `Redacted`
wrapper through `Schema.Encoded`, so guard the persistence round-trip. The vault
is NOT-FOUND in-repo today (RESEARCH gap #1) — fully net-new.

**Status:** open (for /grill-with-docs)

## Q8: SSRF — extend `SafeRemoteHost` range table + net-new `GuardedHttpClient` connect-time layer

**Recommended:** Two distinct moves. (1) Extend the pure, I/O-free `@beep/schema`
`SafeRemoteHost` **range table in place** — add the missing metadata/reserved
ranges (Alibaba `100.100.100.200`, Oracle `192.0.0.192`, `metadata.google.internal`,
`100.64.0.0/10` CGNAT, multicast `224/4`, Class-E `240/4`, TEST-NET) and ideally
swap string-prefix checks for an `ipaddr.js`/`ip-address` CIDR classifier —
keeping it pure. (2) Build a **net-new `GuardedHttpClient`** transform layer over
`NodeHttpClient.layerUndici` with a pinned `connect.lookup` (resolve-and-validate,
defeating DNS-rebinding TOCTOU), `redirect:'manual'` re-validating every hop, a
header-name allowlist, and URL credential/`#hash` stripping. Collapse the
duplicated literal-only guard in `@beep/nlp-mcp` onto the shared path.

**Rationale:** RESEARCH Locked decision: "Keep `SafeRemoteHost` pure/I-O-free;
extend only its range table … The connect-time guard is a separate net-new
`GuardedHttpClient` layer, NOT inside the foundation schema." The interception
seam already exists — `NodeHttpClient` exposes a `Dispatcher` `Context.Service` +
`makeDispatcher`/`layerUndici`, so a pinned `Agent({connect:{lookup}})` is
injectable, and the Undici client already does not follow redirects by default
(RESEARCH inventory "HTTP interception seam"). undici/native `fetch` has **no**
built-in SSRF protection and silently ignores `http.Agent` (`nodejs/undici#2019`);
CVE-2024-24758 shows a hand-rolled redirect loop must also strip
`Proxy-Authorization`. The `GuardedHttpClient` home is the other **unsettled**
routing caution (fresh `@beep/http` foundation vs a file-processing/driver-shared
module) — it must be platform-adjacent, permitted `node:dns`/`undici`, NOT
`@beep/schema`; confirm in grill. `@beep/nlp-mcp`'s literal-only
`isBlockedRemoteHost` is the named collapse target. Open spike: prototype the
pinned `connect.lookup` against a resolve-public→connect-private rebinding harness
(community-recommended, not maintainer-blessed).

**Status:** open (for /grill-with-docs)
