# Secure Document Download Proxy — Decisions

<!--
ALIGN seed (stage 2, pre-draft). Each entry is a load-bearing branch-closing
fork posed with a RECOMMENDED answer and grounded rationale, but left OPEN.
The user resolves these via `/grill-with-docs secure-document-download-proxy`,
one at a time, recommended-answer-first; resolutions then rewrite each entry to
the resolved-log form (Question / Answer / Rationale) and clear the matching
manifest `openQuestions` entry. Do NOT self-resolve here.
Grounding: RESEARCH.md (external landscape + in-repo inventory, Codex gate-1
folded 2026-06-29) and CAPTURE.md (gold-intake seed, 2 convergent nuggets).
-->

## Q1: Scope boundary — stand-alone capability packet vs fold into an existing driver/goal

**Recommended:** Stand alone. Ship this as its own thin, provider-agnostic
secure-download capability; do **not** bury it inside `@beep/uspto`, attach it to
`goals/m365-driver`, or graft it onto `goals/file-processing-capability`.

**Rationale:** RESEARCH "Routing decision (provisional)" makes the case directly:
`goals/m365-driver/SPEC.md` is a read-only Graph driver that explicitly defers
delivery to the `m365-document-ingest` follow-on; `goals/file-processing-capability/SPEC.md`
is an extraction substrate with zero download/serve scope; folding the gate into
`@beep/uspto` would couple a cross-cutting delivery concern to one origin and
violate the driver-boundary rule (a driver wraps an external API, it does not own
a desktop serve route). The two convergent porting sources (edge-gated route +
`SecureLinkCache`) describe one self-contained capability, and `apps/professional-desktop`
is the wiring host, not the home for the reusable mint+gate logic. This is the
most structurally consequential fork — it frames every question below.

**Status:** open (for /grill-with-docs)

## Q2: Package placement — where the reusable mint+gate+seal logic lives

**Recommended:** A new dedicated package (working name `@beep/secure-links` /
`@beep/document-proxy`) holding the provider-agnostic mint/lookup/revoke +
seal/unseal + branded route-param schema, with only the serve route and the
PGlite store binding composed in `apps/professional-desktop`. Recommend the
`packages/foundation/capability` tier (sibling to `@beep/observability`) because
this is a cross-cutting delivery capability, not an external-API driver. Confirm
the exact tier (capability vs a drivers/delivery tier) in grill.

**Rationale:** RESEARCH inventory shows the idiomatic HTTP shapes
(`HttpApiEndpoint`, `HttpServerResponse`) and server precedents already live under
`packages/foundation/capability/observability`, and the gating pattern is
explicitly "provider-agnostic." The Constraints section states
`apps/professional-desktop` is the wiring host but "not the home for the reusable
mint+gate logic." Repo-native modeling bricks exist for the package body:
`EntityTable.models.ts`, `EntityId.ts`, the `$I` identity composer, and the branded
`String.UUID` / `Model.UuidV4*` helpers. Open sub-fork: drivers tier vs
foundation/capability tier vs a new delivery tier.

**Status:** open (for /grill-with-docs)

## Q3: First slice — which origin to gate first

**Recommended:** USPTO File-Wrapper PDFs, gated over the existing
`@beep/uspto` `downloadDocument` verb (`Uspto.service.ts:47/281`), preserving its
fail-closed `assertAllowedRemoteUrl` SSRF guard; persist provider document
*references* or provider-owned fetch closures, never raw origin URLs.

**Rationale:** RESEARCH "Origin-fetch verb already exists": `downloadDocument`
returns `Effect<Uint8Array, UsptoError>` with the API key already held server-side
as `O.Option<Redacted.Redacted<string>>` and injected via header, and the document
ref already carries an optional `downloadUrl`. The capture wave is P2, explicitly
"depends on the uspto driver depth + desktop sidecar." The SSRF guard
(`Uspto.service.ts:285` → `SafeRemoteHost.ts:366-415`, also reused by `@beep/box`)
is fail-closed and same-host; a generic proxy that stored raw URLs would let a
later fetch path dereference them unguarded, regressing the credential-leak
boundary. Gating one concrete origin first keeps the wedge small while the
gate stays provider-agnostic for the next origin.

**Status:** open (for /grill-with-docs)

## Q4: Token model — opaque reference vs stateless sealed token

**Recommended:** Hybrid opaque-reference. Put a v4 UUID basename in the URL
(`…/<uuid>.pdf`) backed by an encrypted store row holding the real ids +
`expires_at` + `revoked_at`. Enforce expiry at *both* the store query
(`expires_at > now AND revoked_at IS NULL`) and the edge 404.

**Rationale:** RESEARCH "Opaque-id vs sealed-token, the core tradeoff": an opaque
reference token is compact and non-revealing and supports *immediate* revocation,
at the cost of a stateful lookup per request; a stateless sealed token is
self-contained but "cannot be revoked before expiry without reintroducing state."
The locked threat model needs both a 7-day default TTL and revocation, so the
hybrid both porting sources already use is the fit. W3C TAG capability-URL hygiene
reinforces: unguessable RNG id, no business/PII in the URL, existence opacity via
404-on-expired.

**Status:** open (for /grill-with-docs)

## Q5: Token cryptography (build-vs-buy) — reuse the in-repo AES-256-GCM seal vs vendor a token library

