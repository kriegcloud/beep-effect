# CSF-010: Default defect encoding leaks Error causes over RPC

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | New |
| Repository | kriegcloud/beep-effect |
| Source commit | 5938a35 |
| Reported age | 4d ago |
| Capture method | dom-get-page-text |
| Owner area | packages/effect/src/unstable/rpc |
| Lane | _pending P4_ |
| Disposition | _pending P2_ |
| Triage verdict | _pending P2_ |
| Codex close reason | _pending P2_ |

## Summary

Introduced: default Error/Defect serialization now includes `Error.cause`, and RPC defect responses continue to use the default defect schema, creating a new information disclosure path for exposed RPC services when attackers can trigger defects. `Schema.Error()` / `Schema.Defect()` encoding includes an Error object's cause unless callers pass `{ excludeCause: true }`. RPC definitions and transport-level defect responses default to `Schema.Defect()`, so an RPC server that dies with an Error carrying a sensitive cause can serialize that nested cause into the response sent to the client. `Error.cause` commonly contains wrapped request/response objects, database errors, headers, parameters, or provider errors that may include tokens. Before this commit, Error JSON encoding only included name/message and optionally stack.

## Codex Patch

No patch provided by Codex.

- Patch status: _pending P5_

## Current-HEAD Triage

- Verdict: _pending P2_
- Disposition: _pending P2_
- Rationale: _pending P2_
- Remediation status: _pending P5_
- Lane: _pending P4_
- Verification command: _pending P2_
- Changed files: _pending P5_
- Verification notes: _pending P5_

## Evidence Paths

- packages/effect/src/Schema.ts
- packages/effect/src/SchemaTransformation.ts
- packages/effect/src/unstable/rpc/Rpc.ts
- packages/effect/src/unstable/rpc/RpcMessage.ts
- packages/effect/src/unstable/rpc/RpcServer.ts

## Validation Notes From Codex

- Confirm default Error/Defect serialization includes Error.cause unless explicitly disabled.
- Confirm arbitrary nested cause data is serialized into JSON-visible output.
- Confirm RPC definitions use Schema.Defect() by default when no custom defect schema is provided.
- Confirm RPC transport/server response paths send encoded defects to peers.
- Confirm an opt-out mitigation exists (excludeCause: true) but is not the default, and compare parent behavior to verify this is introduced.

## Sanitized Finding Content

```text
Finding
Default defect encoding leaks Error causes over RPC
Report
Chat
Severity
Medium

Commit
5938a35
11:33 PM Jun 3, 2026

by elpresidank

Repository
kriegcloud/beep-effect
Summary

Introduced: default Error/Defect serialization now includes Error.cause, and RPC defect responses continue to use the default defect schema, creating a new information disclosure path for exposed RPC services when attackers can trigger defects.

The new Schema.Error() / Schema.Defect() encoding includes an Error object's cause unless callers explicitly pass { excludeCause: true }. RPC definitions and transport-level defect responses default to Schema.Defect(), so an RPC server that dies with an Error carrying a sensitive cause can serialize that nested cause into the response sent to the client. Error.cause is arbitrary application data and commonly contains wrapped request/response objects, database errors, headers, parameters, or provider errors that may include tokens or other secrets. Before this commit, Error JSON encoding only included name/message and optionally stack, so nested cause data was not exposed by default.

Validation
Confirm default Error/Defect serialization includes Error.cause unless explicitly disabled.
Confirm arbitrary nested cause data is serialized into JSON-visible output.
Confirm RPC definitions use Schema.Defect() by default when no custom defect schema is provided.
Confirm RPC transport/server response paths send encoded defects to peers.
Confirm an opt-out mitigation exists (excludeCause: true) but is not the default, and compare parent behavior to verify this is introduced.

Evidence
packages/effect/src/Schema.ts (L9080-9145 default JSON serializer includes cause unless excludeCause:true)
packages/effect/src/SchemaTransformation.ts (L1108-1122 encodeJsonError adds encoded.cause when !options?.excludeCause)
packages/effect/src/unstable/rpc/Rpc.ts (L957-959 defectSchema = options?.defect ?? Schema.Defect())
packages/effect/src/unstable/rpc/RpcMessage.ts (L353-386 ResponseExitDieEncoded / ResponseDefectEncoded encode with Schema.Defect())
packages/effect/src/unstable/rpc/RpcServer.ts (L663-688 catchCause sends encoded defect to client)

Attack-path analysis

Severity is kept at medium. The core claim is supported by source evidence: Error/Defect encoders include `Error.cause` by default, RPC defaults use `Schema.Defect()`, and RPC server/message paths send encoded defects to peers. This is in scope because it affects exported runtime RPC/MCP/cluster server components. The issue does not justify high or critical because disclosure is conditional on consumer deployment and application error contents, and the proven impact is confidentiality of diagnostic/cause data rather than guaranteed credential theft, RCE, auth bypass, or broad cross-tenant compromise.

Path
Untrusted RPC client --sends request--> HTTP/WebSocket RPC route mounted by RpcServer.layerHttp / protocol layers --dispatches handler / decodes transport--> Application handler or transport error dies with Error --Error has cause--> Error.cause contains sensitive nested object --default defect schema recursively encodes--> Schema.Defect() default encoder serializes cause --encoded defect embedded in response--> RPC Exit/Defect response sent to client

Likelihood
High - The vulnerable serialization path is default behavior and was validated with an executable PoC, and the RPC code is explicitly usable over HTTP/WebSocket. However, real exploitation requires an exposed RPC service plus an attacker-triggerable defect whose cause actually contains sensitive data.
Impact
Medium - A successful exploit can expose sensitive nested diagnostic data or secrets embedded in `Error.cause` across a server/client trust boundary. The impact is limited to confidentiality, is data-dependent, and does not directly provide code execution, authorization bypass, or data modification.
Controls
`Schema.Defect({ excludeCause: true })` exists as an opt-out control but is not the default.
RPC authors can provide a custom `options.defect` schema to `Rpc.make()`.
Stack traces are omitted by default unless `{ includeStack: true }` is used.
Circular Error cause graphs are handled with a WeakSet and encoded as `[Circular]`.
```
