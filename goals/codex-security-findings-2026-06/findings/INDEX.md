# Codex Security Findings Index (2026-06)

Partially captured from Codex Cloud Security scan
[`5138685acf488191ad6a5ee51a84452d`](https://chatgpt.com/codex/cloud/security/findings/5138685acf488191ad6a5ee51a84452d)
on 2026-06-08 for `kriegcloud/beep-effect`. The scan contains 52 findings
visible in the authenticated Codex Security UI with severities
`high,medium,low,informational`; this index currently registers the 12 committed
captures. Unremediated High findings are redacted in public tracking until their
fixes land atomically. Remediation lands on branch
`@slop/june-8-2026` in a single PR.

Disposition policy: remediate by default; `Won't fix` only with explicit written
justification. One approval gate after triage. Two Chrome closure passes
(non-remediated after the gate; remediated when the PR is mergeable).

## Queue Summary

| Verdict | Count |
|---|---:|
| fixed | 0 |
| dismissed | 0 |
| wont-fix | 0 |
| _untriaged captured_ | 12 |
| _not captured yet_ | 40 |

## Expected Scan Severity Summary

| Severity | Count |
|---|---:|
| High | 3 |
| Medium | 15 |
| Low | 18 |
| Informational | 16 |

## Captured Severity Summary

| Severity | Count |
|---|---:|
| High | 3 |
| Medium | 9 |
| Low | 0 |
| Informational | 0 |

## Disposition Summary

| Disposition | Count |
|---|---:|
| remediate | 0 |
| false-positive | 0 |
| already-fixed | 0 |
| accepted-risk | 0 |
| _untriaged captured_ | 12 |
| _not captured yet_ | 40 |

## Lane Summary

| Lane | Findings | Owner paths |
|---|---|---|
| _pending P4 partition_ | — | — |

## Findings

| ID | Severity | Verdict | Disposition | Codex Status | Lane | Title | Owner Area | Source Commit |
|---|---|---|---|---|---|---|---|---|
| [CSF-001](./CSF-001-redacted-high-finding.md) | High | _pending P2_ | _pending P2_ | New | _pending P4_ | Redacted High severity finding | _private tracker_ | _redacted_ |
| [CSF-002](./CSF-002-redacted-high-finding.md) | High | _pending P2_ | _pending P2_ | New | _pending P4_ | Redacted High severity finding | _private tracker_ | _redacted_ |
| [CSF-003](./CSF-003-redacted-high-finding.md) | High | _pending P2_ | _pending P2_ | New | _pending P4_ | Redacted High severity finding | _private tracker_ | _redacted_ |
| [CSF-004](./CSF-004-unescaped-systemd-upstream-enables-directive-injection.md) | Medium | _pending P2_ | _pending P2_ | New | _pending P4_ | Unescaped systemd upstream enables directive injection | packages/tooling/tool | 241a206 |
| [CSF-005](./CSF-005-unrestricted-box-url-operations-enable-ssrf.md) | Medium | _pending P2_ | _pending P2_ | New | _pending P4_ | Unrestricted Box URL operations enable SSRF | packages/drivers/box | 9d8e7ac |
| [CSF-006](./CSF-006-yeet-skill-leaks-process-command-lines.md) | Medium | _pending P2_ | _pending P2_ | New | _pending P4_ | Yeet skill leaks process command lines | .claude/skills/yeet | 7ce284a |
| [CSF-007](./CSF-007-pr-affected-lint-skips-repo-wide-security-policies.md) | Medium | _pending P2_ | _pending P2_ | New | _pending P4_ | PR affected lint skips repo-wide security policies | packages/tooling/tool/cli | 009c89b |
| [CSF-008](./CSF-008-unsafe-markdown-projection-permits-script-link-injection.md) | Medium | _pending P2_ | _pending P2_ | New | _pending P4_ | Unsafe Markdown projection permits script-link injection | packages/foundation/modeling/ontology | 8a64c3c |
| [CSF-009](./CSF-009-turtle-projection-allows-prefix-injection.md) | Medium | _pending P2_ | _pending P2_ | New | _pending P4_ | Turtle projection allows prefix injection | packages/foundation/modeling/ontology | 8273eb9 |
| [CSF-010](./CSF-010-default-defect-encoding-leaks-error-causes-over-rpc.md) | Medium | _pending P2_ | _pending P2_ | New | _pending P4_ | Default defect encoding leaks Error causes over RPC | packages/effect/src/unstable/rpc | 5938a35 |
| [CSF-011](./CSF-011-symlink-following-source-scan-can-escape-repo.md) | Medium | _pending P2_ | _pending P2_ | New | _pending P4_ | Symlink-following source scan can escape repo | packages/tooling/tool/cli | fa66534 |
| [CSF-012](./CSF-012-nlp-telemetry-logs-unsanitized-failure-causes.md) | Medium | _pending P2_ | _pending P2_ | New | _pending P4_ | NLP telemetry logs unsanitized failure causes | packages/foundation/capability/nlp | 0b8d3fc |
