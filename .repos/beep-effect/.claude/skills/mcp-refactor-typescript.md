---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# MCP Refactor TypeScript Skill

Use `mcp-refactor-typescript` MCP tools for TypeScript-aware refactoring operations. These tools leverage the TypeScript compiler for semantic operations that benefit from full type understanding.

## When to Invoke

Invoke this skill when:
- Renaming/moving TypeScript files (auto-updates all imports)
- Renaming symbols project-wide with type awareness
- Extracting functions, constants, or variables from code
- Finding all references to a symbol (type-aware, catches dynamic imports)
- Organizing imports or removing unused code
- Fixing all TypeScript errors in a file at once
- Cleaning up dead code across the codebase

Do NOT use this tool when:
- Reading files (Standard `Read` is simpler)
- Making precise text edits (Standard `Edit` is safer for targeted changes)
- Searching for text patterns (Standard `Grep` is faster for text matching)
- Type-checking only (Use `bun run check` or `tsc --noEmit`)

## Critical: Preview Mode

All operations support `preview: true` to see what will change before applying:

```typescript
// SAFE - Preview first, then apply
mcp__mcp-refactor-typescript__refactoring({
  operation: "rename",
  filePath: "src/services/UserService.ts",
  line: 15,
  text: "getUserById",
  name: "findUserById",
  preview: true  // See changes without applying
})
```

---

## Quick Reference: Tool Selection

| Task | Preferred | Alternative | Why Prefer |
|------|-----------|-------------|------------|
| Rename/move file | MCP `file_operations` | `mv` + manual fixes | Auto-updates ALL imports (<1s for 47 refs) |
| Rename symbol | MCP `refactoring` rename | Standard `Edit` | Type-aware, finds dynamic imports, JSDoc |
| Extract function | MCP `refactoring` extract_function | Manual | Auto-detects params, types, closures |
| Find references | MCP `workspace` find_references | LSP/Grep | Catches dynamic imports, type-only refs |
| Fix TS errors | MCP `code_quality` fix_all | Manual | Compiler-verified, batch fixes |
| Organize imports | MCP `code_quality` organize_imports | Biome | Preserves side-effects, groups properly |
| Remove unused | MCP `code_quality` remove_unused | Manual | Safe, won't break code |
| Dead code cleanup | MCP `workspace` cleanup_codebase | Manual | Project-wide, entry-point aware |
| Precise text edit | Standard `Edit` | MCP replace | Unique string matching is safer |
| Text search | Standard `Grep` | MCP find | Faster for pattern matching |

---

## MCP-Only Capabilities

These tools have NO standard equivalent with the same power:

### `file_operations` - Rename/Move Files with Import Updates

```typescript
// Rename a file - updates all imports automatically
mcp__mcp-refactor-typescript__file_operations({
  operation: "rename_file",
  sourcePath: "src/services/UserService.ts",
  name: "MemberService.ts"
})

// Move file to new location
mcp__mcp-refactor-typescript__file_operations({
  operation: "move_file",
  sourcePath: "src/old/Component.tsx",
  destinationPath: "src/components/ui/Component.tsx"
})

// Batch move multiple files
mcp__mcp-refactor-typescript__file_operations({
  operation: "batch_move_files",
  files: ["src/utils/a.ts", "src/utils/b.ts"],
  targetFolder: "src/shared/utils"
})
```

### `refactoring` - Type-Aware Symbol Operations

```typescript
// Rename symbol at position - updates ALL references
mcp__mcp-refactor-typescript__refactoring({
  operation: "rename",
  filePath: "src/services/UserService.ts",
  line: 15,
  text: "getUserById",
  name: "findUserById"
})

// Extract function - auto-detects parameters and return type
mcp__mcp-refactor-typescript__refactoring({
  operation: "extract_function",
  filePath: "src/handlers/processOrder.ts",
  line: 42,
  text: "const total = items.reduce((sum, item) => sum + item.price, 0)",
  name: "calculateTotal"
})

// Extract constant
mcp__mcp-refactor-typescript__refactoring({
  operation: "extract_constant",
  filePath: "src/config.ts",
  line: 10,
  text: "1000 * 60 * 60 * 24",
  name: "MS_PER_DAY"
})

// Infer return type from implementation
mcp__mcp-refactor-typescript__refactoring({
  operation: "infer_return_type",
  filePath: "src/utils/format.ts",
  line: 5,
  text: "formatDate"
})
```

### `code_quality` - Automated Fixes

```typescript
// Fix ALL auto-fixable TypeScript errors
mcp__mcp-refactor-typescript__code_quality({
  operation: "fix_all",
  filePath: "src/components/Dashboard.tsx"
})

// Organize imports (groups, removes unused, preserves side-effects)
mcp__mcp-refactor-typescript__code_quality({
  operation: "organize_imports",
  filePath: "src/services/ApiClient.ts"
})

// Remove unused declarations
mcp__mcp-refactor-typescript__code_quality({
  operation: "remove_unused",
  filePath: "src/utils/helpers.ts"
})
```

### `workspace` - Project-Wide Operations

```typescript
// Find ALL references to a symbol (type-aware)
mcp__mcp-refactor-typescript__workspace({
  operation: "find_references",
  filePath: "src/services/AuthService.ts",
  line: 20,
  text: "validateToken"
})

// Move and organize a module (move + organize imports + fix errors)
mcp__mcp-refactor-typescript__workspace({
  operation: "refactor_module",
  sourcePath: "src/legacy/OldModule.ts",
  destinationPath: "src/core/NewModule.ts"
})

// Clean up dead code across codebase
mcp__mcp-refactor-typescript__workspace({
  operation: "cleanup_codebase",
  entrypoints: ["src/index.ts", "src/cli.ts"],
  deleteUnusedFiles: false,  // Preview only
  directory: "src"
})

// Restart TypeScript server (fixes stale state)
mcp__mcp-refactor-typescript__workspace({
  operation: "restart_tsserver"
})
```

