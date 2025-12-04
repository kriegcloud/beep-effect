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

export const { $BeepId: $I } = Identifier.make("beep");

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
  $SharedUiId,
  $SharedSdkId,
  $RepoScriptsId,
  $IamInfraId,
  $CoreEmailId,
  $DocumentsTablesId,
  $UiId,
  $CoreDbId,
  $InvariantId,
  $WebId,
  $SchemaId,
  $DocumentsDomainId,
  $ContractId,
  $RuntimeServerId,
  $IamSdkId,
  $IamUiId,
  $SharedInfraId,
  $IdentityId,
  $UtilsId,
  $IamDomainId,
  $RuntimeClientId,
  $ScratchpadId,
  $SharedTablesId,
  $MockId,
  $UiCoreId,
  $CoreEnvId,
  $ErrorsId,
  $TypesId,
  $BuildUtilsId,
  $DocumentsSdkId,
  $DocumentsUiId,
  $ConstantsId,
  $TestkitId,
  $ToolingUtilsId,
  $RepoCliId,
  $NotesId,
  $DocumentsInfraId,
  $ScraperId,
  $SharedDomainId,
  $DbAdminId,
  $ServerId,
  $IamTablesId,
} = $I.compose(
  "shared-ui",
  "shared-sdk",
  "repo-scripts",
  "iam-infra",
  "core-email",
  "documents-tables",
  "ui",
  "core-db",
  "invariant",
  "web",
  "schema",
  "documents-domain",
  "contract",
  "runtime-server",
  "iam-sdk",
  "iam-ui",
  "shared-infra",
  "identity",
  "utils",
  "iam-domain",
  "runtime-client",
  "scratchpad",
  "shared-tables",
  "mock",
  "ui-core",
  "core-env",
  "errors",
  "types",
  "build-utils",
  "documents-sdk",
  "documents-ui",
  "constants",
  "testkit",
  "tooling-utils",
  "repo-cli",
  "notes",
  "documents-infra",
  "scraper",
  "shared-domain",
  "db-admin",
  "server",
  "iam-tables"
);
