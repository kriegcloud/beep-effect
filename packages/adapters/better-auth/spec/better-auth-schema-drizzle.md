# Mapping Drizzle Tables to Better Auth Plugin Schemas

Author: adapters/better-auth

Status: Research + Implementation Plan (ready to implement)

This doc proposes a reusable utility that converts Drizzle table definitions into Better Auth plugin `schema` configs. We focus on the Organization plugin first and generalize the approach for Member, Invitation, Team, TeamMember, and OrganizationRole. The goal is to replace ad-hoc schema wiring in `Auth.service.ts` with a type-directed generator.

References to current code:

- Drizzle table: `packages/shared/tables/src/organization.table.ts`
- Manual schema in Better Auth service: `packages/adapters/better-auth/src/Auth.service.ts` lines 120–193
- Local Better Auth type facades: `packages/adapters/better-auth/src/lib/better-auth.types.ts`

External docs (Context7):

- Better Auth Organization plugin schema customization
  - Map table and column names + add additional fields
  - https://github.com/better-auth/better-auth/blob/canary/docs/content/docs/plugins/organization.mdx#L1
  - Example: modelName and fields mapping
    - https://github.com/better-auth/better-auth/blob/canary/docs/content/docs/plugins/organization.mdx#_snippet_59
    - Additional fields example
    - https://github.com/better-auth/better-auth/blob/canary/docs/content/docs/plugins/organization.mdx#_snippet_60
  - Base model field sets for Organization/Member/Invitation/Team
    - Organization: https://github.com/better-auth/better-auth/blob/canary/docs/content/docs/plugins/organization.mdx#_snippet_52
    - Member: https://github.com/better-auth/better-auth/blob/canary/docs/content/docs/plugins/organization.mdx#_snippet_53
    - Invitation: https://github.com/better-auth/better-auth/blob/canary/docs/content/docs/plugins/organization.mdx#_snippet_54 and optional teamId: #_snippet_55

- Drizzle table introspection
  - `getTableColumns(table)`: https://github.com/drizzle-team/drizzle-orm/blob/main/docs/table-introspect-api.md#_snippet_1
  - `getTableConfig(table)`: https://github.com/drizzle-team/drizzle-orm/blob/main/docs/table-introspect-api.md#_snippet_0


## Problem

We currently hardcode Better Auth plugin `schema` additional fields for Organization and Member inside `packages/adapters/better-auth/src/Auth.service.ts`. This is brittle and duplicates truth already encoded in Drizzle tables like `packages/shared/tables/src/organization.table.ts`.

We want a generic mapper:

- Input: a Drizzle `pgTable` (and optional overrides)
- Output: Better Auth plugin `schema` fragment with:
  - `modelName` (from table name)
  - `fields` remappings for the plugin’s base fields (e.g., `name`, `slug`, …)
  - `additionalFields` for extra columns with inferred type metadata


## Better Auth schema recap

Organization plugin `schema` shape (simplified):

```ts
schema?: {
  session?: {
    fields?: {
      activeOrganizationId?: string;
      activeTeamId?: string;
    };
  };
  organization?: {
    modelName?: string;
    fields?: { [K in keyof Omit<Organization, 'id'>]?: string };
    additionalFields?: { [key: string]: FieldAttribute };
  };
  member?: {
    modelName?: string;
    fields?: { [K in keyof Omit<Member, 'id'>]?: string };
    additionalFields?: { [key: string]: FieldAttribute };
  };
  invitation?: { /* same pattern */ };
  team?: { /* same pattern */ };
  teamMember?: { /* same pattern */ };
  organizationRole?: { /* same pattern */ };
};
```

FieldAttribute (local copy from `better-auth`):

