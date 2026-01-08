---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# Effect Import Conventions

## When to Use

Apply this skill when:
- Starting a new file that uses Effect
- Adding imports to existing Effect code
- Reviewing imports for consistency
- Setting up module aliases

## Required: Namespace Imports

Always use namespace imports for Effect modules:

```typescript
// Core Effect modules - full namespace
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as Struct from "effect/Struct";
import * as Cause from "effect/Cause";
```

## Required: Single-Letter Aliases

Use abbreviated aliases for frequently used modules:

```typescript
// Single-letter and short aliases
import * as A from "effect/Array";
import * as BI from "effect/BigInt";
import * as Num from "effect/Number";
import * as P from "effect/Predicate";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as B from "effect/Brand";
import * as Bool from "effect/Boolean";
import * as AST from "effect/SchemaAST";
import * as DateTime from "effect/DateTime";
import * as Match from "effect/Match";
import * as M from "@effect/sql/Model";
```

## Required: PascalCase Constructors

Always use PascalCase exports from Schema and other modules:

```typescript
// REQUIRED - PascalCase constructors
S.Struct({ name: S.String })
S.Array(S.Number)
S.String
S.Number
S.Boolean
S.Literal("active", "inactive")
S.Union(S.String, S.Number)

// FORBIDDEN - lowercase constructors
S.struct({ name: S.string })  // Wrong!
S.array(S.number)              // Wrong!
```

## Examples: Complete Import Block

```typescript
// Standard Effect imports for a typical file
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import * as P from "effect/Predicate";
import * as Match from "effect/Match";
import * as DateTime from "effect/DateTime";
import * as Struct from "effect/Struct";
import * as R from "effect/Record";
```

## Examples: Collection Imports

```typescript
// When using Effect collections
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
```

## Examples: Schema-Heavy File

```typescript
// For files with heavy schema work
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import * as B from "effect/Brand";
import * as M from "@effect/sql/Model";
```

## Alias Reference Table

| Module             | Alias      |
|--------------------|------------|
| effect/Array       | A          |
| effect/BigInt      | BI         |
| effect/Number      | Num        |
| effect/Predicate   | P          |
| effect/Function    | F          |
| effect/Option      | O          |
| effect/Record      | R          |
| effect/Schema      | S          |
| effect/String      | Str        |
| effect/Brand       | B          |
| effect/Boolean     | Bool       |
| effect/SchemaAST   | AST        |
| effect/DateTime    | DateTime   |
| effect/Match       | Match      |
| @effect/sql/Model  | M          |
