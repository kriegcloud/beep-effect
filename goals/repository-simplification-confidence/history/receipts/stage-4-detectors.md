# B detector evidence

## Scan baseline

Status: historical first reproduction completed at
`01b3d54700fa4327472fb7beb0ed169766902c90`. The latest ordered owner replay
completed at `49ffd94e5f328bcbd112247c1b3b2e444f2622bc` after main #1709;
committed-candidate qualification is recorded separately below.
Raw logs and command exits are retained in `.beep/rsc-resume/`. This receipt
records a candidate refresh. R14 requires the serialized chore to land
before its counts become the program baseline. No zero-debt result is claimed.

Bun 1.4.2, Effect 4.0.2 and signed Fallow 3.32.0 are installed. The Effect reference
checkout is `74d19304da077d98cc6dcb294c71e253365f272f`. All heavy
commands run serially within one `beep-heavy` admission. The source tree
matched origin/main before reproduction; packet-only updates do not repair
source findings. The previous proposed refresh and review records remain
preserved in the lane's stashes and private evidence directory. They are
not restored over current main.

| Command | Exit | Observation and disposition |
| --- | --- | --- |
| `bun install` | 0 | Current dependency installation; no tracked lockfile delta. |
| Sherif 1.10.0 | 0 | Landed schema dependency-ordering repair reproduced. |
| Artifact generator fixtures | 0 | Fourteen tests pass, including broken links, aliases, cycles, escapes and fatal non-NotFound errors. |
| `beep quality jsdoc-inventory`, private output paths | 0 | Full generation succeeds after #1617. Source findings remain; snapshot drift is separate. |
| `beep lint schema-first` | 0 | Registry parity and advisory checks pass. Existing exceptions still require individual disposition. |
| `beep lint schema-catalog` | 1 | Catalog snapshot stale; regenerate through its owner. |
| `laws effect-imports --check` | 0 | No live root Effect import violation. |
| `laws native-runtime --check` | 0 | Existing allowlist suppression still applies; this is not exception justification. |
| `laws effect-fn --check` | 0 | No reported violation. |
| `laws frozen-grant-set --check` | 0 | No reported violation. |
| `laws terse-effect --check` | 1 | Existing source findings remain actionable pending individual review and repair. No source changed in this wave. |
| `laws allowlist-check` | 0 | Current validator passes; provenance and expiry enforcement remain detector-wave work. |
| Fallow raw dead-code JSON | 0 | Zero issues. Boundary and policy-pack zeros are unmeasured because those features are not configured. |
| Fallow raw health JSON | 1 | Complexity findings remain. Static-estimated coverage and raw severity counts remain separate from baseline-absorbed findings. |
| `bun run build` | 0 | All 151 tasks pass; provides the census precondition. |
| `beep quality check-census` | 1 | Built-tree measurement completes; CLI instantiations grow against the committed floor. The owner refresh records that growth separately from source repairs. |

### Owner refresh

The commands ran in the prescribed order. JSDoc, JSDoc ratchet baseline,
schema catalog, schema-first, Fallow dead-code and census writes exit 0.
Fallow health writes its snapshot but exits 1 on the unchanged raw complexity
frontier. Every output is tool-owned. Effect/Vitest inventory and policy
fingerprint remain outside this wave. These are candidate measurements until
R14 serialized merge, not accepted program baseline counts.

| Artifact or metric | Committed snapshot | Owner output at 01b3d54700 |
| --- | ---: | ---: |
| JSDoc packages / public modules / exports | 141 / 2,880 / 20,404 | 147 / 3,462 / 23,453 |
| Packages needing remediation / open modules / open exports | 120 / 366 / 2,949 | 81 / 912 / 1,388 |
| Missing export examples | 9 | 8 |
| Example-import findings / root-package findings | 3,111 / 3,110 | 1,363 / 1,342 |
| Multiple description paragraphs | 426 | 425 |
| Schema catalog entries | 6,211 | 7,377 |
| Schema-first entries | 126 | 126, every entry body unchanged |
| Fallow dead-code issues / version | 0 / 3.15.0 | 0 / 3.32.0 |
| Fallow health per-file findings / target keys | 181 / 13 | 180 / 13 |
| Census CLI single-checker instantiations | 4,936,391 | 5,168,031, increase 231,640 |

The other five census sample counts are unchanged: schema 456,717,
law-practice-domain 896,665, and typeperf 17,335 / 20,586 / 17,915.
The compiler is `7.0.2+effect-tsgo.0.51.1` on both sides. The full census
measures 150 packages with zero diagnostics in both overlay modes. The owner
write records the source head and dirty state; packet and generated inputs
are dirty, but no production source is changed by B. Re-recording the CLI
growth does not count as a source repair. Check time remains advisory.

A fresh finding-identity comparison uses repo path, symbol or module, row
kind, finding family and serialized finding body, omitting line, column and
anchor. It includes missing-summary findings and missing-required-tag values,
so its units differ from earlier proposal comparisons. Committed snapshot
identities are 3,411, current identities 2,731, persisting 1,560, disappeared
1,851 and new 1,171. The snapshot predates intervening source and detector
changes. Disappearance is not attributed to B; new/persisting rows require
source review before a false-positive or boundary-exception disposition.
Root-package findings are distinct from root Effect import findings, whose
live law reports zero. No detector repair is made in this refresh.

Raw Fallow health analyzes 5,227 files and 99,692 functions, with 148 functions
above threshold: two critical, thirteen high and 133 moderate. Its coverage
model is static-estimated. This is a different unit from 180 per-file
baseline findings. Baseline absorption, a source delta gate or an unconfigured
boundary detector does not establish zero actionable complexity debt.

