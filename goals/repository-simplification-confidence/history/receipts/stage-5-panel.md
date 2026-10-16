# Workstream F panel status

Round 9 reviewed `d7dae616aa9ced18b19117ec9dbc201f25d70539` and fingerprint
`b9472fc257342c598227402e46200413ae39dfdf5e30601b63594200f6a9dac0`.
Astra reported three actionable P1s. Fable and Grok returned zero-actionable.
The round-9 fix wave addresses all three P1s and nearby R9-F1, R9-F2 and R9-F3
in PR #1797. The new GitHub P2 on duplicate JSON diagnostic prefixes is also
included. No round-9 P2/P3 is deferred.

The driver ruling `RSC-F-ONE-ELIGIBILITY-GATE` makes canonical resolution,
canonical extension, fatal UTF-8, full-document parsing and parsed owned-path
presence one shared gate. Both checking commands, write and restore call it.
Recovery validates every recorded operation against live and backup bytes,
and requires the live applied hash and the backup pre-image hash. Lexical
spans and journal assertions cannot establish parsed ownership. A completed
removal with an absent live key, and a repeated restore after rollback,
now refuse under this universal gate. Backups remain retained.

See the [current F handoff](../handoffs/rsc-f-agents-2026-10-15.md),
[verification receipt](stage-5-f-panel-r9-verification.json) and
[fingerprint receipt](stage-5-f-panel-r9-fingerprint.json).

The panel remains OPEN for the driver's round 10 on the pushed candidate and
recaptured configuration. This wave creates no readiness monitor, merge or
final gate file. Historical verdicts and fingerprints remain retained.
