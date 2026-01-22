# Naming Conventions Rules (DRAFT)

> Phase 2 deliverable: Actionable rules file for `.claude/rules/naming-conventions.md`.

---

## Status Legend

Throughout this document, patterns are marked with their current adoption status:

| Status | Meaning |
|--------|---------|
| **CURRENT** | Pattern is already followed in codebase |
| **TARGET** | Aspirational pattern requiring migration |
| **PARTIAL** | Some adoption, inconsistent across slices |

---

## File Naming Conventions

ALWAYS follow these naming conventions for consistency and greppability.

### Casing Rules

| File Type | Casing | Example | Status |
|-----------|--------|---------|--------|
| **Folders** | kebab-case | `sign-in/`, `api-key/` | CURRENT |
| **Table files** | kebab-case | `api-key.table.ts` | TARGET (currently camelCase) |
| **Schema files** | kebab-case | `member-status.schema.ts` | TARGET (currently no postfix) |
| **Model files** | kebab-case | `member.model.ts` | CURRENT |
| **Repo files** | PascalCase | `Member.repo.ts` | CURRENT |
| **Server handlers** | PascalCase | `Document.handlers.ts` | CURRENT |
| **Client feature files** | semantic names | `handler.ts`, `contract.ts` | CURRENT |
| **UI views** | kebab-case | `sign-in.view.tsx` | CURRENT |

**Rationale**: kebab-case aligns with Effect ecosystem; PascalCase for repos/handlers preserves entity name encoding.

---

## Postfix Types

This codebase uses TWO distinct postfix patterns:

### 1. Dot-Prefixed Postfixes (Entity-Named Files)

Used when the filename encodes an entity or concept name:

```
{entity-name}.{postfix}.ts
```

**Examples**: `member.model.ts`, `api-key.table.ts`, `Document.handlers.ts`

### 2. Semantic Filenames (Context-Named Files)

Used within feature directories where the directory provides context:

```
{semantic-name}.ts
```

**Examples**: `handler.ts`, `contract.ts`, `service.ts`, `layer.ts`, `mod.ts`

**Key distinction**: Semantic filenames have NO dot before the name because they describe the file's role, not its subject.

---

## Postfix Reference

### Domain Layer (`packages/{slice}/domain/`)

| Postfix | Purpose | Example | Status |
|---------|---------|---------|--------|
| `.model.ts` | Domain entity (Effect Schema class) | `member.model.ts` | CURRENT |
| `.errors.ts` | Domain error definitions | `document.errors.ts` | PARTIAL (documents only) |
| `.rpc.ts` | RPC contract definitions | `document.rpc.ts` | PARTIAL (documents only) |
| `.value.ts` | Value objects | `attributes.value.ts` | TARGET (currently no postfix) |
| `.schema.ts` | Validation/enum schemas | `member-status.schema.ts` | TARGET (currently no postfix) |

### Tables Layer (`packages/{slice}/tables/`)

| Postfix | Purpose | Example | Status |
|---------|---------|---------|--------|
| `.table.ts` | Drizzle table definition | `api-key.table.ts` | CURRENT (casing migration needed) |

### Server Layer (`packages/{slice}/server/`)

| Postfix | Purpose | Example | Status |
|---------|---------|---------|--------|
| `.repo.ts` | Database repository | `Member.repo.ts` | CURRENT |
| `.handlers.ts` | RPC handler collection | `Document.handlers.ts` | CURRENT |
| `.job.ts` | Background job | `cleanup-upload-sessions.job.ts` | TARGET |

**Note**: Server layer uses dot-prefixed postfixes because files are entity-named.

### Client Layer (`packages/{slice}/client/`)

| Pattern | Purpose | Example | Status |
|---------|---------|---------|--------|
| `contract.ts` | RPC payload/success schemas | `sign-in/email/contract.ts` | CURRENT |
| `handler.ts` | Effect-based RPC handler | `sign-in/email/handler.ts` | CURRENT |
| `layer.ts` | Feature Layer composition | `sign-in/layer.ts` | CURRENT |
| `service.ts` | Feature service aggregation | `sign-in/service.ts` | CURRENT |
| `atoms.ts` | Atom collection | `sign-in/atoms.ts` | CURRENT |
| `form.ts` | Form validation schema | `sign-in/form.ts` | CURRENT |
| `mod.ts` | Module aggregation | `sign-in/mod.ts` | CURRENT |

