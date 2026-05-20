# CSF-022: CSP nonce now uses non-cryptographic randomness

## Metadata

| Field | Value |
|---|---|
| Severity | Low |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 447ea2e |
| Reported age | 3d ago |
| Capture method | dom-fallback |
| Owner area | apps/opip-web |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced: the CSP nonce generation was changed from a cryptographically secure random UUID to an Effect pseudo-random UUID while the nonce is still trusted by script-src and script-src-elem.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: OPIP CSP nonces are now derived from node:crypto randomUUID rather than Effect Random, and the old Effect.runSync(Random.nextUUIDv4) path is absent from the proxy.
- Remediation status: `fixed-in-current-head`
- Verification command: `rg -n 'Random\.nextUUIDv4|Effect\.runSync\(Random|randomUUID' apps/opip-web/src/proxy.ts`
- Changed files:
  - none
- Verification notes:
  - No current-head code change was needed because the active proxy imports randomUUID from node:crypto and uses it for the nonce.

## Evidence Paths

- apps/opip-web/src/proxy.ts

## Validation Notes From Codex

- Confirm the commit introduced a nonce source change from crypto.randomUUID() to Effect.runSync(Random.nextUUIDv4).
- Confirm the generated nonce is trusted by CSP script-src/script-src-elem and propagated to scripts via x-nonce.
- Confirm the exact Effect version used by the project and inspect that version's Random.nextUUIDv4 implementation.
- Determine whether Effect Random.nextUUIDv4 uses cryptographic randomness or the seedable/default Random service.
- Run a minimal PoC showing nonce generation is deterministic/predictable when the underlying PRNG is controlled and does not call WebCrypto.

## Sanitized Finding Content

