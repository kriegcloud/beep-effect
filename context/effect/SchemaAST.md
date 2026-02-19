# SchemaAST — Agent Context

> Quick reference for AI agents working with `effect/SchemaAST`

## Quick Reference

| Type/Function | Purpose | Example |
|---------------|---------|---------|
| `AST.AST` | Base AST type for all schema nodes | `ast: AST.AST` parameter |
| `AST.ParseOptions` | Schema parsing options | `options?: AST.ParseOptions` |
| `AST.BrandAnnotationId` | Symbol for brand annotations | `ast.annotations[AST.BrandAnnotationId]` |
| `AST.IdentifierAnnotationId` | Symbol for identifier annotations | `annotations[AST.IdentifierAnnotationId]` |
| `AST.TitleAnnotationId` | Symbol for title annotations | `annotations[AST.TitleAnnotationId]` |
| `AST.MessageAnnotationId` | Symbol for custom error messages | `annotations[AST.MessageAnnotationId]` |

## Codebase Patterns

### Custom Transformation with AST Context

The AST parameter is REQUIRED in all `S.transformOrFail` callbacks to provide error location context:

```typescript
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";

// Real usage from @beep/iam-client/_internal/transformation-helpers.ts
export const requireField = <T extends object>(
  obj: T,
  key: string,
  ast: AST.AST  // AST provides error context
): Effect.Effect<unknown, ParseResult.Type> => {
  if (!P.hasProperty(obj, key)) {
    return Effect.fail(
      new ParseResult.Type(ast, obj, `Missing required field: "${key}"`)
    );
  }
  return Effect.succeed((obj as Record<string, unknown>)[key]);
};
```

### EntityId Schema with Custom Annotations

Custom annotations use AST annotation IDs to extend schema metadata:

```typescript
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import { mergeSchemaAnnotations } from "@beep/schema/core/annotations/built-in-annotations";

// Real usage from @beep/schema/identity/entity-id/entity-id.ts
export function makeEntityIdSchema<
  const TableName extends string,
  const Brand extends string,
  const LinkedActions extends A.NonEmptyReadonlyArray<string>,
>(
  tableName: SnakeTag.Literal<TableName>,
  brand: Brand,
  actions: LinkedActions,
  annotations?: S.Annotations.Schema<EntityId.Type<TableName>>,
  ast?: AST.AST | undefined  // Optional custom AST
): EntityId<TableName, Brand, LinkedActions> {
  const { publicSchema, privateSchema } = makeBaseSchemas(tableName, brand);

  const schemaAST = ast ?? publicSchema.ast;  // Use custom AST or default

  const defaultAST = mergeSchemaAnnotations(schemaAST, defaultAnnotations);

  class BaseClass extends S.make<S.Schema.Type<EntityId.PublicIdSchema<TableName>>>(defaultAST) {
    static override annotations(annotations: S.Annotations.Schema<...>) {
      const mergedAnnotations = { /* ... */ };

      // Recursively merge annotations into AST
      return makeEntityIdSchema(
        tableName,
        brand,
        actions,
        mergedAnnotations,
        mergeSchemaAnnotations(defaultAST, mergedAnnotations)
      );
    }
  }

  return BaseClass;
}
```

### Accessing Schema AST in Runtime Code

Access the underlying AST when you need to inspect schema structure:

```typescript
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";

const MySchema = S.Struct({
  id: S.String,
  name: S.String,
});

// Access the AST
const ast: AST.AST = MySchema.ast;

// Check for annotations
const identifier = ast.annotations[AST.IdentifierAnnotationId];
const title = ast.annotations[AST.TitleAnnotationId];
```

### ParseOptions in Decode Operations

`AST.ParseOptions` control how schemas are parsed:

```typescript
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";

// Real usage from @beep/schema/identity/entity-id/entity-id.ts
export const make = (
  id: string,
  options?: undefined | AST.ParseOptions  // Optional parse options
) =>
  options
    ? S.decodeUnknownSync(publicSchema, options)(id)
    : S.decodeUnknownSync(publicSchema)(id);
```

### Type-Level AST Manipulation

TypeScript utility types for working with AST structures:

```typescript
import type * as AST from "effect/SchemaAST";

// From @beep/schema/identity/entity-id/entity-id.ts
export type AppendType<Template extends string, Next> =
  Next extends AST.LiteralValue
    ? `${Template}${Next}`
    : Next extends S.Schema<infer A extends AST.LiteralValue, infer _I, infer _R>
      ? `${Template}${A}`
      : never;
```

## Anti-Patterns

### NEVER: Omit the AST parameter in transformOrFail

```typescript
// FORBIDDEN - Missing AST loses error context
S.transformOrFail(From, To, {
  decode: (value, options) => {  // ❌ Missing ast parameter
    return ParseResult.fail(new Error("Invalid"));
  }
});

// REQUIRED - Always accept and use ast
S.transformOrFail(From, To, {
  decode: (value, options, ast) => {  // ✅ ast parameter
    return ParseResult.fail(
      new ParseResult.Type(ast, value, "Invalid")
    );
  }
});
```

### NEVER: Mutate AST directly

```typescript
// FORBIDDEN - AST should be immutable
const schema = S.String;
schema.ast.annotations["myKey"] = "value";  // ❌ Direct mutation

// REQUIRED - Use schema.annotations() API
const annotatedSchema = S.String.annotations({
  identifier: "MyString",
  description: "Custom string schema",
});  // ✅ Returns new schema
```

### NEVER: Access internal AST properties

```typescript
// FORBIDDEN - Internal AST structure is unstable
if (ast._tag === "TypeLiteral") {  // ❌ Accessing internal _tag
  // ...
}

// REQUIRED - Use public annotation IDs
const identifier = ast.annotations[AST.IdentifierAnnotationId];  // ✅ Public API
```

## Related Modules

- [Schema](./Schema.md) — Schema definition and validation
- [ParseResult](./ParseResult.md) — Parse error handling

## Source Reference

[.repos/effect/packages/effect/src/SchemaAST.ts](../../.repos/effect/packages/effect/src/SchemaAST.ts)
