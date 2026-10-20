# Friction receipts

## 2026-10-15: stale kickoff precondition

Task: admit lane E after lanes A-D. The kickoff demanded tstyche's 7.0.2 target,
but the installed 8.0.0-beta.0 intentionally excludes 7.0. The completed lane C
packet already records hosted 5.9.3 || 6.0.3 and an on-demand 7.1 next probe.
Wave 1 stopped before edits; the orchestrator explicitly admitted that contract.
Prevent recurrence by reading prior lane decisions into the kickoff's acceptance
checks instead of keeping a stale exact compiler target. Evidence: report-E.md
Wave 1 and goals/ts7-tstyche8-type-tests.

## 2026-10-15: Madge classic compiler API stack

Task: run lint:circular after the catalog flip. Madge's dependency-tree,
filing-cabinet, typescript-estree and ts-api-utils stack still requires the
classic JS API absent from TypeScript 7. Wave 2 attempted five bridge patches;
Wave 3 rejected that maintenance burden and removed every patch. Native oxlint
import/no-cycle preserves value-cycle semantics, ignores type-only cycles and
has real positive/clean/fail-closed tests. Prevent with a transitive JS-API
consumer inventory before declaring the compiler precondition clean. Evidence:
report-E.md Waves 2-3 and .oxlintrc.circular.json.

## 2026-10-15: ep29 sandbox .git ancestor

Task: full repo-cli audit with fresh TMPDIR outside ~/.cache/claude-tmp. Node
confirmed the fresh /tmp directory, but the sandbox exposed read-only /tmp/.git.
The existing snapshot guard sees that ancestor; Git exits 128 and the guard
reports "Git metadata exists but cannot be resolved." A focused harness-ledger
fixture reproduces it. Moving deeper beneath /tmp does not remove the ancestor.
Prevent by checking ancestor metadata as well as os.tmpdir(), and run the full
snapshot fixture proof in an environment without synthetic ancestor metadata.
Do not weaken the guard or delete another process's metadata. Evidence:
report-E.md Wave 3, w3-sandbox-tmp-git.log and w3-snapshot-fixture-repro.log under
~/.cache/beep/orchestrator/briefs/ts7-exit/lanes/e-logs/.

## 2026-10-15: generated trace catalog after scanner replacement

Task: Wave 4 cheap gates. `beep observability catalog --check` exited 1 on the
repo-cli shard after Wave 3 changed the circular analyzer's trace name. Use the
owning catalog writer and inspect its exact diff; this is generated trace data,
not an exception inventory. Prevent by pairing trace-name changes with the
catalog gate in the implementation wave.

- 2026-10-15, a false runtime proof: the Wave 2 Pulumi probe called `createRequire` on `infra/node_modules/@pulumi/pulumi/package.json`, which does not exist under the hoisted linker. Resolution walked up into infra's nested TS6 and reported success. beep-reviewer caught the real root-hoisted resolution (TS7). Prevention: resolve from the installed package's real path (`require.resolve("@pulumi/pulumi/package.json")`) and prove runtime claims with the tool itself (`pulumi preview`), not a hand-built resolver.
