# Contract Decisions (Phase 1)

## Status
Drafted from user-locked variable set (2026-02-20).

## Decisions

### CD-001: Canonical Key Set
Adopt the 64-key user-provided set in `outputs/key-catalog.md` as the canonical local-dev baseline.

### CD-002: Interpolation Policy
Canonical env files do not allow `${...}` interpolation.

Disallowed:
- interpolation for secret-bearing DSNs or cloud credentials,
- interpolation for `NEXT_PUBLIC_*` keys,
- transitive interpolation chains (`A -> B -> C`).

### CD-003: Explicit Public Values
All `NEXT_PUBLIC_*` values are explicit literals in `.env.example` (no derived references).

### CD-004: Auth Secret Canonical Name
Use `AUTH_SECRET` as canonical naming in the new contract.

Migration note:
- if application code still expects `BETTER_AUTH_SECRET`, add temporary compatibility mapping in migration phase.

### CD-005: 1Password Execution Model
Use 1Password CLI process-level injection for local secret-dependent commands:
- `op run --env-file=.env -- <command>`

### CD-006: Formatting Policy
Treat env readability as contract:
- preserve section grouping,
- preserve ASCII/comment structure,
- preserve deterministic ordering.

### CD-007: Placeholder Policy
In tracked `.env.example`:
- secrets must be placeholders or 1Password references,
- no real secret literals,
- public/non-secret defaults may be explicit.

## Open Questions
1. Should `NEXT_PUBLIC_APP_CLIENT_URL` match `APP_CLIENT_URL` by default value or differ by environment?
2. Should `NEXT_PUBLIC_STATIC_URL` default to a local URL or stay blank in template?
3. Confirm whether any runtime path still requires `BETTER_AUTH_SECRET` during transition.

## Verification Targets for Phase 2
- command matrix covers `services:up`, `build`, `test`, and local app dev commands.
- interpolation checker enforces zero `${...}` references in canonical env files.
- migration plan enumerates the 69 dropped keys from current `.env`.
