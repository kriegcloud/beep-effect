# Discovery Kit

> Efficient patterns for finding files and content in the beep-effect codebase.

---

## File Discovery (Glob)

### Package Structure Patterns

```bash
# All packages
packages/*/package.json

# Specific slice (e.g., iam)
packages/iam/*/src/**/*.ts

# All domain models
packages/*/domain/src/**/*.ts

# All tables
packages/*/tables/src/**/*.ts

# All server implementations
packages/*/server/src/**/*.ts
```

### Configuration Files

```bash
# TypeScript configs
**/tsconfig*.json

# Package manifests
**/package.json

# Biome config
biome.jsonc

# Turbo config
turbo.json
```

### Documentation Files

```bash
# Package READMEs
packages/*/{AGENTS,README}.md

# Agent definitions
.claude/agents/*.md

# Skill definitions
.claude/skills/*/SKILL.md

# Spec handoffs
specs/*/handoffs/*.md
```

### Test Files

```bash
# All tests
**/test/**/*.test.ts

# Specific package tests
packages/{slice}/{layer}/test/**/*.test.ts
```

---

## Content Search (Grep)

### Effect Patterns

```typescript
// Find Effect.gen usage
pattern: "Effect\\.gen"
type: "ts"

// Find Schema definitions
pattern: "S\\.Struct|S\\.Class|S\\.TaggedStruct"
type: "ts"

// Find Layer.provide
pattern: "Layer\\.provide|Layer\\.merge"
type: "ts"

// Find tagged errors
pattern: "TaggedError|Data\\.TaggedError"
type: "ts"

// Find service definitions
pattern: "Context\\.Tag|Context\\.GenericTag"
type: "ts"
```

### Import Patterns

```typescript
// Find Effect namespace imports
pattern: "import \\* as [A-Z]\\w* from \"effect/"
type: "ts"

// Find @beep imports
pattern: "from \"@beep/"
type: "ts"

// Find cross-slice imports (potential violations)
pattern: "from \"@beep/(iam|documents|calendar|knowledge)-"
type: "ts"
```

### EntityId Patterns

```typescript
// Find EntityId definitions
pattern: "EntityIds\\.(\\w+)Id"
type: "ts"

// Find branded IDs
pattern: "\\.\\$type<.*Id\\.Type>"
type: "ts"
```

---

## Common Verification Sequences

### 1. Package Exists

```
Step 1: Glob → packages/{name}/package.json
Step 2: Read → Verify name field matches "@beep/{name}"
```

### 2. Export Exists

```
Step 1: Glob → packages/{package}/src/**/*.ts
Step 2: Grep → "export.*{name}"
Step 3: Read → Verify signature matches expectation
```

### 3. Type Defined

```
Step 1: Grep → "type {Name}|interface {Name}|class {Name}"
Step 2: Read → Check definition
```

### 4. Service Available

```
Step 1: Grep → "Context\\.Tag.*{ServiceName}"
Step 2: Grep → "Layer.*{ServiceName}Live"
Step 3: Verify both exist
```

### 5. Test Coverage

```
Step 1: Glob → packages/{package}/test/**/*.test.ts
Step 2: Read → Check test structure uses @beep/testkit
```

---

## Anti-Patterns (AVOID)

### ❌ Never use Bash for file discovery

```bash
# BAD - 10x slower, less accurate, bypasses tool optimization
find . -name "*.ts" | xargs grep "Effect"
ls -la packages/
```

### ✅ Always use Glob + Grep tools

```
# GOOD - Optimized, accurate
Glob: packages/**/src/**/*.ts
Grep: Effect\\.gen
```

### ❌ Never use cat/head/tail for reading

```bash
# BAD - Use Read tool instead
cat packages/iam/domain/src/index.ts
head -50 file.ts
```

### ✅ Always use Read tool

```
# GOOD - Proper file reading with context
Read: /full/path/to/file.ts
```

### ❌ Never use broad recursive searches without filtering

```bash
# BAD - Too broad, slow
Glob: **/*
Grep: "import"
```

### ✅ Always scope searches

```
# GOOD - Targeted search
Glob: packages/iam/*/src/**/*.ts
Grep: "import.*from \"@beep/"
```

---

## Performance Tips

1. **Glob first, Grep second** - Narrow file set before content search
2. **Use type filters** - `type: "ts"` is faster than globbing `*.ts`
3. **Scope to directories** - Search `packages/iam/` not `packages/`
4. **Use specific patterns** - `Effect\\.gen` not just `Effect`
5. **Limit results** - Use `head_limit` when exploring

---

## Quick Reference

| Task | Tool | Pattern |
|------|------|---------|
| Find package | Glob | `packages/{name}/package.json` |
| Find service | Grep | `Context\\.Tag.*{Name}` |
| Find tests | Glob | `**/test/**/*.test.ts` |
| Find imports | Grep | `from \"@beep/{package}\"` |
| Find exports | Grep | `export.*{name}` |
| Find schema | Grep | `S\\.Struct|S\\.Class` |
| Find layer | Grep | `Layer\\.provide|{Name}Live` |
| Find error | Grep | `TaggedError.*{Name}` |

---

## See Also

- `specs/_guide/AGENT_CAPABILITIES.md` - Agent selection guide
- `.claude/rules/effect-patterns.md` - Effect coding patterns
- `documentation/PACKAGE_STRUCTURE.md` - Package layout
