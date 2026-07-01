# Ingestion Security + Secret/PII Governance — Sources & Provenance

Provenance ledger joining every decision in this packet back to its mined gold
nugget (upstream repo + `file:line`), the upstream repo + license, the external
research citation actually on disk, and the in-repo `@beep/*` capability it
composes. Derived from the gold-intake cluster **"Ingestion security + secret/PII
governance"**.

- **Cluster:** Ingestion security + secret/PII governance (10 nuggets, themes `governance-ops` + `provenance-evidence`)
- **Route:** `new-exploration` → this packet (`ingestion-security-secret-governance`), wave P2
- **Gold-intake provenance:** [`explorations/_gold-intake/ROUTING.md`](../../_gold-intake/ROUTING.md) · [`explorations/_gold-intake/routing.json`](../../_gold-intake/routing.json) · [`explorations/_gold-intake/GOLD_SYNTHESIS.md`](../../_gold-intake/GOLD_SYNTHESIS.md)
- **Packet codex review:** [`reviews/2026-06-29-codex-research.md`](../reviews/2026-06-29-codex-research.md)
- **Sibling coordination:** secret-resolution overlap is shared with `multi-provider-llm-dispatch-fallback` (key precedence) — see `cautions` echoed in §2.

---

## 1. Mined source corpus (gold nuggets)

| Nugget | Title | Upstream (repo) | Source (file:line) | Theme | Priority | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| `doc-haus#5` | Prompt-injection defense for untrusted legal docs (invisible Unicode, instruction patterns, hidden DOCX runs) | doc-haus (MIT) | `services/ingest/src/sanitize.ts:68-109` | governance-ops | P1 | **port** (MIT, adapt heuristics) |
| `LegalEase#3` | PII redaction patterns with position-tracked match auditing | LegalEase (MIT) | `src/utils/redaction.ts:161-181` | provenance-evidence | P2 | **port** (drop India-centric IDs) |
| `agentmemory#11` | Secret/PII redaction pass for ethical-wall (private tags + provider-key regexes) | agentmemory (Apache-2.0) | `src/functions/privacy.ts:3-29` | governance-ops | P2 | **port** (fold into one secret bank) |
| `mike#12` | Opinion HTML sanitizer with tag/attr allowlist + safe-href rewriting | mike (AGPL-3.0) | `backend/src/lib/courtlistener.ts:428-455` | governance-ops | P2 | **clean-room** (AGPL — reimplement) |
| `mike#8` | SSRF guard for remote MCP/connector URLs (DNS-resolve + private-IP reject + manual redirect) | mike (AGPL-3.0) | `backend/src/lib/mcp/client.ts:276-293` | governance-ops | P2 | **clean-room / wrap** (AGPL — pattern only) |
| `mike#9` | Per-user AES-256-GCM provider-key vault with env fallback + source tracking | mike (AGPL-3.0) | `backend/src/lib/userApiKeys.ts:62-74` | governance-ops | P2 | **clean-room / study** (AGPL — pattern only) |
| `uspto_pfw_mcp#12` | Patent-domain prompt-injection detector (detect-secrets plugin, examiner-disclosure banks) | uspto_pfw_mcp (MIT) | `.security/patent_prompt_injection_detector.py:22-51` | governance-ops | P2 | **study/port** (MIT, examiner-disclosure is net-new elsewhere) |
| `uspto_pfw_mcp#6` | Multi-source secure API-key resolution (secure storage → env, placeholder rejection) | uspto_pfw_mcp (MIT) | `src/patent_filewrapper_mcp/services/ocr_service.py:23-89` | governance-ops | P2 | **adopt** (MIT) |
| `doc-haus#13` | OOXML redaction scrub with audit log + residue verification | doc-haus (MIT) | `dochaus/lib/redactions.ts:86-128` | governance-ops | P3 | **study/port** (MIT) |
| `doctor#8` | Bad-redaction (PDF x-ray) detection wrapper | doctor (BSD-2-Clause) | `doctor/tasks.py:121-141` | governance-ops | P3 | **reference** (BSD-2; x-ray pulls AGPL PyMuPDF → reimplement TS-native) |

