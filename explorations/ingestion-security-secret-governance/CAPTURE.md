# Capture

<!--
Stage 0. Append-only raw dump: thoughts, links, screenshots (drop files in
assets/ and reference them), half-sentences, contradictions. Nobody tidies
this file; cleaning it up destroys provenance. New material goes under a new
dated heading at the bottom.
-->

## 2026-06-29 — Gold-intake seed

Source synthesis: [`explorations/_gold-intake/GOLD_SYNTHESIS.md`](../_gold-intake/GOLD_SYNTHESIS.md)
— this wedge draws from the `### Governance & ops` section (line ~1800) and the
`### Provenance & evidence` section (line ~496) of the gold catalog-by-theme;
full per-nugget detail in [`_gold-intake/research/gold-catalog.json`](../_gold-intake/research/gold-catalog.json)
and routing in [`_gold-intake/routing.json`](../_gold-intake/routing.json).

**Cluster rationale:** A cross-cutting ingestion-boundary security/governance
wedge with no current home: prompt-injection detection, ordered secret
resolution + per-user vault, SSRF DNS/redirect hardening, secret/PII/OOXML
scrubbing with audit, and failed-redaction x-ray all land at the
`@beep/file-processing` retrieval boundary plus `@beep/identity` (vault) and
`@beep/provenance` (audit). Distinct from multi-provider-llm-dispatch (key
precedence) — this is the defensive ingestion gate.

route=`new-exploration` · primaryTarget=`ingestion-security-secret-governance` (targetExists=false) · wave=`P2` (histogram P1:1 / P2:7 / P3:2) · themeSpan=`[governance-ops, provenance-evidence]` · secondaryTargets=`[packages/drivers/anthropic, packages/drivers/courtlistener, packages/drivers/uspto, packages/foundation/capability/langextract, packages/foundation/modeling/identity, packages/foundation/modeling/provenance]`

SPECIAL NOTE (orchestrator): Coordinate with the existing Redacted secret
pattern — `packages/drivers/uspto` `Uspto.config.ts` `RedactedFromValue`
(alreadyCovered). Net-new is: secret-resolution chain, SafeRemoteHost +
DNS/private-IP rejection, retrieval-boundary injection detector,
secret-scrub-before-LLM. harvest-mcp unknown / courtlistener+mike AGPL →
reimplement (do not copy).

### Nuggets (10)

