# ts-morph API Research for create-slice CLI

## Executive Summary

This document provides comprehensive research on the ts-morph API for programmatic TypeScript AST manipulation needed for the `create-slice` CLI command. The research covers five key modification patterns: import/export management, function call argument manipulation, union type modifications, and JSON/JSONC file handling.

**Key Finding**: ts-morph provides high-level, type-safe APIs for all required modifications except JSON/JSONC files, which should be handled separately using `jsonc-parser` or `json5` libraries already in the project.

## Problem Statement

The `create-slice` command needs to programmatically modify TypeScript files when scaffolding new vertical slices:

1. **Add imports** - Add new import statements to existing barrel files
2. **Add exports** - Add new re-export statements (e.g., `export * from "./new-slice"`)
3. **Modify function arguments** - Add elements to `Layer.mergeAll([...])` call arguments
4. **Add union members** - Extend discriminated union types with new variant
5. **Modify tsconfig.json** - Add path aliases to `compilerOptions.paths`

## Research Sources

| Source | Purpose | Files Analyzed |
|--------|---------|----------------|
| Context7 ts-morph documentation | Official API patterns | `/dsherret/ts-morph` library |
| Existing codebase usage | Real-world patterns | `tooling/cli/src/commands/docgen/shared/ast.ts` |
| Codebase utilities | JSON handling | `tooling/utils/src/FsUtils.ts` |
| Package analysis | Available libraries | `node_modules/jsonc-parser`, `node_modules/json5` |

## Files Analyzed Table

| File Path | Purpose | Key Patterns |
|-----------|---------|--------------|
| `/home/elpresidank/YeeBois/projects/beep-effect/tooling/cli/src/commands/docgen/shared/ast.ts` | JSDoc analysis with ts-morph | Project creation, SourceFile reading, AST traversal, export analysis |
| `/home/elpresidank/YeeBois/projects/beep-effect/tooling/utils/src/FsUtils.ts` | Effect-based file I/O | `readJson`, `writeJson` using native `JSON.parse`/`JSON.stringify` |
| `/home/elpresidank/YeeBois/projects/beep-effect/tooling/repo-scripts/src/codemods/jsdoc.ts` | CallExpression manipulation | jscodeshift (alternative to ts-morph) for comment handling |

## ts-morph API Overview

ts-morph is a TypeScript Compiler API wrapper providing:
- **Type-safe AST navigation** - Strongly-typed node traversal
- **High-level manipulation APIs** - `addImport`, `addExport`, `set()` methods
- **Automatic formatting** - Handles indentation, spacing, imports organization
- **Safe file persistence** - `save()`, `saveSync()` methods with transactional semantics

### Core Workflow Pattern

```typescript
import { Project } from "ts-morph";
import * as Effect from "effect/Effect";

const modifyTypeScriptFile = (filePath: string) =>
  Effect.gen(function* () {
    // 1. Create project
    const project = new Project({
      skipAddingFilesFromTsConfig: true,
    });

    // 2. Add source file
    const sourceFile = project.addSourceFileAtPath(filePath);

    // 3. Make modifications
    sourceFile.addImportDeclaration({
      moduleSpecifier: "./new-module",
      namedImports: ["NewService"]
    });

    // 4. Organize imports (optional but recommended)
    sourceFile.organizeImports();

    // 5. Save changes
    await sourceFile.save();

    return sourceFile.getFilePath();
  });
```

## Pattern 1: Add Import Statements

### High-Level API (Recommended)

