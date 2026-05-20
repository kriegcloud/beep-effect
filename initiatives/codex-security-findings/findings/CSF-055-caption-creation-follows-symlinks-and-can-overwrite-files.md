# CSF-055: Caption creation follows symlinks and can overwrite files

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 1004b9f |
| Reported age | 3w ago |
| Capture method | dom-fallback |
| Owner area | tooling/cli |
| Triage verdict | needs-current-head-review |
| Codex close reason | pending |

## Summary

Introduced a symlink-following arbitrary file overwrite in the newly added create-captions command path. The source file symlink checks do not protect the generated caption target, and the final write is not performed through a safe create/replace operation that refuses symlinks.

## Current-HEAD Triage

- Verdict: `needs-current-head-review`
- Rationale: Pending validation against current `HEAD`.
- Remediation status: `not-started`
- Verification command: `pending`

## Evidence Paths

- tooling/cli/src/commands/Files/Files.service.ts

## Validation Notes From Codex

- Confirm the command derives caption targets from direct image file stems and performs source-entry symlink checks only.
- Confirm the generated caption target is inspected with exists/stat but not lstat/realPath, so a symlink to a regular file can pass as File.
- Confirm --overwrite permits an existing caption target and applyCreateCaptionFilesPlan writes directly to entry.captionPath.
- Demonstrate a malicious dataset with alpha.png plus alpha.txt symlink to an outside writable file causes that outside file to be overwritten with attacker-controlled caption text.
- Reproduce through the actual CLI binary in this container; blocked by missing dependencies and unavailable compatible Bun/catalog install path, so a faithful reduced PoC plus source citations were used.

## Sanitized Finding Content

