/**
 * TypeScript types for workspace data structures.
 *
 * These represent the UI-facing shape of workspace entities.
 * Once the domain layer matures, these will be replaced by
 * proper Effect Schema types from `@beep/workspaces-domain`.
 */

export type WorkspacePage = {
  readonly id: string;
  readonly title: string;
  readonly icon?: string;
  readonly children?: ReadonlyArray<WorkspacePage>;
};

export type Workspace = {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly pages: ReadonlyArray<WorkspacePage>;
};
