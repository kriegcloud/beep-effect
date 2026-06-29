# Secure Document Download Proxy

## Status

Stage: `research`
Status: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Spark

Serve authoritative File-Wrapper PDFs to the local-first desktop UI through
opaque, TTL-gated links so the LLM never receives raw bytes, identifiers stay
hidden, and the API key never leaves the server — combining an edge-gated
UUID-guarded resource route with an encrypted, auto-expiring opaque-link store.

## Next Open Question

**Q6: Serve boundary — existing sidecar HTTP route vs Tauri custom protocol vs
IPC blob.** Highest-leverage open fork: it sets the security-semantic backbone
(header honoring + existence opacity) and carries the only unresolved spike
(per-platform webview `no-store`/BFCache honoring for custom-scheme responses).
Eight branch-closing decisions are pre-drafted with recommendations in
[`DECISIONS.md`](./DECISIONS.md) — resolve them via
`/grill-with-docs secure-document-download-proxy`.

## Read This First

1. [`ops/manifest.json`](./ops/manifest.json) - machine state: stage, status, open questions.
2. [`CAPTURE.md`](./CAPTURE.md) - raw dump (stage 0).
3. [`RESEARCH.md`](./RESEARCH.md) - prior art + capability inventory (stage 1, if present).
4. [`DECISIONS.md`](./DECISIONS.md) - grilling log (stage 2, if present).
5. [`BRIEF.md`](./BRIEF.md) - shaped pitch (stage 3, if present).
6. [`MAP.md`](./MAP.md) - decomposition (stage 4, if present).

## Trail

- 2026-06-29: research-complete — RESEARCH.md synthesized, codex gate-1 folded, DECISIONS pre-drafted.
- 2026-06-29: packet opened from gold-intake cluster 'Secure document download proxy (opaque TTL-gated links)' (2 nuggets).
