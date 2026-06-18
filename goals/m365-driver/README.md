# M365 Driver

## Status

Lifecycle: `completed-retained`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Ship `@beep/m365`: a thin, native Microsoft Graph driver (delegated
auth-code+PKCE via MSAL; `FetchHttpClient` + `effect/Schema`) exposing read verbs
for OneDrive/SharePoint files and Outlook mail/calendar, with a write-ready
service shape but read-only scopes. The connector substrate for beep's agents.

Graduated from
[`explorations/microsoft-365-integration`](../../explorations/microsoft-365-integration/README.md).

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/m365-driver/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan.
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`../../explorations/microsoft-365-integration`](../../explorations/microsoft-365-integration/README.md) - graduated source exploration (research + decisions).
6. [`history/`](./history/) - evidence and closeouts, if present.

## Current Phase

P3 Close - completed. The `@beep/m365` driver now has injected-authorizer MSAL
auth, read-only Microsoft Graph `v1.0` service verbs, unit/live/dtslint coverage,
and closeout reflection evidence.

## Latest Evidence

- 2026-06-18: `TURBO_FORCE=1 bunx turbo run check lint test --filter=@beep/m365`
  passed with 13/13 Turbo tasks successful and `test/M365.service.test.ts` 5/5
  passing.
- 2026-06-18: `bun run --filter @beep/m365 type-test` passed with
  `dtslint/M365.tst.ts` 2/2 tests and 24/24 assertions passing.
- 2026-06-18: Added
  [`history/reflections/2026-06-18-codex.md`](./history/reflections/2026-06-18-codex.md)
  for P3 closeout.

## Notes

- Mirror `@beep/hubspot` (raw HTTP + Schema + bearer) and `@beep/box`
  (config/service/errors + `S.Redacted`). Register new deps in the root
  `package.json` `catalog`.
- Read-only v1; the service shape must stay write-ready (verb/scope-extensible).
- Known downstream consumer: `solo-firm-docketing` needs the reserved
  `Calendars.ReadWrite` scope (phase 2).
