# File Category Inventory

> Phase 0 deliverable: Exhaustive catalog of file categories by layer, purpose, and type.

---

## 1. Categories by Architectural Layer

### 1.1 DOMAIN Layer (`packages/{slice}/domain/`)

| Category | Pattern | Postfix | Example |
|----------|---------|---------|---------|
| Entity Models | `{entity}.model.ts` | `.model.ts` | `member.model.ts` |
| Entity Schemas | `{name}.ts` in `schemas/` | none | `member-status.ts` |
| Domain Errors | `{entity}.errors.ts` | `.errors.ts` | `document.errors.ts` |
| RPC Contracts | `{entity}.rpc.ts` | `.rpc.ts` | `document.rpc.ts` |
| Value Objects | `{ValueObject}.ts` in `value-objects/` | none | `Attributes.ts` |
| Entity IDs | `ids.ts`, `any-id.ts`, `table-name.ts` | none | `iam/ids.ts` |
| Factories | `{name}.ts` in `factories/` | none | `db-repo.ts` |
| Services | `{Service}.ts` in `services/` | none | `EncryptionService.ts` |
| Policy | `permissions.ts`, `policy-types.ts` | none | `permissions.ts` |
| Barrel | `index.ts` | none | `index.ts` |

**Directory Structure:**
```
domain/src/
├── entities/{entity}/
│   ├── index.ts
│   ├── {entity}.model.ts
│   ├── {entity}.errors.ts
│   ├── {entity}.rpc.ts
│   └── schemas/*.ts
├── value-objects/*.ts
├── errors/*.errors.ts
├── entity-ids/{slice}/*.ts
├── factories/*.ts
├── services/{Service}/*.ts
├── policy/*.ts
└── index.ts
```

---

### 1.2 TABLES Layer (`packages/{slice}/tables/`)

| Category | Pattern | Postfix | Example |
|----------|---------|---------|---------|
| Table Definitions | `{entityName}.table.ts` | `.table.ts` | `member.table.ts` |
| Relations | `relations.ts` | none | `relations.ts` |
| Combined Schema | `schema.ts` | none | `schema.ts` |
| Schema Object | `schema-object.ts` | none | `schema-object.ts` |
| Column Helpers | `{type}.ts` in `columns/` | none | `custom-datetime.ts` |
| Table Helpers | `Table.ts`, `OrgTable.ts` | none | `Table.ts` |
| Type Verification | `_check.ts` | none | `_check.ts` |
| Common | `common.ts` | none | `common.ts` |
| Barrel | `index.ts` | none | `index.ts` |

**Directory Structure:**
```
tables/src/
├── tables/{entityName}.table.ts
├── columns/{type}.ts
├── table/Table.ts
├── org-table/OrgTable.ts
├── relations.ts
├── schema.ts
├── schema-object.ts
├── common.ts
├── _check.ts
└── index.ts
```

---

### 1.3 SERVER Layer (`packages/{slice}/server/`)

| Category | Pattern | Postfix | Example |
|----------|---------|---------|---------|
| Repositories | `{Entity}.repo.ts` | `.repo.ts` | `Member.repo.ts` |
| Common Repo Utils | `_common.ts` | none | `_common.ts` |
| Repo Aggregation | `repositories.ts` | none | `repositories.ts` |
| RPC Handlers | `{Entity}.handlers.ts` | `.handlers.ts` | `Document.handlers.ts` |
| Services | `{Service}.service.ts` | `.service.ts` | `Upload.service.ts` |
| Service Classes | `{Name}Service.ts` | none | `OntologyService.ts` |
| Db Connection | `Db.ts` in `db/Db/` | none | `Db.ts` |
| Adapters | Various in `adapters/` | none | `Service.ts` |
| RPC Implementations | `{action}.ts` in `rpc/v1/` | none | `create-folder.ts` |
| RPC Aggregation | `_rpcs.ts` | none | `_rpcs.ts` |
| Jobs | `{job-name}.ts` in `jobs/` | none | `cleanup-upload-sessions.ts` |
| Tenant Context | `TenantContext.ts` | none | `TenantContext.ts` |
| Barrel | `index.ts` | none | `index.ts` |

