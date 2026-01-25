# Effect Schema Transformation Factory Pattern Design

## Overview

Design for the `makeSanitizeSchema` factory function that creates a transformation schema for HTML sanitization.

**Key Decision**: Use `S.transformOrFail` for operations that can fail (like HTML sanitization), not `S.transform`.

---

## 1. S.transform vs S.transformOrFail Comparison

### S.transform (Infallible)

**Purpose**: For transformations that CANNOT fail (pure mappings, coercions).

**Signature**:
```typescript
export const transform: {
  <To extends Schema.Any, From extends Schema.Any>(
    from: From,
    to: To,
    options: {
      readonly decode: (fromA: Schema.Type<From>) => Schema.Encoded<To>,
      readonly encode: (toI: Schema.Encoded<To>) => Schema.Type<From>
    }
  ): SchemaClass<...>
}
```

**Use Cases**:
- Type coercion (string → number)
- Format conversion (Date → ISO string)
- Brand application (string → branded string)

### S.transformOrFail (Effectful)

**Purpose**: For transformations that CAN fail or need async/effect context.

**Signature**:
```typescript
export const transformOrFail: {
  <To extends Schema.Any, From extends Schema.Any, RD, RE>(
    from: From,
    to: To,
    options: {
      readonly decode: (
        fromA: Schema.Type<From>,
        options: ParseOptions,
        ast: AST.Transformation
      ) => Effect.Effect<Schema.Encoded<To>, ParseResult.ParseIssue, RD>,
      readonly encode: (
        toI: Schema.Encoded<To>,
        options: ParseOptions,
        ast: AST.Transformation
      ) => Effect.Effect<Schema.Type<From>, ParseResult.ParseIssue, RE>
    }
  ): SchemaClass<...>
}
```

**Decision for sanitize-html**: Use `S.transformOrFail` because:
1. Sanitization can fail on deeply malformed HTML
2. Allows Effect-based error handling
3. Future-proof for async validation scenarios

---

## 2. Recommended Error Handling Approach

### Pattern: Wrap Third-Party Errors as ParseResult.ParseIssue

```typescript
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import sanitizeHtml from "sanitize-html";

class SanitizationError extends S.TaggedError<SanitizationError>()(
  "SanitizationError",
  {
    message: S.String,
    input: S.Union(S.String, S.Number, S.Null, S.Undefined),
    cause: S.optional(S.Unknown)
  }
) {}

const safeSanitize = (
  dirty: string | number | null | undefined,
  config: SanitizeConfig.Type,
  ast: AST.Transformation
): Effect.Effect<string, ParseResult.ParseIssue> =>
  Effect.gen(function* () {
    // Handle null/undefined early
    if (dirty == null) {
      return "";
    }

    // Coerce numbers to strings
    const input = typeof dirty === "number" ? String(dirty) : dirty;

    try {
      return sanitizeHtml(input, config);
    } catch (error) {
      // Wrap sanitize-html errors as ParseResult.Type
      return yield* ParseResult.fail(
        new ParseResult.Type(
          ast,
          input,
          `HTML sanitization failed: ${error instanceof Error ? error.message : String(error)}`
        )
      );
    }
  });
```

**Why ParseResult.Type?**
- Integrates with Effect's schema validation pipeline
- Provides structured error information (AST, input value, message)
- Allows Effect.catchTag for typed error handling

---

## 3. Complete Factory Function Implementation

```typescript
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import sanitizeHtml from "sanitize-html";

// 1. Define input schema (accept multiple types)
const DirtyHtml = S.Union(S.String, S.Number, S.Null, S.Undefined);

// 2. Define output schema (branded type)
export const SanitizedHtml = S.String.pipe(
  S.brand("SanitizedHtml")
).annotations({
  identifier: "SanitizedHtml",
  title: "Sanitized HTML",
  description: "HTML string that has been sanitized to remove dangerous content"
});

export type SanitizedHtml = S.Schema.Type<typeof SanitizedHtml>;

// 3. Factory function with closure over config
export const makeSanitizeSchema = (
  config: SanitizeConfig.Type
): S.Schema<SanitizedHtml, string | number | null | undefined> =>
  S.transformOrFail(
    DirtyHtml,
    SanitizedHtml,
    {
      strict: true,  // Enforce exact schema match
      decode: (dirty, _options, ast) =>
        Effect.gen(function* () {
          // Handle null/undefined
          if (dirty == null) {
            return "" as SanitizedHtml;
          }

          // Coerce numbers to strings
          const input = typeof dirty === "number" ? String(dirty) : dirty;

          // Sanitize with error handling
          try {
            const clean = sanitizeHtml(input, toSanitizeHtmlOptions(config));
            return clean as SanitizedHtml;
          } catch (error) {
            return yield* ParseResult.fail(
              new ParseResult.Type(
                ast,
                input,
                `HTML sanitization failed: ${error instanceof Error ? error.message : String(error)}`
              )
            );
          }
        }),

      // Encoding: branded type → original input type
      encode: (sanitized) => Effect.succeed(sanitized)
    }
  );
```

---

## 4. Configuration Closure Best Practices

### Pattern: Immutable Closure

The factory function closes over the `config` parameter. This is safe because:

1. **Config is immutable**: `SanitizeConfig.Type` is created via Schema, ensuring immutability
2. **No shared mutable state**: Each `makeSanitizeSchema()` call creates a NEW schema instance
3. **Performance**: Config is captured once, no repeated validation

### Example Usage

