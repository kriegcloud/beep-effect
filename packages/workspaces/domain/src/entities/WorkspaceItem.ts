import * as Comment from "./Comment";
import * as Discussion from "./Discussion";
import * as DocumentFile from "./DocumentFile";
import * as DocumentSource from "./DocumentSource";
import * as DocumentVersion from "./DocumentVersion";
import * as Page from "./Document";
import type * as Workspace from "./Workspace";

/**
 * Workspace item taxonomy.
 */
export const WorkspaceItemKinds = {
  page: "page",
  file: "file",
  source: "source",
  discussion: "discussion",
  comment: "comment",
  snapshot: "snapshot",
} as const;

export type WorkspaceItemKind = (typeof WorkspaceItemKinds)[keyof typeof WorkspaceItemKinds];

export type PageRef = {
  readonly kind: "page";
  readonly id: typeof Page.Model.Type["id"];
};

export type FileRef = {
  readonly kind: "file";
  readonly id: typeof DocumentFile.Model.Type["id"];
};

export type SourceRef = {
  readonly kind: "source";
  readonly id: typeof DocumentSource.Model.Type["id"];
};

export type DiscussionRef = {
  readonly kind: "discussion";
  readonly id: typeof Discussion.Model.Type["id"];
};

export type CommentRef = {
  readonly kind: "comment";
  readonly id: typeof Comment.Model.Type["id"];
};

export type SnapshotRef = {
  readonly kind: "snapshot";
  readonly id: typeof DocumentVersion.Model.Type["id"];
};

export type WorkspaceItemRef = PageRef | FileRef | SourceRef | DiscussionRef | CommentRef | SnapshotRef;

export type WorkspaceItem = {
  readonly workspaceId: Workspace.WorkspaceId;
  readonly ref: WorkspaceItemRef;
};

/**
 * Transitional primary model/repo for rich-text page items.
 */
export type Model = typeof Page.Model.Type;
export const Model = Page.Model;

export type Repo = Page.Repo;
export const Repo = Page.Repo;

export const Contracts = Page.Contracts;
export const Rpcs = Page.Rpcs;
export const Http = Page.Http;
export const Toolkit = Page.Toolkit;
export const WorkspaceItemErrors = Page.PageErrors;

export const PageModel = Page.Model;
export const FileModel = DocumentFile.Model;
export const SourceModel = DocumentSource.Model;
export const DiscussionModel = Discussion.Model;
export const CommentModel = Comment.Model;
export const SnapshotModel = DocumentVersion.Model;

export const page = (id: PageRef["id"]): PageRef => ({ kind: WorkspaceItemKinds.page, id });
export const file = (id: FileRef["id"]): FileRef => ({ kind: WorkspaceItemKinds.file, id });
export const source = (id: SourceRef["id"]): SourceRef => ({ kind: WorkspaceItemKinds.source, id });
export const discussion = (id: DiscussionRef["id"]): DiscussionRef => ({ kind: WorkspaceItemKinds.discussion, id });
export const comment = (id: CommentRef["id"]): CommentRef => ({ kind: WorkspaceItemKinds.comment, id });
export const snapshot = (id: SnapshotRef["id"]): SnapshotRef => ({ kind: WorkspaceItemKinds.snapshot, id });

export const isWorkspaceItemKind = (value: string): value is WorkspaceItemKind =>
  value === WorkspaceItemKinds.page ||
  value === WorkspaceItemKinds.file ||
  value === WorkspaceItemKinds.source ||
  value === WorkspaceItemKinds.discussion ||
  value === WorkspaceItemKinds.comment ||
  value === WorkspaceItemKinds.snapshot;

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === "object" && value !== null;

export const isWorkspaceItemRef = (value: unknown): value is WorkspaceItemRef => {
  if (!isRecord(value)) return false;

  const kind = value.kind;
  const id = value.id;

  return typeof kind === "string" && typeof id === "string" && isWorkspaceItemKind(kind);
};
