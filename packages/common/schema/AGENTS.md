# AGENTS — @beep/schema

## Purpose & Fit
- Canonical, pure runtime schema toolkit built on `effect/Schema`; supplies primitives, nominal IDs, JSON Schema builders, and SQL annotations without I/O or platform hooks.
- Anchors a shared language for every slice while staying domain-agnostic; pair runtime schemas with `@beep/types` (compile-time) and `@beep/utils` (string/entity transforms) to avoid duplicate helpers.
- Single `BS` namespace (`import { BS } from "@beep/schema"`) aggregates primitives, derived kits, integrations, and identity helpers for client/server-safe reuse.

## Surface Map
- `src/index.ts`, `src/schema.ts` — BS namespace barrel that preserves the public surface and legacy import targets.
- `src/primitives/**` — annotated string/email/password/slug/phone, network (URL/IP), temporal, number/bool, array/binary/json, locale/geo, and regex helpers kept pure.
- `src/identity/entity-id/entity-id.ts` — `make` factory for `${table}__uuid` branded schemas with `create/is` helpers plus Drizzle `publicId`/`privateId` builders; `src/identity/entity-id/uuid.ts` for literal UUID schemas.
- `src/derived/kits/string-literal-kit.ts` and siblings under `derived/kits/*` — literal kits with `.Options/.Enum`, tagged unions, nullables, and transformation helpers.
- `src/core/annotations/*`, `core/extended/extended-schemas.ts`, `core/generics/tagged-union*.ts`, `core/utils/*`, `core/variance.ts` — annotations, extended combinators, tagged struct/union factories, defaults/arbitraries/brands.
- `src/builders/json-schema/*`, `src/builders/form/*` — JSON Schema builder DSL plus form field/metadata helpers derived from annotations.
- `src/integrations/config/csp.ts`, `src/integrations/http/http-headers.ts`, `src/integrations/sql/*` — CSP parsing/rendering utilities, HTTP header/method schemas, and Postgres enum/serial helpers for Drizzle annotations.
- `test/config|custom|kits/**` — TestKit coverage for builders, primitives, and kits; extend alongside new exports.

## Usage Snapshots
- `packages/shared/domain/src/entities/User/User.model.ts:13` — BS optional field helpers, defaults, and email schema inside a Drizzle `Model` with shared entity IDs.
- `packages/shared/domain/src/entities/Session/Session.model.ts:14` — `BS.DateTimeFromDate`, sensitive option wrappers, and shared IDs powering session persistence.
- `packages/iam/domain/src/entities/Member/schemas/MemberStatus.ts:4` — `BS.StringLiteralKit` with `.Enum` and `BS.toPgEnum` to bridge literal kits into Postgres enums.
- `packages/shared/domain/src/entity-ids/entity-kind.ts:5` — multi-slice `BS.StringLiteralKit` composition feeding tagged entity-kind guards.

## Tooling & Reference
- `packages/common/schema/README.md` — package overview and scope.
- `docgen.json` — docgen configuration; regenerate with `bunx turbo run docgen --filter=@beep/schema`.
- Quick source inspection: `src/identity/entity-id/entity-id.ts` for branded ID factory, `src/derived/kits/string-literal-kit.ts` for literal kit ergonomics, `src/integrations/config/csp.ts` for CSP DSL.

## Authoring Guardrails
- Effect namespace imports only; never use native array/string/object helpers—route through `F.pipe` with `A.*`, `Str.*`, `Struct.*`, `Record.*`. Avoid `for`/`for...of` loops and native `Object.*`.
- Keep schemas pure: no network/DB/filesystem/timers/logging or platform-specific APIs. Runtime values only.
- Use `_id.ts` helpers for deterministic `Id.annotations(...)`; table names stay snake_case via `SnakeTag`, and brands must end in `Id` when calling `EntityId.make`.
- Maintain the BS namespace: add new exports through `src/schema.ts` (and thus `src/index.ts`) rather than ad-hoc paths; keep slice boundaries intact (no `@beep/iam-*`, `@beep/documents-*` imports).
- Provide rich annotations (`identifier`, `title`, `description`, `jsonSchema`, `arbitrary`, `pretty`) so builders, forms, and docs stay in sync.
- SQL helpers should emit column builders/annotations only—never execute queries from this package.

## Quick Recipes
```ts
import { BS } from "@beep/schema";
import * as F from "effect/Function";
import * as S from "effect/Schema";

const ProjectId = BS.EntityId.make("project", {
  brand: "ProjectId",
  annotations: { description: "Primary identifier for projects" },
});

const Project = S.Struct({
  id: ProjectId,
  name: S.NonEmptyString,
  url: BS.Url,
}).annotations({ identifier: "Project" });

const parsed = F.pipe(
  { id: ProjectId.create(), name: "beam", url: "https://example.com" },
  S.decodeUnknownSync(Project),
);
```

```ts
import { BS } from "@beep/schema";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";

class Visibility extends BS.StringLiteralKit("private", "team", "public").annotations({
  identifier: "Visibility",
  description: "Visibility level for a project",
}) {
  static readonly Upper = F.pipe(Visibility.Options, A.map(Str.toUpperCase));
}

const visibilityEnum = BS.toPgEnum(Visibility);
```

```ts
import { Csp } from "@beep/schema/integrations/config";
import * as F from "effect/Function";

const policy = Csp.fromString("default-src 'self'; connect-src https://api.example.com;");
const header = F.pipe(policy, Csp.toHeader);
```

## Verifications
- `bunx turbo run lint --filter=@beep/schema` — Biome lint plus circular checks for this package.
- `bunx turbo run check --filter=@beep/schema` — type check via the package `check` script.
- `bunx turbo run test --filter=@beep/schema` — TestKit suite under `packages/common/schema/test`.

## Contributor Checklist
- Export new symbols through `src/schema.ts` so the BS namespace stays stable and consumable via `@beep/schema`.
- Keep additions pure and slice-agnostic; no platform APIs or `@beep/iam-*`/`@beep/documents-*` imports.
- Use `_id.ts` helpers for identifiers; for table IDs prefer `EntityId.make` with `SnakeTag` and brands suffixed with `Id`.
- Avoid native array/string/object operations in code and examples; prefer `F.pipe` with Effect collections and string utilities.
- Add annotations, JSON Schema metadata, FastCheck arbitraries, and TestKit coverage (`test/**`) alongside new schemas or kits.
- Update docs (`README.md`, doc prompts/strategy) and notify downstream slices when public surfaces change or enums/tables move.
