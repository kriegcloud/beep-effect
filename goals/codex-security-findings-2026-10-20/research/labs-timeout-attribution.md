# Labs timeout attribution — PR #1930

Reviewed initial-head job `119021316965` using retained raw log
`raw/ci-labs-119021316965.log`. Focused local proof ran at head
`2404f26f1b61d5718af92b7e1dd6b282a7b02359` without code/configuration changes.

## Result and disposition

The evidence supports the existing environment-only timeout classification.
No introduced semantic regression was found. This is bounded attribution:
the original hosted failure remains a failed check; local success and a known
flake fingerprint do not establish exact-new-head hosted success. The parent
owns the P1 acknowledgment and new-head CI monitoring. This lane did not
acknowledge, rerun hosted jobs, edit timeouts, commit or publish.

## Hosted evidence

Raw log lines 2417–2437 show exactly one failure:
`rejects a persisted citation identifier associated with the wrong source URL`,
with `Error: Hook timed out in 30000ms`. There is no failed citation assertion,
extraction error or stack in changed production source. The package summary is
27 passed, one failed; Turbo reports 56 successful of 57 tasks, 51 cached
(lines 2431–2447). Other database-backed tests passed but took 41–44 seconds
(lines 2404–2406), consistent with expensive concurrent setup.

The reported source position `Bundle.test.ts:371:4` points into a different
layer block's parameter tuple and does not identify a faulty citation
expression. The actual citation test is currently at lines 439–467, with a
30-second layer timeout and separate 90-second test timeout. Its body logs no
`effect-vitest test start` for the citation test in the failed run; neighboring
concurrent tests appear under its Vitest stdout label. Those neighboring logs
must not be interpreted as execution of the failing citation body.

Installed `@effect/vitest/src/internal/internal.ts:326–340` acquires the test
layer in a `beforeEach` hook using the layer timeout. The hook builds the
PGlite/DuckDB/Oxigraph context before running the test body. Its scope cleanup
also uses hook limits; the generic hosted message does not name an individual
database operation. It is insufficient to identify which store or CPU/memory
condition consumed the time.

## Dependency and change reachability

A direct `git diff --exit-code` against base
`426d494b3433ccddf797a2d896984f1ad23c81ad` confirmed no changes in the LeJeune
app, DuckDB, PGlite, Oxigraph, common test helpers/runner or shared Vitest config.
`src/runtime/Projections.ts:566–576` composes PGlite, DuckDB and Oxigraph; it
does not acquire DOCX extraction, Python inference or the Rust desktop runtime.

LeJeune does depend on `@beep/doc-text`, so claiming no dependency reachability
at all would be false. `src/fixtures/Sources.ts:252` invokes the PDF branch of
that driver inside the test body. The PR changes the DOCX branch, adds its
fflate/saxes imports, and changes the shared generic resource-limit error text.
The PDF extraction implementation, canonical engine version and PDF fixture
bytes are unchanged. The failed layer setup does not invoke that test-body
PDF extraction or the new DOCX preflight. `Normalize.ts` performs fixed-span
normalization rather than extracting a DOCX.

The root lock diff adds only fflate/saxes workspace dependencies to doc-text;
no resolved Effect, Vitest, database, PDF parser, fflate or saxes package version
changes occur. Cargo/uv locks and the inert parser fixture renames are outside
this Bun test's acquired runtime. No causal setup path from those changes was
identified.

## Focused local result

From `apps/labs/lejeune-bolt-workbench`:

`bunx --bun --no-install vitest run test/Bundle.test.ts`

Exit 0: one test file, all 14 tests passed, duration 12.35 seconds, including
the cited corruption rejection. The existing shared concurrent test mode and
30-second layer/90-second body limits were retained. No isolated base checkout
or controlled runner-load experiment was run, so this is a successful current
head reproduction attempt, not an A/B timing proof.

## Existing monitor classification and remaining gate

The active monitor log
`.beep/yeet/jobs/5a634b17-4a8e-4ce2-a99c-079e7ba96907.log:409` states:
`Labs: known flake matched, but the parent run is still active; deferring rerun
to the next poll`. `MonitorLoop.ts:260–267` includes the exact generic hook
timeout fingerprint among CI timeout classes. This classifier is additional
routing evidence, not independent root-cause proof.

Parent reported acknowledgment of `Labs-f8a157084dda` as environment-only on
the combined unchanged-source, pure-hook-timeout and known-flake evidence.
Keep observing the new head's hosted Labs job. A repeated timeout or semantic
failure there requires fresh attribution; this receipt does not authorize
threshold increases or claim that a new hosted result is already green.
