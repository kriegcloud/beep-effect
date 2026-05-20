# CSF-045: Stale Bun lock keeps old Next peer copies

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 02c1fba |
| Reported age | 4d ago |
| Capture method | dom-fallback |
| Owner area | apps/opip-web |
| Triage verdict | needs-current-head-review |
| Codex close reason | pending |

## Summary

Introduced dependency-lock inconsistency: old Next.js 16.3.0-canary.19 peer copies remain in the lockfile after updating the top-level Next.js dependency to 16.3.0-canary.21.

## Current-HEAD Triage

- Verdict: `needs-current-head-review`
- Rationale: Pending validation against current `HEAD`.
- Remediation status: `not-started`
- Verification command: `pending`

## Evidence Paths

- apps/opip-web/src/app/layout.tsx
- bun.lock
- package.json

## Validation Notes From Codex

- Confirm the checked-out commit and that the relevant dependency files are package.json and bun.lock.
- Confirm top-level package.json and primary bun.lock resolve Next.js to 16.3.0-canary.21.
- Confirm stale bun.lock peer-resolution entries remain for @vercel/analytics/next, @vercel/speed-insights/next, and next-pwa/next at 16.3.0-canary.19.
- Confirm Bun's dependency graph output reports both Next.js versions and nests the old version under the suspected packages.
- Confirm at least one application path/config uses the affected packages, making the stale peer resolutions relevant to the app graph.

## Sanitized Finding Content

