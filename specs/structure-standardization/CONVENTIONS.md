# Naming Conventions & Structure Standards

> The canonical reference for file naming, directory structure, and organizational patterns in beep-effect.

---

## Core Principles

1. **Predictability over brevity** - Names should be discoverable without prior knowledge
2. **Suffix indicates purpose** - File type is immediately apparent from name
3. **Consistent casing per context** - Same rules everywhere, no exceptions
4. **Flat when possible** - Avoid deep nesting; prefer wide directories
5. **Self-documenting** - Names explain themselves without comments

---

## Directory Naming

### Rule: Use kebab-case for ALL directories

```
✓ packages/iam/server/src/api/sign-in/
✓ packages/common/schema/src/primitives/string/
✓ packages/shared/domain/src/value-objects/

✗ packages/iam/domain/src/entities/Account/    # PascalCase directory
✗ packages/shared/tables/src/Table/            # PascalCase directory
```

**Exception**: None. Entity directories that are currently PascalCase should become kebab-case.

### Rationale
- kebab-case is URL-safe and shell-friendly
- Avoids case-sensitivity issues across operating systems
- Easier to type and grep
- Consistent with web standards (routes, URLs)

---

## File Naming

### General Rule: kebab-case base + descriptive suffix

```
{feature-name}.{type}.ts
```

### File Type Suffixes

| Type | Suffix | Example | Description |
|------|--------|---------|-------------|
| **Effect Layer** | `.layer.ts` | `authentication.layer.ts` | Dependency injection layers |
| **Repository** | `.repo.ts` | `user.repo.ts` | Data access repositories |
| **Service** | `.service.ts` | `sign-in.service.ts` | Business logic services |
| **Handler** | `.handlers.ts` | `document.handlers.ts` | Request/RPC handlers |
| **Model** | `.model.ts` | `user.model.ts` | Entity/domain models |
| **Schema** | `.schema.ts` | `email.schema.ts` | Validation schemas |
| **Policy** | `.policy.ts` | `team.policy.ts` | Authorization policies |
| **Table** | `.table.ts` | `api-key.table.ts` | Database table definitions |
| **Error** | `.errors.ts` | `upload.errors.ts` | Error definitions |
| **Constants** | `.constants.ts` | `user.constants.ts` | Constant values |
| **Types** | `.types.ts` | `auth.types.ts` | Type definitions only |
| **Utils** | `.utils.ts` | `string.utils.ts` | Utility functions |
| **Config** | `.config.ts` | `database.config.ts` | Configuration |
| **Test** | `.test.ts` | `user.repo.test.ts` | Test files |

### React/UI File Suffixes

| Type | Suffix | Example | Description |
|------|--------|---------|-------------|
| **View** | `.view.tsx` | `sign-in.view.tsx` | Main view components |
| **Form** | `.form.tsx` | `sign-up.form.tsx` | Form components |
| **List** | `.list.tsx` | `users.list.tsx` | List components |
| **Item** | `.item.tsx` | `user.item.tsx` | Single item components |
| **Card** | `.card.tsx` | `project.card.tsx` | Card components |
| **Modal** | `.modal.tsx` | `confirm.modal.tsx` | Modal/dialog components |
| **Skeleton** | `.skeleton.tsx` | `user.skeleton.tsx` | Loading skeletons |
| **Empty** | `.empty.tsx` | `files.empty.tsx` | Empty state components |
| **Error** | `.error.tsx` | `boundary.error.tsx` | Error components |
| **Fallback** | `.fallback.tsx` | `auth.fallback.tsx` | Fallback components |

### State Management Suffixes

| Type | Suffix | Example | Description |
|------|--------|---------|-------------|
| **Atoms** | `.atoms.ts` | `sign-in.atoms.ts` | Jotai/state atoms (always plural) |
| **Store** | `.store.ts` | `auth.store.ts` | Store definitions |
| **Hooks** | `.hooks.ts` | `auth.hooks.ts` | Custom React hooks |

---

## Barrel Exports (index.ts)

### Rule: Every directory has an `index.ts`

```typescript
// packages/iam/server/src/repos/index.ts
export * from "./user.repo"
export * from "./team.repo"
export * from "./organization.repo"
```

### Namespace Re-exports

When a directory warrants namespace grouping:

```typescript
// packages/iam/domain/src/entities/index.ts
export * as User from "./user"
export * as Team from "./team"
export * as Organization from "./organization"
```

### Companion File Pattern

For directories that need a simple re-export alongside:

```
src/
├── builders/
│   ├── json-schema/
│   ├── form/
│   └── index.ts
└── builders.ts  ← Re-exports: export * from "./builders"
```

---

## Package Internal Structure

### Domain Package (`packages/*/domain/`)

```
src/
├── entities/
│   ├── user/
│   │   ├── user.model.ts
│   │   ├── user.policy.ts
│   │   ├── user.constants.ts
│   │   ├── schemas/
│   │   │   ├── role.schema.ts
│   │   │   ├── status.schema.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── index.ts
├── value-objects/
│   ├── email.ts
│   ├── slug.ts
│   └── index.ts
├── errors/
│   ├── domain.errors.ts
│   └── index.ts
└── index.ts
```

