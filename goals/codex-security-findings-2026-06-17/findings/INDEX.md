# Codex Security Findings Index (2026-06-17)

Captured from Codex Cloud Security for `kriegcloud/beep-effect` on 2026-06-17
(findings are repo-scoped, `status=open`; the URL hid `f4128216…` is the first
finding). **71** findings captured and triaged. GATE 1 approved. Detailed report
text, specific evidence paths, source commits, exploit analysis, and patches stay
in the private raw capture until fixes land atomically; tracked rows carry title +
severity + coarse owner area + disposition + rationale.

Disposition → Codex close reason: remediate→Already fixed (post-merge);
false-positive & out-of-scope→False positive; accepted-risk→Won't fix.
Two approval gates (GATE 1 after triage ✅, GATE 2 before merge). Two Chrome
closure passes (16 non-remediated after GATE 1; 55 remediated after merge).

## Severity Summary

| Severity | Count |
|---|---:|
| High | 2 |
| Medium | 23 |
| Low | 22 |
| Informational | 24 |

## Disposition Summary

| Disposition | Count | Codex reason |
|---|---:|---|
| remediate | 55 | Already fixed (post-merge) |
| false-positive | 13 | False positive |
| out-of-scope (.repos) | 1 | False positive |
| accepted-risk | 2 | Won't fix |

## Lane Summary

| Lane | Findings | Owner paths |
|---|---|---|
| _pending P4 partition_ | — | — |

## Findings