```ts
type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | `${'string' | 'number'}[]`
  | Array<string>; // literal string array for enums

type FieldAttribute<T extends FieldType = FieldType> = {
  type: T;
  required?: boolean;
  returned?: boolean;
  input?: boolean;
  defaultValue?: unknown | (() => unknown);
  transform?: { input?: (v: unknown) => unknown; output?: (v: unknown) => unknown };
  references?: { model: string; field: string; onDelete?: 'no action' | 'restrict' | 'cascade' | 'set null' | 'set default' };
  unique?: boolean;
  bigint?: boolean;
  fieldName?: string; // actual DB column name
  sortable?: boolean;
};
```


## Mapping strategy (Drizzle -> Better Auth FieldAttribute)

- __Type mapping__
  - `text/varchar/uuid`: `type: 'string'`
  - `integer/numeric/real/double`: `type: 'number'`
  - `bigint`: `type: 'number', bigint: true` (Better Auth uses a flag)
  - `boolean`: `type: 'boolean'`
  - `timestamp/date`: `type: 'date'`
  - `json/jsonb`: `type: 'string'`
    - Optionally add `transform.input = JSON.stringify` and `transform.output = JSON.parse`
  - `enum`: `type: ['value1', 'value2', ...]` (literal strings array)
  - Arrays: `varchar().array()` -> `type: 'string[]'`; numeric arrays -> `type: 'number[]'`

- __Requiredness__
  - `required: column.notNull && !column.hasDefault`

- __Field name__
  - `fieldName: column.name` (DB column name)

- __References/unique__ (best-effort)
  - From `getTableConfig(table).foreignKeys` → attach `references` when FK targets are available
  - From `getTableConfig(table).indexes` → set `unique` if a unique index strictly covers the column

- __Model name__
  - From `getTableConfig(table).name`

- __Base `fields` remapping__
  - The plugin defines model base fields (e.g., Organization has: `name`, `slug`, `logo`, `metadata`, `createdAt`). If our table uses different column names, map via `fields: { name: 'title' }`, etc. When names match, we can omit or emit identity mapping.


## Placement and boundaries

- Put the generator in `packages/adapters/better-auth/src/schema/` (adapter layer, infra-oriented, no domain imports).
- Input must be Drizzle table objects from `packages/**/tables/` packages or slice tables.
- Do not import slice domain/application layers (respect vertical slice boundaries).


## Proposed API

We provide low-level and high-level helpers.

