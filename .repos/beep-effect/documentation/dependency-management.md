# Dependency Management Guide

Update all NPM dependencies across the entire monorepo using the automated TypeScript script.

## Quick Start

```bash
# 1. Dry run to preview changes
direnv exec . bun run deps:update

# 3. Review changes  
git diff package.json packages/**/package.json

# 4. Update version constants (see below)
```

## Script Options

```bash

# Examples:
direnv exec . bun run deps:update
```



## Expected Warnings

These warnings are normal and can be ignored:
- **npm config warnings:** "Unknown project config dedupe-direct-deps", etc.
- **Peer dependency warnings:** Generally safe unless causing build failures
- **Catalog warnings:** "Skip adding to catalog because it already exists"

## Validation Checklist

After dependency updates, verify these meta-items:

- [ ] Version constants updated appropriately
- [ ] TypeScript build passes: `direnv exec . bun run build`
- [ ] TypeScript type checks pass: `direnv exec . bun run check`
- [ ] Linting passes: `direnv exec . bun run lint:fix`

## Troubleshooting

**"Command not found" errors:** Use `direnv exec .` prefix for all commands

**Script execution issues:** Ensure TypeScript builds pass: `direnv exec . bun run check`

**Update failures:** If updates break the build, rollback with `git checkout .` and update manually

**Large number of updates:** Review changes with `git diff` before committing

**Problematic dependencies:** When specific packages fail to update:

1. **Research first:** Check GitHub issues, search `"package-name" + "version" + "error"`, review changelog/releases (also try without the version number)

2. **Continue with others:** Focus on specific problematic packages

3. **Document findings:** Note exact error/versions, check peer conflicts, verify relation to exclusions (React/patches), test in isolation

4. **Ask for help only after research with:** Error messages/traces, version details (current → attempted), research findings, update blocking status

## Patched Dependencies

**Patched dependencies are excluded from automatic updates** to prevent conflicts.

To update patched dependencies manually:
1. Check if the patch is still needed in the new version
2. If needed, update the patch file for the new version
3. If not needed, remove from `patchedDependencies` configuration
4. Then run the update process

Current pinned dependencies are listed in the root `package.json` under `catalog`.
