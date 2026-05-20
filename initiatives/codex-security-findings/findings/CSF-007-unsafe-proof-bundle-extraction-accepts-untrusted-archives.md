# CSF-007: Unsafe proof bundle extraction accepts untrusted archives

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 00dbb3c |
| Reported age | 5d ago |
| Capture method | dom-fallback |
| Owner area | apps/stack-installer |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced. The commit adds an automatic archive intake path that executes tar/unzip on returned bundles without archive-entry validation or containment checks.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: P1 manual proof capture now lists archive entries before extraction and rejects absolute paths, null bytes, empty path segments, dot segments, parent traversal, and entries outside the expected platform directory before invoking tar or unzip.
- Remediation status: `fixed-in-branch`
- Verification command: `bunx vitest run apps/stack-installer/test/P1ManualProof.test.ts`
- Changed files:
  - apps/stack-installer/src/proof/P1ProofArtifacts.ts
  - apps/stack-installer/src/proof/capture-p1-manual-proof.ts
  - apps/stack-installer/test/P1ManualProof.test.ts
- Verification notes:
  - The focused Vitest suite passes, including the newly covered archive listing command path.

## Evidence Paths

- apps/stack-installer/src/proof/P1ProofArtifacts.ts
- apps/stack-installer/src/proof/capture-p1-manual-proof.ts

## Validation Notes From Codex

- Confirm the new p1 proof intake command is operator-reachable and accepts an output root.
- Confirm the extraction process executes tar/unzip directly into the output root without archive-entry validation or containment enforcement.
- Confirm extraction success is determined only by process exit status and existence of the expected platform path.
- Demonstrate a malicious returned bundle can create a top-level platform symlink whose realpath is outside the proof root while the existence check still passes.
- Demonstrate trusted follow-up proof-path operations can read/list or write through the attacker-created platform symlink.

## Sanitized Finding Content

