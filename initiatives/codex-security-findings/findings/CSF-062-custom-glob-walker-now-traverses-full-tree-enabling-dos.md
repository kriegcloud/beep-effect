# CSF-062: Custom glob walker now traverses full tree, enabling DoS

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | d70aed0 |
| Reported age | 1mo ago |
| Capture method | dom-fallback |
| Owner area | packages/common/utils/src |
| Triage verdict | needs-current-head-review |
| Codex close reason | pending |

## Summary

Introduces a resource-exhaustion/stack overflow risk by traversing the entire directory tree regardless of glob/ignore scope.

## Current-HEAD Triage

- Verdict: `needs-current-head-review`
- Rationale: Pending validation against current `HEAD`.
- Remediation status: `not-started`
- Verification command: `pending`

## Evidence Paths

- packages/common/utils/src/Glob.ts

## Validation Notes From Codex

- Confirm walk() recursively enumerates every entry before any include/ignore filtering (Glob.ts:148-172).
- Demonstrate full-tree enumeration with a PoC (total entries ≫ matched entries).
- Trigger stack overflow/crash with deep directory traversal using the real module.
- Observe excessive memory/IO with the real module under dependency-installed runtime.
- Capture debugger/valgrind evidence (tools unavailable).

## Sanitized Finding Content

```text
Finding
Custom glob walker now traverses full tree, enabling DoS
Report
Chat
Severity
Informational
Adjust to improve accuracy in future scans
Commit
d70aed0
8:38 PM Apr 5, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduces a resource-exhaustion/stack overflow risk by traversing the entire directory tree regardless of glob/ignore scope.
The commit replaces Bun/Node globbing with a custom `walk()` that recursively reads every directory under the cwd and collects all entries before applying include/ignore filters. This means even restrictive patterns (e.g., `src/**` or ignore rules) still trigger a full-tree traversal and eager materialization of all paths. An attacker who controls repository contents or can trigger glob calls (e.g., via tooling or agent inputs) can create large/deep directory trees to cause heavy I/O, memory growth, or recursion stack overflows, resulting in a denial-of-service.
Validation
Confirm walk() recursively enumerates every entry before any include/ignore filtering (Glob.ts:148-172).
Demonstrate full-tree enumeration with a PoC (total entries ≫ matched entries).
Trigger stack overflow/crash with deep directory traversal using the real module.
Observe excessive memory/IO with the real module under dependency-installed runtime.
Capture debugger/valgrind evidence (tools unavailable).
Validation artifact
Evidence
packages/common/utils/src/Glob.ts
136
const scanWithNodeGlob = async (
137
pattern: Pattern,
138
options: undefined | GlobOptions,
139
cwdUrl: URL,
140
toAbsolute: (relativePath: string) => string
141
): Promise<Array<string>> => {
142
const fs = await import("node:fs");
143
const path = await import("node:path");
144
const cwdPath = fileURLToPath(cwdUrl);
145
const includeMatchers = compileMatchers(toPatterns(pattern), options);
146
const ignoreMatchers = compileMatchers(toIgnorePatterns(options?.ignore), options);
147
148
const walk = (relativeDir = ""): ReadonlyArray<readonly [relativePath: string, isFile: boolean]> => {
149
const absoluteDir = relativeDir.length === 0 ? cwdPath : path.join(cwdPath, relativeDir);
150
const entries = fs.readdirSync(absoluteDir, { withFileTypes: true });
151
152
return A.flatMap(entries, (entry) => {
153
const relativePath = normalizePathSeparators(
154
relativeDir.length === 0 ? entry.name : path.join(relativeDir, entry.name)
155
);
156
const isFile = entry.isFile();
157
158
if (entry.isDirectory()) {
159
return [[relativePath, false] as const, ...walk(relativePath)];
160
}
161
162
return [[relativePath, isFile] as const];
163
});
164
};
165
166
const relativePaths = pipe(
167
walk(),
168
A.filter(([candidate]) => options?.dot === true || !hasDotSegment(candidate)),
169
A.filter(([candidate]) => !matchesAny(ignoreMatchers, candidate)),
170
A.filter(([, isFile]) => options?.nodir !== true || isFile),
171
A.filter(([candidate]) => matchesAny(includeMatchers, candidate)),
172
A.map(([candidate]) => candidate),
Attack-path analysis
The traversal bug is real, but the only in-repo consumers are tooling utilities (tooling/cli and tooling/repo-utils). These are developer/CI tools, not part of the runtime services in the threat model, and they are not exposed over a network. The impact is therefore limited to local availability and is out of scope for the modeled attack surfaces, so criticality is adjusted to ignore.
Path
Attacker-controlled repo contents (deep/large tree) --repo passed to CLI--> Tooling CLI uses FsUtils.globFiles with repo root cwd --globFiles -> SharedGlob.glob()--> @beep/utils/Glob.walk() full-tree recursion before filtering --full enumeration causes heavy I/O/CPU--> Resource exhaustion / tooling DoS
The custom Glob implementation recursively walks every directory and only filters after collecting all entries (packages/common/utils/src/Glob.ts:148-172). This service is consumed by tooling/repo-utils FsUtils and used by tooling CLI commands such as TrustGraph to discover workspace package.json files via globFiles (tooling/repo-utils/src/FsUtils.ts:148-173; tooling/cli/src/commands/TrustGraph/internal/TrustGraphRuntime.ts:1117-1125). As a result, running these developer/CI tools on a repo with a large/deep tree can cause local resource exhaustion. However, this code path is in tooling, not the runtime services in the threat model, so it is out of scope for production attack surfaces.
Likelihood
Ignore - Requires a user/CI to run tooling against a crafted large/deep repo; not remotely triggerable.
Impact
Ignore - Impact is limited to local tooling/CI availability; no data exposure or privilege escalation.
Assumptions
Search results show @beep/utils/Glob is only imported by tooling/repo-utils and tests, not by runtime services in the threat model.
Tooling CLI commands (e.g., TrustGraph/Docgen) are developer/CI utilities and not exposed as network services.
No additional dynamic or out-of-repo consumers of @beep/utils/Glob are in scope for this assessment.
User/CI runs tooling CLI that uses FsUtils.globFiles (e.g., TrustGraph)
Repository contains a large/deep directory tree under the configured cwd
Controls
Local-only tooling execution (no network exposure)
Blindspots
Static-only review: no runtime build to confirm whether other unpublished consumers use @beep/utils/Glob.
Potential external consumers of the published package are out of scope for this repository assessment.
Finding content copied
Finding content copied
```
