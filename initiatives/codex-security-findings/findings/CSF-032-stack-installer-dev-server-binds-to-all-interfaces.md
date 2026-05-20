# CSF-032: Stack Installer dev server binds to all interfaces

## Metadata

| Field | Value |
|---|---|
| Severity | Low |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 6a86555 |
| Reported age | 5d ago |
| Capture method | dom-fallback |
| Owner area | apps/stack-installer |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced an unsafe development default. Change the script to bind to localhost/127.0.0.1 by default, for example `vite --host 127.0.0.1`, and document a separate opt-in script for LAN testing if needed.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The Stack Installer dev script now binds Vite to 127.0.0.1 instead of 0.0.0.0, keeping the development server local by default.
- Remediation status: `fixed-in-branch`
- Verification command: `rg -n 'vite --host 0\.0\.0\.0' apps/stack-installer || true`
- Changed files:
  - apps/stack-installer/package.json
- Verification notes:
  - The old all-interface Vite host flag is no longer present in the Stack Installer app package script.

## Evidence Paths

- apps/stack-installer/package.json
- apps/stack-installer/src-tauri/tauri.conf.json

## Validation Notes From Codex

- Confirm the commit introduced the stack-installer package/config containing the suspected scripts.
- Confirm the default development script passes --host 0.0.0.0 to Vite.
- Confirm the normal Tauri dev workflow automatically runs that default dev script.
- Confirm the resulting configured bind/port is reachable via a non-loopback interface and that a loopback-only bind would not be.
- Start the real Vite dev server and observe its actual listening socket; blocked by missing dependencies/Bun catalog-resolution failure in this container.

## Sanitized Finding Content

```text
Finding
Stack Installer dev server binds to all interfaces
Report
Chat
Severity
Low
Adjust to improve accuracy in future scans
Commit
6a86555
10:19 AM May 14, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced an unsafe development default. Change the script to bind to localhost/127.0.0.1 by default, for example `vite --host 127.0.0.1`, and document a separate opt-in script for LAN testing if needed.
The added `@beep/stack-installer` package defines its default `dev` script as `vite --host 0.0.0.0`, and the Tauri `beforeDevCommand` runs that script. As a result, anyone on a reachable LAN/VPN interface can connect to the Vite development server whenever a developer runs the app in dev mode. Vite dev servers are not intended to be exposed without additional controls; they can disclose bundled source, transformed modules, HMR endpoints, and files under Vite's allowed workspace policy. This does not appear to affect the production build, and the current app exposes only a dry-run UI, so impact is limited, but the default should bind to loopback and require an explicit opt-in for LAN testing.
Validation
Confirm the commit introduced the stack-installer package/config containing the suspected scripts.
Confirm the default development script passes --host 0.0.0.0 to Vite.
Confirm the normal Tauri dev workflow automatically runs that default dev script.
Confirm the resulting configured bind/port is reachable via a non-loopback interface and that a loopback-only bind would not be.
Start the real Vite dev server and observe its actual listening socket; blocked by missing dependencies/Bun catalog-resolution failure in this container.
Validation artifact
Evidence
apps/stack-installer/package.json
14
"scripts": {
15
"audit": "bun run --if-present beep:audit",
16
"codegen": "echo 'no codegen needed'",
17
"dev": "vite --host 0.0.0.0",
18
"dev:tauri": "tauri dev",
apps/stack-installer/src-tauri/tauri.conf.json
6
"build": {
7
"beforeDevCommand": "bun run dev",
8
"beforeBuildCommand": "bun run build",
9
"devUrl": "http://localhost:1420",
10
"frontendDist": "../dist"
Attack-path analysis
Kept at low. The code evidence confirms the unsafe default: `apps/stack-installer/package.json` runs `vite --host 0.0.0.0`, Tauri `beforeDevCommand` invokes that dev script, and Vite is configured on port 1420. This is reachable from local-network scope when a developer runs dev mode. However, impact is limited to an unauthenticated development server exposing frontend/dev assets; the app is documented and implemented as dry-run-only, the native bridge is limited to a health command, capabilities are minimal, and production build/package paths are not shown to bind publicly. Probability and impact therefore do not justify medium/high severity.
Path
Developer runs stack-installer dev workflow --normal dev command path--> `bun run dev` executes `vite --host 0.0.0.0` --explicit host bind plus configured Vite port--> Vite listens on all interfaces, port 1420 --reachable non-loopback interface--> LAN/VPN attacker connects unauthenticated --HTTP access to unauthenticated dev server--> Development assets/source/HMR surface disclosed
The finding is real: @beep/stack-installer's default dev script explicitly starts Vite with `--host 0.0.0.0`, and Tauri dev mode automatically invokes that script. The Vite config sets the development port to 1420. This creates an unauthenticated local-network service whenever a developer runs the app in dev mode. The impact is limited: this is not the production build path, the app is currently dry-run-only, the Tauri capability set is minimal, and the only native command shown is a health command returning static metadata. The practical security consequence is exposure of Vite development assets/source-related content to adjacent-network attackers, so low severity is appropriate.
Likelihood
Low - Exploitation requires a developer to be actively running the dev workflow and an attacker to be on a reachable LAN/VPN path with firewall access to port 1420. The bind default makes exposure plausible in common dev environments, but it is not internet-facing by repository configuration.
Impact
Low - An adjacent-network attacker can access the Vite dev server and obtain dev-served frontend/source-related assets, but there is no evidence of production exposure, secrets disclosure, live installer execution, privileged native Tauri command access, or cloud identity compromise.
Assumptions
Vite's normal dev-server behavior applies when repository dependencies are installed.
An attacker must be on a network path that can reach the developer machine's non-loopback interface, such as LAN, VPN, or a permissive local network.
The issue is evaluated for developer/dev-mode exposure, not production packaged Tauri distribution.
A developer runs the stack-installer dev server directly with bun run dev or indirectly through tauri dev/dev:tauri.
The developer host firewall and network permit inbound connections to the Vite port.
The attacker is on a reachable LAN/VPN/adjacent network path.
Controls
Development-only exposure; production build uses `vite build` rather than the dev server.
Current app is dry-run-only and does not perform live installer, Discord mutation, or plaintext-secret handling.
Tauri native bridge is narrow; only a static health command is visible in the affected package.
No authentication or authorization is configured on the Vite dev server.
No ingress, load balancer, Kubernetes service, or cloud-facing deployment manifest was identified for this dev server.
Blindspots
Static review did not start the real Vite server because dependencies may be unavailable in the analysis container; validation evidence instead demonstrated equivalent bind semantics.
Repository artifacts do not reveal developer host firewall posture or whether LAN/VPN peers can actually reach port 1420 in real environments.
Vite version-specific behavior and exact file-serving allowlist were not dynamically verified against installed dependencies.
Future phases may add live installer/native capabilities to stack-installer; severity should be revisited if this same dev exposure remains after privileged functionality is added.
Finding content copied
Finding content copied
```
