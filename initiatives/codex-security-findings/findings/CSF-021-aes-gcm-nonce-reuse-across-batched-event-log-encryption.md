# CSF-021: AES-GCM nonce reuse across batched event log encryption

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 200a511 |
| Reported age | 1mo ago |
| Capture method | dom-fallback |
| Owner area | packages/effect/src/unstable |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced a cryptographic weakness: IV reuse in AES-GCM when encrypting multiple entries in a single batch.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The referenced unstable EventLogEncryption file is absent from current HEAD. The current AI metrics archive encryption path calls randomNonce for each encrypted archive object and fills it with crypto.getRandomValues before AES-GCM encryption.
- Remediation status: `fixed-in-current-head`
- Verification command: `test ! -e packages/effect/src/unstable/eventlog/EventLogEncryption.ts && rg -n 'const nonce = randomNonce\(\)|crypto\.getRandomValues\(nonce\)|AES-GCM' packages/tooling/library/ai-metrics/src/archive.ts`
- Changed files:
  - none
- Verification notes:
  - No current-head code change was needed because the reported reused nonce path is gone and the active encryption path uses fresh random nonces.

## Evidence Paths

- packages/effect/src/unstable/eventlog/EventLogEncryption.ts

## Validation Notes From Codex

- Identify IV generation scope in EventLogEncryption.encrypt and confirm reuse across multiple entries in a batch.
- Confirm the batch IV is transmitted once in the client request while multiple encrypted entries are sent.
- Confirm server persists the same IV for each entry in the batch (no per-entry IV regeneration).
- Demonstrate AES-GCM IV reuse risk with a minimal WebCrypto PoC.

## Sanitized Finding Content

```text
Finding
AES-GCM nonce reuse across batched event log encryption
Report
Chat
Severity
Medium
Adjust to improve accuracy in future scans
Commit
200a511
5:44 PM Apr 3, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a cryptographic weakness: IV reuse in AES-GCM when encrypting multiple entries in a single batch.
The new EventLogEncryption implementation generates one random IV per batch and reuses it for every entry in the batch. AES-GCM requires a unique IV for every encryption under the same key; reusing an IV allows attackers who can observe multiple ciphertexts (e.g., an untrusted event log server or network attacker) to derive relationships between plaintexts and potentially forge entries. This affects event log synchronization where multiple entries can be sent together.
Validation
Identify IV generation scope in EventLogEncryption.encrypt and confirm reuse across multiple entries in a batch.
Confirm the batch IV is transmitted once in the client request while multiple encrypted entries are sent.
Confirm server persists the same IV for each entry in the batch (no per-entry IV regeneration).
Demonstrate AES-GCM IV reuse risk with a minimal WebCrypto PoC.
Validation artifact
Evidence
packages/effect/src/unstable/eventlog/EventLogEncryption.ts
95
return EventLogEncryption.of({
96
encrypt: Effect.fnUntraced(function*(identity, entries) {
97
const data = yield* Effect.orDie(Entry.encodeArray(entries))
98
const key = yield* getKey(identity)
99
const iv = crypto.getRandomValues(new Uint8Array(12))
100
const encryptedEntries = yield* Effect.promise(() =>
101
Promise.all(
102
data.map((entry) =>
103
crypto.subtle.encrypt(
104
{ name: "AES-GCM", iv: toBufferSource(iv), tagLength: 128 },
105
key,
106
toBufferSource(entry)
107
)
Attack-path analysis
Although the crypto flaw is real and can break AES-GCM guarantees, impact is limited to event log entry confidentiality/integrity and requires an observer/untrusted server. No direct code execution or auth bypass is shown. Given uncertain exposure and library-level usage, severity is reduced from high to medium.
Path
EventLogRemote.write batches entries --calls encrypt--> EventLogEncryption.encrypt reuses one IV across batch --returns iv + ciphertext array--> WriteEntries sends single IV + multiple ciphertexts --server persists iv per entry--> EventLogServer stores same IV per entry --nonce reuse enables cryptanalysis/forgery--> Observer/server exploits nonce reuse
EventLogEncryption.encrypt generates a single random IV and reuses it for every AES-GCM encryption in a batch (EventLogEncryption.ts:95-113). EventLogRemote.write then sends one IV with multiple ciphertexts (EventLogRemote.ts:395-413), and EventLogServer persists that same IV for each entry (EventLogServer.ts:92-97). Reusing an AES-GCM nonce under the same key breaks confidentiality and integrity for any observer or untrusted server that can see multiple ciphertexts from the same batch.
Likelihood
High - Exploitation requires access to batched encrypted traffic (e.g., network observer or untrusted log server) and multiple entries per batch; plausible where remote sync is enabled. | Remote network vector
Impact
Medium - Nonce reuse in AES-GCM undermines confidentiality and integrity of event log entries; an observer or untrusted server can derive relationships between plaintexts and potentially forge entries within a batch.
Assumptions
EventLogRemote/Server is used for remote synchronization in at least one deployment of this library.
Attackers can observe EventLogRemote traffic (e.g., untrusted log server or network MITM).
Batched writes include multiple entries per request under the same identity key.
Attacker can observe or operate the event log server or network path.
Multiple entries are encrypted in a single batch using the same identity key.
Controls
AES-GCM encryption is used but nonce uniqueness is not enforced for batched entries.
Blindspots
No deployment manifests or runtime configuration in repo to confirm whether EventLogServer is exposed publicly or only locally.
Repo appears to be a library; actual product usage of EventLogRemote/Server is inferred but not proven here.
No runtime tests/PoC within repo to validate exploitation under real deployments.
Finding content copied
```
