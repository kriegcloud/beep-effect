# P1 PR Readiness Review

Status: complete; P1C may start after audited macOS proof plus either audited
Windows proof or the temporary waiver recorded below.

This output records the post-proof `$quality-review-fix-loop` closure pass for
Stack Installer P1. Full P1 still requires real macOS and Windows Manual Mode
proof artifacts, but the review loop may start under a sequencing-only
temporary Windows missing-proof waiver.

This is a comprehensive review of the whole P1 initiative surface and directly
affected code paths as a system, not a narrow final lint pass.

## Scope

- `goals/stack-installer/**`
- `apps/stack-installer/**`
- `packages/drivers/onepassword-cli/**`
- `packages/drivers/ai-provider-cli/**`
- `packages/drivers/discord/**`
- `packages/installer-dependencies/**`
- `packages/installer-security/**`
- `packages/installer-providers/**`
- `packages/installer-channels/**`
- `packages/installer-workspace/**`
- package manifests, generated config references, tests, and public exports
  directly affected by P1

## Required Reviewer Coverage

- quality gates and generated config drift
- architecture boundaries and package ownership
- schema and domain model shape
- Effect laws and service/layer composition
- error boundary translation and secret redaction
- runtime, contract, type, and UI tests
- observability, spans, logs, and no-secret attributes
- documentation, public exports, and package metadata
- reuse, duplication, and structural simplification opportunities without
  generic shared-package gravity
- evolution/deprecation notes and future-phase boundaries

## Reuse And Structure Rules

- Prefer existing repo modules before introducing new abstractions.
- Keep new modules flat, explicit, and package-local unless the
  specific-home-first routing test proves a shared home.
- Prefer small local reshapes that make modules flatter, more idiomatic, and
  easier to scan before adding a new abstraction.
- Reject vague `common`, `core`, `utils`, or `lib` destinations.
- Promote only when at least two named consumers need the same stable contract.
- Keep P2 AI Mode, MCP runtime, recovery, portability, signing, and
  distribution out of the P1 closure patch set.

## Completion Evidence

 - baseline commit: working tree only; no baseline closure commit yet
 - final commit: pending
 - reviewer rounds: 1
 - commands:
   - `bun run audit:github quality`
   - `bunx sherif@1.10.0 -r non-existent-packages`
   - `bun run beep quality repo-exports-catalog`
   - `bun run beep tsconfig-sync`
   - `bun run config-sync:check`
   - `bun run beep quality github-checks repo-sanity`
   - `git diff --check`
   - `node goals/stack-installer/ops/p1-completion-check.mjs --output-root output/stack-installer/p1-live --base-ref origin/main`
 - blocking findings fixed:
   - root workspace glob drift in `package.json` (`packages/installer-*/*`) replaced with the explicit installer workspace paths expected by `sherif`
   - installer package manifest dependency ordering drift fixed across installer server/use-case packages
   - stale repo export catalog regenerated in `standards/repo-exports.catalog.{jsonc,md}`
   - root tsconfig-sync drift applied to `syncpack.config.ts` and `tstyche.json`
   - stale background quality/docgen runners and leftover Next build locks cleared before the clean closure reruns
- waived blockers:
   - Windows fresh-machine Manual Mode proof artifact for P1C start only, per the temporary waiver record below
- backlog items:
   - real Windows proof artifact return and audit
- files changed:
   - initiative packet and review outputs under `goals/stack-installer/**`
   - installer package manifests under `packages/installer-*/{server,use-cases}/package.json`
   - root workspace/config generation files: `package.json`, `syncpack.config.ts`, `tstyche.json`
   - repo export catalog artifacts under `standards/repo-exports.catalog.{jsonc,md}`
- remaining risk:
   - full P1 is still blocked on the missing real Windows proof artifact and its audit
   - there is not yet an open PR for `feat/stack-installer-p1-live`, so live review-thread state must be checked again at publish time
- publish status:
   - branch not yet committed or pushed in this closure pass

## Current Gate Position

- macOS proof artifact: complete and audited
- Windows proof artifact: missing
- review-loop startability: allowed under temporary waiver
- full P1 close: still blocked on real Windows proof

## Temporary Waiver Record

- source rule: `PLAN.md` P1C may start after audited macOS proof plus either
  audited Windows proof or an explicit temporary Windows missing-proof waiver
- waived item: Windows fresh-machine Manual Mode proof artifact for P1C start
  only
- disposition: accepted temporary waiver for P1C start only
- reason: avoid blocking the P1C closure pass on an additional remote-machine
  proof run while still keeping full P1 open until the real Windows proof
  exists
- owner: `@beep-team`
- follow-up trigger: remove this waiver only after a real returned Windows
  proof bundle exists on the coordinator checkout and the Windows proof audit
  passes
- residual risk: Windows-specific operator flow, auth behavior, dependency
  setup friction, proof capture, and artifact-return behavior remain
  unverified
- acceptance evidence:
  - `history/outputs/p1-completion-audit.md`
  - `output/stack-installer/p1-live/macos/`
  - `output/stack-installer/p1-live/stack-installer-p1-macos.tgz`
