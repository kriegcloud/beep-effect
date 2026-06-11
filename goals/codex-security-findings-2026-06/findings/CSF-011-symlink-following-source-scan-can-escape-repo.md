# CSF-011: Symlink-following source scan can escape repo

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | New |
| Repository | kriegcloud/beep-effect |
| Source commit | fa66534 |
| Reported age | 6d ago |
| Capture method | dom-get-page-text |
| Owner area | packages/tooling/tool/cli |
| Lane | _pending P4_ |
| Disposition | _pending P2_ |
| Triage verdict | _pending P2_ |
| Codex close reason | _pending P2_ |

## Summary

Introduced: the new QualityArtifactSupport scanner follows symlinks while discovering workspace directories and TypeScript source files used by the JSDoc inventory and repo export catalog generators. The scanner calls `fs.stat()` on each directory entry and recurses/records by reported type, but never checks `readLink`/`lstat` or verifies that resolved paths remain under the repository root. Because `stat` follows symlinks, a malicious repository can place symlinks under a package `src/` or as workspace wildcard matches, so running the quality generators can traverse arbitrary local directories, parse external `.ts/.tsx` files, disclose source metadata in generated artifacts, or hit symlink cycles and crash/hang the developer/CI process. The pre-existing `Quality.collectFiles` helper skips symlinks before statting, but this new shared scanner does not.

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

- packages/tooling/tool/cli/src/commands/Quality/internal/JSDocDocumentationInventory.ts
- packages/tooling/tool/cli/src/commands/Quality/internal/QualityArtifactSupport.ts
- packages/tooling/tool/cli/src/commands/Quality/internal/RepoExportsCatalog.ts

## Validation Notes From Codex

- Confirm workspace wildcard expansion uses stat-following directory detection without symlink or containment checks.
- Confirm recursive TypeScript source discovery uses stat-following directory/file detection without symlink or containment checks.
- Confirm JSDoc inventory and repo export catalog consume discovered paths and parse them with ts-morph.
- Demonstrate with a PoC that symlinked source/workspace entries are accepted and external TypeScript metadata can enter generated artifacts.
- Demonstrate availability impact with a symlink cycle causing recursive scanner failure.

## Sanitized Finding Content

```text
Finding
Symlink-following source scan can escape repo
Report
Chat
Severity
Medium

Commit
fa66534
11:27 PM Jun 1, 2026

by elpresidank

Repository
kriegcloud/beep-effect
Summary

Introduced: the new QualityArtifactSupport scanner follows symlinks while discovering workspace directories and TypeScript source files used by the JSDoc inventory and repo export catalog generators.

This commit replaced the previous Dirent-based scanner with an Effect FileSystem implementation. The new scanner calls fs.stat() on each directory entry and then recurses into entries reported as Directory or records entries reported as File, but it never checks readLink/lstat or verifies that resolved paths remain under the repository/package root. On Node-style filesystems, stat follows symlinks. A malicious repository can place symlinks under a package src/ directory, or as workspace wildcard matches, so running the quality generators can traverse arbitrary local directories, parse external .ts/.tsx files, disclose some source metadata in generated artifacts, or hit symlink cycles / large filesystem trees and crash or hang the developer/CI process. The pre-existing Quality.collectFiles helper in the same command family explicitly skips symlinks before statting, but this new shared scanner does not.

Validation
Confirm workspace wildcard expansion uses stat-following directory detection without symlink or containment checks.
Confirm recursive TypeScript source discovery uses stat-following directory/file detection without symlink or containment checks.
Confirm JSDoc inventory and repo export catalog consume discovered paths and parse them with ts-morph.
Demonstrate with a PoC that symlinked source/workspace entries are accepted and external TypeScript metadata can enter generated artifacts.
Demonstrate availability impact with a symlink cycle causing recursive scanner failure.

Evidence
packages/tooling/tool/cli/src/commands/Quality/internal/JSDocDocumentationInventory.ts (L616-629 listSourceFiles output parsed with ts-morph Project)
packages/tooling/tool/cli/src/commands/Quality/internal/QualityArtifactSupport.ts (L299-308 workspace expansion fs.stat directory detection; L452-484 recursive visit() uses fs.stat without lstat/containment)
packages/tooling/tool/cli/src/commands/Quality/internal/RepoExportsCatalog.ts (L416-423 listSourceFiles output added to ts-morph Project)

Attack-path analysis

Kept at medium. Source review confirms the bug: QualityArtifactSupport uses stat-following traversal for workspace expansion and source discovery, and the downstream generators parse the returned paths. Root scripts and lefthook show normal developer/build reachability. However, the attack is local/build-surface only, requires attacker-controlled repo contents plus victim/CI execution, and has bounded impact.

Path
Attacker-controlled repo contents --places symlink--> Workspace/source symlink --stat follows target--> QualityArtifactSupport fs.stat traversal --returns escaped .ts/.tsx paths--> JSDoc inventory / repo export catalog parsers --parses external files or recurses into cycles--> Generated artifact metadata leak or build/CI DoS

Likelihood
Medium - Exploitation requires attacker influence over repository contents and victim execution of local quality tooling. That is plausible for malicious PRs, cloned repositories, or developer workflows, but it is not remotely triggerable over a public endpoint.
Impact
Medium - A malicious symlink can make the scanner traverse outside the repository and parse readable external TypeScript files, leaking limited source metadata into generated artifacts. Symlink loops can crash/hang the quality command or CI job. There is no demonstrated arbitrary code execution, credential exfiltration, or remote service compromise.
Controls
Local-only execution; no public ingress or listening port for this path.
No executable sink identified in the affected scanner path.
Existing ignored directory names skip node_modules/dist/build/.turbo but do not address symlinks or containment.
Another helper in the same command family skips symlinks with readLink, but the vulnerable shared scanner does not.
```