### How these inform this packet

**Prompt-injection / hidden-content detection (`doc-haus#5`, `uspto_pfw_mcp#12`).**
Take the *shape*: a deterministic, flag-not-block detector emitting char-span
findings — invisible-Unicode range-strip + regex instruction-pattern banks +
hidden-DOCX `w:vanish` inspection. doc-haus's `PATTERN_RULES` (`instruction-override`
/ `concealment` / role-reassignment / exfiltration) is the portable contract;
`uspto_pfw_mcp`'s patent banks add the **examiner-info-disclosure** category that
has no general-library equivalent and must be hand-built. Leave the ML classifier
path off the hot line (RESEARCH §1: privilege-safe = local-only). The load-bearing
contract is char-span findings WITH counts, never a silent drop.

**Secret/PII scrub before LLM (`agentmemory#11`, `LegalEase#3`).**
`agentmemory#11`'s `stripPrivateData` (private-tag stripping + provider-key regex
battery → `[REDACTED]`/`[REDACTED_SECRET]`) is the pre-LLM scrub contract; verify
regexes against `gitleaks.toml` (RESEARCH §4) rather than copying them verbatim.
`LegalEase#3`'s `findPiiMatches` returns `{label, match, index}` sorted by offset —
take the span-grounded shape, **drop the India-centric Aadhaar/PAN IDs**. Both fold
into ONE canonical secret-pattern bank alongside the in-repo `ai-metrics` +
`observability` precedents (§4) — do not start a parallel bank.

**OOXML redaction scrub + audit (`doc-haus#13`).**
Take `xmlVariants` (scrub the needle across BOTH text-node and attribute escape
contexts, plus `w:author`/`w:initials` identity attributes) and the **honest
residue check** (report unreachable binary parts rather than claim "clean"). Pair
it with a per-matter audit row. This is P3 / `study`; the load-bearing snippet is
the dual-escape variant set:
```ts
function xmlVariants(text: string) {
  const textNode = text.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
  const attribute = textNode.replaceAll('"',"&quot;").replaceAll("'","&apos;")
  return [...new Set([textNode, attribute])]
}
```

**SSRF + per-user vault + secret resolution (`mike#8`, `mike#9`, `uspto_pfw_mcp#6`).**
`mike` is **AGPL-3.0 → clean-room reimplement only, never copy code**. Take the
*patterns*: DNS-resolve-then-reject-private-IP + `redirect:'manual'` connect-time
guard (`mike#8`); per-user AES-256-GCM (scrypt/IV/auth-tag) with env-first
precedence + `source: env|user` tracking (`mike#9`). `uspto_pfw_mcp#6` (MIT) is the
`adopt`-grade ordered resolution chain (secure-storage → env) with
placeholder-string + too-short-key rejection — but RESEARCH §2 corrects the
mechanism: `ConfigProvider.orElse` falls back only on absence, so placeholders must
normalize to `undefined` inside the provider (not lean on refinement-failure
fallback). **This resolver is shared with sibling `multi-provider-llm-dispatch-fallback`
— one resolver, not two.**

**Redaction integrity (`doctor#8`).**
`get_xray` wraps the x-ray lib to flag text recoverable under failed redaction
boxes. `doctor` is BSD-2, but x-ray pulls **PyMuPDF (AGPL-3.0)** → the disposition
is **reference**: reproduce the `{page:[{bbox,text}]}` contract TS-native on
Mozilla pdf.js (Apache-2.0), treating real x-ray as an optional license-isolated
offline batch path (RESEARCH §5 + Constraints).

---

## 2. Upstream repositories & licenses