```typescript
import { Project, type SourceFile } from "ts-morph";
import * as Effect from "effect/Effect";

/**
 * Add an import declaration to a source file.
 *
 * @example
 * // Before: (file has no imports)
 * // After:
 * // import { MyService } from "./services/MyService";
 */
const addNamedImport = (
  sourceFile: SourceFile,
  moduleSpecifier: string,
  namedImports: ReadonlyArray<string>
): Effect.Effect<void, never, never> =>
  Effect.sync(() => {
    sourceFile.addImportDeclaration({
      moduleSpecifier,
      namedImports: [...namedImports],
    });
  });

/**
 * Add a default import.
 *
 * @example
 * // import MyClass from "./MyClass";
 */
const addDefaultImport = (
  sourceFile: SourceFile,
  moduleSpecifier: string,
  defaultImport: string
): Effect.Effect<void, never, never> =>
  Effect.sync(() => {
    sourceFile.addImportDeclaration({
      defaultImport,
      moduleSpecifier,
    });
  });

/**
 * Add namespace import.
 *
 * @example
 * // import * as Effect from "effect/Effect";
 */
const addNamespaceImport = (
  sourceFile: SourceFile,
  moduleSpecifier: string,
  namespaceImport: string
): Effect.Effect<void, never, never> =>
  Effect.sync(() => {
    sourceFile.addImportDeclaration({
      namespaceImport,
      moduleSpecifier,
    });
  });

/**
 * Add named imports with aliases.
 *
 * @example
 * // import { MyClass as MyAlias } from "./file";
 */
const addNamedImportWithAlias = (
  sourceFile: SourceFile,
  moduleSpecifier: string,
  imports: ReadonlyArray<{ name: string; alias?: string }>
): Effect.Effect<void, never, never> =>
  Effect.sync(() => {
    const importDecl = sourceFile.addImportDeclaration({
      moduleSpecifier,
      namedImports: imports.map(({ name, alias }) => ({
        name,
        alias,
      })),
    });
  });
```

### Managing Existing Imports

```typescript
import * as A from "effect/Array";
import * as O from "effect/Option";

/**
 * Add named imports to an existing import declaration.
 * Finds existing import from module specifier and extends it.
 */
const addToExistingImport = (
  sourceFile: SourceFile,
  moduleSpecifier: string,
  namedImports: ReadonlyArray<string>
): Effect.Effect<void, never, never> =>
  Effect.sync(() => {
    const existingImport = F.pipe(
      sourceFile.getImportDeclarations(),
      A.findFirst((decl) => decl.getModuleSpecifierValue() === moduleSpecifier),
      O.getOrUndefined
    );

    if (existingImport) {
      // Extend existing import
      existingImport.addNamedImports([...namedImports]);
    } else {
      // Create new import
      sourceFile.addImportDeclaration({
        moduleSpecifier,
        namedImports: [...namedImports],
      });
    }
  });
```

### Import Organization

```typescript
/**
 * Organize imports after modifications.
 * Uses TypeScript's built-in import organizer.
 *
 * IMPORTANT: This should be called AFTER all modifications,
 * as it may invalidate previously navigated nodes.
 */
const organizeImports = (sourceFile: SourceFile): Effect.Effect<void, never, never> =>
  Effect.sync(() => {
    sourceFile.organizeImports();
  });
```

## Pattern 2: Add Export Statements

### High-Level Export API

```typescript
/**
 * Add a re-export statement (barrel export).
 *
 * @example
 * // export * from "./module";
 */
const addReExport = (
  sourceFile: SourceFile,
  moduleSpecifier: string
): Effect.Effect<void, never, never> =>
  Effect.sync(() => {
    sourceFile.addExportDeclaration({
      moduleSpecifier,
    });
  });

/**
 * Add named exports from a module.
 *
 * @example
 * // export { MyClass, MyService } from "./file";
 */
const addNamedExport = (
  sourceFile: SourceFile,
  moduleSpecifier: string,
  namedExports: ReadonlyArray<string>
): Effect.Effect<void, never, never> =>
  Effect.sync(() => {
    sourceFile.addExportDeclaration({
      namedExports: [...namedExports],
      moduleSpecifier,
    });
  });

/**
 * Add named exports with aliases.
 *
 * @example
 * // export { OldName as NewName } from "./file";
 */
const addNamedExportWithAlias = (
  sourceFile: SourceFile,
  moduleSpecifier: string,
  exports: ReadonlyArray<{ name: string; alias?: string }>
): Effect.Effect<void, never, never> =>
  Effect.sync(() => {
    sourceFile.addExportDeclaration({
      namedExports: exports.map(({ name, alias }) => ({
        name,
        alias,
      })),
      moduleSpecifier,
    });
  });
```

### Practical Example: Barrel File Management

