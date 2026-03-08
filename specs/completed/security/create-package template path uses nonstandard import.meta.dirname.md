# Status
fixed on current branch

## Outcome
Create-package template resolution now derives the module directory from `import.meta.url` via `fileURLToPath(new URL(".", import.meta.url))`, removing reliance on the nonstandard `import.meta.dirname`.

## Evidence
- Code: `tooling/cli/src/commands/CreatePackage/Handler.ts`
- Verification: `bunx tsc -p tooling/cli/tsconfig.json --noEmit`