- **doc-haus#5** (doc-haus) — Prompt-injection defense for untrusted legal documents (invisible Unicode, instruction patterns, hidden DOCX runs). `services/ingest/src/sanitize.ts:68-109`. P1 / port. → feeds netNew#1 (retrieval-boundary instruction-override + examiner-disclosure regex detector, flag-not-block char-span findings in `@beep/file-processing`). Snippet: `PATTERN_RULES` with `instruction-override` regex `\b(ignore|disregard|forget|override)\b...\b(previous|prior|above|...|system)\b...\b(instructions?|prompts?|rules?|...)\b` plus `concealment`; normalizes/strips invisible Unicode (bidi/tag/zero-width) reporting counts, reads raw DOCX XML for vanish/white/tiny runs; flags-not-blocks so the lawyer sees what was written.
- **uspto_pfw_mcp#12** (uspto_pfw_mcp) — Patent-domain prompt-injection detector (detect-secrets plugin). `.security/patent_prompt_injection_detector.py:22-51`. P2 / study. → feeds netNew#1 (domain-tuned injection + examiner-disclosure detector at retrieval boundary). Snippet: `instruction_override_patterns = [ r'ignore\s+(?:the\s+)?(?:above|previous|prior)\s+(?:prompt|instructions?|commands?)\s+(?:and|then|now)', r'disregard...', r'you\s+are\s+(?:now\s+)?(?:a\s+)?(?:different|new|evil|malicious|unrestricted)\s+(?:ai|assistant|bot)', ... ]` — curated regex banks: instruction-override, prompt-extraction, persona-switching, patent-specific exfiltration (patent data extraction, examiner-info disclosure, API-bypass); runs as pre-commit/CI secret-scan.
- **uspto_pfw_mcp#6** (uspto_pfw_mcp) — Multi-source secure API-key resolution (secure storage → env, with placeholder rejection). `src/patent_filewrapper_mcp/services/ocr_service.py:23-89`. P2 / adopt. → feeds netNew#3 (ordered secure-storage→env secret-resolution chain with placeholder-string + too-short-key rejection). Snippet: `from ..shared_secure_storage import get_mistral_api_key; raw = get_mistral_api_key() ... if not raw: raw = os.getenv("MISTRAL_API_KEY"); self._validate_mistral_api_key(raw)` + `placeholder_patterns = ["your_mistral_api_key_here", "placeholder", "optional", ...]` and suspiciously-short-key rejection → half-configured key treated as missing.
- **mike#9** (mike) — Per-user multi-provider API-key vault (AES-256-GCM) with env fallback + source tracking. `backend/src/lib/userApiKeys.ts:62-74`. P2 / study. → feeds netNew#2 (per-user AES-256-GCM key vault: scrypt/IV/auth-tag, source=env|user) + netNew#3 (resolution precedence). Snippet: `iv = crypto.randomBytes(12); cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv); encrypted = Buffer.concat([cipher.update(value,"utf8"), cipher.final()]); return { encrypted_key, iv, auth_tag: cipher.getAuthTag()... }` — precedence: process env first, else decrypt the user's stored key; `getUserApiKeyStatus` reports source `env` vs `user`. mike license unknown → reimplement, do not copy.
- **mike#8** (mike) — SSRF guard for remote MCP/connector URLs. `backend/src/lib/mcp/client.ts:276-293`. P2 / wrap. → feeds netNew#4 (DNS-resolution + private/reserved-IP rejection + `redirect:'manual'` SSRF hardening beyond the allowlist `SafeRemoteHost`). Snippet: `if (hostname === "localhost" || hostname.endsWith(".localhost") || BLOCKED_METADATA_HOSTS.has(hostname)) throw ...; addresses = literalFamily ? [{address:hostname}] : await dns.lookup(hostname, {all:true, verbatim:true}); if (addresses.some(({address}) => isBlockedIp(address))) throw ...` — enforces HTTPS, strips creds/hash, `validateCustomHeaders` allowlists header names, `guardedFetch` wraps fetch with `redirect:'manual'`. mike license unknown → reimplement.
- **mike#12** (mike) — Opinion HTML sanitizer with tag/attr allowlist and safe-href rewriting. `backend/src/lib/courtlistener.ts:428-455`. P2 / port. → feeds netNew#6 (untrusted-HTML tag/attr-allowlist sanitizer for fetched opinions). Snippet: `sanitizeOpinionHtml` strips `<!-- -->` comments + `<(script|style|iframe|object|embed|form|svg|math)...</\1>`, then `normalized.replace(/<\/?([a-z0-9-]+)\b([^>]*)>/gi, (m,tag,attrs) => { if (!SAFE_OPINION_HTML_TAGS.has(tag.toLowerCase())) return ""; ... })` — allowlist tag+attr set, rewrites `<page-number>` into span markers, validates hrefs; dependency-free. courtlistener+mike AGPL → reimplement.
- **doctor#8** (doctor) — Bad-redaction detection (x-ray) wrapper. `doctor/tasks.py:121-141`. P3 / reference. → feeds netNew#6 (PDF x-ray check for recoverable text under failed redaction boxes; returns bounding boxes). Snippet: `def get_xray(path): try: bad_redactions = xray.inspect(path); return bad_redactions except (OSError, ValueError, TypeError, KeyError, AssertionError, PdfReadError): return {"error": True, "msg": "Exception"}` — ethical-wall/confidentiality guard flagging documents whose redactions can be recovered before they enter the graph or get shared.
- **agentmemory#11** (agentmemory) — Secret/PII redaction pass for ethical-wall enforcement (private tags + provider key regexes). `src/functions/privacy.ts:3-29`. P2 / port. → feeds netNew#5 (pre-LLM secret/PII scrub: provider-key regex → `[REDACTED]`). Snippet: `PRIVATE_TAG_RE = /<private>[\s\S]*?<\/private>/gi` (→ `[REDACTED]`) and `SECRET_PATTERN_SOURCES = [ /sk-ant-[A-Za-z0-9\-_]{20,}/g, /gh[pus]_[A-Za-z0-9]{36,}/g, /AKIA[0-9A-Z]{16}/g, /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, ... ]` → matches replaced with `[REDACTED_SECRET]` (OpenAI sk-/sk-proj-, Anthropic, GitHub, AWS, Google AIza, JWT, Slack xoxb, npm/gitlab/DO).
- **LegalEase#3** (LegalEase) — PII redaction patterns with position-tracked match auditing. `src/utils/redaction.ts:161-181`. P2 / port. → feeds netNew#5 (pre-LLM secret/PII scrub: char-span anchored PII detection / per-matter audit). Snippet: `findPiiMatches(text, patterns=PII_PATTERNS): for ({label,pattern} of patterns) { cloned = new RegExp(pattern.source, pattern.flags); while ((m = cloned.exec(text))) matches.push({label, match:m[0], index:m.index}); } return matches.sort((a,b) => a.index - b.index)` — ordered labeled regexes (SSN, credit card, email, phone, ...); `label+index` = span-grounded detection. India-centric IDs (Aadhaar/PAN) droppable.
- **doc-haus#13** (doc-haus) — OOXML redaction scrub with audit log and residue verification. `dochaus/lib/redactions.ts:86-128`. P3 / study. → feeds netNew#5 (OOXML scrub across all XML-escape variants + per-matter audit row). Snippet: `function xmlVariants(text) { const textNode = text.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); const attribute = textNode.replaceAll('"',"&quot;").replaceAll("'","&apos;"); return [...new Set([textNode, attribute])] }` — records per-matter audit row (redacted_text, label, reason, author, occurrence counts), scrubs needle from every XML part incl. `w:author`/`w:initials`, residue check confirms clean and reports unreachable binary parts (images/embeddings) rather than claiming clean. doc-haus MIT → adapt heuristics.

