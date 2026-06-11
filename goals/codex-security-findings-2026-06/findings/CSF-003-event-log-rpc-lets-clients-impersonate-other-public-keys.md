# CSF-003: Event-log RPC lets clients impersonate other public keys

## Metadata

| Field | Value |
|---|---|
| Severity | High |
| Codex status | New |
| Repository | kriegcloud/beep-effect |
| Source commit | 92ef20f |
| Reported age | 6d ago |
| Capture method | dom-get-page-text |
| Owner area | packages/effect/src |
| Lane | _pending P4_ |
| Disposition | _pending P2_ |
| Triage verdict | _pending P2_ |
| Codex close reason | _pending P2_ |

## Summary

Introduced a cross-identity authorization bypass in the new unstable event-log remote server implementation. Authentication proves control of one public key, but subsequent read/write handlers trust publicKey values supplied in request payloads instead of the authenticated session identity.

The event-log remote protocol authenticates a session during EventLog.Authenticate and stores the authenticated identity in client annotations. However, the authentication middleware only checks that some identity exists; it does not bind later requests to that identity. Write payloads and Changes requests carry their own publicKey field, and the shared server handler forwards that request-controlled publicKey to storage and authorization logic. In the unencrypted server, authorizeRead/authorizeWrite and store mapping are evaluated against the attacker-supplied publicKey, allowing an authenticated client to read or write another identity's event log if policy trusts the provided key. In the encrypted server, storage is also indexed by the supplied publicKey, allowing cross-identity ciphertext access and log poisoning/DoS. The fix should reject any request whose publicKey differs from the authenticated EventLog.Identity.publicKey, or remove publicKey from post-authenticated request payloads and derive it from the session annotation. The unused authorizeIdentity hook should also be applied during authentication if identity-level authorization is intended.

## Codex Patch

- Patch file: [`./patches/CSF-003.patch`](./patches/CSF-003.patch)
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

- packages/effect/src/unstable/eventlog/EventLogMessage.ts
- packages/effect/src/unstable/eventlog/EventLogServer.ts
- packages/effect/src/unstable/eventlog/EventLogServerEncrypted.ts
- packages/effect/src/unstable/eventlog/EventLogServerUnencrypted.ts

## Validation Notes From Codex

- Authentication establishes a session identity, but middleware only checks that some identity exists and does not bind later request publicKey fields to it.
- Post-authenticated Write and Changes RPC payload schemas expose client-controlled publicKey fields.
- Unencrypted handlers use request.publicKey for store mapping, authorizeWrite/authorizeRead, handler identity, and persistence; runtime PoC shows an attacker-authenticated session succeeds when claiming the victim key.
- Encrypted handlers use request.publicKey for storage.write/storage.changes; runtime PoC shows writes/reads are keyed by the victim key despite attacker authentication.
- The authorizeIdentity hook is not applied during authentication; the PoC's authorizeIdentity always fails, yet authentication still succeeds.

## Sanitized Finding Content

