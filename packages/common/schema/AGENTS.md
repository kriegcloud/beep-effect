# `@beep/schema` Agent Guide

## Purpose & Fit
- Central runtime schema toolkit for every slice; exports pure `effect/Schema` values, JSON Schema helpers, and branded identifiers that remain environment-agnostic.
- Bridges shared types with persistence, pairing EntityId factories and SQL annotations so Drizzle models align with Effect schemas without introducing DB I/O.
- Works in tandem with `@beep/types` for compile-time helpers and `@beep/utils` for safe string/entity name transforms; consumers should rely on those instead of reimplementing utilities.
- Designed for reuse across apps (`apps/web`, `apps/server`) and packages (`@beep/shared-domain`, `@beep/iam-*`, `@beep/files-*`); ensure additions preserve cross-slice neutrality.

## Surface Map
- `schema.ts` — single public barrel for all runtime exports; imported via `import { BS } from "@beep/schema"`.
- `annotations/` — default annotation helpers, titles, identifiers, pretty printers.
- `config/` — CSP schema and helpers (`Csp`, directive kits); focuses on security headers.
- `custom/` — canonical primitives (email, phone, UUID, Regex, URL, duration, domain names, color, arrays, class/fn guards).
- `EntityId/` — factories for snake_case branded IDs with Drizzle column builders and helpers (`publicId`, `privateId`, `create`, `make`).
- `extended-schemas.ts` — structural combinators (`Struct`, `TaggedStruct`, `TaggedUnion`, non-empty collections).
- `form/` — schema presets tailored for form metadata (`FormJsonSchema`, field annotations).
- `generics/` — tagged unions/structs plus variance helpers; re-exported as `TaggedUnion`, `TaggedStruct`.
- `kits/` — higher-level kits such as `stringLiteralKit` (enum builder, FastCheck sampling, Drizzle enum).
- `regexes.ts`, `relationship-utils.ts`, `system-schema.ts`, `sql/` — curated regex sets, relationship helpers, system-level schemas, and SQL-aligned transforms (e.g. `DateTimeFromDate`).
- `utils/`, `variance.ts`, `JsonSchema.ts`, `types.ts`, `custom-fields-schema.ts` — misc helpers, variance token, JSON Schema model, shared types, and builder utilities.

## Usage Snapshots
- `packages/shared/domain/src/entities/User/User.model.ts:12` — shows `BS.Email`, `BS.BoolWithDefault`, and optional field helpers in shared domain models (annotation pattern + Drizzle integration).
- `packages/iam/domain/src/entities/Session/Session.model.ts:16` — composes `BS.DateTimeFromDate` with entity IDs to enforce timestamp precision in IAM sessions.
- `packages/iam/infra/src/adapters/better-auth/Auth.service.ts:130` — decodes effect payloads with `S.decode` while leveraging `BS.Url.make` inside effectful orchestration.
- `packages/shared/domain/src/entity-ids/entity-kind.ts:5` — illustrates `BS.stringLiteralKit` derived enums feeding multi-tenant entity kind guards.
- `packages/shared/domain/src/common.ts:15` — exemplifies `BS.DateTimeInsertFromDateOmittable` for audited timestamp defaults in shared table mixins.

## Tooling & Docs Shortcuts
- Inspect consumers using the namespace: `jetbrains__search_in_files_by_text` with `{"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","searchText":"BS.","maxUsageCount":50}`.
- Pull latest Effect schema docs: `context7__get-library-docs` with `{"context7CompatibleLibraryID":"/effect-ts/effect","topic":"Schema transformOrFail","tokens":2000}`.
- Deep dive into Effect transforms: `effect_docs__get_effect_doc` with `{"documentId":10877,"page":1}`.
- Snapshot schema source quickly: `jetbrains__get_file_text_by_path` pointing at e.g. `{"projectPath":"/home/elpresidank/YeeBois/projects/beep-effect","pathInProject":"packages/common/schema/src/EntityId/EntityId.ts","maxLinesCount":200}`.

