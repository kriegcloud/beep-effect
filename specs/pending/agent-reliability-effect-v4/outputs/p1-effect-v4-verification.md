# P1 Effect v4 Verification

## Local Source Mappings

| Guidance | Local Source |
|---|---|
| `Context.Tag`/`Context.GenericTag` replaced by `ServiceMap.Service` | `.repos/effect-smol/MIGRATION.md` + `migration/services.md` + KG verification report |
| `Effect.catchAll` removed, use `Effect.catch`/`Effect.catchTag` | `.repos/effect-smol/MIGRATION.md` + `migration/error-handling.md` + KG verification report |
| FileSystem and Path moved to main `effect` package | KG verification report (`Test 1c`) |
| `Schema.decode` removed, use `decodeUnknownSync` / `decodeUnknownEffect` | KG verification report (`Test 2b`) |
| `@effect/schema` import path deprecated in v4 workflows | `.repos/effect-smol/MIGRATION.md` + KG correction facts |

## Enforcement Points in Harness

1. Detector rules flag critical v3 symbols/import paths.
2. Correction packet injects concise, source-backed replacements.
3. Success logic hard-fails when critical incidents are present.
