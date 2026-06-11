# CSF-002: Event-log RPC trusts spoofable publicKey fields

## Metadata

| Field | Value |
|---|---|
| Severity | High |
| Codex status | New |
| Repository | kriegcloud/beep-effect |
| Source commit | 0dc3200 |
| Reported age | 6d ago |
| Capture method | dom-get-page-text |
| Owner area | packages/effect/src |
| Lane | _pending P4_ |
| Disposition | _pending P2_ |
| Triage verdict | _pending P2_ |
| Codex close reason | _pending P2_ |

## Summary

A security bug was introduced in the newly added event-log RPC server implementation. Authentication establishes an EventLog.Identity, but write and changes handlers trust request-controlled publicKey fields and never enforce that they match the authenticated identity.

The event-log RPC authentication middleware verifies that the client has authenticated and stores that identity in client annotations, but the subsequent WriteSingle/WriteChunked and Changes handlers do not compare the authenticated identity with the publicKey embedded in the request. Write requests are decoded from attacker-controlled msgpack payloads that include publicKey, and change streams also accept publicKey as a request field. Both the encrypted and unencrypted server layers pass those request-controlled values directly into storage and authorization. As a result, any authenticated client can set publicKey to another user's identity and fetch that user's change stream or write entries under that user's log. For the unencrypted server this can disclose plaintext event data and bypass tenant/identity authorization if policies are based on the provided publicKey. For the encrypted server it still permits cross-identity ciphertext/metadata access and log poisoning or denial of service by writing malformed entries under a victim identity.

## Codex Patch

- Patch file: [`./patches/CSF-002.patch`](./patches/CSF-002.patch)
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

- Authentication middleware must be shown to require only presence of an authenticated EventLog.Identity, not equality with later request publicKey fields.
- Write RPC path must be shown to accept request-controlled publicKey embedded in msgpack write payloads and forward it without binding to the authenticated identity.
- Changes RPC path must be shown to accept request-controlled publicKey and forward it without binding to the authenticated identity.
- Encrypted/unencrypted downstream server layers must be checked for use of request.publicKey in storage, mapping, or authorization decisions.
- A targeted PoC must show unauthenticated access is rejected, but after authenticating as attacker, a mismatched victim publicKey write/change request succeeds.

## Sanitized Finding Content

