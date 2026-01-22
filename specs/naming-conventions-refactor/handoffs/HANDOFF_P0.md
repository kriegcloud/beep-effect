# Phase 0 Handoff: Table File Renames

**Date**: 2026-01-21
**From**: Spec Creation
**To**: Phase 0 (Table File Renames)
**Status**: Ready for implementation

---

## Phase 0 Summary

Rename all 19 table files from camelCase to kebab-case to align with the canonical naming convention.

### Key Context

- Table files use `{entity}.table.ts` naming pattern
- Current state: mixed camelCase (e.g., `apiKey.table.ts`)
- Target state: consistent kebab-case (e.g., `api-key.table.ts`)
- Tool: `mcp-refactor-typescript` file_operations

---

## Files to Rename (19 total)

### Package: @beep/iam-tables (13 files)

Located in `packages/iam/tables/src/tables/`:

| Current Name | Target Name | Status |
|--------------|-------------|--------|
| `apiKey.table.ts` | `api-key.table.ts` | Pending |
| `deviceCodes.table.ts` | `device-codes.table.ts` | Pending |
| `oauthAccessToken.table.ts` | `oauth-access-token.table.ts` | Pending |
| `oauthRefreshToken.table.ts` | `oauth-refresh-token.table.ts` | Pending |
| `oauthClient.table.ts` | `oauth-client.table.ts` | Pending |
| `oauthConsent.table.ts` | `oauth-consent.table.ts` | Pending |
| `rateLimit.table.ts` | `rate-limit.table.ts` | Pending |
| `walletAddress.table.ts` | `wallet-address.table.ts` | Pending |
| `twoFactor.table.ts` | `two-factor.table.ts` | Pending |
| `scimProvider.table.ts` | `scim-provider.table.ts` | Pending |
| `organizationRole.table.ts` | `organization-role.table.ts` | Pending |
| `teamMember.table.ts` | `team-member.table.ts` | Pending |
| `ssoProvider.table.ts` | `sso-provider.table.ts` | Pending |

### Package: @beep/documents-tables (2 files)

Located in `packages/documents/tables/src/tables/`:

| Current Name | Target Name | Status |
|--------------|-------------|--------|
| `documentFile.table.ts` | `document-file.table.ts` | Pending |
| `documentVersion.table.ts` | `document-version.table.ts` | Pending |

### Package: @beep/knowledge-tables (4 files)

Located in `packages/knowledge/tables/src/tables/`:

| Current Name | Target Name | Status |
|--------------|-------------|--------|
| `classDefinition.table.ts` | `class-definition.table.ts` | Pending |
| `propertyDefinition.table.ts` | `property-definition.table.ts` | Pending |
| `entityCluster.table.ts` | `entity-cluster.table.ts` | Pending |
| `sameAsLink.table.ts` | `same-as-link.table.ts` | Pending |

---

## Implementation Order

Complete one package at a time to reduce verification complexity:

1. **@beep/iam-tables** (13 files)
   - Rename all 13 files
   - Run: `bun run check --filter @beep/iam-tables`

2. **@beep/documents-tables** (2 files)
   - Rename all 2 files
   - Run: `bun run check --filter @beep/documents-tables`

3. **@beep/knowledge-tables** (4 files)
   - Rename all 4 files
   - Run: `bun run check --filter @beep/knowledge-tables`

---

## Tool Usage Pattern

```typescript
// ALWAYS preview first
mcp__mcp-refactor-typescript__file_operations({
  operation: "rename_file",
  sourcePath: "packages/iam/tables/src/tables/apiKey.table.ts",
  name: "api-key.table.ts",
  preview: true
})

// Then apply
mcp__mcp-refactor-typescript__file_operations({
  operation: "rename_file",
  sourcePath: "packages/iam/tables/src/tables/apiKey.table.ts",
  name: "api-key.table.ts",
  preview: false
})
```

---

## Verification Steps

After completing each package:

```bash
# Check specific package
bun run check --filter @beep/iam-tables
bun run check --filter @beep/documents-tables
bun run check --filter @beep/knowledge-tables

# After all packages
find packages -name "*.table.ts" | xargs basename -a 2>/dev/null | grep -E '[A-Z]'
# Expected: no output (all camelCase gone)
```

---

## Known Issues & Gotchas

1. **Index file exports**: Table index files may have barrel exports that need updating. The MCP tool should handle this automatically.

2. **Cross-package imports**: Other packages (server, domain) may import from tables. The MCP tool updates all imports.

3. **Drizzle config**: Check if `drizzle.config.ts` or migration files reference table file paths directly (unlikely but verify).

---

## Success Criteria

Phase 0 is complete when:

- [ ] All 19 table files renamed to kebab-case
- [ ] All import paths updated automatically
- [ ] `bun run check --filter @beep/iam-tables` passes
- [ ] `bun run check --filter @beep/documents-tables` passes
- [ ] `bun run check --filter @beep/knowledge-tables` passes
- [ ] Verification command returns no camelCase table files
- [ ] REFLECTION_LOG.md updated with Phase 0 learnings
- [ ] HANDOFF_P1.md reviewed and ready

---

## Next Phase

After completing Phase 0, proceed to Phase 1: Value Object Renames.

See: `handoffs/HANDOFF_P1.md`