```text
Finding
CSP nonce now uses non-cryptographic randomness
Report
Chat
Severity
Low
Adjust to improve accuracy in future scans
Commit
447ea2e
9:44 AM May 16, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced: the CSP nonce generation was changed from a cryptographically secure random UUID to an Effect pseudo-random UUID while the nonce is still trusted by script-src and script-src-elem.
apps/opip-web/src/proxy.ts builds the page Content-Security-Policy around a per-request nonce. This commit changed the nonce source from crypto.randomUUID(), which is backed by Web Crypto CSPRNG, to Effect.runSync(Random.nextUUIDv4). Effect's Random service is a seedable/deterministic pseudo-random service intended for Effect-controlled randomness and testability, not for security tokens. CSP nonces must be cryptographically unpredictable; using a PRNG-backed nonce can allow an attacker who can observe or infer the PRNG sequence to predict a future nonce and bypass script-src nonce enforcement if they also have an HTML/script injection primitive.
Validation
Confirm the commit introduced a nonce source change from crypto.randomUUID() to Effect.runSync(Random.nextUUIDv4).
Confirm the generated nonce is trusted by CSP script-src/script-src-elem and propagated to scripts via x-nonce.
Confirm the exact Effect version used by the project and inspect that version's Random.nextUUIDv4 implementation.
Determine whether Effect Random.nextUUIDv4 uses cryptographic randomness or the seedable/default Random service.
Run a minimal PoC showing nonce generation is deterministic/predictable when the underlying PRNG is controlled and does not call WebCrypto.
Validation artifact
Evidence
apps/opip-web/src/proxy.ts
25
const buildCspHeader = (nonce: string): string =>
26
A.join(
27
[
28
"default-src 'self'",
29
`script-src 'self' 'nonce-${nonce}'${developmentScriptSources}`,
30
`script-src-elem 'self' 'nonce-${nonce}'${vercelLiveSource}${developmentScriptSources}`,
70
export function proxy(request: NextRequest): NextResponse {
71
const nonce = btoa(Effect.runSync(Random.nextUUIDv4));
72
const cspHeader = buildCspHeader(nonce);
73
const requestHeaders = new Headers(request.headers);
74
75
requestHeaders.set("Content-Security-Policy", cspHeader);
76
requestHeaders.set("x-nonce", nonce);
Attack-path analysis
Downgraded from medium to low based on probability × impact. The core statement is correct and evidenced: apps/opip-web/src/proxy.ts uses Effect Random.nextUUIDv4 as a CSP nonce and the locked Effect implementation defaults to Math.random. The app is publicly exposed through Vercel IaC, so the code path is in scope and reachable. However, the attack path is incomplete without an additional injection primitive; reviewed sinks are static or escaped, React auto-escaping is used for normal content, and the site appears to be a public marketing/contact app without authenticated user sessions. This is therefore a real security regression in a defense-in-depth control, but not a demonstrated standalone XSS or high-impact compromise.
Path
Public OPIP Vercel domain --document request matched by proxy--> Next.js proxy middleware --generates nonce--> Effect Random.nextUUIDv4 / Math.random nonce --nonce embedded in CSP and x-nonce--> CSP script-src nonce trust --CSP allows nonce-bearing script--> Victim browser script execution
The finding is real: the commit changed the OPIP CSP nonce source from crypto.randomUUID() to Effect.runSync(Random.nextUUIDv4), and that nonce is trusted in script-src and script-src-elem and propagated through x-nonce to inline scripts. The locked Effect version is 4.0.0-beta.66, and the checked-out Effect source shows Random.nextUUIDv4 builds UUID bytes by calling r.nextIntUnsafe(), while the default Random service uses Math.random(). The app is publicly deployed according to Pulumi/Vercel IaC with Vercel authentication set to none. However, static review did not verify a public HTML/script injection primitive: the reviewed inline script uses static content, the JSON-LD sink escapes '<', React JSX normally auto-escapes content, and the contact status query value is enum-validated. Therefore this is a genuine weakening of a browser security control, but practical exploitation is conditional and likely requires a separate bug or content-source compromise.
Likelihood
Low - The weak nonce is remotely reachable on a public site, but practical exploitation requires predicting/infering a PRNG sequence for the relevant runtime and also finding a separate HTML/script injection primitive. Static review found mitigating patterns and no verified public injection primitive.
Impact
Low - Successful exploitation could bypass CSP nonce enforcement and execute JavaScript in visitors' browsers on the public OPIP site, but no authentication/session takeover or sensitive application data access was shown. The reviewed public content paths do not demonstrate an attacker-controlled script injection sink, so impact remains conditional.
Assumptions
Static analysis only; no cloud, Vercel, Cloudflare, Sanity, HubSpot, or Pulumi APIs were called.
The IaC in infra/opip-web represents an intended deployment of apps/opip-web to public Vercel domains.
Effect Random.nextUUIDv4 in the locked 4.0.0-beta.66 version follows the checked-out Effect source and default Random service behavior.
A practical CSP bypass would require an additional HTML/script injection primitive or compromise of a content source; no public unauthenticated injection primitive was verified in the reviewed code.
Attacker can reach the public OPIP Next.js pages that run the proxy middleware.
Attacker can observe or infer enough PRNG-derived nonces from the same relevant runtime/sequence.
Attacker also has an HTML/script injection primitive into a nonce-protected document response.
A victim loads the injected page while the predicted nonce is valid.
Controls
Content-Security-Policy is present but nonce source is non-CSPRNG
React JSX auto-escaping for normal rendered content
safeJsonScript escapes '<' before JSON-LD dangerous HTML injection
Security headers include HSTS, Referrer-Policy, X-Content-Type-Options, X-Frame-Options DENY, COOP, CORP, and Permissions-Policy
Vercel deployment protection is configured as none for production/public deployment
Blindspots
Static-only review cannot prove the exact Vercel runtime instance behavior, Math.random predictability in production, or whether additional deployed code/config exists outside the checkout.
No cloud APIs were called, so actual Vercel domain attachment, environment variables, and deployment protection were inferred from IaC rather than live state.
A complete whole-application XSS audit was not performed; future components or CMS schemas could introduce an injection primitive that would raise severity.
The checked-out .repos/effect-v4 source was used as dependency implementation evidence in combination with bun.lock; packaged npm code was not independently fetched.
Finding content copied
Finding content copied
```
