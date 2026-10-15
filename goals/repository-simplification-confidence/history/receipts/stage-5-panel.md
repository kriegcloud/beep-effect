# Workstream F panel status

Round 7 reviewed `4812281584` and fingerprint
`bf1ac6777cd6354d3bb728bcd940a1da0cacf1fb4f417543fc42ec9c62b5a0c9`.
Astra reported three actionable P1s, Fable one actionable P1, and Grok returned
zero-actionable. The round-7 fix wave addresses all four, plus the nearby P2/P3
items, in PR #1797. No round-7 item is deferred.

The driver ruling `RSC-F-NO-CLEAN-WITHOUT-FULL-PARSER` requires shell, YAML and
XML targets to report manual verification with extracted hints, never clean.
Only real drift or unsupported forms make the check exit non-zero. TOML/JSON
write eligibility now checks locator kind, matching canonical extension, parsed
syntax and owned paths; CLI preflight occurs before target access or optional
skipping, and historical restore receives the same eligibility checks.

See the [current F handoff](../handoffs/rsc-f-agents-2026-10-15.md),
[verification receipt](stage-5-f-panel-r7-verification.json) and
[fingerprint receipt](stage-5-f-panel-r7-fingerprint.json).

The panel remains OPEN for the driver's round 8 on the pushed candidate and
recaptured configuration. No readiness monitor, merge or final gate file is
created by this wave. Historical verdicts and fingerprints remain retained.
