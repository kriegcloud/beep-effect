# Knowledge Management Slice: Design Document

## About MCP_DOC_REFERENCE Comments

Throughout this document, you'll see special HTML comments like:

```html
<!-- MCP_DOC_REFERENCE
When implementing domain models, reference Effect SQL Model documentation:
Tool: mcp__effect_docs__effect_docs_search
Query: "@effect/sql Model Class makeFields"
Reason: Domain models use M.Class pattern from @effect/sql/Model for database integration
-->
```

**What these are:**
- Instructions for Claude Code (AI assistant) when implementing this design
- Specify which MCP (Model Context Protocol) tools to use for looking up current documentation
- Ensure implementation uses latest API versions and patterns
- You can safely ignore these comments - they're metadata for AI tooling

**Why they're useful:**
- Effect and other libraries update frequently
- Claude Code can fetch current docs instead of relying on potentially outdated training data
- Reduces risk of using deprecated APIs or patterns
- Makes the design document executable as a guide for AI-assisted implementation

---

## 1. Overview

### Purpose

The `documents` slice implements a Notion-style knowledge base shared across teams, with offline-capable, encrypted document editing.

**Collaboration Model for MVP:**
For the MVP, collaboration is achieved through multiple users accessing shared pages with Zero's last-write-wins synchronization. Real-time CRDT-style collaborative editing (Yjs) is **out of scope for MVP** and is only considered as a future enhancement. This means concurrent edits to the same page will result in last-write-wins behavior rather than character-level operational transformation.

### MVP Feature Set

**Core Capabilities:**
- **Block-Based Editing**: Rich content editing via BlockNote with support for text, headings, lists, code blocks, images, and embeds
- **Local-First Architecture**: Offline-capable editing with automatic sync using Zero (local IndexedDB cache ↔ PostgreSQL)
- **Optimistic Updates**: Last-write-wins conflict resolution with optimistic UI updates via Zero
- **End-to-End Encryption**: Client-side encryption for page content with organization-level key management
- **Graph View**: Obsidian-style bidirectional link visualization showing page relationships
- **Multi-Tenancy**: Full integration with IAM's organization/team model for access control

### Relationship to Existing Domain Contexts

