# ParseResult — Agent Context

> Quick reference for AI agents working with `effect/ParseResult`

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `ParseResult.fail` | Create a failed parse result | `ParseResult.fail(new ParseResult.Type(ast, value, "Invalid"))` |
| `ParseResult.succeed` | Create a successful parse result | `ParseResult.succeed(transformedValue)` |
| `ParseResult.Type` | Type mismatch error constructor | `new ParseResult.Type(ast, actual, message)` |
| `ParseResult.Missing` | Missing required field error | `new ParseResult.Missing()` |
| `ParseResult.Unexpected` | Unexpected field error | `new ParseResult.Unexpected(actual, message)` |

## Codebase Patterns

### Custom Transformation with Validation

The canonical pattern for `S.transformOrFail` uses `ParseResult.fail` and `ParseResult.succeed`:

```typescript
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";

// Real usage from @beep/build-utils/src/secure-headers/no-sniff.ts
export const NosniffHeaderSchema = S.transformOrFail(
  S.Union(NosniffOptionSchema, S.Undefined),
  NosniffResponseHeaderSchema,
  {
    strict: true,
    decode: (option, _, ast) => {
      if (option === undefined) {
        return ParseResult.succeed({ name: headerName, value: "nosniff" });
      }
      if (option === false) {
        return ParseResult.succeed({ name: headerName, value: undefined });
      }
      if (option === "nosniff") {
        return ParseResult.succeed({ name: headerName, value: "nosniff" });
      }
      return ParseResult.fail(
        new ParseResult.Type(ast, option, `Invalid value for ${headerName}: ${String(option)}`)
      );
    },
    encode: (header, _, ast) => {
      if (header.value === undefined) {
        return ParseResult.succeed(false as const);
      }
      if (header.value === "nosniff") {
        return ParseResult.succeed("nosniff" as const);
      }
      return ParseResult.fail(
        new ParseResult.Type(ast, header, `Cannot encode header value: ${header.value}`)
      );
    },
  }
);
```

### EntityId Validation in Transformation

When mapping external API responses to domain entities, use `ParseResult.Type` for branded ID validation:

```typescript
import { IamEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

// Real usage from @beep/iam-client/_internal/transformation-helpers.ts
export const DomainMemberFromBetterAuthMember = S.transformOrFail(
  BetterAuthMemberSchema,
  DomainMember.Model,
  {
    strict: true,
    decode: Effect.fn(function* (betterAuthMember, _options, ast) {
      // Validate branded EntityId format
      if (!IamEntityIds.MemberId.is(betterAuthMember.id)) {
        return yield* ParseResult.fail(
          new ParseResult.Type(ast, betterAuthMember.id, "Invalid member ID format")
        );
      }

      // ... rest of transformation
      return {
        id: betterAuthMember.id,
        // ... other fields
      };
    }),
  }
);
```

### Required Field Extraction with ParseResult

Helper pattern for extracting required fields from external API responses:

```typescript
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import type * as AST from "effect/SchemaAST";

// Real usage from @beep/iam-client/_internal/transformation-helpers.ts
const createMissingFieldIssue = (ast: AST.AST, obj: object, key: string): ParseResult.Type =>
  new ParseResult.Type(ast, obj, `Missing required field: "${key}"`);

const createTypeIssue = (ast: AST.AST, actual: unknown, message: string): ParseResult.Type =>
  new ParseResult.Type(ast, actual, message);

export const requireField = <T extends object>(
  obj: T,
  key: string,
  ast: AST.AST
): Effect.Effect<unknown, ParseResult.Type> => {
  if (!P.hasProperty(obj, key)) {
    return Effect.fail(createMissingFieldIssue(ast, obj, key));
  }
  return Effect.succeed((obj as Record<string, unknown>)[key]);
};

export const requireString = Effect.fn(function* <T extends object>(obj: T, key: string, ast: AST.AST) {
  const value = yield* requireField(obj, key, ast);
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== "string") {
    return yield* Effect.fail(createTypeIssue(ast, value, `Field "${key}" must be a string, got ${typeof value}`));
  }
  return value;
});
```

## Anti-Patterns

### NEVER: Use plain Error constructors

```typescript
// FORBIDDEN - ParseResult expects specific error types
S.transformOrFail(From, To, {
  decode: (value, _, ast) => {
    if (invalid(value)) {
      throw new Error("Invalid value");  // ❌ Wrong!
    }
    return value;
  }
});

// REQUIRED - Use ParseResult.fail with ParseResult.Type
S.transformOrFail(From, To, {
  decode: (value, _, ast) => {
    if (invalid(value)) {
      return ParseResult.fail(
        new ParseResult.Type(ast, value, "Invalid value")
      );  // ✅ Correct
    }
    return ParseResult.succeed(value);
  }
});
```

### NEVER: Ignore the AST parameter

```typescript
// FORBIDDEN - Missing AST context loses error location
S.transformOrFail(From, To, {
  decode: (value, options, ast) => {
    return ParseResult.fail(new Error("Bad"));  // ❌ No AST context
  }
});

// REQUIRED - Always pass ast to ParseResult.Type
S.transformOrFail(From, To, {
  decode: (value, options, ast) => {
    return ParseResult.fail(
      new ParseResult.Type(ast, value, "Invalid value")
    );  // ✅ AST provides error location
  }
});
```

### NEVER: Mix Promise rejection with ParseResult

```typescript
// FORBIDDEN - Mixing async/await with ParseResult
S.transformOrFail(From, To, {
  decode: async (value, _, ast) => {
    if (invalid(value)) {
      throw new Error("Bad");  // ❌ Wrong error type
    }
    return value;
  }
});

// REQUIRED - Use Effect.fn for async transformations
S.transformOrFail(From, To, {
  decode: Effect.fn(function* (value, _options, ast) {
    if (invalid(value)) {
      return yield* ParseResult.fail(
        new ParseResult.Type(ast, value, "Invalid value")
      );
    }
    return value;
  })
});
```

## Related Modules

- [Schema](./Schema.md) — Schema definition and validation
- [SchemaAST](./SchemaAST.md) — Schema AST manipulation for custom transformations

## Source Reference

[.repos/effect/packages/effect/src/ParseResult.ts](../../.repos/effect/packages/effect/src/ParseResult.ts)
