/**
 * installer-security server use-case exports.
 *
 * @packageDocumentation
 * @category repositories
 * @since 0.0.0
 */

import { $InstallerSecurityUseCasesId } from "@beep/identity/packages";
import type { Effect } from "effect";
import { Context } from "effect";
import type * as S from "effect/Schema";
import type { SecretReferencePlan } from "./public.js";

const $I = $InstallerSecurityUseCasesId.create("server");

/**
 * Security use-case service shape.
 *
 * @category repositories
 * @since 0.0.0
 */
export interface InstallerSecurityUseCasesShape {
  readonly previewSecretReferences: () => Effect.Effect<SecretReferencePlan, S.SchemaError>;
}

/**
 * Security use-case service key.
 *
 * @category repositories
 * @since 0.0.0
 */
export class InstallerSecurityUseCases extends Context.Service<
  InstallerSecurityUseCases,
  InstallerSecurityUseCasesShape
>()($I`InstallerSecurityUseCases`) {}
