# kriegcloud/beep-effect | DeepWiki

_Source: https://deepwiki.com/kriegcloud/beep-effect_

Overview
--------

Relevant source files
*   [apps/web/next.config.ts](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/next.config.ts)
*   [apps/web/package.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/package.json)
*   [apps/web/tsconfig.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/tsconfig.json)
*   [apps/web/tsconfig.test.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/tsconfig.test.json)
*   [package.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json)
*   [pnpm-lock.yaml](https://github.com/kriegcloud/beep-effect/blob/b64126f6/pnpm-lock.yaml)
*   [tsconfig.base.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.base.json)
*   [tsconfig.build.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.build.json)
*   [tsconfig.json](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.json)

Purpose and Scope
-----------------

The **beep-effect** repository is a modern TypeScript monorepo that implements a full-stack web application using functional programming principles through the Effect ecosystem. The codebase demonstrates domain-driven design with clear bounded contexts, leveraging Effect's type-safe approach to dependency injection, error handling, and service composition.

This document provides a high-level introduction to the repository structure, its main applications, domain contexts, and architectural patterns. For detailed information about specific subsystems:

*   Architecture patterns and design decisions: see [Architecture](https://deepwiki.com/kriegcloud/beep-effect/2-architecture)
*   Setting up the development environment: see [Getting Started](https://deepwiki.com/kriegcloud/beep-effect/3-getting-started)
*   Core foundational systems: see [Core Systems](https://deepwiki.com/kriegcloud/beep-effect/4-core-systems)
*   Individual domain contexts: see [Domain Contexts](https://deepwiki.com/kriegcloud/beep-effect/5-domain-contexts)

**Sources:**[package.json 1-312](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L1-L312)[README.md (inferred)](https://github.com/kriegcloud/beep-effect/blob/b64126f6/README.md%20(inferred))

* * *

Monorepo Structure
------------------

The repository is organized as a **pnpm workspace** with packages grouped into four primary categories: applications, domain contexts, core infrastructure, and common utilities.

### Workspace Organization

**Sources:**[package.json 9-13](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L9-L13)[tsconfig.base.json 49-341](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.base.json#L49-L341)[tsconfig.json 12-118](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.json#L12-L118)

* * *

Applications Layer
------------------

The monorepo contains three distinct applications, each serving a specific purpose within the system architecture.

| Application | Package Name | Path | Technology Stack | Purpose |
| --- | --- | --- | --- | --- |
| **Web** | `@beep/web` | `apps/web` | Next.js 15, React 19, Effect Platform Browser | Primary user-facing frontend application with server-side rendering |
| **Server** | `@beep/server` | `apps/server` | Effect Platform Node, Effect RPC | Backend service runtime for business logic and data access |
| **MCP** | `@beep/mcp` | `apps/mcp` | Effect AI, Effect Platform Node | Model Context Protocol server for AI tool integrations |

### Application Dependencies

**Sources:**[apps/web/package.json 1-199](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/package.json#L1-L199)[pnpm-lock.yaml 396-843](https://github.com/kriegcloud/beep-effect/blob/b64126f6/pnpm-lock.yaml#L396-L843)[apps/web/next.config.ts 1-227](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/next.config.ts#L1-L227)

* * *

Domain Contexts
---------------

The codebase implements **domain-driven design** with three bounded contexts, each organized as a vertical slice with five layers.

### IAM Context

The **Identity and Access Management** (IAM) context handles user authentication, authorization, organizations, teams, and memberships.

| Layer | Package | Path | Responsibility |
| --- | --- | --- | --- |
| **Domain** | `@beep/iam-domain` | `packages/iam/domain` | Core entities, value objects, business logic |
| **Tables** | `@beep/iam-tables` | `packages/iam/tables` | Drizzle ORM schemas, database table definitions |
| **Infrastructure** | `@beep/iam-infra` | `packages/iam/infra` | Repositories, better-auth integration, external adapters |
| **SDK** | `@beep/iam-sdk` | `packages/iam/sdk` | Client-side API wrappers, authentication hooks |
| **UI** | `@beep/iam-ui` | `packages/iam/ui` | React components for sign-in, profile management |

**Sources:**[tsconfig.base.json 185-229](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.base.json#L185-L229)[apps/web/package.json 40-44](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/package.json#L40-L44)

### Files Context

The **Files** context manages file uploads, storage, and metadata tracking.

| Layer | Package | Path | Responsibility |
| --- | --- | --- | --- |
| **Domain** | `@beep/files-domain` | `packages/files/domain` | File entities, upload state machines |
| **Tables** | `@beep/files-tables` | `packages/files/tables` | File metadata schemas |
| **Infrastructure** | `@beep/files-infra` | `packages/files/infra` | S3 integration, upload repositories |
| **SDK** | `@beep/files-sdk` | `packages/files/sdk` | File upload APIs |
| **UI** | `@beep/files-ui` | `packages/files/ui` | File upload components, file browsers |

**Sources:**[tsconfig.base.json 230-274](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.base.json#L230-L274)[apps/web/package.json 45-49](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/package.json#L45-L49)

### Shared Context

The **Shared** context contains domain concepts and utilities used across multiple bounded contexts.

| Package | Path | Contents |
| --- | --- | --- |
| `@beep/shared-domain` | `packages/shared/domain` | Common entities, policies, filters |
| `@beep/shared-tables` | `packages/shared/tables` | Shared database schemas |

**Sources:**[tsconfig.base.json 134-151](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.base.json#L134-L151)[apps/web/package.json 33-35](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/package.json#L33-L35)

* * *

Core Infrastructure
-------------------

Core packages provide foundational services that all domains and applications depend on.

### Core Package Responsibilities

| Package | Export Path | Key Types/Functions | Purpose |
| --- | --- | --- | --- |
| `@beep/core-db` | `packages/core/db/src/index` | `Db.make`, `DbClient`, `Transaction` | Database service factory, transaction management |
| `@beep/core-env` | `packages/core/env/src/client` `packages/core/env/src/server` | `clientEnv`, `serverEnv` | Environment variable validation and type-safe access |
| `@beep/core-email` | `packages/core/email/src/index` | `AuthEmailService` | Email service integration with Resend |

**Sources:**[tsconfig.base.json 152-177](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.base.json#L152-L177)[apps/web/package.json 36-38](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/package.json#L36-L38)

* * *

Common Packages
---------------

Common packages provide reusable utilities and domain-agnostic functionality.

### Common Package Overview

| Package | Path | Primary Exports | Description |
| --- | --- | --- | --- |
| `@beep/schema` | `packages/common/schema` | Effect Schemas, EntityId factories | Type-safe validation and serialization using Effect Schema |
| `@beep/utils` | `packages/common/utils` | Functional utilities | Helper functions for common operations |
| `@beep/logos` | `packages/common/logos` | Rules engine API | Composable rules engine with operators and groups |
| `@beep/ui` | `packages/ui` | React components | Shared UI component library with MUI integration |
| `@beep/constants` | `packages/common/constants` | Static values | Application-wide constants and configuration |
| `@beep/errors` | `packages/common/errors` | Tagged error types | Structured error definitions with HTTP status codes |

**Sources:**[tsconfig.base.json 50-133](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.base.json#L50-L133)[apps/web/package.json 25-32](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/package.json#L25-L32)

* * *

Effect Ecosystem Foundation
---------------------------

The entire codebase is built on the **Effect ecosystem**, which provides functional programming primitives for TypeScript.

### Core Effect Dependencies

**Key Effect Concepts Used:**

*   **Services & Layers**: Dependency injection via `Context` and `Layer` for composable architecture
*   **Effect Type**: Type-safe error handling with `Effect<Success, Error, Requirements>`
*   **Schemas**: Runtime type validation and transformation with `@effect/schema`
*   **Observability**: Built-in tracing and metrics via OpenTelemetry integration

**Sources:**[pnpm-lock.yaml 61-187](https://github.com/kriegcloud/beep-effect/blob/b64126f6/pnpm-lock.yaml#L61-L187)[package.json 85-289](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L85-L289)

* * *

Technology Stack
----------------

### Frontend Stack

| Technology | Version | Purpose |
| --- | --- | --- |
| Next.js | 15.5.4 | React framework with SSR and routing |
| React | 19.2.0 | UI library |
| MUI (Material-UI) | 7.3.4 | Component library |
| TanStack Query | 5.90.2 | Server state management |
| XState | 5.22.1 | State machine library for workflows |
| Emotion | 11.14.0 | CSS-in-JS styling |

### Backend Stack

| Technology | Version | Purpose |
| --- | --- | --- |
| Effect | 3.18.2 | Functional programming runtime |
| PostgreSQL | 3.4.7 (driver) | Primary database |
| Drizzle ORM | 0.44.6 | Type-safe SQL query builder |
| Resend | 6.1.2 | Email service |
| Better Auth | 1.3.26 | Authentication framework |
| Stripe | 19.1.0 | Payment processing |

### Build & Development Tools

| Tool | Version | Purpose |
| --- | --- | --- |
| pnpm | 10.18.0 | Package manager with workspace support |
| Turbo | 2.5.8 | Monorepo build orchestration |
| TypeScript | 5.9.3 | Type system and compiler |
| Biome | 2.2.5 | Linter and formatter |
| Vitest | 3.2.4 | Testing framework |
| dotenvx | 1.51.0 | Environment variable management |

**Sources:**[package.json 58-82](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L58-L82)[pnpm-lock.yaml 61-210](https://github.com/kriegcloud/beep-effect/blob/b64126f6/pnpm-lock.yaml#L61-L210)[apps/web/package.json 23-168](https://github.com/kriegcloud/beep-effect/blob/b64126f6/apps/web/package.json#L23-L168)

* * *

Package Manager Configuration
-----------------------------

The repository uses **pnpm** with specific workspace and override configurations.

### Workspace Structure

The workspace configuration enforces:

*   **Unified versioning**: All packages use the same versions of Effect libraries via `pnpm.overrides`
*   **Local package resolution**: Workspace packages are linked during development
*   **Native module handling**: Specific native dependencies are built on install

**Sources:**[package.json 9-303](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L9-L303)[pnpm-lock.yaml 1-6](https://github.com/kriegcloud/beep-effect/blob/b64126f6/pnpm-lock.yaml#L1-L6)

* * *

Development Commands
--------------------

The monorepo provides standardized scripts for common development tasks:

| Command | Description |
| --- | --- |
| `pnpm dev` | Start all applications in development mode |
| `pnpm build` | Build all packages and applications |
| `pnpm test` | Run test suites across all packages |
| `pnpm lint` | Check code quality with Biome |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Open Drizzle Studio for database inspection |
| `pnpm services:up` | Start Docker services (PostgreSQL, Redis, OTLP) |

All commands use `dotenvx` for environment variable injection, ensuring consistent configuration across development and production environments.

**Sources:**[package.json 21-52](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L21-L52)

* * *

Next Steps
----------

This overview provides a foundation for understanding the beep-effect repository structure. For detailed information:

*   **Architecture deep-dive**: See [Architecture](https://deepwiki.com/kriegcloud/beep-effect/2-architecture) for design patterns and principles
*   **Local setup**: See [Getting Started](https://deepwiki.com/kriegcloud/beep-effect/3-getting-started) for installation and configuration
*   **Database layer**: See [Database Layer](https://deepwiki.com/kriegcloud/beep-effect/4.1-database-layer) for details on `Db.make` and query patterns
*   **Authentication**: See [Authentication and Authorization](https://deepwiki.com/kriegcloud/beep-effect/4.3-authentication-and-authorization) for Better Auth integration
*   **Domain contexts**: See [IAM Context](https://deepwiki.com/kriegcloud/beep-effect/5.1-iam-context) and [Files Context](https://deepwiki.com/kriegcloud/beep-effect/5.2-files-context) for domain-specific details

**Sources:**[package.json 1-312](https://github.com/kriegcloud/beep-effect/blob/b64126f6/package.json#L1-L312)[tsconfig.base.json 1-344](https://github.com/kriegcloud/beep-effect/blob/b64126f6/tsconfig.base.json#L1-L344)