**Directory Structure:**
```
server/src/
├── db/
│   ├── Db/Db.ts
│   ├── repos/{Entity}.repo.ts
│   ├── repositories.ts
│   └── index.ts
├── handlers/{Entity}.handlers.ts
├── services/{Service}.service.ts
├── adapters/{name}/Service.ts
├── rpc/v1/{resource}/{action}.ts
├── jobs/{job-name}.ts
├── db.ts
└── index.ts
```

---

### 1.4 CLIENT Layer (`packages/{slice}/client/`)

| Category | Pattern | Postfix | Example |
|----------|---------|---------|---------|
| Feature Handlers | `handler.ts` | none | `handler.ts` |
| Feature Contracts | `contract.ts` | none | `contract.ts` |
| Feature Modules | `mod.ts` | none | `mod.ts` |
| Feature Layers | `layer.ts` | none | `layer.ts` |
| Feature Services | `service.ts` | none | `service.ts` |
| Atoms | `atoms.ts` | none | `atoms.ts` |
| Atom Files | `{action}.atom.ts` | `.atom.ts` | `upload.atom.ts` |
| Forms | `form.ts` | none | `form.ts` |
| Client Schemas | `{entity}.schema.ts` | `.schema.ts` | `member.schema.ts` |
| Internal Schemas | `{entity}.schemas.ts` | `.schemas.ts` | `member.schemas.ts` |
| Adapters | `client.ts` in `adapters/` | none | `client.ts` |
| Constructors | `{Client}.ts` | none | `RpcClient.ts` |
| Services | `{Service}.service.ts` | `.service.ts` | `FileSync.service.ts` |
| Barrel | `index.ts` | none | `index.ts` |

**Directory Structure:**
```
client/src/
├── {feature}/
│   ├── index.ts
│   ├── mod.ts
│   ├── layer.ts
│   ├── service.ts
│   ├── atoms.ts
│   ├── form.ts
│   └── {action}/
│       ├── index.ts
│       ├── mod.ts
│       ├── handler.ts
│       └── contract.ts
├── _internal/{entity}.schemas.ts
├── _common/{entity}.schema.ts
├── adapters/{adapter}/client.ts
├── constructors/{Client}.ts
├── atom/
│   ├── files/atoms/{action}.atom.ts
│   └── services/{Service}.service.ts
└── index.ts
```

---

### 1.5 UI Layer (`packages/{slice}/ui/`)

| Category | Pattern | Postfix | Example |
|----------|---------|---------|---------|
| Views | `{feature}.view.tsx` | `.view.tsx` | `sign-in.view.tsx` |
| Forms | `form.tsx` | none | `form.tsx` |
| Components | `{component-name}.tsx` | none | `form-head.tsx` |
| Icon Components | `{name}-icon.tsx` | none | `google-icon.tsx` |
| Hooks | `use-{hook-name}.ts` | none | `use-captcha.ts` |
| Providers | `{name}.provider.tsx` | `.provider.tsx` | `bulk-select.provider.tsx` |
| Contexts | `{name}.context.ts` | `.context.ts` | `settings-context.ts` |
| Dialogs | `{name}.dialog.tsx` | `.dialog.tsx` | `confirm.dialog.tsx` |
| Styles | `styles.ts`, `{name}-styles.ts` | none | `nav-item-styles.ts` |
| Theme | `theme-provider.tsx` | none | `theme-provider.tsx` |
| Layouts | `layout.tsx` | none | `layout.tsx` |
| Sections | `{name}-view.tsx` | none | `500-view.tsx` |
| UI Services | `{service}.service.ts` | `.service.ts` | `toaster.service.ts` |
| Barrel | `index.ts` | none | `index.ts` |

**Directory Structure:**
```
ui/src/
├── {feature}/
│   ├── index.ts
│   ├── {feature}.view.tsx
│   └── {sub-feature}/form.tsx
├── _components/{component-name}.tsx
├── _common/use-{hook}.ts
├── hooks/use-{hook-name}.ts
├── providers/{name}.provider.tsx
├── layouts/{layout-name}/layout.tsx
├── theme/theme-provider.tsx
├── services/{service}.service.ts
├── sections/{section}/{name}-view.tsx
└── index.ts
```

