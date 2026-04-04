/**
 * Canonical identity composers for every `@beep/*` workspace namespace.
 *
 * @example
 * ```typescript
 * import { $I, $SchemaId } from "@beep/identity/packages"
 *
 * const serviceId = $SchemaId`TenantService`
 * const customId = $I.create("custom").make("CustomService")
 * void serviceId
 * void customId
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
  "scratch",
  "data",
  "identity",
  "messages",
  "ontology",
  "schema",
  "types",
  "utils",
  "ui",
  "web",
  "crypto-taxes",
  "semantic-web",
  "beep-sync",
  "repo-cli",
  "codegraph",
  "agent-eval",
  "codebase-search",
  "repo-utils",
  "test-utils",
  "claude",
  "codex",
  "ai-sdk",
  "nlp",
  // Shared Slice
  "shared-domain",
  "shared-tables",
  "shared-client",
  "shared-server",
  "shared-ui",
  "shared-env",
  "runtime-protocol",
  "runtime-server",
  "repo-memory-model",
  "repo-memory-store",
  "repo-memory-sqlite",
  "repo-memory-runtime",
  "repo-memory-client",
  "codegraph",

  // iam
  "iam-domain",
  "iam-tables",
  "iam-client",
  "iam-server",
  "iam-ui",

  // editor
  "editor",
  "observability",
  "shared-providers",
  "colors",
  "clawhole",
  "chalk",
  "docgen"
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

/**
 * @since 0.0.0
 * @category Configuration
 * @type {Identity.IdentityComposer<"@beep/crypto-taxes">}
 */
export const $CryptoTaxesId: Identity.IdentityComposer<"@beep/crypto-taxes"> = composers.$CryptoTaxesId;

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

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $TestUtilsId = composers.$TestUtilsId;

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
export const $RepoMemoryModelId = composers.$RepoMemoryModelId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $RepoMemoryStoreId = composers.$RepoMemoryStoreId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $RepoMemorySqliteId = composers.$RepoMemorySqliteId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $RepoMemoryRuntimeId = composers.$RepoMemoryRuntimeId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $RepoMemoryClientId = composers.$RepoMemoryClientId;

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

/**
 * @since 0.0.0
 * @category Configuration
 * @type {Identity.IdentityComposer<"@beep/semantic-web">}
 */
export const $SemanticWebId: Identity.IdentityComposer<"@beep/semantic-web"> = composers.$SemanticWebId;

/**
 * @since 0.0.0
 * @category Configuration
 * @type {Identity.IdentityComposer<"@beep/nlp">}
 */
export const $NlpId: Identity.IdentityComposer<"@beep/nlp"> = composers.$NlpId;

/**
 * @since 0.0.0
 * @category Configuration
 * @type {Identity.IdentityComposer<"@beep/editor">}
 */
export const $EditorId: Identity.IdentityComposer<"@beep/editor"> = composers.$EditorId;

/**
 * @since 0.0.0
 * @category Configuration
 * @type {Identity.IdentityComposer<"@beep/scratch">}
 */
export const $ScratchId: Identity.IdentityComposer<"@beep/scratch"> = composers.$ScratchId;

/**
 * @since 0.0.0
 * @category Configuration
 * @type {Identity.IdentityComposer<"@beep/observability">}
 */
export const $ObservabilityId: Identity.IdentityComposer<"@beep/observability"> = composers.$ObservabilityId;

/**
 * @since 0.0.0
 * @category Configuration
 * @type {Identity.IdentityComposer<"@beep/shared-providers">}
 */
export const $SharedProvidersId: Identity.IdentityComposer<"@beep/shared-providers"> = composers.$SharedProvidersId;

/**
 * @since 0.0.0
 * @category Configuration
 * @type {Identity.IdentityComposer<"@beep/codex">}
 */
export const $CodexId: Identity.IdentityComposer<"@beep/codex"> = composers.$CodexId;

/**
 * @since 0.0.0
 * @category Configuration
 * @type {Identity.IdentityComposer<"@beep/colors">}
 */
export const $ColorsId: Identity.IdentityComposer<"@beep/colors"> = composers.$ColorsId;

/**
 * @since 0.0.0
 * @category Configuration
 * @type {Identity.IdentityComposer<"@beep/clawhole">}
 */
export const $ClawholeId: Identity.IdentityComposer<"@beep/clawhole"> = composers.$ClawholeId;

/**
 * @since 0.0.0
 * @category Configuration
 * @type {Identity.IdentityComposer<"@beep/chalk">}
 */
export const $ChalkId: Identity.IdentityComposer<"@beep/chalk"> = composers.$ChalkId;

/**
 * @since 0.0.0
 * @category Configuration
 * @type {Identity.IdentityComposer<"@beep/docgen">}
 */
export const $DocgenId: Identity.IdentityComposer<"@beep/docgen"> = composers.$DocgenId;
