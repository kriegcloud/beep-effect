---
"@beep/schema": patch
"@beep/box": patch
"@beep/nlp-mcp": patch
---

Harden the SSRF guards against IPv4-mapped IPv6 bypass (follow-up to the PR #254 security work).

- `@beep/schema` `SafeRemoteHost`: decode the IPv4 embedded in IPv4-mapped IPv6 hosts (`new URL().hostname` normalizes them to compressed hex, e.g. `::ffff:c0a8:101`) and classify it through the shared `isInternalIpv4` checks, closing a bypass where mapped RFC1918 addresses (`http://[::ffff:c0a8:101]/` → 192.168.1.1) reached internal space. Also add the opt-in `resolve` hook to `assertAllowedRemoteUrl` so callers can resolve DNS (the module `@remarks` already documented it).
- `@beep/box`: wire the by-URL SSRF guard with a fail-closed `node:dns` resolver so a hostname resolving to internal space is rejected before the SDK connects.
- `@beep/nlp-mcp`: apply the same IPv4-mapped IPv6 decode to the dataset-loader's duplicated SSRF guard.
