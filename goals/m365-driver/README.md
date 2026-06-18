# M365 Driver

## Status

Lifecycle: `active`

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

P0 Research — not started. Confirm the `@beep/hubspot` raw-HTTP precedent and the
Graph `v1.0` endpoints/scopes named in `SPEC.md`, then scaffold `@beep/m365` via
`bun run create-package`.

## Latest Evidence

Not started.

## Notes

- Mirror `@beep/hubspot` (raw HTTP + Schema + bearer) and `@beep/box`
  (config/service/errors + `S.Redacted`). Register new deps in the root
  `package.json` `catalog`.
- Read-only v1; the service shape must stay write-ready (verb/scope-extensible).
- Known downstream consumer: `solo-firm-docketing` needs the reserved
  `Calendars.ReadWrite` scope (phase 2).