**Note**: Client layer uses semantic filenames (no dot prefix) because directory context provides meaning.

### UI Layer (`packages/{slice}/ui/`)

| Postfix | Purpose | Example | Status |
|---------|---------|---------|--------|
| `.view.tsx` | Page-level view component | `sign-in.view.tsx` | CURRENT |
| `.form.tsx` | Form component | `sign-up.form.tsx` | CURRENT |

**Note**: `.dialog.tsx`, `.provider.tsx`, `.context.ts` are reserved for future use but not yet adopted.

### Common Layer (`packages/common/`)

| Postfix | Purpose | Example | Status |
|---------|---------|---------|--------|
| `.types.ts` | TypeScript type definitions | `unsafe.types.ts` | CURRENT |

**Note**: `.utils.ts` and `.constants.ts` are reserved for future use. Current utils/constants use directory structure instead of postfixes.

### Barrel Exports

| Pattern | Purpose | Example | Status |
|---------|---------|---------|--------|
| `index.ts` | Public API export | `src/index.ts` | CURRENT |
| `mod.ts` | Internal module aggregation | `sign-in/mod.ts` | CURRENT |

---

## mod.ts vs index.ts Decision Tree

Both `mod.ts` and `index.ts` exist in client features. Here's when to use each:

```
Is this a package entry point?
├── Yes → Use index.ts only
│         (packages/iam/client/src/index.ts)
│
└── No → Is this a feature directory?
         ├── Yes → Use BOTH mod.ts AND index.ts
         │         • mod.ts: Aggregates feature internals
         │         • index.ts: Re-exports from mod.ts (export * from "./mod.js")
         │
         └── No → Is this an action subdirectory?
                  └── Yes → Use mod.ts only
                            (sign-in/email/mod.ts)
```

### Why Both Files?

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

---

## Layer-Postfix Mapping

Each postfix belongs to specific architectural layers:

| Layer | Exclusive Postfixes | Status |
|-------|---------------------|--------|
| **domain** | `.model.ts`, `.errors.ts`, `.rpc.ts`, `.value.ts` | PARTIAL |
| **tables** | `.table.ts` | CURRENT |
| **server** | `.repo.ts`, `.handlers.ts`, `.job.ts` | CURRENT |
| **client** | `contract.ts`, `handler.ts`, `atoms.ts`, `form.ts` | CURRENT |
| **ui** | `.view.tsx`, `.form.tsx` | CURRENT |
| **common** | `.types.ts` | CURRENT |

**Shared patterns** (appear in multiple layers):
- `service.ts` / `.service.ts` - Client uses semantic, server uses dot-prefix
- `layer.ts` / `.layer.ts` - Client uses semantic, server uses dot-prefix
- `.schema.ts` - Domain layer only
- `index.ts`, `mod.ts` - All layers

---

## Module Structure

### Package Root Pattern

ALWAYS use namespace exports in package root `index.ts`:

```typescript
// packages/iam/client/src/index.ts
export * as SignIn from "./sign-in/mod.js"
export * as SignUp from "./sign-up/mod.js"
export * as Password from "./password/mod.js"
```

### Feature Directory Pattern

ALWAYS include `mod.ts` for feature aggregation:

```typescript
// packages/iam/client/src/sign-in/mod.ts
export * from "./service.js"
export * from "./layer.js"
export * as Email from "./email/mod.js"
export * as Social from "./social/mod.js"
```

### 4-File Feature Pattern (Client)

Client features SHOULD follow this structure:

```
src/{feature}/
├── index.ts          # Re-export from mod.ts
├── mod.ts            # Module aggregation
├── layer.ts          # Effect Layer
├── service.ts        # Service definitions
└── {action}/
    ├── mod.ts        # Action aggregation
    ├── handler.ts    # RPC handler
    └── contract.ts   # Request/response schemas
```

### Entity Directory Pattern (Domain)

Domain entities SHOULD follow this structure:

