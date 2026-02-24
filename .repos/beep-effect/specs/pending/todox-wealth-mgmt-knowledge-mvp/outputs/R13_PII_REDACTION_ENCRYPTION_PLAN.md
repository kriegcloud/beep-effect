# R13 PII Redaction + Encryption Plan (Knowledge MVP)

Date: 2026-02-09

## Issues and assumptions that need correction

- `tmp/gmail-schemas` does exist in this repo at `tmp/gmail-schemas/gmail-schemas.ts`.
  - This enables typed Gmail payload parsing and field-level schema modeling.
  - Practical integration point: use these schemas in the Gmail adapter/materializer to parse `gmail_v1.Schema$Message` and derive the canonical persisted document content + metadata (and to drive per-field redaction defaults for headers/labels).
  - It does not solve PII in free-form content (email body/subject/attachments) by itself; those still require redaction + encryption handling.
- `S.Redacted` and `BS.FieldSensitiveOptionOmittable` prevent accidental logging/serialization but they do not encrypt data at rest. Treating them as encryption is a security gap.
- “Effect RPC Worker protocol” is not a named API in this repo. The existing worker pattern uses `@effect/rpc/RpcClient.layerProtocolWorker` + `BrowserWorker` and `RpcServer.layerProtocolWorkerRunner` for client-side workers. Any client redaction pipeline should be planned against those exact primitives.

## Existing building blocks to reuse

Server schema redaction

- `S.Redacted` wrappers in primitives like `Email`, `Phone`, `Password` under `packages/common/schema/src/primitives/string/`.
- `FieldSensitiveOptionOmittable` in `packages/common/schema/src/integrations/sql/common.ts` for nullable PII fields with redaction semantics.

Content/body handling

- HTML sanitize schemas in `packages/common/schema/src/integrations/html/sanitize`.
- `SanitizedHtml` brand and `makeSanitizeSchema` to validate and transform HTML content.

Files

- File metadata schemas such as `FileAttributes` in `packages/common/schema/src/integrations/files/FileAttributes.ts`.

Encryption at rest

- `EncryptionService` + `EncryptedPayload` schemas in `packages/shared/domain/src/services/EncryptionService/` support AES-256-GCM with schema-based encode/decode.

Client worker pattern

- Worker protocol examples in `packages/shared/client/src/atom/services/ImageCompressionClient.service.ts` and `apps/<next-app>/src/app/upload/_lib/atoms/internal/image-compression-worker.ts`.

## Threat model summary (MVP scope)

- Primary risks: accidental PII exposure via logs, plaintext storage, or over-broad client payloads.
- Secondary risks: internal staff access to PII, 3rd party data processors, embedding pipelines that leak raw text.
- MVP target: minimize plaintext PII at rest, allow necessary server-side processing for ingestion/knowledge extraction, and ensure logs are redacted.

## Strategy options and evaluation

### 1) Server-side schema redaction (`S.Redacted`)

What it solves

- Prevents accidental logging or serialization of raw PII.
- Provides a uniform policy for sensitive fields in Effect schemas.

What it does not solve

- Does not encrypt at rest or in transit.
- Does not remove PII from free-form content bodies (email/document text).

Recommendation

- Required for all direct PII fields in contracts and models in MVP.
- Use `FieldSensitiveOptionOmittable` for nullable PII columns to standardize default handling.

### 2) Content/body redaction options

Option A: server-side redaction pipeline

- Pipeline: sanitize HTML, extract text, detect PII, produce redacted text for UI/search, store raw content separately.
- Pros: consistent enforcement, no client dependencies, works for ingestion jobs.
- Cons: server sees plaintext PII; must be combined with encryption-at-rest to reduce exposure risk.

Option B: client-side pre-redaction

- Pipeline: run NER in browser, strip/replace PII prior to RPC submission.
- Pros: reduces PII reaching server, aligns with privacy-by-design.
- Cons: heavy models, device variability, inconsistent results, still need server-side enforcement.

Recommendation

- MVP: server-side redaction pipeline with explicit storage of both encrypted raw body and sanitized-redacted body for indexing/UI.
- Later: client-side pre-redaction as an opt-in privacy mode for sensitive organizations.

### 3) Encryption at rest

Option A: application-level encryption using `EncryptionService`

- Uses AES-256-GCM with IV per encryption call.
- Supports schema-based transformations (`EncryptedPayloadFromString`, etc).
- Works for text bodies, attachments metadata, and structured PII.

Option B: database-level encryption only (pgcrypto/KMS)

- Simpler operationally but less explicit in code and less portable for clients/edge.

Recommendation

- MVP: application-level encryption for content bodies and any direct PII fields that must be stored in plaintext today.
- Use key derivation per org/space via `EncryptionService.deriveKey`.
- DB-level encryption can be layered later for defense-in-depth.

### 4) E2E vs blind indexing

E2E encryption

- Pros: server cannot read content, strongest privacy guarantees.
- Cons: breaks server-side ingestion/extraction, search, dedupe, and embeddings; key management and sharing become a product feature.

Blind indexing

- Pros: enables limited search over encrypted data.
- Cons: complex, error-prone, leakage via index tokens, difficult to apply to rich text/HTML, still incompatible with embeddings.

Recommendation

- MVP: no E2E, no blind indexing. Keep server-side extraction viable while encrypting at rest and redacting logs.
- Later: evaluate per-tenant E2E for “vault” content only, and blind index only for exact-match fields (emails, phone, tax IDs) with strong threat-model justification.

### 5) Client-side local PII redaction pipeline feasibility

Feasibility summary