---

## Tool Reference

### File Operations (`file_operations`)

| Operation | Purpose |
|-----------|---------|
| `rename_file` | Rename file, update all imports |
| `move_file` | Move file to new path, update imports |
| `batch_move_files` | Move multiple files at once |

### Code Quality (`code_quality`)

| Operation | Purpose |
|-----------|---------|
| `organize_imports` | Sort, group, remove unused imports |
| `fix_all` | Apply all auto-fixes for TS errors |
| `remove_unused` | Remove unused declarations |

### Refactoring (`refactoring`)

| Operation | Purpose |
|-----------|---------|
| `rename` | Rename symbol at position |
| `extract_function` | Extract code to named function |
| `extract_constant` | Extract value to named constant |
| `extract_variable` | Extract expression to variable |
| `infer_return_type` | Add explicit return type annotation |

### Workspace (`workspace`)

| Operation | Purpose |
|-----------|---------|
| `find_references` | Find all usages of symbol (type-aware) |
| `refactor_module` | Move + organize + fix a module |
| `cleanup_codebase` | Remove dead code from project |
| `restart_tsserver` | Restart TS language server |

---

## Common Workflows

### Safe Refactoring

1. Find references → MCP `workspace` find_references
2. Preview rename → MCP `refactoring` rename with `preview: true`
3. Apply rename → MCP `refactoring` rename
4. Organize imports → MCP `code_quality` organize_imports
5. Verify build → `bun run check`

### File Reorganization

1. Preview moves → MCP `file_operations` with `preview: true`
2. Move files → MCP `file_operations` move_file or batch_move_files
3. Fix any errors → MCP `code_quality` fix_all
4. Verify build → `bun run check`

### Code Cleanup

1. Fix all errors → MCP `code_quality` fix_all
2. Remove unused → MCP `code_quality` remove_unused
3. Organize imports → MCP `code_quality` organize_imports
4. Verify build → `bun run check`

### Dead Code Elimination

```typescript
// 1. Preview what would be removed
mcp__mcp-refactor-typescript__workspace({
  operation: "cleanup_codebase",
  entrypoints: ["src/index.ts"],
  deleteUnusedFiles: false,
  preview: true
})

// 2. Apply cleanup (careful!)
mcp__mcp-refactor-typescript__workspace({
  operation: "cleanup_codebase",
  entrypoints: ["src/index.ts"],
  deleteUnusedFiles: true
})
```

### Extract and Refactor

1. Identify code to extract → Standard `Read`
2. Extract function → MCP `refactoring` extract_function
3. Rename if needed → MCP `refactoring` rename
4. Organize imports → MCP `code_quality` organize_imports

---

## Position Parameters

The `line` and `text` parameters identify the symbol to operate on:

- `line`: 1-based line number where the symbol appears
- `text`: The exact symbol name or expression text to match

```typescript
// Example: Rename 'getUserById' on line 15
mcp__mcp-refactor-typescript__refactoring({
  operation: "rename",
  filePath: "src/services/UserService.ts",
  line: 15,           // Line number (1-based)
  text: "getUserById", // Exact symbol name
  name: "findUserById"
})
```

---

## Troubleshooting

### Symbol Not Found

```
Error: Could not find symbol
```
**Solution:** Ensure `text` matches the exact symbol name and `line` is correct. The line number is 1-based.

### No Changes Made

```
Result: No changes
```
**Solution:** The operation may have nothing to do. Use `preview: true` to verify the scope. For renames, ensure the new name differs from the old.

### Stale TypeScript State

If results seem incorrect or outdated:

```typescript
// Restart the TypeScript server
mcp__mcp-refactor-typescript__workspace({
  operation: "restart_tsserver"
})
```

### Import Paths Not Updated

After file moves, if some imports weren't updated:

1. Restart tsserver (see above)
2. Run organize_imports on affected files
3. Check that all files are saved in IDE

### Cleanup Deletes Too Much

**Prevention:** Always use `preview: true` first with `cleanup_codebase`. Ensure all entrypoints are specified.

```typescript
// Include ALL entry points
mcp__mcp-refactor-typescript__workspace({
  operation: "cleanup_codebase",
  entrypoints: [
    "src/index.ts",
    "src/cli.ts",
    "src/worker.ts"  // Don't forget workers, tests, etc.
  ],
  preview: true
})
```

---

## vs Standard Tools

| Scenario | MCP Wins | Standard Wins |
|----------|----------|---------------|
| Moving TS files | Catches 47 refs in <1s | `mv` breaks imports |
| Renaming symbols | Finds dynamic imports, mocks | `Edit` only does text |
| Finding references | Type-aware, complete | `Grep` misses type refs |
| Quick text edit | - | `Edit` is safer for targeted changes |
| Text search | - | `Grep` is faster for patterns |
| Simple file read | - | `Read` is simpler |

---

## Related

- JetBrains MCP integration: `.claude/skills/jetbrains-mcp.md`
- Effect patterns: `.claude/rules/effect-patterns.md`
- Testing patterns: `.claude/commands/patterns/effect-testing-patterns.md`
