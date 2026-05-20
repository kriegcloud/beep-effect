# CSF-048: Proof watch aborts on partial bundle transfers

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 60ac17f |
| Reported age | 5d ago |
| Capture method | dom-fallback |
| Owner area | apps/stack-installer |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced: p1:proof:watch is a new mode in this commit, but it does not catch transient intake/extraction failures even though it is documented as bounded polling for artifact transfer windows.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The upload server writes incoming proof bundles to a temporary .uploading file and removes partial files on pipeline failure before renaming only completed uploads into their final approved bundle path.
- Remediation status: `fixed-in-branch`
- Verification command: `node --check goals/stack-installer/ops/proof-upload-server.mjs && node goals/stack-installer/ops/proof-upload-smoke.mjs`
- Changed files:
  - goals/stack-installer/ops/proof-upload-server.mjs
- Verification notes:
  - Script syntax checks pass and the proof upload smoke covers successful bundle persistence through the temp-file path.

## Evidence Paths

- apps/stack-installer/src/proof/capture-p1-manual-proof.ts

## Validation Notes From Codex

- Confirm p1:proof:watch was introduced by this commit and is documented as bounded polling during transfer windows.
- Confirm watch loop catches only audit failures and calls intake/extraction outside the Effect.exit retry wrapper.
- Confirm intake begins extraction solely on expected bundle path existence when the platform directory is absent.
- Confirm non-zero tar/unzip extraction is converted into a fatal effect failure.
- Demonstrate with a truncated expected bundle that the watch aborts before retrying or sleeping.

## Sanitized Finding Content

