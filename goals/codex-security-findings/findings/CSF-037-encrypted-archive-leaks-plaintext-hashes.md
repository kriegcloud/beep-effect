# CSF-037: Encrypted archive leaks plaintext hashes

## Metadata

| Field | Value |
|---|---|
| Severity | Low |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | a3857ad |
| Reported age | 1w ago |
| Capture method | dom-fallback |
| Owner area | packages/tooling/library/ai-metrics |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced a privacy/info-leak bug in the new durable ingest storage path. Raw transcript bytes are encrypted, but an unsalted digest of the plaintext is stored as cleartext metadata and exported to derived storage.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: Encrypted raw archive plaintext identity is now stored as a salted private identifier hash instead of a public unsalted plaintext digest, and mirror export omits the raw archive object table.
- Remediation status: `fixed-in-current-head`
- Verification command: `rg -n 'plaintextContentHash = yield\* hashPrivateIdentifier\(content|omittedMirrorTables = \["ai_metrics_raw_archive_objects"\]' packages/tooling/library/ai-metrics/src/archive.ts packages/tooling/library/ai-metrics/src/mirror.ts`
- Changed files:
  - none
- Verification notes:
  - The archive writer hashes raw content through hashPrivateIdentifier, using the operator salt when provided.

## Evidence Paths

- packages/tooling/library/ai-metrics/src/archive.ts
- packages/tooling/library/ai-metrics/src/derived-storage.ts

## Validation Notes From Codex

- Confirm durable raw archive encrypts transcript bytes but stores metadata separately in a readable envelope.
- Confirm plaintextContentHash is computed from raw transcript plaintext using an unsalted/public deterministic hash.
- Confirm the plaintext hash is persisted beyond the archive envelope into derived DuckDB/Parquet storage.
- Demonstrate an attacker without the AES key can confirm guessed transcript content by hashing guesses and comparing metadata.
- Attempt crash/Valgrind/debugger-style validation before finalizing with code understanding; crash is not applicable to this info leak, Valgrind/GDB were unavailable, and LLDB ran the PoC without a crash.

## Sanitized Finding Content

