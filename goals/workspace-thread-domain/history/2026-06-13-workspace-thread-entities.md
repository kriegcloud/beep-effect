# Workspace Thread Entity Evidence

Date: 2026-06-13
Agent: Codex

## Scope

P1 implementation slice for workspace Thread / Turn / Message domain models,
table projections, db-admin migration registration, and PGlite migration smoke.

## Implemented

- Added `ThreadId`, `TurnId`, and `MessageId` in the workspace identity
  registry.
- Added workspace `Thread`, `Turn`, and `Message` `BaseEntity.Class` models.
- Modeled `Turn` as an aggregate with ordered typed items:
  `MessageItem | ToolCallItem | ToolResultItem | ArtifactRefItem |
  ActivityItem`.
- Persisted `Message.content` as the `@beep/md` `Document` AST in a JSONB
  column.
- Added workspace table projections via `EntityTable.pgTableFrom`.
- Added db-admin `WorkspaceThreadMigrationTarget` and migration SQL for
  `workspace_thread`, `workspace_turn`, and `workspace_message`.

## Verification

```sh
bun run --cwd packages/workspace/domain check
bun run --cwd packages/workspace/domain test
bun run --cwd packages/workspace/domain lint
bunx tstyche dtslint/WorkspaceDomain.tst.ts

bun run --cwd packages/workspace/tables check
bun run --cwd packages/workspace/tables test
bun run --cwd packages/workspace/tables lint
bunx tstyche dtslint/WorkspaceTables.tst.ts

bun run --cwd packages/_internal/db-admin check
bun run --cwd packages/_internal/db-admin test
bun run --cwd packages/_internal/db-admin lint
bunx tstyche dtslint/ArchitectureLabMigrationTarget.tst.ts
BEEP_TEST_DATABASE_DRIVER=pglite-testcontainers bun run --cwd packages/_internal/db-admin test:integration
```

All commands passed.

## PGlite Branch Proof

The db-admin integration test now applies all migrations and inserts:

- one `workspace_thread` row,
- one root `workspace_turn` row with `parent_turn_id = NULL`,
- one branch `workspace_turn` row with `parent_turn_id = 11`,
- two `workspace_message` rows with md-aligned document JSON content.

The test queries `workspace_turn` ordered by id and expects:

```text
[{ id: 11, parent_turn_id: null }, { id: 12, parent_turn_id: 11 }]
```
