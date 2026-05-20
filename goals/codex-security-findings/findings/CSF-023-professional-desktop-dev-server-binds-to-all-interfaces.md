# CSF-023: Professional desktop dev server binds to all interfaces

## Metadata

| Field | Value |
|---|---|
| Severity | Low |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | dd79b67 |
| Reported age | 3d ago |
| Capture method | dom-fallback |
| Owner area | apps/professional-desktop |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

An information exposure risk was introduced by the new professional desktop app's development configuration.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The professional desktop dev script now binds Vite to 127.0.0.1 instead of 0.0.0.0, keeping the development server local by default.
- Remediation status: `fixed-in-branch`
- Verification command: `rg -n 'vite --host 0\.0\.0\.0' apps/professional-desktop || true`
- Changed files:
  - apps/professional-desktop/package.json
- Verification notes:
  - The old all-interface Vite host flag is no longer present in the professional desktop app package script.

## Evidence Paths

- apps/professional-desktop/package.json
- apps/professional-desktop/src-tauri/tauri.conf.json

## Validation Notes From Codex

- Confirm the professional desktop package's dev script explicitly passes an all-interface host to Vite.
- Confirm the Vite app uses a predictable dev port and has no compensating host restriction in vite.config.ts.
- Confirm the Tauri development path invokes the exposed dev script through beforeDevCommand.
- Demonstrate that the real bun run dev command passes --host 0.0.0.0 and that a server launched with those parsed args is reachable via a non-loopback interface and can return source/dev-server paths.
- Demonstrate a loopback-only control is not reachable via the non-loopback IP, showing the exposure is specific to binding all interfaces.

## Sanitized Finding Content

```text
Finding
Professional desktop dev server binds to all interfaces
Report
Chat
Severity
Low
Adjust to improve accuracy in future scans
Commit
dd79b67
2:57 AM May 16, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
An information exposure risk was introduced by the new professional desktop app's development configuration.
The professional desktop package's dev script binds the Vite development server to every network interface. Because the Tauri config uses `bun run dev` as `beforeDevCommand`, developers running `bun run dev:tauri` will also expose that server. Vite dev servers are intended for trusted local development; exposing them on shared networks can leak application source/modules and dev-server metadata to unauthenticated network clients. The server should bind to `127.0.0.1`/`localhost` by default, with a separate explicit opt-in script for LAN testing if needed.
Validation
Confirm the professional desktop package's dev script explicitly passes an all-interface host to Vite.
Confirm the Vite app uses a predictable dev port and has no compensating host restriction in vite.config.ts.
Confirm the Tauri development path invokes the exposed dev script through beforeDevCommand.
Demonstrate that the real bun run dev command passes --host 0.0.0.0 and that a server launched with those parsed args is reachable via a non-loopback interface and can return source/dev-server paths.
Demonstrate a loopback-only control is not reachable via the non-loopback IP, showing the exposure is specific to binding all interfaces.
Validation artifact
Evidence
apps/professional-desktop/package.json
17
"dev": "vite --host 0.0.0.0",
apps/professional-desktop/src-tauri/tauri.conf.json
7
"beforeDevCommand": "bun run dev",
8
"beforeBuildCommand": "bun run build",
9
"devUrl": "http://localhost:1421",
Attack-path analysis
Adjusted from medium to low because the vulnerability is valid but limited to a developer-only workflow and local-network reachability. The repository evidence shows an all-interface Vite bind (`vite --host 0.0.0.0`) and Tauri dev inheritance, so this is not a false positive. However, no deployed ingress/LB, cloud identity, production service exposure, secret reference, arbitrary file read, or executable sink is evidenced. The realistic impact is low-sensitivity disclosure of development source/modules and dev-server metadata from a single developer workstation under specific preconditions, not a broad product compromise.
Path
Adjacent-network unauthenticated attacker --TCP reachability over LAN--> Developer workstation running professional desktop dev workflow --`vite --host 0.0.0.0` listens on all interfaces--> Vite dev server bound to 0.0.0.0:1421 --Serves development module and client endpoints without auth--> Professional desktop source/modules and Vite metadata
The finding is real: the professional desktop package explicitly runs `vite --host 0.0.0.0`, and its Tauri development configuration runs `bun run dev` before loading `http://localhost:1421`. The Vite config fixes the development port at 1421 unless it is unavailable. Earlier validation demonstrated the network consequence by executing the real package script with a Vite stub and successfully fetching source/dev-server endpoints through a non-loopback interface. The attack is nevertheless constrained to developer machines during development, requires LAN/routed access and permissive host firewalling, and the demonstrated impact is limited to unauthenticated disclosure of development source/modules and metadata rather than production data, credentials, authorization bypass, or code execution. Therefore the issue should be treated as a real but lower-severity developer-workstation information exposure rather than a high-impact product runtime vulnerability.
Likelihood
Medium - Developers commonly run dev servers and the configuration makes exposure automatic for `bun run dev` and Tauri dev. Exploitation is unauthenticated once reachable, but it requires a running development session, local-network/routed access to the developer host, and no firewall block.
Impact
Low - The concrete impact is unauthenticated LAN access to development frontend source/modules and Vite metadata. There is no evidence this exposes production databases, API keys, cloud credentials, privileged native Tauri commands, arbitrary filesystem reads, or code execution. If the repository/source is already public, the confidentiality impact is further reduced.
Assumptions
Developers install dependencies and run the normal professional desktop development workflow via `bun run dev`, `bun run dev:tauri`, or root `bun run dev` through Turborepo.
An attacker is on the same LAN or otherwise has routed access to the developer workstation's non-loopback interface.
The developer workstation firewall or OS network profile permits inbound connections to the Vite development port.
The exposed development source/modules have some confidentiality value beyond what is already public in the repository.
professional desktop development server is running
attacker has local-network reachability to the developer host
inbound TCP access to the selected Vite port is not blocked
Vite serves requested development modules/source files
Controls
No application-level authentication is configured for the Vite dev server.
The exposure is development-only and requires the server process to be running.
No repository ingress, load balancer, or container port publication for 1421 was found in the checked artifacts.
Vite's normal filesystem restrictions limit this primarily to project-served files/modules rather than proving arbitrary host file read.
Host firewall and OS network profile may prevent LAN reachability, but this is not enforced by the repository configuration.
Blindspots
Static review cannot determine each developer's host firewall behavior or actual LAN routing exposure.
The real installed Vite version was not dynamically exercised in this static pass; prior validation used a stub because dependencies were unavailable in the container.
The sensitivity of private source/modules and any developer-local Vite environment variables cannot be fully assessed from repository artifacts alone.
No cloud APIs were called, so absence of deployed exposure is based only on repository IaC/manifests inspected.
Finding content copied
Finding content copied
```