| Repo | Tier | License | Port discipline | What we take |
| --- | --- | --- | --- | --- |
| doc-haus | T1 | **MIT** | port-with-attribution | Injection `PATTERN_RULES` heuristics, invisible-Unicode strip, `xmlVariants` OOXML scrub + residue check |
| uspto_pfw_mcp | T1 | **MIT** | port-with-attribution | Examiner-disclosure injection banks; ordered secure-storage→env resolution + placeholder rejection |
| LegalEase | T2 | **MIT** | port-with-attribution | `findPiiMatches` position-tracked PII shape (drop India IDs) |
| agentmemory | T1 | **Apache-2.0** | port-with-attribution (preserve NOTICE) | `stripPrivateData` private-tag + provider-key scrub contract |
| doctor | T1 | **BSD-2-Clause** | port-with-attribution | x-ray failed-redaction wrapper as the JSON-contract reference (reimplement TS-native — see caution) |
| mike | T1 | **AGPL-3.0-only** | **clean-room reimplement only — DO NOT COPY** | SSRF guard, per-user AES-GCM vault, opinion-HTML sanitizer — patterns, not code |

> **Cautions (echoed from the bundle):**
> - **doc-haus MIT** → adapt heuristics freely. **mike AGPL-3.0** → reimplement
>   vault/sanitizer/SSRF patterns from primitives + this report; do not vendor.
> - **Flag-not-block is a hard contract** — injection findings are advisory
>   char-span annotations the lawyer reviews, never silent drops.
> - **Coordinate the secret-resolution overlap with `multi-provider-llm-dispatch-fallback`**
>   (key precedence) so the repo ends up with ONE resolver, not two.
> - Additional license gravity (RESEARCH Constraints): `doctor#8`'s x-ray pulls
>   **PyMuPDF/mupdf.js AGPL-3.0** (hosted-SaaS source-disclosure trigger) → build
>   TS-native on pdf.js (Apache-2.0). Patent caution US12118471B2: stay on the
>   detector/flag side, do not build an RL trusted/untrusted token classifier.

---

## 3. External research sources

External landscape citations actually present on disk (RESEARCH.md §1–§5 + the five
raw dossiers under `research/`). Representative load-bearing URLs (full set inline
in [`RESEARCH.md`](../RESEARCH.md) and the dossiers):

**Prompt-injection / hidden content** ([`research/prompt-injection-detection-landscape.md`](prompt-injection-detection-landscape.md))
- OWASP LLM01:2025 Prompt Injection — <https://genai.owasp.org/llmrisk/llm01-prompt-injection/>
- tldrsec prompt-injection-defenses taxonomy — <https://github.com/tldrsec/prompt-injection-defenses>
- Yelp `detect-secrets` plugin shape (Apache-2.0) — <https://github.com/Yelp/detect-secrets/blob/master/docs/plugins.md>
- CSA Unicode instruction injection — <https://labs.cloudsecurityalliance.org/research/csa-research-note-unicode-instruction-injection-ai-skills-20/>; Cisco Unicode-tag — <https://blogs.cisco.com/ai/understanding-and-mitigating-unicode-tag-prompt-injection>
- PhantomLint render-vs-extract (BSD-3) — <https://arxiv.org/pdf/2508.17884> · <https://github.com/tobycmurray/phantom-lint>
- US12118471B2 patent caution — <https://patents.google.com/patent/US12118471>

**Secret resolution + per-user vault** ([`research/secret-resolution-and-per-user-vault.md`](secret-resolution-and-per-user-vault.md))
- Effect `ConfigProvider` / `Redacted` — <https://effect.website/docs/configuration/> · <https://effect-ts.github.io/effect/effect/ConfigProvider.ts.html> · <https://effect.website/docs/data-types/redacted/>
- Node `crypto` AES-256-GCM + scrypt — <https://nodejs.org/api/crypto.html>; libsodium nonce limits — <https://doc.libsodium.org/secret-key_cryptography/aead/aes-256-gcm>; XChaCha20 — <https://libsodium.gitbook.io/doc/secret-key_cryptography/aead/chacha20-poly1305/xchacha20-poly1305_construction>
- OWASP Password Storage (scrypt/Argon2id floor) — <https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html>
- 1Password SDK (beta) — <https://github.com/1Password/onepassword-sdk-js>; keytar archived — <https://github.com/atom/node-keytar>

