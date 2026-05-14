/**
 * installer-workspace server use-case exports.
 *
 * @packageDocumentation
 * @category repositories
 * @since 0.0.0
 */

import { $InstallerWorkspaceUseCasesId } from "@beep/identity/packages";
import type { Effect } from "effect";
import { Context } from "effect";
import type * as S from "effect/Schema";
import type { WorkspaceDryRunPlan } from "./public.js";

const $I = $InstallerWorkspaceUseCasesId.create("server");

/**
 * Workspace use-case service shape.
 *
 * @category repositories
 * @since 0.0.0
 */
interface InstallerWorkspaceUseCasesShape {
  readonly previewWorkspace: () => Effect.Effect<WorkspaceDryRunPlan, S.SchemaError>;
}

/**
 * Workspace use-case service key.
 *
 * @category repositories
 * @since 0.0.0
 */
export class InstallerWorkspaceUseCases extends Context.Service<
  InstallerWorkspaceUseCases,
  InstallerWorkspaceUseCasesShape
>()($I`InstallerWorkspaceUseCases`) {}
