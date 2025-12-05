# AGENTS.md Files Requiring Updates

This file tracks outdated, invalid, or missing references found in AGENTS.md files across the monorepo.

---

## Root AGENTS.md

### Deleted Packages Referenced (packages/core/* was removed)

The following `packages/core/*` packages were deleted and migrated to `packages/shared/infra`:

| Reference                    | Line          | Status                                                    |
|------------------------------|---------------|-----------------------------------------------------------|
| `packages/core/db/AGENTS.md` | 51            | **DELETED** - functionality moved to `@beep/shared-infra` |
| `packages/core/db`           | 112, 140, 144 | **DELETED**                                               |
| `packages/core/env`          | 112, 140, 144 | **DELETED**                                               |
| `packages/core/email`        | 112           | **DELETED**                                               |
| `@beep/core-db`              | Multiple      | **DELETED** - now `@beep/shared-infra`                    |
| `@beep/core-env`             | Multiple      | **DELETED** - now `@beep/shared-infra`                    |
| `@beep/core-email`           | Multiple      | **DELETED** - now `@beep/shared-infra`                    |

### Invalid Path References

| Reference                              | Status                                                           |
|----------------------------------------|------------------------------------------------------------------|
| `packages/ui-core/AGENTS.md` (line 40) | **WRONG PATH** - actual location is `packages/ui/core/AGENTS.md` |
| `packages/ui/AGENTS.md` (line 41)      | **WRONG PATH** - actual location is `packages/ui/ui/AGENTS.md`   |

### Missing AGENTS.md Files Referenced

| Path                                  | Status                            |
|---------------------------------------|-----------------------------------|
| `packages/common/schema/AGENTS.md`    | EXISTS                            |
| `packages/common/invariant/AGENTS.md` | EXISTS                            |
| `packages/shared/domain/AGENTS.md`    | EXISTS                            |
| `packages/shared/tables/AGENTS.md`    | EXISTS                            |
| `packages/documents/domain/AGENTS.md` | EXISTS                            |
| `packages/documents/infra/AGENTS.md`  | EXISTS                            |
| `packages/iam/tables/AGENTS.md`       | EXISTS                            |
| `packages/iam/infra/AGENTS.md`        | EXISTS                            |
| `packages/iam/ui/AGENTS.md`           | EXISTS                            |
| `packages/iam/domain/AGENTS.md`       | EXISTS                            |
| `packages/iam/sdk/AGENTS.md`          | EXISTS                            |
| `packages/runtime/client/AGENTS.md`   | EXISTS                            |
| `packages/runtime/server/AGENTS.md`   | EXISTS                            |
| `tooling/testkit/AGENTS.md`           | EXISTS                            |
| `tooling/repo-scripts/AGENTS.md`      | EXISTS                            |
| `tooling/utils/AGENTS.md`             | EXISTS                            |
| `packages/shared/infra/AGENTS.md`     | **MISSING** - needs to be created |

### MCP Tool Call Definitions to Remove

Lines 163-172 contain MCP-specific tool call definitions (`jetbrains__*`, `context7__*`, `npm-sentinel__*`, `mui-mcp__*`) that should be removed from the root AGENTS.md.

### Non-existent Packages Referenced in Structure

| Package        | Status                 |
|----------------|------------------------|
| `packages/ai/` | **DOES NOT EXIST**     |
| `apps/mcp/`    | **NEEDS VERIFICATION** |

---

## Package AGENTS.md Files Requiring Updates

### packages/_internal/db-admin/AGENTS.md

| Line  | Issue                                                                 |
|-------|-----------------------------------------------------------------------|
| 5     | References `@beep/core-db` - should be `@beep/shared-infra`           |
| 8     | References `packages/core/db/AGENTS.md` - deleted                     |
| 43    | References `packages/core/db/AGENTS.md` - deleted                     |
| 27-34 | Contains tool call shortcuts (jetbrains__, effect_docs__, context7__) |

### packages/documents/infra/AGENTS.md

| Line  | Issue                                                                 |
|-------|-----------------------------------------------------------------------|
| 6     | References `@beep/core-env/server` - should be `@beep/shared-infra`   |
| 7     | References `@beep/core-db/Repo` - should be `@beep/shared-infra/Repo` |
| 25-50 | Contains tool call shortcuts                                          |
| 112   | References `@beep/core-env/server`                                    |

### packages/iam/infra/AGENTS.md

| Line  | Issue                                                          |
|-------|----------------------------------------------------------------|
| 17    | References `@beep/core-email` - should be `@beep/shared-infra` |
| 28-33 | Contains tool call shortcuts                                   |
| 110   | References `@beep/core-email`                                  |

### packages/runtime/server/AGENTS.md

