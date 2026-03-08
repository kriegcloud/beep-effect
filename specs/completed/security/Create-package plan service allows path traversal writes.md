# Status
fixed on current branch

## Outcome
Create-package plan inputs are now schema-validated as traversal-safe relative paths, and plan execution re-checks canonical containment before writing files or creating symlinks.

## Evidence
- Code: `tooling/cli/src/commands/CreatePackage/FileGenerationPlanService.ts`
- Tests: `tooling/cli/test/create-package-security.test.ts`
- Verification: `bunx tsc -p tooling/cli/tsconfig.json --noEmit`
- Verification: `bunx vitest run tooling/cli/test/create-package-security.test.ts`
