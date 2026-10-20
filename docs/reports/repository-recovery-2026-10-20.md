# Repository recovery issue inventory

PR: [#1928](https://github.com/beep-effect/beep-effect/pull/1928).
Branch: `fix/slop-10-14-26`. Snapshot: 2026-10-20, 61 open issues.

Each issue stays open until its acceptance criteria have source, test, or live
qualification evidence. Green quality checks do not substitute for historical
completion, native runtime, owner-verified cleanup, or signing evidence. This
inventory records work in progress; it does not declare any issue resolved.

## Quality gates

- `turbo test`: passed 159 tasks before the latest coverage-policy changes.
- `bun run test`: final-head verification pending.
- Coverage: all five labs enrolled; generated package scripts and measured rows
  preserve existing floors and minimums. Coverage-policy tests: 267 passed.
- Full coverage: pending; discovery found a Node-incompatible YAML test and a
  missing temporary V8 report. Clean verification remains required.
- Docgen: gateway metadata and scratchpad source/example compatibility repaired.
  Scratchpad generation passed 2,685 examples; repository-wide proof remains pending.
- Audit: filesystem test pipe diagnostic repaired; full verification pending.
- Hosted checks and legitimate review findings: tracked on the PR.

## Published and pending repair waves

- `4c27e8b762`: tests, enforced lab coverage, and gateway documentation fixes.
- `37ec9d8fdb`: security overrides for MCP client 2.3.1, follow-redirects 1.16.1,
  http-cache-semantics 4.3.0, and launch-editor 2.14.2. Fresh Bun audit reports
  only the existing exact braces and sprintf-js exceptions; hosted rerun pending.
- Cache policy: canonical recorder reviewed 31 drifted tasks and 19 source
  configurations, preserved qualification scope/profile/epoch, and reports zero
  blocking findings.
- Fallow audit: unused ESLint removed, shared browser configuration consolidated,
  generator branching simplified, and repeated cache host checks consolidated.
  The affected audit reports zero introduced findings.
- Scratchpad memory-filesystem contracts: 649 tests passed, 21 existing skipped,
  using the canonical tmpfs test environment. The larger selected run passed
  5,706 tests with only the known filesystem-environment case failing; the
  canonical memfs rerun covers that case.

## Open issue acceptance tracking

| Issue | Requested outcome | Status |
| --- | --- | --- |
| [#1576](https://github.com/beep-effect/beep-effect/issues/1576) | fix(agent-message): retain terminal receipts after mid-turn acknowledgment | Acceptance review pending |
| [#1578](https://github.com/beep-effect/beep-effect/issues/1578) | fix(ai-provider-cli): allowlist managed launch environments per provider | Acceptance review pending |
| [#1579](https://github.com/beep-effect/beep-effect/issues/1579) | feat(agent-message): qualify ambiguity reconciliation and capacity fairness | Acceptance review pending |
| [#1581](https://github.com/beep-effect/beep-effect/issues/1581) | fix(agent-comms): qualify historical probe and snapshot evidence | Acceptance review pending |
| [#1582](https://github.com/beep-effect/beep-effect/issues/1582) | fix(goals): distinguish proposed closeout from operative completion | Acceptance review pending |
| [#1586](https://github.com/beep-effect/beep-effect/issues/1586) | Fence ended native sessions and scope Cursor denial classification | Acceptance review pending |
| [#1587](https://github.com/beep-effect/beep-effect/issues/1587) | Tighten agent-messaging probe opt-in and test portability | Acceptance review pending |
| [#1603](https://github.com/beep-effect/beep-effect/issues/1603) | fix(agent-message): reconcile completion after attached lease expiry | Acceptance review pending |
| [#1607](https://github.com/beep-effect/beep-effect/issues/1607) | fix(t3-code): qualify built root export before publication | Acceptance review pending |
| [#1613](https://github.com/beep-effect/beep-effect/issues/1613) | fix(agent-message): scope prior envelope reuse to the sending grant | Acceptance review pending |
| [#1702](https://github.com/beep-effect/beep-effect/issues/1702) | knowledge doctor: lexer-aware block-comment blanking and v2 lock decode errors (#1690 follow-ups) | Acceptance review pending |
| [#1708](https://github.com/beep-effect/beep-effect/issues/1708) | effect-vitest: EV010 flags every platform-node import, including canonical it.layer setups | Acceptance review pending |
| [#1740](https://github.com/beep-effect/beep-effect/issues/1740) | Nightly property-law sweep failures | Acceptance review pending |
| [#1742](https://github.com/beep-effect/beep-effect/issues/1742) | docs(skills): align replay comment example with GraphQL bot login | Acceptance review pending |
| [#1772](https://github.com/beep-effect/beep-effect/issues/1772) | Handle invalid receiving grant when receipt write exhausts lock retries | Acceptance review pending |
| [#1789](https://github.com/beep-effect/beep-effect/issues/1789) | fix(reviewer): preserve terminal checks and stop empty pagination | Acceptance review pending |
| [#1835](https://github.com/beep-effect/beep-effect/issues/1835) | fix(observability): name schema-first scan spans by domain | Acceptance review pending |
| [#1848](https://github.com/beep-effect/beep-effect/issues/1848) | drawings critics test: measure the late-limit seat start from the sequence's own start | Acceptance review pending |
| [#1851](https://github.com/beep-effect/beep-effect/issues/1851) | rsc follow-up: finish the later repository retirement waves | Acceptance review pending |
| [#1852](https://github.com/beep-effect/beep-effect/issues/1852) | rsc follow-up: qualify retained repository tool workflows | Acceptance review pending |
| [#1853](https://github.com/beep-effect/beep-effect/issues/1853) | rsc follow-up: complete all retained patch regression and exit proofs | Acceptance review pending |
| [#1854](https://github.com/beep-effect/beep-effect/issues/1854) | rsc follow-up: resolve foreign-clone residue with live owners | Acceptance review pending |
| [#1855](https://github.com/beep-effect/beep-effect/issues/1855) | rsc follow-up: finish detector repairs and individual exception review | Acceptance review pending |
| [#1856](https://github.com/beep-effect/beep-effect/issues/1856) | rsc follow-up: finish guidance currency and artifact classification | Acceptance review pending |
| [#1857](https://github.com/beep-effect/beep-effect/issues/1857) | rsc follow-up: resolve GitHub Packages external-contract uncertainty | Acceptance review pending |
| [#1858](https://github.com/beep-effect/beep-effect/issues/1858) | rsc follow-up: finish remaining hosted workflow acceptance probes | Acceptance review pending |
| [#1859](https://github.com/beep-effect/beep-effect/issues/1859) | rsc follow-up: qualify protected desktop release signing | Acceptance review pending |
| [#1860](https://github.com/beep-effect/beep-effect/issues/1860) | rsc follow-up: finish catalog removals and unused-entry detection | Acceptance review pending |
| [#1861](https://github.com/beep-effect/beep-effect/issues/1861) | rsc follow-up: finish hold register and compatibility exit proofs | Acceptance review pending |
| [#1862](https://github.com/beep-effect/beep-effect/issues/1862) | rsc follow-up: qualify retained native and shared agent workflows | Acceptance review pending |
| [#1863](https://github.com/beep-effect/beep-effect/issues/1863) | rsc follow-up: collect matched final agent-context workflow measurements | Acceptance review pending |
| [#1864](https://github.com/beep-effect/beep-effect/issues/1864) | rsc follow-up: qualify ordinary native hook startup and ancestry | Acceptance review pending |
| [#1865](https://github.com/beep-effect/beep-effect/issues/1865) | rsc follow-up: qualify a dated telemetry namespace cutover | Acceptance review pending |
| [#1866](https://github.com/beep-effect/beep-effect/issues/1866) | rsc follow-up: qualify desktop and native Codex OTel ingress | Acceptance review pending |
| [#1867](https://github.com/beep-effect/beep-effect/issues/1867) | rsc follow-up: qualify the approved telemetry archive reference | Acceptance review pending |
| [#1868](https://github.com/beep-effect/beep-effect/issues/1868) | rsc follow-up: complete current-fingerprint 30-session qualification windows | Acceptance review pending |
| [#1869](https://github.com/beep-effect/beep-effect/issues/1869) | rsc follow-up: separate telemetry storage completeness from stamp qualification | Acceptance review pending |
| [#1870](https://github.com/beep-effect/beep-effect/issues/1870) | rsc follow-up: run the operator Desktop permission fixture batch | Acceptance review pending |
| [#1871](https://github.com/beep-effect/beep-effect/issues/1871) | rsc follow-up: apply owner-verified recoverable storage retention | Acceptance review pending |
| [#1872](https://github.com/beep-effect/beep-effect/issues/1872) | rsc follow-up: prove cold remote cache reads with an approved read-only reference | Acceptance review pending |
| [#1873](https://github.com/beep-effect/beep-effect/issues/1873) | rsc follow-up: qualify cache posture across native harnesses and legacy roots | Acceptance review pending |
| [#1874](https://github.com/beep-effect/beep-effect/issues/1874) | rsc follow-up: qualify generated-build incremental output restoration | Acceptance review pending |
| [#1875](https://github.com/beep-effect/beep-effect/issues/1875) | rsc follow-up: finish the reconciled Effect Vitest canon cohorts | Acceptance review pending |
| [#1876](https://github.com/beep-effect/beep-effect/issues/1876) | rsc follow-up: qualify and publish preserved RDF and Pacer follow-up ports | Acceptance review pending |
| [#1877](https://github.com/beep-effect/beep-effect/issues/1877) | rsc follow-up: retire reconciled Vitest lanes and program lanes safely | Acceptance review pending |
| [#1878](https://github.com/beep-effect/beep-effect/issues/1878) | rsc follow-up: supply complete historical completion evidence | Acceptance review pending |
| [#1879](https://github.com/beep-effect/beep-effect/issues/1879) | rsc follow-up: scope atomic-exchange capability to target filesystems | Acceptance review pending |
| [#1880](https://github.com/beep-effect/beep-effect/issues/1880) | rsc follow-up: add restart recovery states to native exchange journals | Acceptance review pending |
| [#1881](https://github.com/beep-effect/beep-effect/issues/1881) | rsc follow-up: qualify atomic skill publication and replacing-writer recovery | Acceptance review pending |
| [#1882](https://github.com/beep-effect/beep-effect/issues/1882) | rsc follow-up: qualify dependency-review fixture-path filtering | Acceptance review pending |
| [#1883](https://github.com/beep-effect/beep-effect/issues/1883) | rsc follow-up: resolve post-merge completion and lane retirement evidence | Acceptance review pending |
| [#1889](https://github.com/beep-effect/beep-effect/issues/1889) | coverage follow-up: @beep/practice-review-hub sits below the repository tier minimum | Acceptance review pending |
| [#1890](https://github.com/beep-effect/beep-effect/issues/1890) | coverage follow-up: record a baseline row for @beep/palantiri | Acceptance review pending |
| [#1891](https://github.com/beep-effect/beep-effect/issues/1891) | coverage follow-up: record a baseline row for @beep/practice-claude-mod | Acceptance review pending |
| [#1892](https://github.com/beep-effect/beep-effect/issues/1892) | coverage follow-up: record a baseline row for @beep/t3-code | Acceptance review pending |
| [#1893](https://github.com/beep-effect/beep-effect/issues/1893) | coverage follow-up: strict-tier drops in practice-kg-mcp, law-practice-server and repo-cli (observability-palantiri lane) | Acceptance review pending |
| [#1894](https://github.com/beep-effect/beep-effect/issues/1894) | coverage follow-up: drawing review loop drops in occt, technical-drawing and repo-cli Drawings (drawings lane) | Acceptance review pending |
| [#1895](https://github.com/beep-effect/beep-effect/issues/1895) | coverage follow-up: ai-metrics config-snapshot drops after the git-metadata fix (#1830) | Acceptance review pending |
| [#1910](https://github.com/beep-effect/beep-effect/issues/1910) | rsc follow-up: #1909 round-3 guidance review findings (#1856) | Acceptance review pending |
| [#1916](https://github.com/beep-effect/beep-effect/issues/1916) | squash-commitlint follow-ups from #1915 round 3: header URL exemption, yeet SKILL.md length | Acceptance review pending |
| [#1920](https://github.com/beep-effect/beep-effect/issues/1920) | rsc follow-up: persist verified completion receipts before the rule-suite window closes (~2026-11-05) | Acceptance review pending |

Closing references will be added only after the matching acceptance evidence is recorded.
