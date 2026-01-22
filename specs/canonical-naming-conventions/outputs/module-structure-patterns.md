# Module Structure Patterns

> Phase 2 deliverable: Standardized barrel export and module organization patterns.

---

## Executive Summary

This document defines the canonical module structure for beep-effect packages, synthesizing the IAM client's successful 4-file pattern with Effect ecosystem conventions. The key patterns are: (1) `index.ts` for public API exports, (2) `mod.ts` for internal module aggregation within feature directories, and (3) namespace exports for organizing related functionality.

---

## 1. Current State Analysis

### 1.1 Barrel File Distribution

| Pattern | Count | Usage |
|---------|-------|-------|
| `index.ts` | 432 | Throughout (public API) |
| `mod.ts` | 49 | IAM client only (internal aggregation) |

### 1.2 Export Pattern Distribution

| Pattern | Percentage | Example |
|---------|------------|---------|
| Direct re-export (`export * from`) | 88% | UI, tables, repos |
| Namespace export (`export * as Name`) | 22% | Domain entities, layers |
| mod.ts + namespace | 12% | IAM client features |
| Hybrid | 3% | Package roots |

*Note: Percentages exceed 100% because hybrid files are counted multiple times.*

---

## 2. Canonical Module Structure

### 2.1 Package-Level Structure

```
packages/{slice}/{layer}/
├── src/
│   ├── index.ts              # Public API (exports for consumers)
│   ├── {feature}/            # Feature directories
│   │   ├── index.ts          # Feature exports (optional)
│   │   ├── mod.ts            # Module aggregation
│   │   └── {files}.ts        # Implementation files
│   └── _internal/            # Internal implementation (not exported)
└── package.json
```

### 2.2 Role Separation: index.ts vs mod.ts

| File | Purpose | Consumers | Content |
|------|---------|-----------|---------|
| `index.ts` | Public API | External packages | Namespace exports, public types |
| `mod.ts` | Internal aggregation | Sibling directories | Direct re-exports of implementations |

**Key Distinction**:
- `index.ts` answers: "What does this package/feature export to the world?"
- `mod.ts` answers: "What files compose this module internally?"

---

## 3. Export Patterns

### 3.1 Package Root index.ts

**Pattern**: Namespace exports for major features, organized by domain.

```typescript
// packages/iam/client/src/index.ts
export * as SignIn from "./sign-in/mod.js"
export * as SignUp from "./sign-up/mod.js"
export * as Password from "./password/mod.js"
export * as TwoFactor from "./two-factor/mod.js"
export * as Organization from "./organization/mod.js"

// Re-export core types
export type { Session, User } from "./types.js"
```

**Rationale**:
1. **Namespace isolation**: `SignIn.email.handler` vs `Password.reset.handler`
2. **Tree-shaking**: Bundlers can eliminate unused namespaces
3. **Discovery**: Import autocomplete shows feature groups
4. **Effect alignment**: Matches `@effect/platform` pattern

### 3.2 Feature mod.ts

**Pattern**: Direct re-exports aggregating feature implementations.

```typescript
// packages/iam/client/src/sign-in/mod.ts
export * from "./service.js"
export * from "./layer.js"
export * from "./atoms.js"

export * as Email from "./email/mod.js"
export * as MagicLink from "./magic-link/mod.js"
export * as Social from "./social/mod.js"
```

**Rationale**:
1. **Feature cohesion**: All sign-in exports in one place
2. **Sub-feature namespacing**: Email vs MagicLink vs Social
3. **Layer composition**: Aggregates service, layer, atoms

### 3.3 Action-Level mod.ts

**Pattern**: Direct re-exports for atomic actions.

```typescript
// packages/iam/client/src/sign-in/email/mod.ts
export * from "./handler.js"
export * from "./contract.js"
```

**Rationale**: Simple aggregation—no namespacing needed at leaf level.

---

## 4. IAM Client 4-File Pattern

The IAM client established a highly consistent pattern for RPC features:

### 4.1 Directory Structure

