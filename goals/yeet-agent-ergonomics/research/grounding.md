# P0 Grounding Record

Date: 2026-06-11. Tree: branch `goals/yeet-agent-ergonomics` (packet commit on
top of main `303bb88d4a`).

## Verification result: code map confirmed, zero drift

Every line ref and structural claim in `research/session-findings.md` was
re-checked against the live tree:

| Claim | Verified |
| --- | --- |
| `collectPublishIntent` Handler.ts L729-759; refusals via `publishScopeError` with full enumeration; empty-staged refusal is a plain `YeetCommandError` | Yes — exact match; note the staged-empty branch does NOT go through `publishScopeError` (no paths), keep as-is |
| `publishScopeError` L389-394 returns `YeetCommandError.make` with `formatPublishPaths` | Yes |
| `YeetProofLockState` L263-275 has `pid: S.Finite`, `startedAt` | Yes |
| Planner `yeetPlanPhases` L576-594 phase order prepare→feedback→commit→early-publish→full→publish→monitor (via `RepoPlanPhase.$match`) | Yes |
| `knownSubLaneHints` L435+ has `cspell`, lacks `typos` and `changeset` | Yes |
| `githubCheckChangesetStatusLanes` exists in Quality.command.ts (~L738), skips on main push, dynamic lane | Yes |
| `PrCloseoutReport` L402-421; `states` uses `withConstructorDefault` + `withDecodingDefault` (pattern to copy for `writeActions`) | Yes |
| ProxyOps pid-liveness idiom L985-992 (`process.kill(Number(pid), 0)` in `Effect.sync` try/catch) | Yes — note: bare catch returns false; for EPERM-as-alive we need a variant that inspects the error code |
| Test surface: `@beep/repo-cli/test/Yeet` → `packages/tooling/tool/cli/src/test/Yeet.test-kit.ts` re-exports `*ForTesting` | Yes — new helpers must be re-exported there |

## Corrections / additions to the designs

1. The ProxyOps idiom's bare `catch { return false }` treats `EPERM` as dead.
   Our E8 helper must catch and inspect: `EPERM` → alive, `ESRCH` (and
   anything else) → dead.
2. The staged-empty refusal in `collectPublishIntent` carries no paths and
   stays a plain `YeetCommandError` (not routed through the new packet
   helper).
3. Stage A/B were collapsed by the operator: the packet commit and the
   implementation commits land on one branch (`goals/yeet-agent-ergonomics`)
   and one PR. P4 dogfooding still works because `bun run beep` executes the
   CLI from source.

## P4 dogfood findings (2026-06-11)

1. Four publish rounds dogfooded the failure path end-to-end: every round wrote
   an accurate failure verdict (committed/pushed state, repair command), parked
   and restored the staged-only residue, and routed diagnosis through packets.
2. Rounds caught and fixed real repo-law debt: terse-effect conditional-spread
   violations (incl. two files from PR #226), cspell gaps (`patches/**`
   unignored), schema-first modeling of the verdict types.
3. Known limitation discovered: `knownSubLaneHintFromOutput` scans the last
   16KiB of broad proof output, so the LAST lane's needle (nix) can win the
   hint even when that lane passed and the real failure (e.g. a pglite
   integration flake) scrolled out of the window. The verdict's failed-lane id
   stays correct; only the remediation hint misattributes. Follow-up candidate:
   prefer needles co-located with failure markers.
4. Pre-existing flake (out of scope): `test-utils
   test/integration/SqlTest.pglite.test.ts` times out at 60s under full-proof
   load but passes in isolation (10.6s, 7/7). Same class flaked on hosted CI
   during PR #226. Hosted Test Integration is the authoritative gate.