```text
Finding
Proof watch aborts on partial bundle transfers
Report
Chat
Severity
Informational
Adjust to improve accuracy in future scans
Commit
60ac17f
1:22 PM May 14, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced: p1:proof:watch is a new mode in this commit, but it does not catch transient intake/extraction failures even though it is documented as bounded polling for artifact transfer windows.
The watch helper is intended to poll during artifact transfer windows, but each loop calls intakeReturnedBundles directly before wrapping only the audit step in Effect.exit. intakePlatformBundle treats mere existence of stack-installer-p1-*.tgz/.zip as enough to start extraction. If an operator or transfer process creates the bundle path before the copy is complete, tar/unzip exits non-zero and runExtractionProcess calls requireAudit, which dies. Because that failure is outside the Effect.exit wrapper in watchProofArtifacts, the watch command aborts instead of sleeping and retrying. A local process that can create a truncated expected bundle in the output root can also force this helper to fail, but this is primarily a reliability/workflow bug rather than a security vulnerability.
Validation
Confirm p1:proof:watch was introduced by this commit and is documented as bounded polling during transfer windows.
Confirm watch loop catches only audit failures and calls intake/extraction outside the Effect.exit retry wrapper.
Confirm intake begins extraction solely on expected bundle path existence when the platform directory is absent.
Confirm non-zero tar/unzip extraction is converted into a fatal effect failure.
Demonstrate with a truncated expected bundle that the watch aborts before retrying or sleeping.
Validation artifact
Evidence
apps/stack-installer/src/proof/capture-p1-manual-proof.ts
271
yield* requireAudit(
272
exitCode === 0,
273
`Failed to extract ${bundlePath} with ${process.command}; exitCode=${exitCode}; stderr=${stderr}; stdout=${stdout}`
274
);
283
const outputDir = path.join(outputRoot, platform);
284
const bundlePath = path.join(outputRoot, p1ProofBundleFileNameForPlatform(platform));
285
const bundleExists = yield* fs.exists(bundlePath).pipe(Effect.orElseSucceed(() => false));
286
287
if (!bundleExists) {
288
return O.none<string>();
289
}
290
291
const outputDirExists = yield* fs.exists(outputDir).pipe(Effect.orElseSucceed(() => false));
292
293
if (outputDirExists) {
294
return O.some(
295
`- ${platform}: skipped; proof directory already exists\n  dir: ${outputDir}\n  bundle: ${bundlePath}`
296
);
297
}
298
299
yield* runExtractionProcess(platform, bundlePath, outputRoot);
541
for (let attempt = 1; attempt <= attempts; attempt += 1) {
542
lastStatus = yield* intakeReturnedBundles(outputRoot);
543
544
const auditExit = yield* Effect.exit(auditAllProofArtifacts(outputRoot));
545
546
if (Exit.isSuccess(auditExit)) {
547
return `${lastStatus}\n\n${auditExit.value}\nP1 proof watch passed on attempt ${attempt}/${attempts}.`;
548
}
549
550
if (attempt < attempts) {
551
yield* Effect.sync(() => {
552
console.log(`P1 proof watch attempt ${attempt}/${attempts} pending; sleeping ${intervalMs}ms.`);
553
});
554
yield* Effect.sleep(Duration.millis(intervalMs));
555
}
556
}
557
558
return yield* Effect.die(`P1 proof watch exhausted ${attempts} attempts without passing audit-all.\n\n${lastStatus}`);
Attack-path analysis
Although the code evidence supports a real reliability bug, it should not be treated as a security vulnerability. The vulnerable path is a local proof helper (`p1:proof:watch`) with no public exposure, ports, ingress, service account, managed identity, or secret-handling path. The attack precondition is write access to the local proof output root, and the consequence is that `tar`/`unzip` failure aborts the helper because `intakeReturnedBundles` is outside the retry wrapper. This does not cross a trust boundary or produce material security impact under the project threat model, so probability × impact for security purposes is ignored.
Path
Local outputRoot writable by transfer/operator context --create or partially copy bundle--> Expected bundle filename exists --existence check passes--> intakePlatformBundle starts extraction --extract invalid/incomplete archive--> tar/unzip returns non-zero on partial archive --non-zero exit becomes fatal audit failure--> requireAudit failure occurs outside watch retry wrapper --failure is not caught by Effect.exit retry path--> p1:proof:watch aborts
The source supports the reported bug: watch mode calls intake before the `Effect.exit` wrapper, intake starts extraction based only on expected bundle path existence, and a non-zero `tar`/`unzip` exit is converted to a fatal `requireAudit` failure. However, this is not a real security vulnerability in the stated threat model. It has no network exposure, no service identity or cloud privilege, no secret access, and no demonstrated cross-boundary impact. A local actor who can write the proof output root can cause the local operator helper to abort, which is a reliability/availability issue for that workflow only.
Likelihood
Ignore - A partial transfer can plausibly trigger the bug during normal local operations, but exploitation as a security issue is not realistic because it requires local write access to the operator's proof output directory and only affects that workflow.
Impact
Ignore - The proven impact is limited to aborting a local proof-watch workflow. There is no evidence of code execution, arbitrary file read of sensitive data, privilege escalation, tenant compromise, identity abuse, or remote denial of service.
Assumptions
The proof watch helper is run by a local coordinator/operator and watches a local output directory.
An attacker would need the ability to create or modify expected bundle files in the selected output root, which is governed by local filesystem permissions.
No cloud APIs were called; analysis is limited to repository artifacts and provided validation evidence.
operator runs `bun run p1:proof:watch`
expected bundle path exists before the archive is complete or valid
actor/process has write access to the local output root
Controls
local filesystem permissions on outputRoot
no public listener or ingress for this helper
fixed expected bundle filenames by platform
array-form child process invocation avoids shell interpolation for extraction arguments
Blindspots
Static-only repository review; the full Bun CLI was not re-executed in this stage.
Validation evidence indicates dependency resolution prevented running the actual target CLI, so the dynamic PoC mirrored the relevant call order rather than executing the full application.
No runtime filesystem permissions or operator deployment practices were available beyond repository documentation.
Finding content copied
Finding content copied
```