- The existing Effect RPC worker protocol is sufficient for a browser worker pipeline using `RpcClient.layerProtocolWorker` and `BrowserWorker`.
- Xenova Transformers (WASM) can run in a web worker, but the model payload and cold start are heavy for MVP. Expect multi-megabyte downloads, high memory usage, and slower devices to struggle.
- The worker pipeline is viable for opt-in processing or desktop-class clients, not required for MVP.

Suggested worker contract (later)

- RPC group: `PiiRedactionRpc` with `detect(text)` and `redact(text, policy)`.
- Policy includes allowed entity types, replacement strategy, and language.
- Worker loads model lazily, caches per session, and returns redaction spans plus sanitized output.

## MVP design decisions

### Data classification

- P0 (credential/secrets): always `S.Redacted` + encrypted at rest.
- P1 (direct identifiers: email, phone, SSN, tax ID): `S.Redacted` + encrypted at rest, store a hashed lookup token for exact-match search.
- P2 (content bodies with incidental PII): store encrypted raw content and a redacted/sanitized derivative for UI/search.

### Storage contracts (MVP)

For any rich content body (email, document, note)

- `rawEncrypted`: `EncryptedPayload` stored in DB.
- `redactedText`: plaintext redacted string for UI/search.
- `redactionPolicyVersion`: string to allow reprocessing when policy changes.
- `sanitizedHtml`: if HTML is stored, must be `SanitizedHtml` from `makeSanitizeSchema` and derived from already-redacted content.

For direct PII fields

- Use `S.Redacted` in schemas and `FieldSensitiveOptionOmittable` for optional columns.
- Store `EncryptedPayload` for values that must be retrievable.
- Store `sha256` or HMAC-based lookup token for exact-match search only.

### MVP plaintext exceptions (temporary; demo only)

Current MVP implementation deviates from the storage contracts above (and the “No plaintext raw body stored” gate) in these places:

- `documents_document_version.content`: canonical, version-pinned content used for evidence spans and UTF-16 offsets.
- `knowledge_email_thread.subject` and `knowledge_email_thread.participants`: thread metadata used for UI and basic thread display.

Hard constraints while these exceptions exist

- Only synthetic/demo orgs and demo provider accounts. Do not ingest real customer data into staging/prod until encryption-at-rest is implemented for these fields.
- Do not index or embed these fields unless they pass through the redaction pipeline (and treat resulting embeddings/indexes as PII-bearing artifacts).
- Do not log these values; log only ids, lengths, and counts.

Required follow-up before “real data”

- Store encrypted raw content (via `EncryptionService`) plus a redacted/sanitized derivative for UI/search.
- Offsets remain defined against the decrypted canonical string for the cited `documentVersionId` (never against a redacted/sanitized derivative).
- Provide an explicit migration/backfill plan for existing plaintext rows.

### Logging and telemetry gates

- No raw PII in logs or Effect annotations. Use `S.Redacted` and `Redacted.value` only when required for outbound requests.
- Reject any telemetry payloads that include fields marked `Sensitive` in schema annotations.

## Concrete contracts and gates

### Contract: `PiiField` annotation

- Add a schema annotation (or use existing) to mark PII fields: `{ pii: "P0" | "P1" | "P2" }`.
- Gate: any schema field with `pii` must be `S.Redacted` or use `FieldSensitiveOptionOmittable`.

### Contract: `ContentBody`

- `rawEncrypted`: `EncryptedPayload` (required).
- `redactedText`: `S.NonEmptyString` (required).
- `sanitizedHtml`: `SanitizedHtml` (optional), derived from redacted text only.
- `policyVersion`: `S.NonEmptyString` (required).

Gate

- “No plaintext raw body stored.” Any raw body must be encrypted before persistence.
- “Redaction required before indexing.” Indexer only consumes `redactedText`.

### Contract: `PiiLookupToken`

- `token`: `S.NonEmptyString` (hex) derived from HMAC-SHA256 using org key.
- Gate: only exact-match search permitted on PII tokens.

### Contract: `RedactionPolicy`

- `version`: string.
- `entities`: list of entity types.
- `replacement`: mask strategy.
- `allowList`: optional list of entity exceptions.

Gate

- Policy version bump requires reprocessing stored redacted content.

## MVP vs later breakdown

MVP

- Use `S.Redacted`/`FieldSensitiveOptionOmittable` for all direct PII fields.
- Encrypt all content bodies and direct PII fields with `EncryptionService`.
- Store redacted text derivative for UI/search, derived server-side.
- Sanitize HTML using existing `SanitizedHtml` pipeline after redaction.
- Add PII lookup tokens for exact-match searches on explicit identifiers.

Later

- Client-side pre-redaction worker (Xenova or similar) for opt-in privacy mode.
- Blind indexing only for explicit identifiers with strong threat-model justification.
- E2E encryption for “vault” content, with opt-in key management and no server-side search.
- Tenant-level KMS integration and key rotation workflows.

## Open questions

- Which fields in `tmp/gmail-schemas/gmail-schemas.ts` define the canonical Gmail body/headers we must treat as PII-bearing for MVP (subject/snippet/internalDate/payload parts/headers)?
- Which knowledge ingestion flows must preserve raw content for embeddings vs. “redacted-only” indexing?
- Are there compliance requirements that mandate E2E for specific data classes?

## Recommended next steps

1. Review `tmp/gmail-schemas/gmail-schemas.ts` and decide which Gmail fields are treated as PII-bearing for MVP.
2. Identify the exact content models for Knowledge MVP that require `ContentBody` handling.
3. Decide the minimum PII classes for MVP (P0/P1/P2) and update schema annotations accordingly.
