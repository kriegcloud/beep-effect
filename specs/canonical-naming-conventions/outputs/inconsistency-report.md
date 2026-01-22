# Inconsistency Report

> Phase 0 deliverable: Documented inconsistencies in naming patterns.

---

## Executive Summary

The codebase exhibits **7 major inconsistency categories** across naming patterns. The most significant inconsistencies involve schema file casing within domain entities, table file naming conventions, and dual patterns for layer/service files. Most inconsistencies appear to be evolutionary (newer vs older code) rather than intentional variation.

---

## 1. Casing Inconsistencies

### 1.1 Schema Files Within Domain Entities

**Issue**: Mixed kebab-case and PascalCase for schema files in the same architectural layer.

| Package | File Examples | Casing Used |
|---------|---------------|-------------|
| `@beep/iam-domain` | `member-status.ts`, `member-role.ts`, `invitation-status.ts` | kebab-case |
| `@beep/shared-domain` | `SubscriptionStatus.schema.ts`, `SubscriptionTier.schema.ts`, `OrganizationType.schema.ts` | PascalCase |
| `@beep/shared-domain` | `UploadKey.ts`, `UploadSessionMetadata.ts` | PascalCase |

**Specific Examples:**
```
# kebab-case (iam-domain)
packages/iam/domain/src/entities/member/schemas/member-status.ts
packages/iam/domain/src/entities/member/schemas/member-role.ts
packages/iam/domain/src/entities/invitation/schemas/invitation-status.ts

# PascalCase (shared-domain)
packages/shared/domain/src/entities/organization/schemas/SubscriptionStatus.schema.ts
packages/shared/domain/src/entities/organization/schemas/SubscriptionTier.schema.ts
packages/shared/domain/src/entities/file/schemas/UploadKey.ts
packages/shared/domain/src/entities/upload-session/schemas/UploadSessionMetadata.ts
```

**Impact**: Makes file discovery inconsistent; `grep` patterns differ by slice.

---

### 1.2 Table File Naming

**Issue**: Mixed camelCase and kebab-case for `.table.ts` files.

| Package | File Examples | Casing Used |
|---------|---------------|-------------|
| `@beep/iam-tables` | `apiKey.table.ts`, `deviceCodes.table.ts`, `teamMember.table.ts` | camelCase |
| `@beep/documents-tables` | `documentVersion.table.ts`, `documentFile.table.ts` | camelCase |
| `@beep/knowledge-tables` | `entityCluster.table.ts`, `sameAsLink.table.ts` | camelCase |
| `@beep/shared-tables` | `upload-session.table.ts`, `folder.table.ts` | kebab-case |
| `@beep/comms-tables` | `email-template.table.ts` | kebab-case |
| `@beep/customization-tables` | `user-hotkey.table.ts` | kebab-case |

**Specific Examples:**
```
# camelCase
packages/iam/tables/src/tables/apiKey.table.ts
packages/iam/tables/src/tables/oauthAccessToken.table.ts
packages/documents/tables/src/tables/documentVersion.table.ts

# kebab-case
packages/shared/tables/src/tables/upload-session.table.ts
packages/comms/tables/src/tables/email-template.table.ts
```

**Impact**: Inconsistent file naming makes batch operations and automated tooling more complex.

---

## 2. Postfix Variations for Same Purpose

### 2.1 Layer File Naming

**Issue**: Two distinct patterns for Effect Layer files.

| Pattern | Count | Location | Example |
|---------|-------|----------|---------|
| `layer.ts` (no postfix) | 15 | `iam/client/src/**/` | `sign-in/layer.ts` |
| `{Name}.layer.ts` (PascalCase + postfix) | 12 | `runtime/server/src/` | `Persistence.layer.ts` |

**Specific Examples:**
```
# No postfix (lowercase)
packages/iam/client/src/sign-in/layer.ts
packages/iam/client/src/organization/layer.ts
packages/iam/client/src/two-factor/layer.ts

# PascalCase with postfix
packages/runtime/server/src/Persistence.layer.ts
packages/runtime/server/src/Authentication.layer.ts
packages/runtime/server/src/DataAccess.layer.ts
```

**Observation**: Pattern correlates with layer type—client features use lowercase, server infrastructure uses PascalCase.

---

### 2.2 Service File Naming

**Issue**: Three distinct patterns for service files.

| Pattern | Count | Location | Example |
|---------|-------|----------|---------|
| `service.ts` (no postfix) | 15 | `iam/client/src/**/` | `organization/service.ts` |
| `{Name}.service.ts` (PascalCase + postfix) | 15 | `shared/*/src/services/` | `Upload.service.ts` |
| `{Name}Service.ts` (no postfix) | ~10 | `knowledge/server/src/` | `OntologyService.ts` |

