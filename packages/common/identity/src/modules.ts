/**
 * Canonical identity composers for every `@beep/*` workspace namespace.
 *
 * @example
 * import * as Identity from "@beep/identity";
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
 * import * as Identity from "@beep/identity";
 *
 * const schemaAnnotationsId = Identity.SchemaId.make("annotations");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const SchemaId: IdentityComposer<"@beep/schema"> = BeepId.module("schema");

/**
 * Identity composer for the `@beep/errors` namespace.
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const errorsAuthId = Identity.ErrorsId.make("AuthError");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const ErrorsId: IdentityComposer<"@beep/errors"> = BeepId.module("errors");

/**
 * Identity composer for the `@beep/constants` namespace.
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const currencyConstantId = Identity.ConstantsId.make("Currencies");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const ConstantsId: IdentityComposer<"@beep/constants"> = BeepId.module("constants");

/**
 * Identity composer for repo-wide mock fixtures under `@beep/mock`.
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const mockFixturesId = Identity.MockId.make("users");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const MockId: IdentityComposer<"@beep/mock"> = BeepId.module("mock");

/**
 * Identity composer for contract definitions under `@beep/contract`.
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const registerContractId = Identity.ContractId.compose("iam").make("register");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const ContractId: IdentityComposer<"@beep/contract"> = BeepId.module("contract");

/**
 * Identity composer for shared domain entities (`@beep/shared-domain`).
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const sharedDomainEntityId = Identity.SharedDomainId.compose("entities").make("Tenant");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const SharedDomainId: IdentityComposer<"@beep/shared-domain"> = BeepId.module("shared-domain");

/**
 * Identity composer for database infrastructure under `@beep/core-db`.
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const userRepoId = Identity.CoreDbId.compose("repos").make("UserRepo");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const CoreDbId: IdentityComposer<"@beep/core-db"> = BeepId.module("core-db");

/**
 * Identity composer for configuration helpers under `@beep/core-env`.
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const envLoaderId = Identity.CoreEnvId.make("server");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const CoreEnvId: IdentityComposer<"@beep/core-env"> = BeepId.module("core-env");

/**
 * Identity composer for core email utilities under `@beep/core-email`.
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const emailTemplateId = Identity.CoreEmailId.make("verifyEmail");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const CoreEmailId: IdentityComposer<"@beep/core-email"> = BeepId.module("core-email");

/**
 * Identity composer for design system primitives under `@beep/core-ui`.
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const primitiveId = Identity.CoreUiId.make("Accordion");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const CoreUiId: IdentityComposer<"@beep/core-ui"> = BeepId.module("core-ui");

/**
 * Identity composer for shared UI components in `@beep/ui`.
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const uiComponentId = Identity.UiId.make("Avatar");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const UiId: IdentityComposer<"@beep/ui"> = BeepId.module("ui");

/**
 * Identity composer for IAM domain models under `@beep/iam-domain`.
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const iamDomainEntityId = Identity.IamDomainId.compose("entities").make("Account");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const IamDomainId: IdentityComposer<"@beep/iam-domain"> = BeepId.module("iam-domain");

/**
 * Identity composer for IAM infrastructure (`@beep/iam-infra`).
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const iamInfraRepoId = Identity.IamInfraId.compose("repos").make("OrganizationRepo");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const IamInfraId: IdentityComposer<"@beep/iam-infra"> = BeepId.module("iam-infra");

/**
 * Identity composer for IAM SDK helpers under `@beep/iam-sdk`.
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const iamSdkFlowId = Identity.IamSdkId.make("AuthCallback");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const IamSdkId: IdentityComposer<"@beep/iam-sdk"> = BeepId.module("iam-sdk");

/**
 * Identity composer for IAM UI flows under `@beep/iam-ui`.
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const iamUiScreenId = Identity.IamUiId.make("VerifyEmail");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const IamUiId: IdentityComposer<"@beep/iam-ui"> = BeepId.module("iam-ui");

/**
 * Identity composer for Files domain value objects under `@beep/files-domain`.
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const filesDomainValueId = Identity.FilesDomainId.compose("entities").make("Upload");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const FilesDomainId: IdentityComposer<"@beep/files-domain"> = BeepId.module("files-domain");

/**
 * Identity composer for Files infrastructure layers under `@beep/files-infra`.
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const filesInfraServiceId = Identity.FilesInfraId.compose("services").make("Storage");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const FilesInfraId: IdentityComposer<"@beep/files-infra"> = BeepId.module("files-infra");

/**
 * Identity composer for Files SDK helpers under `@beep/files-sdk`.
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const filesSdkClientId = Identity.FilesSdkId.make("UploadClient");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const FilesSdkId: IdentityComposer<"@beep/files-sdk"> = BeepId.module("files-sdk");

/**
 * Identity composer for Files UI components under `@beep/files-ui`.
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const filesUiWidgetId = Identity.FilesUiId.make("Uploader");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const FilesUiId: IdentityComposer<"@beep/files-ui"> = BeepId.module("files-ui");

/**
 * Identity composer for Tasks domain models (`@beep/tasks-domain`).
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const tasksDomainModelId = Identity.TasksDomainId.make("Inbox");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const TasksDomainId: IdentityComposer<"@beep/tasks-domain"> = BeepId.module("tasks-domain");

/**
 * Identity composer for Tasks infrastructure layers (`@beep/tasks-infra`).
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const tasksInfraLayerId = Identity.TasksInfraId.make("QueueWorker");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const TasksInfraId: IdentityComposer<"@beep/tasks-infra"> = BeepId.module("tasks-infra");

/**
 * Identity composer for Tasks SDK helpers (`@beep/tasks-sdk`).
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const tasksSdkFlowId = Identity.TasksSdkId.make("CreateTask");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const TasksSdkId: IdentityComposer<"@beep/tasks-sdk"> = BeepId.module("tasks-sdk");

/**
 * Identity composer for Tasks UI components (`@beep/tasks-ui`).
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const tasksUiComponentId = Identity.TasksUiId.make("Board");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const TasksUiId: IdentityComposer<"@beep/tasks-ui"> = BeepId.module("tasks-ui");

/**
 * Identity composer for runtime server layers (`@beep/runtime-server`).
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const runtimeServerLayerId = Identity.RuntimeServerId.make("ManagedRuntime");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const RuntimeServerId: IdentityComposer<"@beep/runtime-server"> = BeepId.module("runtime-server");

/**
 * Identity composer for runtime client layers (`@beep/runtime-client`).
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const runtimeClientLayerId = Identity.RuntimeClientId.make("HydrationLayer");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const RuntimeClientId: IdentityComposer<"@beep/runtime-client"> = BeepId.module("runtime-client");

/**
 * Identity composer for admin database tooling (`@beep/db-admin`).
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const dbAdminJobId = Identity.DbAdminId.make("drizzleSync");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const DbAdminId: IdentityComposer<"@beep/db-admin"> = BeepId.module("db-admin");

/**
 * Identity composer for Next.js application code (`@beep/web`).
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const webFeatureId = Identity.WebId.make("Dashboard");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const WebId: IdentityComposer<"@beep/web"> = BeepId.module("web");

/**
 * Identity composer for the bootstrap client (`@beep/start-client`).
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const startClientRuntimeId = Identity.StartClientId.make("bootstrap");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const StartClientId: IdentityComposer<"@beep/start-client"> = BeepId.module("start-client");

/**
 * Identity composer for the `@beep/server` runtime entrypoint.
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const serverBootstrapId = Identity.ServerId.make("bootstrap");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export const ServerId: IdentityComposer<"@beep/server"> = BeepId.module("server");
