# P4 Shared UI OrganizationDisplay Arbitrary Pilot

Date: 2026-06-08

## Completed

- Remediated `packages/shared/ui/test/OrganizationDisplay.test.ts` from the
  `SFV4-arbitrary-tests` advisory inventory.
- Added a property test deriving `Organization.Display` and `Organization.Form`
  instances from the existing source schemas with `S.toArbitrary(...)`.
- Kept exact browser payload fixtures for readable decode/encode regressions.
- Proved generated display/form values encode, decode, and re-encode stably.
- Proved `Organization.primaryLabel` returns the generated display name across
  the schema domain.
- Refreshed `standards/schema-first.inventory.jsonc`; live arbitrary-test
  advisories now report 16 tracked files.

## Review Notes

This pilot is intentionally UI-boundary focused. It does not replace the exact
fixtures that document browser-safe nullable `parentOrgId` encoding, invalid
license-tier rejection, or slug rejection. The generated property sits beside
those fixtures and proves the broader schema law for production `S.Class`
payloads exported by `@beep/shared-ui/entities/Organization`.

Effect v4 source grounding: `.repos/effect-v4/packages/effect/SCHEMA.md`
documents that `Schema.toArbitrary` converts schemas to FastCheck arbitraries
and applies checks as filters. A quick sample of `S.toArbitrary(Organization.Display)`
confirmed the source schemas generate valid `Display` class instances without a
test-only schema.

## Verification

```sh
cd packages/shared/ui && bun run beep:test -- OrganizationDisplay.test.ts
cd packages/shared/ui && bun run check
cd packages/shared/ui && bun run lint
bun run beep lint schema-first --write
bun run beep lint schema-first
```

