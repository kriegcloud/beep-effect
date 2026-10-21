# Hosted Heavy Check test diagnostics repair

Hosted job `119021631439` at initial PR head `6fc9bbcafd` reported introduced
test diagnostics that earlier `tsc-rs` package checks did not surface. This
repair lane started from local `b700df86c8` and owns two test files; parent
owns the separate hub diagnostics and hosted inbox acknowledgment.

- `config-snapshot-bounds.test.ts` lines 183/185: TS377047 Effect function
  opportunities. Wrapped the metadata `readFile` and `readFileString` test
  guards in named `Effect.fn`; retained their invariant defects and exact
  underlying filesystem delegation.
- `accounts-usage.test.ts` line 1284: TS2379 under exact optional property
  types. `ResponseInit.headers` was explicitly undefined when absent. Add
  the header property only for quota responses with a configured header map.
  The real HTTP tracing/redaction assertions remain unchanged.

## Exact strict checker route

Ran `bun run package-test-typecheck` from each package directory, which invokes
`beep-cli quality test-tsgo-package`. That canonical CI route materializes the
package's exact discovered test-file set into a synthetic configuration and
executes root `node_modules/.bin/tsgo -p <synthetic> --pretty false`. It is
separate from `tsc-rs` used by ordinary local package checks.

Both **@beep/repo-ai-metrics and @beep/repo-cli passed with exitCode 0**,
with empty diagnostic output in their `test-tsgo-package-result/v1` artifacts.
Receipts are ignored packet files:
`../raw/hosted-fix-{metrics,cli}-typecheck.log` and
`../raw/hosted-fix-{metrics,cli}-typecheck-result.json`.

Focused behavior reruns:

- Metrics `test/config-snapshot-bounds.test.ts`: **30 passed**, 3.13s.
- CLI `test/accounts-usage.test.ts`: **81 passed**, 9.89s.

Receipts: ignored `../raw/hosted-fix-{metrics,accounts}-test.log`.
Scoped Biome check passed without further formatting changes.
Quick package verification passed for these test-only changes: metrics lint 6.1s / check 2.5s; CLI lint 5.3s / check 5.5s. Receipts: ignored `../raw/hosted-fix-{metrics,cli}-package-quick.log`.
No global catalog/document generation, source behavior changes, commit or push
was performed by this lane. Hosted proof for the future consolidated commit
remains required; these local results do not change the initial hosted result.
