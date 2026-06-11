# P4 EmailString Precision Pilot

Date: 2026-06-08

## Completed

- Split the normalized branded email string schema from the redacted email
  wrapper in `packages/foundation/modeling/schema/src/internal/email.ts`.
- Exported public `EmailString` from `@beep/schema` for domains that need a
  validated email string value rather than a `Redacted` value.
- Kept public `Email` as the redacted wrapper over the same precise
  `EmailString` domain.
- Migrated four non-redacted email fields from broad `S.String` to
  `EmailString`:
  - `ContactContent.email`;
  - `RuntimeDraftRecipient.email`;
  - `PersonObject.email`;
  - `BugsObject.email`.
- Added `packages/foundation/modeling/schema/test/Email.test.ts` to prove
  normalization and invalid-email rejection for `EmailString`.
- Extended `PackageJson.test.ts` so package metadata email fields prove the
  source schema normalizes displayable email strings.

## Why This Matters

The precision audit originally pushed every broad `email: S.String` toward
`Email`, but some schema fields intentionally need a plain string after
validation: public contact copy, package metadata, and email recipients are
serializable/displayable values, not secret-bearing `Redacted` values.

`EmailString` gives agents a clear schema-first answer:

- use `EmailString` when the value should decode, normalize, serialize, and
  render as a string;
- use `Email` when the value should be redacted at rest or in logs;
- keep broad `S.String` only for raw input or diagnostic surfaces that
  deliberately preserve invalid user/external data.

## Verification

```sh
cd packages/foundation/modeling/schema && bun run beep:test -- Email.test.ts
cd packages/foundation/modeling/schema && bun run lint
cd packages/foundation/modeling/schema && bun run check
cd packages/tooling/library/repo-utils && bun run beep:test -- schemas/PackageJson.test.ts
cd packages/tooling/library/repo-utils && bun run check
cd packages/tooling/library/repo-utils && bun run lint
cd apps/oip-web && bun run check
cd apps/oip-web && bun run test
cd apps/oip-web && bun run lint
cd packages/agent-capability/use-cases && bun run check
cd packages/agent-capability/use-cases && bun run test
cd packages/agent-capability/use-cases && bun run lint
bun run beep lint schema-first --write
bun run beep lint schema-first
bun run repo-exports:catalog
bun run repo-exports:catalog:check
```

After this pilot, the live precision audit reports:

```text
[schema-first] sfv4_precision_audit_advisories=0
```

The two remaining broad email matches are reviewed `exception` entries rather
than active advisories after
`reviews/p4-precision-exception-counting.md`.

## Remaining Precision Questions

- `ContactSubmissionFormPayload.email` is still broad because it models raw
  browser form input before route/domain validation.
- `HubSpotErrorOptions.email` is still broad because diagnostic context may
  need to preserve invalid external input for error reporting.
