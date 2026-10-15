# Full CLI audit attribution

`verify-repo-cli-final.log`: 304 passing files, one failing file; 6160 passing tests and
one failure in knowledge-doctor-evaluators.test.ts. Its checkout-inventory comparison sees
215 tracked-tree packet records versus 216 filesystem records. The diff's missing slug is
`docs-lint-oxlint-rules`, which was already untracked at lane start and must remain so until
the Claude orchestrator reviews/stages the lane.

The lane changed only docs worker/config/cache tests. All focused quality-task cases pass;
the actual jsdoc worker now loads the new config and rejects its invalid fixture. The source
of this full-audit failure is outside the owned docs runner. Do not fix it by changing the
knowledge evaluator or staging files from this lane. Re-run after the orchestrator commits the reviewed packet and source.

`test-tsgo-final.log` exits 0 for 346 CLI test files, with 149 packages already covered by
check scripts. Earlier compile/example errors introduced here were fixed and are superseded.