```
src/{feature}/
├── index.ts              # Public API re-export
├── mod.ts                # Module aggregation
├── layer.ts              # Effect Layer composition
├── service.ts            # Service definitions
├── atoms.ts              # Jotai state (optional)
├── form.ts               # Form validation (optional)
└── {action}/
    ├── index.ts          # Action re-export
    ├── mod.ts            # Action aggregation
    ├── handler.ts        # Effect-based RPC handler
    └── contract.ts       # Request/response schemas
```

### 4.2 File Responsibilities

| File | Responsibility | Exports |
|------|----------------|---------|
| `index.ts` | Re-export from mod.ts | `export * from "./mod.js"` |
| `mod.ts` | Aggregate feature | Services, layer, sub-actions |
| `layer.ts` | Effect Layer | `{Feature}Layer` |
| `service.ts` | Service interface | `{Feature}Service` |
| `atoms.ts` | Jotai atoms | `{action}Atom` |
| `form.ts` | Form schema | `{Feature}FormSchema` |
| `handler.ts` | RPC handler | `handler` (default) |
| `contract.ts` | RPC schemas | `Payload`, `Success`, `Error` |

### 4.3 Example: sign-in/email

```typescript
// sign-in/email/contract.ts
import * as S from "effect/Schema"

export const Payload = S.Struct({
  email: S.String,
  password: S.Redacted(S.String),
})

export const Success = S.Struct({
  user: UserSchema,
  session: SessionSchema,
})

export type Payload = S.Schema.Type<typeof Payload>
export type Success = S.Schema.Type<typeof Success>
```

```typescript
// sign-in/email/handler.ts
import { createHandler } from "@beep/client-factory"
import * as Contract from "./contract.js"

export const handler = createHandler({
  domain: "sign-in",
  feature: "email",
  payloadSchema: Contract.Payload,
  successSchema: Contract.Success,
  execute: (payload) => authClient.signIn.email(payload),
  mutatesSession: true,
})
```

---

## 5. Domain Entity Module Structure

### 5.1 Entity Directory Structure

```
src/entities/{entity}/
├── index.ts                    # Namespace export
├── {entity}.model.ts           # Domain model (S.Class)
├── {entity}.errors.ts          # Domain errors
├── {entity}.rpc.ts             # RPC definitions (optional)
└── schemas/
    ├── index.ts                # Schema exports
    └── {enum-or-vo}.schema.ts  # Individual schemas
```

### 5.2 Entity index.ts Pattern

```typescript
// packages/iam/domain/src/entities/member/index.ts
export * from "./member.model.js"
export * from "./member.errors.js"
export * as Schemas from "./schemas/index.js"
```

**Rationale**: Flat re-exports for model and errors, namespace for schemas to avoid collision.

---

## 6. When to Use Each Pattern

### 6.1 Decision Tree

```
Is this a package root (src/index.ts)?
├── Yes → Use index.ts ONLY with namespace exports
│         export * as Feature from "./feature/mod.js"
│
└── No → Is this a feature directory (e.g., sign-in/)?
         ├── Yes → Use BOTH mod.ts AND index.ts
         │         • mod.ts: Aggregates feature internals
         │         • index.ts: Re-exports from mod.ts (export * from "./mod.js")
         │
         └── No → Is this an action subdirectory (e.g., sign-in/email/)?
                  ├── Yes → Use mod.ts ONLY
                  │         (No index.ts needed at leaf level)
                  │
                  └── No → No barrel needed (import directly)
```

### 6.2 Why Both mod.ts and index.ts in Feature Directories?

| File | Purpose | Consumers |
|------|---------|-----------|
| `mod.ts` | Aggregates all feature exports | Parent features, sibling directories |
| `index.ts` | Provides Node.js resolution | External packages, IDE navigation |

**Example**: `packages/iam/client/src/sign-in/`
```typescript
// mod.ts - Feature aggregation
export * from "./service.js"
export * from "./layer.js"
export * as Email from "./email/mod.js"

// index.ts - Node.js resolution
export * from "./mod.js"
```

**Rationale**:
- `mod.ts` is an Effect/Deno convention for internal module boundaries
- `index.ts` is the Node.js convention for package resolution
- Having both enables both import styles to work correctly

### 6.3 Summary Table