---

### 1.6 RUNTIME Layer (`packages/runtime/{client|server}/`)

| Category | Pattern | Postfix | Example |
|----------|---------|---------|---------|
| Layers | `{Name}.layer.ts` | `.layer.ts` | `Authentication.layer.ts` |
| Runtime Entry | `Runtime.ts` | none | `Runtime.ts` |
| Workers | `{name}-worker.ts` | none | `image-compression-worker.ts` |
| Worker Clients | `worker-client.ts` | none | `worker-client.ts` |
| Providers | `{name}-provider.tsx` | none | `runtime-provider.tsx` |
| Client Layers | `layer-{name}.ts` | none | `layer-indexed-db.ts` |
| Barrel | `index.ts` | none | `index.ts` |

---

### 1.7 COMMON Packages (`packages/common/{package}/`)

| Package | Category | Pattern | Example |
|---------|----------|---------|---------|
| **schema** | Primitives | `{name}.ts` in `primitives/` | `json.ts` |
| **schema** | Integrations | `{name}.ts` in `integrations/` | `metadata.ts` |
| **schema** | Derived | `{name}.ts` in `derived/` | `derived-type.ts` |
| **types** | Type Definitions | `{type-name}.types.ts` | `unsafe.types.ts` |
| **utils** | Utilities | `{utility}.ts` | `md5.ts` |
| **utils** | Utility Functions | `{utility}.utils.ts` | `string.utils.ts` |
| **errors** | Error Definitions | `errors.ts`, `{context}.ts` | `errors.ts` |
| **wrap** | Wrappers | `wrapper.ts` | `wrapper.ts` |
| **wrap** | Middleware | `middleware.ts` | `middleware.ts` |
| **constants** | Constants | `{Constant}.ts` | `AllowedHeaders.ts` |

---

## 2. Categories by Semantic Purpose

### 2.1 Data Definition Files

| Purpose | Patterns | Layers |
|---------|----------|--------|
| Domain Models | `.model.ts` | domain |
| Database Tables | `.table.ts` | tables |
| Schemas | `.schema.ts`, `.schemas.ts` | domain, client |
| Type Definitions | `.types.ts` | common |
| Value Objects | `{Name}.ts` in `value-objects/` | domain |
| Constants | `.constants.ts`, `{Name}.ts` | common, domain |

### 2.2 Data Access Files

| Purpose | Patterns | Layers |
|---------|----------|--------|
| Repositories | `.repo.ts` | server |
| Database Connection | `Db.ts` | server |
| Relations | `relations.ts` | tables |

### 2.3 Business Logic Files

| Purpose | Patterns | Layers |
|---------|----------|--------|
| Services | `.service.ts`, `{Service}.ts` | domain, server, client |
| Handlers | `handler.ts`, `.handlers.ts` | client, server |
| Contracts | `contract.ts`, `.rpc.ts` | client, domain |
| Factories | `{name}.ts` in `factories/` | domain |
| Policy | `permissions.ts` | domain |

### 2.4 Composition Files

| Purpose | Patterns | Layers |
|---------|----------|--------|
| Effect Layers | `.layer.ts`, `layer.ts` | runtime, client |
| Module Aggregation | `mod.ts` | client |
| Barrel Exports | `index.ts` | all |

### 2.5 State Management Files

| Purpose | Patterns | Layers |
|---------|----------|--------|
| Jotai Atoms | `.atom.ts`, `atoms.ts` | client |
| React Contexts | `.context.ts` | ui |
| React Providers | `.provider.tsx` | ui |
| Forms | `form.ts`, `form.tsx` | client, ui |

### 2.6 UI Component Files

| Purpose | Patterns | Layers |
|---------|----------|--------|
| Page Views | `.view.tsx` | ui |
| Components | `{name}.tsx` | ui |
| Dialogs | `.dialog.tsx` | ui |
| Layouts | `layout.tsx` | ui |
| Hooks | `use-{name}.ts` | ui, client |
| Styles | `styles.ts`, `{name}-styles.ts` | ui |

