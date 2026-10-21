# CLI package proof attribution

The original default full `quality package-verify @beep/repo-cli` run remains
failed: 339 test files / 6,900 tests passed; one test failed in
`test/knowledge-doctor-evaluators.test.ts`. Original receipt:
ignored `../raw/cli-package-proof.log`. No full-suite green claim is made.

## Exact failure and stable rerun

The live-filesystem compatibility test compares `makeKnowledgeDoctorTree("HEAD")`
with `listGoalPackets(repoRoot)`. The failure at local 22:17 on 2026-10-20
compared 241 committed packets with 242 live packets. The printed diff names
exactly the extra `codex-security-findings-2026-10-20` packet and its manifest.
That packet was still uncommitted then; commit `6fc9bbcafd6a78aa877e094bb55b7ce5de7acd52`
added it at local 22:23. This is an uncommitted-packet versus HEAD-tree proof
environment mismatch. The timing does not support a commit happening midway
through that individual test.

The Knowledge source and evaluator test have no changes from integrated main
`426d494b34` through committed HEAD `6fc9bbcafd`. With that HEAD stable and
without packet writes during execution, reran from the CLI package:

`bunx --bun --no-install vitest run test/knowledge-doctor-evaluators.test.ts`

Result: **14 tests passed**, one file, 11.08 seconds. Receipt:
ignored `../raw/cli-knowledge-stable-rerun.log`. No code repair was needed.

## Compiler-looking fixture output

The TS2589 text for XAI/UI around original log lines 260-267 is synthetic
output from the passing quality-task quarantine regression
`test/quality-tasks.test.ts`, test "quarantines distinct TS2589 tasks exposed
by resumed lane runs". Its embedded subprocess explicitly prints those two
package names and the no-location compiler message before controlled exit 2.
The original run's actual upstream build completed **45/45 tasks**; CLI source
build compiled 877 files and the source/scripts checks passed before Vitest.
Those fixture strings are not evidence of failed production builds.

## Separate final checks

- `bun run beep:lint`: passed, 1,309 files, no fixes, three informational notices.
  Receipt: ignored `../raw/cli-lint-proof.log`.
- `bun run beep:check`: passed, source and scripts configurations. Receipt:
  ignored `../raw/cli-check-proof.log`.
- `bun run docgen`: passed: 452 modules and 3,307 examples typechecked. Receipt:
  ignored `../raw/cli-docgen-proof.log`.

The original audit stopped at the failed Vitest stage, before its Python and
lint stages. Python proof remains the dependency worker's independent lane;
this report does not imply those stages executed within the original audit.
The environment-only inbox acknowledgment preserves the failed receipt and
records the exact mismatch plus stable rerun, without weakening any gate.