```typescript
import * as S from "effect/Schema";

// Define config once
const strictConfig = new SanitizeConfig({
  allowedTags: { _tag: "AllowSpecific", tags: ["p", "br", "strong"] },
  allowedAttributes: { _tag: "AllowSpecific", byTag: { a: ["href"] } },
  allowedSchemes: { _tag: "AllowSpecific", schemes: ["https"] }
});

// Create schema with captured config
const StrictSanitizeSchema = makeSanitizeSchema(strictConfig);

// Use in other schemas
const UserBio = S.Struct({
  name: S.String,
  bio: StrictSanitizeSchema  // Reusable schema
});
```

---

## 5. Edge Case Handling

### Null and Undefined Inputs

**Behavior**: Coerce to empty string (safest default).

```typescript
S.decodeUnknownSync(schema)(null)       // "" (empty string)
S.decodeUnknownSync(schema)(undefined)  // "" (empty string)
```

**Rationale**: Prevents propagating `null` into HTML contexts where it would render as "null" string.

### Number Inputs

**Behavior**: Coerce to string before sanitization.

```typescript
S.decodeUnknownSync(schema)(42)   // "42"
S.decodeUnknownSync(schema)(3.14) // "3.14"
```

**Rationale**: Numbers are safe to render in HTML. String conversion prevents type errors.

### Empty String Inputs

**Behavior**: Pass through unchanged.

```typescript
S.decodeUnknownSync(schema)("")  // ""
```

### Malformed HTML

**Behavior**: Sanitize to best effort, fail on unrecoverable errors.

```typescript
S.decodeUnknownSync(schema)("<p>Unclosed")  // "<p>Unclosed</p>" (auto-close)
S.decodeUnknownSync(schema)("<script>")     // "" (remove disallowed tag)
```

---

## 6. Performance Considerations

### Closure Overhead

**Impact**: Minimal. Each `makeSanitizeSchema()` call creates one schema instance. Config is captured in closure, no runtime validation on decode.

**Benchmark Estimate**:
- Schema creation: ~1ms (one-time cost)
- Decode call: ~0.1ms + sanitize-html time

### Sanitization Performance

**sanitize-html** performance:
- Small HTML (<1KB): ~1-5ms
- Medium HTML (1-10KB): ~5-20ms
- Large HTML (>10KB): ~20-100ms

### Caching Recommendation

```typescript
// GOOD - Cache at module level
export const StrictSanitize = makeSanitizeSchema(strictConfig);

// AVOID - Recreating schema on every use
const UserSchema = S.Struct({
  bio: makeSanitizeSchema(strictConfig)  // Creates new schema instance each time
});
```

---

## 7. Integration with beep-effect Patterns

### Using with BS Helpers

```typescript
import { BS } from "@beep/schema";

const UserProfile = S.Struct({
  bio: BS.FieldOptionOmittable(makeSanitizeSchema(publicConfig)),
  privateNotes: BS.FieldSensitiveOptionOmittable(
    makeSanitizeSchema(restrictiveConfig)
  )
});
```

### Effect.gen Integration

```typescript
const processUserInput = (dirty: string) =>
  Effect.gen(function* () {
    const schema = makeSanitizeSchema(config);
    const clean = yield* S.decode(schema)(dirty);

    // clean is typed as SanitizedHtml
    return yield* saveToDatabase(clean);
  });
```

### Error Handling with Effect.catchTag

```typescript
const safeProcess = (input: unknown) =>
  Effect.gen(function* () {
    return yield* S.decode(schema)(input);
  }).pipe(
    Effect.catchTag("ParseError", (error) =>
      Effect.logError("Sanitization failed", error).pipe(
        Effect.as("")  // Fallback to empty string
      )
    )
  );
```

---

## 8. Config-to-Runtime Transformation

### toSanitizeHtmlOptions Helper

```typescript
import * as Match from "effect/Match";
import type sanitizeHtml from "sanitize-html";

const toSanitizeHtmlOptions = (
  config: SanitizeConfig
): sanitizeHtml.IOptions => ({
  allowedTags: Match.value(config.allowedTags).pipe(
    Match.when({ _tag: "AllowAll" }, () => false),
    Match.when({ _tag: "AllowSpecific" }, ({ tags }) => tags),
    Match.orElse(() => undefined)
  ),
  allowedAttributes: Match.value(config.allowedAttributes).pipe(
    Match.when({ _tag: "AllowAll" }, () => false),
    Match.when({ _tag: "AllowSpecific" }, ({ byTag }) => byTag),
    Match.orElse(() => undefined)
  ),
  allowedSchemes: Match.value(config.allowedSchemes).pipe(
    Match.when({ _tag: "AllowAll" }, () => false),
    Match.when({ _tag: "AllowSpecific" }, ({ schemes }) => schemes),
    Match.orElse(() => undefined)
  ),
  allowProtocolRelative: config.allowProtocolRelative,
  // ... remaining fields
});
```

---

## Summary

**Key Decisions**:

1. **Use `S.transformOrFail`** for sanitization (can fail)
2. **Wrap errors as `ParseResult.Type`** for Effect integration
3. **Close over immutable config** in factory function
4. **Handle null/undefined → empty string** coercion
5. **Brand output type** as `SanitizedHtml` for type safety
6. **Cache schemas at module level** for performance

**References**:
- `packages/iam/domain/src/BetterAuthToMember.ts` - transformOrFail example
- `packages/common/schema/src/primitives/network/url.ts` - Brand + validation
- `.claude/rules/effect-patterns.md` - Schema conventions
