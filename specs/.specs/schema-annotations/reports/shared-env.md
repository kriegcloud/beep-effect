# Schema Annotations Audit: @beep/shared-env

## Summary
- Total Schemas Found: 2
- Annotated: 0
- Missing Annotations: 2

## Notes

This package primarily contains Effect `Config` definitions rather than Effect `Schema` definitions. The `ServerConfig` and related config builders use `effect/Config` which does not require schema annotations in the same way that `effect/Schema` does.

The two schemas found are both in `ClientEnv.ts` and are used for parsing/validating client-side environment variables.

## Annotationless Schemas Checklist

- [ ] `src/ClientEnv.ts:15` - `AuthProviderNames` - Transformed Schema (BS.destructiveTransform)
- [ ] `src/ClientEnv.ts:19` - `ClientEnvSchema` - S.Struct

## Excluded Items

The following were excluded from this audit as they are Config definitions, not Schema definitions:

- `src/ServerEnv.ts:36` - `ConfigArrayURL` - Config utility function
- `src/ServerEnv.ts:71` - `AppConfig` - Config.zipWith composition
- `src/ServerEnv.ts:170` - `ServerConfig` - Config.all definition