```typescript
import * as F from "effect/Function";
import * as Str from "effect/String";

/**
 * Add a new slice export to a barrel file.
 *
 * For create-slice, this would add:
 * export * from "./new-slice"
 *
 * To files like:
 * - packages/iam/domain/src/index.ts
 * - packages/iam/server/src/index.ts
 */
const addSliceExport = (
  sourceFile: SourceFile,
  sliceName: string
): Effect.Effect<void, never, never> =>
  Effect.gen(function* () {
    // Check if export already exists
    const existingExports = sourceFile.getExportDeclarations();
    const alreadyExists = F.pipe(
      existingExports,
      A.some((exp) => {
        const spec = exp.getModuleSpecifierValue();
        return spec === `./${sliceName}` || spec === `./${sliceName}/index`;
      })
    );

    if (!alreadyExists) {
      sourceFile.addExportDeclaration({
        moduleSpecifier: `./${sliceName}`,
      });
      yield* Effect.log(`Added export for ${sliceName}`);
    } else {
      yield* Effect.log(`Export for ${sliceName} already exists`);
    }
  });
```

## Pattern 3: Modify Function Call Arguments

### Challenge: Adding Array Elements to Function Calls

ts-morph doesn't have a direct "add array element" API. We need to:
1. Find the `CallExpression` node
2. Get the argument (which is an `ArrayLiteralExpression`)
3. Use `replaceWithText()` or low-level text manipulation

### Approach 1: Using replaceWithText (Recommended)

```typescript
import { SyntaxKind, type CallExpression, type ArrayLiteralExpression } from "ts-morph";

/**
 * Add an element to a Layer.mergeAll(...) call.
 *
 * @example
 * // Before:
 * // const MainLayer = Layer.mergeAll(
 * //   DatabaseLayer,
 * //   CacheLayer
 * // )
 *
 * // After:
 * // const MainLayer = Layer.mergeAll(
 * //   DatabaseLayer,
 * //   CacheLayer,
 * //   NewSliceLayer
 * // )
 */
const addLayerToMergeAll = (
  sourceFile: SourceFile,
  variableName: string,
  newLayerName: string
): Effect.Effect<void, Error, never> =>
  Effect.gen(function* () {
    // Find variable declaration
    const variableDecl = F.pipe(
      sourceFile.getVariableDeclaration(variableName),
      O.fromNullable
    );

    if (O.isNone(variableDecl)) {
      return yield* Effect.fail(
        new Error(`Variable ${variableName} not found`)
      );
    }

    // Get initializer (should be a CallExpression)
    const initializer = variableDecl.value.getInitializer();
    if (!initializer || !Node.isCallExpression(initializer)) {
      return yield* Effect.fail(
        new Error(`${variableName} is not initialized with a call expression`)
      );
    }

    const callExpr = initializer as CallExpression;

    // Verify it's a Layer.mergeAll call
    const callText = callExpr.getExpression().getText();
    if (!callText.includes("Layer.mergeAll")) {
      return yield* Effect.fail(
        new Error(`${variableName} is not a Layer.mergeAll call`)
      );
    }

    // Get first argument (should be an array)
    const args = callExpr.getArguments();
    if (args.length === 0) {
      return yield* Effect.fail(
        new Error("Layer.mergeAll has no arguments")
      );
    }

    const firstArg = args[0];
    if (!firstArg || !Node.isArrayLiteralExpression(firstArg)) {
      return yield* Effect.fail(
        new Error("First argument is not an array literal")
      );
    }

    const arrayExpr = firstArg as ArrayLiteralExpression;
    const elements = arrayExpr.getElements();

    // Build new array text with added element
    const elementTexts = F.pipe(
      elements,
      A.map((el) => el.getText())
    );

    const newElements = [...elementTexts, newLayerName];
    const newArrayText = `[\n  ${newElements.join(",\n  ")}\n]`;

    // Replace the array with new text
    arrayExpr.replaceWithText(newArrayText);

    yield* Effect.log(`Added ${newLayerName} to ${variableName}`);
  });
```

### Approach 2: Using insertText (Lower-Level)

