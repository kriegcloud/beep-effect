/**
 * ViewMode Type Definition
 *
 * Add this before the MainContent function in page.tsx (around line 101)
 */

type ViewMode =
  | "workspace"
  | "calendar"
  | "email"
  | "knowledge-base"
  | "todos"
  | "people"
  | "tasks"
  | "files"
  | "heat-map";