```
src/entities/{entity}/
├── index.ts              # Entity exports
├── {entity}.model.ts     # Domain model
├── {entity}.errors.ts    # Domain errors (TARGET)
└── schemas/
    └── *.schema.ts       # Enum/VO schemas (TARGET)
```

---

## Verification Commands

```bash
# Find files not following kebab-case convention (tables)
find packages -name "*.table.ts" | xargs basename -a | grep -E '[A-Z]'

# Find schema files missing postfix
find packages -path "*/schemas/*" -name "*.ts" -not -name "*.schema.ts" -not -name "index.ts"

# Find value objects missing postfix
find packages -path "*/value-objects/*" -name "*.ts" -not -name "*.value.ts" -not -name "index.ts"

# Verify all postfixes are unique to their purpose
find packages -name "*.ts" | grep -oE '\.[a-z-]+\.tsx?$' | sort | uniq -c | sort -rn

# Find directories missing mod.ts (client features)
find packages/*/client/src -type d -mindepth 1 -maxdepth 1 | while read dir; do
  [ ! -f "$dir/mod.ts" ] && echo "Missing mod.ts: $dir"
done
```

---

## Anti-Patterns

### NEVER: Mixed Casing in Same Category

```typescript
// WRONG - Mixed casing for table files
apiKey.table.ts       // camelCase
upload-session.table.ts  // kebab-case

// CORRECT - Consistent kebab-case
api-key.table.ts
upload-session.table.ts
```

### NEVER: Missing Semantic Postfixes

```typescript
// WRONG - No postfix for value object
value-objects/Attributes.ts

// CORRECT - With postfix
value-objects/attributes.value.ts
```

### NEVER: Deep Barrel Chains

```typescript
// WRONG - Multiple levels of re-export obscuring source
// index.ts → mod.ts → feature/index.ts → feature/mod.ts

// CORRECT - Direct namespace path
export * as SignIn from "./sign-in/mod.js"
```

### NEVER: Implementation in index.ts

```typescript
// WRONG - index.ts with implementation
// index.ts
export const signIn = () => { /* implementation */ }

// CORRECT - Separate implementation from exports
// handler.ts contains implementation
// index.ts re-exports from mod.ts
```

### NEVER: Mixing Export Styles

```typescript
// WRONG - Confusing mix in same file
export * from "./service.js"           // Direct
export * as Email from "./email/mod.js" // Namespace
export { handler } from "./handler.js"  // Named

// CORRECT - Consistent style per context
// Package roots: All namespace
// Feature aggregation: All direct
```

---

## Examples

### Good: Complete Feature Structure

```
packages/iam/client/src/sign-in/
├── index.ts              # export * from "./mod.js"
├── mod.ts                # Aggregates service, layer, sub-features
├── layer.ts              # SignInLayer
├── service.ts            # SignInService
├── atoms.ts              # signInAtom
├── email/
│   ├── mod.ts            # export * from "./handler.js", "./contract.js"
│   ├── handler.ts        # Effect handler
│   └── contract.ts       # Payload, Success schemas
└── social/
    ├── mod.ts
    ├── handler.ts
    └── contract.ts
```

### Good: Domain Entity Structure

```
packages/iam/domain/src/entities/member/
├── index.ts              # export * from "./member.model.js", "./member.errors.js"
├── member.model.ts       # Member class
├── member.errors.ts      # MemberNotFound, etc.
└── schemas/
    ├── index.ts          # export * from "./*.schema.js"
    ├── member-status.schema.ts
    └── member-role.schema.ts
```

### Good: Server Repository Structure

```
packages/iam/server/src/db/repos/
├── index.ts              # export * from "./*.repo.js"
├── Member.repo.ts        # MemberRepo
├── ApiKey.repo.ts        # ApiKeyRepo
└── Session.repo.ts       # SessionRepo
```

---

## Migration Notes

### Table File Renames (19 files)

Files requiring camelCase → kebab-case migration:

**packages/iam/tables/src/tables/**
- `apiKey.table.ts` → `api-key.table.ts`
- `deviceCodes.table.ts` → `device-codes.table.ts`
- `oauthAccessToken.table.ts` → `oauth-access-token.table.ts`
- `oauthRefreshToken.table.ts` → `oauth-refresh-token.table.ts`
- `oauthClient.table.ts` → `oauth-client.table.ts`
- `oauthConsent.table.ts` → `oauth-consent.table.ts`
- `rateLimit.table.ts` → `rate-limit.table.ts`
- `walletAddress.table.ts` → `wallet-address.table.ts`
- `twoFactor.table.ts` → `two-factor.table.ts`
- `scimProvider.table.ts` → `scim-provider.table.ts`
- `organizationRole.table.ts` → `organization-role.table.ts`
- `teamMember.table.ts` → `team-member.table.ts`
- `ssoProvider.table.ts` → `sso-provider.table.ts`

**packages/documents/tables/src/tables/**
- `documentFile.table.ts` → `document-file.table.ts`
- `documentVersion.table.ts` → `document-version.table.ts`

**packages/knowledge/tables/src/tables/**
- `classDefinition.table.ts` → `class-definition.table.ts`
- `propertyDefinition.table.ts` → `property-definition.table.ts`
- `entityCluster.table.ts` → `entity-cluster.table.ts`
- `sameAsLink.table.ts` → `same-as-link.table.ts`

### Schema File Updates (~15 files)

Files requiring `.schema.ts` postfix addition:

**packages/iam/domain/src/entities/*/schemas/**
- `member-status.ts` → `member-status.schema.ts`
- `member-role.ts` → `member-role.schema.ts`
- `invitation-status.ts` → `invitation-status.schema.ts`
- `authenticator-attachment.ts` → `authenticator-attachment.schema.ts`
- (and ~10 more in various entity schema directories)

### Value Object Postfix Addition (17 files)

Files requiring `.value.ts` postfix:

**packages/knowledge/domain/src/value-objects/**
- `Attributes.ts` → `attributes.value.ts`
- `EvidenceSpan.ts` → `evidence-span.value.ts`

**packages/shared/domain/src/value-objects/**
- `EntitySource.ts` → `entity-source.value.ts`

**packages/iam/domain/src/value-objects/**
- `paths.ts` → `paths.value.ts`

**packages/documents/domain/src/value-objects/**
- `LinkType.ts` → `link-type.value.ts`
- `TextStyle.ts` → `text-style.value.ts`

**packages/calendar/domain/src/value-objects/**
- `calendar-color-option.ts` → `calendar-color-option.value.ts`
- `time-grid-view.ts` → `time-grid-view.value.ts`
- `calendar-event.ts` → `calendar-event.value.ts`
- `calendar-view.ts` → `calendar-view.value.ts`
- `day-grid-view.ts` → `day-grid-view.value.ts`
- `calendar-filter.ts` → `calendar-filter.value.ts`
- `list-view.ts` → `list-view.value.ts`
- `date-picker-control.ts` → `date-picker-control.value.ts`
- `calendar-range.ts` → `calendar-range.value.ts`

**packages/comms/domain/src/value-objects/** (consolidation: plural → singular)
- `mail.values.ts` → `mail.value.ts`
- `logging.values.ts` → `logging.value.ts`

### Implementation Tooling

Use `.claude/skills/mcp-refactor-typescript.md` for automated refactoring:

```typescript
// Rename file with import updates
mcp__mcp-refactor-typescript__file_operations({
  operation: "rename_file",
  sourcePath: "packages/iam/tables/src/tables/apiKey.table.ts",
  name: "api-key.table.ts",
  preview: true  // Always preview first
})

// Batch rename multiple files
mcp__mcp-refactor-typescript__file_operations({
  operation: "batch_move_files",
  files: [
    "packages/iam/tables/src/tables/apiKey.table.ts",
    "packages/iam/tables/src/tables/deviceCodes.table.ts"
  ],
  targetFolder: "packages/iam/tables/src/tables"
})
```

---

## Migration Summary

| Category | File Count | Effort |
|----------|------------|--------|
| Table file renames | 19 | Low (automated) |
| Schema postfix additions | ~15 | Low (automated) |
| Value object postfixes | 17 | Low (automated) |
| Import path updates | ~200+ | Medium (IDE-assisted) |
| **Total** | **~51 renames** | **2-4 hours** |

---

*Status: DRAFT - Ready for implementation spec creation*
*Generated: Phase 2 - Synthesis (Revised after review)*
