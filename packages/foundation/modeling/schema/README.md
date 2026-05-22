# @beep/schema

Reusable Effect Schema substrate for the repo.

`@beep/schema` is a `foundation/modeling` package. It owns domain-agnostic
schemas, codecs, schema combinators, typed schema errors, and schema-adjacent
modeling helpers that slices, shared-kernel packages, drivers, and tooling may
reuse without taking product-domain dependencies.

## Topology

Canonical schema concept imports are namespace-first:

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

Root flat exports are convenience and compatibility, not the canonical home for
full concept namespaces.

Leaf concept modules use small role files:

```txt
src/Duration/
  Duration.schema.ts
  Duration.input.ts
  Duration.transforms.ts
  index.ts
```

Only `@beep/schema/<Concept>` is public for concept modules. Role files are
source topology. Utility namespaces such as `SchemaUtils` may expose helper
leaves when direct helper imports are the intended API.

Compatibility suite modules that still have lower-case source directories keep
their current source location while publishing canonical public subpaths:

```ts
import * as Color from "@beep/schema/Color"
import * as Csv from "@beep/schema/Csv"
import * as Http from "@beep/schema/Http"
```

Do not create case-only sibling source directories such as `src/Color/` beside
`src/color/`; physically moving those suites is a separate migration.

See `goals/beep-schema-topology` and `standards/ARCHITECTURE.md` for the
canonical migration plan and doctrine.

## Installation

```bash
bun add @beep/schema
```

## Usage

```ts
import * as Duration from "@beep/schema/Duration"
import * as S from "effect/Schema"

const decodeDuration = S.decodeUnknownEffect(Duration.FromInput)
console.log(decodeDuration)
```

## Development

```bash
# Build
bun run build

# Type check
bun run check

# Test
bun run test

# Lint
bun run lint:fix
```

## License

MIT