## Authoring Guardrails
- **Effect-first collections**: never introduce native array/string/object helpers; always route through `F.pipe` with `A.*`, `Str.*`, `Struct.*`, `Record.*`. Legacy occurrences exist—treat them as debt and avoid expanding them.
- **Purity**: schemas must stay side-effect free. No network, DB, logging, timers, or platform-specific APIs. Compute-only helpers only.
- **Annotations**: supply `title`, `identifier`, `description`, and when relevant `jsonSchema`, `pretty`, and `arbitrary` metadata so downstream form builders and docs stay rich.
- **Entity IDs**: enforce snake_case table names and brand suffixes ending with `Id`. Prefer `EntityId.make("entity_name", { brand: "EntityNameId", annotations })`; validate via provided invariants instead of custom brand logic.
- **Layer boundaries**: do not import slice-specific code (`@beep/iam-*`, `@beep/files-*`). Rely on shared foundations (`@beep/types`, `@beep/utils`, `@beep/invariant`, Effect stdlib).
- **Testing stance**: new schemas should be accompanied by Vitest cases that cover decode/encode symmetry, annotation expectations, and failure modes. Property-based sampling is encouraged where kits expose FastCheck helpers.

## Quick Recipes
```ts
import { BS } from "@beep/schema";
import * as F from "effect/Function";
import * as S from "effect/Schema";

const MemberId = BS.EntityId.make("member", {
  brand: "MemberId",
  annotations: {
    description: "Primary identifier for members",
  },
});

const Member = S.Struct({
  id: MemberId,
  email: BS.Email,
  status: BS.stringLiteralKit("pending", "active", "suspended").Schema,
}).annotations({
  identifier: "Member",
});

const parsed = F.pipe(
  { id: MemberId.create(), email: "ops@example.com", status: "active" },
  S.decodeUnknownSync(Member),
);
```

```ts
import { BS } from "@beep/schema";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";

const normalized = F.pipe(
  BS.stringLiteralKit("default", "strict", "lax"),
  (Kit) =>
    F.pipe(
      Kit.Options,
      A.map(Str.toUpperCase),
    ),
);
```

```ts
import { BS } from "@beep/schema";
import * as F from "effect/Function";
import * as JSONSchema from "effect/JSONSchema";
import * as S from "effect/Schema";

const Profile = S.Struct({
  id: BS.UUIDLiteralEncoded,
  website: BS.Url,
  bio: S.optional(S.String),
}).annotations({
  identifier: "Profile",
});

const jsonSchema = F.pipe(Profile, JSONSchema.make, BS.JsonSchema.normalize);
```

```ts
import { BS } from "@beep/schema";
import * as F from "effect/Function";

const header = F.pipe(
  {
    directives: {
      "script-src": ["'self'", "https://cdn.example.com"] as const,
    },
  },
  BS.Csp.toHeader,
);
```

## Verifications
- `bun run lint` — biome formatting + lint.
- `bun run check` — repo-wide type check (ensures schema exports stay sound).
- `bun run test --filter schema` — run schema-specific Vitest suites (extend as you add coverage).

## Contributor Checklist
- Document new exports in `schema.ts` and keep namespace stable (`BS.*`).
- Add Vitest coverage for new schemas (`packages/common/schema/test/**`), including negative decode cases.
- Provide annotations (`title`, `description`, `pretty`, `jsonSchema`) and FastCheck arbitraries where practical.
- Confirm no native array/string/object helpers slipped in; prefer Effect collections and string utilities.
- Update downstream references or README snippets if public API evolves; surface breaking changes to slice maintainers.
- Notify root docs maintainers when new kits or patterns warrant inclusion in `docs/patterns/`.

## Known Pitfalls & Opportunities
- Historical files (e.g. `JsonSchema.ts`, `stringLiteralKit.ts`) still lean on native arrays/objects. When touching them, migrate blocks incrementally to `A.*` / `Struct.*` utilities instead of copying patterns forward.
- EntityId annotations are duplicated inside `make` and `Factory`; prefer reusing helpers rather than rebranding manually in consumer code to avoid inconsistent identifiers.
- JSON Schema normalization mutates structured clones—avoid feeding raw schema objects back into user-land without normalization to prevent inconsistent metadata.