**Specific Examples:**
```
# No postfix (lowercase)
packages/iam/client/src/organization/service.ts
packages/iam/client/src/sign-in/service.ts

# PascalCase with postfix
packages/shared/server/src/services/Upload.service.ts
packages/shared/client/src/atom/files/services/FileSync.service.ts

# PascalCase no postfix (Service suffix in name)
packages/knowledge/server/src/Ontology/OntologyService.ts
packages/knowledge/server/src/Ai/AiService.ts
```

---

### 2.3 Handler File Naming

**Issue**: Singular vs plural naming for handler files.

| Pattern | Count | Location | Example |
|---------|-------|----------|---------|
| `handler.ts` (singular, no postfix) | 34 | `iam/client/src/**/` | `sign-in/email/handler.ts` |
| `{Name}.handlers.ts` (plural, with postfix) | 3 | `documents/server/src/handlers/` | `Document.handlers.ts` |

**Specific Examples:**
```
# Singular (client)
packages/iam/client/src/sign-in/email/handler.ts
packages/iam/client/src/organization/members/list/handler.ts

# Plural (server)
packages/documents/server/src/handlers/Document.handlers.ts
packages/documents/server/src/handlers/Discussion.handlers.ts
```

**Observation**: Pattern correlates with layer—client uses singular, server uses plural. This may be intentional.

---

### 2.4 Schema File Naming

**Issue**: Singular vs plural naming for schema files.

| Pattern | Count | Location | Example |
|---------|-------|----------|---------|
| `{name}.schema.ts` (singular) | 8 | Various | `member.schema.ts` |
| `{name}.schemas.ts` (plural) | 6 | `iam/client/src/_internal/` | `member.schemas.ts` |

**Specific Examples:**
```
# Singular
packages/iam/client/src/organization/_common/member.schema.ts
packages/shared/domain/src/entities/organization/schemas/SubscriptionStatus.schema.ts

# Plural
packages/iam/client/src/_internal/member.schemas.ts
packages/iam/client/src/_internal/session.schemas.ts
```

---

## 3. Missing Postfixes

### 3.1 Value Object Files

**Issue**: Value objects in domain layer have no semantic postfix.

| Current | Suggested | Example Files |
|---------|-----------|---------------|
| `{Name}.ts` | `{Name}.value.ts` or `{Name}.vo.ts` | `Attributes.ts`, `EvidenceSpan.ts` |

**Affected Files:**
```
packages/knowledge/domain/src/value-objects/Attributes.ts
packages/knowledge/domain/src/value-objects/EvidenceSpan.ts
packages/knowledge/domain/src/value-objects/Extraction.ts
packages/knowledge/domain/src/value-objects/PropertyValue.ts
packages/shared/domain/src/value-objects/EntitySource.ts
packages/comms/domain/src/value-objects/template.values.ts  # Uses .values.ts (unique)
```

**Impact**: No greppable pattern for finding all value objects.

---

### 3.2 Schema Files in Domain Entities

**Issue**: Schema files within entity `schemas/` directories have no consistent postfix.

| Current | Example |
|---------|---------|
| `{name}.ts` (no postfix) | `member-status.ts`, `member-role.ts` |
| `{Name}.schema.ts` (with postfix) | `SubscriptionStatus.schema.ts` |

**Observation**: The `.schema.ts` postfix would make these files greppable.

---

### 3.3 Adapter and Provider Files

**Issue**: Adapter and provider implementations lack semantic postfixes.

| Current | Suggested | Example Files |
|---------|-----------|---------------|
| `{Name}.ts` (providers) | `{Name}.provider.ts` | `MockProvider.ts` |
| `Service.ts` (adapters) | `{Adapter}.adapter.ts` | `adapters/better-auth/Service.ts` |
| `Options.ts` (config) | `{Name}.config.ts` | `adapters/better-auth/Options.ts` |

**Affected Files:**
```
packages/knowledge/server/src/Embedding/providers/MockProvider.ts
packages/knowledge/server/src/Embedding/providers/OpenAiProvider.ts
packages/iam/server/src/adapters/better-auth/Service.ts
packages/iam/server/src/adapters/better-auth/Options.ts
```

---

## 4. Barrel Export Pattern Inconsistencies

### 4.1 mod.ts Adoption

**Issue**: The `mod.ts` pattern is only used in `@beep/iam-client`.

| Package Type | Uses mod.ts? | Barrel Pattern |
|--------------|--------------|----------------|
| `iam/client` | Yes | `export * as Name from "./mod.ts"` |
| `documents/client` | No | `export { } from "./file"` |
| `shared/client` | No | `export * from "./file"` |
| All domain packages | No | `export * as Name from "./entity"` |

