# Foundation Package Migration Plan

## Phase 0: Baseline And Artifacts

- Confirm clean branch/worktree.
- Create this initiative packet.
- Add a repo-only changeset for topology migration tracking.

## Phase 1: Automation Support

- Add `packages/foundation/*/*` to root workspace support.
- Update root scripts that hardcode common paths.
- Make `create-package` foundation-aware:
  - `--family foundation`
  - `--kind primitive|modeling|capability|ui-system`
  - derived path `packages/foundation/<kind>/<name>`
  - emitted `beep` metadata
  - identity registration resolved from the `@beep/identity` workspace.
- Preserve repo-owned config sync as the canonical writer for aliases,
  references, tstyche, syncpack, and package docgen.
- Add a light topology check for foundation metadata/path consistency.

## Phase 2: Leaf And Modeling Moves

1. `@beep/types` -> `packages/foundation/primitive/types`
2. `@beep/data` -> `packages/foundation/primitive/data`
3. `@beep/messages` -> `packages/foundation/modeling/messages`
4. `@beep/identity` -> `packages/foundation/modeling/identity`
5. `@beep/utils` -> `packages/foundation/modeling/utils`
6. `@beep/schema` -> `packages/foundation/modeling/schema`

Before moving `@beep/utils`, create an allow/defer/block audit ledger. Before
moving `@beep/schema`, create a light ledger for broad internal surfaces that
may need later refinement.

## Phase 3: Capability Moves

1. `@beep/colors` -> `packages/foundation/capability/colors`
2. `@beep/chalk` -> `packages/foundation/capability/chalk`
3. `@beep/md` -> `packages/foundation/capability/md`
4. `@beep/semantic-web` -> `packages/foundation/capability/semantic-web`
5. `@beep/nlp` -> `packages/foundation/capability/nlp`
6. `@beep/observability` -> `packages/foundation/capability/observability`

## Phase 4: UI System Move

Move `@beep/ui` to `packages/foundation/ui-system/ui`, then update shadcn,
Storybook, and `apps/codedank-web` references.

## Phase 5: Final Cleanup

- Remove the root `packages/common/*` workspace entry.
- Remove active `packages/common` references from configs, tests, standards,
  inventories, skills, package docs, and app configs.
- Delete the empty `packages/common` directory.
- Run `bun install`, `bun run config-sync`, docs aggregation, and the repo
  quality battery.