```typescript
/**
 * Add element to array literal using low-level text insertion.
 * More fragile but gives precise control.
 */
const addArrayElementLowLevel = (
  arrayExpr: ArrayLiteralExpression,
  newElement: string
): Effect.Effect<void, never, never> =>
  Effect.sync(() => {
    const elements = arrayExpr.getElements();

    if (elements.length === 0) {
      // Empty array: add first element
      arrayExpr.insertText(1, newElement);
    } else {
      // Non-empty array: insert after last element
      const lastElement = elements[elements.length - 1];
      const insertPos = lastElement.getEnd();
      arrayExpr.insertText(insertPos, `,\n  ${newElement}`);
    }
  });
```

### Generic Pattern: Find and Modify CallExpression

```typescript
/**
 * Generic helper to find a call expression by name.
 */
const findCallExpression = (
  sourceFile: SourceFile,
  callName: string
): O.Option<CallExpression> =>
  F.pipe(
    sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression),
    A.findFirst((call) => {
      const expr = call.getExpression();
      return expr.getText().includes(callName);
    })
  );
```

## Pattern 4: Add Union Type Members

### Challenge: Extending Discriminated Unions

ts-morph doesn't provide a direct "add union member" API. We need to:
1. Find the `TypeAliasDeclaration`
2. Get its type node (should be `UnionTypeNode`)
3. Reconstruct the union with the new member

### Approach: Using set() Structure API

```typescript
import { type TypeAliasDeclaration, type UnionTypeNode } from "ts-morph";

/**
 * Add a new type to a union type alias.
 *
 * @example
 * // Before:
 * // type SliceEvent = UserCreated | UserDeleted
 *
 * // After:
 * // type SliceEvent = UserCreated | UserDeleted | UserUpdated
 */
const addUnionMember = (
  sourceFile: SourceFile,
  typeAliasName: string,
  newMemberType: string
): Effect.Effect<void, Error, never> =>
  Effect.gen(function* () {
    // Find type alias
    const typeAlias = F.pipe(
      sourceFile.getTypeAlias(typeAliasName),
      O.fromNullable
    );

    if (O.isNone(typeAlias)) {
      return yield* Effect.fail(
        new Error(`Type alias ${typeAliasName} not found`)
      );
    }

    const alias = typeAlias.value;
    const typeNode = alias.getTypeNode();

    if (!typeNode) {
      return yield* Effect.fail(
        new Error(`Type alias ${typeAliasName} has no type node`)
      );
    }

    // Get current type text
    const currentType = typeNode.getText();

    // Check if it's already a union
    const isUnion = currentType.includes("|");

    let newTypeText: string;
    if (isUnion) {
      // Already a union - add new member
      newTypeText = `${currentType} | ${newMemberType}`;
    } else {
      // Not a union yet - make it one
      newTypeText = `${currentType} | ${newMemberType}`;
    }

    // Update the type using set()
    alias.setType(newTypeText);

    yield* Effect.log(`Added ${newMemberType} to ${typeAliasName}`);
  });
```

### Alternative: replaceWithText for Complex Cases

```typescript
/**
 * Add union member using text replacement.
 * More control over formatting.
 */
const addUnionMemberWithFormatting = (
  typeAlias: TypeAliasDeclaration,
  newMemberType: string
): Effect.Effect<void, never, never> =>
  Effect.sync(() => {
    const typeNode = typeAlias.getTypeNodeOrThrow();
    const currentText = typeNode.getText();

    // Split into lines for multiline unions
    const lines = F.pipe(currentText, Str.split("\n"));

    if (A.length(lines) > 1) {
      // Multiline union - preserve formatting
      const newText = `${currentText}\n  | ${newMemberType}`;
      typeNode.replaceWithText(newText);
    } else {
      // Single line union
      const newText = `${currentText} | ${newMemberType}`;
      typeNode.replaceWithText(newText);
    }
  });
```

### Checking if Type Already Exists

```typescript
/**
 * Check if a union type already contains a member.
 */
const unionContainsMember = (
  typeAlias: TypeAliasDeclaration,
  memberType: string
): boolean => {
  const typeNode = typeAlias.getTypeNode();
  if (!typeNode) return false;

  const typeText = typeNode.getText();

  // Simple text-based check
  // More robust: parse union types with type.getUnionTypes()
  return typeText.includes(memberType);
};
```