**Impact**: Inconsistent import experience across slices.

---

### 4.2 Namespace Export vs Direct Re-export

**Issue**: Mixed patterns even within same package type.

**Example from `@beep/iam-client/src/index.ts`:**
```typescript
export * from "./adapters";                    // Direct re-export
export * as AuthCallback from "./auth-callback";  // Namespace
export { Core } from "./core";                    // Named export
export { SignIn } from "./sign-in";               // Named export
export * as Password from "./password";           // Namespace
```

**Observation**: Hybrid patterns may be intentional for API design, but inconsistency makes usage patterns less predictable.

---

## 5. Directory Structure Variations

### 5.1 Entity Organization

**Issue**: Value objects are sometimes in `value-objects/` directory, sometimes inline.

| Pattern | Location |
|---------|----------|
| `value-objects/` directory | `knowledge/domain/`, `comms/domain/`, `shared/domain/` |
| Inline with entity | `iam/domain/` (schemas in entity folders) |

---

### 5.2 Test File Location

**Issue**: Test files follow two different conventions.

| Pattern | Example |
|---------|---------|
| `test/` sibling to `src/` | `packages/iam/domain/test/` |
| `.test.ts` inline (rare) | Some utility files |

**Current State**: Most packages correctly use `test/` directory. Few violations.

---

## 6. Specific Inconsistencies by Slice

### 6.1 IAM Slice

| File Type | Pattern | Consistent? |
|-----------|---------|-------------|
| Entity folders | kebab-case | ✅ Yes |
| Schema files | kebab-case, no postfix | ✅ Yes |
| Table files | camelCase | ✅ Yes |
| Repo files | PascalCase + `.repo.ts` | ✅ Yes |
| Client features | 4-file pattern | ✅ Yes |

### 6.2 Shared Slice

| File Type | Pattern | Consistent? |
|-----------|---------|-------------|
| Entity folders | kebab-case | ✅ Yes |
| Schema files | PascalCase + `.schema.ts` | ⚠️ Different from IAM |
| Table files | kebab-case | ⚠️ Different from IAM |
| Repo files | PascalCase + `.repo.ts` | ✅ Yes |

### 6.3 Documents Slice

| File Type | Pattern | Consistent? |
|-----------|---------|-------------|
| Entity folders | kebab-case | ✅ Yes |
| Table files | camelCase | ✅ Matches IAM |
| Repo files | PascalCase + `.repo.ts` | ✅ Yes |
| Server handlers | PascalCase + `.handlers.ts` | ⚠️ Unique to documents |

---

## 7. Summary of Inconsistencies

### High-Priority (Affects Discoverability)

| # | Inconsistency | Packages Affected |
|---|---------------|-------------------|
| 1 | Schema file casing (kebab vs PascalCase) | iam-domain vs shared-domain |
| 2 | Table file casing (camelCase vs kebab) | iam/documents/knowledge vs shared/comms/customization |
| 3 | Missing value object postfix | knowledge, shared, comms |

### Medium-Priority (Affects Consistency)

| # | Inconsistency | Packages Affected |
|---|---------------|-------------------|
| 4 | Layer file naming (layer.ts vs .layer.ts) | client vs runtime |
| 5 | Service file naming (3 patterns) | client vs server |
| 6 | Handler file naming (singular vs plural) | client vs server |

### Low-Priority (Localized)

| # | Inconsistency | Packages Affected |
|---|---------------|-------------------|
| 7 | Schema singular vs plural postfix | iam-client |
| 8 | mod.ts adoption limited to iam-client | All client packages |
| 9 | Hybrid barrel export patterns | Package root files |

---

## 8. Verification Commands

```bash
# Check schema file casing distribution
find packages -path "*/schemas/*.ts" -name "[A-Z]*" | wc -l
find packages -path "*/schemas/*.ts" -name "[a-z]*" | wc -l

# Check table file casing distribution
find packages -name "*.table.ts" | xargs -I {} basename {} | sort | uniq

# Check layer file patterns
find packages -name "layer.ts" | wc -l
find packages -name "*.layer.ts" | wc -l

# Check service file patterns
find packages -name "service.ts" | wc -l
find packages -name "*.service.ts" | wc -l
find packages -name "*Service.ts" | wc -l

# Check mod.ts adoption
find packages -name "mod.ts" | wc -l
find packages -name "mod.ts" | xargs dirname | xargs dirname | sort -u
```

---

*Generated: Phase 0 - Codebase Inventory*
*Note: This document identifies inconsistencies without prescribing solutions. Normative recommendations will be made in Phase 2.*