```text
Finding
Encrypted archive leaks plaintext hashes
Report
Chat
Severity
Low
Adjust to improve accuracy in future scans
Commit
a3857ad
12:49 AM May 6, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a privacy/info-leak bug in the new durable ingest storage path. Raw transcript bytes are encrypted, but an unsalted digest of the plaintext is stored as cleartext metadata and exported to derived storage.
The durable ingest feature encrypts raw transcript content with AES-256-GCM, but it also computes `plaintextContentHash` using the public, unsalted `hashPublicTextSha256(content)` helper and persists that value outside the ciphertext. The hash is written into the archive envelope JSON and into the `ai_metrics_raw_archive_objects` DuckDB table/Parquet exports. Anyone who can read the archive metadata or derived storage, but does not have the AES key, can still perform offline confirmation attacks by hashing guessed transcript contents and comparing them to `plaintext_content_hash`. This undermines the confidentiality boundary expected from encrypted raw archive storage, especially for small or predictable transcript/source files such as service metadata, one-line transcripts, or templated prompts.
Validation
Confirm durable raw archive encrypts transcript bytes but stores metadata separately in a readable envelope.
Confirm plaintextContentHash is computed from raw transcript plaintext using an unsalted/public deterministic hash.
Confirm the plaintext hash is persisted beyond the archive envelope into derived DuckDB/Parquet storage.
Demonstrate an attacker without the AES key can confirm guessed transcript content by hashing guesses and comparing metadata.
Attempt crash/Valgrind/debugger-style validation before finalizing with code understanding; crash is not applicable to this info leak, Valgrind/GDB were unavailable, and LLDB ran the PoC without a crash.
Validation artifact
Evidence
packages/tooling/library/ai-metrics/src/archive.ts
60
{
61
algorithm: S.Literal("AES-256-GCM"),
62
archiveObjectId: S.String,
63
ciphertextBase64: S.String,
64
encryptedAtEpochMillis: S.Number,
65
nonceBase64: S.String,
66
plaintextContentHash: S.String,
67
sourceKind: AiMetricsTranscriptSource,
68
sourcePathHash: S.String,
214
const plaintextContentHash = yield* hashPublicTextSha256(content).pipe(
215
Effect.mapError((cause) => archiveFailure("Failed to hash raw archive plaintext.", cause))
216
);
217
const archiveObjectId = yield* archiveObjectIdFor(sourceKind, sourcePathHash, plaintextContentHash);
218
const archivePath = archiveObjectPath(pathApi, rawArchiveDir, sourceKind, archiveObjectId);
219
const alreadyArchived = yield* fs.exists(archivePath);
220
if (alreadyArchived) {
221
return yield* readExistingArchiveObject(archivePath);
222
}
223
224
const key = yield* importRawArchiveKey(rawArchiveKeyBase64);
225
const nonce = randomNonce();
226
const ciphertext = yield* Effect.tryPromise({
227
try: () =>
228
globalThis.crypto.subtle.encrypt(
229
{ iv: cryptoBytes(nonce), name: "AES-GCM" },
230
key,
231
new TextEncoder().encode(content)
232
),
233
catch: (cause) => archiveFailure("Failed to encrypt raw archive object.", cause),
234
});
235
const encryptedAtEpochMillis = yield* Clock.currentTimeMillis;
236
const envelope = new AiMetricsEncryptedRawArchiveEnvelope({
237
algorithm: "AES-256-GCM",
238
archiveObjectId,
239
ciphertextBase64: Encoding.encodeBase64(new Uint8Array(ciphertext)),
240
encryptedAtEpochMillis,
241
nonceBase64: Encoding.encodeBase64(nonce),
242
plaintextContentHash,
243
sourceKind,
244
sourcePathHash,
245
});
packages/tooling/library/ai-metrics/src/derived-storage.ts
60
`CREATE TABLE IF NOT EXISTS ai_metrics_raw_archive_objects (
61
archive_object_id VARCHAR PRIMARY KEY,
62
ingest_run_id VARCHAR NOT NULL,
63
source_kind VARCHAR NOT NULL,
64
source_path_hash VARCHAR NOT NULL,
65
plaintext_content_hash VARCHAR NOT NULL,
66
archive_path VARCHAR NOT NULL,
67
algorithm VARCHAR NOT NULL,
68
encrypted_at_epoch_ms BIGINT NOT NULL
353
yield* duckdb.run(
354
`INSERT OR REPLACE INTO ai_metrics_raw_archive_objects (
355
archive_object_id,
356
ingest_run_id,
357
source_kind,
358
source_path_hash,
359
plaintext_content_hash,
360
archive_path,
361
algorithm,
362
encrypted_at_epoch_ms
363
) VALUES (
364
$archiveObjectId,
365
$ingestRunId,
366
$sourceKind,
367
$sourcePathHash,
368
$plaintextContentHash,
369
$archivePath,
370
$algorithm,
371
$encryptedAtEpochMillis
372
)`,
373
{
374
algorithm: archive.algorithm,
375
archiveObjectId: archive.archiveObjectId,
376
archivePath: archive.archivePath,
377
encryptedAtEpochMillis: archive.encryptedAtEpochMillis,
378
ingestRunId: input.ingestRunId,
379
plaintextContentHash: archive.plaintextContentHash,
380
sourceKind: archive.sourceKind,
381
sourcePathHash: archive.sourcePathHash,
382
}
Attack-path analysis
Kept as low. Static evidence confirms the bug and reachability in the AI metrics CLI/forwarder path: plaintext content is deterministically SHA-256 hashed and persisted in cleartext archive, DuckDB, and Parquet metadata. However, the practical attack requires local/internal/storage read access to generated metadata and only enables guessed-content confirmation, not direct decryption or broad data exfiltration. Repository IaC/config evidence shows secret references and local/tailnet-oriented paths, with no public ingress or service account privilege path for the generated files.
Path
AI metrics forwarder reads Codex/Claude/OpenClaw source file --normal durable ingest--> writeEncryptedRawArchiveObject computes SHA-256(content) --hash written outside ciphertext--> Envelope stores ciphertext and plaintextContentHash in cleartext JSON --archive metadata projected--> Derived DuckDB table stores plaintext_content_hash --derived tables exported--> Parquet export copies derived table --read access enables comparison--> Metadata reader performs offline confirmation attack
The finding is real and reachable through normal AI metrics forwarder use. `runAiMetricsForwarder` reads transcript/source files, `writeEncryptedRawArchiveObject` encrypts the raw content with AES-GCM, but also computes deterministic `hashPublicTextSha256(content)` and stores it as `plaintextContentHash` in cleartext archive metadata. That value is then inserted into `ai_metrics_raw_archive_objects.plaintext_content_hash` and exported to Parquet. This violates the package privacy contract for encrypted raw archives because a reader of metadata or derived storage can confirm guessed plaintext without the archive key. Severity remains low because there is no repository evidence of public network exposure, exploitation requires storage/local/internal read access, and the attack confirms guesses rather than decrypting arbitrary transcripts.
Likelihood
Low - The vulnerable metadata is produced during normal forwarder runs, but an attacker must already have read access to local/internal generated archive or derived storage. No repository artifact showed public exposure of those files.
Impact
Low - The leaked value allows offline confirmation of guessed raw transcript/source content and can expose presence of small or predictable sensitive snippets. It does not directly decrypt ciphertext, expose the raw archive key, enable code execution, or provide network/identity compromise.
Assumptions
The relevant attacker is an internal/local/storage-level reader who can access generated AI metrics archive metadata, DuckDB, or Parquet exports but does not possess BEEP_AI_METRICS_RAW_ARCHIVE_KEY.
Generated AI metrics data roots are protected primarily by local host or tailnet/storage permissions; no repository artifact showed a public HTTP download path for the raw archive or derived Parquet files.
The validation PoC mirrors the repository algorithms, but the attack-path judgment is based on static repository evidence only.
Operator runs `beep-cli ai-metrics forwarder run` or otherwise calls `runAiMetricsForwarder` on transcript/source files.
Attacker gains read access to generated raw archive envelope JSON, the derived DuckDB database, or Parquet exports.
Attacker can guess candidate transcript/source content and compute SHA-256 offline.
Controls
AES-256-GCM encryption for raw archive ciphertext
32-byte base64 raw archive key required via CLI flag or BEEP_AI_METRICS_RAW_ARCHIVE_KEY
Non-local install requires rawArchiveKeySecretRef
Source paths use salted private identifier hashing when a hash salt is provided
P2 documentation states there is no raw decrypt CLI command
Default target paths are local `.beep/ai-metrics` or host-local `/srv/data/ai-metrics`; no public ingress/LB artifact was found for archive files
Blindspots
Static-only review cannot verify runtime file permissions on `.beep/ai-metrics` or `/srv/data/ai-metrics`.
No deployed environment or cloud APIs were queried, so actual tailnet, dashboard, backup, or object-storage exposure of Parquet exports is unknown.
The repository may contain future or external deployment automation not present in the checked files that could share derived exports more broadly.
Dependency installation/build was not performed during this attack-path stage; reachability is inferred from source and prior validation evidence.
Finding content copied
Finding content copied
```
