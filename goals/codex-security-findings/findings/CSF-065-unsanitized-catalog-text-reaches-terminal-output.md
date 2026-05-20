# CSF-065: Unsanitized catalog text reaches terminal output

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | New |
| Repository | kriegcloud/beep-effect |
| Source commit | cf8d0be |
| Reported age | post-merge follow-up |
| Capture method | authenticated-api-from-browser |
| Owner area | packages/tooling/tool/cli |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

The `beep reuse lookup` human renderer printed repository catalog text directly to the terminal. A malicious catalog entry could include terminal control sequences, ANSI/OSC escapes, carriage returns, or clipboard-control payloads that spoof or manipulate local terminal output.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The follow-up branch strips C0/C1 controls and ANSI/OSC escape sequences from every human-readable lookup field while keeping `--json` output machine-readable and unchanged.
- Remediation status: `fixed-in-follow-up-branch`
- Verification command: `bunx --bun vitest run packages/tooling/tool/cli/test/reuse-command.test.ts -t "terminal control" --testTimeout=30000`
- Changed files:
  - packages/tooling/tool/cli/src/commands/Reuse/index.ts
  - packages/tooling/tool/cli/test/reuse-command.test.ts
- Verification notes:
  - The regression test injects OSC-52, ANSI color, and carriage-return controls through lookup inputs and confirms the human renderer strips them.

## Evidence Paths

- packages/tooling/tool/cli/src/commands/Reuse/index.ts
- packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts
- packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.ts

## Validation Notes From Codex

- Catalog fields are unrestricted strings decoded from `standards/repo-exports.catalog.jsonc`.
- Human-readable lookup output printed query, warnings, symbol names, import specifiers, source paths, summaries, and boundary reasons directly.
- The vulnerable path is the non-JSON renderer; JSON output remains the correct format for trusted machine consumers.

## Sanitized Finding Content

```text
Finding: Unsanitized catalog text reaches terminal output
Severity: Medium
Commit: cf8d0be
Status at capture: new
Codex finding id: af2fd1496dfc8191a2c078d39b776e27

Report summary:
The repo-codegraph catalog reader and human-readable reuse lookup renderer accepted unrestricted catalog text and wrote it directly to Console.log. In an untrusted repository, ANSI or OSC sequences in catalog strings could spoof output or trigger limited terminal and clipboard behavior.
```
