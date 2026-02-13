import * as WorkspaceContainerPage from "./Page";

/**
 * Workspace container entity.
 *
 * Semantic mapping:
 * - `Workspace` is backed by the legacy `Page` entity.
 * - A workspace container is identified by `type: "workspace"`.
 */
export type Model = typeof WorkspaceContainerPage.Model.Type;
export const Model = WorkspaceContainerPage.Model;

export type Repo = WorkspaceContainerPage.Repo;
export const Repo = WorkspaceContainerPage.Repo;

export const Entity = WorkspaceContainerPage.Entity;
export const Contracts = WorkspaceContainerPage.Contracts;
export const Rpcs = WorkspaceContainerPage.Rpcs;
export const Http = WorkspaceContainerPage.Http;
export const Toolkit = WorkspaceContainerPage.Toolkit;
export const WorkspaceErrors = WorkspaceContainerPage.PageErrors;

export type WorkspaceId = Model["id"];

export const WorkspaceType = "workspace" as const;
export type WorkspaceType = typeof WorkspaceType;

export const isWorkspace = (value: Model): value is Model & { readonly type: WorkspaceType } =>
  value.type === WorkspaceType;
