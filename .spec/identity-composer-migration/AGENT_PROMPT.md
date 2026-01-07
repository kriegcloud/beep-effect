# Identity Composer Migration Exploration Agent

## Objective

Find all files in the assigned package directory that should be using the identity composer pattern but are NOT currently using it.

## The Pattern

The identity composer pattern requires:

1. **Import the package's identity composer** from `@beep/identity/packages`
2. **Create a `$I` constant** at the top of the file using `.create("relative/path/from/src")`
3. **Use `$I\`Name\`` tagged template** for identifiers in:
   - `Context.Tag()` - e.g., `Context.Tag($I\`Db\`)`
   - `Effect.Service<T>()()` - e.g., `Effect.Service<Repo>()($I\`Repo\`, {...})`
   - `S.Class<T>()()` - e.g., `S.Class<T>($I\`ClassName\`)({...})`
   - `M.Class<T>()()` - e.g., `M.Class<T>($I\`ModelName\`)({...})`
   - `S.TaggedError<T>()()` - e.g., `S.TaggedError<T>()($I\`ErrorName\`, {...})`
4. **Use `$I.annotations()` helper** for schema annotations

## What to Look For

### Files NOT using the pattern (violations):

```typescript
// BAD - hardcoded string identifiers
class Db extends Context.Tag("@beep/documents-server/Db")<Db, Shape>() {}

// BAD - using package name directly
export class CommentRepo extends Effect.Service<CommentRepo>()("@beep/documents-server/CommentRepo", {...}) {}

// BAD - S.Class without $I
export class Success extends S.Class<Success>("RevokeSessionsSuccess")({...}) {}

// BAD - M.Class without $I
export class Model extends M.Class<Model>("OrganizationModel")({...}) {}

// BAD - TaggedError without $I
export class MyError extends S.TaggedError<MyError>()("MyError", {...}) {}
```

### Files CORRECTLY using the pattern:

```typescript
import { $DocumentsServerId } from "@beep/identity/packages";
const $I = $DocumentsServerId.create("db/Db");

// GOOD - using $I tagged template
class Db extends Context.Tag($I`Db`)<Db, Shape>() {}

// GOOD - Effect.Service with $I
export class CommentRepo extends Effect.Service<CommentRepo>()($I`CommentRepo`, {...}) {}

// GOOD - S.Class with $I and annotations
export class Success extends S.Class<Success>($I`Success`)({...}, $I.annotations("Success", {...})) {}

// GOOD - M.Class with $I
export class Model extends M.Class<Model>($I`OrganizationModel`)({...}, $I.annotations(...)) {}
```

## Search Patterns

Use Grep to find potential violations:

1. **Context.Tag with string literal**: `Context\.Tag\("[^$]`
2. **Effect.Service with string literal**: `Effect\.Service.*\("[^$]`
3. **S.Class with string literal**: `S\.Class.*\("[^$]`
4. **M.Class with string literal**: `M\.Class.*\("[^$]`
5. **TaggedError with string literal**: `TaggedError.*\("[^$]`
6. **Schema.Class with string literal**: `Schema\.Class.*\("[^$]`

## Report Format

For each file with violations, record:

1. **File path** (absolute)
2. **Line number(s)**
3. **Violation type** (Context.Tag, Effect.Service, S.Class, M.Class, TaggedError)
4. **Current identifier** (the string being used)
5. **Suggested $I name** (what it should be)

Also check if the package has a corresponding identity composer in `packages/common/identity/src/packages.ts`.
If missing, note that a new composer needs to be added.

## Output Format

Create a markdown file with:

```markdown
# Identity Composer Migration Report: [Package Name]

## Package Composer Status
- Composer exists in packages.ts: YES/NO
- Required composer name: $XxxId

## Files Requiring Migration

### [filename.ts]
- **Path**: /full/path/to/file.ts
- **Violations**:
  | Line | Type | Current | Suggested |
  |------|------|---------|-----------|
  | 15 | Context.Tag | "@beep/pkg/Db" | $I\`Db\` |
  | 42 | Effect.Service | "@beep/pkg/Repo" | $I\`Repo\` |

### [another-file.ts]
...
```
