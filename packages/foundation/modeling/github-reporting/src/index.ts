/**
 * GitHub check-run reporting as Effect schemas: check states and their
 * check-run projection, marker-delimited managed documents, and the
 * debounced check document reconciler.
 *
 * **Details**
 *
 * The GitHub-flavored Markdown writer is subpath-only:
 * import it from `@beep/github-reporting/GitHubMarkdown`. It is the
 * package's only importer of `@beep/markdown`, so a consumer of this root
 * entry point never links the markdown engine.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

export {
  CheckDocument,
  CheckDocumentError,
  type CheckDocumentOptions,
  type CheckDocumentShape,
  type CheckDocumentSink,
  CheckDocumentSnapshot,
  CheckDocumentStamp,
  CheckFlushOutcome,
  CheckReport,
} from "./CheckDocument.ts";
export {
  CheckRunCompleted,
  CheckRunConclusion,
  CheckRunInProgress,
  CheckRunProjection,
  CheckState,
  projectCheckState,
  UnhandledCheckStateError,
} from "./CheckState.ts";
export {
  ManagedDocument,
  ManagedDocumentError,
  ManagedDocumentSource,
  RejectedRegionDialectError,
} from "./ManagedDocument.ts";
