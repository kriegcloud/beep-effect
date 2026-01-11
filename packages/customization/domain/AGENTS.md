# @beep/customization-domain — Agent Guide

## Purpose & Fit
- Centralizes customization domain models via `M.Class` definitions that merge shared audit fields through `makeFields`, giving infra and tables a single source of truth for schema variants.
- Re-exports the customization entity inventory to consumers through the package root so repos, tables, and runtimes can import `Entities.*` without piercing folder structure.
- Provides customization-specific entities for user preferences, hotkeys, and personalization settings.
- Bridges shared-kernel entities into the customization slice so cross-slice consumers can stay on the customization namespace without re-import juggling.

## Surface Map
- **Entities.UserHotkey** — User-configurable keyboard shortcuts model with `userId` reference and `shortcuts` JSON record mapping key bindings to actions.

## Usage Snapshots
- Repositories import `Entities` to seed `Repo.make` factories that enforce typed persistence.
- PG tables reference entity ID factories to maintain typed primary keys.
- Integration tests build insert payloads with `Entities.UserHotkey.Model.insert.make` to validate repo flows end-to-end.
- Test harness seeds customization fixtures directly from `Entities.*` model variants when spinning Postgres containers.

## Authoring Guardrails
- ALWAYS import Effect modules with namespaces (`Effect`, `A`, `F`, `O`, `Str`, `S`, `M`) and rely on Effect collections/utilities instead of native helpers (see global repo guardrails).
- Use `makeFields` so every entity inherits the audit + tracking columns and typed IDs; NEVER redefine `id`, `_rowId`, `version`, or timestamps manually.
- Maintain `Symbol.for("@beep/customization-domain/<Entity>Model")` naming to keep schema metadata stable across database migrations and clients.
- Prefer shared schema helpers (`FieldOptionOmittable`, `FieldSensitiveOptionOmittable`, `toOptionalWithDefault`, `BoolWithDefault`) to describe optionality and defaults.
- When adding new entities, extend entity ID factories in `@beep/shared-domain` and propagate matching enums via table definitions in `@beep/customization-tables`.
- Apply `modelKit(Model)` to expose standardized utilities (`.utils`) on each model class.

## Quick Recipes
- **Create a UserHotkey insert payload**
  ```ts
  import { Entities } from "@beep/customization-domain";
  import { CustomizationEntityIds, SharedEntityIds } from "@beep/shared-domain";
  import * as DateTime from "effect/DateTime";
  import * as Effect from "effect/Effect";

  export const makeUserHotkeyInsert = Effect.gen(function* () {
    const now = yield* DateTime.now;
    const nowDate = DateTime.toDate(now);
    const hotkeyId = CustomizationEntityIds.UserHotkeyId.create();

    return Entities.UserHotkey.Model.insert.make({
      id: hotkeyId,
      userId: SharedEntityIds.UserId.make("user_1"),
      shortcuts: { "ctrl+s": "save", "ctrl+z": "undo" },
      createdAt: nowDate,
      updatedAt: nowDate,
    });
  });
  ```

## Verifications
- `bun run check --filter @beep/customization-domain`
- `bun run lint --filter @beep/customization-domain`
- `bun run test --filter @beep/customization-domain`

## Testing

- Run tests: `bun run test --filter=@beep/customization-domain`
- Test file location: Adjacent to source files as `*.test.ts` or in `test/` directory
- Uses Bun's built-in test framework (`bun:test`)
- ALWAYS test schema encode/decode roundtrips for entity models

## Contributor Checklist
- [ ] Align entity changes with `@beep/customization-tables` columns and regenerate migrations (`bun run db:generate`, `bun run db:migrate`).
- [ ] Update `packages/_internal/db-admin` fixtures/tests when adding or removing fields to keep container smoke tests honest.
- [ ] Maintain `Symbol.for` identifiers and audit field structure via `makeFields`.
- [ ] Prefer `Model.insert/update/json` helpers for transformations—avoid handcrafting payloads in repos or services.
- [ ] Re-run verification commands above before handing work off; add Vitest coverage beyond the placeholder suite when touching new behavior.
