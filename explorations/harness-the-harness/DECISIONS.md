# Decisions

<!--
Stage 2. The grilling log. One entry per resolved branch-closing question,
newest last. Unresolved questions live in ops/manifest.json `openQuestions`
until they land here. Deferred questions get an entry too, marked DEFERRED
with the reason.
-->

## 2026-10-14 — D1 Open a packet instead of parking the Notion item

**Question:** The Notion item sat in Parking Lot. Park it, or open an
exploration?

**Answer:** Open `explorations/harness-the-harness` and carry it through
research into align.

**Rationale:** Operator ruling S23 (2026-10-14): "we don't need to 'park
things' I want things done." The orchestrator relayed it and the opening
session's recommended next step was this packet. Reversal: flip status to
`parked` with a dated reason here; nothing outside the packet depends on it.

## 2026-10-14 — D2 Wrap Claude Code, do not replace it

**Question:** Build our own agent environment, or sit on top of Claude Code?

**Answer:** Sit on top. Claude Code (and optionally Codex) is the engine on
the lawyer's own subscription; our layer wraps its developer surfaces and
harnesses its extension points.

**Rationale:** Operator: "We wouldn't be replacing claude code" and "how do
we wrap claude code so it is less technical for lawyers & how do we harness
the harness". Rejected: an own agent loop or hosted runtime. Whether the wrap
needs an own UI at all is Q1, explicitly left open by the operator.

## 2026-10-14 — D3 Human-steps boundary (agent-decided)

**Question:** How far may the onboarding agent go on the lawyer's behalf?

**Answer:** It does everything automatable: installs, configuration, opening
links, filling non-secret form fields, probing and repairing. The human
performs only consent screens, password and MFA entry, Windows admin (UAC)
prompts, reboots, and account creation where an account is truly needed. The
agent never types credentials or creates accounts.

**Rationale:** Matches the operator's "let them click buttons & enter their
password where 100% necessary." Computer-use credential entry and account
creation are brittle (UI drift, MFA, CAPTCHA) and a security liability.
Reversal: none needed; this is a floor, loosened only by an explicit new
decision.

## 2026-10-14 — D4 Windows Credential Manager is the default secret store

**Question:** Which secret store does a lawyer's stack use by default?

**Answer:** Windows Credential Manager, needing no account. A firm's existing
password manager is an optional provider only if adoption research shows
attorneys use it. 1Password stays the developer-side route.

**Rationale:** Operator: "definitely this. Not so sure about LastPass or
Bitwarden." A single lawyer's stack mainly holds OAuth tokens, which the OS
store holds safely; 1Password service accounts solve a multi-agent developer
problem. BitLocker is disk encryption: the doctor checks it is on, it is not a
store.

## 2026-10-14 — D5 Provider priority follows solo/small-firm adoption

**Question:** In what order do we add provider adapters?

**Answer:** By measured adoption among solo and small firms, per capability
(documents, secrets, mail/calendar, practice/billing). Early data puts Clio
first for practice management; OneDrive/SharePoint and Dropbox may outrank
NetDocuments for solos. A named provider without an adapter is recorded as a
gap with a fallback and counted as demand.

**Rationale:** Operator: "choose the most popular options for solo & small
firms. We'll prioritize with that data." The operator's "NetSuite" example
meant NetDocuments. Whether to buy the ABA vendor-share volumes is Q5 (money).