### 2.7 Error Definition Files

| Purpose | Patterns | Layers |
|---------|----------|--------|
| Domain Errors | `.errors.ts` | domain |
| Common Errors | `errors.ts` | common |

### 2.8 Infrastructure Files

| Purpose | Patterns | Layers |
|---------|----------|--------|
| RPC Implementations | `{action}.ts` in `rpc/v1/` | server |
| Adapters | Various in `adapters/` | server, client |
| Jobs | `{job-name}.ts` | server |
| Workers | `{name}-worker.ts` | runtime |

### 2.9 Verification & Internal Files

| Purpose | Patterns | Layers |
|---------|----------|--------|
| Type Checking | `_check.ts` | tables |
| Internal Utils | `_common.ts`, `_internal/` | server, client |
| RPC Aggregation | `_rpcs.ts` | server, domain |
| Tests | `.test.ts` | all (in `test/`) |

---

## 3. Categories by Module Type

### 3.1 Effect-Based Modules

| Type | Pattern | Description |
|------|---------|-------------|
| **Effect Service** | `.service.ts` | Context.Tag-based service with Effect operations |
| **Effect Layer** | `.layer.ts`, `layer.ts` | Layer.succeed/effect composition |
| **Effect Handler** | `handler.ts` | createHandler factory pattern |
| **Effect Repository** | `.repo.ts` | DbRepo.make factory pattern |

### 3.2 Schema Modules

| Type | Pattern | Description |
|------|---------|-------------|
| **Domain Model** | `.model.ts` | S.Class-based domain entity |
| **Contract Schema** | `contract.ts` | Payload/Success/Error schemas |
| **RPC Schema** | `.rpc.ts` | RPC request/response definitions |
| **Validation Schema** | `.schema.ts` | Field-level schemas |

### 3.3 React Modules

| Type | Pattern | Description |
|------|---------|-------------|
| **View Component** | `.view.tsx` | Page-level React component |
| **Form Component** | `form.tsx` | Form with validation |
| **Dialog Component** | `.dialog.tsx` | Modal dialog component |
| **Provider** | `.provider.tsx` | Context provider |
| **Hook** | `use-{name}.ts` | Custom React hook |

### 3.4 Database Modules

| Type | Pattern | Description |
|------|---------|-------------|
| **Drizzle Table** | `.table.ts` | Drizzle pgTable definition |
| **Repository** | `.repo.ts` | Database access layer |
| **Relations** | `relations.ts` | Drizzle relations |

### 3.5 Barrel Modules

| Type | Pattern | Description |
|------|---------|-------------|
| **Package Entry** | `index.ts` | Main package exports |
| **Namespace Module** | `mod.ts` | Feature module aggregation |
| **Schema Export** | `schema.ts` | Combined schema export |

---

## 4. Underscore-Prefixed Directories

| Directory | Location | Purpose |
|-----------|----------|---------|
| `_internal/` | client | Internal implementations not for public API |
| `_common/` | ui, client | Shared utilities across sibling directories |
| `_components/` | ui | Internal component library |
| `_generated/` | various | Auto-generated files |

---

## 5. Quantitative Summary

| Layer | File Types | Most Common Postfixes |
|-------|------------|----------------------|
| **domain** | 10 | `.model.ts`, `.errors.ts`, `.rpc.ts` |
| **tables** | 9 | `.table.ts` |
| **server** | 12 | `.repo.ts`, `.handlers.ts`, `.service.ts` |
| **client** | 14 | `.atom.ts`, `.schema.ts`, `.service.ts` |
| **ui** | 14 | `.view.tsx`, `.provider.tsx`, `.dialog.tsx`, `.context.ts` |
| **runtime** | 7 | `.layer.ts` |
| **common** | varies | `.types.ts`, `.utils.ts` |

**Total unique file categories identified: 66**

---

*Generated: Phase 0 - Codebase Inventory*
*Note: This document catalogs existing patterns without normative judgments.*
