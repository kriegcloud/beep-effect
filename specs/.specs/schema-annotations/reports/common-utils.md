# Schema Annotations Audit: @beep/utils

## Summary
- Total Schemas Found: 14
- Annotated: 5
- Missing Annotations: 9

## Annotationless Schemas Checklist

### md5/worker.ts
- [ ] `src/md5/worker.ts:31` - `HashRequest` - S.TaggedRequest
- [ ] `src/md5/worker.ts:53` - `WorkerRequestSchema` - S.Union

### topo-sort/topo-sort.ts
- [ ] `src/topo-sort/topo-sort.ts:12` - `NodeId` - S.brand (Branded String)
- [ ] `src/topo-sort/topo-sort.ts:15` - `DirectedAcyclicGraph` - S.HashMap
- [ ] `src/topo-sort/topo-sort.ts:24` - `TaskList` - S.Array

### topo-sort/topo-sort.graph.ts
- [ ] `src/topo-sort/topo-sort.graph.ts:13` - `NodeId` - S.brand (Branded String)
- [ ] `src/topo-sort/topo-sort.graph.ts:16` - `DirectedAcyclicGraph` - S.HashMap
- [ ] `src/topo-sort/topo-sort.graph.ts:25` - `TaskList` - S.Array

## Properly Annotated Schemas

### md5/errors.ts (5 schemas - all annotated)
- [x] `src/md5/errors.ts:15` - `Md5ComputationError` - S.TaggedError (uses `$I.annotations`)
- [x] `src/md5/errors.ts:31` - `UnicodeEncodingError` - S.TaggedError (uses `$I.annotations`)
- [x] `src/md5/errors.ts:47` - `FileReadError` - S.TaggedError (uses `$I.annotations`)
- [x] `src/md5/errors.ts:63` - `BlobSliceError` - S.TaggedError (uses `$I.annotations`)
- [x] `src/md5/errors.ts:79` - `WorkerHashError` - S.TaggedError (uses `$I.annotations`)

## Notes

1. **Duplicate Schemas**: `NodeId`, `DirectedAcyclicGraph`, and `TaskList` are defined in both `topo-sort.ts` and `topo-sort.graph.ts`. Consider consolidating these definitions.

2. **Worker Request**: The `HashRequest` S.TaggedRequest and `WorkerRequestSchema` S.Union are missing annotations. These should use the `$I` identity pattern for consistency with the errors in the same module.

3. **Topo-sort Schemas**: All schemas in the topo-sort module lack annotations. These branded types and collection schemas would benefit from `title`, `description`, and `identifier` annotations for better JSON Schema generation and documentation.
