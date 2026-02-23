# Docgen Troubleshooting Guide

> Solutions to common issues with the docgen system.

## Table of Contents

- [General Issues](#general-issues)
- [Init Command Issues](#init-command-issues)
- [Analyze Command Issues](#analyze-command-issues)
- [Generate Command Issues](#generate-command-issues)
- [Aggregate Command Issues](#aggregate-command-issues)
- [Agents Command Issues](#agents-command-issues)
- [Configuration Issues](#configuration-issues)
- [JSDoc Issues](#jsdoc-issues)
- [Performance Issues](#performance-issues)

---

## General Issues

### Command Not Found

**Error:**
```
error: command not found: beep
```

**Solution:**
Use the package.json scripts instead:

```bash
bun run docgen:status
bun run docgen:analyze -- -p packages/common/contract
```

Or ensure the CLI is built:

```bash
bun run build
```

### No Packages Found

**Error:**
```
⚠ No packages with docgen.json found
```

**Solution:**
Initialize packages first:

```bash
bun run docgen:init -- -p packages/common/contract
```

### Permission Denied

**Error:**
```
EACCES: permission denied
```

**Solution:**
Check file permissions:

```bash
ls -la packages/common/contract/
chmod -R u+rw packages/common/contract/
```

---

## Init Command Issues

### Package Not Found

**Error:**
```
Error: Package not found: packages/common/missing
```

**Solutions:**

1. Verify the path exists:
   ```bash
   ls packages/common/
   ```

2. Check for typos in package name

3. Use the correct relative path from repo root

### TSConfig Not Found

**Error:**
```
Error: No tsconfig found in packages/common/contract
```

**Solution:**
Ensure the package has a tsconfig file:

```bash
ls packages/common/contract/tsconfig*.json
```

If missing, create one or copy from a similar package.

### Config Already Exists

**Error:**
```
Error: docgen.json already exists. Use --force to overwrite.
```

**Solution:**
Either use `--force` or manually edit the existing config:

```bash
bun run docgen:init -- -p packages/common/contract --force
```

---

## Analyze Command Issues

### No Exports Found

**Error:**
```
ℹ No exports found to analyze
```

**Causes:**
1. `srcDir` is incorrect in `docgen.json`
2. All files are excluded
3. No public exports in source files

**Solutions:**

1. Check `srcDir` setting:
   ```bash
   cat packages/common/contract/docgen.json | grep srcDir
   ```

2. Verify source files exist:
   ```bash
   ls packages/common/contract/src/
   ```

3. Check exclusion patterns aren't too broad

### Parse Error

**Error:**
```
Error: Failed to parse TypeScript file: src/contract.ts
```

**Causes:**
1. Syntax error in TypeScript file
2. Missing type definitions
3. ts-morph configuration issue

**Solutions:**

1. Run TypeScript check:
   ```bash
   bun run check
   ```

2. Fix any syntax errors in the file

3. Ensure all dependencies are installed:
   ```bash
   bun install
   ```

---

## Generate Command Issues

### Docgen Process Failed

**Error:**
```
✗ @beep/contract
  → Run: beep docgen analyze -p packages/common/contract
```

**Solution:**
Run analyze to see detailed issues:

```bash
bun run docgen:analyze -- -p packages/common/contract
```

### Example Validation Failed

**Error:**
```
Error: Example in src/contract.ts:42 failed to compile
```

**Causes:**
1. Missing import in example
2. Incorrect path mapping
3. Type error in example code

**Solutions:**

1. Check the example block imports:
   ```typescript
   /**
    * @example
    * ```typescript
    * import { Contract } from "@beep/contract"  // Ensure this import exists
    * ```
    */
   ```

2. Verify path mappings in `docgen.json`:
   ```json
   {
     "paths": {
       "@beep/contract": ["./src/index.ts"]
     }
   }
   ```

3. Test the example code manually

### Module Resolution Failed

**Error:**
```
Cannot find module '@beep/schema' or its corresponding type declarations.
```

**Solution:**
Add missing path mapping:

```json
{
  "examplesCompilerOptions": {
    "paths": {
      "@beep/schema": ["../schema/src/index.ts"]
    }
  }
}
```

---

## Aggregate Command Issues

### No Docs to Aggregate

**Error:**
```
⚠ No packages with generated docs found
```

**Solution:**
Generate docs first:

```bash
bun run docgen:generate
```

### Frontmatter Parse Error

**Error:**
```
Error: Failed to parse frontmatter in Contract.ts.md
```

**Solution:**
Check the generated markdown file for invalid YAML:

```bash
head -20 packages/common/contract/docs/modules/Contract.ts.md
```

Regenerate if corrupted:

```bash
rm -rf packages/common/contract/docs
bun run docgen:generate -- -p packages/common/contract
```

---

## Agents Command Issues

### API Key Not Set

**Error:**
```
Error: ANTHROPIC_API_KEY not set
```

**Solution:**
Set the environment variable:

```bash
export AI_ANTHROPIC_API_KEY=sk-ant-api03-...
# or
AI_ANTHROPIC_API_KEY=sk-ant-... bun run docgen:agents -- -p packages/common/contract
```

### No Packages to Process

**Error:**
```
No packages to process.
```

**Causes:**
1. No packages have `docgen.json`
2. Package path is incorrect
3. All packages are fully documented

**Solutions:**

1. Check package status:
   ```bash
   bun run docgen:status
   ```

2. Initialize packages:
   ```bash
   bun run docgen:init -- -p packages/common/contract
   ```

3. Verify the package path:
   ```bash
   bun run docgen:agents -- --dry-run -p packages/common/contract
   ```

### Rate Limit Exceeded

**Error:**
```
Error: Rate limit exceeded. Please wait before retrying.
```

**Solutions:**

1. Reduce parallelism:
   ```bash
   bun run docgen:agents -- --parallel 1
   ```

2. Use durable mode for automatic rate limiting:
   ```bash
   bun run docgen:agents -- --durable
   ```

3. Wait a few minutes before retrying

### Validation Failed

**Error:**
```
✗ @beep/contract: Validation failed - Example compilation error
```

**Solution:**
Review generated documentation and fix manually:

```bash
bun run docgen:analyze -- -p packages/common/contract
# Review JSDOC_ANALYSIS.md for remaining issues
```

### HTTP Client Error

**Error:**
```
TypeError: dispatcher.destroy is not a function
```

**Cause:**
Undici HTTP client incompatibility with Bun.

**Solution:**
This should be fixed in the current version. If you see this, ensure you have the latest code:

```bash
git pull
bun install
```

---

## Configuration Issues

### Invalid JSON

**Error:**
```
Error: Invalid JSON in docgen.json
```

**Solution:**
Validate JSON syntax:

```bash
cat packages/common/contract/docgen.json | jq .
```

Common issues:
- Trailing commas
- Missing quotes
- Unclosed brackets

### Schema Validation Failed

**Error:**
```
Error: Schema validation failed for docgen.json
```

**Solution:**
Check that all fields match the schema:

```json
{
  "$schema": "../../node_modules/@effect/docgen/schema.json",
  "srcDir": "src",  // Must be string
  "exclude": []     // Must be array of strings
}
```

### Wrong Schema Path

**Symptom:**
IDE doesn't provide autocompletion

**Solution:**
Fix the relative path based on package depth:

```json
// packages/common/contract (depth 2)
"$schema": "../../node_modules/@effect/docgen/schema.json"
```

---

## JSDoc Issues

### Missing Required Tags

**Error in JSDOC_ANALYSIS.md:**
```
- [ ] `src/contract.ts:42` — **Contract** (type)
  - Missing: @category, @example, @since
```

**Solution:**
Add the required tags:

```typescript
/**
 * Contract type definition.
 *
 * @example
 * ```typescript
 * import { Contract } from "@beep/contract"
 * // usage example
 * ```
 *
 * @category Models
 * @since 0.1.0
 */
export type Contract = ...
```

### Example Import Errors

**Error:**
```
@example import failed: Cannot find module '@beep/contract'
```

**Solutions:**

1. Use correct import path in example:
   ```typescript
   /**
    * @example
    * ```typescript
    * import { Contract } from "@beep/contract"
    * ```
    */
   ```

2. Add path mapping in `docgen.json`:
   ```json
   {
     "paths": {
       "@beep/contract": ["./src/index.ts"]
     }
   }
   ```

### Example Runtime Errors

**Error:**
```
@example failed: TypeError: Cannot read property 'x' of undefined
```

**Solution:**
Ensure examples are complete and self-contained:

```typescript
/**
 * @example
 * ```typescript
 * import { make } from "@beep/contract"
 *
 * const contract = make({
 *   input: S.Struct({ name: S.String }),
 *   output: S.Struct({ id: S.String }),
 * })
 *
 * // Show expected output
 * console.log(contract)
 * // => { input: Schema<...>, output: Schema<...> }
 * ```
 */
```

### Category Naming

**Recommended Categories:**

| Category | Use For |
|----------|---------|
| `Constructors` | Factory functions, builders |
| `Models` | Types, interfaces |
| `Utils` | Utility functions |
| `Errors` | Error classes |
| `Services` | Effect services |
| `Layers` | Effect layers |
| `Schemas` | Effect schemas |

---

## Performance Issues

### Slow Analysis

**Symptom:**
Analyze command takes several minutes.

**Solutions:**

1. Exclude unnecessary files:
   ```json
   {
     "exclude": [
       "src/internal/**/*.ts",
       "src/__tests__/**/*.ts"
     ]
   }
   ```

2. Target specific package instead of all:
   ```bash
   bun run docgen:analyze -- -p packages/common/contract
   ```

### Slow Generation

**Symptom:**
Generate command takes too long.

**Solutions:**

1. Increase parallelism:
   ```bash
   bun run docgen:generate -- --parallel 8
   ```

2. Skip example validation for quick runs:
   ```bash
   bun run docgen:generate  # without --validate-examples
   ```

### High Memory Usage

**Symptom:**
Out of memory errors during analysis.

**Solutions:**

1. Process packages individually:
   ```bash
   bun run docgen:analyze -- -p packages/common/contract
   ```

2. Increase Node memory limit:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" bun run docgen:analyze
   ```

---

## Getting Help

### Debug Output

Enable verbose logging:

```bash
bun run docgen:status -- --verbose
bun run docgen:agents -- --verbose --dry-run
```

### Check Version

Verify you're using the latest version:

```bash
git log -1 --oneline tooling/cli/src/commands/docgen/
```

### File an Issue

If the problem persists:

1. Collect reproduction steps
2. Include relevant config files
3. Include full error output
4. Open an issue on GitHub

---

## Related Documentation

- [DOCGEN.md](./DOCGEN.md) - Main command reference
- [DOCGEN_QUICK_START.md](./DOCGEN_QUICK_START.md) - Getting started guide
- [DOCGEN_AGENTS.md](./DOCGEN_AGENTS.md) - AI agent details
- [DOCGEN_CONFIGURATION.md](./DOCGEN_CONFIGURATION.md) - Configuration options
