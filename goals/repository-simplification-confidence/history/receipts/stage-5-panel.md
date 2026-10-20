# Workstream F panel receipt — 2026-10-16

This is a sanitized summary of the independent F panel on #1797, rounds 1–10
and the bounded round-10 re-check. Private raw verdicts, launcher files and
config input records remain under
`~/.cache/beep/orchestrator/briefs/rsc/panel/2026-10-15*/` and
`~/.cache/beep/orchestrator/briefs/rsc/panel/2026-10-16*/`. No raw configuration,
credential, session identifier or absolute home path is copied here.

## Members and launch evidence

The three separate reviewer sessions use `gpt-6-astra` xhigh,
`claude-fable-5-1` xhigh and `grok-4.7` xhigh. Pre-run model acceptance probes
are recorded in research/panel-acceptance-2026-10-09.md. Launchers retained
the same flags throughout; the following are the actual model/effort argv
fragments, with only private prompt/output paths abbreviated:

- Astra, rounds 1–10: `codex exec -m gpt-6-astra -c 'model_reasoning_effort="xhigh"' -s read-only --skip-git-repo-check --cd <panel-lane> -o <verdict> <prompt>`.
- Fable direct, rounds 1–9: `claude -p --model claude-fable-5-1 --settings '{"effortLevel":"xhigh"}' --allowedTools <read-only-list> --max-turns 80 <prompt>`.
- Grok, rounds 1–10 and re-check: `grok -m grok-4.7 --effort xhigh -p <prompt> --output-format streaming-json --no-auto-update --max-turns 80`.
- Fable round 10 and re-check: the **claudep CLIProxyAPI route**, invoking the same `claude -p --model claude-fable-5-1 --settings '{"effortLevel":"xhigh"}' --strict-mcp-config --mcp-config '{"mcpServers":{}}' --allowedTools <read-only-list> --max-turns 80 <prompt>`. Secret setup is intentionally omitted.

The direct Fable seat reached its weekly limit before a round-10 verdict; it
is not counted as a finding or zero verdict. The driver verified the proxy
`modelUsage` as `claude-fable-5-1` and recorded that route in the standing
rulings. This is the same model and effort, not a substitute panel member.
Fable/Grok harnesses do not always echo effort; exact retained launch argv is
the effort evidence. Limits/retries never count as a passing review.

## Round verdicts and resulting scope

A/F/G cells count actionable findings; parentheses count the non-actionable
advisory rows in the original verdict. Severity wording is retained by the
private records. An advisory zero does not mean no suggestions were made.

| Round / reviewed head | Astra | Fable | Grok | Resulting repair or scope ruling |
| --- | --- | --- | --- | --- |
| 1 / `c7bfb9547f` | 4 | 0 (6 advisory) | 0 | Retain native pre-image/inode, quote complete scalar words, preserve managed-skill ownership and quoted TOML permission keys; RSC-F-PANEL-R1-20261015. |
| 2 / `d99bc17cf5` | 2 | 0 (5 advisory) | 0 (3 advisory) | Verified atomic exchange and recovery; complete shell scalar lexer; F-R2-ATOMIC-SHELL. |
| 3 / `2ddda4b141` | 2 | 0 (4 advisory) | 0 (4 advisory) | Bound shell grammar; canonical skill link containment/preservation; F-R3-BOUNDED-SHELL-LINKS. Three protocol advisories tracked separately. |
| 4 / `9a9659a40a` | 2 | 0 (4 advisory) | 0 | RSC-F-SHELL-CHECK-ONLY removes shell writes/restores; canonical/requested restore identity revalidated. |
| 5 / `7f0ceac1b3` | 2 | 0 (3 advisory) | 0 (1 advisory) | RSC-F-FAIL-CLOSED-READERS; unsupported shell forms report drift, YAML aliases cannot mutate unowned fields. |
| 6 / `530a2d9477` | 2 | 0 (5 advisory) | 1 | Precommitted exit fires: RSC-F-WRITE-SCOPE-TOML-JSON; YAML/XML/shell become check-only. |
| 7 / `4812281584` | 3 | 1 (4 advisory) | 0 | RSC-F-NO-CLEAN-WITHOUT-FULL-PARSER; manual verification for non-TOML/JSON; locator/extension/CLI preflight and nonempty ownership. |
| 8 / `830a190afc` | 3 | 0 (4 advisory) | 1 | RSC-F-ONE-PARSED-READER; shared full TOML/JSON parse, decoded equality, no unnecessary rewrite of escaped values. |
| 9 / `d7dae616aa` | 3 | 0 (3 advisory) | 0 | RSC-F-ONE-ELIGIBILITY-GATE; canonical format, fatal UTF-8 and parsed live/backup ownership on every path. |
| 10 / `477c322596` | 0 | 0 (3 advisory) | 1 | S34/operator round cap; Astra/Fable clear, Grok F-GROK-R10-01 requires one bounded scalar-removal-shape fix. |
| 10 re-check / `ddf343221a` | not rerun | 0 | 0 | Grok and Fable both zero on ddf343221a; S34 clears the panel. Astra is not rerun on the bounded re-check. |

## Exact configuration input sets

Each round used its own frozen set; earlier clearance never closes a changed
set. The hashes below come from each retained pushed-head-fingerprint.json.