| Context | Use `index.ts` | Use `mod.ts` | Export Style | Status |
|---------|----------------|--------------|--------------|--------|
| Package root | Yes | No | Namespace | CURRENT |
| Feature directory | Yes | Yes | Mixed (both) | CURRENT |
| Sub-feature (action) | No | Yes | Direct | CURRENT |
| Utility directory | Yes | No | Direct | CURRENT |
| Entity directory | Yes | No | Direct + namespace for schemas | CURRENT |

---

## 7. Anti-Patterns

### 7.1 Avoid: Deep Barrel Chains

```typescript
// AVOID: Multiple levels of re-export
// packages/iam/client/src/index.ts
export * from "./sign-in/index.js"
// which re-exports from sign-in/mod.ts
// which re-exports from sign-in/email/mod.ts

// PREFER: Direct namespace path
export * as SignIn from "./sign-in/mod.js"
```

**Rationale**: Deep chains obscure the actual export source and hurt tree-shaking.

### 7.2 Avoid: Mixing Direct and Namespace in Same File

```typescript
// AVOID: Confusing mix
export * from "./service.js"           // Direct
export * as Email from "./email/mod.js" // Namespace
export { handler } from "./handler.js"  // Named

// PREFER: Consistent style per purpose
// Package roots: Namespace exports
// Feature aggregation: Direct re-exports
```

### 7.3 Avoid: index.ts with Implementation

```typescript
// AVOID: index.ts containing implementation
// packages/iam/client/src/sign-in/index.ts
export const signIn = () => { /* implementation */ }

// PREFER: Separate implementation from exports
// handler.ts contains implementation
// index.ts re-exports from mod.ts
```

---

## 8. Migration Guidance

### 8.1 Adding mod.ts to Existing Features

For packages that don't have mod.ts (e.g., documents-client):

1. Create `mod.ts` aggregating existing files
2. Update `index.ts` to re-export from `mod.ts`
3. Test that all exports remain available

```typescript
// Before: index.ts with direct implementation exports
export * from "./service.js"
export * from "./handler.js"

// After: index.ts re-exporting from mod.ts
export * from "./mod.js"

// mod.ts containing aggregation
export * from "./service.js"
export * from "./handler.js"
```

### 8.2 Converting Direct Re-exports to Namespaces

For package roots that use direct re-exports:

```typescript
// Before
export * from "./sign-in/index.js"
export * from "./sign-up/index.js"

// After
export * as SignIn from "./sign-in/mod.js"
export * as SignUp from "./sign-up/mod.js"
```

**Warning**: This is a breaking change for consumers. Requires coordinated migration.

---

## 9. Effect Ecosystem Alignment

### 9.1 Official Effect Pattern

```typescript
// @effect/platform/src/index.ts
export * as HttpClient from "./http-client.js"
export * as HttpServer from "./http-server.js"
export * as FileSystem from "./file-system.js"
```

**Key observations**:
- All namespace exports
- kebab-case file, PascalCase namespace
- No `mod.ts` (simpler structure)

### 9.2 beep-effect Adaptation

beep-effect extends the Effect pattern with:
- `mod.ts` for internal aggregation (feature complexity)
- 4-file pattern for RPC features (handler, contract, service, layer)
- Sub-feature namespacing (sign-in/email, sign-in/social)

This is appropriate given the larger feature scope compared to Effect core packages.

---

## 10. Verification Commands

```bash
# Count mod.ts adoption
find packages -name "mod.ts" | wc -l

# Find packages without mod.ts pattern
find packages/*/client/src -type d -mindepth 1 -maxdepth 1 | while read dir; do
  [ ! -f "$dir/mod.ts" ] && echo "Missing mod.ts: $dir"
done

# Verify namespace exports in package roots
grep -l "export \* as" packages/*/client/src/index.ts

# Find hybrid export patterns (may need review)
grep -l "export \* from" packages/*/client/src/index.ts
```

---

*Generated: Phase 2 - Synthesis*
*Evidence Sources: Phase 0 (existing-patterns-audit.md), Phase 1 (fp-repo-conventions.md, llms-txt-patterns.md)*