```text
Finding
Event-log RPC lets clients impersonate other public keys
Report
Patch
Chat
Severity
High

Commit
92ef20f
1:09 AM Jun 2, 2026

by elpresidank

Repository
kriegcloud/beep-effect
Summary

Introduced a cross-identity authorization bypass in the new unstable event-log remote server implementation. Authentication proves control of one public key, but subsequent read/write handlers trust publicKey values supplied in request payloads instead of the authenticated session identity.

The event-log remote protocol authenticates a session during EventLog.Authenticate and stores the authenticated identity in client annotations. However, the authentication middleware only checks that some identity exists; it does not bind later requests to that identity. Write payloads and Changes requests carry their own publicKey field, and the shared server handler forwards that request-controlled publicKey to storage and authorization logic. In the unencrypted server, authorizeRead/authorizeWrite and store mapping are evaluated against the attacker-supplied publicKey, allowing an authenticated client to read or write another identity's event log if policy trusts the provided key. In the encrypted server, storage is also indexed by the supplied publicKey, allowing cross-identity ciphertext access and log poisoning/DoS. The fix should reject any request whose publicKey differs from the authenticated EventLog.Identity.publicKey, or remove publicKey from post-authenticated request payloads and derive it from the session annotation. The unused authorizeIdentity hook should also be applied during authentication if identity-level authorization is intended.

Validation
Authentication establishes a session identity, but middleware only checks that some identity exists and does not bind later request publicKey fields to it.
Post-authenticated Write and Changes RPC payload schemas expose client-controlled publicKey fields.
Unencrypted handlers use request.publicKey for store mapping, authorizeWrite/authorizeRead, handler identity, and persistence; runtime PoC shows an attacker-authenticated session succeeds when claiming the victim key.
Encrypted handlers use request.publicKey for storage.write/storage.changes; runtime PoC shows writes/reads are keyed by the victim key despite attacker authentication.
The authorizeIdentity hook is not applied during authentication; the PoC's authorizeIdentity always fails, yet authentication still succeeds.
Validation artifact
Evidence
packages/effect/src/unstable/eventlog/EventLogMessage.ts
279 export class WriteEntries extends Schema.Class<WriteEntries>("effect/eventlog/EventLogRemote/WriteEntries")({ publicKey: Schema.String, storeId, iv, encryptedEntries })
299 export class WriteEntriesUnencrypted extends Schema.Class(...)({ publicKey: Schema.String, storeId, entries })
339 export class ChangesRpc extends Rpc.make("EventLog.Changes", { payload: { publicKey: Schema.String, storeId, startSequence }, ... }).middleware(EventLogAuthentication)
packages/effect/src/unstable/eventlog/EventLogServer.ts
72 export const layerAuthMiddleware ... { const identity = Context.getOrUndefined(client.annotations, EventLog.Identity); if (identity) return Effect.provideService(effect, EventLog.Identity, identity); ... }
194 "EventLog.WriteSingle": ... yield* options.onWrite(request.data)
203 "EventLog.Changes": (request) => options.changes({ publicKey: request.publicKey, storeId: request.storeId, startSequence: request.startSequence })
packages/effect/src/unstable/eventlog/EventLogServerEncrypted.ts
61 onWrite: ... const request = yield* WriteEntries.decode(data) ... return yield* storage.write(request.publicKey, request.storeId, entries)
93 changes: ({ publicKey, storeId, startSequence }) => storage.changes(publicKey, storeId, startSequence)
packages/effect/src/unstable/eventlog/EventLogServerUnencrypted.ts
190 const resolvedStoreId = yield* mapping.resolve({ publicKey: request.publicKey, storeId: request.storeId })
204 yield* auth.authorizeWrite({ publicKey: request.publicKey, storeId: resolvedStoreId, entries: request.entries })
234 Effect.provideService(EventLog.Identity, makeClientIdentity(request.publicKey))
237 changes: ... yield* auth.authorizeRead({ publicKey: request.publicKey, storeId })

Attack-path analysis

Kept at high. The code evidence confirms the core bug: authentication establishes one publicKey but post-authenticated Write and Changes requests carry and trust a separate attacker-controlled publicKey. The unencrypted server uses that supplied key for mapping, authorizeWrite/authorizeRead, processing, and persistence; the encrypted server uses it for storage.write/storage.changes. The validation stage also produced an executable Vitest PoC showing authentication as an attacker followed by successful victim-key write/read paths. This is in-scope because the affected event-log server is exported in the published effect package and explicitly installs RPC server layers. It is not raised to critical because exploitation requires the optional/unstable event-log RPC server to be deployed and reachable and requires the attacker to authenticate as some identity; no unauthenticated universal compromise, RCE, or credential theft is demonstrated.

Path
Remote event-log RPC transport --normal session authentication--> Authenticate as attacker publicKey --attacker remains authenticated--> Post-auth Write/Changes payload with victim publicKey --middleware does not compare public keys--> layerAuthMiddleware checks only identity presence --handler forwards request.publicKey--> Server storage/authz uses request.publicKey --cross-identity namespace access--> Victim log read/write or ciphertext poisoning

Likelihood
High - Exploitation is simple once an event-log RPC server is reachable and the attacker has any valid identity; the runtime PoC exercised normal RPC handlers. Remote network vector
Impact
High - Cross-identity authorization bypass can expose or modify another public key's plaintext event log in unencrypted deployments and can poison/read ciphertext namespaces in encrypted deployments.
Assumptions
A deployment exposes the unstable EventLogRemoteRpcs server over an RpcServer.Protocol such as HTTP, WebSocket, or socket transport.
The deployment has more than one event-log public-key identity or uses publicKey as an authorization/storage namespace.
The attacker can complete the normal EventLog.Hello/EventLog.Authenticate challenge flow for their own public key; victim private keys are not required.
Controls
EventLog.Hello challenge; EventLog.Authenticate session signature verification; EventLogAuthentication middleware; EventLogServerAuthorization for unencrypted read/write hooks; Encrypted event payload option.
Blindspots
Static repository review found no concrete production deployment manifest, ingress, listening port, or public host binding for EventLogRemoteRpcs in this checkout.
Impact varies by storage backend, store-mapping policy, and whether plaintext or encrypted event-log mode is used.
```
