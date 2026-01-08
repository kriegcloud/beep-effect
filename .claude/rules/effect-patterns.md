---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# Effect Patterns

## Namespace Imports (REQUIRED)

ALWAYS use namespace imports for Effect modules:

```typescript
// Core Effect modules - full namespace
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as Struct from "effect/Struct";
import * as Cause from "effect/Cause";
```

## Single-Letter Aliases (REQUIRED)

Use abbreviated aliases for frequently used modules:

```typescript
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

## PascalCase Constructors (REQUIRED)

ALWAYS use PascalCase exports from Schema and other modules:

```typescript
// REQUIRED - PascalCase constructors
S.Struct({ name: S.String })
S.Array(S.Number)
S.String
S.Number
S.Boolean
S.Literal("active", "inactive")
S.Union(S.String, S.Number)
```

NEVER use lowercase constructors:

```typescript
// FORBIDDEN
S.struct({ name: S.string })  // Wrong!
S.array(S.number)              // Wrong!
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

## Native Method Ban

NEVER use native JavaScript array/string methods. Route ALL operations through Effect utilities:

```typescript
// FORBIDDEN
array.map(x => x + 1)
string.split(",")
array.filter(x => x > 0)

// REQUIRED
A.map(array, x => x + 1)
Str.split(string, ",")
A.filter(array, x => x > 0)
```
