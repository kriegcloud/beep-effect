# Structure Standardization Specification

> Systematic standardization of folder structure, naming conventions, and file formats across the beep-effect monorepo for optimal LLM comprehension.

## Motivation

LLMs (Claude, GPT, Codex) perform significantly better when codebases follow predictable, consistent patterns:

1. **Predictable file locations** - LLMs can infer where code lives without exhaustive searching
2. **Self-documenting names** - Suffixes like `.layer.ts`, `.repo.ts` indicate purpose
3. **Consistent casing** - Reduces cognitive load and grep complexity
4. **Flat-ish hierarchies** - Easier to navigate and reference in prompts

## Current State Summary

An audit of the codebase found:

| Pattern             | Status                       | Issue                        |
|---------------------|------------------------------|------------------------------|
| Entity directories  | Consistent (PascalCase)      | -                            |
| Feature directories | Consistent (kebab-case)      | -                            |
| Model files         | Consistent (`Name.model.ts`) | -                            |
| Layer files         | Consistent (`Name.layer.ts`) | -                            |
| **Table files**     | **INCONSISTENT**             | Mixed camelCase/kebab-case   |
| **Service files**   | **INCONSISTENT**             | Mixed PascalCase/kebab-case  |
| **Atom files**      | **Minor issue**              | `.atom.ts` vs `.atoms.ts`    |
| **Schema types**    | **Unclear**                  | `.schema.ts` suffix optional |

## Files in This Spec

| File                        | Purpose                                    |
|-----------------------------|--------------------------------------------|
| `README.md`                 | This overview                              |
| `CONVENTIONS.md`            | Target conventions (the "golden standard") |
| `DISCOVERY_PROMPT.md`       | Prompt to inventory all violations         |
| `ORCHESTRATION_TEMPLATE.md` | Execution guide for refactoring            |
| `PLAN.md`                   | Generated checklist (created by discovery) |

## Quick Start

### Step 1: Review Conventions
Read `CONVENTIONS.md` to understand the target state.

### Step 2: Run Discovery
Provide `DISCOVERY_PROMPT.md` to a Claude session. It will generate `PLAN.md` with all files needing changes.

### Step 3: Execute Refactoring
Provide the generated orchestration prompt to execute the plan package-by-package.

## Why These Conventions Matter for LLMs

### 1. Suffix-Based File Discovery
```
"Find the user repository" → Look for `User.repo.ts`
"Find the auth layer" → Look for `Auth.layer.ts` or `Authentication.layer.ts`
```

### 2. Predictable Import Paths
```typescript
// LLM can predict these patterns:
import { UserRepo } from "@beep/iam-server/repos"
import { UserModel } from "@beep/iam-domain/entities"
import { signInAtoms } from "@beep/iam-client/atoms"
```

### 3. Grep-Friendly Patterns
```bash
# Find all repositories
find . -name "*.repo.ts"

# Find all layers
find . -name "*.layer.ts"

# Find all handlers
find . -name "*.handlers.ts"
```

### 4. Consistent Mental Model
When an LLM sees `packages/iam/server/src/`, it can immediately predict:
- `db/repos/` - Repository files
- `handlers/` - Request handlers
- `layers/` - Effect layers
- `services/` - Business logic

## Success Criteria

After standardization:
- [ ] All table files use consistent casing
- [ ] All service files use consistent casing
- [ ] All atom files use consistent singular/plural
- [ ] All schema files use consistent suffix patterns
- [ ] Directory structure is documented and predictable
- [ ] New packages can be scaffolded from templates