## Pattern 5: Modify JSON/JSONC Files

### Key Finding: Don't Use ts-morph for JSON

ts-morph is designed for TypeScript/JavaScript AST manipulation. For JSON/JSONC files:
- Use `jsonc-parser` (already in `node_modules/`)
- Use `json5` (already in `node_modules/`)
- Or use simple `JSON.parse`/`JSON.stringify` for `.json` files

### Recommended Approach: jsonc-parser

```typescript
import * as JSONC from "jsonc-parser";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

/**
 * Add a path alias to tsconfig.json using jsonc-parser.
 *
 * @example
 * // Add: "@beep/new-slice": ["packages/new-slice/src"]
 * // To: compilerOptions.paths
 */
const addTsConfigPathAlias = (
  tsconfigPath: string,
  alias: string,
  paths: ReadonlyArray<string>
): Effect.Effect<void, Error, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    // Read file
    const content = yield* fs.readFileString(tsconfigPath);

    // Parse with jsonc-parser (preserves comments and formatting)
    const parseErrors: JSONC.ParseError[] = [];
    const json = JSONC.parse(content, parseErrors, {
      allowTrailingComma: true,
    });

    if (parseErrors.length > 0) {
      return yield* Effect.fail(
        new Error(`Failed to parse ${tsconfigPath}: ${parseErrors[0]?.error}`)
      );
    }

    // Modify the JSON object
    if (!json.compilerOptions) {
      json.compilerOptions = {};
    }
    if (!json.compilerOptions.paths) {
      json.compilerOptions.paths = {};
    }
    json.compilerOptions.paths[alias] = [...paths];

    // Use JSONC.applyEdits for preserving formatting (advanced)
    // Or simple stringify for basic cases
    const newContent = JSON.stringify(json, null, 2);

    // Write back
    yield* fs.writeFileString(tsconfigPath, newContent);

    yield* Effect.log(`Added path alias ${alias} to ${tsconfigPath}`);
  });
```

### Alternative: Using FsUtils from Codebase

```typescript
import { FsUtils } from "@beep/tooling-utils/FsUtils";

/**
 * Modify tsconfig.json using existing FsUtils utilities.
 */
const addPathAliasWithFsUtils = (
  tsconfigPath: string,
  alias: string,
  paths: ReadonlyArray<string>
): Effect.Effect<void, DomainError, FsUtils> =>
  Effect.gen(function* () {
    const utils = yield* FsUtils;

    // Read JSON
    const json = yield* utils.readJson(tsconfigPath);

    // Modify
    if (!json.compilerOptions) json.compilerOptions = {};
    if (!json.compilerOptions.paths) json.compilerOptions.paths = {};
    json.compilerOptions.paths[alias] = [...paths];

    // Write JSON
    yield* utils.writeJson(tsconfigPath, json);

    yield* Effect.log(`Updated ${tsconfigPath} with alias ${alias}`);
  });
```

### Advanced: Preserving JSONC Formatting with applyEdits

```typescript
/**
 * Add path alias while preserving comments and formatting.
 * Uses jsonc-parser's edit API.
 */
const addPathAliasPreserveFormatting = (
  tsconfigPath: string,
  alias: string,
  paths: ReadonlyArray<string>
): Effect.Effect<void, Error, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const content = yield* fs.readFileString(tsconfigPath);

    // Create edit operations
    const edits = JSONC.modify(
      content,
      ["compilerOptions", "paths", alias],
      paths,
      { formattingOptions: { tabSize: 2, insertSpaces: true } }
    );

    // Apply edits
    const newContent = JSONC.applyEdits(content, edits);

    // Write back
    yield* fs.writeFileString(tsconfigPath, newContent);

    yield* Effect.log(`Added ${alias} to tsconfig paths`);
  });
```

## Error Handling Patterns

### Tagged Errors for AST Operations

