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
 * import { $I } from "@beep/identity"
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
  "shared-sdk",
  "repo-scripts",
  "iam-infra",
  "documents-tables",
  "ui",
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
  "iam-tables",
  "lexical-schemas"
);

/**
 * Identity composer for the `@beep/shared-ui` namespace.
 *
 * @example
 * ```typescript
 * import { $SharedUiId } from "@beep/identity"
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
 * import { $SharedSdkId } from "@beep/identity"
 *
 * const contractId = $SharedSdkId.make("ApiContract")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $SharedSdkId = composers.$SharedSdkId;

/**
 * Identity composer for the `@beep/repo-scripts` namespace.
 *
 * @example
 * ```typescript
 * import { $RepoScriptsId } from "@beep/identity"
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
 * import { $IamInfraId } from "@beep/identity"
 *
 * const repoId = $IamInfraId.make("UserRepository")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $IamInfraId = composers.$IamInfraId;

/**
 * Identity composer for the `@beep/documents-tables` namespace.
 *
 * @example
 * ```typescript
 * import { $DocumentsTablesId } from "@beep/identity"
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
 * import { $UiId } from "@beep/identity"
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
 * import { $InvariantId } from "@beep/identity"
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
 * import { $WebId } from "@beep/identity"
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
 * import { $SchemaId } from "@beep/identity"
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
 * import { $DocumentsDomainId } from "@beep/identity"
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
 * import { $ContractId } from "@beep/identity"
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
 * import { $RuntimeServerId } from "@beep/identity"
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
 * import { $IamSdkId } from "@beep/identity"
 *
 * const clientId = $IamSdkId.make("AuthClient")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $IamSdkId = composers.$IamSdkId;

/**
 * Identity composer for the `@beep/iam-ui` namespace.
 *
 * @example
 * ```typescript
 * import { $IamUiId } from "@beep/identity"
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
 * import { $SharedInfraId } from "@beep/identity"
 *
 * const serviceId = $SharedInfraId.make("DatabaseService")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $SharedInfraId = composers.$SharedInfraId;

/**
 * Identity composer for the `@beep/identity` namespace.
 *
 * @example
 * ```typescript
 * import { $IdentityId } from "@beep/identity"
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
 * import { $UtilsId } from "@beep/identity"
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
 * import { $IamDomainId } from "@beep/identity"
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
 * import { $RuntimeClientId } from "@beep/identity"
 *
 * const runtimeId = $RuntimeClientId.make("ClientRuntime")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $RuntimeClientId = composers.$RuntimeClientId;

/**
 * Identity composer for the `@beep/scratchpad` namespace.
 *
 * @example
 * ```typescript
 * import { $ScratchpadId } from "@beep/identity"
 *
 * const noteId = $ScratchpadId.make("Note")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $ScratchpadId = composers.$ScratchpadId;

/**
 * Identity composer for the `@beep/shared-tables` namespace.
 *
 * @example
 * ```typescript
 * import { $SharedTablesId } from "@beep/identity"
 *
 * const tableId = $SharedTablesId.make("AuditTable")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $SharedTablesId = composers.$SharedTablesId;

/**
 * Identity composer for the `@beep/mock` namespace.
 *
 * @example
 * ```typescript
 * import { $MockId } from "@beep/identity"
 *
 * const mockId = $MockId.make("MockUser")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $MockId = composers.$MockId;

/**
 * Identity composer for the `@beep/ui-core` namespace.
 *
 * @example
 * ```typescript
 * import { $UiCoreId } from "@beep/identity"
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
 * import { $ErrorsId } from "@beep/identity"
 *
 * const errorId = $ErrorsId.make("ValidationError")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $ErrorsId = composers.$ErrorsId;

/**
 * Identity composer for the `@beep/types` namespace.
 *
 * @example
 * ```typescript
 * import { $TypesId } from "@beep/identity"
 *
 * const typeId = $TypesId.make("StringTypes")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $TypesId = composers.$TypesId;

/**
 * Identity composer for the `@beep/build-utils` namespace.
 *
 * @example
 * ```typescript
 * import { $BuildUtilsId } from "@beep/identity"
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
 * import { $DocumentsSdkId } from "@beep/identity"
 *
 * const clientId = $DocumentsSdkId.make("DocumentsClient")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $DocumentsSdkId = composers.$DocumentsSdkId;

/**
 * Identity composer for the `@beep/documents-ui` namespace.
 *
 * @example
 * ```typescript
 * import { $DocumentsUiId } from "@beep/identity"
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
 * import { $ConstantsId } from "@beep/identity"
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
 * import { $TestkitId } from "@beep/identity"
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
 * import { $ToolingUtilsId } from "@beep/identity"
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
 * import { $RepoCliId } from "@beep/identity"
 *
 * const commandId = $RepoCliId.make("SyncCommand")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $RepoCliId = composers.$RepoCliId;

/**
 * Identity composer for the `@beep/notes` namespace.
 *
 * @example
 * ```typescript
 * import { $NotesId } from "@beep/identity"
 *
 * const noteId = $NotesId.make("Note")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $NotesId = composers.$NotesId;

/**
 * Identity composer for the `@beep/documents-server` namespace.
 *
 * @example
 * ```typescript
 * import { $DocumentsInfraId } from "@beep/identity"
 *
 * const serviceId = $DocumentsInfraId.make("S3StorageService")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $DocumentsInfraId = composers.$DocumentsInfraId;

/**
 * Identity composer for the `@beep/scraper` namespace.
 *
 * @example
 * ```typescript
 * import { $ScraperId } from "@beep/identity"
 *
 * const scraperId = $ScraperId.make("WebScraper")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $ScraperId = composers.$ScraperId;

/**
 * Identity composer for the `@beep/shared-domain` namespace.
 *
 * @example
 * ```typescript
 * import { $SharedDomainId } from "@beep/identity"
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
 * import { $DbAdminId } from "@beep/identity"
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
 * import { $ServerId } from "@beep/identity"
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
 * import { $IamTablesId } from "@beep/identity"
 *
 * const tableId = $IamTablesId.make("UsersTable")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $IamTablesId = composers.$IamTablesId;

/**
 * Identity composer for the `@beep/lexical-schemas` namespace.
 *
 * @example
 * ```typescript
 * import { $LexicalSchemasId } from "@beep/identity"
 *
 * const schemaId = $LexicalSchemasId.make("SchemaId")
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const $LexicalSchemasId = composers.$LexicalSchemasId;