**Recommended:** Build in-repo. Reuse the WebCrypto `AES-256-GCM` + `Redacted`
seal/unseal precedent in `packages/tooling/library/ai-metrics/src/archive.ts`
(`importKey` raw:160, `encrypt`:287, `decrypt`:380, 12-byte random nonce,
`AiMetricsRawArchiveKey` as `S.RedactedFromValue`:103-118). Encrypt the
id-mapping payload, not the PDF bytes. Add **no** new crypto dependency.

**Rationale:** RESEARCH "Token format landscape": there is no maintained Effect/TS
Fernet; the canonical Branca (`branca@0.5.0`, 2022) and PASETO (`paseto@3.1.4`,
2023) libs are stale; `iron-webcrypto`, `@noble/ciphers`, and `jose` are all MIT
but all net-new deps (none currently present). `archive.ts` is the exact in-repo
"encrypt-a-small-payload-with-a-server-held-`Redacted`-key" pattern, and the
synthesis says outright "the Fernet analog should follow this, not a new
dependency." If grill surfaces an AEAD/algorithm-agility requirement that the
AES-GCM precedent cannot meet, the fallback ranking is `@noble/ciphers`
(`xchacha20poly1305`, 0-dep, audited) over the stale token packages.

**Status:** open (for /grill-with-docs)

## Q6: Serve boundary — existing sidecar HTTP route vs Tauri custom protocol vs IPC blob

**Recommended:** Extend the existing Bun sidecar `HttpRouter` with a
`GET /resources/:file` handler on the live loopback `:3939` listener
(`server/main.ts:51-68`), which already honors standard RFC 9111 `Cache-Control`
and is CSP-/dev-proxy-wired — but FIRST tighten the sidecar's
`allowedOrigins: ["*"]` CORS (`main.ts:55-60`) before bearer-PDF capability URLs
ride that listener. Reject `asset-protocol` + `convertFileSrc` (no TTL/opaque
indirection, no per-response headers) and `tauri-plugin-localhost` (Tauri's own
docs warn of "considerable security risks"). Defer the Tauri custom URI-scheme
protocol unless the per-platform webview spike forces it.

**Rationale:** RESEARCH "Tauri serve-boundary options" (Codex gate-1 correction):
the desktop already has an HTTP edge — what is missing is the document route, not
a listener. The HTTP path honors `private, no-store` natively, whereas whether each
platform webview (WKWebView / WebView2 / WebKitGTK) honors `no-store`/BFCache
suppression for *custom-scheme* responses is flagged UNVERIFIED against a primary
per-platform source — an open spike that argues against custom-protocol as the
first cut. This is the highest-leverage open fork: it sets the security-semantic
backbone (header honoring + existence opacity) and carries the only unresolved
spike. The CORS tightening is a hard prerequisite, not optional.

**Status:** open (for /grill-with-docs)

## Q7: Key custody / at-rest wrapping (vendor/auth) — reuse M365 msal-node-extensions vs adopt tauri-plugin-keyring

**Recommended:** Reuse the M365 `@azure/msal-node-extensions` OS-backed
persistence precedent (`M365.auth.ts:124-146` `buildCachePlugin`,
`DataProtectionScope.CurrentUser`, `usePlaintextFileOnLinux: false`; installed
`5.3.0`, MIT) on the Bun-sidecar side for at-rest master-key wrapping, and hold
the active key in-process as Effect `Redacted`. Do **not** adopt deprecated Tauri
Stronghold; defer `tauri-plugin-keyring` unless a Rust-side requirement emerges.

**Rationale:** RESEARCH "OS-backed secret-persistence precedent" (Codex gate-1):
`@beep/m365` has *executable* DPAPI/Keychain/libsecret persistence already
installed (MIT) — lower friction than `tauri-plugin-keyring`, which is absent
(confirmed via `rg`) and would add a new Rust/Tauri dependency plus per-platform
and transitive `keyring`-crate surface to vet. Tauri Stronghold is deprecated and
slated for removal in v3. `Redacted` is the established repo-wide in-process guard
(`@beep/uspto`, `@beep/sanity`, ai-metrics) so the key never lands in logs, traces,
or the URL. Caveat to confirm in grill: the Tauri-vs-Electron/Next runtime
assumption behind the OS-keyring framing is itself flagged UNVERIFIED.

**Status:** open (for /grill-with-docs)

## Q8: Backing store — extend the desktop PGlite/Drizzle runtime vs bespoke store

**Recommended:** Add a Drizzle link-store table (`id → enc_payload, expires_at,
revoked_at`) to the desktop sidecar's existing `makeBundledPgliteLayer` +
`PgliteDrizzleLive` runtime (`Pglite.ts:252-279`) and its bundled boot-time
migration set (`Migrations.ts`), using the `EntityTable` / `EntityId` / `$I`
precedents. Do **not** create a bespoke SQLite file, and do **not** target the
root catalog's `@electric-sql/pglite` `0.5.3`.

**Rationale:** RESEARCH "Backing link store" (Codex gate-1 correction): the
professional-desktop sidecar pins `@electric-sql/pglite` `0.4.6` (aliasing
`0.5.3` as legacy) and already owns a file-backed runtime over the `@beep/pglite`
driver with migrations applied on boot. The link store should ride that existing
runtime, or a separate store chosen with an explicit migration/storage-compat
rationale — not a bespoke SQLite file and not a fresh store against root `0.5.3`,
either of which would fork the desktop's persistence story. Keeping the store in
the sidecar process (not renderer IDB/Dexie) is also required by the
"key/server-side, local-first" boundary.

**Status:** open (for /grill-with-docs)
