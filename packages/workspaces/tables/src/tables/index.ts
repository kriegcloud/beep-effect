export * from "@beep/shared-tables/tables/organization.table";
export * from "@beep/shared-tables/tables/team.table";
export * from "@beep/shared-tables/tables/user.table";
export * from "./comment.table";
export * from "./discussion.table";
export * from "./document.table";
export * from "./document-file.table";
export * from "./document-source.table";
export * from "./document-version.table";
export * from "./page.table";

/**
 * Workspace-first aliases backed by existing table definitions.
 */
export { comment as workspaceComment } from "./comment.table";
export { discussion as workspaceDiscussion } from "./discussion.table";
export { document as workspacePage } from "./document.table";
export { documentFile as workspaceFile } from "./document-file.table";
export { documentSource as workspaceSourceLink } from "./document-source.table";
export { documentVersion as workspaceSnapshot } from "./document-version.table";
export { page as workspace } from "./page.table";
