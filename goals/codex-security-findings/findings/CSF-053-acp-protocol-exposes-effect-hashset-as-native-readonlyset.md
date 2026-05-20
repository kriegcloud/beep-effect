# CSF-053: ACP protocol exposes Effect HashSet as native ReadonlySet

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 6912323 |
| Reported age | 1w ago |
| Capture method | dom-fallback |
| Owner area | packages/drivers/acp/src |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced a runtime type-contract bug in the ACP protocol adapter by replacing the previous native Set([0]) with an Effect HashSet cast to ReadonlySet<number>.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The ACP protocol adapter now returns a native Set<number> for clientIds instead of casting an Effect HashSet to the ReadonlySet contract.
- Remediation status: `fixed-in-branch`
- Verification command: `bunx tsc --noEmit --pretty false -p packages/drivers/acp/tsconfig.json`
- Changed files:
  - packages/drivers/acp/src/protocol.ts
- Verification notes:
  - The ACP package typecheck passes with the native Set runtime shape.

## Evidence Paths

- packages/drivers/acp/src/protocol.ts

## Validation Notes From Codex

- Verify the changed ACP line replaced native new Set([0]) with HashSet.make(0) hidden behind an unsafe ReadonlySet<number> cast.
- Confirm the Effect RpcServer.Protocol contract requires an effect yielding native ReadonlySet<number> semantics.
- Exercise the real makeAcpPatchedProtocol path rather than only a standalone HashSet snippet.
- Demonstrate that the yielded object lacks native ReadonlySet members such as .has and .size.
- Capture direct crash evidence and attempt additional tooling; direct crash succeeded, valgrind was unavailable, and LLDB was attempted.

## Sanitized Finding Content

```text
Finding
ACP protocol exposes Effect HashSet as native ReadonlySet
Report
Chat
Severity
Informational
Adjust to improve accuracy in future scans
Commit
6912323
2:27 AM May 6, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a runtime type-contract bug in the ACP protocol adapter by replacing the previous native Set([0]) with an Effect HashSet cast to ReadonlySet<number>.
RpcServer.Protocol declares clientIds as an Effect yielding a native ReadonlySet<number>. This commit returns HashSet.make(0) and forces it through an unsafe cast. Effect HashSet is an immutable Effect collection, not a native Set; consumers expecting ReadonlySet methods/properties such as has(), size, entries(), keys(), or forEach() can fail at runtime. The core ACP server loop may not currently exercise clientIds directly, so this is a low-impact functional crash/compatibility issue rather than a security vulnerability.
Validation
Verify the changed ACP line replaced native new Set([0]) with HashSet.make(0) hidden behind an unsafe ReadonlySet<number> cast.
Confirm the Effect RpcServer.Protocol contract requires an effect yielding native ReadonlySet<number> semantics.
Exercise the real makeAcpPatchedProtocol path rather than only a standalone HashSet snippet.
Demonstrate that the yielded object lacks native ReadonlySet members such as .has and .size.
Capture direct crash evidence and attempt additional tooling; direct crash succeeded, valgrind was unavailable, and LLDB was attempted.
Validation artifact
Evidence
packages/drivers/acp/src/protocol.ts
522
const serverProtocol = RpcServer.Protocol.of({
523
clientIds: Effect.succeed(HashSet.make(0) as unknown as ReadonlySet<number>),
Attack-path analysis
The original low classification is appropriate for a software defect, but for security criticality it should be ignored. The code evidence confirms a real runtime type-contract bug at `packages/drivers/acp/src/protocol.ts:522-523`, and the upstream contract evidence confirms the expected native `ReadonlySet<number>`. However, the only demonstrated impact is local functional crash/compatibility failure. Static service mapping found no public ingress, load balancer, port, service identity, secret handling path, or cross-boundary attack path for this ACP stdio adapter. The vulnerable behavior does not enable data access, command execution, privilege escalation, authentication bypass, or tenant-boundary bypass.
Path
Local ACP stdio peer / in-process caller --constructs or reaches local ACP protocol--> makeAcpPatchedProtocol --provides RpcServer protocol service--> RpcServer.Protocol.serverProtocol.clientIds --yields non-native set object--> Effect HashSet cast as ReadonlySet --native Set method access fails--> Runtime TypeError / local session crash
The finding is valid as a functional runtime bug: `packages/drivers/acp/src/protocol.ts` returns an Effect HashSet while the Effect RPC contract requires `Effect<ReadonlySet<number>>`. Effect HashSet is only an Effect collection/Iterable and does not provide native Set instance methods. The prior PoC demonstrated `ids.has is not a function`. Static reachability shows the component is a private @beep/acp driver built on Stdio and provided to in-process RpcServer instances, not a public HTTP service or privileged boundary from the threat model. Therefore the issue should not be treated as a security vulnerability; impact is limited to local compatibility/crash behavior.
Likelihood
Ignore - Exploitation as a security issue is not realistic from the modeled attack surfaces. The affected adapter uses stdio and requires an internal consumer path that calls `clientIds` as a native Set; attacker-controlled input is not what creates the mismatch.
Impact
Ignore - The proven outcome is a TypeError or local protocol compatibility crash. There is no evidence of arbitrary code execution, authentication bypass, authorization bypass, cross-tenant access, sensitive data disclosure, secret exposure, or privilege escalation.
Assumptions
Analysis was limited to repository artifacts in /workspace/beep-effect and did not call cloud APIs.
.specs was excluded from assessment as requested.
The prior validation PoC is accepted as evidence that the type mismatch can cause a runtime TypeError, but it proves a functional crash rather than a security impact.
No repository evidence was found that the ACP stdio protocol adapter is directly exposed as an internet or local-network service.
An application or test constructs the @beep/acp patched protocol.
A consumer invokes protocol.serverProtocol.clientIds and uses native ReadonlySet members such as has() or size.
For attacker influence, the attacker would need to be the local ACP stdio peer or otherwise trigger a code path that consumes clientIds.
Controls
Stdio transport rather than repository-defined network listener
Private package metadata
Schema decoding for ACP notification payloads
No executable, file-read, identity, or secret sink is reached by the HashSet/ReadonlySet mismatch itself
Blindspots
Static-only repository review cannot prove how downstream consumers outside this repository may embed @beep/acp.
The repository contains many packages and no complete production deployment manifest tying ACP to an exposed service was identified.
Prior validation required local shims because package installation had environment limitations, but the exercised source line and crash mechanism are directly supported by static code evidence.
Finding content copied
Finding content copied
```
