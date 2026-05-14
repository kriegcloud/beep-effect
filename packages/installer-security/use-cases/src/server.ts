/**
 * installer-security server use-case exports.
 *
 * @packageDocumentation
 * @category repositories
 * @since 0.0.0
 */

import { $InstallerSecurityUseCasesId } from "@beep/identity/packages";
import type { OnePasswordReference } from "@beep/shared-domain/values/OnePasswordReference";
import { Context, type Effect, type Redacted } from "effect";
import type * as S from "effect/Schema";
import type {
  SecretReferencePlan,
  SecretReferenceReadError,
  SecretReferenceValidationRequest,
  SecretReferenceValidationResult,
} from "./public.js";

const $I = $InstallerSecurityUseCasesId.create("server");

/**
 * Security use-case service shape.
 *
 * @category repositories
 * @since 0.0.0
 */
interface InstallerSecurityUseCasesShape {
  readonly previewSecretReferences: () => Effect.Effect<SecretReferencePlan, S.SchemaError>;
  readonly readSecretReference: (
    reference: OnePasswordReference
  ) => Effect.Effect<Redacted.Redacted<string>, S.SchemaError | SecretReferenceReadError>;
  readonly validateSecretReference: (
    request: SecretReferenceValidationRequest
  ) => Effect.Effect<SecretReferenceValidationResult, S.SchemaError>;
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
