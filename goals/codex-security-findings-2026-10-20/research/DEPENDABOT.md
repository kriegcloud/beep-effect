# Dependabot inventory and prior-packet comparison

Current scope: 123 captured alerts, 63 unique advisories; all remain externally
unclosed by this lane. PR #1930 at parent-confirmed remote head `02b5bd3f47`
contains their scoped remediations. See the post-publication refresh below.

Historical initial capture: 104 open alerts, 50 unique advisories.
Reviewed default-branch revision: `8086a42233ab3eab7265c8deb7a6f3816686d445`.
The complete exact alert allowlist is `../ops/dependabot.json`. No alert status
was changed during capture or draft remediation.

| Source group | Alerts | Current source attribution |
| --- | ---: | --- |
| Historical parser fixtures | 94 | Inert captured inputs; source execution review and byte-preserving representation changes in `dependabot-fixtures.md` |
| Python photo-face lock | 6 | Vulnerable locked versions persist; update candidates and compatibility in `dependabot-python.md` |
| Desktop Cargo locks | 4 | Vulnerable locked versions persist; compatible updates and GLib backport in `dependabot-rust.md` |

These counts describe alerts, not independently demonstrated exploitable
application paths. Fixture attribution requires the recorded loader/workspace
evidence; it is not a blanket dismissal of dependencies used by tests.

A targeted textual comparison of all 50 exact GHSA identifiers against tracked
prior `goals/` Markdown/JSON/JSONL/TOML records found the following exact matches:

- `GHSA-2v37-7h3g-55p8`: `goals/ai-metrics-stack/research/OPPORTUNITIES.md`, `goals/candor-gate-followups-closeout/research/OPPORTUNITIES.md`, `goals/candor-gate-followups-closeout/research/SOURCES.md`, `goals/ci-fleet-residue/history/reflections/2026-08-13-claude.md`, `goals/ci-fleet-residue/research/OPPORTUNITIES.md`, `goals/repository-simplification-confidence/research/sweeps/2026-10-09/H1-override-evidence.md`
- `GHSA-ch52-4w7c-c8xp`: `goals/effect-vitest-canon/research/OPPORTUNITIES.md`, `goals/repository-simplification-confidence/history/receipts/stage-4-h1-catalog.md`, `goals/repository-simplification-confidence/research/sweeps/2026-10-09/H1-catalog.md`, `goals/repository-simplification-residue/SPEC.md`, `goals/repository-simplification-residue/history/receipts/hold-register.md`
- `GHSA-f23m-r3pf-42rh`: `goals/repository-simplification-confidence/research/sweeps/2026-10-09/H1-catalog.md`, `goals/repository-simplification-residue/history/receipts/hold-register.md`
- `GHSA-r5fr-rjxr-66jc`: `goals/repository-simplification-confidence/research/sweeps/2026-10-09/H1-catalog.md`, `goals/repository-simplification-residue/history/receipts/hold-register.md`
- `GHSA-3jxr-9vmj-r5cp`: `goals/repository-simplification-confidence/research/sweeps/2026-10-09/H1-override-evidence.md`
- `GHSA-6g55-p6wh-862q`: `goals/repository-simplification-confidence/research/sweeps/2026-10-09/H1-override-evidence.md`
- `GHSA-fxqj-rqcc-2cmp`: `goals/repository-simplification-confidence/research/sweeps/2026-10-09/H1-override-evidence.md`
- `GHSA-h3mg-xc3c-68pw`: `goals/repository-simplification-confidence/research/sweeps/2026-10-09/H1-override-evidence.md`
- `GHSA-j6r3-76f7-8jcv`: `goals/repository-simplification-confidence/research/sweeps/2026-10-09/H1-override-evidence.md`
- `GHSA-r28c-9q8g-f849`: `goals/repository-simplification-confidence/research/sweeps/2026-10-09/H1-override-evidence.md`

All 29 matching alerts are in the fixture lane. For example, the later
repository-simplification hold register records installed http-cache-semantics
4.2.0 → 4.3.0 and lodash-es 4.18.1 as resolved/clean in its own proof, while
older parser captures still name historical vulnerable versions. Those prior
receipts do not update immutable parser examples and do not prove this draft.

This is an evidence-discovery result, not proof that no historical packet
addressed related code. Historical packet overlap by affected surface and the
known GTK/GLib constraint is recorded in the lane reports. Live alert records
and current default-branch dependencies supersede historical completion claims.

All changes ship in PR #1930 with the eight Cloud fixes. The prerequisite
merged; supported lock regeneration, scoped proof and publication are recorded
in the lane reports. After the combined
PR merges, refresh every captured alert: retain automatic-fixed evidence, or
record a source-backed supported disposition for any remaining graph alert.
Do not mark the vendored GLib fix as an upstream version upgrade or claim that
a vulnerable-version scanner automatically recognizes the backport.

## Post-publication refresh — 2026-10-21

Default-branch API now reports 123 open alerts. Captured the 19 new exact IDs
in the inventory without changing the original 104 identities: alerts 441–449
are three new Vite advisories across the same historical fixture paths; alerts
432–440 are nine Pillow advisories, and 431 is a certifi advisory in photo-face.
The existing fixture representation covers the nine historical-input alerts.
Pillow 13.0.0 and certifi 2026.10.19 are the reported fixed floors; compatibility,
resolution and execution proof are required before the next single-PR wave.
The added-alert source/proof wave is published in PR #1930. Hosted checks
and publication of the locally passing coverage-test repair remain unfinished. No statuses changed.

The added Python advisory wave now has supported lock updates and passing
default/CPU/ROCm, codec round-trip and certificate trust-store proof; see the
Python report. Current inventory: 103 fixture alerts, 16 Python alerts and four
Rust alerts, over 63 unique advisories. Hosted IPC exposed warning visibility
in the path-patched GLib dependency; source warning fixes and strict CI-policy reproduction
passed without changing warning denial; see the Rust report. Hosted final-head
proof and post-merge graph/closure reads remain required.
