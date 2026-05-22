# @beep/schema Topology Specification

## Status

**ACTIVE**

## Mission

Make `@beep/schema` a consistent reusable schema substrate whose public modules
read like Effect modules while staying small enough for coding agents and humans
to navigate by file path.

## Canonical Public Surface

Reusable schema concepts publish flat concept subpaths:

```ts
import * as Duration from "@beep/schema/Duration"
import * as Glob from "@beep/schema/Glob"

Duration.Input
Duration.FromInput
Glob.Schema
```

The package root remains a curated flat facade:

```ts
import { DurationInput, Glob, TaggedErrorClass } from "@beep/schema"
```

Root flat exports are convenience and compatibility. They are not the canonical
home for full concept namespaces.

## Concept Folder Topology

Leaf concept modules live under `src/<Concept>/` when that does not create a
case-only sibling of existing source:

```txt
src/Duration/
  Duration.schema.ts
  Duration.input.ts
  Duration.transforms.ts
  index.ts
```

Role files are source topology, not public import paths. Public consumers import
the concept index only:

```ts
import * as Duration from "@beep/schema/Duration"
```

Do not make public consumers import role files such as
`@beep/schema/Duration/Input`.

Suite aggregators with existing lower-case source directories publish the
canonical public subpath directly from the existing suite index until the
underlying source is physically moved:

```jsonc
"./Color": "./src/color/index.ts",
"./Csv": "./src/csv/index.ts",
"./Dom": "./src/dom/index.ts"
```

Do not create `src/Color/` beside `src/color/`, `src/Http/` beside
`src/http/`, or any other case-only sibling. TypeScript treats those paths as a
single casing contract even on case-sensitive filesystems.

Do not create a module for every exported symbol. Promote source concepts:
schemas, schema suites, codecs, parser/formatter helpers, and typed errors.
For example, `HttpStatus` is one concept module; individual status literals do
not each get public subpaths.

## Role Suffix Catalog

Core role suffixes:

- `.schema.ts` - primary schema values, brands, and direct schema aliases
- `.input.ts` - boundary input schemas and input models
- `.transforms.ts` - transformation schemas and codecs
- `.constructors.ts` - construction helpers that are part of the schema concept
- `.guards.ts` - derived guards and predicates
- `.errors.ts` - typed schema/local errors
- `.types.ts` - type-level helpers with no runtime owner

Earned semantic roles are allowed when they are clearer than forcing the core
set. Examples include parser, formatter, SQL projection, or color-conversion
roles.

## Naming Grammar

Inside a concept namespace, concise role names are canonical:

```ts
Duration.Schema
Duration.Input
Duration.FromInput
Duration.Object
Duration.Unit
```

Legacy full names may remain as aliases while consumers migrate:

```ts
Duration.DurationInput
Duration.DurationFromInput
```

Simple primary schemas use `Schema` as the canonical role name and may retain a
same-name alias:

```ts
Glob.Schema
Glob.Glob
```

## Compatibility Policy

Migration is compatibility-first:

- Add canonical concept subpaths before removing old paths.
- Keep the root flat facade for current consumers.
- Keep legacy nested paths until their consumers and docs are migrated.
- Keep legacy acronym spellings as compatibility aliases where they already
  exist or are likely entrypoints, for example `ExpectCT` to `ExpectCt` and
  `XSSProtection` to `XssProtection`.
- Remove `./*` wildcard export reliance only after explicit canonical and
  compatibility subpaths exist.

## Acceptance Criteria

- `@beep/schema/<Concept>` resolves to a concept index for migrated concepts.
- New examples use namespace-first concept imports.
- Existing root imports continue to compile.
- Tests and dtslint cover canonical imports and root compatibility.
- `standards/ARCHITECTURE.md`, the architecture rationale packet, and this
  package's README agree on the topology.