```ts
// packages/adapters/better-auth/src/schema/drizzle-to-better-auth.ts
import type { AnyPgTable } from 'drizzle-orm/pg-core';
import { getTableColumns, getTableConfig } from 'drizzle-orm/pg-core';
import type { FieldAttribute } from '@beep/better-auth/lib/better-auth.types';

export type ColumnPredicate = (name: string) => boolean;

export type ModelBaseFields = ReadonlyArray<string>;

export type BuildOptions = {
  // map of base field names to a predicate that finds the matching column
  baseFieldFinders?: Record<string, ColumnPredicate>;
  // explicit overrides for fields/additionalFields by column name
  overrides?: Partial<Record<string, FieldAttribute | false>>; // false to skip
  // whether to include identity mappings for base fields whose names match
  includeIdentityBaseFields?: boolean;
};

export type BuiltModelSchema = {
  modelName: string;
  fields?: Record<string, string>;
  additionalFields?: Record<string, FieldAttribute>;
};

export function buildModelSchemaFromTable(
  table: AnyPgTable,
  baseFields: ModelBaseFields,
  options: BuildOptions = {}
): BuiltModelSchema {
  const config = getTableConfig(table);
  const cols = getTableColumns(table);

  const columnEntries = Object.entries(cols) as Array<[
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  ]>;

  // 1) infer additionalFields for all columns
  const additionalFields: Record<string, FieldAttribute> = {};
  for (const [key, col] of columnEntries) {
    const attr = inferFieldAttribute(key, col, config);
    if (attr) additionalFields[key] = attr;
  }

  // 2) compute fields (base model fields -> actual column names)
  const fields: Record<string, string> = {};
  for (const base of baseFields) {
    const finder = options.baseFieldFinders?.[base] ?? ((n: string) => n === base);
    const match = columnEntries.find(([name]) => finder(name));
    if (match) {
      const [colName] = match;
      fields[base] = colName;
      // base fields live in `fields`, remove from `additionalFields`
      delete additionalFields[colName];
    } else if (options.includeIdentityBaseFields) {
      // optionally keep identity even when absent (rare)
      fields[base] = base;
    }
  }

  // 3) apply overrides (replace or drop)
  if (options.overrides) {
    for (const [k, v] of Object.entries(options.overrides)) {
      if (v === false) {
        delete additionalFields[k];
        continue;
      }
      if (v) additionalFields[k] = v;
    }
  }

  return {
    modelName: config.name,
    fields: Object.keys(fields).length ? fields : undefined,
    additionalFields: Object.keys(additionalFields).length ? additionalFields : undefined,
  };
}

// --- internals ---
function inferFieldAttribute(
  key: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  col: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any
): FieldAttribute | undefined {
  const t = inferFieldType(col);
  if (!t) return undefined;

  const required = !!col.notNull && !col.hasDefault;
  const attr: FieldAttribute = { type: t as FieldAttribute['type'], required, fieldName: col.name };

  // bigint
  if (col.dataType === 'bigint') attr.bigint = true;

  // enums
  if (Array.isArray(col.enumValues) && col.enumValues.length) {
    attr.type = [...col.enumValues];
  }

  // json/jsonb convenience
  if (col.dataType === 'json') {
    attr.transform = {
      input: (v) => (typeof v === 'string' ? v : JSON.stringify(v)),
      output: (v) => {
        try {
          return typeof v === 'string' ? JSON.parse(v) : v;
        } catch {
          return v;
        }
      },
    };
  }

  // references and unique (best-effort)
  tryAttachReferencesAndUnique(attr, key, config);

  return attr;
}

function inferFieldType(col: any): FieldAttribute['type'] | undefined {
  // enum handled outside via enumValues
  switch (col.dataType) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'bigint':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'date':
      return 'date';
    case 'json':
      return 'string';
    case 'array': {
      const base = (col.baseColumn?.dataType ?? 'string') as string;
      return base === 'number' || base === 'bigint' ? 'number[]' : 'string[]';
    }
    default:
      // Drizzle-specific types:
      // - PgUUID → treat as string
      if (col.columnType === 'PgUUID' || col.dataType === undefined) return 'string';
      return undefined;
  }
}

function tryAttachReferencesAndUnique(attr: FieldAttribute, key: string, config: any) {
  // foreign keys
  for (const fk of config.foreignKeys ?? []) {
    const colNames: string[] = fk.columns?.map((c: any) => c.name) ?? [];
    if (colNames.includes(key)) {
      const referenced = fk.foreignTable?.[1]?.name ?? fk.foreignTable?.[0]?.name ?? fk.foreignTable?.name;
      const refCols: string[] = fk.ref?.map((c: any) => c.name) ?? [];
      attr.references = {
        model: String(referenced ?? ''),
        field: String(refCols[0] ?? 'id'),
        onDelete: fk.onDelete ?? undefined,
      };
    }
  }

  // unique index (simple case: single-column unique index)
  for (const idx of config.indexes ?? []) {
    if (!idx.config?.unique) continue;
    const idxCols: string[] = idx.config?.columns?.map((c: any) => c.name) ?? [];
    if (idxCols.length === 1 && idxCols[0] === key) {
      attr.unique = true;
    }
  }
}
```

High-level helpers for each Better Auth plugin model. You can keep these in a small registry to make usage ergonomic:

```ts
// packages/adapters/better-auth/src/schema/organization-schema.ts
import type { AnyPgTable } from 'drizzle-orm/pg-core';
import { buildModelSchemaFromTable } from './drizzle-to-better-auth';

// Base fields per docs (excluding `id` which is implicit)
const ORGANIZATION_BASE_FIELDS = ['name', 'slug', 'logo', 'metadata', 'createdAt'] as const;

export function buildOrganizationSchema(table: AnyPgTable) {
  return buildModelSchemaFromTable(table, ORGANIZATION_BASE_FIELDS as unknown as string[]);
}

const MEMBER_BASE_FIELDS = ['userId', 'organizationId', 'role', 'createdAt'] as const;
export function buildMemberSchema(table: AnyPgTable) {
  return buildModelSchemaFromTable(table, MEMBER_BASE_FIELDS as unknown as string[]);
}

const INVITATION_BASE_FIELDS = ['email', 'inviterId', 'organizationId', 'role', 'status', 'expiresAt'] as const;
export function buildInvitationSchema(table: AnyPgTable) {
  return buildModelSchemaFromTable(table, INVITATION_BASE_FIELDS as unknown as string[]);
}

const TEAM_BASE_FIELDS = ['name', 'organizationId', 'createdAt', 'updatedAt'] as const; // updatedAt optional per docs
export function buildTeamSchema(table: AnyPgTable) {
  return buildModelSchemaFromTable(table, TEAM_BASE_FIELDS as unknown as string[]);
}
```

Finally, build the plugin `schema` object from tables you provide:

```ts
// packages/adapters/better-auth/src/schema/index.ts
import type { AnyPgTable } from 'drizzle-orm/pg-core';
import type { BetterAuthOptions } from 'better-auth';
import { buildInvitationSchema, buildMemberSchema, buildOrganizationSchema, buildTeamSchema } from './organization-schema';

export type BetterAuthSchemaInput = Partial<{
  organization: AnyPgTable;
  member: AnyPgTable;
  invitation: AnyPgTable;
  team: AnyPgTable;
  teamMember: AnyPgTable;
  organizationRole: AnyPgTable;
}>;

export function betterAuthFromDomain(input: BetterAuthSchemaInput): NonNullable<BetterAuthOptions['plugins']>[number] extends infer T
  ? T extends { schema?: infer S } ? NonNullable<S> : never
  : never {
  return {
    ...(input.organization && { organization: buildOrganizationSchema(input.organization) }),
    ...(input.member && { member: buildMemberSchema(input.member) }),
    ...(input.invitation && { invitation: buildInvitationSchema(input.invitation) }),
    ...(input.team && { team: buildTeamSchema(input.team) }),
    // teamMember and organizationRole can be added similarly when tables exist
  } as any;
}
```


## Example usage (Organization)

Table: `packages/shared/tables/src/organization.table.ts` exposes `organization` with columns like `type`, `ownerUserId`, `isPersonal`, `maxMembers`, `features`, `settings`, `subscriptionTier`, `subscriptionStatus`, `deletedAt`, plus base fields like `name`, `slug`, `logo`, `metadata`, `createdAt`.

Replace manual config in `packages/adapters/better-auth/src/Auth.service.ts` with:

```ts
import { betterAuthFromDomain } from '@beep/better-auth/schema';
import { organization as OrganizationTable } from '@beep/shared-tables/organization.table';

// ... inside betterAuth({ plugins: [ organization({ ... }) ] })
organization({
  schema: betterAuthFromDomain({ organization: OrganizationTable }),
  // other plugin options (teams, hooks, etc.)
})
```

This will infer:

- `modelName: 'organization'`
- `fields: { name, slug, logo, metadata, createdAt }` (only if names differ; identity mapping may be omitted)
- `additionalFields`: entries for `type`, `ownerUserId`, `isPersonal`, `maxMembers`, `features`, `settings`, `subscriptionTier`, `subscriptionStatus`, `deletedAt`, etc., with `type`, `required`, `bigint`, `references`, and `unique` inferred.

If you need to force JSON stringify/parse on `features`/`settings`, either keep the default transform added for `json/jsonb` columns or override:

```ts
buildModelSchemaFromTable(OrganizationTable, ['name', 'slug', 'logo', 'metadata', 'createdAt'], {
  overrides: {
    features: { type: 'string', required: false }, // drop transform if you store plain strings
  },
});
```


## Session fields

If you store organization context in session (e.g., `activeOrganizationId`, `activeTeamId`), you can wire it directly since these are not derived from Drizzle tables:

```ts
organization({
  schema: {
    ...betterAuthFromDomain({ organization: OrganizationTable }),
    session: { fields: { activeOrganizationId: 'activeOrganizationId', activeTeamId: 'activeTeamId' } },
  },
});
```


## Testing strategy

- __Unit tests__ (Vitest) in `packages/adapters/better-auth/src/schema/__tests__/`:
  - Given a minimal mock `pgTable`, assert `modelName` is from `getTableConfig(table).name`.
  - Assert type mapping cases (string, number, bigint, boolean, date, json/jsonb with transform, enum, arrays).
  - Assert `required` follows `notNull && !hasDefault`.
  - Assert base field extraction moves those columns out of `additionalFields`.
  - Assert overrides can drop or replace field attributes.
  - Assert FK and unique inference when present in `getTableConfig(table)`.

- __Integration smoke__ in `apps/server` auth boot:
  - Swap the manual schema with `betterAuthFromDomain({ organization: IamDbSchema.organization, member: IamDbSchema.member, ... })` and ensure server starts and can create orgs/members.


## Notes, limitations, and decisions

- Drizzle runtime metadata varies by driver; we rely on `dataType`, `enumValues`, and `baseColumn` patterns used across PG. Adjust if we generalize to MySQL/SQLite.
- Defaults: we generally can’t read server-side default expressions; we only know if a default exists (`hasDefault`).
- Unique/References: best-effort from `getTableConfig`. Complex composite indexes/foreign keys aren’t fully represented in per-column attributes.
- JSON columns: Better Auth lacks native `json` type; representing as `string` is the safest default. We add serialize/parse transforms by default; opt out with overrides if your column stores plain strings.
- Keep this in adapters; do not import domain/application layers (repo rule: vertical slice boundaries).


## Useful links

- Organization plugin schema customization (modelName/fields/additionalFields):
  - https://github.com/better-auth/better-auth/blob/canary/docs/content/docs/plugins/organization.mdx#_snippet_59
  - https://github.com/better-auth/better-auth/blob/canary/docs/content/docs/plugins/organization.mdx#_snippet_60

- Base schemas for plugin models:
  - Organization: https://github.com/better-auth/better-auth/blob/canary/docs/content/docs/plugins/organization.mdx#_snippet_52
  - Member: https://github.com/better-auth/better-auth/blob/canary/docs/content/docs/plugins/organization.mdx#_snippet_53
  - Invitation: https://github.com/better-auth/better-auth/blob/canary/docs/content/docs/plugins/organization.mdx#_snippet_54
  - Teams: https://github.com/better-auth/better-auth/blob/canary/docs/content/docs/plugins/organization.mdx#_snippet_57

- Drizzle introspection:
  - getTableColumns: https://github.com/drizzle-team/drizzle-orm/blob/main/docs/table-introspect-api.md#_snippet_1
  - getTableConfig: https://github.com/drizzle-team/drizzle-orm/blob/main/docs/table-introspect-api.md#_snippet_0


## Next steps (implementation plan)

- __Create__ `packages/adapters/better-auth/src/schema/drizzle-to-better-auth.ts` and `packages/adapters/better-auth/src/schema/organization-schema.ts` with the code sketches above.
- __Add tests__ under `packages/adapters/better-auth/src/schema/__tests__/`.
- __Wire in__ `Auth.service.ts` to call `betterAuthFromDomain({ organization: IamDbSchema.organization, member: IamDbSchema.member, ... })` and remove manual schema duplication.
- __Iterate__ for `team`, `teamMember`, `organizationRole` once tables exist.