```text
Finding
Caption creation follows symlinks and can overwrite files
Report
Chat
Severity
Informational
Adjust to improve accuracy in future scans
Commit
1004b9f
10:24 AM Apr 28, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a symlink-following arbitrary file overwrite in the newly added create-captions command path. The source file symlink checks do not protect the generated caption target, and the final write is not performed through a safe create/replace operation that refuses symlinks.
buildCreateCaptionFilesPlan rejects symlinked source images by comparing realPath(sourcePath) with the canonical directory path, but it only checks captionPath with exists/stat. If captionPath is a symlink to another file, stat commonly follows the symlink and reports the target as a File. When overwrite is enabled, the entry is accepted and applyCreateCaptionFilesPlan writes directly to entry.captionPath. File writes follow symlinks, so a malicious dataset containing image.png plus image.txt -> ~/.bashrc (or another user-writable file) can cause that outside file to be overwritten with the chosen caption text when the user runs the new command with --overwrite.
Validation
Confirm the command derives caption targets from direct image file stems and performs source-entry symlink checks only.
Confirm the generated caption target is inspected with exists/stat but not lstat/realPath, so a symlink to a regular file can pass as File.
Confirm --overwrite permits an existing caption target and applyCreateCaptionFilesPlan writes directly to entry.captionPath.
Demonstrate a malicious dataset with alpha.png plus alpha.txt symlink to an outside writable file causes that outside file to be overwritten with attacker-controlled caption text.
Reproduce through the actual CLI binary in this container; blocked by missing dependencies and unavailable compatible Bun/catalog install path, so a faithful reduced PoC plus source citations were used.
Validation artifact
Evidence
tooling/cli/src/commands/Files/Files.service.ts
1036
const captionName = `${path.basename(sourceName, extension)}.txt`;
1037
const captionPath = path.join(directory, captionName);
1038
1039
if (HashSet.has(plannedCaptionNames, captionName)) {
1040
skipped = A.append(
1041
skipped,
1042
makeCreateCaptionFilesSkippedEntry(
1043
sourceName,
1044
sourcePath,
1045
O.some(extension),
1046
O.some(captionName),
1047
"caption-target-collision",
1048
`Another image in this run already targets "${captionName}".`
1049
)
1050
);
1051
continue;
1052
}
1053
1054
const captionExists = yield* fs
1055
.exists(captionPath)
1056
.pipe(
1057
Effect.mapError((cause) => formatPlatformError("Failed to inspect caption target", captionPath, { cause }))
1058
);
1059
let overwritesExisting = false;
1060
1061
if (captionExists) {
1062
const captionStat = yield* fs
1063
.stat(captionPath)
1064
.pipe(Effect.mapError((cause) => formatPlatformError("Failed to stat caption target", captionPath, { cause })));
1065
1066
if (captionStat.type !== "File") {
1067
skipped = A.append(
1068
skipped,
1069
makeCreateCaptionFilesSkippedEntry(
1070
sourceName,
1071
sourcePath,
1072
O.some(extension),
1073
O.some(captionName),
1074
"caption-target-not-file",
1075
`Caption target "${captionName}" already exists and is not a file.`
1076
)
1077
);
1078
continue;
1079
}
1080
1081
if (!options.overwrite) {
1082
skipped = A.append(
1083
skipped,
1084
makeCreateCaptionFilesSkippedEntry(
1085
sourceName,
1086
sourcePath,
1087
O.some(extension),
1088
O.some(captionName),
1089
"caption-exists",
1090
`Caption target "${captionName}" already exists.`
1091
)
1092
);
1093
continue;
1094
}
1095
1096
overwritesExisting = true;
1097
}
1130
const applyCreateCaptionFilesPlan = Effect.fn("Files.applyCreateCaptionFilesPlan")(function* (
1131
plan: CreateCaptionFilesPlan
1132
): Effect.fn.Return<void, FilesCommandError, FileSystem.FileSystem> {
1133
const fs = yield* FileSystem.FileSystem;
1134
1135
for (const entry of plan.entries) {
1136
yield* fs
1137
.writeFileString(entry.captionPath, plan.caption)
1138
.pipe(
1139
Effect.mapError((cause) => formatPlatformError("Failed to write caption sidecar", entry.captionPath, { cause }))
1140
);
1141
}
Attack-path analysis
The original medium rating is reasonable for the standalone local CLI bug class: code evidence shows a symlink-following file write that can overwrite user-writable files when --overwrite is used. However, under the provided scope rules and threat model, this is in tooling/cli, a private/local monorepo CLI, not a main product service, Tauri boundary, sidecar HTTP/RPC endpoint, AI SDK server, sandbox boundary, or deployment manifest. The attack requires local user interaction and processing an untrusted dataset with an explicit overwrite flag, with impact limited to the invoking user's writable files. Therefore it should be ignored for product-scope criticality, or at most treated as a low-priority hardening issue if the CLI is distributed to end users.
Path
Attacker-controlled dataset --dataset contains crafted same-stem sidecar symlink--> alpha.png plus alpha.txt symlink --victim processes dataset locally--> Victim runs files create-captions --overwrite ----overwrite permits existing caption targets--> captionPath checked with exists/stat --no lstat/realPath/no-follow validation for caption target--> writeFileString follows symlink --caption text is written through symlink--> Outside writable file overwritten
Static evidence supports the bug: source entries are canonicalized and symlink-checked, but generated caption targets are only checked with exists/stat and then written directly. A same-stem .txt symlink to a regular writable file can therefore pass when --overwrite is enabled, and writeFileString will overwrite the symlink target. The impact is limited to files writable by the user running a local developer CLI, with explicit --overwrite and user interaction required. Because tooling/cli is a private/local workspace tool and not part of the main threat-modelled desktop sidecar or network services, the product-scope criticality should be ignored despite the real local file-handling defect.
Likelihood
Low - Exploitation requires a preserved symlink in an attacker-supplied local dataset plus victim execution of a developer CLI with --overwrite. There is no public port, service identity, ingress, or remote unauthenticated trigger.
Impact
Low - Technically, the bug can overwrite or truncate an arbitrary file writable by the CLI user outside the selected dataset directory. It does not provide privilege escalation beyond that user and is not reachable from the main networked or desktop product surfaces identified in the threat model.
Assumptions
An attacker can provide or influence a local image dataset directory and have symlinks preserved when the victim extracts or copies it.
The victim runs the local files create-captions command against that directory with --overwrite and without --dry-run.
The symlink target is writable by the OS user running the CLI.
The affected tooling/cli package is treated as developer/local tooling unless separately distributed to end users who process untrusted datasets.
malicious dataset directory containing a direct image file and same-stem .txt symlink
victim executes local @beep/repo-cli files create-captions
victim passes --overwrite for an existing symlink target
target file is writable by the invoking OS user
Controls
source image entries are realPath-checked against the canonical directory
--overwrite is explicit and non-default for existing caption sidecars
--dry-run is available and avoids writes
the command runs locally with only the invoking OS user's filesystem permissions
affected package is marked private workspace tooling
Blindspots
Static-only review did not execute the real CLI because dependencies were unavailable in the provided validation context.
Repository evidence does not prove whether @beep/repo-cli is actually published or used by external end users despite README bunx examples and package private=true.
No deployment manifests expose this command as a service, but external packaging or documentation outside the checkout could change reachability.
The exact no-follow behavior of Effect/Bun writeFileString is inferred from normal filesystem semantics and prior reduced PoC evidence, not re-executed here.
Finding content copied
Finding content copied
```
