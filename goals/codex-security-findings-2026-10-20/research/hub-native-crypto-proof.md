# Hub native constant-time comparison without diagnostic suppression

Hosted lint-policy job `119033705153` correctly rejected the hub's one-line
`nodeBuiltinImport:off` directive. Removed that directive and the production
Node import. The Bun hub calls `globalThis.crypto.timingSafeEqual` with the
existing 1024-character cap and equal-byte-length guard unchanged.

## Primary API and runtime evidence

Installed `bun-types/globals.d.ts:295` declares
`Crypto.timingSafeEqual: typeof import("node:crypto").timingSafeEqual`.
The [Bun global Crypto reference](https://bun.com/reference/globals/Crypto)
lists the method; the [Bun comparator reference](https://bun.com/reference/node/crypto/timingSafeEqual)
documents the constant-time byte comparison contract and equal-length
requirement. A Bun 1.4.3 probe renders the global implementation as
`function timingSafeEqual() { [native code] }`; equal synthetic bytes return
true and same-length different bytes return false. The global function and
module export are distinct JavaScript function objects; no identity claim
is needed for the API contract or behavior.

Effect Crypto and the installed NodeCrypto adapter expose random/digest
operations without an equivalent comparison method. No ordinary equality,
JavaScript comparison loop or new cryptographic protocol replaces the native
primitive.

## Actual Node coverage platform

The repository's `vitest.setup.ts` already supplies a Bun API compatibility
layer for the canonical Node/V8 coverage lane. The first Node HTTP probe
failed two authentication tests because this new Bun global method was absent
from that existing shim. The production Bun package audit passed at the same
time; this isolated the runtime mismatch. The failed probe receipt is retained.

Extended the existing platform shim to import Node's native `timingSafeEqual`
from its existing crypto import and install it only when the global method is
absent, using the existing property guard. A real Bun implementation is left
untouched. This is a test-platform adapter, not a production Node fallback.
The shim's six existing allowlisted directives are unchanged; no new diagnostic
exception or policy entry was introduced.

## Final verification

- Full hub Node/V8 run: **4 files, 11 tests passed**, 12.24s. These execute the
  real HTTP authentication assertions, including missing, wrong, same-length
  wrong and oversized credentials plus allowed-login requirements. Layer
  coverage has **100% branches**.
- Full Bun hub package audit: **passed**, 10.1s; package has no docgen stage.
- Canonical hub `package-test-typecheck`: passed with no diagnostics.
- Root `tsgo -p tsconfig.configs.json --pretty false`: passed for the modified
  platform shim and repository configuration surface.
- Root Oxlint with nested configs disabled: passed for hub source and shim.
- Global `beep quality tsgo-rules`: passed, 128 installed rules verified and
  all 28 documented options explicit; the existing five declared-off rules
  and the shim allowlist remain unchanged.

Receipts are ignored `../raw/hub-bun-crypto-*.log` and the coverage summary.
SPEC's obsolete hub exception was replaced with the native Bun/test-platform
decision and reversal path. No commit or push by this lane.
