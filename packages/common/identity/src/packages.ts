/**
 * Canonical identity composers for every `@beep/*` workspace namespace.
 *
 * @since 0.1.0
 */
import * as Identifier from "./Identifier";

/**
 * Root identity composer for the `@beep` namespace.
 *
 * @example
 * ```typescript
 * import { $I } from "@beep/identity/packages"
 *
 * const customId = $I.create("custom-package").make("CustomService")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $I = Identifier.make("beep").$BeepId;

const composers = $I.compose(
  "shared-ui",
  "shared-client",
  "repo-cli",
  "iam-server",
  "repo-scripts",
  "todox",
  "documents-tables",
  "ui",
  "invariant",
  "build-utils",
  "server",
  "web",
  "schema",
  "documents-domain",
  "contract",
  "runtime-server",
  "iam-client",
  "iam-ui",
  "shared-server",
  "identity",
  "utils",
  "iam-domain",
  "runtime-client",
  "shared-tables",
  "ui-core",
  "errors",
  "documents-client",
  "documents-ui",
  "constants",
  "testkit",
  "tooling-utils",
  "documents-server",
  "shared-domain",
  "db-admin",
  "iam-tables",
  "customization-domain",
  "customization-tables",
  "customization-server",
  "customization-client",
  "customization-ui",
  "comms-domain",
  "comms-tables",
  "comms-server",
  "comms-client",
  "comms-ui"
);

/**
 * Identity composer for the `@beep/shared-ui` namespace.
 *
 * @example
 * ```typescript
 * import { $SharedUiId } from "@beep/identity/packages"
 *
 * const componentId = $SharedUiId.make("Button")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $SharedUiId = composers.$SharedUiId;

/**
 * Identity composer for the `@beep/shared-client` namespace.
 *
 * @example
 * ```typescript
 * import { $SharedClientId } from "@beep/identity/packages"
 *
 * const contractId = $SharedClientId.make("ApiContract")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $SharedClientId = composers.$SharedClientId;

/**
 * Identity composer for the `@beep/repo-scripts` namespace.
 *
 * @example
 * ```typescript
 * import { $RepoScriptsId } from "@beep/identity/packages"
 *
 * const scriptId = $RepoScriptsId.make("Bootstrap")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $RepoScriptsId = composers.$RepoScriptsId;

/**
 * Identity composer for the `@beep/iam-server` namespace.
 *
 * @example
 * ```typescript
 * import { $IamServerId } from "@beep/identity/packages"
 *
 * const repoId = $IamServerId.make("UserRepository")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $IamServerId = composers.$IamServerId;

/**
 * Identity composer for the `@beep/documents-tables` namespace.
 *
 * @example
 * ```typescript
 * import { $DocumentsTablesId } from "@beep/identity/packages"
 *
 * const tableId = $DocumentsTablesId.make("DocumentsTable")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $DocumentsTablesId = composers.$DocumentsTablesId;

/**
 * Identity composer for the `@beep/ui` namespace.
 *
 * @example
 * ```typescript
 * import { $UiId } from "@beep/identity/packages"
 *
 * const componentId = $UiId.make("Card")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $UiId = composers.$UiId;

/**
 * Identity composer for the `@beep/invariant` namespace.
 *
 * @example
 * ```typescript
 * import { $InvariantId } from "@beep/identity/packages"
 *
 * const errorId = $InvariantId.make("AssertionError")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $InvariantId = composers.$InvariantId;

/**
 * Identity composer for the `@beep/web` namespace.
 *
 * @example
 * ```typescript
 * import { $WebId } from "@beep/identity/packages"
 *
 * const pageId = $WebId.make("HomePage")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $WebId = composers.$WebId;

/**
 * Identity composer for the `@beep/schema` namespace.
 *
 * @example
 * ```typescript
 * import { $SchemaId } from "@beep/identity/packages"
 *
 * const entityId = $SchemaId.make("TenantSchema")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $SchemaId = composers.$SchemaId;

/**
 * Identity composer for the `@beep/documents-domain` namespace.
 *
 * @example
 * ```typescript
 * import { $DocumentsDomainId } from "@beep/identity/packages"
 *
 * const entityId = $DocumentsDomainId.make("Document")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $DocumentsDomainId = composers.$DocumentsDomainId;

/**
 * Identity composer for the `@beep/contract` namespace.
 *
 * @example
 * ```typescript
 * import { $ContractId } from "@beep/identity/packages"
 *
 * const contractId = $ContractId.make("UserContract")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $ContractId = composers.$ContractId;

/**
 * Identity composer for the `@beep/runtime-server` namespace.
 *
 * @example
 * ```typescript
 * import { $RuntimeServerId } from "@beep/identity/packages"
 *
 * const runtimeId = $RuntimeServerId.make("ManagedRuntime")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $RuntimeServerId = composers.$RuntimeServerId;

/**
 * Identity composer for the `@beep/iam-client` namespace.
 *
 * @example
 * ```typescript
 * import { $IamClientId } from "@beep/identity/packages"
 *
 * const clientId = $IamClientId.make("AuthClient")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $IamClientId = composers.$IamClientId;

/**
 * Identity composer for the `@beep/iam-ui` namespace.
 *
 * @example
 * ```typescript
 * import { $IamUiId } from "@beep/identity/packages"
 *
 * const componentId = $IamUiId.make("LoginForm")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $IamUiId = composers.$IamUiId;

/**
 * Identity composer for the `@beep/shared-server` namespace.
 *
 * @example
 * ```typescript
 * import { $SharedServerId } from "@beep/identity/packages"
 *
 * const serviceId = $SharedServerId.make("DatabaseService")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $SharedServerId = composers.$SharedServerId;

/**
 * Identity composer for the `@beep/identity` namespace.
 *
 * @example
 * ```typescript
 * import { $IdentityId } from "@beep/identity/packages"
 *
 * const composerId = $IdentityId.make("TaggedComposer")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $IdentityId = composers.$IdentityId;

/**
 * Identity composer for the `@beep/utils` namespace.
 *
 * @example
 * ```typescript
 * import { $UtilsId } from "@beep/identity/packages"
 *
 * const utilId = $UtilsId.make("StringUtils")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $UtilsId = composers.$UtilsId;

/**
 * Identity composer for the `@beep/iam-domain` namespace.
 *
 * @example
 * ```typescript
 * import { $IamDomainId } from "@beep/identity/packages"
 *
 * const entityId = $IamDomainId.make("User")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $IamDomainId = composers.$IamDomainId;

/**
 * Identity composer for the `@beep/runtime-client` namespace.
 *
 * @example
 * ```typescript
 * import { $RuntimeClientId } from "@beep/identity/packages"
 *
 * const runtimeId = $RuntimeClientId.make("ClientRuntime")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $RuntimeClientId = composers.$RuntimeClientId;

/**
 * Identity composer for the `@beep/shared-tables` namespace.
 *
 * @example
 * ```typescript
 * import { $SharedTablesId } from "@beep/identity/packages"
 *
 * const tableId = $SharedTablesId.make("AuditTable")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $SharedTablesId = composers.$SharedTablesId;

/**
 * Identity composer for the `@beep/ui-core` namespace.
 *
 * @example
 * ```typescript
 * import { $UiCoreId } from "@beep/identity/packages"
 *
 * const themeId = $UiCoreId.make("Theme")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $UiCoreId = composers.$UiCoreId;

/**
 * Identity composer for the `@beep/errors` namespace.
 *
 * @example
 * ```typescript
 * import { $ErrorsId } from "@beep/identity/packages"
 *
 * const errorId = $ErrorsId.make("ValidationError")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $ErrorsId = composers.$ErrorsId;

/**
 * Identity composer for the `@beep/build-utils` namespace.
 *
 * @example
 * ```typescript
 * import { $BuildUtilsId } from "@beep/identity/packages"
 *
 * const utilId = $BuildUtilsId.make("Bundler")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $BuildUtilsId = composers.$BuildUtilsId;

/**
 * Identity composer for the `@beep/documents-client` namespace.
 *
 * @example
 * ```typescript
 * import { $DocumentsClientId } from "@beep/identity/packages"
 *
 * const clientId = $DocumentsClientId.make("DocumentsClient")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $DocumentsClientId = composers.$DocumentsClientId;

/**
 * Identity composer for the `@beep/documents-ui` namespace.
 *
 * @example
 * ```typescript
 * import { $DocumentsUiId } from "@beep/identity/packages"
 *
 * const componentId = $DocumentsUiId.make("FileUploader")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $DocumentsUiId = composers.$DocumentsUiId;

/**
 * Identity composer for the `@beep/constants` namespace.
 *
 * @example
 * ```typescript
 * import { $ConstantsId } from "@beep/identity/packages"
 *
 * const constantId = $ConstantsId.make("ApiRoutes")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $ConstantsId = composers.$ConstantsId;

/**
 * Identity composer for the `@beep/testkit` namespace.
 *
 * @example
 * ```typescript
 * import { $TestkitId } from "@beep/identity/packages"
 *
 * const testId = $TestkitId.make("TestHelpers")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $TestkitId = composers.$TestkitId;

/**
 * Identity composer for the `@beep/tooling-utils` namespace.
 *
 * @example
 * ```typescript
 * import { $ToolingUtilsId } from "@beep/identity/packages"
 *
 * const utilId = $ToolingUtilsId.make("FsUtils")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $ToolingUtilsId = composers.$ToolingUtilsId;

/**
 * Identity composer for the `@beep/repo-cli` namespace.
 *
 * @example
 * ```typescript
 * import { $RepoCliId } from "@beep/identity/packages"
 *
 * const commandId = $RepoCliId.make("SyncCommand")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $RepoCliId = composers.$RepoCliId;

/**
 * Identity composer for the `@beep/documents-server` namespace.
 *
 * @example
 * ```typescript
 * import { $DocumentsServerId } from "@beep/identity/packages"
 *
 * const serviceId = $DocumentsServerId.make("S3StorageService")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $DocumentsServerId = composers.$DocumentsServerId;

/**
 * Identity composer for the `@beep/shared-domain` namespace.
 *
 * @example
 * ```typescript
 * import { $SharedDomainId } from "@beep/identity/packages"
 *
 * const entityId = $SharedDomainId.make("BaseEntity")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $SharedDomainId = composers.$SharedDomainId;

/**
 * Identity composer for the `@beep/db-admin` namespace.
 *
 * @example
 * ```typescript
 * import { $DbAdminId } from "@beep/identity/packages"
 *
 * const migrationId = $DbAdminId.make("Migration")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $DbAdminId = composers.$DbAdminId;

/**
 * Identity composer for the `@beep/server` namespace.
 *
 * @example
 * ```typescript
 * import { $ServerId } from "@beep/identity/packages"
 *
 * const serverId = $ServerId.make("ApiServer")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $ServerId = composers.$ServerId;

/**
 * Identity composer for the `@beep/iam-tables` namespace.
 *
 * @example
 * ```typescript
 * import { $IamTablesId } from "@beep/identity/packages"
 *
 * const tableId = $IamTablesId.make("UsersTable")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $IamTablesId = composers.$IamTablesId;

/**
 * Identity composer for the `@beep/customization-domain` namespace.
 *
 * @example
 * ```typescript
 * import { $CustomizationDomainId } from "@beep/identity/packages"
 *
 * const schemaId = $CustomizationDomainId.make("SchemaId")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $CustomizationDomainId = composers.$CustomizationDomainId;

/**
 * Identity composer for the `@beep/customization-client` namespace.
 *
 * @example
 * ```typescript
 * import { $CustomizationClientId } from "@beep/identity/packages"
 *
 * const schemaId = $CustomizationClientId.make("SchemaId")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $CustomizationClientId = composers.$CustomizationClientId;

/**
 * Identity composer for the `@beep/customization-server` namespace.
 *
 * @example
 * ```typescript
 * import { $CustomizationServerId } from "@beep/identity/packages"
 *
 * const schemaId = $CustomizationServerId.make("SchemaId")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $CustomizationServerId = composers.$CustomizationServerId;

/**
 * Identity composer for the `@beep/customization-tables` namespace.
 *
 * @example
 * ```typescript
 * import { $CustomizationTablesId } from "@beep/identity/packages"
 *
 * const schemaId = $CustomizationTablesId.make("SchemaId")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $CustomizationTablesId = composers.$CustomizationTablesId;

/**
 * Identity composer for the `@beep/customization-ui` namespace.
 *
 * @example
 * ```typescript
 * import { $CustomizationUiId } from "@beep/identity/packages"
 *
 * const schemaId = $CustomizationUiId.make("SchemaId")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $CustomizationUiId = composers.$CustomizationUiId;

/**
 * Identity composer for the `@beep/comms-domain` namespace.
 *
 * @example
 * ```typescript
 * import { $CommsDomainId } from "@beep/identity/packages"
 *
 * const schemaId = $CommsDomainId.make("SchemaId")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $CommsDomainId = composers.$CommsDomainId;

/**
 * Identity composer for the `@beep/comms-tables` namespace.
 *
 * @example
 * ```typescript
 * import { $CommsTablesId } from "@beep/identity/packages"
 *
 * const schemaId = $CommsTablesId.make("SchemaId")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $CommsTablesId = composers.$CommsTablesId;

/**
 * Identity composer for the `@beep/comms-server` namespace.
 *
 * @example
 * ```typescript
 * import { $CommsServerId } from "@beep/identity/packages"
 *
 * const schemaId = $CommsServerId.make("SchemaId")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $CommsServerId = composers.$CommsServerId;

/**
 * Identity composer for the `@beep/comms-client` namespace.
 *
 * @example
 * ```typescript
 * import { $CommsClientId } from "@beep/identity/packages"
 *
 * const schemaId = $CommsClientId.make("SchemaId")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $CommsClientId = composers.$CommsClientId;

/**
 * Identity composer for the `@beep/comms-ui` namespace.
 *
 * @example
 * ```typescript
 * import { $CommsUiId } from "@beep/identity/packages"
 *
 * const schemaId = $CommsUiId.make("SchemaId")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $CommsUiId = composers.$CommsUiId;

/**
 * Identity composer for the `@beep/todox` application.
 *
 * @example
 * ```typescript
 * import { $TodoxId } from "@beep/identity/packages"
 *
 * const schemaId = $TodoxId.make("SchemaId")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $TodoxId = composers.$TodoxId;