**SSRF + fetch hardening** ([`research/ssrf-and-fetch-hardening.md`](ssrf-and-fetch-hardening.md))
- OWASP SSRF Prevention (+ Node) — <https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html> · <https://owasp.org/www-community/pages/controls/SSRF_Prevention_in_Nodejs>
- undici has no SSRF protection / `connect.lookup` fix — <https://github.com/nodejs/undici/issues/2019>; DNS-rebinding TOCTOU — <https://aydinnyunus.github.io/2026/03/14/ssrf-dns-rebinding-vulnerability/>
- CVE-2024-24758 (`Proxy-Authorization` on redirect) — <https://github.com/nodejs/undici/security/advisories/GHSA-3787-6prv-h9w3>
- `request-filtering-agent` (MIT) — <https://github.com/azu/request-filtering-agent>

**Secret/PII scrub + OOXML + audit** ([`research/secret-pii-scrub-and-audit.md`](secret-pii-scrub-and-audit.md))
- Microsoft Presidio contract (MIT) — <https://github.com/microsoft/presidio/blob/main/LICENSE> · <https://presidio.dataprivacystack.org/anonymizer/>
- gitleaks provider-key regexes (MIT) — <https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml>; GitHub token formats — <https://github.blog/engineering/platform-security/behind-githubs-new-authentication-token-formats/>
- W3C XML predefined entities — <https://www.w3.org/TR/xml/>; OOXML comment/vanish — <https://datypic.com/sc/ooxml/e-w_comment-1.html> · <https://ooxml.info/docs/17/17.3/17.3.2/17.3.2.41/>

**Redaction integrity + HTML sanitization** ([`research/redaction-integrity-and-html-sanitization.md`](redaction-integrity-and-html-sanitization.md))
- freelawproject/x-ray (BSD-2, pulls PyMuPDF AGPL) — <https://github.com/freelawproject/x-ray>; PyMuPDF AGPL — <https://github.com/pymupdf/pymupdf>; mupdf.js (also AGPL) — <https://github.com/ArtifexSoftware/mupdf.js/>
- pdf.js (Apache-2.0) — <https://github.com/mozilla/pdf.js/blob/master/LICENSE> · <https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html>
- mXSS / regex-sanitizer failure mode — <https://cure53.de/fp170.pdf> · <https://www.sonarsource.com/blog/mxss-the-vulnerability-hiding-in-your-code>
- sanitize-html (MIT) + DOMPurify (Apache-2.0/MPL-2.0) — <https://www.npmjs.com/package/sanitize-html> · <https://github.com/cure53/DOMPurify>

---

## 4. In-repo capability references

`@beep/*` bricks this packet composes (from `secondaryTargets` + the RESEARCH
In-Repo Capability Inventory). Paths verified in RESEARCH 2026-06-29.

**Reuse (compose as-is):**
- `@beep/schema` `SafeRemoteHost` — `packages/foundation/modeling/schema/src/SafeRemoteHost.ts` (pure SSRF host guard; extend range table only)
- `@beep/onepassword-cli` — `packages/drivers/onepassword-cli/src/OnePasswordCli.service.ts` (`read`/`probeReference`/`whoami`; first secret provider)
- shared-domain `OnePasswordReference` — `packages/shared/domain/src/values/OnePasswordReference/OnePasswordReference.model.ts` (`op://` value object)
- `@beep/provenance` `TextAnchor` / `TextAnchorFields` — `packages/foundation/modeling/provenance/src/TextAnchor.ts` (half-open char-range anchor substrate)
- `@beep/epistemic-domain` `EvidenceSpan` — `packages/epistemic/domain/src/values/EvidenceSpan/EvidenceSpan.model.ts` (scored-span precedent: `TextAnchorFields` + `Confidence`)
- `@beep/uspto` `S.RedactedFromValue` — `packages/drivers/uspto/src/Uspto.config.ts:45` (env-first redacted config)
- `@beep/utils` `Html.escapeHtml` — `packages/foundation/modeling/utils/src/Html.ts`
- `@beep/md` `sanitizeUrlDestination` — `packages/foundation/modeling/md/src/Md.utils.ts`; `@beep/ui` `sanitizeAnchorHref` — `packages/foundation/ui-system/ui/src/lib/url.ts`
- `@effect/platform-node` `NodeHttpClient` dispatcher seam — `node_modules/@effect/platform-node/src/NodeHttpClient.ts` (connect-time-IP-pinning injection point)

