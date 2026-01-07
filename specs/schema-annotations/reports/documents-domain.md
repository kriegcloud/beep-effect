# Schema Annotations Audit: @beep/documents-domain

## Summary
- Total Schemas Found: 21
- Annotated: 19
- Missing Annotations: 2

## Fully Annotated Schemas

### M.Class Models (5)
All M.Class models are properly annotated with `$I.annotations()`:

- `src/entities/Comment/Comment.model.ts:16` - `Model` (CommentModel) - M.Class
- `src/entities/Discussion/Discussion.model.ts:16` - `Model` (DiscussionModel) - M.Class
- `src/entities/Document/Document.model.ts:17` - `Model` (DocumentModel) - M.Class
- `src/entities/DocumentFile/DocumentFile.model.ts:16` - `Model` (DocumentFileModel) - M.Class
- `src/entities/DocumentVersion/DocumentVersion.model.ts:16` - `Model` (DocumentVersionModel) - M.Class

### S.TaggedError Classes (13)
All S.TaggedError classes are properly annotated with `$I.annotations()`:

- `src/entities/Comment/Comment.errors.ts:11` - `CommentNotFoundError` - S.TaggedError
- `src/entities/Comment/Comment.errors.ts:27` - `CommentPermissionDeniedError` - S.TaggedError
- `src/entities/Comment/Comment.errors.ts:44` - `CommentTooLongError` - S.TaggedError
- `src/entities/Discussion/Discussion.errors.ts:11` - `DiscussionNotFoundError` - S.TaggedError
- `src/entities/Discussion/Discussion.errors.ts:25` - `DiscussionPermissionDeniedError` - S.TaggedError
- `src/entities/Discussion/Discussion.errors.ts:39` - `DiscussionAlreadyResolvedError` - S.TaggedError
- `src/entities/Discussion/Discussion.errors.ts:53` - `DiscussionNotResolvedError` - S.TaggedError
- `src/entities/Document/Document.errors.ts:11` - `DocumentNotFoundError` - S.TaggedError
- `src/entities/Document/Document.errors.ts:25` - `DocumentPermissionDeniedError` - S.TaggedError
- `src/entities/Document/Document.errors.ts:39` - `DocumentArchivedError` - S.TaggedError
- `src/entities/Document/Document.errors.ts:53` - `DocumentLockedError` - S.TaggedError
- `src/entities/Document/Document.errors.ts:67` - `DocumentAlreadyPublishedError` - S.TaggedError
- `src/entities/Document/Document.errors.ts:81` - `DocumentNotPublishedError` - S.TaggedError

### Value Objects (2)
All value objects are properly annotated via `BS.StringLiteralKit.annotations()`:

- `src/value-objects/LinkType.ts:3` - `LinkType` - BS.StringLiteralKit
- `src/value-objects/TextStyle.ts:3` - `TextStyle` - BS.StringLiteralKit

## Annotationless Schemas Checklist

The following schemas are missing annotations and should be reviewed:

- [ ] `src/entities/Discussion/Discussion.rpc.ts:16` - `DiscussionWithComments` - S.Struct (inline schema for RPC response)
- [ ] `src/entities/Document/Document.rpc.ts:11` - `SearchResult` - S.Struct (inline schema for search results)

## Excluded Items

### Data.TaggedError (Non-Schema Errors)
The following use `Data.TaggedError` (not `S.TaggedError`) and are runtime-only error types without schema serialization:

- `src/errors.ts:3` - `MetadataParseError` - Data.TaggedError
- `src/errors.ts:12` - `FileReadError` - Data.TaggedError

### RpcGroup Classes
RPC group classes are container definitions and don't require annotations:

- `src/entities/Comment/Comment.rpc.ts:12` - `Rpcs` - RpcGroup.make
- `src/entities/Discussion/Discussion.rpc.ts:31` - `Rpcs` - RpcGroup.make
- `src/entities/Document/Document.rpc.ts:20` - `Rpcs` - RpcGroup.make

### Union Types
These are composed of already-annotated schemas:

- `src/entities/Comment/Comment.errors.ts:61` - `Errors` - S.Union
- `src/entities/Discussion/Discussion.errors.ts:67` - `Errors` - S.Union
- `src/entities/Document/Document.errors.ts:95` - `Errors` - S.Union

## Notes

1. **Outstanding Items**: The two missing annotation schemas (`DiscussionWithComments` and `SearchResult`) are inline S.Struct schemas used for RPC responses. These would benefit from annotations for better OpenAPI documentation and schema introspection.

2. **Pattern Compliance**: The codebase consistently uses the `$I` identity pattern (`$DocumentsDomainId.create(...)`) for generating annotations, which provides traceable schema identifiers.

3. **Data.TaggedError vs S.TaggedError**: The errors in `src/errors.ts` use `Data.TaggedError` rather than `S.TaggedError`. This is intentional for errors that don't need serialization, but worth noting as they won't appear in generated API schemas.
