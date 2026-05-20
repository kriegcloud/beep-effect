# CSF-042: Glob scan now aborts on dangling symlinks causing DoS

## Metadata

| Field | Value |
|---|---|
| Severity | Low |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 8199257 |
| Reported age | 1mo ago |
| Capture method | dom-fallback |
| Owner area | packages/foundation/modeling/utils/src |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced: the new traversal always stats symlink targets and does not catch errors, so broken or inaccessible symlinks can trigger a glob failure and block operations.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The Node glob fallback catches failed stat calls for dangling or inaccessible symlinks, skips symlinked directories instead of recursing into them, and limits scans to static roots derived from include patterns.
- Remediation status: `fixed-in-current-head`
- Verification command: `bunx --bun vitest run packages/foundation/modeling/utils/test/Glob.test.ts --testNamePattern 'dangling symlinks|symlinked directories'`
- Changed files:
  - none
- Verification notes:
  - The Glob tests cover dangling symlink skipping and non-recursion into symlinked directories.

## Evidence Paths

- packages/foundation/modeling/utils/src/Glob.ts

## Validation Notes From Codex

- Identify unguarded fs.statSync on symlinks in scanDirectoryWithNodeFs (Glob.ts:272-287)
- Create a dangling symlink and run a minimal reproduction of the scan logic
- Confirm the unhandled exception aborts the scan (process exit with ENOENT)
- Validate permission-denied symlink case
- Execute full Glob service with dependencies to observe GlobError propagation

## Sanitized Finding Content

```text
Finding
Glob scan now aborts on dangling symlinks causing DoS
Report
Patch
Chat
Severity
Low
Adjust to improve accuracy in future scans
Commit
8199257
5:54 AM Apr 10, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced: the new traversal always stats symlink targets and does not catch errors, so broken or inaccessible symlinks can trigger a glob failure and block operations.
The commit replaces Node’s globSync with a manual recursive scan. The new scanDirectoryWithNodeFs unconditionally calls fs.statSync on every symlink to decide if it is a directory. If a repository contains a dangling or permission-denied symlink, statSync throws and the glob call fails. Tools that rely on globbing (repo-utils, docgen, etc.) will abort, enabling an attacker to deny service by introducing such symlinks into a repository being scanned.
Validation
Identify unguarded fs.statSync on symlinks in scanDirectoryWithNodeFs (Glob.ts:272-287)
Create a dangling symlink and run a minimal reproduction of the scan logic
Confirm the unhandled exception aborts the scan (process exit with ENOENT)
Validate permission-denied symlink case
Execute full Glob service with dependencies to observe GlobError propagation
Validation artifact
Evidence
packages/foundation/modeling/utils/src/Glob.ts
272
fs.readdirSync(absoluteDirectoryPath, {
273
withFileTypes: true,
274
}),
275
A.fromIterable,
276
A.flatMap((entry) => {
277
const relativePath = relativeDirectoryPath.length === 0 ? entry.name : `${relativeDirectoryPath}/${entry.name}`;
278
const normalizedRelativePath = normalizePathSeparators(relativePath);
279
const absolutePath = fileURLToPath(new URL(normalizedRelativePath, cwdUrl));
280
const isHiddenPath = options?.dot !== true && hasDotSegment(normalizedRelativePath);
281
282
if (isHiddenPath) {
283
return [];
284
}
285
286
const isDirectory = entry.isDirectory() || (entry.isSymbolicLink() && fs.statSync(absolutePath).isDirectory());
287
288
if (matchesCompiledPatterns(ignoreMatchers, normalizedRelativePath, isDirectory)) {
289
return [];
290
}
291
292
const currentEntry =
293
matchesCompiledPatterns(includeMatchers, normalizedRelativePath, isDirectory) &&
294
(isDirectory ? options?.nodir !== true : true)
295
? [
296
{
297
isDirectory,
298
relativePath: normalizedRelativePath,
299
} satisfies NodeGlobEntry,
300
]
301
: [];
302
303
if (!isDirectory || entry.isSymbolicLink()) {
304
return currentEntry;
Attack-path analysis
Impact is limited to availability (glob scan failure) and requires a repository with a crafted/broken symlink plus the Node fallback path. The error is caught at the operation boundary (GlobError), so there is no broader compromise. This supports a low severity rather than medium/high.
Path
Untrusted repo content (dangling symlink) --repo scanned--> scanDirectoryWithNodeFs uses fs.statSync on symlink --statSync throws on broken/inaccessible symlink--> statSync throws -> GlobError --glob operation fails--> glob scan fails (DoS of scan/indexing)
scanDirectoryWithNodeFs determines directory status for symlinks by calling fs.statSync without per-entry error handling. A dangling or permission-denied symlink will throw, and the Node fallback scan fails as a whole (wrapped as GlobError), aborting any tooling relying on globbing. The validation stage reports a PoC that reproduces ENOENT on a dangling symlink, indicating a real availability failure. Impact is limited to scan failure (DoS), with no data exposure or code execution.
Likelihood
Medium - If an attacker can supply or influence a scanned repository, creating a dangling symlink is easy; however it requires filesystem-level control and the Node fallback path.
Impact
Low - Failure to scan causes tooling/indexing to abort for a repository containing a dangling or inaccessible symlink; availability-only impact.
Assumptions
The @beep/utils/Glob service is used by runtime or tooling that scans untrusted repositories (even though no in-repo usage is found).
The Node fallback path is exercised (Bun.Glob is unavailable in the environment).
An attacker can provide or influence repository contents being scanned.
Repository scan includes a dangling or permission-denied symlink
Node fallback path is used (Bun.Glob unavailable)
Controls
Global error wrapping (GlobError) prevents hard crash but still fails the glob operation
Blindspots
No in-repo usage of @beep/utils/Glob was found; external consumption is assumed.
Deployment/runtime environment (Node vs Bun) is unknown; Node fallback may be rare.
Static analysis only; no runtime confirmation of service behavior.
Finding content copied
Finding content copied
```
