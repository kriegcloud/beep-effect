# CSF-040: Unrestricted ffmpeg processing can trigger local SSRF

## Metadata

| Field | Value |
|---|---|
| Severity | Low |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | af06b2a |
| Reported age | 3w ago |
| Capture method | dom-fallback |
| Owner area | tooling/cli |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

A security bug was introduced in the new strip-metadata video path. The command should either reject playlist/indirection formats for metadata stripping, force safe container formats, or invoke ffmpeg with restrictive protocol/demuxer settings such as an appropriate -protocol_whitelist that excludes network protocols.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The metadata-strip video path rejects known playlist and indirection extensions before selection and invokes ffmpeg with a file,pipe protocol whitelist.
- Remediation status: `fixed-in-current-head`
- Verification command: `bunx --bun vitest run packages/tooling/tool/cli/test/files-command.test.ts --testNamePattern 'ffmpeg stream copy|strip-metadata'`
- Changed files:
  - none
- Verification notes:
  - The focused files-command tests pass and assert ffmpeg receives -protocol_whitelist file,pipe.

## Evidence Paths

- tooling/cli/src/commands/Files/index.ts

## Validation Notes From Codex

- Confirm the strip-metadata video path was newly introduced in the target commit.
- Confirm media selection is based only on filename extension and not content/container safety.
- Confirm accepted video extensions include playlist or indirection formats such as MPEGURL m4u/mxu or ASX.
- Confirm selected videos are passed into the strip-metadata plan without rejecting those playlist formats.
- Confirm ffmpeg is invoked on attacker-controlled local input without a protocol whitelist or equivalent network-denying configuration.
- Confirm a full end-to-end real-ffmpeg network request inside this container; blocked by missing ffmpeg and missing project dependencies.

## Sanitized Finding Content

