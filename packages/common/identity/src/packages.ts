/**
 * Canonical identity composers for every `@beep/*` workspace namespace.
 *
 * @example
 * ```typescript
 * import { $I, $SchemaId } from "@beep/identity/packages"
 *
 * const serviceId = $SchemaId`TenantService`
 * const customId = $I.create("custom").make("CustomService")
 * ```
 *
 * @since 0.0.0
 * @module @beep/identity/packages
 */
import * as Identity from "./Id.ts";

/**
 * Root identity composer for the `@beep` namespace.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const $I = Identity.make("beep").$BeepId;

const composers = $I.compose(
  "data",
  "identity",
  "messages",
  "ontology",
  "schema",
  "types",
  "utils",
  "ui",
  "web",
  "beep-sync",
  "repo-cli",
  "codegraph",
  "agent-eval",
  "codebase-search",
  "repo-utils",
  "claude",
  "ai-sdk",
  // Shared Slice
  "shared-domain",
  "shared-tables",
  "shared-client",
  "shared-server",
  "shared-ui",
  "shared-env",
  "runtime-protocol",
  "runtime-server",
  "repo-memory-domain",
  "repo-memory-server",
  "repo-memory-client",
  "repo-memory-drivers-local",
	"codegraph",

  // iam
  "iam-domain",
  "iam-tables",
  "iam-client",
  "iam-server",
  "iam-ui"
);

// --- common ---

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $DataId = composers.$DataId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $IdentityId = composers.$IdentityId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $MessagesId = composers.$MessagesId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $OntologyId = composers.$OntologyId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $SchemaId = composers.$SchemaId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $TypesId = composers.$TypesId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $UtilsId = composers.$UtilsId;

// --- ui ---

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $UiId = composers.$UiId;

// --- apps ---

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $WebId = composers.$WebId;

// --- tooling ---

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $BeepSyncId = composers.$BeepSyncId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $RepoCliId = composers.$RepoCliId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $AgentEvalId = composers.$AgentEvalId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $CodebaseSearchId = composers.$CodebaseSearchId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $RepoUtilsId = composers.$RepoUtilsId;

// --- claude ---

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $ClaudeId = composers.$ClaudeId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $AiSdkId = composers.$AiSdkId;

// --- shared ---

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $SharedDomainId = composers.$SharedDomainId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $SharedTablesId = composers.$SharedTablesId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $SharedClientId = composers.$SharedClientId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $SharedServerId = composers.$SharedServerId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $SharedUiId = composers.$SharedUiId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $SharedEnvId = composers.$SharedEnvId;

// --- runtime ---

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $RuntimeProtocolId = composers.$RuntimeProtocolId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $RuntimeServerId = composers.$RuntimeServerId;

// --- repo-memory ---

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $RepoMemoryDomainId = composers.$RepoMemoryDomainId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $RepoMemoryServerId = composers.$RepoMemoryServerId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $RepoMemoryClientId = composers.$RepoMemoryClientId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $RepoMemoryDriversLocalId = composers.$RepoMemoryDriversLocalId;

// --- iam ---

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $IamDomainId = composers.$IamDomainId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $IamTablesId = composers.$IamTablesId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $IamClientId = composers.$IamClientId;

/**
 * @since 0.0.0
 * @category Configuration
 * @type {Identity.IdentityComposer<"@beep/iam-server">}
 */
export const $IamServerId: Identity.IdentityComposer<"@beep/iam-server"> = composers.$IamServerId;

/**
 * @since 0.0.0
 * @category Configuration
 * @type {Identity.IdentityComposer<"@beep/iam-ui">}
 */
export const $IamUiId: Identity.IdentityComposer<"@beep/iam-ui"> = composers.$IamUiId;

/**
 * @since 0.0.0
 * @category Configuration
 * @type {Identity.IdentityComposer<"@beep/codegraph">}
 */
export const $CodegraphId: Identity.IdentityComposer<"@beep/codegraph"> = composers.$CodegraphId;