```text
Finding
Unsafe proof bundle extraction accepts untrusted archives
Report
Chat
Severity
Medium
Adjust to improve accuracy in future scans
Commit
00dbb3c
1:15 PM May 14, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced. The commit adds an automatic archive intake path that executes tar/unzip on returned bundles without archive-entry validation or containment checks.
The commit adds `p1:proof:intake`, which looks for platform bundles in an operator-selected output directory and extracts them directly with `tar -xzf` or `unzip -o`. The code does not inspect archive contents before extraction, does not extract into an isolated temporary directory, does not verify that every extracted path remains under the expected platform directory, and accepts extraction as successful based only on process exit status and `fs.exists(outputDir)`. A malicious returned bundle can therefore rely on platform extractor behavior to create dangerous entries such as symlinks named `macos` or `windows` pointing outside the proof root, symlinked proof files, hardlinks/special files where supported, or very large/deep archive contents for disk/CPU exhaustion. Because later status/audit/checksum code treats the extracted platform path as trusted, this can cause reads or writes through attacker-created links or denial of service when a coordinator runs the documented intake command. The extraction should validate archive manifests first, reject absolute paths, `..` components, links and special files, enforce size/count limits, extract into a fresh temporary directory, verify realpaths remain within the intended root, and then atomically move only a normal top-level platform directory into place.
Validation
Confirm the new p1 proof intake command is operator-reachable and accepts an output root.
Confirm the extraction process executes tar/unzip directly into the output root without archive-entry validation or containment enforcement.
Confirm extraction success is determined only by process exit status and existence of the expected platform path.
Demonstrate a malicious returned bundle can create a top-level platform symlink whose realpath is outside the proof root while the existence check still passes.
Demonstrate trusted follow-up proof-path operations can read/list or write through the attacker-created platform symlink.
Validation artifact
Evidence
apps/stack-installer/src/proof/capture-p1-manual-proof.ts
236
const runExtractionProcess = Effect.fn("StackInstaller.runExtractionProcess")(function* (
237
platform: P1RequiredPlatform,
238
bundlePath: string,
239
outputRoot: string
240
) {
241
const process = p1ProofBundleExtractionProcess(platform, bundlePath, outputRoot);
242
243
const [stdout, stderr, exitCode] = yield* Effect.scoped(
244
Effect.gen(function* () {
245
const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
246
const handle = yield* spawner.spawn(
247
ChildProcess.make(process.command, A.fromIterable(process.args), {
248
stderr: "pipe",
249
stdin: "ignore",
250
stdout: "pipe",
251
})
252
);
253
254
return yield* Effect.all([collectText(handle.stdout), collectText(handle.stderr), handle.exitCode], {
255
concurrency: "unbounded",
256
});
257
})
258
);
259
260
yield* requireAudit(
261
exitCode === 0,
262
`Failed to extract ${bundlePath} with ${process.command}; exitCode=${exitCode}; stderr=${stderr}; stdout=${stdout}`
263
);
264
});
266
const intakePlatformBundle = Effect.fn("StackInstaller.intakePlatformBundle")(function* (
267
outputRoot: string,
268
platform: P1RequiredPlatform
269
) {
270
const fs = yield* FileSystem.FileSystem;
271
const path = yield* Path.Path;
272
const outputDir = path.join(outputRoot, platform);
273
const bundlePath = path.join(outputRoot, p1ProofBundleFileNameForPlatform(platform));
274
const bundleExists = yield* fs.exists(bundlePath).pipe(Effect.orElseSucceed(() => false));
275
276
if (!bundleExists) {
277
return O.none<string>();
278
}
279
280
const outputDirExists = yield* fs.exists(outputDir).pipe(Effect.orElseSucceed(() => false));
281
282
if (outputDirExists) {
283
return O.some(
284
`- ${platform}: skipped; proof directory already exists\n  dir: ${outputDir}\n  bundle: ${bundlePath}`
285
);
286
}
287
288
yield* runExtractionProcess(platform, bundlePath, outputRoot);
289
290
const extractedDirExists = yield* fs.exists(outputDir).pipe(Effect.orElseSucceed(() => false));
291
292
yield* requireAudit(extractedDirExists, `Extracted bundle did not create expected proof directory: ${outputDir}`);
297
const intakeReturnedBundles = Effect.fn("StackInstaller.intakeReturnedBundles")(function* (outputRoot: string) {
298
const fs = yield* FileSystem.FileSystem;
299
300
yield* fs.makeDirectory(outputRoot, { recursive: true });
301
302
const intakeMessages = yield* Effect.forEach(
303
P1_REQUIRED_PLATFORMS,
304
(platform) => intakePlatformBundle(outputRoot, platform),
305
{ concurrency: 1 }
306
);
307
const status = yield* proofArtifactStatus(outputRoot);
308
const summary = pipe(
309
A.getSomes(intakeMessages),
310
O.liftPredicate(A.isReadonlyArrayNonEmpty),
311
O.map(A.join("\n")),
312
O.getOrElse(() => `No returned P1 proof bundles found in ${outputRoot}.`)
313
);
314
315
return `${summary}\n\n${status}`;
apps/stack-installer/src/proof/P1ProofArtifacts.ts
139
export const p1ProofBundleExtractionProcess = (
140
platform: P1RequiredPlatform,
141
bundlePath: string,
142
outputRoot: string
143
): P1ProofBundleExtractionProcess =>
144
platform === "macos"
145
? { args: ["-xzf", bundlePath, "-C", outputRoot], command: "tar" }
146
: { args: ["-o", bundlePath, "-d", outputRoot], command: "unzip" };
Attack-path analysis
Adjusted from high to medium. The code evidence supports a real unsafe archive extraction bug: p1:proof:intake is reachable from package.json and documented handoff instructions, uses tar/unzip directly, validates only exit status and fs.exists, and follow-up code trusts the extracted path. The provided PoC evidence demonstrates outside-root symlink creation with the exact native commands. But the affected surface is a private, local P1 proof/coordinator helper rather than a public service; exploitation requires a malicious returned bundle plus operator action; and the demonstrated impact is local filesystem boundary bypass/write-through and DoS under the coordinator user's privileges, not proven RCE, auth bypass, cross-tenant compromise, or direct crown-jewel secret exposure. That makes the issue security-relevant and worth fixing, but below high in this repository threat context.
Path
Returned proof bundle in output root --operator runs documented intake--> p1:proof:intake local CLI --spawns native extractor--> tar/unzip extraction without manifest validation --creates unsafe path object--> fs.exists accepts extracted platform path --treated as trusted platform directory--> status/audit/checksum trusts platform path --reads/writes follow link or resource exhaustion--> Local filesystem boundary bypass or DoS
The finding is real: the repository defines a documented p1:proof:intake command that processes returned proof bundles, constructs native tar/unzip commands, and extracts directly into the chosen output root without archive-entry validation or realpath containment checks. The command is reachable through normal coordinator proof workflow documentation. Validation artifacts demonstrate that the exact configured extraction commands can create top-level macos/windows symlinks whose realpaths are outside the proof root while fs.exists-style checks pass. However, exposure is local and operator-mediated, and the affected package is a private P1 proof/coordinator utility rather than an internet-facing service. The impact is meaningful local filesystem boundary bypass and DoS, with possible read/write-through by follow-up tooling, but not a clearly proven remote RCE or broad credential compromise.
Likelihood
Medium - The vulnerable command is documented and easy to run in the proof workflow, and attacker-controlled bundle contents are plausible if a returned bundle or transfer channel is compromised. It is not internet-exposed and requires operator interaction and placement of a malicious archive.
Impact
Medium - A crafted bundle can escape the intended proof-root trust boundary through symlinked platform paths and can drive local DoS through archive expansion. Follow-up proof tooling can read or write through the trusted path. The impact is bounded to the local coordinator user's filesystem permissions and no direct remote code execution or broad credential exfiltration is proven.
Assumptions
The coordinator runs the documented local Bun command and has normal user-level filesystem permissions.
A malicious or tampered returned proof bundle can be placed in the selected proof output root with the expected filename.
No cloud APIs or live deployment state were inspected; assessment is based on repository artifacts and provided validation evidence.
attacker can supply or tamper with stack-installer-p1-macos.tgz or stack-installer-p1-windows.zip
operator copies the bundle into the proof output root
operator runs p1:proof:intake
for follow-up write-through impact, later proof tooling trusts the extracted platform path
Controls
manual local operator command, not a public network listener
package is private and Tauri bundle is inactive in current configuration
fixed argv-form ChildProcess invocation reduces shell command-injection risk
no archive-entry validation, lstat type check, size limits, or realpath containment control is present
Blindspots
Static-only review did not execute the full Bun application because validation reported missing workspace dependencies.
Exact tar/unzip handling of links, hardlinks, traversal paths, and special files may vary by OS and extractor version.
The frequency and trust model of returned proof bundles and transfer channels cannot be fully determined from repository artifacts alone.
No live deployment, endpoint exposure, or cloud identity configuration was inspected.
Finding content copied
Finding content copied
```
