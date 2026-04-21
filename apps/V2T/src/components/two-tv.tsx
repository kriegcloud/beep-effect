/**
 * Route-level V2T workspace page.
 *
 * @module
 * @since 0.0.0
 */
import type * as React from "react";
import { V2TWorkspaceShell } from "./workspace-shell.tsx";

/**
 * Render the V2T workspace as the route page.
 *
 * @example
 * ```tsx
 * import { TwoTvPage } from "@beep/v2t"
 *
 * const Route = () => <TwoTvPage />
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const TwoTvPage: React.FC = () => <V2TWorkspaceShell />;

export { V2TWorkspaceShell };
