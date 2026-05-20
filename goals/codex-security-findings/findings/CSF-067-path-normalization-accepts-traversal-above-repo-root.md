# CSF-067: Path normalization accepts traversal above repo root

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | New |
| Repository | kriegcloud/beep-effect |
| Source commit | 8d4dfb8 |
| Reported age | post-merge follow-up |
| Capture method | authenticated-api-from-browser |
| Owner area | packages/tooling/library/repo-codegraph |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

The repo-codegraph lookup path normalizer collapsed leading `..` segments away. A caller selector such as `../../packages/foundation/modeling/schema` could incorrectly match an in-repo package and suppress the unmatched-selector warning.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The follow-up branch now tracks traversal above the synthetic repo root and preserves escaped selectors as unmatched instead of normalizing them into catalog package paths.
- Remediation status: `fixed-in-follow-up-branch`
- Verification command: `bunx --bun vitest run packages/tooling/library/repo-codegraph/test/lookup.test.ts`
- Changed files:
  - packages/tooling/library/repo-codegraph/src/RepoCodegraphLookup.ts
  - packages/tooling/library/repo-codegraph/test/lookup.test.ts
- Verification notes:
  - The lookup regression verifies `../../packages/...` produces an unknown boundary and unmatched-selector warning.

## Evidence Paths

- packages/tooling/library/repo-codegraph/src/RepoCodegraphLookup.ts

## Validation Notes From Codex

- The original normalizer used `..` by dropping the previous accumulated segment.
- When there was no previous segment, leading traversal was discarded.
- This was correctness drift in advisory lookup behavior rather than a runtime security boundary bypass.

## Sanitized Finding Content

```text
Finding: Path normalization accepts traversal above repo root
Severity: Informational
Commit: 8d4dfb8
Status at capture: new
Codex finding id: 5879ada8c0e081918f55670af78a43d6

Report summary:
Leading traversal in caller selectors was normalized away, allowing outside-repo-looking selectors to match catalog packages and produce boundary advice for the wrong caller.
```
