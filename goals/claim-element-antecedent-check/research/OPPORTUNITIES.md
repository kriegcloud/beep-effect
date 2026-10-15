# Opportunities and friction receipts — claim-element-antecedent-check

Receipts recorded at the moment friction happens (AGENTS.md "Friction is a first-class output").
They are redacted: no secrets, no absolute home paths, no session ids.

## 2026-10-14 — USPTO ODP key rejected (403) when scoping the P2b adapter

- **Doing:** probing the Open Data Portal documents endpoint. The goal was to learn whether
  file-wrapper claims (`CLM`) download as XML, which decides how the `UsptoClaims` adapter parses
  claims.
- **Evidence:**
  - The workstation's agent `USPTO_API_KEY` reference resolves to a 30-character key.
  - `GET https://api.uspto.gov/api/v1/patent/applications/<public application>` returns `403`
    with the key and `401` without it. The `/documents` endpoint returns `{"message":"Forbidden"}`,
    and the search endpoint also returns `403`.
  - So the key is recognized but not authorized.
- **Cost:**
  - The adapter's `application` source is blocked, and so is the office-action provenance for
    positive fixtures.
  - P2a and the use-cases Layer are unaffected.
- **Would have prevented it:**
  - A `beep` health probe for each external data credential: a cheap authorized call, reporting
    status only and never the value.
  - Running that probe when a goal that depends on the source graduates.
  - Regenerating an ODP key needs the operator's verified USPTO account, which is a human step.

## 2026-10-14 — Junie lane died on an exhausted JetBrains balance the accounts screen did not show

- **Doing:** running P2a as a bounded Junie lane (`junie --model=claude-opus-5-5 --effort=medium`).
  The doctrine prefers the JetBrains pool while `beep accounts status` shows credit left in the
  cycle.
- **Evidence:**
  - `beep accounts status` showed JetBrains AI at "23% left" with three days to reset.
  - Seven minutes and about 40K Opus output tokens into the run, Junie exited 1. Its JSON `errors`
    held "Insufficient account balance. All tokens in your account have been spent."
  - The text printed was "Failed to build 'issue.md.junie_standalone'".
  - No files changed.
- **Cost:** one lane launch. The work moved to the Claude child route.
- **Would have prevented it:**
  - The accounts poller should read the JetBrains balance at launch time, or mark how old its
    reading is.
  - Lane launchers should map Junie's "Insufficient account balance" error to a confirmed quota
    failure, so the fallback is automatic and the summary line is not misleading.
