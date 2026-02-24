# Gmail -> Document Mapping + Materialization Design

## Scope + Constraints Observed
- Current Documents slice tables live in `packages/documents/tables/src/tables/` and use `OrgTable.make(...)` for org-scoped RLS.
- Documents tables do not import tables from other slices (IAM, Knowledge, Comms), consistent with the cross-slice boundary rule (imports only through `@beep/shared-*`).
- Gmail extraction currently lives in Knowledge (`GmailExtractionAdapter`) and produces `ExtractedEmailDocument` with `sourceId`, `threadId`, `metadata`, and `extractedAt`.

## Potential Issues With the Request (Before Design)
- “Provider account” is not part of the Documents slice schema. The only authoritative account table is in IAM (`iam.account`), which is cross-slice. If the Documents slice directly references that table, it violates the stated boundary. The design needs to store the provider account identifier as a typed string (and optionally a non-enforced FK by convention), or the mapping should live in IAM/Integrations instead.
- Gmail message IDs are only guaranteed unique per mailbox. If org is omitted from the unique key, cross-org collisions are possible. Your proposed unique key already includes org, which is correct.

Given those constraints, a Documents-owned mapping table with a provider account ID stored as text (typed as `IamEntityIds.AccountId.Type`) is the least disruptive and boundary-safe approach.

## Proposed Table Placement
- **Slice:** Documents (`packages/documents/tables/src/tables/`)
- **Table name:** `document_source` (generic to support other providers later)
- **Rationale:** A document-origin mapping is a document concern. Knowledge can continue to reference `documentId` without needing direct Gmail details. Comms/Gmail integration can write mappings when materializing documents.

## Suggested Columns (Minimal Provenance + Idempotency)
Minimal set that supports provenance and idempotent materialization without cross-slice dependencies:

- `documentId` (FK -> `document.id`): the materialized document
- `userId` (FK -> `user.id`): convenience link to owning user for queries
- `providerAccountId` (text): IAM account ID (no FK; avoid cross-slice dependency)
- `sourceType` (text): enum-ish discriminator, initial value `"gmail"`
- `sourceId` (text): Gmail message ID
- `sourceThreadId` (text, nullable): Gmail thread ID
- `sourceUri` (text, nullable): canonical provenance URI (ex: `gmail://{account}/{messageId}`)
- `sourceInternalDate` (timestamp, nullable): Gmail `internalDate` for provenance
- `sourceHistoryId` (text, nullable): Gmail `historyId` for change detection
- `sourceHash` (text, nullable): hash of extracted message content used for idempotency

Why these are minimal:
- **Provenance:** `sourceType`, `sourceId`, `sourceThreadId`, and `sourceInternalDate` are enough to track origin and timeline. `sourceUri` is a stable provenance handle used by Knowledge extraction pipelines if needed.
- **Idempotency:** `sourceHash` + unique key let you short-circuit re-materialization when content does not change.

## Unique Indexes + Constraints
Primary idempotency constraint:
- Unique index on `(organizationId, providerAccountId, sourceId)`.

Optional:
- Secondary index on `(organizationId, documentId)` for joining from documents.
- Secondary index on `(organizationId, sourceThreadId)` for thread grouping.

Note: If soft deletes are used (`deletedAt` from `OrgTable`), this unique index will block re-creation after soft delete. If re-linking should be allowed, use a partial unique index with `deleted_at IS NULL`. Existing tables do not do this, so the default should match current behavior unless you explicitly want relink support.

## Drizzle Table Sketch (Documents Tables)
This is a concrete suggestion for `packages/documents/tables/src/tables/document-source.table.ts`.

```ts
import type { SharedEntityIds, IamEntityIds, DocumentsEntityIds } from "@beep/shared-domain";
import { OrgTable, user } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { document } from "./document.table";

export const documentSource = OrgTable.make(DocumentsEntityIds.DocumentSourceId)(
  {
    documentId: pg
      .text("document_id")
      .notNull()
      .references(() => document.id, { onDelete: "cascade" })
      .$type<DocumentsEntityIds.DocumentId.Type>(),
    userId: pg
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .$type<SharedEntityIds.UserId.Type>(),
    providerAccountId: pg.text("provider_account_id").notNull().$type<IamEntityIds.AccountId.Type>(),
    sourceType: pg.text("source_type").notNull(),
    sourceId: pg.text("source_id").notNull(),
    sourceThreadId: pg.text("source_thread_id"),
    sourceUri: pg.text("source_uri"),
    sourceInternalDate: pg.timestamp("source_internal_date", { withTimezone: true, mode: "date" }),
    sourceHistoryId: pg.text("source_history_id"),
    sourceHash: pg.text("source_hash"),
  },
  (t) => [
    pg.index("document_source_org_id_idx").on(t.organizationId),
    pg.index("document_source_document_id_idx").on(t.documentId),
    pg.index("document_source_user_id_idx").on(t.userId),
    pg.index("document_source_thread_id_idx").on(t.sourceThreadId),
    pg.uniqueIndex("document_source_org_provider_source_uidx").on(
      t.organizationId,
      t.providerAccountId,
      t.sourceId
    ),
  ]
);
```

Notes:
- You will need to add a new entity ID (`DocumentsEntityIds.DocumentSourceId`) in `packages/shared/domain/src/entity-ids/documents/ids.ts` and export it.
- There is no FK to IAM `account` table to avoid cross-slice table imports. If you decide to move the mapping table into IAM or Integrations, then the FK becomes viable.

## Materialization Flow (Gmail -> Document)
Minimal steps for idempotent materialization:

1. **Extract Gmail message** using existing Gmail adapter (`GmailExtractionAdapter` or Comms Gmail adapter).
2. **Build deterministic source URI**: `gmail://{providerAccountId}/{messageId}`.
3. **Compute `sourceHash`** from the normalized content (subject + body + attachments list). This determines if an update is needed.
4. **Upsert mapping row** on `(organizationId, providerAccountId, sourceId)`:
   - If no row exists: create `document` row first, then create `document_source`.
   - If row exists:
     - If `sourceHash` is unchanged: no-op (idempotent).
     - If `sourceHash` changed: update document content and update `sourceHash`, `sourceHistoryId`, `sourceInternalDate`.

5. **Document write policy**:
   - Default to `lockPage = true` on Gmail-sourced documents to prevent manual edits from diverging.
   - Alternatively, allow edits but only update document content if `lockPage` is still true, or if a `materializationPolicy` flag is set.

## Boundary Rationale
- **Documents slice** owns materialized document records and their provenance mapping because this data is strictly about document origin and persistence.
- **Knowledge slice** should only reference `documentId` and optional `sourceUri`. It should not need Gmail account details.
- **IAM slice** continues to own OAuth accounts. The mapping table avoids a hard FK to IAM to preserve slice boundaries.

## Open Questions / Decisions Needed
- Should Gmail-sourced documents be immutable (`lockPage = true`) or should user edits be allowed?
- Do we need multi-document per Gmail message (e.g., one for body, one for attachments), or is it 1:1?
- Is `providerAccountId` intended to be IAM `account.id` or the external `account.accountId`? The unique index uses this value, so it must be stable and consistent.
- Should soft deletes allow re-linking? If yes, use a partial unique index on `deleted_at IS NULL`.

## Summary
Place a generic `document_source` mapping table in Documents with a unique key `(organizationId, providerAccountId, sourceId)` and minimal provenance/idempotency metadata (`sourceType`, `sourceThreadId`, `sourceInternalDate`, `sourceHistoryId`, `sourceHash`). Materialization should be an upsert keyed on that unique constraint, and only update documents when `sourceHash` changes.
