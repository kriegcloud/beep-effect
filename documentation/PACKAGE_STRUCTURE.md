# Package Structure

```
beep-effect/
├── apps/
│   ├── web/              # Next.js App Router frontend
│   ├── server/           # Effect-based backend runtime
│   ├── notes/            # Collaborative notes application
│   └── marketing/        # Marketing website
├── packages/
│   ├── _internal/
│   │   └── db-admin/     # Migration warehouse, Drizzle CLI
│   ├── common/
│   │   ├── constants/    # Schema-backed enums, asset paths
│   │   ├── contract/     # Effect-first contract system
│   │   ├── errors/       # Logging & telemetry
│   │   ├── identity/     # Package identity
│   │   ├── invariant/    # Assertion contracts
│   │   ├── lexical-schemas/ # Lexical editor schemas
│   │   ├── mock/         # Mock data for testing
│   │   ├── schema/       # Effect Schema utilities, EntityId
│   │   ├── types/        # Compile-time types
│   │   ├── utils/        # Pure runtime helpers
│   │   └── yjs/          # Yjs CRDT utilities
│   ├── comms/
│   │   ├── client/       # Comms client contracts
│   │   ├── domain/       # Comms domain models
│   │   ├── server/       # Comms server infrastructure
│   │   ├── tables/       # Drizzle schemas
│   │   └── ui/           # Comms React components
│   ├── customization/
│   │   ├── client/       # Customization client contracts
│   │   ├── domain/       # Customization domain models
│   │   ├── server/       # Customization server infrastructure
│   │   ├── tables/       # Drizzle schemas
│   │   └── ui/           # Customization React components
│   ├── documents/
│   │   ├── client/       # Documents client contracts
│   │   ├── domain/       # Files domain value-objects
│   │   ├── server/       # DocumentsDb, repos, S3 storage
│   │   ├── tables/       # Drizzle schemas
│   │   └── ui/           # React components
│   ├── iam/
│   │   ├── client/       # Auth client contracts
│   │   ├── domain/       # IAM entity models
│   │   ├── server/       # Better Auth, IAM repos
│   │   ├── tables/       # Drizzle schemas
│   │   └── ui/           # Auth UI flows
│   ├── runtime/
│   │   ├── client/       # Browser ManagedRuntime
│   │   └── server/       # Server ManagedRuntime
│   ├── shared/
│   │   ├── client/       # Shared client contracts
│   │   ├── domain/       # Cross-slice entities, Policy
│   │   ├── env/          # Environment configuration
│   │   ├── server/       # Db, Email, Repo factories
│   │   ├── tables/       # Table factories (Table.make, OrgTable.make)
│   │   └── ui/           # Shared UI components
│   └── ui/
│       ├── core/         # Design tokens, MUI overrides
│       └── ui/           # Component library
└── tooling/
    ├── build-utils/      # Next.js config utilities
    ├── cli/              # Repository CLI tools
    ├── repo-scripts/     # Automation scripts
    ├── scraper/          # Effect-based web scraper
    ├── testkit/          # Effect testing harness
    └── utils/            # FsUtils, RepoUtils
```

---

## Package Agent Guides

Each package may have its own `AGENTS.md` with specific guidance:

### Applications
- `apps/web/AGENTS.md` - Next.js frontend application patterns
- `apps/server/AGENTS.md` - Effect Platform backend server
- `apps/notes/AGENTS.md` - Collaborative notes application (Prisma + Effect hybrid)
- `apps/marketing/AGENTS.md` - Marketing website

### Common Layer
- `packages/common/constants/AGENTS.md` - Schema-backed enums, locale generators, path-builder
- `packages/common/contract/AGENTS.md` - Contract, ContractKit, ContractError patterns
- `packages/common/errors/AGENTS.md` - Logger layers, accumulation helpers, span/metric instrumentation
- `packages/common/invariant/AGENTS.md` - Assertion contracts, tagged error schemas
- `packages/common/lexical-schemas/AGENTS.md` - Lexical editor schemas
- `packages/common/schema/AGENTS.md` - EntityId factories, kits, JSON Schema normalization
- `packages/common/types/AGENTS.md` - Compile-time type idioms
- `packages/common/utils/AGENTS.md` - Effect collection/string utilities
- `packages/common/yjs/AGENTS.md` - Yjs CRDT utilities

### Shared Layer
- `packages/shared/client/AGENTS.md` - Shared client contracts and utilities
- `packages/shared/domain/AGENTS.md` - Entity IDs/models, ManualCache, Policy combinators
- `packages/shared/env/AGENTS.md` - Environment configuration
- `packages/shared/server/AGENTS.md` - Db, Email, Repo factories (consolidated from core packages)
- `packages/shared/tables/AGENTS.md` - Table factories, audit defaults, multi-tenant recipes
- `packages/shared/ui/AGENTS.md` - Shared UI components and utilities

### Feature Slices

#### Comms
- `packages/comms/client/AGENTS.md` - Comms client contracts
- `packages/comms/domain/AGENTS.md` - Comms domain models
- `packages/comms/server/AGENTS.md` - Comms server infrastructure
- `packages/comms/tables/AGENTS.md` - Comms Drizzle schemas
- `packages/comms/ui/AGENTS.md` - Comms React components

#### Customization
- `packages/customization/client/AGENTS.md` - Customization client contracts
- `packages/customization/domain/AGENTS.md` - Customization domain models
- `packages/customization/server/AGENTS.md` - Customization server infrastructure
- `packages/customization/tables/AGENTS.md` - Customization Drizzle schemas
- `packages/customization/ui/AGENTS.md` - Customization React components

#### Documents
- `packages/documents/client/AGENTS.md` - Documents client contracts
- `packages/documents/domain/AGENTS.md` - Files domain, EXIF schemas, upload helpers
- `packages/documents/server/AGENTS.md` - DocumentsDb, repo layers, S3 StorageService
- `packages/documents/tables/AGENTS.md` - Documents Drizzle schemas
- `packages/documents/ui/AGENTS.md` - Documents React components

#### IAM
- `packages/iam/client/AGENTS.md` - Better Auth handler playbook
- `packages/iam/domain/AGENTS.md` - IAM entity models, schema-kit guardrails
- `packages/iam/server/AGENTS.md` - Better Auth wiring, IAM repo bundle
- `packages/iam/tables/AGENTS.md` - Tenant-aware Drizzle schemas
- `packages/iam/ui/AGENTS.md` - IAM React flows, recaptcha, social providers

### Runtime Layer
- `packages/runtime/client/AGENTS.md` - Client ManagedRuntime, TanStack Query
- `packages/runtime/server/AGENTS.md` - Server ManagedRuntime, observability

### UI Layer
- `packages/ui/core/AGENTS.md` - Design tokens, MUI overrides, settings pipeline
- `packages/ui/ui/AGENTS.md` - Component library (MUI, shadcn, Tailwind)

### Tooling
- `packages/_internal/db-admin/AGENTS.md` - Migration warehouse, Drizzle CLI, Testcontainers
- `tooling/build-utils/AGENTS.md` - Next.js config utilities, PWA, security headers
- `tooling/cli/AGENTS.md` - Repository CLI for docgen, env config, dependency management
- `tooling/repo-scripts/AGENTS.md` - Bootstrap, env generators, Iconify workflows
- `tooling/scraper/AGENTS.md` - Effect-based web scraping with Playwright
- `tooling/testkit/AGENTS.md` - Bun-first Effect testing harness
- `tooling/utils/AGENTS.md` - FsUtils, RepoUtils, workspace schemas
