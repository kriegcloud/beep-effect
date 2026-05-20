# CSF-005: Upload helper can kill arbitrary processes via PID file

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | ad43454 |
| Reported age | 5d ago |
| Capture method | dom-fallback |
| Owner area | apps/stack-installer |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced: the new start-proof-upload-window.mjs creates and trusts a restart PID file inside the untrusted proof artifact output root and the documentation/manifest now recommend --replace-existing, making the unsafe kill path part of the normal workflow.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The upload-window helper now validates the PID from its pid file against /proc/<pid>/cmdline and refuses to stop a process unless it is the expected proof-upload-server process for the configured output root.
- Remediation status: `fixed-in-branch`
- Verification command: `node --check goals/stack-installer/ops/start-proof-upload-window.mjs && node goals/stack-installer/ops/proof-upload-smoke.mjs`
- Changed files:
  - goals/stack-installer/ops/start-proof-upload-window.mjs
  - goals/stack-installer/ops/proof-upload-smoke.mjs
- Verification notes:
  - Script syntax checks pass and the smoke test exercises replace-existing upload-window startup.

## Evidence Paths

- apps/stack-installer/src/proof/P1ProofArtifacts.ts
- apps/stack-installer/src/proof/capture-p1-manual-proof.ts
- goals/stack-installer/ops/handoffs/HANDOFF_P1_DISCORD_MANUAL.md
- goals/stack-installer/ops/start-proof-upload-window.mjs

## Validation Notes From Codex

- Verify start helper stores/reads pid under outputRoot.
- Verify --replace-existing calls process.kill on untrusted PID without target validation.
- Verify proof upload/intake can place root-level proof-upload-server.pid in outputRoot from an allowed proof bundle.
- Dynamically show malicious pid file causes termination of unrelated same-user process.
- Verify documented workflow recommends --replace-existing.

## Sanitized Finding Content

