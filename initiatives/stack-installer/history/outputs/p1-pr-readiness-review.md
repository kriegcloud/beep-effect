# P1 PR Readiness Review

Status: pending; run after fresh macOS and Windows proof artifacts are
available.

This output records the post-proof `$quality-review-fix-loop` closure pass for
Stack Installer P1. It must not start until the fresh-machine Manual Mode proof
artifacts have been produced and audited for secret safety.

This is a comprehensive review of the whole P1 initiative surface and directly
affected code paths as a system, not a narrow final lint pass.

## Scope

- `initiatives/stack-installer/**`
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

Populate this section after the loop runs:

- baseline commit:
- final commit:
- reviewer rounds:
- commands:
- blocking findings fixed:
- waived blockers:
- backlog items:
- files changed:
- remaining risk:
- publish status:
