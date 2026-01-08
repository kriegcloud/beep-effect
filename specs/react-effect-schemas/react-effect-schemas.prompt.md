---
name: react-effect-schemas
version: 1
created: 2026-01-08T00:00:00Z
iterations: 1
---

# React Effect Schemas - Refined Prompt

## Context

The `beep-effect` codebase uses Effect Schema (`effect/Schema`) exclusively for runtime validation and type guards. There's an incomplete React node schema implementation at `packages/shared/ui/src/schemas/react-component-schema.ts` that contains a type guard function (`isReactComponent`) but is missing the full Effect Schema wrapper with composable annotations.

The codebase follows strict patterns for creating custom schemas with:
1. Rich, composable annotations (identifier, title, description, jsonSchema, arbitrary, pretty)
2. Static helper methods attached to schema classes
3. Package-scoped identifiers via `$PackageId.create()`
4. Consistent naming conventions and structure

**Current State:**
- Incomplete `isReactComponent` type guard exists using Effect predicates
- Missing the full `S.declare`-based schema with annotations
- Missing the class-based wrapper pattern used throughout the codebase

**Desired State:**
- Complete Effect Schema for React nodes (`ReactNode`)
- Follows the same patterns as `EntityId` and `Fn` schemas
- Rich annotations for documentation and tooling
- Exported through the BS namespace at `@beep/schema`

## Objective

Create a complete Effect Schema implementation for React's `ReactNode` type that:
1. Wraps the existing `isReactComponent` type guard in an `S.declare` schema
2. Provides composable annotations following project patterns
3. Exports a class-based schema with static helpers
4. Follows naming conventions from `packages/common/schema/src/primitives/function.ts`
5. Integrates with the existing `@beep/schema` package structure

**Success Criteria:**
- Schema validates all valid React nodes (elements, primitives, arrays, server components)
- Provides type narrowing via `S.is(ReactNodeSchema)`
- Includes JSDoc with examples
- Follows all Effect-first patterns from AGENTS.md
- Passes type checking and linting

**Scope Boundaries:**
- IN SCOPE: Creating the schema, annotations, and static helpers
- IN SCOPE: Using the effect-predicate-master agent to refine the type guard
- OUT OF SCOPE: Modifying React types or adding new React-specific validation
- OUT OF SCOPE: Creating form builders or JSON Schema integrations (can be added later)

## Role

You are an expert Effect Schema developer with deep knowledge of:
- Effect Schema's `S.declare` API for custom types
- TypeScript type guards and refinements
- React's type system (ReactNode, ReactElement, etc.)
- The beep-effect codebase patterns for schema creation
- Composable annotation systems

**Behavioral Expectations:**
- Use the effect-predicate-master agent to ensure the type guard uses optimal Effect predicates
- Follow the exact pattern from `function.ts` for class structure and static methods
- Preserve all existing type safety while adding schema validation
- Add comprehensive JSDoc with examples

## Constraints

### Package Guidelines (from `packages/common/schema/AGENTS.md`)

#### Forbidden Patterns
- Native array/string/object methods - use `A.*`, `Str.*`, `Struct.*`, `Record.*` instead
- Platform-specific APIs (network/DB/filesystem/timers/logging) - schemas must be pure
- Imports from slice packages (`@beep/iam-*`, `@beep/documents-*`) - keep schemas domain-agnostic
- `for`/`for...of` loops - use `F.pipe` with Effect collections
- `any` types - use proper typing or `unknown`
- Ad-hoc export paths - ALWAYS export through `src/schema.ts`

#### Required Patterns
- Effect namespace imports throughout:
  ```typescript
  import * as S from "effect/Schema"
  import * as P from "effect/Predicate"
  import * as F from "effect/Function"
  import * as A from "effect/Array"
  import * as Str from "effect/String"
  ```
- `F.pipe` for all composition
- Package-scoped identifiers via `$SchemaId.create("path/to/file")`
- Rich annotations: `identifier`, `title`, `description`, `jsonSchema`, `arbitrary`, `pretty`
- Pure runtime values only - no I/O or side effects

