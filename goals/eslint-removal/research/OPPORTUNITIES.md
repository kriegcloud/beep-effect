# Friction receipts

## 2026-10-15 — config alias drift after explicit laws exports

`bun run config-sync:check` exited 1: two root alias entries missing in tsconfig.json
and vitest.aliases.generated.json. Owning command `beep tsconfig-sync` regenerates
these. Explicit export-map moves should include the config-sync regeneration gate.

## 2026-10-15 — reviewed cache request schema

`beep cache baseline --request ...` rejected an empty scope request. The current
request requires nonempty scope, profile and epoch; the prior tsc-rs packet provides
the retained qualification scope. Prevent with a documented minimal request example.

## 2026-10-15 — package proof inbox protocol conflicts with lane envelope

A higher-priority harness instruction required acknowledgment of the repo-configs
audit row despite the lane's no-Yeet rule. `--observed` was rejected because this
is a package-failure row, not a proof-job-finished row. The old result was marked
wontfix with an explicit superseded-proof explanation while formatting fixes and
a fresh full package verification continue; no git/publishing operation ran.

## 2026-10-15 — inherited root documentation lint warnings

`beep-heavy -- bunx oxlint . --config .oxlintrc.docs.json --max-warnings=0`
exited 1 on missing param/returns docs in existing Drawings and Observability
modules. Every reported file is byte-identical to local origin/main:

- packages/law-practice/use-cases/src/PracticeKg.tools.ts: unchanged from origin/main = True
- packages/tooling/tool/cli/src/commands/Drawings/Drawings.critics.schemas.ts: unchanged from origin/main = True
- packages/tooling/tool/cli/src/commands/Drawings/Drawings.critics.ts: unchanged from origin/main = True
- packages/tooling/tool/cli/src/commands/Observability/Observability.harvest.ts: unchanged from origin/main = True
- packages/tooling/tool/cli/src/commands/Observability/Observability.render.ts: unchanged from origin/main = True
- packages/tooling/tool/cli/src/commands/Reviewer/GitHubAppAuth.ts: unchanged from origin/main = True
- packages/tooling/tool/cli/src/commands/Reviewer/ReviewerRuleset.ts: unchanged from origin/main = True
- packages/tooling/tool/cli/src/commands/Reviewer/ReviewerService.ts: unchanged from origin/main = True

Route these baseline warnings to their owners; no B2 rule or source change caused them.

## 2026-10-15 — inherited native-runtime warnings

`beep-heavy -- bun run beep laws native-runtime --check` exited 1 with eight
warnings and zero errors in Drawings.critics.ts and Drawings.critics.schemas.ts.
Both files were already verified byte-identical to origin/main for docs attribution.
Allowlist check passes with 27 entries and no unused entries. Route baseline
Drawings warnings to their owning lane rather than broaden B2.

## 2026-10-15 — silent full repo-cli package audit

`beep-heavy -- bun run beep quality package-verify @beep/repo-cli` buffers audit
output until completion. The log remained at the launcher line for over fifteen
minutes; owned-process snapshots confirmed changing Vitest workers and active
fixture subprocesses. A periodic package-step heartbeat or streamed tee would
make progress observable without extra process inspections. No proof was replayed.

## 2026-10-15 — signed cache pilot canary contract

Full repo-cli audit ran 6,578 tests: 6,570 passed and eight failed. Two caused
cache-pilot failures exposed that removing declared-env canaries also violates the
signed receipt's ten-shadow contract. Replace the retired profile with the retained
VITE_COSMOS_SPIKE global env, preserving coverage and cardinality. Four unchanged
lint-command fixtures omit the required assignment summary; two parity failures
compare the untracked packet against HEAD (README status syntax corrected).

Attribution detail: the deprecated worker implementation and lint-command.test.ts
are byte-identical to HEAD. B2 only removes an unrelated policy fingerprint input
from Lint.command.ts. Its four fixture failures are inherited from the assignment
coverage contract. The working packet is intentionally untracked until the Claude
orchestrator commits; packet-vs-HEAD inventory parity requires that handoff.

## 2026-10-15 — inherited root check diagnostics

`beep-heavy -- bun run check` exited 2. practice-claude-mod's unchanged
PracticeMod.verdicts.test.ts has TS377112 at lines 68/71 (typed schema decoder)
and TS2353 at line 74 (numRuns is not a CheckOptions property). No B2 source or
dependency change touches that workspace; route the three diagnostics to its owner.

Final targeted attribution rerun: 74 tests passed, five failed. README grouping
now passes; only the untracked-packet inventory comparison and four unchanged
assignment-summary fixture failures remain. Corrected B2 focused suite: 319/319.
CLI quick package-verify, lint and typecheck pass.

## 2026-10-15 — session ledger write unavailable

`beep session note --state blocked ...` exited 1 without a diagnostic in this
restricted lane. The packet and orchestrator report retain the complete handoff;
the orchestrator can write its ledger row in its own session.