Following the [Domain Contexts](https://deepwiki.com/kriegcloud/beep-effect/5-domain-contexts) architecture, this slice:

**Depends On:**
- **IAM Domain** (`@beep/iam-*`): Authentication, session management, organization/team membership
- **Shared Domain** (`@beep/shared-domain`): Core entities (User, Organization, Team), EntityId patterns, audit infrastructure

**Provides:**
- Standalone bounded context for knowledge management
- SDK contracts (`@beep/documents-sdk`) for frontend consumption
- Does NOT expose internal domain logic to other slices

**Interaction Pattern:**
```
apps/web (Next.js)
    ↓ [uses SDK contracts]
@beep/documents-sdk
    ↓ [implements contracts via infra]
@beep/documents-infra ← @beep/documents-domain
    ↓                                      ↓
@beep/documents-tables    [pure business logic]
    ↓
PostgreSQL ← Zero Sync ↔ Client IndexedDB
```

### Implementation Constraints

The following technical constraints and design decisions define the MVP scope and guide all implementation work:

**1. Zero-Only Sync (No Yjs)**
- **Constraint**: Use @rocicorp/zero exclusively for synchronization; do NOT integrate Yjs CRDT library
- **Rationale**: Yjs (CRDT merging) conflicts with Zero's last-write-wins model, creating silent data loss
- **Implications**:
  - BlockNote used in single-editor mode (not collaborative mode)
  - No character-level merge on concurrent edits
  - Last-write-wins conflict resolution for all data (metadata, content, structure)
  - See Section 5.5 for detailed architectural decision

**2. BlockNote Single-Editor Mode**
- **Constraint**: BlockNote editor operates in single-editor mode; no real-time collaborative text editing
- **Rationale**: Simplifies MVP architecture; sufficient for snapshot-on-save workflow
- **Implications**:
  - Content serialized to JSON on save/blur events
  - No live cursors or presence indicators (post-MVP feature)
  - Concurrent edits result in last-write-wins behavior

**3. Client-Side Encryption Only**
- **Constraint**: All encryption/decryption happens in browser using Web Crypto API
- **Rationale**: Zero-knowledge architecture; server cannot decrypt content
- **Implications**:
  - Cannot perform full-text search on encrypted content (server-side)
  - Page titles remain plaintext by default (enables search and tree rendering)
  - Encryption keys cached in memory only (never localStorage)
  - See Section 6 for encryption architecture

**4. Last-Write-Wins Conflict Resolution**
- **Constraint**: Server timestamp determines winner for all conflicts
- **Rationale**: Zero's built-in conflict resolution strategy; simple and predictable
- **Implications**:
  - Concurrent edits to same entity result in newest write winning
  - Optimistic locking via `version` column prevents silent overwrites
  - Show conflict warnings to users when Zero detects concurrent modifications
  - No CRDT merge or operational transformation

**5. Organization-Level Master Keys**
- **Constraint**: Encryption keys scoped to organization, derived per-space via HKDF
- **Rationale**: Balances security with key distribution complexity
- **Implications**:
  - All space members can decrypt all pages in that space
  - No per-page encryption keys in MVP
  - Key rotation handled at space level
  - See Section 6.2 for key management details

**6. PostgreSQL + Zero Tracking**
- **Constraint**: All synced tables must include `_zero_version BIGINT` column
- **Rationale**: Zero requires version tracking for Change Version Record (CVR) management
- **Implications**:
  - Database migrations must add Zero tracking columns
  - All writes update `_zero_version` for sync propagation
  - Zero metadata table (`_zero_metadata`) required

**7. Snake_Case Column Names**
- **Constraint**: All PostgreSQL columns use snake_case naming (e.g., `created_at`, `organization_id`)
- **Rationale**: Follows PostgreSQL conventions and beep-effect2 standards
- **Implications**:
  - Domain models use camelCase (TypeScript convention)
  - Drizzle schema definitions map camelCase ↔ snake_case
  - See Section 4.2 for table definitions

**8. Soft Delete with deleted_at**
- **Constraint**: Entities use soft delete (`deleted_at IS NOT NULL`) instead of hard delete
- **Rationale**: Audit trail, data recovery, cascade delete via application logic
- **Implications**:
  - All queries filter `WHERE deleted_at IS NULL`
  - Zero auth filters include `deleted_at: null` condition
  - Hard delete job for GDPR compliance (purge after 30 days) in post-MVP

**9. Effect-First Architecture**
- **Constraint**: All side effects modeled as `Effect<Success, Error, Requirements>`
- **Rationale**: Type-safe dependency injection, composable error handling, testability
- **Implications**:
  - No raw `async/await` or `Promise` in domain code
  - Use `Layer.provide` for dependency injection
  - All repositories, services, and contracts return Effect types
  - See beep-effect2 CLAUDE.md for Effect patterns

**10. Fractional Indexing for Block Order**
- **Constraint**: Block `order` field uses fractional indexing (text type, not numeric)
- **Rationale**: Conflict-free insertion between blocks without renumbering siblings
- **Implications**:
  - Use `fractional-indexing` npm package (`generateKeyBetween`)
  - Order values are strings like "a0", "a0V", "a1" (not integers)
  - Prevents order conflicts during concurrent inserts
  - See Section 3.3 for block ordering details

---

### Implementation Scope (MVP)

This section defines what should be implemented in the current MVP pass versus what is design-only for future consideration.

**In-scope for this implementation pass:**
- Domain models and tables for `KnowledgeSpace`, `KnowledgePage`, `KnowledgeBlock`, `PageLink`
- Zero integration for local-first sync and optimistic updates
- BlockNote editor in single-editor mode, serializing/encrypting JSON into `knowledge_block.encrypted_content`
- Encryption service and org/space key management at the level described for MVP (space-level keys via HKDF)
- Graph view built from `page_link` table (basic nodes + edges visualization)
- SDK contracts and repositories needed to support the Core User Flows below
- Basic access control policies (organization and team membership checks)
- Database tables with soft-delete support and Zero tracking columns

**Out-of-scope / future (design only in this doc):**
- Real-time CRDT/Yjs collaboration (explicitly not MVP; see Section 5.5)
- Documents integration with `@beep/documents-*` (see Section 10.2 - PROPOSED)
- Audit logging / event bus (see Section 10.3 - PROPOSED)
- Notifications / presence (see Section 10.4 - Future)
- PostgreSQL RLS policies (see Section 7.3 - Future Enhancement)
- Advanced graph analytics (clustering, traversal algorithms)
- Any sections explicitly labeled as PROPOSED or Future

### Core User Flows

The following end-to-end user journeys define the MVP functionality that the implementation must support:

1. **Create a space**
   - User sets name, slug, description, and encryption option
   - Space appears in the spaces list
   - User can navigate to the space

2. **Create and edit pages**
   - User creates a page in a space with a title and content
   - BlockNote editor allows rich text editing (headings, lists, code blocks)
   - Page content is persisted to Zero → PostgreSQL as encrypted blocks
   - User can re-open the page and see content restored

3. **Hierarchical page organization**
   - User creates subpages within a page (nested hierarchy)
   - User can reorder pages in the tree using drag-and-drop
   - Page hierarchy is maintained via `parentPageId` and `order` fields

4. **Wiki-style links**
   - User adds `[[Page Name]]` style links in page content
   - System creates `page_link` entries automatically
   - Backlinks panel shows pages that link to the current page
   - Graph view visualizes page relationships

5. **Offline editing and sync**
   - User goes offline and edits existing pages
   - Changes are stored in local IndexedDB cache
   - User reconnects, and Zero syncs changes to server
   - Last-write-wins behavior resolves any conflicts

6. **Encrypted content**
   - User loads an encrypted space
   - System fetches/derives space encryption key
   - Blocks are decrypted client-side using Web Crypto API
   - Decrypted content renders in BlockNote editor
   - User edits and saves → content is re-encrypted before sync

7. **Access control**
   - User can only view spaces they have access to (org/team membership)
   - User can only edit pages in spaces where they have write permissions
   - Zero auth filters enforce organization-level tenant isolation

---

## 2. Monorepo & Slice Placement

### Package Structure

Following the [Monorepo Structure](https://deepwiki.com/kriegcloud/beep-effect/2.1-monorepo-structure) and [Vertical Slices](https://deepwiki.com/kriegcloud/beep-effect/2.3-domain-driven-design-and-vertical-slices) patterns:

```
packages/documents/
├── domain/                     # @beep/documents-domain
│   ├── src/
│   │   ├── entities/
│   │   │   ├── KnowledgePage/
│   │   │   │   ├── KnowledgePage.model.ts
│   │   │   │   ├── schemas/PageStatus.ts
│   │   │   │   └── index.ts
│   │   │   ├── KnowledgeBlock/
│   │   │   │   ├── KnowledgeBlock.model.ts
│   │   │   │   ├── schemas/BlockType.ts
│   │   │   │   └── index.ts
│   │   │   ├── PageLink/
│   │   │   ├── KnowledgeSpace/
│   │   │   └── index.ts
│   │   ├── value-objects/
│   │   │   ├── BlockContent.ts
│   │   │   ├── EncryptedPayload.ts
│   │   │   └── index.ts
│   │   ├── errors/
│   │   │   ├── page.errors.ts
│   │   │   ├── encryption.errors.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── package.json
├── tables/                     # @beep/documents-tables
│   ├── src/
│   │   ├── tables/
│   │   │   ├── knowledgePage.table.ts
│   │   │   ├── knowledgeBlock.table.ts
│   │   │   ├── pageLink.table.ts
│   │   │   ├── knowledgeSpace.table.ts
│   │   │   └── index.ts
│   │   ├── relations.ts
│   │   ├── schema.ts
│   │   ├── _check.ts
│   │   └── index.ts
│   └── package.json
├── infra/                      # @beep/documents-infra
│   ├── src/
│   │   ├── repositories/
│   │   ├── services/
│   │   │   ├── EncryptionService.ts
│   │   │   ├── ZeroSyncService.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── package.json
├── sdk/                        # @beep/documents-sdk
│   ├── src/
│   │   ├── contracts/
│   │   │   ├── page.contracts.ts
│   │   │   ├── space.contracts.ts
│   │   │   └── graph.contracts.ts
│   │   └── index.ts
│   └── package.json
└── ui/                         # @beep/documents-ui
    ├── src/
    │   ├── components/
    │   │   ├── Editor/
    │   │   ├── PageTree/
    │   │   ├── GraphView/
    │   │   └── index.ts
    │   └── index.ts
    └── package.json
```

### Shared Kernel Integration

**Understanding the Shared Kernel:**

In beep-effect2's vertical slice architecture, `packages/shared/domain` and `packages/shared/tables` form the **shared kernel**—a small set of cross-cutting domain concepts and infrastructure shared by all slices. The shared kernel contains:
- **Core Entities**: User, Organization, Team (from IAM domain, but widely referenced)
- **EntityId Definitions**: Branded ID types for all slices (e.g., `KnowledgePageId`, `UserId`)
- **Audit Patterns**: Common audit fields (`created_at`, `updated_by`, etc.) via `Table.make()` / `OrgTable.make()`
- **Shared Utilities**: `makeFields` helper, `EntityId.make` factory, common schemas

Each vertical slice (including `documents`) defines its **own** domain models and tables under `packages/<slice>/domain` and `packages/<slice>/tables`. The only things this slice contributes to the shared kernel are its **EntityId definitions** (and any truly cross-cutting concepts discovered during implementation).

**EntityIds reside in shared domain** (following the pattern from `packages/shared/domain/src/entity-ids/party.ts`):

```typescript
// packages/shared/domain/src/entity-ids/documents.ts
export const KnowledgePageId = EntityId.make("knowledge_page", {
  brand: "KnowledgePageId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/documents/KnowledgePage"),
    description: "A unique identifier for a knowledge page",
  },
});

export const KnowledgeBlockId = EntityId.make("knowledge_block", {
  brand: "KnowledgeBlockId",
  // ...
});

export const PageLinkId = EntityId.make("page_link", {
  brand: "PageLinkId",
  // ...
});

export const KnowledgeSpaceId = EntityId.make("knowledge_space", {
  brand: "KnowledgeSpaceId",
  // ...
});
```

**Rationale for shared kernel placement:**
- EntityIds are referenced across slice boundaries (e.g., IAM needs to know about `KnowledgePageId` for access logs)
- Maintains consistency with existing slices (iam, party, tasks)
- Alternative considered: Define IDs slice-locally and only export type brands → rejected because it complicates cross-slice type safety

---

## 3. Domain & Bounded Context Design

<!-- MCP_DOC_REFERENCE
When implementing domain models, reference Effect SQL Model documentation:
Tool: mcp__effect_docs__effect_docs_search
Query: "@effect/sql Model Class makeFields"
Reason: Domain models use M.Class pattern from @effect/sql/Model for database integration
Context: All entities (KnowledgeSpace, KnowledgePage, KnowledgeBlock, PageLink) follow this pattern
Example call: mcp__effect_docs__effect_docs_search({ query: "@effect/sql Model Class" })
-->

<!-- MCP_DOC_REFERENCE
For Effect Schema patterns used in domain models:
Tool: mcp__effect_docs__effect_docs_search
Query: "effect Schema Struct pipe maxLength"
Reason: Domain models use Effect Schema for validation (e.g., S.String.pipe(S.maxLength(500)))
Context: Used for title validation, status enums, and field constraints
Example call: mcp__effect_docs__effect_docs_search({ query: "Schema Struct validation" })
-->

### 3.0 Common Imports & Conventions

All domain models follow consistent import patterns from the beep-effect2 monorepo. This section documents the standard imports used throughout the documents slice.

**Standard Domain Model Imports:**

```typescript
// packages/documents/domain/src/entities/{Entity}/{Entity}.model.ts

// Effect SQL Model for M.Class pattern
import * as M from "@effect/sql/Model";

// Effect Schema for validation (aliased as S for brevity)
import * as S from "effect/Schema";

// beep-effect Schema utilities (aliased as BS for "Beep Schema")
import {BS} from "@beep/schema";

// Shared domain utilities
import { makeFields } from "@beep/shared-domain/common";

// EntityIds from shared kernel
import {SharedEntityIds} from "@beep/shared-domain/entity-ids";
import {
  KnowledgeSpaceId,
  KnowledgePageId,
  KnowledgeBlockId,
  PageLinkId
} from "@beep/shared-domain/entity-ids/documents";

// Schema kits for enums (created using StringLiteralKit)
import { PageStatus } from "./schemas/PageStatus";
import { BlockType } from "./schemas/BlockType";
// etc.
```

**Standard Table Definition Imports:**

```typescript
// packages/documents/tables/src/tables/{table}.table.ts

// Drizzle ORM pg-core
import * as pg from "drizzle-orm/pg-core";

// beep-effect table factories
import { OrgTable } from "@beep/shared-tables";

// beep-effect Schema utilities (for toPgEnum)
import {BS} from "@beep/schema";

// EntityIds
import { KnowledgeSpaceId, KnowledgePageId } from "@beep/shared-domain/entity-ids/documents";
import {SharedEntityIds} from "@beep/shared-domain/entity-ids";

// Domain schemas (for pg enums)
import { PageStatus, BlockType } from "@beep/documents-domain/entities";
```

**Standard Repository/Service Imports:**

```typescript
// packages/documents/infra/src/repositories/{Entity}Repository.ts

import { Effect, Context, Layer } from "effect";
import { SqlClient } from "@effect/sql";

// Domain models
import { KnowledgePage } from "@beep/documents-domain/entities";

// Tables
import { knowledgePage } from "@beep/documents-tables";

// Errors
import { PageNotFoundError, UnauthorizedError } from "@beep/documents-domain/errors";
```

**Standard SDK Contract Imports:**

```typescript
// packages/documents/sdk/src/contracts/{feature}.contracts.ts

import * as S from "effect/Schema";
import { Contract } from "@beep/contract";

// Domain models & schemas
import { KnowledgePage } from "@beep/documents-domain/entities";
import { KnowledgePageId } from "@beep/shared-domain/entity-ids/documents";

// Errors
import { PageNotFoundError, UnauthorizedError } from "@beep/documents-domain/errors";
```

**Key Conventions:**

1. **Namespace Aliases:**
   - `S` = `Schema` from Effect (used for validation primitives like `S.String`, `S.Int`)
   - `BS` = Beep Schema utilities from `@beep/schema` (used for `BS.FieldOptionOmittable`, `BS.NameAttribute`, `BS.toPgEnum`)
   - `M` = Model from `@effect/sql/Model` (used for `M.Class` pattern)

2. **EntityId Imports:**
   - Knowledge-management EntityIds come from `@beep/shared-domain/entity-ids/documents`
   - Cross-slice EntityIds (UserId, OrganizationId, TeamId) come from `@beep/shared-domain/entity-ids` or imported via wildcard as `SharedEntityIds`

3. **Path Aliases:**
   - Always use `@beep/*` path aliases defined in `tsconfig.base.jsonc`
   - Never use relative imports like `../../../packages/xyz`
   - Example: `@beep/documents-domain` not `../../domain/src`

4. **Schema Kit Pattern:**
   - Enums are created using `StringLiteralKit` from `@beep/schema/derived/kits`
   - Imported as `*` (e.g., `PageStatus`, `BlockType`, `LinkType`)
   - Provides `.Enum`, `.Options` as static methods attached to the schema.

5. **makeFields Helper:**
   - Imported from `@beep/shared-domain/common`
   - Composes EntityId with additional fields and audit columns
   - Returns Effect Schema-compatible struct for use with `M.Class`

**Example: Complete Domain Model with All Imports:**

```typescript
// packages/documents/domain/src/entities/KnowledgePage/KnowledgePage.model.ts
import { PageStatus } from "@beep/documents-domain/value-objects";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export class Model extends M.Class<Model>(`KnowledgePageModel`)(
  makeFields(DocumentsEntityIds.KnowledgePageId, {
    spaceId: DocumentsEntityIds.KnowledgeSpaceId,
    organizationId: SharedEntityIds.OrganizationId,
    parentPageId: BS.FieldOptionOmittable(DocumentsEntityIds.KnowledgePageId),
    title: S.String.pipe(S.maxLength(500)),
    slug: S.String,
    status: PageStatus,
    order: BS.toOptionalWithDefault(S.Int)(0),
    lastEditedAt: BS.DateTimeUtcFromAllAcceptable,
  })
) {
  static readonly utils = modelKit(Model);
}

```

**Note on BS Namespace:**
The `BS` (Beep Schema) namespace from `@beep/schema` exports:
- `BS.FieldOptionOmittable` - Marks fields as nullable/optional
- `BS.NameAttribute` - String with max length 255, trimmed
- `BS.DateTimeUtcFromAllAcceptable` - Date/timestamp parser
- `BS.toPgEnum` - Converts Effect Schema to Drizzle pg enum
- And other schema utilities documented in `packages/common/schema/src/index.ts`

---

### Core Domain Entities

#### 3.1 KnowledgeSpace

**Responsibilities:**
- Top-level container for organizing related pages (analogous to a Notion workspace or Obsidian vault)
- Scoped to an organization with optional team-level access restrictions
- Defines encryption policy and default permissions

**Invariants:**
- Must have a unique slug within an organization
- Owner must be a member of the parent organization
- Cannot be deleted if it contains non-deleted pages (soft delete cascade required)

**EntityId:**
```typescript
KnowledgeSpaceId = EntityId.make("knowledge_space", { brand: "KnowledgeSpaceId" })
```

**Domain Model Sketch:**
```typescript
// packages/documents/domain/src/entities/KnowledgeSpace/KnowledgeSpace.model.ts
import { BS } from "@beep/schema";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export class Model extends M.Class<Model>(`KnowledgeSpaceModel`)(
  makeFields(DocumentsEntityIds.KnowledgeSpaceId, {
    organizationId: SharedEntityIds.OrganizationId,
    teamId: BS.FieldOptionOmittable(SharedEntityIds.TeamId),
    ownerId: SharedEntityIds.UserId,
    name: BS.NameAttribute,
    slug: S.String,
    description: BS.FieldOptionOmittable(S.String),
    isEncrypted: S.Boolean,
    encryptionKeyId: BS.FieldOptionOmittable(S.String), // Reference to key management system
    defaultPermissions: S.Struct({
      canRead: S.Array(S.String),
      canWrite: S.Array(S.String),
    }),
  })
) {
  static readonly utils = modelKit(Model);
}

```

**Interaction with IAM:**
- `organizationId` ties space to multi-tenant boundary
- `teamId` enables sub-org access control (optional)
- `ownerId` determines who can delete/transfer ownership

---

#### 3.2 KnowledgePage

**Responsibilities:**
- Top-level document within a space (equivalent to a Notion page)
- Contains hierarchical blocks (content structure)
- Tracks metadata: title (plaintext for indexing), parent-child relationships (nested pages), visibility status

**Invariants:**
- Must belong to exactly one `KnowledgeSpace`
- Title cannot exceed 500 characters
- Parent page (if set) must exist and belong to same space
- Cannot be its own ancestor (enforced via recursive CTE query)

**EntityId:**
```typescript
KnowledgePageId = EntityId.make("knowledge_page", { brand: "KnowledgePageId" })
```

**Domain Model Sketch:**
```typescript
import { PageStatus } from "@beep/documents-domain/value-objects";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export class Model extends M.Class<Model>(`KnowledgePageModel`)(
  makeFields(DocumentsEntityIds.KnowledgePageId, {
    spaceId: DocumentsEntityIds.KnowledgeSpaceId,
    organizationId: SharedEntityIds.OrganizationId,
    parentPageId: BS.FieldOptionOmittable(DocumentsEntityIds.KnowledgePageId),
    title: S.String.pipe(S.maxLength(500)),
    slug: S.String,
    status: PageStatus,
    order: BS.toOptionalWithDefault(S.Int)(0),
    lastEditedAt: BS.DateTimeUtcFromAllAcceptable,
  })
) {
  static readonly utils = modelKit(Model);
}

```

**Why title is plaintext:**
- Trade-off: Enables full-text search at the expense of leaking titles to server
- Alternative: Encrypt titles → breaks search, folder tree rendering becomes cumbersome
- Chosen strategy: Encrypt sensitive titles manually via prefixing (e.g., user adds "[Private]" to title and uses encrypted blocks for actual content)

---

#### 3.3 KnowledgeBlock

**Responsibilities:**
- Atomic content unit (paragraph, heading, code block, etc.)
- Stores encrypted content payload (BlockNote JSON serialization)
- Maintains parent-child hierarchy and sibling ordering

**Invariants:**
- Must belong to exactly one `KnowledgePage`
- Parent block (if set) must belong to same page
- Order must be unique per parent scope (enforced via unique index)
- Cannot exceed 100KB per block (prevent abuse)

**EntityId:**
```typescript
KnowledgeBlockId = EntityId.make("knowledge_block", { brand: "KnowledgeBlockId" })
```

**Domain Model Sketch:**
```typescript
import { BlockType } from "@beep/documents-domain/value-objects";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
export class Model extends M.Class<Model>(`KnowledgeBlockModel`)(
  makeFields(DocumentsEntityIds.KnowledgeBlockId, {
    pageId: DocumentsEntityIds.KnowledgePageId,
    parentBlockId: BS.FieldOptionOmittable(DocumentsEntityIds.KnowledgeBlockId),
    organizationId: SharedEntityIds.OrganizationId,
    type: BlockType, // 'paragraph' | 'heading' | 'code' | 'image' | ...
    order: S.String, // Fractional indexing (text type for string keys like "a0", "a0V")
    encryptedContent: S.String, // Encrypted JSON blob (BlockNote content)
    contentHash: S.String, // SHA256 for deduplication/integrity
    lastEditedBy: SharedEntityIds.UserId, // Domain-specific: tracks content editor
  })
) {
  static readonly utils = modelKit(Model);
}

```

**Key Design Choice: Fractional Indexing for `order`**
- Allows inserting blocks between existing ones without renumbering siblings
- Example: Block A (order: "a0"), Block B (order: "a1") → Insert C between them (order: "a0V")
- Library: Use `fractional-indexing` npm package (implements Figma's algorithm)
- **Important:** Returns string keys, not numbers - store as `text` column, not numeric

<!-- MCP_DOC_REFERENCE
For fractional indexing implementation:
Tool: mcp__context7__get-library-docs
Library: fractional-indexing
Topic: "generateKeyBetween generateNKeysBetween ordering"
Reason: Fractional indexing provides conflict-free ordering for blocks without requiring renumbering
Context: Used for block.order field to allow inserting blocks between existing ones
Example call:
1. mcp__context7__resolve-library-id({ libraryName: "fractional-indexing" })
2. mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/rocicorp/fractional-indexing", topic: "API reference" })
-->

---

#### 3.4 PageLink

**Responsibilities:**
- Represents explicit bidirectional links between pages (e.g., `[[Page A]]` mentions `Page B`)
- Powers graph view and backlink panels
- Distinguishes between manual links (user-created) and inline references (auto-detected from block content)

**Invariants:**
- Source and target pages must exist and belong to same organization
- No duplicate links (unique constraint on `sourcePageId + targetPageId`)
- Self-links are allowed (page can reference itself)

**EntityId:**
```typescript
PageLinkId = EntityId.make("page_link", { brand: "PageLinkId" })
```

**Domain Model Sketch:**
```typescript
export class Model extends M.Class<Model>(`PageLinkModel`)(
  makeFields(PageLinkId, {
    sourcePageId: KnowledgePageId,
    targetPageId: KnowledgePageId,
    organizationId: SharedEntityIds.OrganizationId,
    linkType: LinkType, // 'explicit' | 'inline_reference' | 'block_embed'
    sourceBlockId: BS.FieldOptionOmittable(KnowledgeBlockId), // For inline refs
    contextSnippet: BS.FieldOptionOmittable(S.String), // 50 chars around link
    // Note: makeFields() automatically adds audit fields (createdAt, updatedAt, deletedAt, createdBy, updatedBy, deletedBy, version, source)
  })
) {}
```

**Graph View Query Pattern:**
```typescript
// Example Effect-based repository method
const getGraphData = (spaceId: KnowledgeSpaceId) =>
  Effect.gen(function* () {
    const links = yield* sql<{ source: string; target: string }>`
      SELECT
        pl.source_page_id as source,
        pl.target_page_id as target,
        COUNT(*) as weight
      FROM page_link pl
      JOIN knowledge_page p ON pl.source_page_id = p.id
      WHERE p.space_id = ${spaceId}
      GROUP BY pl.source_page_id, pl.target_page_id
    `;
    return links;
  });
```

---

### Entity Relationships

```
KnowledgeSpace (1) ──< (N) KnowledgePage
                                  │
                                  ├──< (N) KnowledgeBlock (self-referential parent/child)
                                  │
                                  └──< (N) PageLink (self-referential source/target)

Organization (IAM) ──< (N) KnowledgeSpace
                            │
                            └─ (N) Member (IAM) via access control
```

---

### 3.5 Entity-to-File-to-Package Mappings

This section provides clear mappings showing which domain entities, tables, value objects, and error definitions live in which files and packages.

#### Domain Entities

| Entity         | File Path                                                                                          | Package                           |
|----------------|----------------------------------------------------------------------------------------------------|-----------------------------------|
| KnowledgeSpace | packages/documents/domain/src/entities/KnowledgeSpace/KnowledgeSpace.model.ts           | @beep/documents-domain |
| KnowledgePage  | packages/documents/domain/src/entities/KnowledgePage/KnowledgePage.model.ts             | @beep/documents-domain |
| KnowledgeBlock | packages/documents/domain/src/entities/KnowledgeBlock/KnowledgeBlock.model.ts           | @beep/documents-domain |
| PageLink       | packages/documents/domain/src/entities/PageLink/PageLink.model.ts                       | @beep/documents-domain |

#### Table Definitions

| Table               | File Path                                                               | Package                           |
|---------------------|-------------------------------------------------------------------------|-----------------------------------|
| knowledgeSpace      | packages/documents/tables/src/tables/knowledgeSpace.table.ts | @beep/documents-tables |
| knowledgePage       | packages/documents/tables/src/tables/knowledgePage.table.ts  | @beep/documents-tables |
| knowledgeBlock      | packages/documents/tables/src/tables/knowledgeBlock.table.ts | @beep/documents-tables |
| pageLink            | packages/documents/tables/src/tables/pageLink.table.ts       | @beep/documents-tables |
| relations           | packages/documents/tables/src/relations.ts                   | @beep/documents-tables |
| schema              | packages/documents/tables/src/schema.ts                      | @beep/documents-tables |
| _check (validation) | packages/documents/tables/src/_check.ts                      | @beep/documents-tables |

#### Value Objects & Schema Kits

| Value Object / Kit | File Path                                                                             | Package                           |
|--------------------|---------------------------------------------------------------------------------------|-----------------------------------|
| PageStatus         | packages/documents/domain/src/entities/KnowledgePage/schemas/PageStatus.ts | @beep/documents-domain |
| BlockType          | packages/documents/domain/src/entities/KnowledgeBlock/schemas/BlockType.ts | @beep/documents-domain |
| LinkType           | packages/documents/domain/src/entities/PageLink/schemas/LinkType.ts        | @beep/documents-domain |
| BlockContent       | packages/documents/domain/src/value-objects/BlockContent.ts                | @beep/documents-domain |
| EncryptedPayload   | packages/documents/domain/src/value-objects/EncryptedPayload.ts            | @beep/documents-domain |

#### Error Definitions

| Error Category    | File Path                                                            | Package                           |
|-------------------|----------------------------------------------------------------------|-----------------------------------|
| Page Errors       | packages/documents/domain/src/errors/page.errors.ts       | @beep/documents-domain |
| Encryption Errors | packages/documents/domain/src/errors/encryption.errors.ts | @beep/documents-domain |
| General Errors    | packages/documents/domain/src/errors/index.ts             | @beep/documents-domain |

#### EntityIds (Shared Kernel)

| EntityId           | File Path                                                               | Package             |
|--------------------|-------------------------------------------------------------------------|---------------------|
| KnowledgeSpaceId   | packages/shared/domain/src/entity-ids/documents.ts           | @beep/shared-domain |
| KnowledgePageId    | packages/shared/domain/src/entity-ids/documents.ts           | @beep/shared-domain |
| KnowledgeBlockId   | packages/shared/domain/src/entity-ids/documents.ts           | @beep/shared-domain |
| PageLinkId         | packages/shared/domain/src/entity-ids/documents.ts           | @beep/shared-domain |

**Note:** EntityIds reside in the shared kernel (`@beep/shared-domain`) because they are referenced across slice boundaries. See Section 2 "Shared Kernel Integration" for rationale.

---

## 4. Data & Database Modeling

Following the [Database Layer](https://deepwiki.com/kriegcloud/beep-effect/4.2-database-layer) patterns and `packages/shared/tables` conventions.

### 4.1 Global Columns Reference

Both `Table.make()` and `OrgTable.make()` automatically add:
- `id` (text, public UUID)
- `_row_id` (serial, internal DB key)
- `created_at`, `updated_at`, `deleted_at` (timestamps with timezone)
- `created_by`, `updated_by`, `deleted_by` (text, user tracking)
- `version` (integer, optimistic locking)
- `source` (text, optional traceability)

**Additionally, `OrgTable.make()` adds:**
- `organization_id` (text, foreign key to `organization.id`, cascading delete)

See `packages/shared/tables/src/common.ts` and `Columns.ts` for implementation.

---

### 4.2 Table Definitions

> **Implementation Constraints Reference:** This section implements Implementation Constraints (6) PostgreSQL + Zero tracking, (7) Snake_case column names, and (8) Soft delete with `deleted_at`.

<!-- MCP_DOC_REFERENCE
For Drizzle ORM table definitions and column types:
Tool: mcp__context7__get-library-docs
Library: drizzle-orm
Topic: "schema definition pgTable references foreign keys indexes"
Reason: All table definitions use Drizzle ORM pg-core for schema definition
Context: Reference for pg.text(), pg.jsonb(), references(), uniqueIndex(), etc.
Example call:
1. mcp__context7__resolve-library-id({ libraryName: "drizzle-orm" })
2. mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/drizzle-team/drizzle-orm", topic: "postgresql schema" })
-->

#### knowledge_space

**Pattern:** `OrgTable.make()` (organization-scoped, cascading delete on org removal)

```typescript
// packages/documents/tables/src/tables/knowledgeSpace.table.ts
import { KnowledgeSpaceId } from "@beep/shared-domain/entity-ids";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { user } from "@beep/iam-tables";
import { team } from "@beep/iam-tables";

export const knowledgeSpace = OrgTable.make(KnowledgeSpaceId)({
  teamId: pg
    .text("team_id")
    .references(() => team.id, { onDelete: "cascade" })
    .$type<SharedEntityIds.TeamId.Type>(), // Nullable (organization-wide space)
  ownerId: pg
    .text("owner_id")
    .notNull()
    .references(() => user.id)
    .$type<SharedEntityIds.UserId.Type>(),
  name: pg.text("name").notNull(),
  slug: pg.text("slug").notNull(),
  description: pg.text("description"),
  isEncrypted: pg.boolean("is_encrypted").notNull().default(true),
  encryptionKeyId: pg.text("encryption_key_id"),
  defaultPermissions: pg.jsonb("default_permissions").notNull().default({ canRead: ["member"], canWrite: ["owner"] }),
}, (t) => [
  pg.uniqueIndex("knowledge_space_org_slug_idx").on(t.organizationId, t.slug),
  pg.index("knowledge_space_owner_idx").on(t.ownerId),
]);
```

**Global Columns Added:**
- `id` (KnowledgeSpaceId)
- `_row_id`
- `organization_id` (auto-added by `OrgTable.make`)
- `created_at`, `updated_at`, `deleted_at`
- `created_by`, `updated_by`, `deleted_by`
- `version`, `source`

**Custom Columns:**
- `team_id` (optional team scope)
- `owner_id` (creator/owner)
- `name`, `slug`, `description`
- `is_encrypted`, `encryption_key_id`
- `default_permissions` (JSONB)

**Indexes:**
- Unique: `(organization_id, slug)` for slug uniqueness per org
- Non-unique: `owner_id` for "my spaces" queries

---

#### knowledge_page

**Pattern:** `OrgTable.make()` (belongs to org via space)

```typescript
// packages/documents/tables/src/tables/knowledgePage.table.ts
import { PageStatus } from "@beep/documents-domain/value-objects";
import { BS } from "@beep/schema";
import { DocumentsEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { knowledgeSpace } from "./knowledgeSpace.table";

const pageStatusPgEnum = BS.toPgEnum(PageStatus)("page_status_enum");

export const knowledgePage = OrgTable.make(DocumentsEntityIds.KnowledgePageId)(
  {
    spaceId: pg
      .text("space_id")
      .notNull()
      .references(() => knowledgeSpace.id, { onDelete: "cascade" })
      .$type<DocumentsEntityIds.KnowledgeSpaceId.Type>(),
    parentPageId: pg.text("parent_page_id").$type<DocumentsEntityIds.KnowledgePageId.Type>(),
    title: pg.text("title").notNull(),
    slug: pg.text("slug").notNull(),
    status: pageStatusPgEnum("status").notNull(),
    order: pg.integer("order").notNull().default(0),
    lastEditedAt: pg.timestamp("last_edited_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    pg.uniqueIndex("knowledge_page_space_slug_idx").on(t.spaceId, t.slug),
    pg.index("knowledge_page_space_idx").on(t.spaceId),
    pg.index("knowledge_page_parent_idx").on(t.parentPageId),
    pg.index("knowledge_page_status_idx").on(t.status),
  ]
);

```

**Custom Columns:**
- `space_id` (FK to `knowledge_space`, cascade delete)
- `parent_page_id` (nullable self-FK for nested pages)
- `created_by`, `last_edited_by` (user references)
- `title`, `slug` (plaintext for search)
- `status` (enum: draft/published/archived)
- `order` (integer for sibling sorting)
- `last_edited_at` (denormalized for "recent pages" queries)

**Indexes:**
- Unique: `(space_id, slug)` for URL generation
- Non-unique: `parent_page_id` (tree queries), `(space_id, order)` (sorted lists), `last_edited_at` (recency)

**Soft Delete Behavior:**
- Setting `deleted_at` hides page from queries but preserves data
- Child pages inherit soft delete via application logic (not DB cascade)

---

#### knowledge_block

**Pattern:** `OrgTable.make()` (belongs to org via page)

```typescript
// packages/documents/tables/src/tables/knowledgeBlock.table.ts
import { BlockType } from "@beep/documents-domain/value-objects";
import { BS } from "@beep/schema";
import type { SharedEntityIds } from "@beep/shared-domain";
import { DocumentsEntityIds } from "@beep/shared-domain";
import { OrgTable, user } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { knowledgePage } from "./knowledgePage.table";

const blockTypePgEnum = BS.toPgEnum(BlockType)("block_type_enum");

export const knowledgeBlock = OrgTable.make(DocumentsEntityIds.KnowledgeBlockId)(
  {
    pageId: pg
      .text("page_id")
      .notNull()
      .references(() => knowledgePage.id, { onDelete: "cascade" })
      .$type<DocumentsEntityIds.KnowledgePageId.Type>(),
    parentBlockId: pg.text("parent_block_id").$type<DocumentsEntityIds.KnowledgeBlockId.Type>(),
    type: blockTypePgEnum("type").notNull(),
    order: pg.text("order").notNull(), // Fractional indexing (text type for string keys like "a0", "a0V")
    encryptedContent: pg.text("encrypted_content").notNull(), // Encrypted JSON blob (BlockNote content)
    contentHash: pg.text("content_hash").notNull(), // SHA256 for deduplication/integrity
    lastEditedBy: pg
      .text("last_edited_by")
      .notNull()
      .references(() => user.id)
      .$type<SharedEntityIds.UserId.Type>(),
  },
  (t) => [
    pg.index("knowledge_block_page_idx").on(t.pageId),
    pg.index("knowledge_block_parent_idx").on(t.parentBlockId),
    pg.index("knowledge_block_order_idx").on(t.pageId, t.order),
    pg.index("knowledge_block_content_hash_idx").on(t.contentHash),
  ]
);

```

**Custom Columns:**
- `page_id` (FK to `knowledge_page`, cascade delete)
- `parent_block_id` (nullable self-FK for nested blocks)
- `type` (enum: paragraph, heading, code, image, etc.)
- `order` (text for fractional indexing - stores strings like "a0", "a0V", "a1")
- `encrypted_content` (text, AES-256-GCM encrypted BlockNote JSON)
- `content_hash` (SHA256 of plaintext, for deduplication)
- `last_edited_by` (user reference)

**Indexes:**
- Non-unique: `page_id` (fetch all blocks for a page), `parent_block_id` (tree queries)
- Unique: `(page_id, parent_block_id, order)` (prevents duplicate ordering)
- Non-unique: `content_hash` (deduplication queries)

**Size Limit Enforcement:**
- Application layer validates `encrypted_content.length < 100_000` before insert
- Alternative: Use PostgreSQL check constraint → rejected to avoid coupling domain rules to DB

---

#### page_link

**Pattern:** `OrgTable.make()` (scoped to organization)

```typescript
// packages/documents/tables/src/tables/pageLink.table.ts
import { LinkType } from "@beep/documents-domain/value-objects";
import { BS } from "@beep/schema";
import { DocumentsEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { knowledgeBlock } from "./knowledgeBlock.table";
import { knowledgePage } from "./knowledgePage.table";

export const linkTypePgEnum = BS.toPgEnum(LinkType)("link_type_enum");

export const pageLink = OrgTable.make(DocumentsEntityIds.PageLinkId)(
  {
    sourcePageId: pg
      .text("source_page_id")
      .notNull()
      .references(() => knowledgePage.id, { onDelete: "cascade" })
      .$type<DocumentsEntityIds.KnowledgePageId.Type>(),
    targetPageId: pg
      .text("target_page_id")
      .notNull()
      .references(() => knowledgePage.id, { onDelete: "cascade" })
      .$type<DocumentsEntityIds.KnowledgePageId.Type>(),
    linkType: linkTypePgEnum("link_type").notNull(),
    sourceBlockId: pg
      .text("source_block_id")
      .references(() => knowledgeBlock.id, { onDelete: "cascade" })
      .$type<DocumentsEntityIds.KnowledgeBlockId.Type>(),
    contextSnippet: pg.text("context_snippet"), // 50 chars around link
  },
  (t) => [
    pg.index("page_link_source_idx").on(t.sourcePageId),
    pg.index("page_link_target_idx").on(t.targetPageId),
    pg.index("page_link_type_idx").on(t.linkType),
    pg.uniqueIndex("page_link_source_target_block_idx").on(t.sourcePageId, t.targetPageId, t.sourceBlockId),
  ]
);

```

**Custom Columns:**
- `source_page_id`, `target_page_id` (FKs to `knowledge_page`, cascade delete)
- `link_type` (enum: explicit, inline_reference, block_embed)
- `source_block_id` (optional FK to `knowledge_block`)
- `context_snippet` (plaintext excerpt around link)

**Indexes:**
- Unique: `(source_page_id, target_page_id, source_block_id)` (no duplicate links)
- Non-unique: `target_page_id` (backlink queries), `source_page_id` (outbound links)

---

### 4.3 Domain Model ↔ Table Consistency

Following the `_check.ts` pattern from `packages/shared/tables/src/_check.ts` and `packages/iam/tables/src/_check.ts`:

```typescript
// packages/documents/tables/src/_check.ts
import type {
  KnowledgeBlock,
  KnowledgePage,
  KnowledgeSpace,
  PageLink,
} from "@beep/documents-domain/entities";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type * as tables from "./schema";

// KnowledgeSpace type checks
export const _checkSelectKnowledgeSpace: typeof KnowledgeSpace.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.knowledgeSpace
>;

export const _checkInsertKnowledgeSpace: typeof KnowledgeSpace.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.knowledgeSpace
>;

// KnowledgePage type checks
export const _checkSelectKnowledgePage: typeof KnowledgePage.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.knowledgePage
>;

export const _checkInsertKnowledgePage: typeof KnowledgePage.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.knowledgePage
>;

// KnowledgeBlock type checks
export const _checkSelectKnowledgeBlock: typeof KnowledgeBlock.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.knowledgeBlock
>;

export const _checkInsertKnowledgeBlock: typeof KnowledgeBlock.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.knowledgeBlock
>;

// PageLink type checks
export const _checkSelectPageLink: typeof PageLink.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.pageLink
>;

export const _checkInsertPageLink: typeof PageLink.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.pageLink
>;

```

**How it works:**
- TypeScript structural typing enforces that domain model schemas match table column types
- If table columns don't align with domain fields, compilation fails
- No runtime overhead—purely static validation

---

## 5. Sync, Local-First & Collaboration

### 5.1 Zero Architecture

<!-- MCP_DOC_REFERENCE
For Zero local-first sync architecture:
Tool: mcp__context7__get-library-docs
Library: @rocicorp/zero
Topic: "ZeroProvider useZero schema definition mutations queries"
Reason: Zero provides local-first sync with IndexedDB cache and PostgreSQL backend
Context: Reference for Zero client setup, schema configuration, reactive queries, and optimistic mutations
Example call:
1. mcp__context7__resolve-library-id({ libraryName: "@rocicorp/zero" })
2. mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/rocicorp/zero", topic: "getting started" })
-->

**Zero's Role:**
Zero (`@rocicorp/zero`, already in dependencies per `package.json`) fronts PostgreSQL with:
- **Local Cache**: IndexedDB in the browser stores a reactive snapshot of subscribed tables
- **Real-Time Sync**: WebSocket connection pushes server-side changes to clients
- **Optimistic Mutations**: Client writes update local cache immediately, sync to server in background
- **Conflict Resolution**: Last-write-wins with server authority for all changes (metadata, content, structure)

**Tables Synced via Zero:**
- `knowledge_page` (metadata: title, slug, status, timestamps)
- `knowledge_block` (structure: type, order, parent relationships; content stored as encrypted blob)
- `page_link` (graph edges)
- `knowledge_space` (space metadata)

**Not Synced via Zero:**
- IAM tables (user/org/team data) → fetched on-demand via SDK contracts
- Large assets (images) → stored in S3, only URLs synced

---

### 5.2 Read Flow (Local-First)

```
1. App loads → Zero initializes IndexedDB cache
2. User opens a page → Query local cache (instant)
3. Zero syncs with server → Streams diffs via WebSocket
4. Local cache updates → React components re-render (reactive)
```

**Effect Implementation:**
```typescript
// packages/documents-sdk/src/hooks/usePage.ts
export const usePage = (pageId: KnowledgePageId.Type) => {
  const zero = useZeroClient();

  // Subscribe to local cache (Zero query)
  const page = zero.query.knowledgePage
    .where("id", "=", pageId)
    .one();

  return page; // Reactive signal
};
```

---

### 5.3 Write Flow (Optimistic + Sync)

```
1. User edits title → Update local IndexedDB immediately
2. UI reflects change (no latency)
3. Zero queues mutation → POST to server endpoint
4. Server validates + writes to PostgreSQL
5. Server broadcasts change to other clients via Zero
6. On conflict (e.g., concurrent rename) → Server wins, client cache updated
```

**Effect Contract Example:**
```typescript
// packages/documents-sdk/src/contracts/page.contracts.ts
import { Contract } from "@beep/contract";

export const updatePageTitle = Contract.make({
  payload: S.Struct({
    pageId: KnowledgePageId,
    title: S.String.pipe(S.maxLength(500)),
  }),
  success: S.Struct({
    page: KnowledgePage.Model.select,
  }),
  failure: S.Union(
    PageNotFoundError,
    PageTitleTooLongError,
    UnauthorizedError,
  ),
});
```

**Client Usage:**
```typescript
// apps/web/src/app/knowledge/[pageId]/page.tsx
const updateTitle = useContract(updatePageTitle);

const handleRename = async (newTitle: string) => {
  // Optimistic local update
  zero.mutate.knowledgePage.update(pageId, { title: newTitle });

  // Sync to server
  const result = await updateTitle.run({ pageId, title: newTitle });

  if (result._tag === "Failure") {
    // Rollback on error
    toast.error(result.error.message);
    zero.sync(); // Refresh from server
  }
};
```

---

### 5.4 BlockNote Editor Integration

> **Implementation Constraints Reference:** This section implements Implementation Constraints (1) Zero-only sync (no Yjs), (2) BlockNote single-editor mode, and (4) Last-write-wins conflict resolution.

<!-- MCP_DOC_REFERENCE
For BlockNote editor integration:
Tool: mcp__context7__get-library-docs
Library: @blocknote/react, @blocknote/core
Topic: "useBlockNote editor configuration schema blocks"
Reason: BlockNote provides the rich text editor for knowledge pages
Context: Reference for useBlockNote hook, editor configuration, custom schemas, and block types
Example call:
1. mcp__context7__resolve-library-id({ libraryName: "@blocknote/react" })
2. mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/TypeCellOS/BlockNote", topic: "react hooks" })
-->

**BlockNote's Role:**
- Provides rich text editing with support for paragraphs, headings, lists, code blocks, images, and embeds
- Used in **single-editor mode** (not collaborative mode for MVP)
- Each block's content is serialized to JSON, encrypted, and stored in `knowledge_block.encrypted_content`

**Data Flow:**

```
┌─────────────────────────────────────────┐
│  BlockNote Editor (Client)               │
│  ├─ User edits content                   │
│  └─ On save/blur → Serialize to JSON    │
└────────────────┬────────────────────────┘
                 │ (Encrypt with Web Crypto API)
                 ▼
┌─────────────────────────────────────────┐
│  knowledge_block.encrypted_content       │
│  (PostgreSQL via Zero)                   │
└────────────────┬────────────────────────┘
                 │ (Zero syncs to all clients)
                 ▼
┌─────────────────────────────────────────┐
│  BlockNote Editor (Other Clients)        │
│  ├─ Load encrypted JSON from DB          │
│  └─ Decrypt → Render blocks             │
└─────────────────────────────────────────┘
```

**Block Storage Format:**
```typescript
// knowledge_block table
{
  encryptedContent: "AES-GCM encrypted BlockNote JSON content",
  contentHash: "SHA256 hash of plaintext (for deduplication)",
  type: "paragraph" | "heading" | "code" | "image" | ...,
  order: "a0" | "a0V" | "a1" | ... // Fractional indexing
}
```

**Conflict Resolution:**
- **Block content**: Last-write-wins (server timestamp via Zero)
- **Block structure** (order, parent): Last-write-wins with fractional indexing preventing order conflicts
- **Page metadata** (title, slug): Last-write-wins with optimistic locking (`version` column)

**Why Not Real-Time Collaboration for MVP:**
- ✅ **Simpler architecture**: No need for separate Yjs WebSocket server or CRDT state management
- ✅ **Sufficient for MVP**: Snapshot-on-save pattern works for most use cases
- ✅ **Zero handles sync**: Optimistic updates + automatic conflict resolution
- ❌ **No character-level merging**: If two users edit the same block concurrently, last save wins
- 📝 **Future enhancement**: Add real-time collaboration in v2 if user feedback shows need

---

### 5.5 Architectural Decision: Zero-Only Sync (No Yjs)

**⚠️ ARCHITECTURAL DECISION: Zero-Only Approach**

After evaluating the complexity of integrating both Zero (last-write-wins sync) and Yjs (CRDT merging), we decided to use **Zero alone** for the MVP.

**The Problem with Dual-Sync:**
- Zero syncs database columns using **last-write-wins** (LWW) conflict resolution
- Yjs requires **CRDT merging** to preserve concurrent character-level edits
- Running both systems simultaneously creates conflicts:
  - If two clients edit the same block, Zero's LWW would overwrite Yjs state vectors
  - The "losing" client's edits are silently discarded
  - Requires complex coordination between sync systems

**Chosen Solution: Zero-Only with Last-Write-Wins (MVP)**

For MVP, we use Zero for all synchronization with BlockNote in single-editor mode:

**Implementation:**
1. **Zero syncs everything**: metadata, block content, structure (order, parent relationships)
2. **BlockNote in single-editor mode**: No collaborative text editing (no Yjs)
3. **On save/blur**:
   - Serialize BlockNote content → JSON
   - Encrypt JSON → Store in `encrypted_content` column
   - Zero syncs encrypted blob to other clients
4. **On load:**
   - Fetch latest content from PostgreSQL (via Zero cache)
   - Decrypt → Parse JSON → Render in BlockNote

**Trade-Offs:**
- ✅ **Pros**: Much simpler architecture - single sync system (Zero only)
- ✅ **Pros**: No separate WebSocket server or CRDT state management needed
- ✅ **Pros**: Zero handles optimistic updates and conflict resolution automatically
- ✅ **Pros**: Works perfectly for snapshot-on-save pattern
- ❌ **Cons**: No character-level merging - if two users edit the same block concurrently, last save wins
- ❌ **Cons**: Not true real-time collaboration (but acceptable for MVP use case)

**Example Flow:**
```
User A opens block → Loads encrypted JSON from DB → Decrypts → Edits
User A saves → Encrypts → Zero syncs to server
User B opens same block (after A's save) → Sees A's changes
User B edits and saves → Overwrites with their version (last-write-wins)
```

**MVP Mitigation:**
- Show "Someone else is editing" indicator when Zero detects concurrent writes to same block
- Auto-refresh on conflict with toast notification: "This block was updated by [user], refreshing..."
- Optimistic locking via `version` column prevents silent overwrites

**Future Enhancement: Real-Time Collaboration (Post-MVP)**

For true Google Docs-style character-level collaboration, add Yjs as a separate system:

**Option: Add Yjs Later**
1. **Keep Zero for structure**: `knowledge_page` metadata, `page_link`, ordering
2. **Add Yjs for content**: Separate WebSocket using `y-websocket` for `encrypted_content` only
   - Yjs server (e.g., `y-websocket-server` or `liveblocks`) manages CRDT merging
   - Periodically snapshot Yjs state to PostgreSQL for persistence
   - Zero never touches Yjs-managed content

**Decision Point:**
- Implement Zero-only for MVP (estimated 80% value, 20% complexity)
- Evaluate adding Yjs after user feedback shows demand for simultaneous block editing

---

### 5.6 Zero Server Setup

<!-- MCP_DOC_REFERENCE
For Zero server implementation:
Tool: mcp__context7__get-library-docs
Library: @rocicorp/zero
Topic: "server setup postgres integration CVR push notifications"
Reason: Zero requires server-side configuration to sync with PostgreSQL
Context: Reference for server endpoint setup, Change Version Record (CVR) management, and push sync
Example call:
1. mcp__context7__resolve-library-id({ libraryName: "@rocicorp/zero" })
2. mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/rocicorp/zero", topic: "server configuration" })
-->

**Required Server Components:**

1. **Zero Server Endpoint** (`apps/server/src/routes/zero-sync.ts`)
   - Handles client sync requests (POST `/api/zero/sync`)
   - Manages Change Version Records (CVR) — tracks last-synced state per client
   - Authenticates requests using better-auth session tokens

2. **PostgreSQL Integration**
   - Zero requires `_zero_metadata` table for CVR storage
   - Run migration to add Zero tracking columns to synced tables:
     ```sql
     ALTER TABLE knowledge_page ADD COLUMN _zero_version BIGINT DEFAULT 0;
     ALTER TABLE knowledge_block ADD COLUMN _zero_version BIGINT DEFAULT 0;
     ALTER TABLE page_link ADD COLUMN _zero_version BIGINT DEFAULT 0;
     ALTER TABLE knowledge_space ADD COLUMN _zero_version BIGINT DEFAULT 0;
     ```

3. **WebSocket Connection**
   - Zero clients open WebSocket to `/api/zero/ws` for push notifications
   - Server broadcasts change events when PostgreSQL updates occur
   - Use PostgreSQL `LISTEN/NOTIFY` to trigger push:
     ```typescript
     // apps/server/src/services/zero/push-notifier.ts
     import { Effect } from "effect";
     import { SqlClient } from "@effect/sql";

     export const notifyZeroClients = (table: string, recordId: string) =>
       Effect.gen(function* () {
         const sql = yield* SqlClient.SqlClient;
         yield* sql.onConnectionAcquire((conn) =>
           conn.executeUnprepared(`NOTIFY zero_changes, '${table}:${recordId}'`)
         );
       });
     ```

4. **Zero Schema Configuration**
   - Define client-side schema that mirrors PostgreSQL tables:
     ```typescript
     // apps/web/src/lib/zero/schema.ts
     import { createSchema } from "@rocicorp/zero";

     export const zeroSchema = createSchema({
       knowledgePage: {
         tableName: "knowledge_page",
         columns: {
           id: "string",
           orgId: "string",
           spaceId: "string",
           title: "string",
           slug: "string",
           // ... other columns
         },
         primaryKey: "id",
       },
       knowledgeBlock: {
         tableName: "knowledge_block",
         columns: {
           id: "string",
           pageId: "string",
           type: "string",
           order: "string", // Fractional indexing
           encryptedContent: "string",
           // ... other columns
         },
         primaryKey: "id",
       },
       // ... other tables
     });
     ```

**Implementation Priority:**
- **Phase 1 (MVP)**: Basic sync endpoint + CVR management
- **Phase 2**: WebSocket push notifications (graceful degradation: polling fallback)
- **Phase 3**: Optimistic conflict resolution with client-side rollback

**Security Considerations:**
- Filter synced data by `orgId` in WHERE clauses (row-level security)
- Validate session tokens on every sync request
- Rate-limit sync endpoint (max 10 requests/second per client)

---

## 6. Encryption & Security

> **Implementation Constraints Reference:** This section implements Implementation Constraints (3) Client-side encryption only and (5) Organization-level master keys.

### 6.1 Default-Encrypted Model

**What is Encrypted:**
- ✅ Block content (`knowledge_block.encrypted_content`)
- ✅ Optional: Page titles (if space is marked `is_encrypted=true` and user opts in)

**What Remains Plaintext:**
- ❌ Page titles (by default, for search/tree rendering)
- ❌ Slugs, timestamps, user IDs (required for access control)
- ❌ Link relationships (`page_link` source/target IDs for graph view)

**Encryption Algorithm:**
- AES-256-GCM (authenticated encryption)
- Implemented via Web Crypto API (`crypto.subtle.encrypt`)

**Encrypted Payload Format:**
```typescript
// value-objects/EncryptedPayload.ts
export interface EncryptedPayload {
  readonly iv: string;           // Base64-encoded initialization vector (96 bits)
  readonly ciphertext: string;   // Base64-encoded encrypted data
  readonly authTag: string;      // Base64-encoded GCM authentication tag (128 bits)
  readonly algorithm: "AES-GCM"; // Version string for future algorithm changes
}
```

---

### 6.2 Key Management Strategy

**Organization-Level Keys:**
```
organizationId → masterKey (stored in IAM's encrypted key vault)
                     ↓ (HKDF key derivation)
                 spaceKey (derived from masterKey + spaceId)
                     ↓ (used for all blocks in that space)
```

**Key Storage:**
- **Master Key**: Encrypted at rest in PostgreSQL (**PROPOSED** `iam.organization_encryption_key` table — not yet implemented, AES-256 with server-side KEK from environment)
- **Derived Keys**: Generated on-demand in browser, never sent to server
- **User Access**: Keys fetched via SDK contract on space load, cached in memory (not localStorage for security)

**Key Rotation:**
- Triggered by org admin
- Background job re-encrypts all blocks with new key
- Old key retained for 30 days (decrypt-only) to handle in-flight clients

**Trade-Offs:**
- ✅ Server cannot decrypt content (zero-knowledge if master key is user-derived)
- ✅ Key rotation is isolated per space
- ❌ No full-text search on encrypted content (requires client-side indexing or plaintext titles)
- ❌ Shared key per space means any member can decrypt all pages (no per-page keys for MVP)

**Alternative Considered: Per-Page Keys**
- ✅ Finer-grained access control
- ❌ Key distribution complexity (need to re-encrypt keys for each new team member)
- ❌ Graph view breaks (can't traverse links without decrypting all pages)
- **Decision**: Use space-level keys for MVP, add per-page keys in v2 if needed

---

### 6.3 Client-Side Encryption Flow

<!-- MCP_DOC_REFERENCE
For Web Crypto API encryption implementation:
Tool: WebFetch (MDN docs) or WebSearch
Query: "Web Crypto API AES-GCM encrypt decrypt subtle crypto"
Reason: All client-side encryption uses Web Crypto API for AES-256-GCM encryption
Context: Reference for crypto.subtle.encrypt(), crypto.subtle.decrypt(), generateKey(), and key derivation
Example search: WebSearch with query "MDN Web Crypto API AES-GCM encryption examples"
Alternative: Direct fetch from developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto
-->

**On Write:**

*Illustrative encryption implementation; adapt to actual Web Crypto API patterns and error handling.*

```typescript
// packages/documents-infra/src/services/EncryptionService.ts
const encryptBlock = (plaintext: string, spaceKey: CryptoKey): Effect.Effect<EncryptedPayload, EncryptionError> =>
  Effect.gen(function* () {
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit nonce
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    const ciphertext = yield* Effect.tryPromise({
      try: () => crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        spaceKey,
        data
      ),
      catch: (e) => new EncryptionError({ cause: e }),
    });

    return {
      iv: btoa(String.fromCharCode(...iv)),
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
      authTag: "", // Included in GCM ciphertext
      algorithm: "AES-GCM",
    };
  });
```

**On Read:**
```typescript
import * as Str from "effect/String";
const decryptBlock = (payload: EncryptedPayload, spaceKey: CryptoKey): Effect.Effect<string, DecryptionError> =>
  Effect.gen(function* () {
    const iv = Uint8Array.from(atob(payload.iv), (c) => Str.charCodeAt(0)(c));
    const ciphertext = Uint8Array.from(atob(payload.ciphertext), (c) => Str.charCodeAt(0)(c));

    const plaintext = yield* Effect.tryPromise({
      try: () => crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        spaceKey,
        ciphertext
      ),
      catch: (e) => new DecryptionError({ cause: e, message: "Invalid key or corrupted data" }),
    });

    const decoder = new TextDecoder();
    return decoder.decode(plaintext);
  });
```

---

### 6.4 Search Trade-Off

**Problem:**
- Encrypted content cannot be full-text searched on server
- Client-side search requires decrypting all blocks (slow for large spaces)

**Solutions:**
1. **Plaintext Titles + Encrypted Bodies** (MVP approach)
   - Search by title (fast, server-side PostgreSQL FTS)
   - Show page titles in results, decrypt content only when opened

2. **Client-Side Indexing** (future enhancement)
   - Use `lunr.js` or similar to build search index in IndexedDB
   - Decrypt blocks incrementally, index in background worker
   - Trade-off: Slow initial indexing, works offline

3. **Homomorphic Encryption / Searchable Encryption** (research territory)
   - Not practical for MVP

**Chosen Strategy:**
- MVP: Plaintext titles, encrypted blocks
- Post-MVP: Add client-side indexing with Web Workers

---

## 7. Authentication & Access Control

> **Implementation Constraints Reference:** This section implements Implementation Constraint (9) Effect-first architecture (policies as Effects).

### 7.1 IAM Integration

**Dependencies:**
- `@beep/iam-sdk` for authentication contracts
- `better-auth` session management (already integrated)
- `@beep/shared-domain` for User/Organization/Team entities

**Authorization Model:**
```
Organization (tenant boundary)
  └─ KnowledgeSpace (can restrict to team)
      └─ KnowledgePage
          └─ KnowledgeBlock
```

**Permissions Hierarchy:**
- **Organization Member**: Can view spaces where `defaultPermissions.canRead` includes "member"
- **Team Member**: Can view team-scoped spaces (`space.team_id = user.active_team_id`)
- **Space Owner**: Full control (edit, delete, manage permissions)
- **Page Creator**: Can edit own pages unless space is read-only

---

### 7.2 Access Control Enforcement

**At Query Level (Zero Filters):**
```typescript
// Zero client configuration
const zeroSchema = {
  knowledgePage: {
    tableName: "knowledge_page",
    columns: { /* ... */ },
    authFilter: (userId: string, orgId: string) => ({
      organization_id: orgId, // Tenant isolation
      deleted_at: null,       // Hide soft-deleted
    }),
  },
};
```

**At Application Level (Effect Policies):**

These policies are shown as plain Effect-returning functions. If the real codebase already has a Policy helper or abstraction, this example is intended to align with it conceptually, but does not define a new shared abstraction.

```typescript
// packages/documents-domain/src/entities/KnowledgePage/KnowledgePage.policy.ts
import { Effect } from "effect";

export const canEditPage = (user: User, page: KnowledgePage) =>
  Effect.gen(function* () {
    // Owner can always edit
    if (page.createdBy === user.id) return true;

    // Check space permissions
    const space = yield* getSpaceById(page.spaceId);
    if (space.ownerId === user.id) return true;

    // Check team membership
    if (space.teamId) {
      const isMember = yield* isTeamMember(user.id, space.teamId);
      if (!isMember) return false;
    }

    // Check default permissions
    return space.defaultPermissions.canWrite.includes("member");
  });
```

**At SDK Level (Contracts Enforce Policies):**
```typescript
// packages/documents-sdk/src/contracts/page.contracts.ts
export const deletePage = Contract.make({
  payload: S.Struct({ pageId: KnowledgePageId }),
  success: S.Void,
  failure: S.Union(UnauthorizedError, PageNotFoundError),
});

// Implementation in infra layer checks canEditPage policy
```

---

### 7.3 Row-Level Security (Future Enhancement)

**Not in MVP:**
- PostgreSQL RLS policies for defense-in-depth
- Reason: Zero's auth filters + application policies provide sufficient protection
- Alternative: Add RLS in production hardening phase

**Example RLS Policy (if implemented):**
```sql
CREATE POLICY knowledge_page_select_policy ON knowledge_page
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM member WHERE user_id = current_setting('app.user_id')::text
    )
  );
```

---

## 8. Frontend Architecture & Components

### 8.1 Next.js App Structure

```
apps/web/src/app/knowledge/
├── layout.tsx                      # Shared layout (sidebar + header)
├── page.tsx                        # Space dashboard (list all pages)
├── [spaceId]/
│   ├── page.tsx                   # Space detail (page tree)
│   ├── [pageId]/
│   │   ├── page.tsx               # Page viewer/editor
│   │   └── graph/
│   │       └── page.tsx           # Graph view for this page
│   └── settings/
│       └── page.tsx               # Space settings (permissions, encryption)
└── new/
    └── page.tsx                   # Create new space
```

---

### 8.2 UI Component Slices

**From `packages/documents-ui/src/components/`:**

#### Editor (BlockNote Integration)

*Example implementation sketch; adapt to actual project imports and helpers.*

```tsx
// Editor/BlockNoteEditor.tsx
import { BlockNoteView } from "@blocknote/react";
import { useBlockNote } from "@blocknote/core";
import * as A from "effect/Array";
export const KnowledgePageEditor = ({ pageId }: { readonly pageId: KnowledgePageId.Type }) => {
  const blocks = useBlocks(pageId); // Fetches from Zero
  const encryptionService = useEncryptionService();

  const editor = useBlockNote({
    initialContent: A.map(blocks, decryptBlock),
    onUpdate: async ({ editor }) => {
      // Serialize editor content to JSON
      const contentJson = JSON.stringify(editor.document);
      const encrypted = await encryptionService.encrypt(contentJson);

      // Optimistic update via Zero
      zero.mutate.knowledgeBlock.upsert({
        pageId,
        encryptedContent: encrypted.ciphertext,
        contentHash: await computeSHA256(contentJson),
      });
    },
  });

  return <BlockNoteView editor={editor} theme="light" />;
};
```

**Key Libraries:**
- `@blocknote/react` (editor UI)
- `@blocknote/core` (editor logic and block types)
- `fractional-indexing` (conflict-free block ordering)

---

#### PageTree (Hierarchical Navigation)

<!-- MCP_DOC_REFERENCE
For MUI TreeView component:
Tool: mcp__context7__get-library-docs
Library: @mui/x-tree-view
Topic: "TreeView RichTreeView SimpleTreeView items onNodeSelect drag and drop"
Reason: MUI TreeView provides hierarchical navigation for nested knowledge pages
Context: Reference for TreeView configuration, node selection, drag-and-drop reordering, and expansion state
Example call:
1. mcp__context7__resolve-library-id({ libraryName: "@mui/x-tree-view" })
2. mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/mui/mui-x", topic: "tree view" })
-->

```tsx
// PageTree/PageTreeView.tsx
import { TreeView } from "@mui/x-tree-view";
import { usePages } from "@beep/documents-sdk";
import { useRouter } from "next/navigation";
export const PageTreeView = ({ spaceId }: { readonly spaceId: KnowledgeSpaceId.Type }) => {
  const pages = usePages(spaceId); // Zero query (reactive)
  const router = useRouter();
  const tree = useMemo(() => buildTree(pages), [pages]);

  return (
    <TreeView
      defaultExpandedNodes={[tree.root.id]}
      items={tree.nodes}
      onNodeSelect={(nodeId) => router.push(`/knowledge/${spaceId}/${nodeId}`)}
    />
  );
};
```

**Features:**
- Drag-and-drop reordering (updates `order` field)
- Nested pages (up to 5 levels deep, enforced in domain layer)
- Real-time updates (new pages appear instantly via Zero sync)

---

#### GraphView (Link Visualization)

<!-- MCP_DOC_REFERENCE
For react-force-graph visualization:
Tool: mcp__context7__get-library-docs
Library: react-force-graph
Topic: "ForceGraph2D ForceGraph3D graphData nodeLabel linkDirectionalArrow onNodeClick"
Reason: react-force-graph provides WebGL-based graph visualization for knowledge page relationships
Context: Reference for force-directed graph configuration, node/link styling, interaction handlers, and performance optimization
Example call:
1. mcp__context7__resolve-library-id({ libraryName: "react-force-graph" })
2. mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/vasturiano/react-force-graph", topic: "API reference" })
-->

```tsx
// GraphView/GraphView.tsx
import { ForceGraph2D } from "react-force-graph";
import { useGraphData } from "@beep/documents-sdk";
import { useRouter } from "next/navigation";
export const GraphView = ({ spaceId }: { readonly spaceId: KnowledgeSpaceId.Type }) => {
  const { nodes, links } = useGraphData(spaceId); // Queries page_link table
  const router = useRouter();
  return (
    <ForceGraph2D
      graphData={{ nodes, links }}
      nodeLabel="title"
      nodeAutoColorBy="id"
      linkDirectionalArrowLength={3.5}
      linkDirectionalArrowRelPos={1}
      onNodeClick={(node) => router.push(`/knowledge/${spaceId}/${node.id}`)}
    />
  );
};
```

**Graph Data Format:**
```typescript
{
  nodes: [
    { id: "page_abc", title: "Getting Started", color: "#3b82f6" },
    { id: "page_def", title: "Architecture", color: "#8b5cf6" }
  ],
  links: [
    { source: "page_abc", target: "page_def", weight: 3 }
  ]
}
```

**Library:**
- `react-force-graph` (WebGL-based 2D/3D graphs)
- Alternative: `vis-network` (canvas-based, better for large graphs)

---

### 8.3 State Management

**Approach: @effect-atom/atom-react**

```typescript
// packages/documents-ui/src/state/editorAtom.ts
import { Atom } from "@effect-atom/atom-react";

export const activePageIdAtom = Atom.make<KnowledgePageId.Type | null>(null);
export const editorModeAtom = Atom.make<"view" | "edit">("view");
export const selectedBlocksAtom = Atom.make<Set<KnowledgeBlockId.Type>>(new Set());

// Usage in component
const [activePageId, setActivePageId] = useAtom(activePageIdAtom);
```

**Why Effect Atoms:**
- Integrates with Effect runtime (can derive atoms from Effect computations)
- Simpler than Zustand/Jotai for Effect-first codebases
- Plays well with Zero's reactive queries

---

### 8.4 Zero Client Setup

*Illustrative Zero client configuration; adapt to actual project setup and session management.*

```tsx
// apps/web/src/lib/zero.ts
import { ZeroProvider } from "@rocicorp/zero/react";
import { DocumentsDbSchema } from "@beep/documents-tables/schema";

export const ZeroWrapper = ({ children }: { readonly children: React.ReactNode }) => {
  const session = useSession(); // From IAM

  const zero = useMemo(() => createZero({
    server: process.env.NEXT_PUBLIC_ZERO_SERVER_URL,
    userID: session.user.id,
    auth: session.token,
    schema: {
      knowledge_page: DocumentsDbSchema.knowledgePage,
      knowledge_block: DocumentsDbSchema.knowledgeBlock,
      page_link: DocumentsDbSchema.pageLink,
    },
  }), [session]);

  return <ZeroProvider zero={zero}>{children}</ZeroProvider>;
};
```

---

### 8.5 SDK Contracts Reference

This section provides a comprehensive list of all SDK contracts with their full signatures. All contracts are implemented using the `@beep/contract` system for type-safe, Effect-based API calls.

#### Space Contracts

**Location:** `packages/documents/sdk/src/contracts/space.contracts.ts`

```typescript
import * as S from "effect/Schema";
import { Contract } from "@beep/contract";
import { KnowledgeSpace } from "@beep/documents-domain/entities";
import { KnowledgeSpaceId } from "@beep/shared-domain/entity-ids/documents";
import {SharedEntityIds} from "@beep/shared-domain/entity-ids";
import {
  SpaceNotFoundError,
  SpaceAlreadyExistsError,
  UnauthorizedError,
  ValidationError
} from "@beep/documents-domain/errors";

// Create new knowledge space
export const createSpace = Contract.make({
  payload: S.Struct({
    organizationId: SharedEntityIds.OrganizationId,
    teamId: S.optional(SharedEntityIds.TeamId),
    name: S.String.pipe(S.maxLength(255)),
    slug: S.String.pipe(S.maxLength(255)),
    description: S.optional(S.String),
    isEncrypted: S.Boolean,
    defaultPermissions: S.Struct({
      canRead: S.Array(S.String),
      canWrite: S.Array(S.String),
    }),
  }),
  success: S.Struct({
    space: KnowledgeSpace.Model.select,
  }),
  failure: S.Union(
    ValidationError,
    UnauthorizedError,
    SpaceAlreadyExistsError,
  ),
});

// Update space metadata
export const updateSpace = Contract.make({
  payload: S.Struct({
    spaceId: KnowledgeSpaceId,
    name: S.optional(S.String.pipe(S.maxLength(255))),
    description: S.optional(S.String),
    defaultPermissions: S.optional(S.Struct({
      canRead: S.Array(S.String),
      canWrite: S.Array(S.String),
    })),
  }),
  success: S.Struct({
    space: KnowledgeSpace.Model.select,
  }),
  failure: S.Union(
    SpaceNotFoundError,
    UnauthorizedError,
    ValidationError,
  ),
});

// Soft delete space
export const deleteSpace = Contract.make({
  payload: S.Struct({
    spaceId: KnowledgeSpaceId,
  }),
  success: S.Void,
  failure: S.Union(
    SpaceNotFoundError,
    UnauthorizedError,
  ),
});

// Retrieve space by ID
export const getSpace = Contract.make({
  payload: S.Struct({
    spaceId: KnowledgeSpaceId,
  }),
  success: S.Struct({
    space: KnowledgeSpace.Model.select,
  }),
  failure: S.Union(
    SpaceNotFoundError,
    UnauthorizedError,
  ),
});

// List all spaces for organization
export const listSpaces = Contract.make({
  payload: S.Struct({
    organizationId: SharedEntityIds.OrganizationId,
    teamId: S.optional(SharedEntityIds.TeamId),
  }),
  success: S.Struct({
    spaces: S.Array(KnowledgeSpace.Model.select),
  }),
  failure: S.Union(
    UnauthorizedError,
  ),
});
```

---

#### Page Contracts

**Location:** `packages/documents/sdk/src/contracts/page.contracts.ts`

```typescript
import * as S from "effect/Schema";
import { Contract } from "@beep/contract";
import { KnowledgePage } from "@beep/documents-domain/entities";
import { KnowledgePageId, KnowledgeSpaceId } from "@beep/shared-domain/entity-ids/documents";
import {
  PageNotFoundError,
  PageTitleTooLongError,
  UnauthorizedError,
  ValidationError
} from "@beep/documents-domain/errors";

// Create new page in space
export const createPage = Contract.make({
  payload: S.Struct({
    spaceId: KnowledgeSpaceId,
    parentPageId: S.optional(KnowledgePageId),
    title: S.String.pipe(S.maxLength(500)),
    slug: S.String,
    status: KnowledgePage.PageStatus,
  }),
  success: S.Struct({
    page: KnowledgePage.Model.select,
  }),
  failure: S.Union(
    ValidationError,
    UnauthorizedError,
    PageNotFoundError, // If parent page not found
  ),
});

// Update page title
export const updatePageTitle = Contract.make({
  payload: S.Struct({
    pageId: KnowledgePageId,
    title: S.String.pipe(S.maxLength(500)),
  }),
  success: S.Struct({
    page: KnowledgePage.Model.select,
  }),
  failure: S.Union(
    PageNotFoundError,
    PageTitleTooLongError,
    UnauthorizedError,
  ),
});

// Update page content (blocks)
export const updatePageContent = Contract.make({
  payload: S.Struct({
    pageId: KnowledgePageId,
    blocks: S.Array(S.Struct({
      blockId: S.optional(KnowledgeBlockId),
      type: KnowledgePage.BlockType,
      content: S.String, // BlockNote JSON
      order: S.String, // Fractional indexing
    })),
  }),
  success: S.Struct({
    page: KnowledgePage.Model.select,
  }),
  failure: S.Union(
    PageNotFoundError,
    UnauthorizedError,
    ValidationError,
  ),
});

// Soft delete page
export const deletePage = Contract.make({
  payload: S.Struct({
    pageId: KnowledgePageId,
  }),
  success: S.Void,
  failure: S.Union(
    PageNotFoundError,
    UnauthorizedError,
  ),
});

// Move page to different parent
export const movePage = Contract.make({
  payload: S.Struct({
    pageId: KnowledgePageId,
    newParentPageId: S.optional(KnowledgePageId), // null = move to root
    newOrder: S.Int,
  }),
  success: S.Struct({
    page: KnowledgePage.Model.select,
  }),
  failure: S.Union(
    PageNotFoundError,
    UnauthorizedError,
    ValidationError, // Circular reference check
  ),
});

// Retrieve page with blocks
export const getPage = Contract.make({
  payload: S.Struct({
    pageId: KnowledgePageId,
  }),
  success: S.Struct({
    page: KnowledgePage.Model.select,
    blocks: S.Array(KnowledgeBlock.Model.select),
  }),
  failure: S.Union(
    PageNotFoundError,
    UnauthorizedError,
  ),
});

// List pages in space
export const listPages = Contract.make({
  payload: S.Struct({
    spaceId: KnowledgeSpaceId,
    parentPageId: S.optional(KnowledgePageId), // Filter by parent
    status: S.optional(PageStatus), // Filter by status
  }),
  success: S.Struct({
    pages: S.Array(KnowledgePage.Model.select),
  }),
  failure: S.Union(
    UnauthorizedError,
  ),
});
```

---

#### Graph Contracts

**Location:** `packages/documents/sdk/src/contracts/graph.contracts.ts`

```typescript
import * as S from "effect/Schema";
import { Contract } from "@beep/contract";
import { KnowledgeSpaceId, KnowledgePageId } from "@beep/shared-domain/entity-ids/documents";
import { UnauthorizedError } from "@beep/documents-domain/errors";

// Retrieve graph nodes and edges for space
export const getGraphData = Contract.make({
  payload: S.Struct({
    spaceId: KnowledgeSpaceId,
  }),
  success: S.Struct({
    nodes: S.Array(S.Struct({
      id: KnowledgePageId,
      title: S.String,
      color: S.optional(S.String),
    })),
    links: S.Array(S.Struct({
      source: KnowledgePageId,
      target: KnowledgePageId,
      weight: S.Int, // Number of links between pages
    })),
  }),
  failure: S.Union(
    UnauthorizedError,
  ),
});

// Get pages linking to a specific page (backlinks)
export const getBacklinks = Contract.make({
  payload: S.Struct({
    pageId: KnowledgePageId,
  }),
  success: S.Struct({
    backlinks: S.Array(S.Struct({
      sourcePageId: KnowledgePageId,
      sourcePageTitle: S.String,
      linkType: KnowledgePage.LinkType,
      contextSnippet: S.optional(S.String),
    })),
  }),
  failure: S.Union(
    UnauthorizedError,
  ),
});
```

---

#### Contract Usage Pattern

**Frontend Usage Example:**

```tsx
// apps/web/src/app/knowledge/[spaceId]/page.tsx
import { createPage, listPages } from "@beep/documents-sdk/contracts/page.contracts";
import { useContract } from "@beep/runtime-client"; // Effect-based contract runner

export default function SpacePage({ params }: { readonly params: { readonly spaceId: KnowledgeSpaceId.Type } }) {
  const createPageMutation = useContract(createPage);
  const { data: pages, isLoading } = useContractQuery(listPages, {
    spaceId: params.spaceId,
  });

  const handleCreatePage = async () => {
    const result = await createPageMutation.run({
      spaceId: params.spaceId,
      title: "New Page",
      slug: "new-page",
      status: "draft",
    });

    if (result._tag === "Success") {
      toast.success("Page created!");
      router.push(`/knowledge/${params.spaceId}/${result.value.page.id}`);
    } else {
      toast.error(result.error.message);
    }
  };

  return (
    <div>
      <button onClick={handleCreatePage}>Create Page</button>
      {isLoading ? <Spinner /> : <PageList pages={pages.pages} />}
    </div>
  );
}
```

**Contract Implementation Pattern (Infra Layer):**

```typescript
// packages/documents-infra/src/contracts/page.contracts.impl.ts
import { Effect, Layer } from "effect";
import * as PageContracts from "@beep/documents-sdk/contracts/page.contracts";
import { KnowledgePageRepository } from "../repositories/KnowledgePageRepository";
import { canEditPage } from "@beep/documents-domain/entities/KnowledgePage/policies";

export const createPageImpl = PageContracts.createPage.implement((payload) =>
  Effect.gen(function* () {
    const repo = yield* KnowledgePageRepository;
    const currentUser = yield* getCurrentUser();

    // Validate permissions
    yield* Effect.if(canEditPage(currentUser, payload.spaceId), {
      onTrue: () => Effect.void,
      onFalse: () => Effect.fail(new UnauthorizedError()),
    });

    // Create page
    const page = yield* repo.create({
      spaceId: payload.spaceId,
      parentPageId: payload.parentPageId,
      title: payload.title,
      slug: payload.slug,
      status: payload.status,
      createdBy: currentUser.id,
    });

    return { page };
  })
);

export const PageContractsLayer = Layer.merge(
  createPageImpl.toLayer(),
  updatePageTitleImpl.toLayer(),
  deletePageImpl.toLayer(),
  // ... other implementations
);
```

---

## Infrastructure Layer

This section documents the infrastructure layer implementation, focusing on the repository pattern and data access strategies.

### Repositories

The documents slice uses **Effect-based repositories** built on `@effect/sql` for all database operations. Repositories encapsulate data access logic, provide type-safe query interfaces, and integrate seamlessly with Effect's dependency injection system.

<!-- MCP_DOC_REFERENCE
When implementing repositories, reference Effect SQL documentation:
Tool: mcp__context7__get-library-docs
Query: "@effect/sql repository pattern Model Class"
Reason: Repositories use @effect/sql/Model for type-safe database operations with Effect
-->

#### Repository Pattern Overview

**Key Characteristics:**
- All operations return `Effect<Success, Error, Dependencies>`
- Use `@effect/sql/Model` for database integration
- Leverage `SqlClient` for raw SQL when needed
- Implement domain-specific query methods beyond basic CRUD
- Support transactions via Effect's built-in resource management
- Integrate with DocumentsDb (slice-scoped Drizzle client)

**Standard Structure:**
```typescript
import { Repo } from "@beep/core-db/Repo";
import { Entities } from "@beep/documents-domain";
import { dependencies } from "@beep/documents-infra/adapters/repos/_common";
import { DocumentsDb } from "@beep/documents-infra/db";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

export class KnowledgeBlockRepo extends Effect.Service<KnowledgeBlockRepo>()(
  "@beep/documents-infra/adapters/repos/KnowledgeBlockRepo",
  {
    dependencies,
    accessors: true,
    effect: Repo.make(
      DocumentsEntityIds.KnowledgeBlockId,
      Entities.KnowledgeBlock.Model,
      Effect.gen(function* () {
        const {
          makeQuery, // drizzle effect query builder 
          db, // `@effect/sql-drizzle` client
          execute, // drizzle effect wrapper,
          transaction, // effect drizzle transaction wrapper,
          drizzle, // raw drizzle client no effect wrapper,
        } = yield* DocumentsDb.DocumentsDb;
        

        return {};
      })
    ),
  }
) {}

```

#### Repository Structure by Entity

**KnowledgeSpaceRepository**
- **Package:** `@beep/documents-infra`
- **File:** `packages/documents/infra/src/repositories/KnowledgeSpaceRepository.ts`
- **Operations:**
  - `create(data)` - Create new knowledge space
  - `findById(id)` - Retrieve space by ID
  - `findBySlug(organizationId, slug)` - Find space by organization and slug
  - `listByOrganization(organizationId)` - List all spaces for organization
  - `listByTeam(teamId)` - List spaces accessible to team
  - `update(id, data)` - Update space metadata
  - `updatePermissions(id, permissions)` - Update access permissions
  - `delete(id)` - Soft-delete space
  - `permanentDelete(id)` - Hard-delete space and all contents

**KnowledgePageRepository**
- **Package:** `@beep/documents-infra`
- **File:** `packages/documents/infra/src/repositories/KnowledgePageRepository.ts`
- **Operations:**
  - Basic CRUD: `create`, `findById`, `update`, `delete`
  - Tree operations: `listBySpace`, `listChildren`, `getAncestors`, `movePage`
  - Query operations: `findBySlug`, `search`, `getRecentlyModified`
  - Metadata operations: `updateTitle`, `updateStatus`, `updateColor`

**KnowledgeBlockRepository**
- **Package:** `@beep/documents-infra`
- **File:** `packages/documents/infra/src/repositories/KnowledgeBlockRepository.ts`
- **Operations:**
  - Basic CRUD: `create`, `findById`, `update`, `delete`
  - Ordering operations: `listByPage`, `reorder`, `moveBlock`
  - Batch operations: `bulkCreate`, `bulkUpdate`, `bulkDelete`
  - Sync operations: `syncFromZero`, `getBlocksSince`

**PageLinkRepository**
- **Package:** `@beep/documents-infra`
- **File:** `packages/documents/infra/src/repositories/PageLinkRepository.ts`
- **Operations:**
  - Basic CRUD: `create`, `findById`, `delete`
  - Graph queries: `findLinksBetween`, `getOutgoingLinks`, `getIncomingLinks`
  - Backlink operations: `getBacklinks`, `getBacklinksWithContext`
  - Link management: `updateLinkType`, `bulkCreateLinks`

**GraphRepository**
- **Package:** `@beep/documents-infra`
- **File:** `packages/documents/infra/src/repositories/GraphRepository.ts`
- **Operations:**
  - Graph queries: `getSpaceGraph`, `getPageNeighborhood`, `getShortestPath`
  - Analysis operations: `getOrphanedPages`, `getMostLinkedPages`, `getPageDepth`
  - Traversal operations: `breadthFirstSearch`, `depthFirstSearch`

---

#### Example: KnowledgePageRepository Implementation

**Location:** `packages/documents/infra/src/repositories/KnowledgePageRepository.ts`

*Illustrative repository implementation; align with existing repo patterns and actual project imports.*

```typescript
import {Repo} from "@beep/core-db/Repo";
import {Entities} from "@beep/documents-domain";
import {
  KnowledgePageCircularReferenceError,
  KnowledgePageNotFoundError,
  KnowledgePageSlugConflictError
} from "@beep/documents-domain/entities/KnowledgePage/KnowledgePage.errors.ts";
import {dependencies} from "@beep/documents-infra/adapters/repos/_common";
import {DocumentsDb} from "@beep/documents-infra/db";
import {DocumentsDbSchema} from "@beep/documents-tables";
import {DocumentsEntityIds} from "@beep/shared-domain";
import * as SqlClient from "@effect/sql/SqlClient";
import type * as SqlError from "@effect/sql/SqlError";
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as d from "drizzle-orm";
import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
import type * as Cause from "effect/Cause";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import type * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

type DeleteError = Cause.NoSuchElementException | ParseResult.ParseError | SqlError.SqlError;

const matchDeleteError = (args: {
  readonly id: DocumentsEntityIds.KnowledgePageId.Type,
}) => Match.type<DeleteError>().pipe(
  Match.tagsExhaustive({
    NoSuchElementException: () => new KnowledgePageNotFoundError({id: args.id}),
    ParseError: Effect.die,
    SqlError: Effect.die,
  })
);

export class KnowledgePageRepo extends Effect.Service<KnowledgePageRepo>()(
  "@beep/documents-infra/adapters/repos/KnowledgePageRepo",
  {
    dependencies,
    accessors: true,
    effect: Effect.gen(function* () {
      const now = F.pipe(
        F.pipe(DateTime.now, Effect.map(DateTime.toDateUtc)),
        F.constant
      );
      const bindDeletedAt = Effect.bind("deletedAt", now);
      const sql = yield* SqlClient.SqlClient;
      const {makeQuery} = yield* DocumentsDb.DocumentsDb;
      const baseRepo = yield* Repo.make(
        DocumentsEntityIds.KnowledgePageId,
        Entities.KnowledgePage.Model,
        Effect.succeed({})
      );
      const findBySlug = makeQuery((execute, params: {
        readonly slug: string
      }) => execute((client) => client.query.knowledgePage.findFirst({
        where: (table, {eq}) => eq(table.slug, params.slug)
      })).pipe(
        Effect.flatMap(S.decodeUnknown(Entities.KnowledgePage.Model))
      ));

      const listBySpace = makeQuery((execute, params: {
        readonly spaceId: DocumentsEntityIds.KnowledgeSpaceId.Type
      }) => execute((client) => client.query.knowledgePage.findMany({
        where: (table, {eq}) => eq(table.spaceId, params.spaceId)
      })).pipe(
        Effect.flatMap(S.decodeUnknown(S.Array(Entities.KnowledgePage.Model)))
      ));

      const listChildren = makeQuery((execute, params: {
        readonly parentPageId: DocumentsEntityIds.KnowledgePageId.Type
      }) => execute((client) => client.query.knowledgePage.findMany({
        where: (table, {eq}) => eq(table.parentPageId, params.parentPageId)
      })).pipe(
        Effect.flatMap(S.decodeUnknown(S.Array(Entities.KnowledgePage.Model)))
      ));


      const CheckCircularReferenceRequest = S.Struct({
        pageId: DocumentsEntityIds.KnowledgePageId,
        newParentId: DocumentsEntityIds.KnowledgePageId,
      });
      type CheckCircularReferenceRequest = typeof CheckCircularReferenceRequest.Type;
      const checkCircularReferenceSchema = SqlSchema.single({
        Request: CheckCircularReferenceRequest,
        Result: S.Array(S.Struct({
          id: DocumentsEntityIds.KnowledgePageId,
          parentPageId: DocumentsEntityIds.KnowledgePageId,
        })),
        execute: (request) => sql`
            WITH RECURSIVE ancestors AS (SELECT id, parent_page_id
                                         FROM knowledge_page
                                         WHERE ${DocumentsDbSchema.knowledgePage.id} = ${request.newParentId}
                                         UNION ALL
                                         SELECT p.id, p.parent_page_id
                                         FROM knowledge_page p
                                                  INNER JOIN ancestors a ON p.id = a.parent_page_id)
            SELECT id
            FROM ancestors
        `,
      });

      const checkCircularReference = F.flow(
        (request: CheckCircularReferenceRequest) => F.pipe(
          checkCircularReferenceSchema(request),
          Effect.map(A.some((ancestor) => ancestor.id === request.pageId)),
          Effect.map(Bool.match({
            onTrue: () => new KnowledgePageCircularReferenceError({
              pageId: request.pageId,
              newParentId: request.newParentId
            }),
            onFalse: () => Effect.void,
          }))
        ),
      );

      const movePage = makeQuery((execute, params: {
        readonly pageId: DocumentsEntityIds.KnowledgePageId.Type
        readonly newParentId: DocumentsEntityIds.KnowledgePageId.Type
      }) => Effect.gen(function* () {
        yield* checkCircularReference({
          pageId: params.pageId,
          newParentId: params.newParentId,
        });

        return yield* execute((client) => client.update(DocumentsDbSchema.knowledgePage).set(
          {
            parentPageId: params.newParentId,
          }
        ).where(
          d.eq(DocumentsDbSchema.knowledgePage.id, params.pageId)
        ));
      }));

      const checkSlugConflict = makeQuery((execute, params: {
        readonly spaceId: DocumentsEntityIds.KnowledgeSpaceId.Type,
        readonly slug: string,
        readonly excludeId?: DocumentsEntityIds.KnowledgePageId.Type
      }) => execute((client) => client.query.knowledgePage.findFirst({
        where: (_, {ne, eq, isNull, and}) => and(
          eq(DocumentsDbSchema.knowledgePage.slug, params.slug),
          isNull(DocumentsDbSchema.knowledgePage.deletedAt),
          ...(params.excludeId ? [ne(DocumentsDbSchema.knowledgePage.id, params.excludeId)] : [])
        )
      })).pipe(
        Effect.map(O.fromNullable),
        Effect.map(O.match({
          onNone: () => new KnowledgePageSlugConflictError({slug: params.slug}),
          onSome: Effect.succeed,
        })),
      ));

      const create = Effect.fn("KnowledgePageRepo.create")(function* (input: typeof Entities.KnowledgePage.Model.insert.Type) {
        yield* checkSlugConflict({
          spaceId: input.spaceId,
          slug: input.slug,
        });
        return yield* baseRepo.insert(input);
      });

      const update = Effect.fn("KnowledgePageRepo.update")(function* (input: typeof Entities.KnowledgePage.Model.update.Type) {
        if (input.slug) {
          yield* checkSlugConflict({
            spaceId: input.spaceId,
            slug: input.slug,
            excludeId: input.id,
          });
        }
        return yield* baseRepo.update(input);
      });

      const DeleteRequest = S.Struct({
        id: DocumentsEntityIds.KnowledgePageId,
      });

      const deleteSchema = SqlSchema.single({
        Request: DeleteRequest,
        Result: S.Void,
        execute: (request) => F.pipe(
          Effect.Do,
          bindDeletedAt,
          Effect.andThen(({deletedAt}) => sql`
              UPDATE ${sql(DocumentsEntityIds.KnowledgePageId.tableName)}
              SET deleted_at = ${deletedAt}
              WHERE id = ${request.id}
                AND deleted_at IS NULL
          `)
        )
      });

      const _delete = Effect.fn("KnowledgePageRepo.delete")(deleteSchema,
        (effect, args) => F.pipe(
          Effect.Do,
          Effect.bind("attributes", () => Effect.succeed({arguments: args})),
          Effect.map(({attributes}) =>
            effect.pipe(
            Effect.tap(Effect.annotateCurrentSpan(attributes)),
            Effect.annotateLogs(attributes),
            Effect.mapError(matchDeleteError(args))
          ))
        ),
      );

      return {
        ...baseRepo,
        delete: _delete,
        create,
        findBySlug,
        listBySpace,
        listChildren,
        movePage,
        update,
      };
    }),
  }
) {
}
```

**Key Implementation Details:**
- Uses `SqlClient.SqlClient` for type-safe SQL queries via tagged templates
- Returns `Effect` types for all operations (composable, testable, error-handling)
- Implements domain validations (slug conflicts, circular references)
- Uses `Option` for nullable fields and optional results
- Leverages Effect's `gen` for imperative-style effect composition
- Integrates with Effect Schema for row decoding
- Supports soft-delete pattern via `deleted_at` column
- Provides both simple CRUD and complex domain-specific operations

**Usage in Contract Implementations:**

```typescript
// packages/documents-infra/src/contracts/page.contracts.impl.ts
import { Effect } from "effect";
import * as PageContracts from "@beep/documents-sdk/contracts/page.contracts";
import { KnowledgePageRepository } from "../repositories/KnowledgePageRepository";

export const createPageImpl = PageContracts.createPage.implement((payload) =>
  Effect.gen(function* () {
    const repo = yield* KnowledgePageRepository;

    const page = yield* repo.create({
      spaceId: payload.spaceId,
      parentPageId: payload.parentPageId,
      title: payload.title,
      slug: payload.slug,
      status: payload.status,
      createdBy: payload.userId,
    });

    return { page };
  })
);
```

---

## 9. Graph View Design

### 9.1 Data Model

**Graph Nodes:** `KnowledgePage` entities
**Graph Edges:** `PageLink` entities

**Query for Graph Data:**
```typescript
// packages/documents-infra/src/repositories/GraphRepository.ts
export const getSpaceGraph = (spaceId: KnowledgeSpaceId.Type) =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const links = yield* sql<{ source: string; target: string; weight: number }>`
      SELECT
        pl.source_page_id as source,
        pl.target_page_id as target,
        COUNT(*) as weight
      FROM page_link pl
      JOIN knowledge_page p ON pl.source_page_id = p.id
      WHERE
        p.space_id = ${spaceId}
        AND p.deleted_at IS NULL
      GROUP BY pl.source_page_id, pl.target_page_id
    `;

    const pages = yield* sql<{ id: string; title: string }>`
      SELECT id, title
      FROM knowledge_page
      WHERE space_id = ${spaceId} AND deleted_at IS NULL
    `;

    return {
      nodes: pages.map(p => ({ id: p.id, title: p.title })),
      links: links.map(l => ({ source: l.source, target: l.target, weight: l.weight })),
    };
  });
```

---

### 9.2 Real-Time Updates

**Via Zero Sync:**
1. User creates link `[[Page B]]` in Page A → Inserts row in `page_link`
2. Zero pushes change to all connected clients
3. Graph component subscribes to `page_link` table → Re-renders graph

**React Hook:**

*Example hook implementation; adapt to actual Zero client API and project conventions.*

```typescript
export const useGraphData = (spaceId: KnowledgeSpaceId.Type) => {
  const zero = useZeroClient();

  // Subscribe to page_link changes
  const links = zero.query.pageLink
    .where("organizationId", "=", currentOrgId)
    .related("sourcePage", p => p.spaceId === spaceId)
    .all();

  const pages = zero.query.knowledgePage
    .where("spaceId", "=", spaceId)
    .all();

  return useMemo(() => ({
    nodes: A.map(pages, (p) => ({ id: p.id, title: p.title })),
    links: A.map(links, (l) => ({ source: l.sourcePageId, target: l.targetPageId })),
  }), [pages, links]);
};
```

---

### 9.3 Performance Considerations

**Challenge:** Large spaces (1000+ pages) slow down force-directed layout

**Solutions:**
1. **Virtualization**: Only render visible nodes (use `react-force-graph` culling)
2. **Clustering**: Group tightly-connected pages (e.g., all pages under a parent)
3. **Incremental Loading**: Load graph in chunks (fetch links for visible region only)

**MVP Scope:**
- Support up to 500 pages per space without optimization
- Add clustering in v2 if needed

---

## 10. Cross-Domain Integration

This section documents how the documents slice interacts with other slices in the beep-effect2 monorepo, including dependencies, integration points, and contract patterns.

### 10.1 IAM Integration

The documents slice has a **hard dependency** on the IAM slice for authentication, authorization, and organization/team management.

#### Dependencies

**Package Dependencies:**
- `@beep/iam-sdk` - Authentication contracts and session management
- `@beep/shared-domain` - User, Organization, Team entities and EntityIds
- `@beep/iam-tables` - References to `user`, `organization`, `team` tables for foreign keys

**Runtime Dependencies:**
- better-auth session management (via `@beep/iam-sdk`)
- Organization/team membership resolution
- User identity for audit fields (`created_by`, `updated_by`, `last_edited_by`)

#### Authentication Flow

**Session Validation:**

```typescript
// packages/documents-infra/src/services/AuthService.ts
import { Effect, Context } from "effect";
import { getSession } from "@beep/iam-sdk/contracts/auth.contracts";
import { UnauthorizedError } from "@beep/documents-domain/errors";

export class AuthService extends Context.Tag("AuthService")<
  AuthService,
  {
    readonly getCurrentUser: () => Effect.Effect<User, UnauthorizedError>;
    readonly requireSession: () => Effect.Effect<Session, UnauthorizedError>;
  }
>() {}

export const AuthServiceLive = Layer.effect(
  AuthService,
  Effect.gen(function* () {
    return AuthService.of({
      getCurrentUser: () =>
        Effect.gen(function* () {
          const session = yield* getSession.run({});

          if (session._tag === "Failure") {
            yield* Effect.fail(new UnauthorizedError({ message: "No active session" }));
          }

          return session.value.user;
        }),

      requireSession: () =>
        Effect.gen(function* () {
          const session = yield* getSession.run({});

          if (session._tag === "Failure") {
            yield* Effect.fail(new UnauthorizedError({ message: "Authentication required" }));
          }

          return session.value.session;
        }),
    });
  })
);
```

**Usage in Contracts:**

```typescript
// packages/documents-infra/src/contracts/space.contracts.impl.ts
import { Effect } from "effect";
import * as SpaceContracts from "@beep/documents-sdk/contracts/space.contracts";
import { AuthService } from "../services/AuthService";
import { KnowledgeSpaceRepository } from "../repositories/KnowledgeSpaceRepository";

export const createSpaceImpl = SpaceContracts.createSpace.implement((payload) =>
  Effect.gen(function* () {
    const auth = yield* AuthService;
    const repo = yield* KnowledgeSpaceRepository;

    // Authenticate user
    const currentUser = yield* auth.getCurrentUser();

    // Create space
    const space = yield* repo.create({
      organizationId: payload.organizationId,
      teamId: payload.teamId,
      ownerId: currentUser.id,
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      isEncrypted: payload.isEncrypted,
      defaultPermissions: payload.defaultPermissions,
      createdBy: currentUser.id,
    });

    return { space };
  })
);
```

#### Authorization Policies

**Organization & Team Membership Checks:**

```typescript
// packages/documents-domain/src/entities/KnowledgeSpace/policies.ts
import { Effect, pipe } from "effect";
import { User, Organization, Team } from "@beep/shared-domain/entities";
import { getOrganization, isTeamMember } from "@beep/iam-sdk/contracts/org.contracts";
import { KnowledgeSpace } from "./KnowledgeSpace.model";
import { UnauthorizedError } from "../../errors";

// Check if user can view space
export const canViewSpace = (user: User, space: KnowledgeSpace) =>
  Effect.gen(function* () {
    // Check organization membership
    const orgResult = yield* getOrganization.run({ organizationId: space.organizationId });

    if (orgResult._tag === "Failure") {
      return false;
    }

    const org = orgResult.value.organization;
    const isMember = org.memberIds.includes(user.id);

    if (!isMember) {
      return false;
    }

    // If space is team-restricted, check team membership
    if (space.teamId) {
      const teamMemberResult = yield* isTeamMember.run({
        userId: user.id,
        teamId: space.teamId,
      });

      if (teamMemberResult._tag === "Failure" || !teamMemberResult.value.isMember) {
        return false;
      }
    }

    // Check default permissions
    return space.defaultPermissions.canRead.includes("member");
  });

// Check if user can edit space
export const canEditSpace = (user: User, space: KnowledgeSpace) =>
  Effect.gen(function* () {
    // Owner can always edit
    if (space.ownerId === user.id) {
      return true;
    }

    // Check view permission first
    const canView = yield* canViewSpace(user, space);
    if (!canView) {
      return false;
    }

    // Check write permissions
    return space.defaultPermissions.canWrite.includes("member");
  });
```

**Usage in Contract Implementations:**

```typescript
// packages/documents-infra/src/contracts/page.contracts.impl.ts
import { canViewSpace, canEditSpace } from "@beep/documents-domain/entities/KnowledgeSpace/policies";

export const createPageImpl = PageContracts.createPage.implement((payload) =>
  Effect.gen(function* () {
    const auth = yield* AuthService;
    const spaceRepo = yield* KnowledgeSpaceRepository;
    const pageRepo = yield* KnowledgePageRepository;

    const currentUser = yield* auth.getCurrentUser();
    const space = yield* spaceRepo.findById(payload.spaceId);

    // Check edit permission
    const hasPermission = yield* canEditSpace(currentUser, space);
    if (!hasPermission) {
      yield* Effect.fail(new UnauthorizedError({ message: "Cannot create pages in this space" }));
    }

    const page = yield* pageRepo.create({
      spaceId: payload.spaceId,
      parentPageId: payload.parentPageId,
      title: payload.title,
      slug: payload.slug,
      status: payload.status,
      createdBy: currentUser.id,
    });

    return { page };
  })
);
```

#### Table-Level Foreign Keys

**Database References:**

```typescript
// packages/documents/tables/src/tables/knowledgeSpace.table.ts
import { user, team } from "@beep/iam-tables";

export const knowledgeSpace = OrgTable.make(KnowledgeSpaceId)({
  teamId: pg
    .text("team_id")
    .references(() => team.id, { onDelete: "cascade" })
    .$type<SharedEntityIds.TeamId.Type>(),
  ownerId: pg
    .text("owner_id")
    .notNull()
    .references(() => user.id)
    .$type<SharedEntityIds.UserId.Type>(),
  // ... other columns
});
```

**Cascade Behavior:**
- When an organization is deleted → All spaces in that org are soft-deleted (via `OrgTable` cascade)
- When a team is deleted → Team-scoped spaces cascade delete (via foreign key)
- When a user is deleted → Ownership is NOT cascaded (prevent data loss); instead, set `ownerId` to system admin or archive space

---

### 10.2 Files Integration (PROPOSED)

**Status:** Proposed for post-MVP implementation

The documents slice will integrate with the `@beep/documents-*` slice to support images, attachments, and file embeds within knowledge pages.

#### Proposed Architecture

**BlockNote Image Block:**

```typescript
// packages/documents-domain/src/entities/KnowledgeBlock/schemas/BlockType.ts
export const BlockType = StringLiteralKit(
    "paragraph",
    "heading",
    "code",
    "image",      // <-- References FileId from @beep/documents-domain
    "file_embed", // <-- Attachment downloads
    // ... other block types
).annotations({ identifier: "BlockType" });
```

**Image Block Content Structure:**

```typescript
// packages/documents-domain/src/value-objects/BlockContent.ts
import { FileId } from "@beep/shared-domain/entity-ids/files";

export const ImageBlockContent = S.Struct({
  fileId: FileId,          // Reference to uploaded file
  caption: S.optional(S.String),
  width: S.optional(S.Int),
  alignment: S.optional(S.Literal("left", "center", "right")),
});
```

#### Upload Flow

**Frontend Upload:**

```typescript
// apps/web/src/app/knowledge/[pageId]/components/ImageUpload.tsx
import { uploadFile } from "@beep/documents-sdk/contracts/file.contracts";
import { createBlock } from "@beep/documents-sdk/contracts/block.contracts";

const handleImageUpload = async (file: File) => {
  // 1. Upload file via Files slice
  const uploadResult = await uploadFile.run({
    file,
    organizationId: currentOrgId,
    uploadPath: `/knowledge/${spaceId}/${pageId}`,
  });

  if (uploadResult._tag === "Failure") {
    toast.error("Failed to upload image");
    return;
  }

  const { fileId, url } = uploadResult.value;

  // 2. Create image block with FileId reference
  const blockResult = await createBlock.run({
    pageId,
    type: "image",
    content: JSON.stringify({
      fileId,
      caption: "",
      width: 600,
      alignment: "center",
    }),
  });

  if (blockResult._tag === "Success") {
    toast.success("Image added");
  }
};
```

#### Permission Propagation

**Encrypted Spaces:**
- When space has `isEncrypted = true`, files uploaded via knowledge pages inherit encryption
- Files slice contract receives `encryptionKeyId` from space

**Access Control:**
- File permissions mirror page permissions (if user can view page → can view embedded files)
- Files slice validates `organizationId` matches page's organization

#### Contracts

**Proposed Contracts (Files Slice):**

```typescript
// @beep/documents-sdk/contracts/file.contracts.ts (hypothetical)
export const uploadFile = Contract.make({
  payload: S.Struct({
    file: S.instanceof(File),
    organizationId: SharedEntityIds.OrganizationId,
    uploadPath: S.String, // e.g., "/knowledge/{spaceId}/{pageId}"
    encryptionKeyId: S.optional(S.String),
  }),
  success: S.Struct({
    fileId: FileId,
    url: S.String, // Pre-signed S3 URL or CDN URL
  }),
  failure: S.Union(
    UploadError,
    StorageQuotaExceededError,
    UnauthorizedError,
  ),
});

export const getFileUrl = Contract.make({
  payload: S.Struct({
    fileId: FileId,
  }),
  success: S.Struct({
    url: S.String, // Time-limited download URL
  }),
  failure: S.Union(
    FileNotFoundError,
    UnauthorizedError,
  ),
});
```

**Usage in Knowledge Management:**

```tsx
// packages/documents-ui/src/components/Editor/ImageBlock.tsx
import { getFileUrl } from "@beep/documents-sdk/contracts/file.contracts";

const ImageBlock = ({ fileId, caption }: { readonly fileId: FileId.Type; readonly caption: string }) => {
  const { data: fileData, isLoading } = useContractQuery(getFileUrl, { fileId });

  if (isLoading) return <Skeleton variant="rectangular" height={200} />;

  return (
    <figure>
      <img src={fileData.url} alt={caption} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
};
```

---

### 10.3 Audit Logging (PROPOSED)

**Status:** Proposed for compliance and security monitoring

The documents slice should emit audit events for sensitive operations (viewing, editing, deleting pages) to enable compliance tracking and security monitoring.

#### Event Definitions

**Proposed Event Schema:**

```typescript
// packages/documents-domain/src/events/audit.events.ts
import * as S from "effect/Schema";
import { KnowledgePageId, KnowledgeSpaceId } from "@beep/shared-domain/entity-ids/documents";
import {SharedEntityIds} from "@beep/shared-domain/entity-ids";

export const PageViewedEvent = S.Struct({
  eventType: S.Literal("PageViewed"),
  timestamp: BS.DateTimeUtcFromAllAcceptable,
  userId: SharedEntityIds.UserId,
  organizationId: SharedEntityIds.OrganizationId,
  pageId: KnowledgePageId,
  spaceId: KnowledgeSpaceId,
  pageTitle: S.String,
  metadata: S.Struct({
    ipAddress: S.optional(S.String),
    userAgent: S.optional(S.String),
  }),
});

export const PageEditedEvent = S.Struct({
  eventType: S.Literal("PageEdited"),
  timestamp: BS.DateTimeUtcFromAllAcceptable,
  userId: SharedEntityIds.UserId,
  organizationId: SharedEntityIds.OrganizationId,
  pageId: KnowledgePageId,
  spaceId: KnowledgeSpaceId,
  changesSummary: S.Struct({
    blocksAdded: S.Int,
    blocksModified: S.Int,
    blocksDeleted: S.Int,
  }),
});

export const PageDeletedEvent = S.Struct({
  eventType: S.Literal("PageDeleted"),
  timestamp: BS.DateTimeUtcFromAllAcceptable,
  userId: SharedEntityIds.UserId,
  organizationId: SharedEntityIds.OrganizationId,
  pageId: KnowledgePageId,
  spaceId: KnowledgeSpaceId,
  pageTitle: S.String,
  reason: S.optional(S.String),
});

export const SpaceAccessGrantedEvent = S.Struct({
  eventType: S.Literal("SpaceAccessGranted"),
  timestamp: BS.DateTimeUtcFromAllAcceptable,
  grantedBy: SharedEntityIds.UserId,
  grantedTo: S.Union(SharedEntityIds.UserId, SharedEntityIds.TeamId),
  spaceId: KnowledgeSpaceId,
  permissions: S.Struct({
    canRead: S.Boolean,
    canWrite: S.Boolean,
  }),
});
```

#### Integration with Shared Audit System

**Proposed Event Bus:**

```typescript
// packages/shared-domain/src/events/EventBus.ts (hypothetical)
import { Effect, Context, Layer, Queue } from "effect";

export class EventBus extends Context.Tag("EventBus")<
  EventBus,
  {
    readonly publish: <E>(event: E) => Effect.Effect<void, PublishError>;
    readonly subscribe: <E>(handler: (event: E) => Effect.Effect<void>) => Effect.Effect<void>;
  }
>() {}
```

**Publishing Events from Knowledge Management:**

```typescript
// packages/documents-infra/src/contracts/page.contracts.impl.ts
import { EventBus } from "@beep/shared-domain/events/EventBus";
import { PageEditedEvent } from "@beep/documents-domain/events/audit.events";
import * as DateTime from "effect/DateTime";
import * as A from "effect/Array";
export const updatePageContentImpl = PageContracts.updatePageContent.implement((payload) =>
  Effect.gen(function* () {
    const now = yield* DateTime.now.pipe(DateTime.toUtc);
    const auth = yield* AuthService;
    const pageRepo = yield* KnowledgePageRepository;
    const eventBus = yield* EventBus;

    const currentUser = yield* auth.getCurrentUser();
    const page = yield* pageRepo.findById(payload.pageId);

    // Update page content
    const updatedPage = yield* pageRepo.updateContent(payload.pageId, payload.blocks);

    // Emit audit event
    yield* eventBus.publish(
      PageEditedEvent.make({
        eventType: "PageEdited",
        timestamp: now,
        userId: currentUser.id,
        organizationId: page.organizationId,
        pageId: payload.pageId,
        spaceId: page.spaceId,
        changesSummary: {
          blocksAdded: A.filter(payload.blocks, (b) => !b.blockId).length,
          blocksModified: A.filter(payload.blocks, (b) => b.blockId).length,
          blocksDeleted: 0, // Calculate from diff
        },
      })
    );

    return { page: updatedPage };
  })
);
```

#### Audit Storage

**Proposed Table (Shared Domain):**

```typescript
// packages/shared-tables/src/tables/auditLog.table.ts (hypothetical)
import { Table } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const auditLog = Table.make(AuditLogId)({
  organizationId: pg
    .text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" })
    .$type<SharedEntityIds.OrganizationId.Type>(),
  userId: pg
    .text("user_id")
    .notNull()
    .references(() => user.id)
    .$type<SharedEntityIds.UserId.Type>(),
  eventType: pg.text("event_type").notNull(), // "PageViewed", "PageEdited", etc.
  resourceType: pg.text("resource_type").notNull(), // "KnowledgePage", "KnowledgeSpace"
  resourceId: pg.text("resource_id").notNull(), // pageId or spaceId
  eventPayload: pg.jsonb("event_payload").notNull(), // Full event schema
  timestamp: pg.timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  pg.index("audit_log_org_idx").on(t.organizationId),
  pg.index("audit_log_user_idx").on(t.userId),
  pg.index("audit_log_resource_idx").on(t.resourceType, t.resourceId),
  pg.index("audit_log_timestamp_idx").on(t.timestamp),
]);
```

#### Compliance Use Cases

- **GDPR Access Logs**: Track who viewed sensitive pages
- **SOC 2 Audit Trail**: Provide evidence of access controls
- **Forensics**: Investigate suspicious activity (e.g., mass page deletions)
- **Analytics**: Generate usage reports (most viewed pages, active editors)

---

### 10.4 Notifications (Future)

**Status:** Future enhancement (post-MVP)

The documents slice could integrate with the `@beep/comms-*` slice to send notifications for @mentions, page shares, and collaborative events.

#### Proposed Features

**@Mention Detection:**

```typescript
// packages/documents-infra/src/services/MentionDetector.ts
import { Effect } from "effect";
import { UserId } from "@beep/shared-domain/entity-ids";
import { sendNotification } from "@beep/comms-sdk/contracts/notification.contracts";

export const detectAndNotifyMentions = (blockContent: string, pageId: KnowledgePageId.Type) =>
  Effect.gen(function* () {
    // Parse @mentions from BlockNote JSON content
    const mentions = extractMentions(blockContent); // e.g., ["@alice", "@bob"]

    // Resolve usernames to UserIds
    const userIds = yield* Effect.forEach(mentions, resolveUsername);

    // Send notifications via Comms slice
    yield* Effect.forEach(userIds, (userId) =>
      sendNotification.run({
        recipientId: userId,
        type: "mention",
        title: "You were mentioned in a page",
        body: `Check out the page: ${pageId}`,
        actionUrl: `/knowledge/${pageId}`,
      })
    );
  });
```

**Page Share Notifications:**

```typescript
// packages/documents-sdk/src/contracts/share.contracts.ts (hypothetical)
export const sharePage = Contract.make({
  payload: S.Struct({
    pageId: KnowledgePageId,
    recipientUserId: SharedEntityIds.UserId,
    message: S.optional(S.String),
  }),
  success: S.Void,
  failure: S.Union(
    PageNotFoundError,
    UnauthorizedError,
  ),
});

// Implementation
export const sharePageImpl = sharePage.implement((payload) =>
  Effect.gen(function* () {
    const page = yield* KnowledgePageRepository.findById(payload.pageId);

    // Send notification
    yield* sendNotification.run({
      recipientId: payload.recipientUserId,
      type: "page_share",
      title: "Someone shared a page with you",
      body: payload.message || `Check out: ${page.title}`,
      actionUrl: `/knowledge/${page.spaceId}/${payload.pageId}`,
    });
  })
);
```

**Collaborative Edit Notifications:**

```typescript
// Real-time presence updates (requires WebSocket integration)
export const notifyPageEditStarted = (pageId: KnowledgePageId.Type, userId: UserId) =>
  Effect.gen(function* () {
    yield* broadcastPresence.run({
      channel: `page:${pageId}`,
      event: "user_editing",
      data: { userId },
    });
  });
```

#### Integration Points

**Comms Slice Contracts:**
- `sendNotification` - Send in-app/email/push notification
- `broadcastPresence` - Real-time WebSocket broadcast
- `createNotificationPreferences` - User opt-in/opt-out settings

**Implementation Timeline:**
- Post-MVP: @mention detection
- Future: Real-time presence and collaborative notifications

---

### 10.5 Integration Summary

| Integration Point | Status | Package Dependencies | Key Contracts/Services |
|-------------------|--------|----------------------|------------------------|
| **IAM** | Production | `@beep/iam-sdk`, `@beep/iam-tables` | `getSession`, `isTeamMember`, `canViewSpace`, `canEditSpace` |
| **Files** | Proposed | `@beep/documents-sdk` (future) | `uploadFile`, `getFileUrl` |
| **Audit Logging** | Proposed | `@beep/shared-domain/events` (future) | `EventBus.publish`, `PageViewedEvent`, `PageEditedEvent` |
| **Notifications** | Future | `@beep/comms-sdk` (future) | `sendNotification`, `broadcastPresence` |

**Key Principles:**
- Use **SDK contracts** for all cross-slice communication (no direct repository calls)
- Maintain **bounded context** integrity (documents does not expose internal domain logic)
- Follow **dependency direction**: documents → IAM (not bidirectional)
- Use **shared kernel** (`@beep/shared-domain`) for common entities (User, Organization, EntityIds)

---

## 11. Roadmap

### Phase 1: Foundation (Weeks 1-3)

**Milestone 1.1: Slice Skeleton**
- [x] Create package directories (`domain`, `tables`, `infra`, `sdk`, `ui`)
- [x] Add `package.json` files with workspace dependencies
- [x] Update `tsconfig.base.jsonc` path aliases:
  ```json
  {
    "@beep/documents-domain": ["packages/documents/domain/src"],
    "@beep/documents-tables": ["packages/documents/tables/src"],
    "@beep/documents-infra": ["packages/documents/infra/src"],
    "@beep/documents-sdk": ["packages/documents/sdk/src"],
    "@beep/documents-ui": ["packages/documents-ui/src"]
  }
  ```

**Milestone 1.2: EntityIds in Shared Kernel**
- [ ] Create `packages/shared/domain/src/entity-ids/documents.ts`
- [ ] Define `KnowledgeSpaceId`, `KnowledgePageId`, `KnowledgeBlockId`, `PageLinkId`
- [ ] Export from `packages/shared/domain/src/entity-ids/index.ts`
- [ ] Update table names registry (`entity-ids/table-names.ts`)

**Milestone 1.3: Domain Models**
- [ ] Implement `KnowledgeSpace.model.ts` with `makeFields` + `M.Class`
- [ ] Implement `KnowledgePage.model.ts`
- [ ] Implement `KnowledgeBlock.model.ts`
- [ ] Implement `PageLink.model.ts`
- [ ] Create value object schemas (`BlockType`, `PageStatus`, `LinkType`)
- [ ] Define domain errors (`page.errors.ts`, `encryption.errors.ts`)

---

### Phase 2: Database Layer (Weeks 4-5)

**Milestone 2.1: Table Definitions**
- [ ] Implement `knowledgeSpace.table.ts` with `OrgTable.make`
- [ ] Implement `knowledgePage.table.ts` with `OrgTable.make`
- [ ] Implement `knowledgeBlock.table.ts` with `OrgTable.make`
- [ ] Implement `pageLink.table.ts` with `OrgTable.make`
- [ ] Add Drizzle relations (`relations.ts`)
- [ ] Create schema export (`schema.ts`)

**Milestone 2.2: Compile-Time Checks**
- [ ] Implement `_check.ts` with type assertions (domain ↔ table consistency)
- [ ] Run `bun run check` to validate (expect 0 errors)

**Milestone 2.3: Migrations**
- [ ] Generate migration: `bun run db:generate`
- [ ] Review SQL (verify indexes, foreign keys, enums)
- [ ] Apply migration: `bun run db:migrate`
- [ ] Verify in `bun run db:studio`

---

### Phase 3: Zero Integration (Weeks 6-7)

**Milestone 3.1: Zero Schema Configuration**
- [ ] Define Zero schema mappings for `knowledge_page`, `knowledge_block`, `page_link`
- [ ] Configure auth filters (tenant isolation via `organizationId`)
- [ ] Test local sync: Write to DB → Verify IndexedDB update

**Milestone 3.2: Zero Client Setup**
- [ ] Create `apps/web/src/lib/zero.ts` wrapper
- [ ] Add `ZeroProvider` to `apps/web/src/app/layout.tsx`
- [ ] Implement `useZeroClient` hook

**Milestone 3.3: Basic Queries**
- [ ] Implement `usePages(spaceId)` hook (fetch all pages in a space)
- [ ] Implement `useBlocks(pageId)` hook (fetch blocks for a page)
- [ ] Test reactivity: Update DB → UI updates automatically

---

### Phase 4: Editor Integration (Weeks 8-10)

**Milestone 4.1: BlockNote Setup**
- [ ] Install: `@blocknote/core`, `@blocknote/react`
- [ ] Create `KnowledgePageEditor` component
- [ ] Implement basic editor (no encryption yet)
- [ ] Test: Create page → Add blocks → Verify DB writes

**Milestone 4.2: JSON Serialization & Zero Sync**
- [ ] Serialize editor content to JSON on save/blur
- [ ] Store serialized JSON in `knowledge_block.encrypted_content` (unencrypted for now)
- [ ] Implement loading: DB → Parse JSON → BlockNote editor
- [ ] Test: Edit block → Save → Reload page → Verify content persists
- [ ] Test Zero sync: Two browser tabs → Edit page → Verify second tab updates (last-write-wins)

**Milestone 4.3: Fractional Indexing**
- [ ] Install `fractional-indexing` library
- [ ] Update block ordering logic (use `generateKeyBetween` for inserts)
- [ ] Test: Insert block between two others → Verify no re-ordering of siblings

---

### Phase 5: Encryption (Weeks 11-12)

**Milestone 5.1: Key Management**
- [ ] Create `EncryptionService.ts` (encrypt/decrypt with Web Crypto API)
- [ ] Implement key derivation (org master key → space key via HKDF)
- [ ] Create and store master keys in **PROPOSED** `iam.organization_encryption_key` table (requires IAM slice extension)
- [ ] Implement key fetch contract (`getSpaceKey`)

**Milestone 5.2: Encrypt Block Content**
- [ ] Update `KnowledgePageEditor` to encrypt before saving
- [ ] Update `useBlocks` hook to decrypt after loading
- [ ] Test: Write encrypted block → Verify ciphertext in DB → Decrypt on read

**Milestone 5.3: Encrypted Titles (Optional)**
- [ ] Add `is_title_encrypted` flag to `knowledge_space`
- [ ] Encrypt `knowledge_page.title` if space requires it
- [ ] Update tree view to handle encrypted titles (decrypt on render)

---

### Phase 6: Access Control (Weeks 13-14)

**Milestone 6.1: IAM Integration**
- [ ] Implement `canEditPage` policy (check org/team membership)
- [ ] Implement `canViewSpace` policy
- [ ] Add policy enforcement to SDK contracts

**Milestone 6.2: Zero Auth Filters**
- [ ] Update Zero schema with `authFilter` (filter by `organizationId`)
- [ ] Test: User A cannot see User B's pages (different orgs)

**Milestone 6.3: Permission UI**
- [ ] Add space settings page (`/knowledge/[spaceId]/settings`)
- [ ] Implement permission editor (add/remove team access)
- [ ] Update `defaultPermissions` JSONB column

---

### Phase 7: Graph View (Weeks 15-16)

**Milestone 7.1: Link Extraction**
- [ ] Implement parser to detect `[[Page Name]]` syntax in BlockNote content
- [ ] Insert rows in `page_link` table on save
- [ ] Handle renames: Update target IDs when page slug changes

**Milestone 7.2: Graph Rendering**
- [ ] Install `react-force-graph`
- [ ] Implement `GraphView` component
- [ ] Create `/knowledge/[spaceId]/graph` route
- [ ] Test: Create links → Verify graph updates

**Milestone 7.3: Backlinks Panel**
- [ ] Add "Backlinks" sidebar to page editor
- [ ] Query `page_link.target_page_id = currentPageId`
- [ ] Display linked pages with context snippets

---

### Phase 8: Testing & Observability (Weeks 17-18)

**Milestone 8.1: Unit Tests**
- [ ] Test domain models (validation, invariants)
- [ ] Test encryption service (encrypt/decrypt round-trip)
- [ ] Test fractional indexing (insertion order)
- [ ] Target: 80% coverage on domain/infra layers

**Milestone 8.2: Integration Tests**
- [ ] Test repository methods (create/read/update/delete)
- [ ] Test Zero sync (write to DB → IndexedDB updates)
- [ ] Test last-write-wins conflict resolution (two clients editing same block → latest save wins)

**Milestone 8.3: E2E Tests**
- [ ] Test: Sign in → Create space → Add page → Edit content → Verify save
- [ ] Test: Create link → Verify graph view
- [ ] Test: Offline mode → Edit → Reconnect → Verify sync

**Milestone 8.4: Observability**
- [ ] Add Effect spans for key operations (`createPage`, `encryptBlock`, etc.)
- [ ] Integrate with Jaeger (already running in Docker)
- [ ] Add logging for encryption errors, sync failures

---

### Phase 9: MVP Polish & Rollout (Week 19-20)

**Milestone 9.1: UX Improvements**
- [ ] Add loading states (skeleton loaders for page tree)
- [ ] Add error boundaries (handle Zero disconnect gracefully)
- [ ] Add keyboard shortcuts (Cmd+K for page search)

**Milestone 9.2: Performance Optimization**
- [ ] Profile Zero queries (add indexes if needed)
- [ ] Optimize BlockNote rendering (virtualize long documents)
- [ ] Test with 100+ pages per space

**Milestone 9.3: Feature Flags**
- [ ] Add feature flag for documents slice
- [ ] Deploy to staging (beta users only)
- [ ] Collect feedback, iterate

**Milestone 9.4: Launch**
- [ ] Write user documentation
- [ ] Enable feature flag for all users
- [ ] Monitor error rates, performance metrics

---

## 11. Open Questions

### Architecture & Design

1. **Encryption Granularity**
   - **Question:** Should we support per-page encryption keys (instead of space-level)?
   - **Trade-Offs:**
     - ✅ Finer access control (revoke access by not sharing page key)
     - ❌ Key distribution complexity (need asymmetric encryption for sharing)
     - ❌ Breaks graph view (can't traverse links without decrypting all pages)
   - **Proposed Answer:** Stick with space-level keys for MVP; revisit if user feedback demands per-page control.

2. **Conflict Resolution for Structural Changes**
   - **Question:** What happens when two users move the same page to different parents?
   - **Current Strategy:** Last-write-wins (server timestamp authority)
   - **Alternative:** Prompt user to resolve conflict (like Git merge)
   - **Open:** Need UX design for conflict resolution UI (out of scope for MVP).

4. **Search Strategy**
   - **Question:** How to enable full-text search on encrypted content?
   - **Options:**
     - A) Plaintext titles + encrypted bodies (MVP)
     - B) Client-side indexing with `lunr.js` (post-MVP)
     - C) Searchable encryption (not practical for MVP)
     - D) Homomorphic encryption (research territory)
   - **Open:** Revisit after MVP launch based on user demand for encrypted search.

---

### Cross-Slice Dependencies

5. **Files Integration**
   - **Question:** Should images/attachments in knowledge pages use the existing `@beep/documents-*` slice?
   - **Proposal:** Yes—BlockNote image blocks store `FileId` references, actual uploads handled by Files slice.
   - **Open:** Need to define contract for embedding files (permissions, encryption passthrough).

6. **Audit Logging**
   - **Question:** Should page edits emit events to a shared audit log (e.g., `@beep/shared-domain/AuditLog`)?
   - **Proposal:** Yes for compliance (track who accessed sensitive pages).
   - **Open:** Define event schema (`PageViewed`, `PageEdited`, `PageDeleted`) and integrate with event bus (if it exists).

7. **Notifications**
   - **Question:** Should the `@beep/comms-*` slice handle notifications (e.g., "You were mentioned in a page")?
   - **Proposal:** Post-MVP—requires parsing mentions from block content.
   - **Open:** Design @mention syntax and mention detection pipeline.

---

### Technical Constraints

8. **Zero Limitations**
   - **Question:** Does Zero support partial sync (e.g., only sync visible pages, not entire space)?
   - **Risk:** Large spaces (10k+ pages) may exhaust IndexedDB quota.
   - **Mitigation:** Test with synthetic data; add pagination if needed.

9. **BlockNote Customization**
   - **Question:** Can BlockNote block types be extended (e.g., custom "callout" block)?
   - **Answer:** Yes via `@blocknote/core` schema extensions—document in Phase 4.

10. **PWA Offline Limits**
    - **Question:** How much data can we cache offline in IndexedDB?
    - **Constraint:** Browsers typically allow 50MB-1GB (varies by browser/device).
    - **Mitigation:** Warn users if space exceeds 50MB; prioritize recent pages for offline cache.

---

### Product & UX

11. **Graph View Scope**
    - **Question:** Should graph view support filtering (e.g., show only pages tagged "research")?
    - **Proposal:** Post-MVP—requires tagging system (out of scope).

12. **Collaborative Cursor Presence**
    - **Question:** Should we show who's currently editing (like Google Docs)?
    - **Proposal:** Post-MVP—requires WebRTC or WebSocket presence channel.

13. **Version History**
    - **Question:** Should we keep historical snapshots of pages (Time Machine–style)?
    - **Trade-Off:** Storage cost vs. user safety (undo major edits).
    - **Proposal:** Store last 10 versions per page (prune older), add "Restore" UI in v2.

---

### Security & Compliance

14. **Key Escrow**
    - **Question:** Should admins have a master key to decrypt all content (for data recovery)?
    - **Trade-Off:** Compliance (some orgs require admin access) vs. zero-knowledge promise.
    - **Proposal:** Make it optional (org setting: "Allow admin key escrow").

15. **GDPR / Right to Erasure**
    - **Question:** How to handle "delete my data" requests (hard delete vs. soft delete)?
    - **Current:** Soft delete with `deleted_at`.
    - **Open:** Add hard delete job that purges rows after 30 days (compliance requirement).

---

## Appendix: References

- **DeepWiki Pages:**
  - [Monorepo Structure](https://deepwiki.com/kriegcloud/beep-effect/2.1-monorepo-structure)
  - [Domain-Driven Design & Vertical Slices](https://deepwiki.com/kriegcloud/beep-effect/2.3-domain-driven-design-and-vertical-slices)
  - [Database Layer](https://deepwiki.com/kriegcloud/beep-effect/4.2-database-layer)
  - [Domain Contexts](https://deepwiki.com/kriegcloud/beep-effect/5-domain-contexts)
  - [Shared Domain](https://deepwiki.com/kriegcloud/beep-effect/5.5-shared-domain)

- **Codebase Examples:**
  - `packages/shared/domain/src/entity-ids/party.ts` (EntityId patterns)
  - `packages/shared/tables/src/Table/Table.ts` (Table.make factory)
  - `packages/shared/tables/src/OrgTable/OrgTable.ts` (OrgTable.make factory)
  - `packages/party/domain/src/entities/Party/Party.model.ts` (Domain model example)
  - `packages/party/tables/src/tables/party.table.ts` (Table definition example)
  - `packages/shared/tables/src/_check.ts` (Schema consistency checks)

- **External Libraries:**
  - [Zero (Rocicorp)](https://github.com/rocicorp/zero)
  - [BlockNote](https://www.blocknotejs.org/)
  - [react-force-graph](https://github.com/vasturiano/react-force-graph)
  - [fractional-indexing](https://github.com/rocicorp/fractional-indexing)

---

**Document Status:** Draft v1.0
**Author:** Claude Code (Anthropic)
**Date:** 2025-11-24
**Next Review:** After Phase 1 completion (validate EntityId placement, table designs)