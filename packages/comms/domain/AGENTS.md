# @beep/comms-domain — Agent Guide

## Purpose & Fit
- Centralizes communications domain models via `M.Class` definitions that merge shared audit fields through `makeFields`, giving infra and tables a single source of truth for schema variants.
- Re-exports the comms entity inventory to consumers through the package root so repos, tables, and runtimes can import `Entities.*` without piercing folder structure.
- Provides domain entities for messaging, notifications, email templates, and communication preferences.
- Contains pure business logic with no side effects — all I/O belongs in the server layer.

## Surface Map
- **Entities.Placeholder** — Starter entity demonstrating the M.Class pattern with `makeFields`. Includes `name` (required) and `description` (optional) fields. Replace with actual comms entities as the feature matures.

## Usage Snapshots
- Repositories import `Entities` to seed `Repo.make` factories that enforce typed persistence.
- PG tables reference entity ID factories to maintain typed primary keys.
- Integration tests build insert payloads with `Entities.*.Model.insert.make` to validate repo flows end-to-end.
- Test harness seeds comms fixtures directly from `Entities.*` model variants when spinning Postgres containers.

## Authoring Guardrails
- Always import Effect modules with namespaces (`Effect`, `A`, `F`, `O`, `Str`, `S`, `M`) and rely on Effect collections/utilities instead of native helpers (see global repo guardrails).
- Use `makeFields` so every entity inherits the audit + tracking columns and typed IDs; never redefine `id`, `_rowId`, `version`, or timestamps manually.
- Maintain `Symbol.for("@beep/comms-domain/<Entity>Model")` naming via `$CommsDomainId` to keep schema metadata stable across database migrations and clients.
- Prefer shared schema helpers (`FieldOptionOmittable`, `FieldSensitiveOptionOmittable`, `toOptionalWithDefault`, `BoolWithDefault`) to describe optionality and defaults.
- When adding new entities, extend entity ID factories in `@beep/shared-domain` (e.g., `CommsEntityIds`) and propagate matching tables in `@beep/comms-tables`.
- Apply `modelKit(Model)` to expose standardized utilities (`.utils`) on each model class.

## Quick Recipes
- **Create a notification entity**
  ```ts
  import { $CommsDomainId } from "@beep/identity/packages";
  import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
  import { makeFields } from "@beep/shared-domain/common";
  import { modelKit } from "@beep/shared-domain/factories";
  import * as M from "@effect/sql/Model";
  import * as S from "effect/Schema";

  const $I = $CommsDomainId.create("entities/Notification");

  export class Model extends M.Class<Model>($I`NotificationModel`)(
    makeFields(CommsEntityIds.NotificationId, {
      userId: SharedEntityIds.UserId,
      title: S.NonEmptyTrimmedString,
      body: S.String,
      read: S.Boolean,
      type: S.Literal("info", "warning", "error", "success"),
    }),
    $I.annotations("NotificationModel", {
      description: "User notification model.",
    })
  ) {
    static readonly utils = modelKit(Model);
  }
  ```

## Verifications
- `bun run check --filter @beep/comms-domain`
- `bun run lint --filter @beep/comms-domain`
- `bun run test --filter @beep/comms-domain`

## Contributor Checklist
- [ ] Align entity changes with `@beep/comms-tables` columns and regenerate migrations (`bun run db:generate`, `bun run db:migrate`).
- [ ] Update `packages/_internal/db-admin` fixtures/tests when adding or removing fields to keep container smoke tests honest.
- [ ] Maintain `Symbol.for` identifiers and audit field structure via `makeFields`.
- [ ] Prefer `Model.insert/update/json` helpers for transformations—avoid handcrafting payloads in repos or services.
- [ ] Re-run verification commands above before handing work off; add Vitest coverage beyond the placeholder suite when touching new behavior.