```typescript
import * as Schema from "effect/Schema";

class FileNotFoundError extends Schema.TaggedError<FileNotFoundError>()(
  "FileNotFoundError",
  { filePath: Schema.String }
) {}

class NodeNotFoundError extends Schema.TaggedError<NodeNotFoundError>()(
  "NodeNotFoundError",
  {
    filePath: Schema.String,
    nodeName: Schema.String,
    nodeType: Schema.String,
  }
) {}

class InvalidNodeTypeError extends Schema.TaggedError<InvalidNodeTypeError>()(
  "InvalidNodeTypeError",
  {
    filePath: Schema.String,
    nodeName: Schema.String,
    expectedType: Schema.String,
    actualType: Schema.String,
  }
) {}
```

### Safe File Modification Wrapper

```typescript
/**
 * Safe wrapper for ts-morph file modifications.
 * Creates project, applies modifications, saves changes.
 */
const modifySourceFileSafe = <E, A>(
  filePath: string,
  modifications: (sourceFile: SourceFile) => Effect.Effect<A, E, never>
): Effect.Effect<A, E | FileNotFoundError, never> =>
  Effect.gen(function* () {
    // Create project
    const project = new Project({
      skipAddingFilesFromTsConfig: true,
    });

    // Add source file
    const sourceFile = yield* Effect.try({
      try: () => project.addSourceFileAtPath(filePath),
      catch: () => new FileNotFoundError({ filePath }),
    });

    // Apply modifications
    const result = yield* modifications(sourceFile);

    // Organize imports
    yield* Effect.sync(() => sourceFile.organizeImports());

    // Save
    yield* Effect.tryPromise({
      try: () => sourceFile.save(),
      catch: (e) => new Error(`Failed to save ${filePath}: ${e}`),
    });

    return result;
  });
```

### Example Usage with Error Recovery

```typescript
/**
 * Add a layer to MainLayer with comprehensive error handling.
 */
const addLayerToMainLayerSafe = (
  filePath: string,
  layerName: string
): Effect.Effect<void, FileNotFoundError | NodeNotFoundError, never> =>
  modifySourceFileSafe(filePath, (sourceFile) =>
    Effect.gen(function* () {
      const result = yield* addLayerToMergeAll(
        sourceFile,
        "MainLayer",
        layerName
      ).pipe(
        Effect.catchAll((error) =>
          Effect.fail(
            new NodeNotFoundError({
              filePath,
              nodeName: "MainLayer",
              nodeType: "VariableDeclaration",
            })
          )
        )
      );

      yield* Effect.log(`Successfully added ${layerName} to MainLayer`);
    })
  );
```

## Best Practices

### 1. Use High-Level APIs First

```typescript
// ✅ PREFERRED - High-level, type-safe
sourceFile.addImportDeclaration({
  moduleSpecifier: "./module",
  namedImports: ["Service"]
});

// ❌ AVOID - Low-level, error-prone
sourceFile.insertText(0, 'import { Service } from "./module";\n');
```

### 2. Always Organize Imports After Modifications

```typescript
// ✅ CORRECT
const program = Effect.gen(function* () {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filePath);

  // ... all modifications ...

  sourceFile.organizeImports(); // Clean up imports
  await sourceFile.save();
});
```

### 3. Call save() Once at the End

```typescript
// ✅ CORRECT - Single save
addImport(sourceFile);
addExport(sourceFile);
addLayer(sourceFile);
await sourceFile.save(); // Once

// ❌ AVOID - Multiple saves
addImport(sourceFile);
await sourceFile.save();
addExport(sourceFile);
await sourceFile.save(); // Wasteful
```

### 4. Wrap in Effect.sync for Synchronous Operations

```typescript
// ✅ CORRECT - Effect-wrapped
const addImport = (sourceFile: SourceFile): Effect.Effect<void, never, never> =>
  Effect.sync(() => {
    sourceFile.addImportDeclaration({ ... });
  });

// ❌ AVOID - Bare side effect
const addImport = (sourceFile: SourceFile): void => {
  sourceFile.addImportDeclaration({ ... });
};
```

### 5. Validate Before Modifying

