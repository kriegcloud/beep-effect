# Capture

<!--
Stage 0. Append-only raw dump: thoughts, links, screenshots (drop files in
assets/ and reference them), half-sentences, contradictions. Nobody tidies
this file; cleaning it up destroys provenance. New material goes under a new
dated heading at the bottom.
-->

## 2026-06-29 — Gold-intake seed

Source synthesis: [`explorations/_gold-intake/GOLD_SYNTHESIS.md`](../_gold-intake/GOLD_SYNTHESIS.md)
→ section **"### Desktop & document portal" › "#### Secure local document fetch via opaque, expiring links"** (lines ~1355-1369).

### Cluster rationale

New-exploration: a small desktop-sidecar secure-document-download wedge
(UUID/TTL-gated opaque links serving private File-Wrapper PDFs). Two nuggets
converge on the same capability. Two convergent patterns for serving
authoritative documents to a local-first UI without leaking secrets or
identifiers: (a) an edge-gated `GET /resources/:file` route that validates a
`.pdf` suffix + strict v4 UUID before any fs access and streams with
`cache-control: private, no-store`, 404ing on expired/missing; and (b) a
`SecureLinkCache` that stores app/document IDs encrypted in SQLite
(Fernet/Windows DPAPI), mints opaque non-business-revealing URLs, and
auto-expires them (default 7d) keeping the API key server-side.

- route: new-exploration (primaryTarget `secure-document-download-proxy`, targetExists=false)
- wave: P2 (waveHistogram P1=0, P2=2, P3=0)
- themeSpan: [desktop-portal]
- secondaryTargets: [`apps/professional-desktop`, `packages/drivers/uspto`]

### Nuggets (2)

- **patents-mcp-server#11** (patents-mcp-server) — Edge-gated resource route with strict-UUID guard serving private, no-store PDFs. `src/resources/routes.ts:17-36`. → feeds netNew "Edge-gated secure resource route (strict-UUID guard, no-store private PDFs) as the desktop-sidecar @beep/uspto File-Wrapper download proxy" + beep-target `apps/professional-desktop` sidecar secure resource route. Snippet: `GET /resources/:file validates .pdf suffix + strict v4 UUID before any fs access, streams with cache-control: private, no-store, 404s on expired/missing; "access control at the edge; UUID+TTL is in-app defense-in-depth"` (priority P2, recommend port).
- **uspto_pfw_mcp#11** (uspto_pfw_mcp) — Secure local download proxy with encrypted opaque links (Fernet/DPAPI). `src/patent_filewrapper_mcp/proxy/secure_link_cache.py:24-55`. → feeds netNew "Encrypted opaque TTL-gated download links (Fernet/DPAPI analog) over the desktop sidecar" + beep-target `@beep/uspto` document download proxy. Snippet: `SecureLinkCache stores app/document IDs encrypted in SQLite (Fernet), issues opaque non-business-revealing URLs, auto-expires (default 7 days), optional Windows DPAPI key protection, keeps API key server-side` (priority P2, recommend port).

### netNew (build list)

- Edge-gated secure resource route (strict-UUID guard, no-store private PDFs) as the desktop-sidecar @beep/uspto File-Wrapper download proxy
- Encrypted opaque TTL-gated download links (Fernet/DPAPI analog) over the desktop sidecar

### alreadyCovered (reuse)

- (none recorded)

### Cautions

- Pairs with @beep/uspto File-Wrapper download + the desktop portal; keep keys server-side (no key on desktop).
- P2 — depends on the uspto driver depth + desktop sidecar.