```text
Finding
Event-log RPC trusts spoofable publicKey fields
Report
Patch
Chat
Severity
High

Adjust to improve accuracy in future scans

Commit
0dc3200
9:34 AM Jun 2, 2026

by elpresidank

Repository
kriegcloud/beep-effect
Summary

A security bug was introduced in the newly added event-log RPC server implementation. Authentication establishes an EventLog.Identity, but write and changes handlers trust request-controlled publicKey fields and never enforce that they match the authenticated identity.

The event-log RPC authentication middleware verifies that the client has authenticated and stores that identity in client annotations, but the subsequent WriteSingle/WriteChunked and Changes handlers do not compare the authenticated identity with the publicKey embedded in the request. Write requests are decoded from attacker-controlled msgpack payloads that include publicKey, and change streams also accept publicKey as a request field. Both the encrypted and unencrypted server layers pass those request-controlled values directly into storage and authorization. As a result, any authenticated client can set publicKey to another user's identity and fetch that user's change stream or write entries under that user's log. For the unencrypted server this can disclose plaintext event data and bypass tenant/identity authorization if policies are based on the provided publicKey. For the encrypted server it still permits cross-identity ciphertext/metadata access and log poisoning or denial of service by writing malformed entries under a victim identity.

Validation
Authentication middleware must be shown to require only presence of an authenticated EventLog.Identity, not equality with later request publicKey fields.
Write RPC path must be shown to accept request-controlled publicKey embedded in msgpack write payloads and forward it without binding to the authenticated identity.
Changes RPC path must be shown to accept request-controlled publicKey and forward it without binding to the authenticated identity.
Encrypted/unencrypted downstream server layers must be checked for use of request.publicKey in storage, mapping, or authorization decisions.
A targeted PoC must show unauthenticated access is rejected, but after authenticating as attacker, a mismatched victim publicKey write/change request succeeds.
Validation artifact
Evidence
packages/effect/src/unstable/eventlog/EventLogMessage.ts
279
export class WriteEntries extends Schema.Class<WriteEntries>("effect/eventlog/EventLogRemote/WriteEntries")({
280
publicKey: Schema.String,
281
storeId: StoreId,
282
iv: Transferable.Uint8Array,
283
encryptedEntries: Schema.Array(EncryptedEntry)
299
export class WriteEntriesUnencrypted extends Schema.Class<WriteEntriesUnencrypted>("effect/eventlog/EventLogRemote/WriteEntriesUnencrypted")({
301
publicKey: Schema.String,
339
export class ChangesRpc extends Rpc.make("EventLog.Changes", {
341
publicKey: Schema.String,
342
storeId: StoreId,
343
startSequence: Schema.Number
packages/effect/src/unstable/eventlog/EventLogServer.ts
72
export const layerAuthMiddleware: Layer.Layer<EventLogAuthentication> = Layer.succeed(EventLogAuthentication, (effect, { client, rpc }) => {
75
const identity = Context.getOrUndefined(client.annotations, EventLog.Identity)
76
if (identity) return Effect.provideService(effect, EventLog.Identity, identity)
194
"EventLog.WriteSingle": Effect.fnUntraced(function*(request) {
195
yield* options.onWrite(request.data)
197
"EventLog.WriteChunked": Effect.fnUntraced(function*(request, { client }) {
201
yield* options.onWrite(data)
203
"EventLog.Changes": (request) =>
204
options.changes({
205
publicKey: request.publicKey,
packages/effect/src/unstable/eventlog/EventLogServerEncrypted.ts
61
onWrite: Effect.fnUntraced(function*(data) {
62
const request = yield* WriteEntries.decode(data).pipe(...)
80
return yield* storage.write(request.publicKey, request.storeId, entries).pipe(...)
93
changes: ({ publicKey, storeId, startSequence }) =>
94
storage.changes(publicKey, storeId, startSequence).pipe(...)
packages/effect/src/unstable/eventlog/EventLogServerUnencrypted.ts
177
onWrite: Effect.fnUntraced(function*(data) {
178
const request = yield* WriteEntriesUnencrypted.decode(data).pipe(...)
190
const resolvedStoreId = yield* mapping.resolve({ publicKey: request.publicKey, storeId: request.storeId })
204
yield* auth.authorizeWrite({ publicKey: request.publicKey, storeId: resolvedStoreId, entries: request.entries })
237
changes: Effect.fnUntraced(function*(request) {
238
const storeId = yield* mapping.resolve({ publicKey: request.publicKey, storeId: request.storeId })
242
yield* auth.authorizeRead({ publicKey: request.publicKey, storeId })

Attack-path analysis

Kept high. The code evidence and executable validation show a real, reachable authorization bypass in the event-log RPC server: authentication creates an EventLog.Identity, but WriteSingle/WriteChunked and Changes trust attacker-controlled publicKey values from msgpack payloads or RPC fields. Downstream encrypted and unencrypted server layers use those values for storage and authorization. This supports high impact for deployed multi-identity event-log services, especially unencrypted deployments where plaintext events can be read or victim logs modified. It is not raised to critical because exploitation requires an authenticated client and an exposed deployed event-log RPC service; the repository does not show default public ingress, a fixed public port, unauthenticated access, RCE, account takeover, or direct secret compromise.

Path
Authenticated attacker RPC client --authenticates as attacker--> EventLogServer.layerAuthMiddleware --permits request because any identity is present--> WriteSingle/WriteChunked or Changes handler --forwards request.publicKey without identity comparison--> Encrypted/unencrypted storage and authorization callbacks --reads or writes victim-scoped event entries--> Victim event log data or integrity

Likelihood
High - If an event-log RPC server is deployed for multiple identities, exploitation is straightforward after normal authentication and only requires changing publicKey fields in standard RPC payloads. Overall likelihood is medium because the vulnerable feature is an optional unstable server layer and the repository does not show a default public deployment or fixed exposed port. Remote network vector
Impact
High - Successful exploitation crosses an identity boundary. In unencrypted mode, an authenticated low-privilege client can read another publicKey's plaintext change stream and write entries under that identity, impacting confidentiality and integrity. In encrypted mode, plaintext may remain protected by cryptography, but cross-identity ciphertext/metadata access and log poisoning/DoS remain security-relevant.
Assumptions
The vulnerable event-log server layer is relevant when a consumer deploys EventLogServerEncrypted or EventLogServerUnencrypted over an RPC transport such as HTTP, WebSocket, socket, or another RpcServer.Protocol.
An attacker has a legitimate low-privilege event-log identity and can complete the normal Hello/Authenticate flow for that identity.
The attacker knows or can learn a victim publicKey and target storeId.
Controls
Hello/Authenticate challenge-response session authentication exists
EventLogAuthentication middleware blocks requests with no EventLog.Identity
No identity-to-request-publicKey binding is enforced for WriteSingle, WriteChunked, or Changes
Blindspots
Static repository review cannot determine how downstream consumers deploy RpcServer.Protocol, whether the service is internet-facing, or what ports are used.
Custom StoreMapping, Storage, or EventLogServerAuthorization implementations outside this repository could reduce or increase practical impact.
```
