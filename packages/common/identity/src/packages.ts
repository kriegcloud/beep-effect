/**
 * Canonical identity composers for every `@beep/*` workspace namespace.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const schemaTenantId = Identity.SchemaId.compose("entities").make("Tenant");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
import { BeepId } from "./BeepId";
import type { IdentityComposer } from "./types";

/**
 * Identity composer for the `@beep/schema` namespace.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const schemaAnnotationsId = Identity.SchemaId.make("annotations");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const SchemaId: IdentityComposer<"@beep/schema"> = BeepId.package("schema");

/**
 * Identity composer for the `@beep/errors` namespace.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const errorsAuthId = Identity.ErrorsId.make("AuthError");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const ErrorsId: IdentityComposer<"@beep/errors"> = BeepId.package("errors");

/**
 * Identity composer for the `@beep/constants` namespace.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const currencyConstantId = Identity.ConstantsId.make("Currencies");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const ConstantsId: IdentityComposer<"@beep/constants"> = BeepId.package("constants");

/**
 * Identity composer for repo-wide mock fixtures under `@beep/mock`.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const mockFixturesId = Identity.MockId.make("users");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const MockId: IdentityComposer<"@beep/mock"> = BeepId.package("mock");

/**
 * Identity composer for contract definitions under `@beep/contract`.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const registerContractId = Identity.ContractId.compose("iam").make("register");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const ContractId: IdentityComposer<"@beep/contract"> = BeepId.package("contract");

/**
 * Identity composer for shared domain entities (`@beep/shared-domain`).
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const sharedDomainEntityId = Identity.SharedDomainId.compose("entities").make("Tenant");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const SharedDomainId: IdentityComposer<"@beep/shared-domain"> = BeepId.package("shared-domain");

/**
 * Identity composer for database infrastructure under `@beep/core-db`.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const userRepoId = Identity.CoreDbId.compose("repos").make("UserRepo");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const CoreDbId: IdentityComposer<"@beep/core-db"> = BeepId.package("core-db");

/**
 * Identity composer for configuration helpers under `@beep/core-env`.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const envLoaderId = Identity.CoreEnvId.make("server");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const CoreEnvId: IdentityComposer<"@beep/core-env"> = BeepId.package("core-env");

/**
 * Identity composer for core email utilities under `@beep/core-email`.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const emailTemplateId = Identity.CoreEmailId.make("verifyEmail");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const CoreEmailId: IdentityComposer<"@beep/core-email"> = BeepId.package("core-email");

/**
 * Identity composer for design system primitives under `@beep/core-ui`.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const primitiveId = Identity.CoreUiId.make("Accordion");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const CoreUiId: IdentityComposer<"@beep/core-ui"> = BeepId.package("core-ui");

/**
 * Identity composer for shared UI components in `@beep/ui`.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const uiComponentId = Identity.UiId.make("Avatar");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const UiId: IdentityComposer<"@beep/ui"> = BeepId.package("ui");

/**
 * Identity composer for IAM domain models under `@beep/iam-domain`.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const iamDomainEntityId = Identity.IamDomainId.compose("entities").make("Account");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const IamDomainId: IdentityComposer<"@beep/iam-domain"> = BeepId.package("iam-domain");

/**
 * Identity composer for IAM infrastructure (`@beep/iam-infra`).
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const iamInfraRepoId = Identity.IamInfraId.compose("repos").make("OrganizationRepo");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const IamInfraId: IdentityComposer<"@beep/iam-infra"> = BeepId.package("iam-infra");

/**
 * Identity composer for IAM SDK helpers under `@beep/iam-sdk`.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const iamSdkFlowId = Identity.IamSdkId.make("AuthCallback");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const IamSdkId: IdentityComposer<"@beep/iam-sdk"> = BeepId.package("iam-sdk");

/**
 * Identity composer for IAM UI flows under `@beep/iam-ui`.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const iamUiScreenId = Identity.IamUiId.make("VerifyEmail");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const IamUiId: IdentityComposer<"@beep/iam-ui"> = BeepId.package("iam-ui");

/**
 * Identity composer for Files domain value objects under `@beep/files-domain`.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const filesDomainValueId = Identity.FilesDomainId.compose("entities").make("Upload");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const FilesDomainId: IdentityComposer<"@beep/files-domain"> = BeepId.package("files-domain");

/**
 * Identity composer for Files infrastructure layers under `@beep/files-infra`.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const filesInfraServiceId = Identity.FilesInfraId.compose("services").make("Storage");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const FilesInfraId: IdentityComposer<"@beep/files-infra"> = BeepId.package("files-infra");

/**
 * Identity composer for Files SDK helpers under `@beep/files-sdk`.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const filesSdkClientId = Identity.FilesSdkId.make("UploadClient");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const FilesSdkId: IdentityComposer<"@beep/files-sdk"> = BeepId.package("files-sdk");

/**
 * Identity composer for Files UI components under `@beep/files-ui`.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const filesUiWidgetId = Identity.FilesUiId.make("Uploader");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const FilesUiId: IdentityComposer<"@beep/files-ui"> = BeepId.package("files-ui");

/**
 * Identity composer for Tasks domain models (`@beep/tasks-domain`).
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const tasksDomainModelId = Identity.TasksDomainId.make("Inbox");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const TasksDomainId: IdentityComposer<"@beep/tasks-domain"> = BeepId.package("tasks-domain");

/**
 * Identity composer for Tasks infrastructure layers (`@beep/tasks-infra`).
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const tasksInfraLayerId = Identity.TasksInfraId.make("QueueWorker");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const TasksInfraId: IdentityComposer<"@beep/tasks-infra"> = BeepId.package("tasks-infra");

/**
 * Identity composer for Tasks SDK helpers (`@beep/tasks-sdk`).
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const tasksSdkFlowId = Identity.TasksSdkId.make("CreateTask");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const TasksSdkId: IdentityComposer<"@beep/tasks-sdk"> = BeepId.package("tasks-sdk");

/**
 * Identity composer for Tasks UI components (`@beep/tasks-ui`).
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const tasksUiComponentId = Identity.TasksUiId.make("Board");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const TasksUiId: IdentityComposer<"@beep/tasks-ui"> = BeepId.package("tasks-ui");

/**
 * Identity composer for runtime server layers (`@beep/runtime-server`).
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const runtimeServerLayerId = Identity.RuntimeServerId.make("ManagedRuntime");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const RuntimeServerId: IdentityComposer<"@beep/runtime-server"> = BeepId.package("runtime-server");

/**
 * Identity composer for runtime client layers (`@beep/runtime-client`).
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const runtimeClientLayerId = Identity.RuntimeClientId.make("HydrationLayer");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const RuntimeClientId: IdentityComposer<"@beep/runtime-client"> = BeepId.package("runtime-client");

/**
 * Identity composer for admin database tooling (`@beep/db-admin`).
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const dbAdminJobId = Identity.DbAdminId.make("drizzleSync");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const DbAdminId: IdentityComposer<"@beep/db-admin"> = BeepId.package("db-admin");

/**
 * Identity composer for Next.js application code (`@beep/web`).
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const webFeatureId = Identity.WebId.make("Dashboard");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const WebId: IdentityComposer<"@beep/web"> = BeepId.package("web");

/**
 * Identity composer for the bootstrap client (`@beep/start-client`).
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const startClientRuntimeId = Identity.StartClientId.make("bootstrap");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const StartClientId: IdentityComposer<"@beep/start-client"> = BeepId.package("start-client");

/**
 * Identity composer for the `@beep/server` runtime entrypoint.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const serverBootstrapId = Identity.ServerId.make("bootstrap");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const ServerId: IdentityComposer<"@beep/server"> = BeepId.package("server");

/**
 * Identity composer for the `@beep/integrations-core` runtime entrypoint.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const integrationsCoreBootstrapId = Identity.IntegrationsCoreId.make("bootstrap");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const IntegrationsCoreId: IdentityComposer<"@beep/integrations-core"> = BeepId.package("integrations-core");

/**
 * Identity composer for the `@beep/google` runtime entrypoint.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const googleBootstrapId = Identity.GoogleId.make("bootstrap");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const GoogleId: IdentityComposer<"@beep/google"> = BeepId.package("google");

/**
 * Identity composer for the `@beep/thefront` runtime entrypoint.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const thefrontId = Identity.TheFrontId.make("bootstrap");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const TheFrontId: IdentityComposer<"@beep/thefront"> = BeepId.package("thefront");

/**
 * Identity composer for the `@beep/thefront` runtime entrypoint.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const AICoreId = Identity.AICoreId.make("bootstrap");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const AICoreId: IdentityComposer<"@beep/thefront"> = BeepId.package("thefront");

/**
 * Identity composer for the `@beep/thefront` runtime entrypoint.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const AICoreId = Identity.AICoreId.make("bootstrap");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const ToolingUtilsId: IdentityComposer<"@beep/tooling-utils"> = BeepId.package("tooling-utils");

/**
 * Identity composer for the `@beep/thefront` runtime entrypoint.
 *
 * @example
 * import * as Identity from "@beep/identity/modules";
 *
 * const AICoreId = Identity.AICoreId.make("bootstrap");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const EventId: IdentityComposer<"@beep/event"> = BeepId.package("event");
