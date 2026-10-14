# F source implementation handoff — 2026-10-14

This is a blocked source checkpoint, not a final F PR or a frozen panel input.
The qualified source candidate below is separate from the packet's containing
documentation commit. No push, PR, ready transition, gate sentinel, merge, or
retirement was performed.

```text
lane: rsc-f-agents
head: 8f47fcd4bb01912e43418906d2738d5d360b21f7 (source candidate)   PR: none
package-verify: @beep/repo-cli: pass (full default audit 1213.8s; docgen 40.3s)
hosted-parity: test-tsgo | docgen local | jsdoc-ratchet | knowledge refs | fallow audit+health | coverage read -> pass | pass | pass | pass (0 live gated observations) | pass (0 findings) | pass (142 tests; all four touched baseline floors exceeded)
config fingerprint (final): NOT FROZEN; observed-native set 1f035829ecf40e425859b1421e285512841852dc765462baaa934e8f708d9b4d at 20:04:25Z   backups: existing rsc-stage1-20261009T155100Z--{.codex__config.toml,.claude__settings.json,.config__beep__models.yaml}; .beep/rsc-f-repo-backups/{law-pulse.sh,hook-pulse-switch.sh,graft.SKILL.md}; synthetic journal models-2026-10-14T202210287Z-b387cc; no new home apply backup
handoff: goals/repository-simplification-confidence/history/handoffs/rsc-f-agents-2026-10-14.md
open items: BLOCKED source checkpoint; lane-only/home-write scope clarification unanswered; native applies, Boolean trust-field extension, Codex agent projections, H3/H4 integration/re-trust, Docker allowlist/profile compatibility, home duplicates/default-load/secret-reference migrations, full native workflow and matched measurements, all current-fingerprint 30-session windows, full F ledger mapping, fresh main integration before publication, final fingerprint and driver panel; no PR/review reply ids
```

## What changed

- Fetched and merged main into the lane. Resolved the packet README conflict
  as a union and completed merge 313e7da0b7. Frozen install succeeded without
  a manifest or lock change; the initial missing workspace module was an
  install prerequisite, not a source defect.
- Read the complete lane brief, latest F/resume rulings, the previous handoff,
  source contracts and backup ownership receipt. The 19:55Z routing ruling
  supersedes the older pins. The current offline check reports zero drift;
  no shared manifest was edited.
- Implemented schema-first owned write requests/spans/modes/journals,
  ModelsApply, apply/check/dry-run/restore CLI, and all eleven locator grammars.
  Scalar writes require existing unambiguous addresses; generated markers and
  primary JSON pointers fail closed when missing. All shell matches are
  checked. No general configuration manager was introduced.
- Writer validation asserts parsed non-owned TOML/JSON equality and exact
  reconstruction outside owned spans. Writes use exclusive private backups,
  journal before rename, same-directory staging, mode preservation, drift
  fences, and idempotent rollback refusing subsequent native changes.
  Native UTF-8 decoding rejects invalid bytes and preserves a BOM. Parser
  input/cause is omitted from native validation errors.
- Skills writes have backup and atomic file replacement. Remote payloads are
  backed up before staged publication. Unknown parent/row/subtable fields
  survive; unknown undiscovered rows are retained; repeat write/check is
  idempotent. The operator must still run the S2 projection-update route.
- Removed three confirmed repository duplicate owners. Two Codex hooks
  delegate to their byte-identical canonical scripts; Grok graft is a
  relative canonical link. The distinct Codex hook-pulse remains separate.
- Supported ledger writer appended proposal hl-20261014-2e87155d and admitted
  disposition hl-20261014-2b463e1a for duplicate removal. Approved pilot
  tombstones are hl-20261014-9e833571 and hl-20261014-69d53a31. Original ledger
  bytes are unchanged. The in-regime SessionStart chain remains pending H3
  proof; no observation window was fabricated.
- Added a bounded JSONL spelling exception only for hexadecimal ref fields
  after the commit hook treated an immutable short SHA as a word. Policy
  fingerprint and cache-profile owner commands ran; no generated-file diff
  remained. All prose continues to be spell-checked.

## Source commits and evidence

- a55e569743: ModelsApply/restore, grammar spans, skill-write safety and fixtures.
- 2f6f04c337: missing remote staging parent and JSDoc layout repairs.
- cc2063ede325a958e5d9db5be1ad6d837b1e1a63: canonical hook/skill delegation.
- cce526421c: symlink containment and hexadecimal ledger-ref spelling.
- c353719e45: shared filter reuse, smaller validation/projection decisions,
  direct CLI coverage, native-error privacy and strict UTF-8 fidelity.
- 8f47fcd4bb: two supported docgen categories; runtime source is unchanged.

142 tests across eleven files pass in scoped Node/V8 coverage. Coverage exceeds
all four touched baseline rows in every recorded dimension; see
`history/receipts/stage-5-f-after-measurement.md`. No baseline was weakened.
The coverage read is at c353719e45; the successor changes only two JSDoc
category annotations. Source check passes. Admitted Fallow audit/health report zero findings after
three introduced complexity findings were repaired.

Synthetic hook probes compare five-call law payloads and both switch
disarm/status/arm/status lifecycles. CLI apply/restore produces an exact byte
round trip, and a symlink escaping its declared synthetic home is refused
before mutation. These probes write only beneath the lane's gitignored .beep.
The native-error fixture contains a synthetic credential marker; it never
appears in the typed error and no backup is created on validation failure.

