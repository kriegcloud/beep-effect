/**
 * installer-providers server use-case exports.
 *
 * @packageDocumentation
 * @category repositories
 * @since 0.0.0
 */

import { $InstallerProvidersUseCasesId } from "@beep/identity/packages";
import type { Effect } from "effect";
import { Context } from "effect";
import type * as S from "effect/Schema";
import type { ProviderAccountPlan, ProviderAuthValidationResult } from "./public.js";

const $I = $InstallerProvidersUseCasesId.create("server");

/**
 * Provider use-case service shape.
 *
 * @category repositories
 * @since 0.0.0
 */
interface InstallerProvidersUseCasesShape {
  readonly previewProviderAccounts: () => Effect.Effect<ProviderAccountPlan, S.SchemaError>;
  readonly validateProviderAuths: () => Effect.Effect<ReadonlyArray<ProviderAuthValidationResult>, S.SchemaError>;
}

/**
 * Provider use-case service key.
 *
 * @category repositories
 * @since 0.0.0
 */
export class InstallerProvidersUseCases extends Context.Service<
  InstallerProvidersUseCases,
  InstallerProvidersUseCasesShape
>()($I`InstallerProvidersUseCases`) {}