### Server Package (`packages/*/server/`)

```
src/
├── db/
│   ├── client/
│   │   ├── pg.client.ts
│   │   └── index.ts
│   └── index.ts
├── repos/
│   ├── user.repo.ts
│   ├── team.repo.ts
│   └── index.ts
├── services/
│   ├── auth.service.ts
│   ├── email.service.ts
│   └── index.ts
├── handlers/
│   ├── user.handlers.ts
│   ├── team.handlers.ts
│   └── index.ts
├── layers/
│   ├── authentication.layer.ts
│   ├── database.layer.ts
│   └── index.ts
├── api/
│   ├── v1/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   └── index.ts
│   └── index.ts
└── index.ts
```

### Client Package (`packages/*/client/`)

```
src/
├── atoms/
│   ├── auth.atoms.ts
│   ├── session.atoms.ts
│   └── index.ts
├── services/
│   ├── sign-in.service.ts
│   ├── sign-out.service.ts
│   └── index.ts
├── hooks/
│   ├── auth.hooks.ts
│   └── index.ts
├── api-client/
│   ├── client.ts
│   └── index.ts
└── index.ts
```

### UI Package (`packages/*/ui/`)

```
src/
├── components/
│   ├── button/
│   │   ├── button.view.tsx
│   │   ├── button.styles.ts
│   │   └── index.ts
│   └── index.ts
├── features/
│   ├── sign-in/
│   │   ├── sign-in.view.tsx
│   │   ├── sign-in.form.tsx
│   │   ├── sign-in.skeleton.tsx
│   │   └── index.ts
│   └── index.ts
├── layouts/
│   ├── auth.layout.tsx
│   └── index.ts
├── hooks/
│   ├── form.hooks.ts
│   └── index.ts
└── index.ts
```

### Tables Package (`packages/*/tables/`)

```
src/
├── tables/
│   ├── user.table.ts
│   ├── team.table.ts
│   ├── api-key.table.ts
│   └── index.ts
├── enums/
│   ├── role.enum.ts
│   ├── status.enum.ts
│   └── index.ts
├── schema.ts          ← Main schema export
└── index.ts
```

---

## Casing Reference

| Context | Convention | Example |
|---------|------------|---------|
| Directories | kebab-case | `api-key/`, `sign-in/` |
| TypeScript files | kebab-case | `user.repo.ts`, `sign-in.service.ts` |
| React components | kebab-case | `user-card.view.tsx` |
| Test files | kebab-case | `user.repo.test.ts` |
| Type/Interface names | PascalCase | `UserModel`, `SignInRequest` |
| Function names | camelCase | `createUser`, `signIn` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES`, `DEFAULT_TIMEOUT` |
| Database columns | snake_case | `created_at`, `user_id` |

---

## Anti-Patterns to Avoid

### Mixed Casing in Same Context
```
✗ src/repos/User.repo.ts      # PascalCase file
✗ src/repos/team.repo.ts      # kebab-case file
✓ src/repos/user.repo.ts      # Consistent kebab-case
✓ src/repos/team.repo.ts
```

### Inconsistent Suffixes
```
✗ src/UserService.ts          # No suffix separator
✗ src/user-service.ts         # Missing .service suffix
✓ src/user.service.ts         # Correct pattern
```

### Deep Nesting
```
✗ src/features/auth/sign-in/forms/email/validation/rules/
✓ src/features/sign-in/email-validation.ts
```

### Ambiguous Names
```
✗ src/utils.ts                # Too vague
✗ src/helpers.ts              # Too vague
✓ src/string.utils.ts         # Specific domain
✓ src/date.utils.ts           # Specific domain
```

### Missing Barrel Exports
```
✗ src/repos/user.repo.ts      # No index.ts
✗ src/repos/team.repo.ts
✓ src/repos/user.repo.ts
✓ src/repos/team.repo.ts
✓ src/repos/index.ts          # Barrel export
```

---

## Migration Priority

When standardizing, prioritize in this order:

1. **Directory naming** (PascalCase → kebab-case) - Highest impact on navigation
2. **File naming consistency** - Enables reliable grep/search
3. **Barrel exports** - Improves import ergonomics
4. **Internal structure alignment** - Long-term maintainability

---

## Validation Commands

After refactoring, verify with:

```bash
# Find PascalCase directories (should be zero)
find packages -type d -regex '.*/[A-Z][a-zA-Z]*' | grep -v node_modules

# Find files without proper suffixes in src directories
find packages/*/src -name "*.ts" | grep -v -E '\.(layer|repo|service|handlers|model|schema|policy|table|errors|constants|types|utils|config|test|atoms|store|hooks)\.ts$' | grep -v 'index\.ts'

# Find directories without index.ts
for dir in $(find packages -type d -path "*/src/*" | grep -v node_modules); do
  [ ! -f "$dir/index.ts" ] && echo "Missing index.ts: $dir"
done
```
