# CSF-006: Yeet skill leaks process command lines

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | New |
| Repository | kriegcloud/beep-effect |
| Source commit | 7ce284a |
| Reported age | 1d ago |
| Capture method | dom-get-page-text |
| Owner area | .claude/skills/yeet |
| Lane | _pending P4_ |
| Disposition | _pending P2_ |
| Triage verdict | _pending P2_ |
| Codex close reason | _pending P2_ |

## Summary

A new information leak was introduced in the added `.claude/skills/yeet/SKILL.md` workflow. The commit adds a Claude skill intended for automatic use in common repair, publish, PR, and merge-readiness tasks. As part of its normal workflow it tells the agent to execute `ps -eo pid,ppid,stat,etime,cmd` and return matching process command lines. Full command lines commonly contain sensitive data such as bearer tokens in `git -c http.extraHeader=...`, credentials embedded in clone/fetch URLs, or API keys passed as CLI arguments. Because coding-agent tool outputs are included in the model transcript and may be visible to remote services or collaborators, this creates an avoidable information disclosure path. The check should avoid printing full `cmd` arguments, restrict to safe metadata, or redact credentials before output.

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

- .claude/skills/yeet/SKILL.md

## Validation Notes From Codex

- Confirm the suspected file was introduced by commit 7ce284af49aa687ad3b2aae0d223966cbf9d7882, not pre-existing.
- Confirm the skill metadata/workflow makes this command part of normal repair/verify/publish/PR quality operations.
- Confirm the workflow uses ps with the full cmd column and broad filters such as git , which can include sensitive CLI arguments.
- Confirm there is no redaction or safe metadata-only restriction before output is returned to the agent transcript.
- Dynamically reproduce with a controlled canary secret in a matching process command line and show the skill command prints it.

## Sanitized Finding Content

```text
Finding
Yeet skill leaks process command lines
Report
Chat
Severity
Medium

Commit
7ce284a
12:04 AM Jun 7, 2026

by elpresidank

Repository
kriegcloud/beep-effect
Summary

A new information leak was introduced in the added `.claude/skills/yeet/SKILL.md` workflow. The application runtime code changes reviewed do not introduce an additional server-side vulnerability, but this new agent workflow can disclose local process secrets during routine quality operations.

The commit adds a Claude skill that is intended to be used automatically for common repair, publish, PR, and merge-readiness tasks. As part of its normal workflow it tells the agent to execute `ps -eo pid,ppid,stat,etime,cmd` and return matching process command lines. Full command lines commonly contain sensitive data such as bearer tokens in `git -c http.extraHeader=...`, credentials embedded in clone/fetch URLs, API keys passed as CLI arguments, or other local process arguments. Because coding-agent tool outputs are included in the model transcript and may be visible to remote services or collaborators, this creates an avoidable information disclosure path. The check should avoid printing full `cmd` arguments, restrict itself to safe process metadata, or redact credentials before any output is returned.

Validation
Confirm the suspected file was introduced by commit 7ce284af49aa687ad3b2aae0d223966cbf9d7882, not pre-existing.
Confirm the skill metadata/workflow makes this command part of normal repair/verify/publish/PR quality operations.
Confirm the workflow uses ps with the full cmd column and broad filters such as git , which can include sensitive CLI arguments.
Confirm there is no redaction or safe metadata-only restriction before output is returned to the agent transcript.
Dynamically reproduce with a controlled canary secret in a matching process command line and show the skill command prints it.

Evidence
.claude/skills/yeet/SKILL.md (L1-3 metadata promotes routine use; L26-31 runs ps with full cmd column and no redaction)

Attack-path analysis

Severity remains medium. Evidence shows a real information-disclosure path: `.claude/skills/yeet/SKILL.md` promotes routine use and runs `ps` with the full `cmd` column and no redaction, and validation reproduced disclosure of a controlled bearer-token-like argument. The issue is not high or critical because it is a local developer-agent workflow, not a public service; it requires human/agent invocation and the presence of sensitive command-line arguments.

Path
Developer checkout containing .claude/skills/yeet/SKILL.md --skill metadata and repo docs promote routine use--> Operator invokes normal Yeet quality/PR workflow --first step runs process-list command--> Coding agent executes unredacted ps command --command output is returned to agent--> Tool output enters agent transcript --transcript/tool output crosses local trust boundary--> Secret visible to model service or transcript collaborators

Likelihood
Medium - The Yeet skill is intended for common maintenance and PR workflows, so the vulnerable command is reachable during normal use. Exploitation is not automatic from the internet and depends on operator interaction plus a sensitive matching process, making likelihood medium rather than high.
Impact
Medium - Potential disclosure includes high-value credentials embedded in command-line arguments, such as git bearer tokens or credentialed URLs. The impact is conditional because the affected data must be present in a concurrent matching process and exposed through the agent transcript, but the validated PoC demonstrates that such secrets can be printed.
Controls
No public ingress or listening port is introduced by the affected Markdown skill.
No repository evidence of redaction, sanitization, or metadata-only restriction before process output is returned.
Reachability is gated by local operator/coding-agent invocation.
```