The current individual schema-first review proposals are preserved privately
at `.beep/rsc-resume/schema-first-review.json` with source-bound evidence for
every current identity. No proposal changes an exception body in this wave.

### Integrated replay at bea70598228b

After intervening source changes landed on main, the admitted ordered replay
at `bea70598228bf617e1f35843332ac222e58e7211` passed installation,
full build and every owner command except raw health. Health still wrote its
baseline and exited 1 on 148 above-threshold functions, analyzing 5,230 files
and 99,855 functions. These raw units differ from per-file baseline findings. Completed logs are
preserved in `.beep/rsc-resume/replay-bea70598228b/`.

Against main's snapshots at `b096cbd99b43`, this candidate has 147 JSDoc
packages, 3,464 public modules and 23,464 public exports. Open modules/exports
remain 912/1,388, example-import/root-package findings 1,363/1,342 and missing
examples eight. Catalog entries are 7,383. All 126 schema-first entry bodies
are unchanged. Fallow 3.32.0 reports zero dead-code issues; health preserves
180 per-file baseline findings across thirteen targets. Census CLI
instantiations are 5,168,345, an increase of 231,954 against main's retained
4,936,391. The other five census rows are unchanged. These values describe
owner output, not accepted program baselines or B-authored source repairs.

The lane subsequently integrated main `a0838402f5` as `a00d3fdaf7c2`.
That intervening delta consists of documentation, packets and service units.
The fresh ordered owner replay at `a00d3fdaf7c2` completed with identical
semantic counts and command outcomes. Current logs/results are retained in
`.beep/rsc-resume/integrated/`; committed-head parity follows.

### Latest replay after Skills materialization

Main #1709 adds source/schema inputs and is integrated as `49ffd94e5f32`.
A new admitted ordered owner pass succeeds except raw health exit 1, which
still writes its baseline. JSDoc now has 147 packages, 3,467 public modules
and 23,491 exports; findings remain at the previous candidate totals. Catalog
entries are 7,396. All 126 schema-first entry bodies remain unchanged.

Health retains 180 per-file baseline findings and thirteen target keys. Raw
health separately reports 148 above-threshold functions across 5,238 files
and 100,069 functions (2 critical / 13 high / 133 moderate), using
static-estimated coverage. Dead-code is zero under Fallow 3.32.0. CLI census
instantiations are 5,186,374, growth of 249,983 against main's 4,936,391; the
other five rows are unchanged. Owner commands preserve measured debt and
catalogs; these values are not B-authored repairs or an accepted zero scan.
Current raw logs/results are in `.beep/rsc-resume/integrated/`. The earlier
parity below is historical pending qualification of the newest candidate.

### Historical f516 parity

The earlier committed candidate was `f5163d65a2b22c8025ddba5ccffd8ae667c2e003`.
Its parity passes census, test-tsgo, bounded docgen, CI JSDoc ratchet, Fallow
audit/health and retired-effect-paths. Knowledge refs exits 1 on fourteen
inherited observations, each affected file byte-identical to pinned main.
Subsequent main source movement requires new qualification before publication.
Required command results are recorded in the
[current handoff](../handoffs/rsc-b-standards-2026-10-14.md).

### Qualification at c12a1cf298

The latest generated candidate is `c12a1cf29890136de17be1ac818a8685b21d20f8`
against main `4e66575c64`. Admitted census, test-tsgo, bounded docgen, CI
JSDoc ratchet, Fallow audit/health and retired-effect-paths all pass. Knowledge
refs exits 1 on fourteen inherited live host-path observations; exact bytes
of every affected file equal pinned main. Passing baseline-aware health does
not supersede the raw health exit 1 or establish zero source complexity.
No source or coverage floor delta exists, so package gates and scoped source
coverage execution are not applicable to this wave. Final packet-head parity
and review closure follow before publication. See the current handoff.

## Exception schema

Pending the detector wave. Before editing the effect-laws registry or its
generated snapshot, the driver must confirm S5 effected-port notification.

## Repairs

Pending paired fixtures and current source proof. Existing #1617 traversal
fixtures and its two old-head inbox repairs are verified in the current
[handoff](../handoffs/rsc-b-standards-2026-10-14.md). They do not complete the
FP-1 through FP-7 frontier.

Historical FP-7 is closed as removed, rather than as a tested detector repair.
Commit `aee2664b91d163cd7481eb16b0c5a485c092f5c2` (#551)
deletes `TypePredicates.ts`, its barrel exposure, the owning DualArity
implementation, CLI route and fixture suite. Its parent contains the
unanchored Effect/Schema/Promise printed-type guard in
`isStrictObjectLikeType`; the deletion therefore establishes retirement of
the actual occurrence. Read-only discovery at `bea70598228b` finds no
identical active guard in schema-first classification. That path uses an
anchored root-runtime pattern and recursive property inspection. The exact
mixed-data/nested-Effect-member fixture pair is not established in the current
tests, so current analogous regression proof remains unverified. The private
source/history report is `.beep/rsc-resume/fp7-review.md`.

## Suppressions

Pending current individual disposition. Previous occurrence-review proposals
remain preserved privately. No suppression is removed or admitted in this
generated-only wave.

## Exception review

Pending reconciliation of the older occurrence-specific proposals against
current source and inventories. Unsupported justifications remain debt.
V owns open canon cohorts under R102; B owns exception review. Old proposal
counts are historical inputs, not current accepted exception totals.

## Zero scan

Pending all source repairs, provenance enforcement and registry reconciliation.
Passing a baseline-aware gate does not establish zero actionable source debt.
