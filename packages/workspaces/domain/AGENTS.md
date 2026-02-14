# AGENTS.md — `@beep/workspaces-domain`

## Purpose & Fit
- Domain layer for the documents vertical: entities, value objects, and business logic for document management and collaboration.
- Supplies strongly-typed domain models for documents, versions, file attachments, discussions, and comments.
- Provides Effect-first RPC schemas for remote operations consumed by `packages/workspaces/server` and application runtimes.
- Owns document structure value objects (text styles, link types) while delegating persistence to server/tables layers.

## Surface Map
- **Errors (`src/errors.ts`)** — Tagged domain errors for document operations: `MetadataParseError` and `FileReadError` for file processing failures.
- **Entities (`src/entities/`)**
  - `Document` — Core document entity with versioning and file attachments. Includes RPC schema for remote operations.
  - `DocumentVersion` — Version history tracking for documents.
  - `DocumentFile` — File attachments associated with documents.
  - `Discussion` — Discussion threads on documents. Includes RPC schema for remote operations.
  - `Comment` — Individual comments in discussions. Includes RPC schema for remote operations.
- **Value Objects (`src/value-objects/`)**
  - `LinkType` — Types of links: `explicit`, `inline-reference`, `block_embed`.
  - `TextStyle` — Text formatting styles: `default`, `serif`, `mono`.
- **RPC Schemas** — Effect RPC schemas for entities that support remote procedure calls (`Comment.rpc`, `Discussion.rpc`, `Document.rpc`).

## Usage Snapshots
- `packages/runtime/server/src/Runtime.ts` — Runtime layer composition for server-side execution.
- `packages/workspaces/server/src/db/repositories.ts` — References all entity repos (CommentRepo, DiscussionRepo, DocumentFileRepo, DocumentRepo, DocumentVersionRepo).
- `packages/workspaces/server/src/db/repos/` — Individual repository implementations for each entity.
- `packages/workspaces/tables/src/tables/` — Drizzle table definitions mirror domain entities (comment.table.ts, discussion.table.ts, document.table.ts, documentFile.table.ts, documentVersion.table.ts).
- `packages/_internal/db-admin/` — Migration files correspond to entity schemas.

## Authoring Guardrails
- ALWAYS namespace every Effect import (`import * as Effect from "effect/Effect"`, `import * as A from "effect/Array"`, `import * as F from "effect/Function"`, etc.) and route **all** collection/string/object transforms through those modules. NEVER add new native `.map`, `.split`, `for...of`, or `Object.entries` usage.
- IMPORTANT: Keep domain models pure and free of infrastructure concerns (no direct database, HTTP, or storage dependencies).
- ALWAYS use `@beep/schema` for all entity schemas and validation.
- RPC schemas MUST be defined for entities that support remote operations, following the pattern in `Document.rpc`, `Discussion.rpc`, and `Comment.rpc`.
- Value objects MUST be immutable and validated through Effect Schema using `BS.StringLiteralKit` or similar patterns.
- Entity models MUST align with corresponding Drizzle table schemas in `@beep/workspaces-tables`.
- Tagged errors in `errors.ts` MUST use `Data.TaggedError` for structured error handling.

## Quick Recipes
```ts
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import { Document, Discussion, Comment } from "@beep/workspaces-domain/entities";
import { LinkType, TextStyle } from "@beep/workspaces-domain/value-objects";

// Working with domain entities - Document creation
export const createDocument = (data: {
  title: string;
  content: unknown;
  organizationId: string;
}) =>
  Effect.gen(function* () {
    const doc = yield* S.decodeUnknown(Document.Model)(data);
    yield* Effect.logInfo("document.created", { documentId: doc.id });
    return doc;
  });

// Working with value objects
export const createStyledLink = (
  url: string,
  linkType: LinkType.Type,
  textStyle: TextStyle.Type
) =>
  Effect.gen(function* () {
    const validatedLinkType = yield* S.decodeUnknown(LinkType)(linkType);
    const validatedTextStyle = yield* S.decodeUnknown(TextStyle)(textStyle);
    return {
      url,
      linkType: validatedLinkType,
      textStyle: validatedTextStyle,
    };
  });

// Using RPC schemas for remote operations
import * as Rpc from "@effect/rpc";

export const handleDocumentRpc = (request: Document.RpcRequest) =>
  Effect.gen(function* () {
    const decoded = yield* S.decodeUnknown(Document.rpc)(request);
    yield* Effect.logInfo("document.rpc.received", { request: decoded });
    return decoded;
  });
```

## Verifications
- `bun run test --filter=@beep/workspaces-domain` — Vitest suites for domain logic.
- `bun run check --filter=@beep/workspaces-domain` — TypeScript project refs across `src` + `test`.
- `bun run lint --filter=@beep/workspaces-domain` / `bun run lint:fix --filter=@beep/workspaces-domain` — Biome + circular dependency checks.
- `bunx effect generate --cwd packages/workspaces/domain` — Refresh autogenerated `index.ts` / barrel exports after adding modules.

## Contributor Checklist
- [ ] All new code uses Effect namespace utilities (Array/String/Record) and NEVER introduces fresh native helpers.
- [ ] Entity changes include corresponding updates to `@beep/workspaces-tables` schemas.
- [ ] New HTTP contracts are added to `DomainApi` and documented here.
- [ ] Domain models MUST remain pure and infrastructure-agnostic.
- [ ] Re-ran lint/check/test targets above and regenerated Effect indices when touching exports.
- [ ] Updated downstream references in server adapters when expanding entity surfaces.
