# Schema Annotations Audit: @beep/documents-server

## Summary
- Total Schemas Found: 7
- Annotated: 0
- Missing Annotations: 7

## Annotationless Schemas Checklist

- [ ] `src/db/repos/Discussion.repo.ts:19` - `DiscussionWithCommentsSchema` - S.Struct
- [ ] `src/db/repos/Document.repo.ts:16` - `SearchResultSchema` - S.Struct
- [ ] `src/db/repos/Document.repo.ts:24` - `SearchRequest` - S.Struct
- [ ] `src/db/repos/DocumentVersion.repo.ts:24` - `VersionWithAuthorSchema` - S.Struct
- [ ] `src/db/repos/DocumentFile.repo.ts:17` - `FileNotFoundError` - Data.TaggedError
- [ ] `src/db/repos/DocumentVersion.repo.ts:17` - `VersionNotFoundError` - Data.TaggedError

## Notes

### Excluded Items

The following were intentionally excluded from this audit:

1. **Re-exports**: Files like `index.ts` that only re-export from other packages
2. **Service definitions**: `Effect.Service` definitions (e.g., `CommentRepo`, `DiscussionRepo`, `DocumentRepo`, `DocumentFileRepo`, `DocumentVersionRepo`, `ExifToolService`, `PdfMetadataService`, `StorageService`, `Db`) - these are runtime services, not schema definitions
3. **Context.Tag definitions**: `Db` class using `Context.Tag` - this is a service tag, not a schema
4. **Handler definitions**: RPC handler layers (`CommentHandlersLive`, `DiscussionHandlersLive`, `DocumentHandlersLive`) - these implement contracts defined elsewhere
5. **Type-only exports**: `type Shape`, `type DiscussionWithComments`, `type VersionWithAuthor`, etc.

### Schema Analysis

1. **DiscussionWithCommentsSchema** (`src/db/repos/Discussion.repo.ts:19`)
   - Complex struct combining Discussion model fields with nested author and comments
   - Used for database query result decoding
   - Missing: title, description, identifier annotations

2. **SearchResultSchema** (`src/db/repos/Document.repo.ts:16`)
   - Struct for full-text search results with id, title, content, rank
   - Used in SqlSchema.findAll for search query results
   - Missing: title, description annotations

3. **SearchRequest** (`src/db/repos/Document.repo.ts:24`)
   - Request schema for document search parameters
   - Used in SqlSchema.findAll for search query input
   - Missing: title, description annotations

4. **VersionWithAuthorSchema** (`src/db/repos/DocumentVersion.repo.ts:24`)
   - Struct combining DocumentVersion model fields with author info
   - Used for database query result decoding
   - Missing: title, description, identifier annotations

5. **FileNotFoundError** (`src/db/repos/DocumentFile.repo.ts:17`)
   - Uses `Data.TaggedError` instead of `S.TaggedError`
   - Consider migrating to `S.TaggedError` for consistent schema-based error handling
   - Missing: title, description annotations (if migrated to S.TaggedError)

6. **VersionNotFoundError** (`src/db/repos/DocumentVersion.repo.ts:17`)
   - Uses `Data.TaggedError` instead of `S.TaggedError`
   - Consider migrating to `S.TaggedError` for consistent schema-based error handling
   - Missing: title, description annotations (if migrated to S.TaggedError)

### Recommendations

1. Add `.annotations()` to all S.Struct declarations with appropriate `title` and `description` fields
2. Consider migrating `Data.TaggedError` usages to `S.TaggedError` for consistency with the codebase pattern seen in documents-domain
3. For schemas used in database operations, consider adding `identifier` annotations to aid debugging and tracing
