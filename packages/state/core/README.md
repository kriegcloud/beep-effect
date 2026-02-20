# @palantir/pack.state.core

Real-time state management system.

## Overview

This package provides the core state management infrastructure for PACK, built around the concept of Documents that can be synchronized in real-time across multiple clients.

`StateModule` via `app.state` is the main public interface.

## Key Concepts

### Terminology

> TODO: These need another pass for consistent naming, there's a confusing interchange of Schema & Model between document & record layer.

- `Document` - An instance of a document, as loaded by id. A document is a collection of `Records`.
- `DocumentType` - The backend-registered metadata describing app-specific archetypes of Documents.
- `DocumentSchema` - Describes the Record types in a Document Type. Used internally at runtime for type inspection, validation, and read/writes to underlying document implementation.
  - `Model<Data, Schema>` - Effectively a _Record Type_ - A runtime type unifying `ModelData` and `ModelSchema`.
  - via sdk generators:
    - `DocumentModel` - The runtime definition of the document type, ie the `Model`s that make up the document.
    - `ModelData` - The user-friendly type for a record. This is the type that app code uses.
    - `ModelSchema` - The runtime definition of the record. Generally for internal use only at this stage.
- `Record` - An _instance_ of an object stored in the document. Note this is not a typescript `Record<K,V>`, it is an immutable object corresponding to the defined `Model`. This is the primary concept that apps use for state management.
- `RecordCollection` - All `Record`s are stored in a document internally in their own (per-`Model`) collection. This means all model types marked as `primary` in the schema are accessible with a map-like interface.

### Reference Types

Reference (or _ref_) objects provide the main public api for interacting with documents, providing a clean, async API on top of the DocumentSchema/Models.

- `DocumentRef<DocumentSchema>` - References to documents with validation utilities
- `RecordCollectionRef<ModelSchema>` - References to collections of records
- `RecordRef<ModelSchema>` - References to individual records within documents

> **Note:** Refs are created immediately though the underlying data may not be loaded. DocumentService implementations won't load/subscribe to data unless there are
> subscriptions on the document or collection/records within the document.

> **Note:** All ref objects are stable, deduplicated automatically via weak ref caches. This means they are suitable for use as keys in maps, cache deps in react etc, as long as the application holds a ref it will never receive a duplicate.

## Internal Notes

### Document Services

DocumentService is an internal service used to implement connections to a backend.

- `DocumentService` - Abstract interface for document state management
- `BaseYjsDocumentService` - Base implementation using Yjs for real-time collaboration (_TODO:_ This will move out of state-core)
- `createInMemoryDocumentServiceConfig()` - Configuration for in-memory document service, useful for testing

## Internal Development Notes

- Use Symbols for meta fields on objects allows for iteration of keys without meta fields.
- Records should always be treated as having high cardinality. So prefer iterative approach to working with RecordCollections.
- Use method type interfaces / classes. Eg we do not want to instantiate bound methods for every record.