### Effect-Specific Patterns (from `.claude/rules/effect-patterns.md`)

#### Import Conventions
```typescript
// REQUIRED - namespace imports
import * as S from "effect/Schema"
import * as P from "effect/Predicate"
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as React from "react"

// REQUIRED - PascalCase constructors
S.Struct({ name: S.String })  // Correct
S.struct({ name: S.string })  // FORBIDDEN
```

#### Predicate Usage (from effect-predicate-master agent)
```typescript
// REQUIRED - use Effect predicates
P.isString(x)         // NOT: typeof x === "string"
P.isNumber(x)         // NOT: typeof x === "number"
P.isArray(x)          // NOT: Array.isArray(x)
P.isNotNullable(x)    // NOT: x != null
P.hasProperty(obj, "$$typeof")  // NOT: "$$typeof" in obj

// REQUIRED - predicate combinators
P.or(pred1, pred2)(x)   // NOT: pred1(x) || pred2(x)
P.and(pred1, pred2)(x)  // NOT: pred1(x) && pred2(x)

// REQUIRED - Effect collections
F.pipe(arr, A.every(pred))  // NOT: arr.every(pred)
```

## Resources

### Primary Reference Files

**1. Pattern Template: `packages/common/schema/src/primitives/function.ts`**
- Lines 9-10: Package identifier pattern via `$SchemaId.create()`
- Lines 11-40: Static methods interface (`FnSchemaStatics`)
- Lines 42-46: Schema type definition combining base schema with statics
- Lines 48-68: JSDoc with `@example` tags
- Lines 69-96: Factory function using `S.declare` and `Object.assign` pattern
- Lines 98-106: Class-based export with annotations

**Key Pattern to Follow:**
```typescript
export const Fn = <IA, IE, OA, OE>(
  opts: FnOptions<IA, IE, OA, OE>,
  annotations?: undefined | S.Annotations.Schema<(args: IA) => OA>
): FnSchema<IA, IE, OA, OE> => {
  const baseSchema = S.declare((i: unknown): i is TargetType => predicate(i)).pipe(
    S.annotations({ ...annotations })
  );

  const statics = { /* static methods */ };

  return Object.assign(baseSchema, statics);
};
```

**2. Annotation Pattern: `packages/common/schema/src/identity/entity-id/entity-id.ts`**
- Lines 95-120: `makeAnnotations` factory showing all annotation types
- Lines 100-105: Computed identifier, title, description, jsonSchema, arbitrary, pretty
- Lines 182-196: `.annotations()` override method for composability

**Key Pattern to Follow:**
```typescript
const makeAnnotations = (): S.Annotations.Schema<TargetType> => {
  const identifier = "ReactNode";
  const title = "React Node";
  const description = "A valid React node (element, primitive, array, or server component)";
  const jsonSchema = { /* JSON Schema representation */ };
  const arbitrary = () => (fc: typeof FC) => /* FastCheck arbitrary */;
  const pretty = () => (value: unknown) => /* pretty printer */;

  return { identifier, title, description, jsonSchema, arbitrary, pretty };
};
```

**3. Existing Implementation: `packages/shared/ui/src/schemas/react-component-schema.ts`**
- Lines 1-11: Imports and package identifier
- Lines 14-33: `isReactComponent` type guard (NEEDS REFINEMENT via effect-predicate-master)
- Lines 36-38: Incomplete schema factory

**Issues to Fix:**
- Line 18: `P.or(React.isValidElement, P.isNullable)(data)` - incorrect usage, should use predicate combinator properly
- Line 20: `P.or(P.isNumber, P.isString)(data)` - incorrect usage
- Lines 26-27: Uses native `A.isArray` instead of `P.isArray`, and incorrect `A.every` pattern
- Line 32: Uses `Eq.equals` incorrectly - should use proper predicate pattern

### Effect Documentation References

Use the `effect-predicate-master` agent (`.claude/agents/effect-predicate-master.md`) to transform the imperative checks in `isReactComponent` into proper Effect predicates.