```text
Finding
Unrestricted ffmpeg processing can trigger local SSRF
Report
Chat
Severity
Low
Adjust to improve accuracy in future scans
Commit
af06b2a
8:54 PM Apr 27, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
A security bug was introduced in the new strip-metadata video path. The command should either reject playlist/indirection formats for metadata stripping, force safe container formats, or invoke ffmpeg with restrictive protocol/demuxer settings such as an appropriate -protocol_whitelist that excludes network protocols.
The added files strip-metadata path classifies videos solely by extension and then runs ffmpeg directly on each selected file. Some accepted video extensions include playlist/container formats, and ffmpeg also probes content independently of the filename. Malicious media such as MPEGURL/HLS-style playlists can cause ffmpeg to dereference embedded HTTP or other protocol URLs while processing a local input. If a user or CI job runs this command on an attacker-supplied directory, the victim machine can be coerced into making requests to internal services or attacker-controlled endpoints during the metadata-stripping operation. The ffmpeg invocation does not use a protocol whitelist, reject playlist formats, or otherwise disable network-capable demuxing.
Validation
Confirm the strip-metadata video path was newly introduced in the target commit.
Confirm media selection is based only on filename extension and not content/container safety.
Confirm accepted video extensions include playlist or indirection formats such as MPEGURL m4u/mxu or ASX.
Confirm selected videos are passed into the strip-metadata plan without rejecting those playlist formats.
Confirm ffmpeg is invoked on attacker-controlled local input without a protocol whitelist or equivalent network-denying configuration.
Confirm a full end-to-end real-ffmpeg network request inside this container; blocked by missing ffmpeg and missing project dependencies.
Validation artifact
Evidence
tooling/cli/src/commands/Files/index.ts
427
const mediaKindFromExtension = (extension: string): O.Option<MediaKind> => {
428
const bareExtension = normalizeBareExtension(extension);
429
430
if (isImageFileExtension(bareExtension)) {
431
return O.some("image");
432
}
433
434
if (isVideoFileExtension(bareExtension)) {
435
return O.some("video");
436
}
848
const mediaKind = file.mediaKind.value;
849
if (mediaKind === "image" && !isSupportedMetadataImageFile(file)) {
850
skippedCount += 1;
851
continue;
852
}
853
854
entries = A.append(
855
entries,
856
new StripMetadataPlanEntry({
857
extension: file.extension,
858
mediaKind,
859
size: file.size,
860
sourceName: file.name,
861
sourcePath: file.sourcePath,
862
})
899
const command = ChildProcess.make(
900
"ffmpeg",
901
[
902
"-hide_banner",
903
"-nostdin",
904
"-y",
905
"-i",
906
entry.sourcePath,
907
"-map",
908
"0",
909
"-c",
910
"copy",
911
"-map_metadata",
912
"-1",
913
"-map_metadata:s",
914
"-1",
915
"-map_metadata:c",
916
"-1",
917
"-map_chapters",
918
"-1",
919
tempPath,
920
],
Attack-path analysis
The finding is confirmed as a real code-level weakness: extension-only video selection accepts playlist/indirection extensions and invokes ffmpeg without network-denying protocol controls. However, severity is adjusted down from medium to low because the affected surface is a private/developer CLI under `tooling/cli`, not the main runtime service or a remotely reachable endpoint; exploitation requires a victim or CI job to manually run `files strip-metadata` on attacker-supplied files; no repository CI invocation of the command was found; and the proven impact is blind local/egress SSRF rather than data exfiltration, authorization bypass, or code execution.
Path
Attacker-controlled media directory --operator/CI processes directory--> beep-cli files strip-metadata --file extension determines media kind--> Extension-only video classification --playlist-like video accepted into plan--> ffmpeg invoked on sourcePath without protocol restrictions --ffmpeg demuxer/protocol fetches embedded URLs--> Victim-host network requests to internal/external URLs
The core vulnerability is real in the CLI code: video detection is extension-only, the shared video extension table includes MPEGURL/ASX-style indirection extensions, every recognized video is added to the strip-metadata plan, and ffmpeg is invoked directly on the selected source path without protocol restrictions. This can let a malicious local media file cause network requests from the victim environment when processed by ffmpeg. The practical severity is reduced because the affected component is a private/developer repo CLI with no listening port, no default CI invocation found for `strip-metadata`, and exploitation requires a user or CI job to opt into processing attacker-supplied files. The demonstrated impact is blind network reachability, not proven credential exfiltration or code execution.
Likelihood
Low - Exploitation requires social engineering or a specific CI/developer workflow that processes attacker-supplied media with this private CLI command and an ffmpeg build with network-capable demuxers. There is no public listener, ingress, or default workflow trigger in the repository evidence.
Impact
Low - Impact is limited to blind network requests from the user or CI environment and possible internal service probing. The repository evidence does not show direct response exfiltration, credential theft, code execution, or a default automated path processing untrusted files.
Assumptions
Static analysis only; no cloud APIs were called.
The finding depends on a deployed ffmpeg build with normal network-capable demuxers/protocols such as HLS/MPEGURL enabled.
An attacker must be able to place media files in a directory later processed by a developer, user, or CI job using the repo CLI strip-metadata command.
.specs content was excluded from the assessment.
Victim runs `beep-cli files strip-metadata --dir <attacker-influenced-dir>` or equivalent test/helper invocation
ffmpeg is installed and reachable on PATH
Attacker-controlled file has an accepted video extension or content ffmpeg probes as a playlist/container
Victim environment allows outbound or loopback/internal network access
Controls
No repository evidence of network-exposed ingress for this CLI command
Manual/local CLI invocation required
Package is marked private in package.json
No ffmpeg protocol whitelist, protocol blacklist, or playlist rejection found in the vulnerable command path
No `.github` workflow invocation of `strip-metadata` was found by repository grep
Blindspots
Real ffmpeg was not available in the container, so end-to-end network dereference was not re-executed during this attack-path pass.
Static analysis cannot prove which ffmpeg protocols/demuxers are enabled in all user or CI environments.
No external package distribution or downstream user telemetry was available, so actual CLI adoption is unknown.
A private CI workflow or undocumented operator process outside the repository could make the command more reachable than visible here.
Finding content copied
Finding content copied
```