```text
Finding
Upload helper can kill arbitrary processes via PID file
Report
Chat
Severity
Medium
Adjust to improve accuracy in future scans
Commit
ad43454
2:27 PM May 14, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced: the new start-proof-upload-window.mjs creates and trusts a restart PID file inside the untrusted proof artifact output root and the documentation/manifest now recommend --replace-existing, making the unsafe kill path part of the normal workflow.
start-proof-upload-window.mjs stores proof-upload-server.pid under outputRoot and, when --replace-existing is supplied, reads that file and passes the parsed integer directly to process.kill(). It only checks Number.isInteger(), not that the PID is positive, not a process group/all-processes special value, and not actually the proof upload server. The same outputRoot is used for uploaded proof bundles, and the documented workflow runs p1:proof:intake after upload. That intake path extracts the uploaded tar/zip bundle into outputRoot without constraining archive entries to only the expected platform directory, so an authenticated proof uploader can include a root-level proof-upload-server.pid entry. On the next coordinator restart using the newly documented --replace-existing command, the helper can terminate an arbitrary same-user process or, with PID 0/-1 on POSIX-like systems, signal a process group or all signalable processes. The PID/control files should be stored outside the untrusted artifact extraction directory, PID values should be strictly positive normal PIDs, and the target process should be verified before signaling.
Validation
Verify start helper stores/reads pid under outputRoot.
Verify --replace-existing calls process.kill on untrusted PID without target validation.
Verify proof upload/intake can place root-level proof-upload-server.pid in outputRoot from an allowed proof bundle.
Dynamically show malicious pid file causes termination of unrelated same-user process.
Verify documented workflow recommends --replace-existing.
Validation artifact
Evidence
apps/stack-installer/src/proof/capture-p1-manual-proof.ts
277
const intakePlatformBundle = Effect.fn("StackInstaller.intakePlatformBundle")(function* (
278
outputRoot: string,
279
platform: P1RequiredPlatform
280
) {
281
const fs = yield* FileSystem.FileSystem;
282
const path = yield* Path.Path;
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
goals/stack-installer/ops/handoffs/HANDOFF_P1_DISCORD_MANUAL.md
261
```bash
262
node goals/stack-installer/ops/start-proof-upload-window.mjs \
263
--host '<coordinator-tailscale-ip>' \
264
--port 8765 \
265
--output-root output/stack-installer/p1-live \
266
--replace-existing
267
```
goals/stack-installer/ops/start-proof-upload-window.mjs
21
const outputRoot = path.resolve(argAfter("--output-root", "output/stack-installer/p1-live"));
22
const tokenBytes = Number.parseInt(argAfter("--token-bytes", "24"), 10);
23
const replaceExisting = hasArg("--replace-existing");
24
const serverScript = path.resolve("goals/stack-installer/ops/proof-upload-server.mjs");
25
26
const tokenPath = path.join(outputRoot, "proof-upload-token.txt");
27
const commandsPath = path.join(outputRoot, "proof-upload-commands.txt");
28
const pidPath = path.join(outputRoot, "proof-upload-server.pid");
29
const logPath = path.join(outputRoot, "proof-upload-server.log");
40
const stopExisting = async () => {
41
const rawPid = await fs.promises.readFile(pidPath, "utf8").catch(() => "");
42
const pid = Number.parseInt(rawPid.trim(), 10);
43
44
if (!Number.isInteger(pid) || !processExists(pid)) {
45
return;
46
}
47
48
if (!replaceExisting) {
49
throw new Error(`Upload server already appears to be running with pid ${pid}; pass --replace-existing to restart it.`);
50
}
51
52
process.kill(pid);
53
await new Promise((resolve) => setTimeout(resolve, 500));
89
await fs.promises.mkdir(outputRoot, { recursive: true });
90
await stopExisting();
91
92
const token = crypto.randomBytes(tokenBytes).toString("hex");
93
await writePrivateFile(tokenPath, `${token}\n`);
94
await writePrivateFile(commandsPath, `${buildCommandsText()}\n`);
95
await writePrivateFile(logPath, "");
96
97
const logHandle = await fs.promises.open(logPath, "a");
98
const child = spawn(
99
process.execPath,
100
[serverScript, "--host", host, "--port", String(port), "--output-root", outputRoot],
101
{
102
detached: true,
103
env: {
104
...process.env,
105
STACK_INSTALLER_PROOF_UPLOAD_TOKEN: token,
106
},
107
stdio: ["ignore", logHandle.fd, logHandle.fd],
108
}
109
);
110
111
child.unref();
112
await logHandle.close();
113
await writePrivateFile(pidPath, `${child.pid}\n`);
Attack-path analysis
Keep medium. The repository evidence supports the bug and reachability: the starter trusts a PID file under outputRoot, the upload server stores attacker-controlled bundles there after token authentication, intake extracts archive contents into the same root, and the runbook/manifest recommend --replace-existing. The impact is meaningful availability loss against coordinator same-user processes, confirmed by prior runtime validation, but the attack requires a valid proof-upload token, a private/tailnet or localhost-reachable temporary endpoint, the coordinator to run intake, and a later restart. There is no proven RCE, credential disclosure, or privilege escalation, so high/critical would overstate the risk; it is also more than a mere correctness bug because a remote authenticated proof participant can cross into the coordinator's process-control context.
Path
Authenticated proof uploader --PUT/POST /upload/<allowed bundle> with bearer token--> proof-upload-server.mjs on port 8765 --stores attacker-controlled archive bytes--> Allowed-name proof bundle in outputRoot --coordinator runs documented intake--> p1:proof:intake archive extraction --tar/unzip extracts root-level PID file into outputRoot--> Attacker-controlled proof-upload-server.pid --restart helper reads and parses PID--> start-proof-upload-window.mjs --replace-existing --process.kill(pid)--> Same-user victim process or process group
The finding is a real vulnerability in the documented Stack Installer P1 proof workflow. The starter places proof-upload-server.pid inside outputRoot, the same directory that receives uploaded proof bundles. The upload server requires a bearer token and restricts filenames, but it does not inspect archive contents. The intake workflow extracts tar/zip bundles directly into outputRoot, so an authenticated uploader can place a root-level proof-upload-server.pid there. On a later documented restart with --replace-existing, the starter reads that file, checks only Number.isInteger and processExists, and calls process.kill(pid). The validated reproduction showed an unrelated same-user process exiting with SIGTERM. Severity remains medium because the impact is denial of service against same-user coordinator processes and exploitation requires a token plus later coordinator actions; it is not public, unauthenticated, or code execution.
Likelihood
Medium - The exploit path is documented and technically straightforward once the proof upload token is available, and the normal workflow runs intake followed by possible --replace-existing restart. However, the endpoint is temporary/private, token-gated, and requires a later coordinator action, so it is not broadly exposed or high likelihood.
Impact
Medium - Successful exploitation lets an authenticated uploader cause the coordinator helper to signal an attacker-chosen same-user PID during a later restart. This can terminate unrelated coordinator processes and may affect a process group/special PID on POSIX-like systems, but it does not directly provide code execution, data exfiltration, privilege escalation, or cross-tenant compromise.
Assumptions
The proof upload helper is run by a coordinator during the documented Stack Installer P1 proof workflow.
An attacker has, or can misuse, a valid temporary proof upload token and can submit a crafted proof bundle under one of the allowed bundle filenames.
The coordinator later runs the documented intake command and restarts the upload helper with --replace-existing.
The target process is signalable by the same OS user that runs the upload helper.
valid temporary upload token
crafted allowed-name proof archive
coordinator runs p1:proof:intake into the shared outputRoot
coordinator later runs start-proof-upload-window.mjs with --replace-existing
chosen PID or process group is signalable by the coordinator OS user
Controls
Temporary bearer token required for upload
Default bind host is 127.0.0.1
Runbook documents coordinator Tailscale/private-network host rather than public ingress
Allowed upload filenames are limited to stack-installer-p1-macos.tgz and stack-installer-p1-windows.zip
Upload maxBytes limit is configured
Token, command, PID, and log files are written with 0600 permissions
Blindspots
Static repository review cannot confirm how often the proof upload helper is run or whether real deployments expose it beyond Tailscale/private networks.
The exact behavior of process.kill for PID 0 and negative PIDs is OS-dependent; arbitrary positive same-user PID termination is still evidenced.
The trust model for proof upload token distribution is operational and not fully encoded in repository artifacts.
No cloud, host firewall, or live Tailscale configuration was queried.
Finding content copied
Finding content copied
```