| Round | Captured at (UTC) | Configuration set SHA-256 |
| --- | --- | --- |
| 1 | 2026-10-15T09:55:22.720618Z | `32f831a6bbc7b7bda0a1f6a74ffcecf5826ec7f3e994e5a9836a3f5c201b50f5` |
| 2 | 2026-10-15T11:53:07.595948Z | `5c5d48e9cf4c40e99405ea1e5e861d32f714a513c21fbeb45a7955c62bee6f8f` |
| 3 | 2026-10-15T13:09:05.101901Z | `272fa85f43cf4133231fedfbce0bc4392ad748e695d1b55c1b1bb78f72e098a8` |
| 4 | 2026-10-15T14:23:16.517348Z | `3a586eb6b63168ff0973580db01f64ced91357d878634558e983c87560216f6f` |
| 5 | 2026-10-15T16:17:01.895703Z | `e05e914da3efae7026ef674e4fa1dd8a4d6d80d41e155bc5d4b9fa4845eb28a0` |
| 6 | 2026-10-15T19:00:06.088340Z | `c1cce633dc16a350d363baed7a6d80ed378d27a5540cfdca5c57769b1c68d303` |
| 7 | 2026-10-15T20:13:44.283753Z | `bf1ac6777cd6354d3bb728bcd940a1da0cacf1fb4f417543fc42ec9c62b5a0c9` |
| 8 | 2026-10-15T21:31:35.419276Z | `6f71655c9d77281a3708ee4809e00cbbb624d2ba7bd074b61e3f1a1743adbd9c` |
| 9 | 2026-10-15T22:52:43.346360Z | `b9472fc257342c598227402e46200413ae39dfdf5e30601b63594200f6a9dac0` |
| 10 | 2026-10-16T20:29:02.972205Z | `905d5b49978347400ba446712a6e0b906145b2f4928eccba115ac3d5a1306731` |
| 10 re-check | 2026-10-16T21:11:22.882907Z | `cda547c676f6999bfa3627743d837b3df218ba1645cd8c3b948cf9ca2c73cc54` |

## Terminal clearance and its limits

The operator capped the panel at round 10; the orchestrator confirmed S34.
Astra and Fable were zero-actionable on round 10. Grok found one scalar-removal
shape disagreement. After the bounded fix, Grok and independent proxy Fable
were both zero-actionable on
`ddf343221a3c061e18d6f3810c2d71adf1570d29`. There are no remaining Astra P1s
to issue under S34. This is **met-by-ruling**, not a claim that all three seats
re-reviewed the later final CI-portability revision.

Fable's final re-check could not run tests in its reviewer environment; it
verified source hashes against the recorded passing receipt. Grok likewise
provides a bounded source verdict. Dynamic implementation proof remains the
worker's source-bound receipt, separate from independent review. Round-10
Fable's fallback-pointer and manual-recovery UX notes were non-actionable
advisories under the recorded scope; scalar-shape overlap was fixed.

Panel clearance did not close CI: introduced hosted unit failures involved
gitignored fixture parents and unavailable `mv --exchange`. The later
ModelsAtomicExchange injection retains fail-closed production probing; the
full package suite passes with live exchange forced unavailable (336 files,
6,765 tests). Source and final input set are in
stage-5-f-ci-portability-verification.json and
stage-5-f-ci-portability-fingerprint.json. The driver's final sent head was
`4356f59041100704f363200a96bb4015783d3ae5`; #1797 merged as
`040c69d5577e23898fca5355e4c1e37787e2d311`. The driver separately observed both
repo-cli hosted unit shards passing before the merge final. No new panel or
current-home fingerprint check is claimed by this closeout.

The cap does not qualify F's incomplete 30-session windows, Desktop behavior,
Docker/native activation, remote archive access or matched savings. Three
round-3 protocol advisories have successors in the stage-6 acceptance receipt.
Reversal: revert the owning repository change; retain native byte backups and
journals. Re-enable excluded formats only after full parser/ownership proof
and the separately required independent review.

## Preserved pre-clearance checkpoint (historical)

The following checkpoint predates the clearance summarized above. Its open
status is historical; source behavior and proof references are retained.

### Historical round-9 checkpoint

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


### Historical capped round 10: bounded F-GROK-R10-01 repair (2026-10-16)

Round 10 reviewed `477c322596b289c813bd1202c263734a6b283088`: Astra and
Fable returned zero actionable findings; Grok reported F-GROK-R10-01.
Under the operator's cap and S34, this wave fixes only that finding and the
strictly required verification issues. The shared native eligibility gate
now returns `unsupported-removal-shape` for table and array removals. The
span writer also refuses them, and preview uses parsed removal presence.
The regression exercises the exact Grok table, dotted parents, arrays and
arrays of tables through apply service check/dry-run/write and the native
Codex-permissions CLI. Every refusal preserves bytes and creates no backup
or journal. String, boolean and numeric removals retain their behavior.

The settled suite passes 334 tests in 17 files and all eight coverage floors.
No home configuration was changed. The panel remains OPEN pending the
driver's Grok and Fable re-check of the pushed head and recaptured fingerprint;
this receipt does not claim panel clearance or merge readiness. The bounded
wave's proof and fingerprint are linked from the October 16 lane handoff.