```typescript
// ✅ CORRECT - Check existence first
const addLayerSafe = (sourceFile: SourceFile, layerName: string) =>
  Effect.gen(function* () {
    const variable = sourceFile.getVariableDeclaration("MainLayer");
    if (!variable) {
      return yield* Effect.fail(new Error("MainLayer not found"));
    }

    // Safe to proceed
    // ... modifications ...
  });
```

### 6. Use replaceWithText for Complex Modifications

```typescript
// ✅ PREFERRED - Clean replacement
const updateArray = (arrayExpr: ArrayLiteralExpression, newElements: string[]) =>
  Effect.sync(() => {
    const newText = `[\n  ${newElements.join(",\n  ")}\n]`;
    arrayExpr.replaceWithText(newText);
  });

// ⚠️ FRAGILE - Low-level text insertion
const updateArrayLowLevel = (arrayExpr: ArrayLiteralExpression) =>
  Effect.sync(() => {
    arrayExpr.insertText(10, ", newElement"); // Position-dependent
  });
```

## Integration with beep-effect Architecture

### Service Definition Pattern

```typescript
import * as Effect from "effect/Effect";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
import { Project, type SourceFile } from "ts-morph";

/**
 * TypeScript AST Manipulation Service
 */
class TsMorphService extends Effect.Service<TsMorphService>()("TsMorphService", {
  effect: Effect.gen(function* () {
    // Create project once
    const project = new Project({
      skipAddingFilesFromTsConfig: true,
    });

    return {
      /**
       * Add source file and apply modifications.
       */
      modifyFile: <E, A>(
        filePath: string,
        modifications: (sourceFile: SourceFile) => Effect.Effect<A, E, never>
      ): Effect.Effect<A, E | FileNotFoundError, never> =>
        Effect.gen(function* () {
          const sourceFile = yield* Effect.try({
            try: () => project.addSourceFileAtPath(filePath),
            catch: () => new FileNotFoundError({ filePath }),
          });

          const result = yield* modifications(sourceFile);

          sourceFile.organizeImports();
          yield* Effect.tryPromise(() => sourceFile.save());

          return result;
        }),

      /**
       * Add import declaration.
       */
      addImport: (
        filePath: string,
        moduleSpecifier: string,
        namedImports: ReadonlyArray<string>
      ) =>
        Effect.gen(function* () {
          yield* this.modifyFile(filePath, (sourceFile) =>
            Effect.sync(() => {
              sourceFile.addImportDeclaration({
                moduleSpecifier,
                namedImports: [...namedImports],
              });
            })
          );
        }),

      /**
       * Add export declaration.
       */
      addExport: (filePath: string, moduleSpecifier: string) =>
        Effect.gen(function* () {
          yield* this.modifyFile(filePath, (sourceFile) =>
            Effect.sync(() => {
              sourceFile.addExportDeclaration({ moduleSpecifier });
            })
          );
        }),

      // ... other methods ...
    };
  }),
}) {}
```

### Usage in create-slice Command