**Specific transformations needed:**
- `React.isValidElement(data)` → keep as-is (React's built-in type guard)
- Multiple `||` conditions → `P.or(pred1, pred2, pred3)(...)`
- `Array.isArray(data)` → `P.isArray(data)`
- `data.every(item => ...)` → `F.pipe(data, A.every(...))`
- `data == null` → `P.isNullable(data)`
- Property checks → `P.hasProperty(data, "$$typeof")`
- Symbol equality → Use `Equal.equals` or custom predicate

## Output Specification

### File Structure

**Primary File:** `packages/shared/ui/src/schemas/react-component-schema.ts`

Replace the existing incomplete implementation with:

```typescript
import { $SharedUiId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as Equal from "effect/Equal";
import * as F from "effect/Function";
import type * as FC from "effect/FastCheck";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { TypeId } from "effect/Schema";
import { variance } from "@beep/schema/core/variance";
import * as React from "react";

const $I = $SharedUiId.create("schemas/react-component-schema");

// 1. Type guard function (refined with effect-predicate-master)
export function isReactNode(data: unknown): data is React.ReactNode {
  // Refined implementation using proper Effect predicates
}

// 2. Static methods interface
export interface ReactNodeSchemaStatics {
  readonly [TypeId]: typeof variance;
  readonly is: (u: unknown) => u is React.ReactNode;
  // Add other useful static methods as needed
}

// 3. Schema type combining base + statics
export type ReactNodeSchema = S.Schema<React.ReactNode, React.ReactNode> & ReactNodeSchemaStatics;

// 4. Annotations factory
const makeAnnotations = (): S.Annotations.Schema<React.ReactNode> => {
  const identifier = "ReactNode";
  const title = "React Node";
  const description = "A valid React node: element, string, number, boolean, null, undefined, array of nodes, or server component";

  const jsonSchema = {
    oneOf: [
      { type: "string" },
      { type: "number" },
      { type: "boolean" },
      { type: "null" },
      { type: "object" }, // React elements and server components
      { type: "array", items: { $ref: "#" } }, // Recursive array
    ],
  };

  const arbitrary = () => (fc: typeof FC) => {
    // FastCheck arbitrary for React nodes
  };

  const pretty = () => (value: React.ReactNode) => {
    // Pretty printer
  };

  return { identifier, title, description, jsonSchema, arbitrary, pretty };
};

// 5. Factory function
/**
 * Schema for React nodes.
 *
 * Validates any value that React can render: elements, primitives, arrays, or server components.
 *
 * @example
 * ```typescript
 * import { ReactNodeSchema } from "@beep/shared/ui/schemas";
 * import * as S from "effect/Schema";
 *
 * const MyComponent = ({ children }: { children: React.ReactNode }) => {
 *   if (S.is(ReactNodeSchema)(children)) {
 *     return <div>{children}</div>;
 *   }
 *   return null;
 * };
 *
 * // Usage in schemas
 * const Props = S.Struct({
 *   icon: ReactNodeSchema,
 *   label: S.String,
 * });
 * ```
 */
export const ReactNode = (
  annotations?: undefined | S.Annotations.Schema<React.ReactNode>
): ReactNodeSchema => {
  const defaultAnnotations = makeAnnotations();

  const baseSchema = S.declare(
    (u: unknown): u is React.ReactNode => isReactNode(u)
  ).pipe(
    S.annotations({ ...defaultAnnotations, ...annotations })
  );

  const statics: ReactNodeSchemaStatics = {
    [TypeId]: variance,
    is: (u: unknown): u is React.ReactNode => isReactNode(u),
  };

  return Object.assign(baseSchema, statics);
};

// 6. Class-based export for direct usage
export class ReactNodeSchema extends ReactNode().annotations(
  $I.annotations("ReactNode", {
    description: "A valid React node that can be rendered by React",
  })
) {}

export declare namespace ReactNodeSchema {
  export type Type = typeof ReactNodeSchema.Type;
}
```

### Integration Points

**1. Export through BS namespace**

Add to `packages/common/schema/src/schema.ts`:
```typescript
export * as ReactNode from "@beep/shared/ui/schemas/react-component-schema";
```

**2. Update package exports**

Ensure `packages/shared/ui/package.json` has correct exports:
```json
{
  "exports": {
    "./schemas": "./src/schemas/index.ts",
    "./schemas/*": "./src/schemas/*.ts"
  }
}
```

### Code Patterns to Follow

**1. Type Guard with Effect Predicates:**
```typescript
export function isReactNode(data: unknown): data is React.ReactNode {
  // Check primitives and elements
  const isPrimitive = P.or(
    P.isString,
    P.isNumber,
    P.isBoolean,
    P.isNullable,
    (u: unknown): u is React.ReactElement => React.isValidElement(u)
  );

  if (isPrimitive(data)) {
    return true;
  }

  // Check arrays recursively
  if (P.isArray(data)) {
    return F.pipe(data, A.every(isReactNode));
  }

  // Check server components (lazy components)
  const isServerComponent = P.and(
    P.isObject,
    P.hasProperty("$$typeof"),
    (obj: object & { $$typeof: unknown }): boolean =>
      Equal.equals(obj.$$typeof, Symbol.for("react.lazy"))
  );

  return isServerComponent(data);
}
```

**2. JSDoc Examples:**
```typescript
/**
 * @example
 * ```typescript
 * // Basic usage
 * S.is(ReactNodeSchema)(<div>Hello</div>) // true
 * S.is(ReactNodeSchema)("text") // true
 * S.is(ReactNodeSchema)(42) // true
 * S.is(ReactNodeSchema)(null) // true
 * S.is(ReactNodeSchema)([<div />, "text"]) // true
 *
 * // In component props
 * const Props = S.Struct({
 *   children: ReactNodeSchema,
 *   icon: S.optional(ReactNodeSchema),
 * });
 * ```
 */
```

## Examples

### Input: Incomplete Implementation

```typescript
export function isReactComponent(data: unknown): data is React.ReactNode {
  if (
    P.or(React.isValidElement, P.isNullable)(data) ||
    P.or(P.isNumber, P.isString)(data) ||
    P.isBoolean(data)
  ) {
    return true;
  }
  if (A.isArray(data)) {
    return F.pipe(data, A.every(isReactComponent));
  }
  return P.isObject(data) &&
    P.hasProperty("$$typeof")(data) &&
    Eq.equals(data.$$typeof)(Symbol.for("react.lazy"));
}
```

### Output: Refined Implementation

```typescript
export function isReactNode(data: unknown): data is React.ReactNode {
  // Primitives and elements
  const isPrimitiveOrElement = P.or(
    P.isString,
    P.isNumber,
    P.isBoolean,
    P.isNullable,
    (u: unknown): u is React.ReactElement => React.isValidElement(u)
  );

  if (isPrimitiveOrElement(data)) {
    return true;
  }

  // Recursive array check
  if (P.isArray(data)) {
    return F.pipe(data, A.every(isReactNode));
  }

  // Server component check
  if (!P.isObject(data)) {
    return false;
  }

  if (!P.hasProperty(data, "$$typeof")) {
    return false;
  }

  const obj = data as { $$typeof: unknown };
  return Equal.equals(obj.$$typeof, Symbol.for("react.lazy"));
}
```

## Usage Guidance

### When to Use This Schema

**Type Guard Usage (Recommended for React Components):**
```typescript
import { ReactNodeSchema } from "@beep/shared/ui/schemas";

// In component props - type narrowing without throwing
const MyComponent = ({ children }: { children: unknown }) => {
  if (!S.is(ReactNodeSchema)(children)) {
    return null; // Early return if invalid
  }
  // children is now narrowed to React.ReactNode
  return <div>{children}</div>;
};
```

**Validation Usage (For External Data):**
```typescript
import { ReactNodeSchema } from "@beep/shared/ui/schemas";
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";

// Validating data from external sources (JSON, API, etc.)
const validateContent = (unknown: unknown) =>
  F.pipe(
    unknown,
    S.decodeUnknown(ReactNodeSchema),
    Effect.catchAll((error) => {
      // Handle ParseError - log, return fallback, etc.
      return Effect.succeed(null as React.ReactNode);
    })
  );
```

**IMPORTANT:** React nodes are typically not serialized/deserialized, so this schema is primarily for:
1. Type guards in component boundaries (`S.is`)
2. Runtime validation of dynamic content
3. Documentation and type safety in API contracts

**DO NOT use `S.decodeUnknown` for normal React props** - use TypeScript types directly. Only validate when data comes from untrusted sources.

### Arbitrary and Pretty Implementations

**Arbitrary (FastCheck Generator):**
```typescript
const arbitrary = () => (fc: typeof FC) => {
  // Generate simple React nodes for testing
  return fc.oneof(
    fc.string(),           // String nodes
    fc.integer(),          // Number nodes
    fc.boolean(),          // Boolean nodes
    fc.constant(null),     // Null nodes
    fc.constant(undefined) // Undefined nodes
    // Note: Elements and server components are complex to generate,
    // so we focus on primitives for property-based testing
  );
};
```

**Pretty Printer:**
```typescript
const pretty = () => (value: React.ReactNode) => {
  if (P.isString(value)) return `"${value}"`;
  if (P.isNumber(value)) return String(value);
  if (P.isBoolean(value)) return String(value);
  if (P.isNull(value)) return "null";
  if (P.isUndefined(value)) return "undefined";
  if (P.isArray(value)) return `[${value.length} nodes]`;
  if (React.isValidElement(value)) {
    const type = typeof value.type === "string" ? value.type : value.type?.name || "Component";
    return `<${type} />`;
  }
  return "[ReactNode]";
};
```

## Verification Checklist

- [ ] Type guard uses only Effect predicates (no `typeof`, `instanceof`, `||`, `&&`)
- [ ] Type guard properly narrows to `React.ReactNode`
- [ ] Schema created via `S.declare` with the type guard
- [ ] All required annotations present (identifier, title, description, jsonSchema, arbitrary, pretty)
- [ ] Arbitrary implementation generates simple React nodes for testing
- [ ] Pretty printer handles all React node types
- [ ] Static methods include `is` and `[TypeId]`
- [ ] Class-based export with package identifier
- [ ] JSDoc with `@example` tags showing both type guard and validation usage
- [ ] JSDoc clarifies when to use `S.is` vs `S.decodeUnknown`
- [ ] Recursive array validation works correctly
- [ ] Server component (lazy) detection works
- [ ] No native array/string/object methods used
- [ ] All imports use proper namespace aliases
- [ ] Exported through `@beep/schema` BS namespace
- [ ] Type checks pass (`bun run check --filter=@beep/shared-ui`)
- [ ] Linting passes (`bun run lint --filter=@beep/shared-ui`)

---

## Metadata

### Research Sources

**Files Explored:**
- `packages/common/schema/src/primitives/function.ts` - Factory pattern with `S.declare` and static methods
- `packages/common/schema/src/identity/entity-id/entity-id.ts` - Annotation patterns and composability
- `packages/shared/ui/src/schemas/react-component-schema.ts` - Existing incomplete implementation
- `.claude/agents/effect-predicate-master.md` - Predicate transformation patterns

**Documentation Referenced:**
- Effect Schema `S.declare` API for custom type guards
- Effect Predicate combinator patterns (`P.or`, `P.and`, predicates)
- React TypeScript types for `ReactNode` and `ReactElement`

**Package Guidelines:**
- `packages/common/schema/AGENTS.md` - Schema authoring constraints and patterns
- `.claude/rules/effect-patterns.md` - Import conventions and forbidden patterns
- `CLAUDE.md` - Effect-first architecture principles

### Refinement History

| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial draft | N/A          |
| 1         | Missing error handling guidance, incomplete arbitrary/pretty specs | Added "Usage Guidance" section clarifying S.is vs S.decodeUnknown usage, provided concrete arbitrary and pretty implementations, expanded verification checklist |
