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
