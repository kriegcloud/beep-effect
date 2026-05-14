/**
 * installer-dependencies server use-case exports.
 *
 * @packageDocumentation
 * @category repositories
 * @since 0.0.0
 */

import { $InstallerDependenciesUseCasesId } from "@beep/identity/packages";
import type { Effect } from "effect";
import { Context } from "effect";
import type * as S from "effect/Schema";
import type { HostDependencyPlan, HostDependencyValidationResult } from "./public.js";

const $I = $InstallerDependenciesUseCasesId.create("server");

/**
 * Dependency use-case service shape.
 *
 * @category repositories
 * @since 0.0.0
 */
interface InstallerDependenciesUseCasesShape {
  readonly previewHostDependencies: () => Effect.Effect<HostDependencyPlan, S.SchemaError>;
  readonly validateRequiredCommands: () => Effect.Effect<ReadonlyArray<HostDependencyValidationResult>, S.SchemaError>;
}

/**
 * Dependency use-case service key.
 *
 * @category repositories
 * @since 0.0.0
 */
export class InstallerDependenciesUseCases extends Context.Service<
  InstallerDependenciesUseCases,
  InstallerDependenciesUseCasesShape
>()($I`InstallerDependenciesUseCases`) {}