### netNew (build list)

1. Prompt-injection / instruction-override + examiner-disclosure regex detector at the retrieval boundary (flag-not-block, char-span findings) in `@beep/file-processing`.
2. Per-user AES-256-GCM key vault (scrypt/IV/auth-tag, source=env|user) — no vault exists in `@beep/identity`.
3. Ordered secure-storage→env secret-resolution chain with placeholder-string + too-short-key rejection.
4. DNS-resolution + private/reserved-IP rejection + `redirect:'manual'` SSRF hardening beyond the allowlist `SafeRemoteHost`.
5. Pre-LLM secret/PII scrub (provider-key regex → `[REDACTED]`, OOXML scrub across all XML-escape variants) with per-matter audit row.
6. PDF x-ray check for recoverable text under failed redaction boxes; untrusted-HTML tag/attr-allowlist sanitizer for fetched opinions.

### alreadyCovered (reuse — do not rebuild)

- `@beep/schema` `SafeRemoteHost` allowlist.
- `@beep/uspto` `S.RedactedFromValue` env-first config (`packages/drivers/uspto` `Uspto.config.ts` `RedactedFromValue`).
- `@beep/html` render boundary.
- `@beep/provenance` audit-log home.

### cautions

- doc-haus MIT (adapt heuristics); mike unknown-license → reimplement vault/sanitizer patterns, do not copy; courtlistener+mike AGPL → reimplement; harvest-mcp unknown.
- Flag-not-block: injection findings are advisory char-span annotations, never silent drops.
- Coordinate the secret-resolution overlap with multi-provider-llm-dispatch-fallback (key precedence) to avoid two resolvers.

<!-- prior template placeholder retained below -->

## YYYY-MM-DD

<dump>