```text
Finding
Stale Bun lock keeps old Next peer copies
Report
Chat
Severity
Informational
Adjust to improve accuracy in future scans
Commit
02c1fba
8:37 PM May 15, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced dependency-lock inconsistency: old Next.js 16.3.0-canary.19 peer copies remain in the lockfile after updating the top-level Next.js dependency to 16.3.0-canary.21.
The patch updates package.json and the primary bun.lock entry for next to 16.3.0-canary.21. However, the same lockfile now contains newly added peer dependency entries resolving Next.js to the old 16.3.0-canary.19 for packages used by the Next apps. `bun pm ls --all` confirms the lock graph contains both next@16.3.0-canary.21 and nested next@16.3.0-canary.19 under @vercel/analytics, @vercel/speed-insights, and next-pwa. This can lead to inconsistent builds/runtime behavior and may unintentionally keep older framework code in the installed dependency graph despite the apparent update. I did not identify a concrete exploitable security vulnerability from the patch alone.
Validation
Confirm the checked-out commit and that the relevant dependency files are package.json and bun.lock.
Confirm top-level package.json and primary bun.lock resolve Next.js to 16.3.0-canary.21.
Confirm stale bun.lock peer-resolution entries remain for @vercel/analytics/next, @vercel/speed-insights/next, and next-pwa/next at 16.3.0-canary.19.
Confirm Bun's dependency graph output reports both Next.js versions and nests the old version under the suspected packages.
Confirm at least one application path/config uses the affected packages, making the stale peer resolutions relevant to the app graph.
Validation artifact
Evidence
apps/opip-web/src/app/layout.tsx
95
const [{ Analytics }, { SpeedInsights }] = await Promise.all([
96
import("@vercel/analytics/next"),
97
import("@vercel/speed-insights/next"),
98
]);
bun.lock
5256
"next": ["next@16.3.0-canary.21", "", { "dependencies": { "@next/env": "16.3.0-canary.21", "@swc/helpers": "0.5.15", "baseline-browser-mapping": "^2.9.19", "caniuse-lite": "^1.0.30001579", "postcss": "8.5.10", "styled-jsx": "5.1.6" }, "optionalDependencies": { "@next/swc-darwin-arm64": "16.3.0-canary.21", "@next/swc-darwin-x64": "16.3.0-canary.21", "@next/swc-linux-arm64-gnu": "16.3.0-canary.21", "@next/swc-linux-arm64-musl": "16.3.0-canary.21", "@next/swc-linux-x64-gnu": "16.3.0-canary.21", "@next/swc-linux-x64-musl": "16.3.0-canary.21", "@next/swc-win32-arm64-msvc": "16.3.0-canary.21", "@next/swc-win32-x64-msvc": "16.3.0-canary.21", "sharp": "^0.34.5" }, "peerDependencies": { "@opentelemetry/api": "^1.1.0", "@playwright/test": "^1.51.1", "babel-plugin-react-compiler": "*", "react": "^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0", "react-dom": "^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0", "sass": "^1.3.0" }, "optionalPeers": ["@opentelemetry/api", "@playwright/test", "babel-plugin-react-compiler", "sass"], "bin": { "next": "dist/bin/next" } }, "sha512-ZSACNdtm25Chpz+P56l4VeNxstlp80XOdSKkrkNgs1xRf9YAVlqSz0E55eYKXgRjThf92oGqokVLa6kZKsGM/g=="],
5257
5258
"next-pwa": ["next-pwa@5.6.0", "", { "dependencies": { "babel-loader": "^8.2.5", "clean-webpack-plugin": "^4.0.0", "globby": "^11.0.4", "terser-webpack-plugin": "^5.3.3", "workbox-webpack-plugin": "^6.5.4", "workbox-window": "^6.5.4" }, "peerDependencies": { "next": ">=9.0.0" } }, "sha512-XV8g8C6B7UmViXU8askMEYhWwQ4qc/XqJGnexbLV68hzKaGHZDMtHsm2TNxFcbR7+ypVuth/wwpiIlMwpRJJ5A=="],
6662
"@vercel/analytics/next": ["next@16.3.0-canary.19", "", { "dependencies": { "@next/env": "16.3.0-canary.19", "@swc/helpers": "0.5.15", "baseline-browser-mapping": "^2.9.19", "caniuse-lite": "^1.0.30001579", "postcss": "8.5.10", "styled-jsx": "5.1.6" }, "optionalDependencies": { "@next/swc-darwin-arm64": "16.3.0-canary.19", "@next/swc-darwin-x64": "16.3.0-canary.19", "@next/swc-linux-arm64-gnu": "16.3.0-canary.19", "@next/swc-linux-arm64-musl": "16.3.0-canary.19", "@next/swc-linux-x64-gnu": "16.3.0-canary.19", "@next/swc-linux-x64-musl": "16.3.0-canary.19", "@next/swc-win32-arm64-msvc": "16.3.0-canary.19", "@next/swc-win32-x64-msvc": "16.3.0-canary.19", "sharp": "^0.34.5" }, "peerDependencies": { "@opentelemetry/api": "^1.1.0", "@playwright/test": "^1.51.1", "babel-plugin-react-compiler": "*", "react": "^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0", "react-dom": "^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0", "sass": "^1.3.0" }, "optionalPeers": ["@opentelemetry/api", "@playwright/test", "babel-plugin-react-compiler", "sass"], "bin": { "next": "dist/bin/next" } }, "sha512-B4fWf+Iz8Zv8jOrBTy0npAVBXoKFkbofdLW5UcDFR+3i0n8Zdrd4Ki9ks0pXu+laVkIq3i6chylh4jYhZM4cKg=="],
6663
6664
"@vercel/speed-insights/next": ["next@16.3.0-canary.19", "", { "dependencies": { "@next/env": "16.3.0-canary.19", "@swc/helpers": "0.5.15", "baseline-browser-mapping": "^2.9.19", "caniuse-lite": "^1.0.30001579", "postcss": "8.5.10", "styled-jsx": "5.1.6" }, "optionalDependencies": { "@next/swc-darwin-arm64": "16.3.0-canary.19", "@next/swc-darwin-x64": "16.3.0-canary.19", "@next/swc-linux-arm64-gnu": "16.3.0-canary.19", "@next/swc-linux-arm64-musl": "16.3.0-canary.19", "@next/swc-linux-x64-gnu": "16.3.0-canary.19", "@next/swc-linux-x64-musl": "16.3.0-canary.19", "@next/swc-win32-arm64-msvc": "16.3.0-canary.19", "@next/swc-win32-x64-msvc": "16.3.0-canary.19", "sharp": "^0.34.5" }, "peerDependencies": { "@opentelemetry/api": "^1.1.0", "@playwright/test": "^1.51.1", "babel-plugin-react-compiler": "*", "react": "^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0", "react-dom": "^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0", "sass": "^1.3.0" }, "optionalPeers": ["@opentelemetry/api", "@playwright/test", "babel-plugin-react-compiler", "sass"], "bin": { "next": "dist/bin/next" } }, "sha512-B4fWf+Iz8Zv8jOrBTy0npAVBXoKFkbofdLW5UcDFR+3i0n8Zdrd4Ki9ks0pXu+laVkIq3i6chylh4jYhZM4cKg=="],
6870
"next-pwa/next": ["next@16.3.0-canary.19", "", { "dependencies": { "@next/env": "16.3.0-canary.19", "@swc/helpers": "0.5.15", "baseline-browser-mapping": "^2.9.19", "caniuse-lite": "^1.0.30001579", "postcss": "8.5.10", "styled-jsx": "5.1.6" }, "optionalDependencies": { "@next/swc-darwin-arm64": "16.3.0-canary.19", "@next/swc-darwin-x64": "16.3.0-canary.19", "@next/swc-linux-arm64-gnu": "16.3.0-canary.19", "@next/swc-linux-arm64-musl": "16.3.0-canary.19", "@next/swc-linux-x64-gnu": "16.3.0-canary.19", "@next/swc-linux-x64-musl": "16.3.0-canary.19", "@next/swc-win32-arm64-msvc": "16.3.0-canary.19", "@next/swc-win32-x64-msvc": "16.3.0-canary.19", "sharp": "^0.34.5" }, "peerDependencies": { "@opentelemetry/api": "^1.1.0", "@playwright/test": "^1.51.1", "babel-plugin-react-compiler": "*", "react": "^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0", "react-dom": "^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0", "sass": "^1.3.0" }, "optionalPeers": ["@opentelemetry/api", "@playwright/test", "babel-plugin-react-compiler", "sass"], "bin": { "next": "dist/bin/next" } }, "sha512-B4fWf+Iz8Zv8jOrBTy0npAVBXoKFkbofdLW5UcDFR+3i0n8Zdrd4Ki9ks0pXu+laVkIq3i6chylh4jYhZM4cKg=="],
package.json
329
"next": "16.3.0-canary.21",
330
"next-pwa": "^5.6.0",
Attack-path analysis
The low scanner finding is validated as a real dependency-lock bug but not as a real security vulnerability. Evidence confirms mixed Next.js versions in bun.lock and application relevance through opip-web imports, and IaC confirms opip-web is publicly deployed on Vercel. Nevertheless, this is not attacker-controlled and no concrete vulnerable Next.js advisory, exploit primitive, or sensitive impact is shown. Probability is very low because exploitation needs an unproven vulnerability and runtime selection path; impact is non-security correctness/build drift. Therefore it should be tracked as dependency hygiene, not security criticality.
Path
Public opip-web Vercel deployment configuration --Vercel build uses bun install/build for apps/opip-web--> Bun workspace dependency graph --lockfile also contains stale peer resolutions--> Stale peer next@16.3.0-canary.19 entries --analytics/speed-insights imports make stale peer entries application-relevant--> opip-web layout imports Vercel Analytics/Speed Insights --only inconsistency proven; no exploit sink shown--> Non-security build/runtime inconsistency
The repository evidence supports the reported dependency-lock inconsistency but does not support treating it as an exploitable security vulnerability. package.json declares next 16.3.0-canary.21, while bun.lock still contains peer entries resolving @vercel/analytics/next, @vercel/speed-insights/next, and next-pwa/next to next@16.3.0-canary.19. The affected app is a real public deployment path: Pulumi config creates a Vercel project for apps/opip-web with public domains and Vercel auth set to none. Application relevance exists because apps/opip-web dynamically imports the Vercel analytics packages and depends on next-pwa. However, the evidence demonstrates only inconsistent framework copies in the dependency graph. There is no attacker-controlled input, no vulnerable sink, no known CVE tied to canary.19 in the evidence, and no proof of code execution, auth bypass, sensitive data exposure, or cross-boundary impact.
Likelihood
Ignore - An attacker cannot directly trigger the stale lock entry through the public web surface. Exploitation would require an additional, specific, reachable vulnerability in next@16.3.0-canary.19 and proof that the stale peer copy is the one used on the vulnerable path.
Impact
Ignore - The proven impact is limited to dependency graph inconsistency and potential build/runtime correctness drift. No security consequence such as RCE, file read, auth bypass, tenant escape, secret leakage, or meaningful data compromise is demonstrated.
Assumptions
Static-only review of repository artifacts; no cloud APIs or live Vercel/AWS/Cloudflare resources were queried.
The opip-web Pulumi stack represents an intended public Vercel deployment because it configures opip.law/www.opip.law/staging.opip.law domains and Vercel authentication deployment type 'none'.
No specific public vulnerability in Next.js 16.3.0-canary.19 versus 16.3.0-canary.21 was provided or proven by the validation evidence.
Bun install/build honors the stale peer-resolution lock entries
Affected application path imports @vercel/analytics/next, @vercel/speed-insights/next, or next-pwa peer code
A concrete exploitable security flaw exists in next@16.3.0-canary.19 that is fixed in 16.3.0-canary.21
The vulnerable code path is reachable in production, likely requiring Vercel insights/PWA-related runtime or build behavior
Controls
Next.js security headers configured: HSTS, Referrer-Policy, X-Content-Type-Options, X-Frame-Options, Permissions-Policy, COOP, CORP, Origin-Agent-Cluster
React/Next default escaping for rendered JSX
Pulumi stores sensitive runtime values as secure config/env refs
No repository evidence of an executable sink or attacker-controlled path caused by the stale Next peer dependency
Blindspots
Static review cannot prove which nested package copy is loaded in every Bun/Vercel production build path.
No live deployment, build artifact, or runtime module-resolution trace was inspected.
No external vulnerability database lookup was performed; assessment relies on repository evidence and supplied validation stating no concrete exploitable vulnerability was identified.
The Pulumi configuration shows public deployment intent but not current live DNS/Vercel state.
Finding content copied
Finding content copied
```