| ID | Severity | Verdict | Disposition | Codex Status | Lane | Title | Owner Area | Codex Close Reason |
|---|---|---|---|---|---|---|---|---|
| [CSF-001](./CSF-001.md) | High | partial | remediate | New | _pending_ | Turbo secret exposed to PR-controlled CI code | ci-workflows, repo-root | Already fixed |
| [CSF-002](./CSF-002.md) | High | partial | remediate | New | _pending_ | Unrestricted file/URL reads in NLP MCP tools | packages/drivers/nlp-mcp, repo-root | Already fixed |
| [CSF-003](./CSF-003.md) | Medium | partial | accepted-risk | New | _pending_ | Removed js-yaml security override reintroduces old parsers | changeset, repo-root | Won't fix |
| [CSF-004](./CSF-004.md) | Medium | real | remediate | New | _pending_ | Unbounded content-derived React keys enable chat UI DoS | apps/professional-desktop, packages/foundation/ui-system | Already fixed |
| [CSF-005](./CSF-005.md) | Medium | real | remediate | New | _pending_ | Block repair logs chat content to telemetry | apps/professional-desktop, packages/agents/server | Already fixed |
| [CSF-006](./CSF-006.md) | Medium | not-real | out-of-scope | New | _pending_ | SSE stream failures expose internal defects to clients | packages/effect/src | False positive |
| [CSF-007](./CSF-007.md) | Medium | real | remediate | New | _pending_ | USPTO document download leaks API key to arbitrary URLs | packages/drivers/uspto | Already fixed |
| [CSF-008](./CSF-008.md) | Medium | real | remediate | New | _pending_ | Corpus extract trusts manifest paths for local file reads | packages/drivers/tika, packages/tooling/tool | Already fixed |
| [CSF-009](./CSF-009.md) | Medium | real | remediate | New | _pending_ | Corpus reports leak sensitive legal corpus metadata | goals | Already fixed |
| [CSF-010](./CSF-010.md) | Medium | real | remediate | New | _pending_ | Staged-only publish can commit untracked residue via hooks | packages/tooling/tool | Already fixed |
| [CSF-011](./CSF-011.md) | Medium | real | remediate | New | _pending_ | Yeet Fallow feedback follows symlinked output paths | packages/tooling/tool | Already fixed |
| [CSF-012](./CSF-012.md) | Medium | real | remediate | New | _pending_ | Unbounded Fallow finding expansion can exhaust memory | packages/tooling/tool | Already fixed |
| [CSF-013](./CSF-013.md) | Medium | real | remediate | New | _pending_ | Unescaped systemd upstream enables directive injection | packages/tooling/tool | Already fixed |
| [CSF-014](./CSF-014.md) | Medium | real | remediate | New | _pending_ | Unrestricted Box URL operations enable SSRF | packages/drivers/box | Already fixed |
| [CSF-015](./CSF-015.md) | Medium | real | remediate | New | _pending_ | Yeet skill leaks process command lines | claude | Already fixed |
| [CSF-016](./CSF-016.md) | Medium | already-fixed | false-positive | New | _pending_ | Unsafe Markdown projection permits script-link injection | packages/foundation/modeling | False positive |
| [CSF-017](./CSF-017.md) | Medium | already-fixed | false-positive | New | _pending_ | Turtle projection allows prefix injection | packages/foundation/modeling | False positive |
| [CSF-018](./CSF-018.md) | Medium | real | remediate | New | _pending_ | Symlink-following source scan can escape repo | packages/tooling/tool | Already fixed |
| [CSF-019](./CSF-019.md) | Medium | real | remediate | New | _pending_ | NLP telemetry logs unsanitized failure causes | packages/foundation/capability | Already fixed |
| [CSF-020](./CSF-020.md) | Medium | already-fixed | false-positive | New | _pending_ | Unbounded fuzzy clone pair generation enables DoS | packages/tooling/library, packages/tooling/tool | False positive |
| [CSF-021](./CSF-021.md) | Medium | real | remediate | New | _pending_ | Unpinned MCP server command executes latest npm code | repo-root | Already fixed |
| [CSF-022](./CSF-022.md) | Medium | real | remediate | New | _pending_ | Dependency review now fails open when graph status is unavailable | ci-workflows | Already fixed |
| [CSF-023](./CSF-023.md) | Medium | real | remediate | New | _pending_ | Graphiti proxy can be DoSed by unbounded body buffering | packages/tooling/tool | Already fixed |
| [CSF-024](./CSF-024.md) | Medium | real | remediate | New | _pending_ | Streaming proxy responses bypass concurrency limits | packages/tooling/tool | Already fixed |
| [CSF-025](./CSF-025.md) | Medium | already-fixed | false-positive | New | _pending_ | Uploaded proof archives can exhaust coordinator disk | apps/stack-installer, initiatives | False positive |
| [CSF-026](./CSF-026.md) | Low | real | remediate | New | _pending_ | Malformed YouTube videoId crashes Pandoc mapping | packages/foundation/modeling | Already fixed |
| [CSF-027](./CSF-027.md) | Low | real | remediate | New | _pending_ | New OSV ignores bypass Bun audit expiry | packages/tooling/tool, repo-root | Already fixed |
| [CSF-028](./CSF-028.md) | Low | real | remediate | New | _pending_ | Local workstation paths leaked in committed docs | goals | Already fixed |
| [CSF-029](./CSF-029.md) | Low | real | remediate | New | _pending_ | Yeet diff fingerprint writes sensitive diffs to repo files | packages/tooling/tool | Already fixed |
| [CSF-030](./CSF-030.md) | Low | real | remediate | New | _pending_ | Greptile issue gate treats missing review as zero issues | packages/tooling/tool | Already fixed |
| [CSF-031](./CSF-031.md) | Low | real | remediate | New | _pending_ | PR closeout can be DoSed by comment floods | packages/tooling/tool | Already fixed |
| [CSF-032](./CSF-032.md) | Low | real | remediate | New | _pending_ | Unbounded fuzzy alignment enables CPU denial of service | packages/foundation/capability | Already fixed |
| [CSF-033](./CSF-033.md) | Low | real | remediate | New | _pending_ | Biome changed-file fast path allows option injection | packages/tooling/tool | Already fixed |
| [CSF-034](./CSF-034.md) | Low | real | remediate | New | _pending_ | Unvalidated catalog shard path escapes repo root | packages/tooling/library | Already fixed |
| [CSF-035](./CSF-035.md) | Low | real | remediate | New | _pending_ | Developer home path leaked in committed MCP config | codex, repo-root | Already fixed |
| [CSF-036](./CSF-036.md) | Low | real | remediate | New | _pending_ | Unsafe RDF serialization allows triple injection | packages/foundation/modeling | Already fixed |
| [CSF-037](./CSF-037.md) | Low | real | remediate | New | _pending_ | Tauri scaffold disables Content Security Policy | packages/tooling/tool | Already fixed |
| [CSF-038](./CSF-038.md) | Low | real | remediate | New | _pending_ | Quadratic JSON extraction enables CLI CPU denial of service | packages/tooling/tool | Already fixed |
| [CSF-039](./CSF-039.md) | Low | real | remediate | New | _pending_ | Sensitive local corpus path leaked in docs | goals | Already fixed |
| [CSF-040](./CSF-040.md) | Low | partial | remediate | New | _pending_ | Handoff IR schema accepts malformed spans and references | packages/foundation/capability | Already fixed |
| [CSF-041](./CSF-041.md) | Low | not-real | false-positive | New | _pending_ | Operation schemas are not enforced at runtime | goals, packages/foundation/capability | False positive |
| [CSF-042](./CSF-042.md) | Low | real | remediate | New | _pending_ | Raw chart CSS permits CSS injection from chart props | packages/foundation/ui-system | Already fixed |
| [CSF-043](./CSF-043.md) | Low | real | remediate | New | _pending_ | Inactive social links still leak through SEO metadata | apps/oip-web | Already fixed |
| [CSF-044](./CSF-044.md) | Low | real | remediate | New | _pending_ | Form path setter permits prototype poisoning | packages/foundation/ui-system | Already fixed |
| [CSF-045](./CSF-045.md) | Low | already-fixed | false-positive | New | _pending_ | Public restore handler permits arbitrary canvas overwrite | packages/canvas/server, packages/canvas/use-cases | False positive |
| [CSF-046](./CSF-046.md) | Low | real | remediate | New | _pending_ | Phoenix sync leaks non-Linux absolute data-root paths | packages/tooling/library, packages/tooling/tool | Already fixed |
| [CSF-047](./CSF-047.md) | Low | real | remediate | New | _pending_ | Unescaped worker-eval warnings reach CLI terminal | packages/tooling/library, packages/tooling/tool | Already fixed |
| [CSF-048](./CSF-048.md) | Informational | real | remediate | New | _pending_ | Undeclared runtime imports can break agent packages | packages/agents/client, packages/agents/server | Already fixed |
| [CSF-049](./CSF-049.md) | Informational | already-fixed | false-positive | New | _pending_ | Deleted package remains in pending changesets | changeset, packages/foundation/modeling | False positive |
| [CSF-050](./CSF-050.md) | Informational | partial | remediate | New | _pending_ | Arbitrary inline CSS accepted in Lexical viewer state | packages/foundation/modeling, packages/foundation/ui-system | Already fixed |
| [CSF-051](./CSF-051.md) | Informational | real | remediate | New | _pending_ | Corpus organize permits path traversal file writes | packages/tooling/tool | Already fixed |
| [CSF-052](./CSF-052.md) | Informational | real | false-positive | New | _pending_ | Failure verdicts omit generated packet paths | packages/tooling/tool | False positive |
| [CSF-053](./CSF-053.md) | Informational | real | false-positive | New | _pending_ | CI contract check weakly validates blocking Fallow lanes | packages/tooling/tool | False positive |
| [CSF-054](./CSF-054.md) | Informational | real | false-positive | New | _pending_ | FileName arbitrary permits NUL-containing names | packages/foundation/modeling | False positive |
| [CSF-055](./CSF-055.md) | Informational | real | remediate | New | _pending_ | Carousel atoms can collide across React roots | packages/foundation/ui-system | Already fixed |
| [CSF-056](./CSF-056.md) | Informational | already-fixed | false-positive | New | _pending_ | Canvas imports undeclared @beep/utils dependency | apps/canvas, standards | False positive |
| [CSF-057](./CSF-057.md) | Informational | real | remediate | New | _pending_ | Secure header option validation now throws defects | packages/foundation/modeling | Already fixed |
| [CSF-058](./CSF-058.md) | Informational | real | remediate | New | _pending_ | Non-atomic Yeet proof lock can race | packages/tooling/tool | Already fixed |
| [CSF-059](./CSF-059.md) | Informational | real | remediate | New | _pending_ | start-pr-early pushes before security proof runs | packages/tooling/tool | Already fixed |
| [CSF-060](./CSF-060.md) | Informational | real | remediate | New | _pending_ | Quadratic changed-file de-duplication in lint fast path | packages/tooling/tool | Already fixed |
| [CSF-061](./CSF-061.md) | Informational | real | remediate | New | _pending_ | Unvalidated Parquet export path can recursively delete files | packages/tooling/library | Already fixed |
| [CSF-062](./CSF-062.md) | Informational | real | remediate | New | _pending_ | Lint-fix paths can be parsed as Biome options | packages/tooling/tool, scripts | Already fixed |
| [CSF-063](./CSF-063.md) | Informational | already-fixed | false-positive | New | _pending_ | Undeclared @beep/utils dependency in ontology package | packages/foundation/modeling | False positive |
| [CSF-064](./CSF-064.md) | Informational | real | remediate | New | _pending_ | Yeet --base allows git fetch option injection | packages/tooling/tool | Already fixed |
| [CSF-065](./CSF-065.md) | Informational | not-real | false-positive | New | _pending_ | Storybook scripts require undeclared portless binary | packages/foundation/ui-system, repo-root | False positive |
| [CSF-066](./CSF-066.md) | Informational | real | remediate | New | _pending_ | Graph executor ignores timeout and concurrency limits | packages/foundation/capability | Already fixed |
| [CSF-067](./CSF-067.md) | Informational | real | remediate | New | _pending_ | Applicative ap reuses node IDs and corrupts graphs | packages/foundation/capability | Already fixed |
| [CSF-068](./CSF-068.md) | Informational | real | remediate | New | _pending_ | TextGraph.show can recurse indefinitely on cyclic graphs | packages/foundation/capability | Already fixed |
| [CSF-069](./CSF-069.md) | Informational | real | remediate | New | _pending_ | Broad /src/ test exclusion weakens import linting | packages/tooling/tool | Already fixed |
| [CSF-070](./CSF-070.md) | Informational | not-real | accepted-risk | New | _pending_ | Redacted JSON serialization now leaks secret values | repos | Wont fix |
| [CSF-071](./CSF-071.md) | Informational | partial | remediate | New | _pending_ | Bulk frame extraction can write outside selected directory | packages/tooling/tool | Already fixed |
