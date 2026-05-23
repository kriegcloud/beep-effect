/**
 * Installer server use-case exports.
 *
 * @packageDocumentation
 * @category repositories
 * @since 0.0.0
 */

import { $InstallerUseCasesId } from "@beep/identity/packages";
import { Context } from "effect";
import type { OnePasswordReference } from "@beep/shared-domain/values/OnePasswordReference";
import type { Effect, Redacted } from "effect";
import type * as S from "effect/Schema";
import type {
  DiscordChannelPlan,
  DiscordLiveValidationRequest,
  DiscordLiveValidationResult,
  HostDependencyPlan,
  HostDependencyValidationResult,
  P1ManualProofRequest,
  P1ManualProofResult,
  ProviderAccountPlan,
  ProviderAuthValidationResult,
  SecretReferencePlan,
  SecretReferenceReadError,
  SecretReferenceValidationRequest,
  SecretReferenceValidationResult,
  WorkspaceDryRunPlan,
} from "./public.js";

const $I = $InstallerUseCasesId.create("server");

/**
 * Host dependency use-case service shape.
 *
 * @category repositories
 * @since 0.0.0
 */
interface HostDependencyUseCasesShape {
  readonly previewHostDependencies: Effect.Effect<HostDependencyPlan, S.SchemaError>;
  readonly validateRequiredCommands: Effect.Effect<ReadonlyArray<HostDependencyValidationResult>, S.SchemaError>;
}

/**
 * Host dependency use-case service key.
 *
 * @category repositories
 * @since 0.0.0
 */
export class HostDependencyUseCases extends Context.Service<HostDependencyUseCases, HostDependencyUseCasesShape>()(
  $I`HostDependencyUseCases`
) {}

/**
 * Secret reference use-case service shape.
 *
 * @category repositories
 * @since 0.0.0
 */
interface SecretReferenceUseCasesShape {
  readonly previewSecretReferences: Effect.Effect<SecretReferencePlan, S.SchemaError>;
  readonly readSecretReference: (
    reference: OnePasswordReference
  ) => Effect.Effect<Redacted.Redacted, S.SchemaError | SecretReferenceReadError>;
  readonly validateSecretReference: (
    request: SecretReferenceValidationRequest
  ) => Effect.Effect<SecretReferenceValidationResult, S.SchemaError>;
}

/**
 * Secret reference use-case service key.
 *
 * @category repositories
 * @since 0.0.0
 */
export class SecretReferenceUseCases extends Context.Service<SecretReferenceUseCases, SecretReferenceUseCasesShape>()(
  $I`SecretReferenceUseCases`
) {}

/**
 * Provider account use-case service shape.
 *
 * @category repositories
 * @since 0.0.0
 */
interface ProviderAccountUseCasesShape {
  readonly previewProviderAccounts: Effect.Effect<ProviderAccountPlan, S.SchemaError>;
  readonly validateProviderAuths: Effect.Effect<ReadonlyArray<ProviderAuthValidationResult>, S.SchemaError>;
}

/**
 * Provider account use-case service key.
 *
 * @category repositories
 * @since 0.0.0
 */
export class ProviderAccountUseCases extends Context.Service<ProviderAccountUseCases, ProviderAccountUseCasesShape>()(
  $I`ProviderAccountUseCases`
) {}

/**
 * Discord channel use-case service shape.
 *
 * @category repositories
 * @since 0.0.0
 */
interface DiscordChannelUseCasesShape {
  readonly previewDiscordChannels: Effect.Effect<DiscordChannelPlan, S.SchemaError>;
  readonly validateDiscordChannel: (
    request: DiscordLiveValidationRequest,
    botToken: Redacted.Redacted
  ) => Effect.Effect<DiscordLiveValidationResult, S.SchemaError>;
}

/**
 * Discord channel use-case service key.
 *
 * @category repositories
 * @since 0.0.0
 */
export class DiscordChannelUseCases extends Context.Service<DiscordChannelUseCases, DiscordChannelUseCasesShape>()(
  $I`DiscordChannelUseCases`
) {}

/**
 * Stack manifest use-case service shape.
 *
 * @category repositories
 * @since 0.0.0
 */
interface StackManifestUseCasesShape {
  readonly previewWorkspace: Effect.Effect<WorkspaceDryRunPlan, S.SchemaError>;
}

/**
 * Stack manifest use-case service key.
 *
 * @category repositories
 * @since 0.0.0
 */
export class StackManifestUseCases extends Context.Service<StackManifestUseCases, StackManifestUseCasesShape>()(
  $I`StackManifestUseCases`
) {}

/**
 * P1 Manual Mode proof workflow service shape.
 *
 * @category workflows
 * @since 0.0.0
 */
interface P1ManualProofWorkflowShape {
  readonly preview: (request: P1ManualProofRequest) => Effect.Effect<P1ManualProofResult, S.SchemaError>;
  readonly run: (
    request: P1ManualProofRequest
  ) => Effect.Effect<P1ManualProofResult, S.SchemaError | SecretReferenceReadError>;
}

/**
 * P1 Manual Mode proof workflow service key.
 *
 * @category workflows
 * @since 0.0.0
 */
export class P1ManualProofWorkflow extends Context.Service<P1ManualProofWorkflow, P1ManualProofWorkflowShape>()(
  $I`P1ManualProofWorkflow`
) {}
