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
import * as Identifier from "./Identifier";

const { $BeepId } = Identifier.make("beep");

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
export const {
  $CommsDomainId,
  $SchemaId,
  $ErrorsId,
  $ConstantsId,
  $MockId,
  $ContractId,
  $SharedDomainId,
  $CoreDbId,
  $IamSdkId,
  $IamUiId,
  $FilesDomainId,
  $FilesInfraId,
  $FilesSdkId,
  $FilesUiId,
  $TasksDomainId,
  $TasksInfraId,
  $TasksSdkId,
  $TasksUiId,
  $RuntimeServerId,
  $RuntimeClientId,
  $DbAdminId,
  $WebId,
  $ServerId,
  $IamDomainId,
  $IntegrationsCoreId,
  $GoogleId,
  $PartyDomainId,
  $ThefrontId,
  $AiCoreId,
  $ToolingUtilsId,
  $EventId,
} = $BeepId.compose(
  "schema",
  "errors",
  "constants",
  "mock",
  "contract",
  "shared-domain",
  "core-db",
  "iam-sdk",
  "iam-ui",
  "iam-domain",
  "files-domain",
  "files-infra",
  "party-domain",
  "files-sdk",
  "files-ui",
  "tasks-domain",
  "tasks-infra",
  "tasks-sdk",
  "tasks-ui",
  "runtime-server",
  "runtime-client",
  "db-admin",
  "web",
  "server",
  "integrations-core",
  "google",
  "thefront",
  "ai-core",
  "tooling-utils",
  "event",
  "comms-domain"
);