| Line  | Issue                                                               |
|-------|---------------------------------------------------------------------|
| 6     | References `@beep/core-env/server` - should be `@beep/shared-infra` |
| 27-43 | Contains tool call shortcuts                                        |
| 50    | References `@beep/core-env/src/server.ts`                           |
| 117   | References `packages/core/env/src/server.ts`                        |

### packages/runtime/client/AGENTS.md

| Line  | Issue                                                       |
|-------|-------------------------------------------------------------|
| 23-27 | Contains tool call shortcuts (effect_docs__, markdownify__) |

### packages/shared/domain/AGENTS.md

| Line  | Issue                                                                 |
|-------|-----------------------------------------------------------------------|
| 30-53 | Contains tool call shortcuts (jetbrains__, context7__, effect_docs__) |

### packages/shared/tables/AGENTS.md

| Line  | Issue                                                                 |
|-------|-----------------------------------------------------------------------|
| 26-29 | Contains tool call shortcuts (jetbrains__, effect_docs__, context7__) |

### packages/ui/core/AGENTS.md

| Line  | Issue                                                                                                  |
|-------|--------------------------------------------------------------------------------------------------------|
| 6-7   | Path references show wrong location (`packages/ui-core/src/...` instead of `packages/ui/core/src/...`) |
| 66-83 | Contains tool call shortcuts (mui-mcp__, context7__)                                                   |

### packages/ui/ui/AGENTS.md

| Line  | Issue                                                                |
|-------|----------------------------------------------------------------------|
| 74-88 | Contains tool call shortcuts (mui-mcp__, context7__, npm-sentinel__) |

### tooling/testkit/AGENTS.md

| Line  | Issue                                                                 |
|-------|-----------------------------------------------------------------------|
| 27-34 | Contains tool call shortcuts (jetbrains__, effect_docs__, context7__) |

### tooling/repo-scripts/AGENTS.md

Needs to be checked for tool call shortcuts and outdated references.

### tooling/utils/AGENTS.md

Needs to be checked for tool call shortcuts and outdated references.

---

## Summary of Changes Required

### High Priority (Breaking References)

1. **Root AGENTS.md**: Remove all references to `packages/core/*` packages (db, env, email)
2. **Root AGENTS.md**: Fix path references for `packages/ui-core` → `packages/ui/core`
3. **Root AGENTS.md**: Fix path references for `packages/ui` → `packages/ui/ui`
4. **Root AGENTS.md**: Remove `packages/ai/` from structure (doesn't exist)
5. **All package AGENTS.md files**: Update `@beep/core-db`, `@beep/core-env`, `@beep/core-email` → `@beep/shared-infra`

### Medium Priority (Cleanup)

1. **Root AGENTS.md**: Remove MCP tool call definitions (lines 163-172)
2. **All package AGENTS.md files**: Remove "Tooling & Docs Shortcuts" sections with tool call definitions
3. **Create**: `packages/shared/infra/AGENTS.md` documenting the consolidated infrastructure

### Low Priority (Consistency)

1. Verify `apps/mcp/` existence and update structure accordingly
2. Update all import examples to use new package paths
3. Ensure all AGENTS.md files follow consistent formatting

---

## New Package Structure (After Migration)

```
packages/
├── _internal/
│   └── db-admin/          # Migration warehouse (EXISTS)
├── common/
│   ├── constants/         # Schema-backed enums (EXISTS)
│   ├── contract/          # Contract system (EXISTS)
│   ├── errors/            # Logging & telemetry (EXISTS)
│   ├── identity/          # Package identity (EXISTS)
│   ├── invariant/         # Assertions (EXISTS)
│   ├── mock/              # Mock data (EXISTS)
│   ├── schema/            # Effect Schema utilities (EXISTS)
│   ├── types/             # Compile-time types (EXISTS)
│   └── utils/             # Pure helpers (EXISTS)
├── core/                  # EMPTY - packages deleted
├── documents/
│   ├── domain/            # (EXISTS)
│   ├── infra/             # (EXISTS)
│   ├── sdk/               # (EXISTS)
│   ├── tables/            # (EXISTS)
│   └── ui/                # (EXISTS)
├── iam/
│   ├── domain/            # (EXISTS)
│   ├── infra/             # (EXISTS)
│   ├── sdk/               # (EXISTS)
│   ├── tables/            # (EXISTS)
│   └── ui/                # (EXISTS)
├── runtime/
│   ├── client/            # (EXISTS)
│   └── server/            # (EXISTS)
├── shared/
│   ├── domain/            # (EXISTS)
│   ├── infra/             # NEW - consolidated from packages/core/*
│   ├── sdk/               # (EXISTS)
│   ├── tables/            # (EXISTS)
│   └── ui/                # (EXISTS)
└── ui/
    ├── core/              # Theme system (EXISTS) - NOT packages/ui-core
    └── ui/                # Components (EXISTS) - NOT packages/ui
```