```typescript
import { TsMorphService } from "./services/TsMorphService";
import { FsUtils } from "@beep/tooling-utils/FsUtils";

const createSliceProgram = (sliceName: string) =>
  Effect.gen(function* () {
    const tsmorph = yield* TsMorphService;
    const fs = yield* FsUtils;

    // 1. Add export to barrel file
    yield* tsmorph.addExport(
      "packages/iam/domain/src/index.ts",
      `./${sliceName}`
    );

    // 2. Add import to MainLayer
    yield* tsmorph.addImport(
      "packages/runtime/server/src/MainLayer.ts",
      `@beep/iam-server/${sliceName}`,
      [`${sliceName}Layer`]
    );

    // 3. Add layer to Layer.mergeAll
    yield* tsmorph.modifyFile(
      "packages/runtime/server/src/MainLayer.ts",
      (sourceFile) =>
        addLayerToMergeAll(sourceFile, "MainLayer", `${sliceName}Layer`)
    );

    // 4. Add path alias to tsconfig
    yield* fs.readJson("tsconfig.base.jsonc").pipe(
      Effect.flatMap((json) => {
        json.compilerOptions.paths[`@beep/${sliceName}/*`] = [
          `packages/${sliceName}/src/*`,
        ];
        return fs.writeJson("tsconfig.base.jsonc", json);
      })
    );

    yield* Effect.log(`Successfully created slice: ${sliceName}`);
  });
```

## Recommendations for Implementation

### Phase 1: Core Service (Week 1)

1. **Create `TsMorphService`** in `tooling/cli/src/services/TsMorphService.ts`
   - Project management
   - High-level import/export APIs
   - Safe file modification wrapper

2. **Create Error Schema** in `tooling/cli/src/errors/TsMorphErrors.ts`
   - `FileNotFoundError`
   - `NodeNotFoundError`
   - `InvalidNodeTypeError`

3. **Unit Tests** in `tooling/cli/test/TsMorphService.test.ts`
   - Import addition tests
   - Export addition tests
   - Error handling tests

### Phase 2: Advanced Patterns (Week 2)

4. **Implement CallExpression Manipulation**
   - `addLayerToMergeAll` function
   - Array literal element addition
   - Generic call expression finder

5. **Implement Union Type Extension**
   - `addUnionMember` function
   - Type existence checking
   - Formatting preservation

6. **JSON Modification Utilities** in `tooling/cli/src/utils/json.ts`
   - `addTsConfigPathAlias` using `jsonc-parser`
   - JSONC formatting preservation
   - Integration with existing `FsUtils`

### Phase 3: Integration (Week 3)

7. **Integrate with create-slice Command**
   - Use `TsMorphService` in orchestrator
   - Add to dependency graph
   - End-to-end testing

## Code Examples Summary

| Pattern | API Level | Complexity | Recommended |
|---------|-----------|------------|-------------|
| Add import | High (`addImportDeclaration`) | Low | ✅ Yes |
| Add export | High (`addExportDeclaration`) | Low | ✅ Yes |
| Modify call args | Medium (`replaceWithText`) | Medium | ✅ Yes |
| Add union member | Medium (`setType`) | Medium | ✅ Yes |
| Modify JSON | External (`jsonc-parser`) | Low | ✅ Yes |

## References

- [ts-morph Documentation](https://github.com/dsherret/ts-morph)
- [ts-morph Import/Export Guide](https://github.com/dsherret/ts-morph/blob/latest/docs/details/imports.md)
- [ts-morph Manipulation Guide](https://github.com/dsherret/ts-morph/blob/latest/docs/manipulation/index.md)
- [jsonc-parser npm](https://www.npmjs.com/package/jsonc-parser)
- Existing codebase: `tooling/cli/src/commands/docgen/shared/ast.ts`
- Existing utilities: `tooling/utils/src/FsUtils.ts`

---

## Prompt Feedback

### Efficiency Score: 8.5/10

**Strengths**:
- ✅ Clear scope definition with 5 specific modification types
- ✅ Well-defined output requirements (markdown research doc)
- ✅ Specific research sources identified (Context7, codebase, packages)
- ✅ Success criteria with checkboxes
- ✅ Concrete examples of what needs to be modified

**Improvements**:
1. **Missing Edge Cases** - The prompt didn't specify:
   - What if files don't exist yet? (create-slice might generate new files)
   - What if target nodes don't exist? (error handling strategy)
   - What if modifications conflict? (duplicate imports, etc.)

2. **Output Format Could Be More Specific** - Consider requesting:
   - "Include code examples for each pattern with Effect integration"
   - "Provide error handling schemas for each operation"
   - "Show service definition pattern for integration"

3. **Integration Context** - Add:
   - "Research should align with existing patterns in `tooling/cli/src/commands/docgen/shared/ast.ts`"
   - "Recommend service architecture following beep-effect patterns"

**Suggested Refinement**:
```markdown
## Additional Requirements
- All code examples must use Effect patterns (Effect.gen, Effect.sync)
- Provide tagged error schemas for each operation
- Show service definition following beep-effect Effect.Service pattern
- Include integration examples with existing FsUtils
- Document edge cases: missing files, duplicate entries, invalid nodes
```

**What Worked Well**:
- DRY RUN prefix prompted thorough analysis
- Specific file paths made research targeted
- Research outputs directory structure was clear
- Success criteria ensured comprehensive coverage