Earlier failed runs are attributed in `research/OPPORTUNITIES.md`. The first
direct check lacked built declarations. A long run loaded old modules during
the edit loop; its eleven failures are repaired on the candidate. A later
run's non-repository fixtures discovered the checkout because TMPDIR was
beneath it. The first private namespace mapped the host root owner to an unmapped UID;
Graft correctly rejected two trust fixtures (6,430/6,432 tests passed). Full
docgen passed in that run. The corrected invocation uses a lane-owned root
and binds lane-owned scratch at /tmp in a private namespace under beep-heavy.
All six dedicated Graft fixtures pass with trusted ancestor ownership; no
production trust check was weakened. The terminal default package gate passes:
audit 1,213.8 seconds and full docgen 40.3 seconds. The terminal script runs
all proof stages serially with source held fixed. One early
Fallow diagnostic bypassed admission accidentally; only the subsequent
admitted zero-finding results are acceptance evidence.

## Terminal source gates

The admitted terminal script `.beep/rsc-f-terminal-proof.sh` completed with
exit 0. Each stage records source head
8f47fcd4bb01912e43418906d2738d5d360b21f7 in
`.beep/rsc-f-terminal-proof-results.tsv`. Per-stage logs are
`.beep/rsc-f-terminal-<stage>.log`. These are local parity results, not hosted
PR checks. The containing packet commit changes only receipts and ledger rows.

| Command (through beep-heavy) | Terminal result |
| --- | --- |
| beep quality package-verify @beep/repo-cli | pass; full audit 1,213.8s, docgen 40.3s |
| beep docgen local --base origin/main | pass; both selected packages, 36.9s |
| beep quality test-tsgo | pass; 363 files, one package; 151 covered by check scripts |
| beep ci lane jsdoc-ratchet | pass; zero non-generated legacy findings; missing examples 4 vs 8 |
| CI=true beep knowledge refs --check | pass; zero live gated observations; archival observations retained |
| beep quality fallow audit | pass; zero findings |
| beep quality fallow health | pass; zero findings |
| scoped Node/V8 coverage read | pass; 142 tests in 11 files, all four existing touched floors exceeded |

No baseline was relaxed. The coverage read binds the preceding runtime-equivalent
source candidate c353719e45; its successor changes only JSDoc categories.
A fresh offline model check again reports hasDrift=false and zero findings.
The initial main integration is retained; merge fresh main before any later
publication wave and rerun checks affected by that integration.

## Native scope, scripts and recovery

The latest private F ruling allows named non-Claude home applies; this
dispatch again explicitly says to work only inside the lane. Clarification
was asked while independent source work continued. No response was received,
and no home file was applied. Session open was read; a workstation session note
was not written because that ledger is outside the explicit lane-only boundary. Actual native write/activation work remains
open. Model defaults are already current against the manifest.

Prepared operator-only script: `.beep/rsc-f-claude-defaults.sh`. It defaults to
--dry-run, accepts --apply, uses ModelsApply, prints a journal restoration id
after a write, and runs the offline drift check. Its live --dry-run output is:

```text
preview home.claude.settings [json-key] change=false expected=claude-fable-5-1
preview home.claude.settings [json-key] change=false expected=medium
dry-run home.claude.settings; no file written
```

No script was applied. The broader Claude harness/default-load migration
scripts and native Boolean ownership are still remaining implementation,
not implied by this no-op defaults preview. All native capability decisions
without a complete qualifying window retain the capability.

Existing stage-1 backup copies remain verified and retained:

- rsc-stage1-20261009T155100Z--.codex__config.toml
- rsc-stage1-20261009T155100Z--.claude__settings.json
- rsc-stage1-20261009T155100Z--.config__beep__models.yaml

They must not be blindly restored over newer native state. Fresh per-apply backups are required.
Lane-local duplicate backups are in `.beep/rsc-f-repo-backups/`: law-pulse.sh,
hook-pulse-switch.sh and graft.SKILL.md. Synthetic CLI recovery journal is
models-2026-10-14T202210287Z-b387cc; its restore round trip already passed.
Repository reversal is git revert of the named source commits.

The live global Impeccable integration emitted design hints on these non-UI
test edits and created `.impeccable/live/pending-manual-edits.json`. That
plugin-owned state remains untracked and is not published or deleted.

## Acceptance boundaries

The before snapshot remains historical. The 20:04:25Z native observation is
supplemental and unfrozen. Stored duplicate text decreased by 20,286 bytes;
this is neither reclaimed filesystem capacity nor measured context/token
savings. Fresh native prompts, activation latency, per-surface n>=20 matched
measurements, cost-window deltas, current-regime 30-session qualification,
complete inventory dispositions and final operational acceptance remain open.
The Docker gateway remains the installed shared legacy service; dynamic
discovery and experimental code mode stay off.

No edits were made to another lane, the model manifest, root workspace
manifest/lock, effect-law allowlists, or tracked Claude harness settings. No
paid endpoint, account purchase, provider fallback, or independent panel was
launched. The driver owns the panel once F has a final reviewed fingerprint.
No final gate sentinel is written for this incomplete workstream.

Graft retrieval saved approximately 28,869 tokens in this source discovery.