**Extend (home exists, capability is spec-deferred / additive):**
- `@beep/file-processing` — `packages/foundation/capability/file-processing/src/` (retrieval-boundary home for injection detector + pre-LLM scrub; OCR/PDF-diagnostics spec-deferred → x-ray extend-goal)
- `@beep/html` — `packages/foundation/modeling/html/src/` (derive *element* allowlist from `ELEMENT_META`; define net-new `SafeHtmlAttributes` excluding `EventHandlerAttributes`/`style`)
- `@beep/repo-ai-metrics` `privacy.ts` + `@beep/observability` `CauseRedaction.ts` — fold into ONE canonical secret-pattern bank (do not start a fourth)
- secondary driver consumers: `@beep/drivers/anthropic`, `@beep/courtlistener`, `@beep/uspto`, `@beep/langextract` (`packages/foundation/capability/langextract`)

**NOT a home (corrected by RESEARCH — do not place here):**
- `@beep/identity` (`packages/foundation/modeling/identity`) — pure identity-composer package; **cannot** host `node:crypto`/persistence/child-process. Resolver + per-user vault belong in a platform-adjacent package.
- `@beep/provenance` — pure-anchor doctrine (`TextAnchor.ts:4-8`); scored `InjectionFinding`/`RedactionAuditRow` land in the consuming security slice, not here.

**NET-NEW (no in-repo home — see RESEARCH gaps 1–7):**
- Char-span flag-not-block injection/Unicode/`w:vanish` detector
- Ordered secret-resolution chain + placeholder/short-key rejection (shared resolver)
- Per-user AES-256-GCM (or XChaCha20-Poly1305) key vault with env fallback + source tracking
- Connect-time `GuardedHttpClient` (pinned `connect.lookup` + manual-redirect re-validation)
- Pre-LLM secret/PII scrub + OOXML multi-escape scrub + per-matter audit row
- PDF x-ray (failed-redaction) on pdf.js + runtime HTML sanitizer (sanitize-html server + DOMPurify browser)

---

## 5. Cross-links & provenance

- **Cluster id:** `ingestion-security-secret-governance` (gold-intake, route `new-exploration`, wave P2; histogram P1:1 / P2:7 / P3:2)
- **Sibling coordination (no formal crossref in bundle):** `multi-provider-llm-dispatch-fallback` owns the key-precedence side of the secret resolver — the resolver here MUST be the single shared service (RESEARCH §2 + Constraints "ONE secret resolver, not two").
- **Packet artifacts:** [`CAPTURE.md`](../CAPTURE.md) · [`RESEARCH.md`](../RESEARCH.md) · [`DECISIONS.md`](../DECISIONS.md) · [`BRIEF.md`](../BRIEF.md) · [`MAP.md`](../MAP.md)
- **Raw research dossiers:** [`research/`](.) (five subtopic dossiers linked per §3)
- **Codex review:** [`reviews/2026-06-29-codex-research.md`](../reviews/2026-06-29-codex-research.md) (gate-1: 2 blocking + 4 advisory folded into RESEARCH 2026-06-29)
- **Gold-intake roots:** [`explorations/_gold-intake/ROUTING.md`](../../_gold-intake/ROUTING.md) · [`routing.json`](../../_gold-intake/routing.json) · [`GOLD_SYNTHESIS.md`](../../_gold-intake/GOLD_SYNTHESIS.md) (governance-ops + provenance-evidence themes)
