/**
 * Canonical identity composers for every `@beep/*` workspace namespace.
 *
 * Each export is a pre-built {@link Identity.IdentityComposer} scoped to a
 * specific workspace package. Use these to derive schema identifiers,
 * error tags, and service keys without manually calling `make`.
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
 * All other package composers are derived from this root via `compose`.
 *
 * @example
 * ```typescript
 * import { $I } from "@beep/identity/packages"
 *
 * const id = $I.make("CustomSegment")
 * void id // "@beep/CustomSegment"
 * ```
 *
 * @since 0.0.0
 * @category configuration
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
  "colors",
  "chalk",
  "docgen",
  "editor-app",
  "editor-lexical",
  "editor-protocol",
  "editor-client",
  "editor-runtime",
  "infra",
);

// --- common ---

/**
 * Identity composer for the `@beep/data` package.
 *
 * @example
 * ```typescript
 * import { $DataId } from "@beep/identity"
 *
 * const id = $DataId.make("Calendar")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $DataId = composers.$DataId;

/**
 * Identity composer for the `@beep/identity` package.
 *
 * @example
 * ```typescript
 * import { $IdentityId } from "@beep/identity"
 *
 * const id = $IdentityId.make("Composer")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $IdentityId = composers.$IdentityId;

/**
 * Identity composer for the `@beep/messages` package.
 *
 * @example
 * ```typescript
 * import { $MessagesId } from "@beep/identity"
 *
 * const id = $MessagesId.make("Envelope")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $MessagesId = composers.$MessagesId;

/**
 * Identity composer for the `@beep/ontology` package.
 *
 * @example
 * ```typescript
 * import { $OntologyId } from "@beep/identity"
 *
 * const id = $OntologyId.make("Concept")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $OntologyId = composers.$OntologyId;

/**
 * Identity composer for the `@beep/schema` package.
 *
 * @example
 * ```typescript
 * import { $SchemaId } from "@beep/identity"
 *
 * const id = $SchemaId.make("EntityId")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $SchemaId = composers.$SchemaId;

/**
 * Identity composer for the `@beep/types` package.
 *
 * @example
 * ```typescript
 * import { $TypesId } from "@beep/identity"
 *
 * const id = $TypesId.make("NonEmpty")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $TypesId = composers.$TypesId;

/**
 * Identity composer for the `@beep/utils` package.
 *
 * @example
 * ```typescript
 * import { $UtilsId } from "@beep/identity"
 *
 * const id = $UtilsId.make("Retry")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $UtilsId = composers.$UtilsId;

// --- ui ---

/**
 * Identity composer for the `@beep/ui` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $UiId = composers.$UiId;

// --- tooling ---

/**
 * Identity composer for the `@beep/beep-sync` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $BeepSyncId = composers.$BeepSyncId;

/**
 * Identity composer for the `@beep/repo-cli` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RepoCliId = composers.$RepoCliId;

/**
 * Identity composer for the `@beep/agent-eval` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $AgentEvalId = composers.$AgentEvalId;

/**
 * Identity composer for the `@beep/codebase-search` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $CodebaseSearchId = composers.$CodebaseSearchId;

/**
 * Identity composer for the `@beep/repo-utils` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RepoUtilsId = composers.$RepoUtilsId;

/**
 * Identity composer for the `@beep/test-utils` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $TestUtilsId = composers.$TestUtilsId;

// --- claude ---

/**
 * Identity composer for the `@beep/claude` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $ClaudeId = composers.$ClaudeId;

// --- shared ---

/**
 * Identity composer for the `@beep/shared-domain` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $SharedDomainId = composers.$SharedDomainId;

/**
 * Identity composer for the `@beep/shared-tables` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $SharedTablesId = composers.$SharedTablesId;

/**
 * Identity composer for the `@beep/shared-client` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $SharedClientId = composers.$SharedClientId;

/**
 * Identity composer for the `@beep/shared-server` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $SharedServerId = composers.$SharedServerId;

/**
 * Identity composer for the `@beep/shared-ui` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $SharedUiId = composers.$SharedUiId;

/**
 * Identity composer for the `@beep/shared-env` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $SharedEnvId = composers.$SharedEnvId;

// --- runtime ---

/**
 * Identity composer for the `@beep/runtime-protocol` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RuntimeProtocolId = composers.$RuntimeProtocolId;

/**
 * Identity composer for the `@beep/runtime-server` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RuntimeServerId = composers.$RuntimeServerId;

// --- repo-memory ---

/**
 * Identity composer for the `@beep/repo-memory-model` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RepoMemoryModelId = composers.$RepoMemoryModelId;

/**
 * Identity composer for the `@beep/repo-memory-store` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RepoMemoryStoreId = composers.$RepoMemoryStoreId;

/**
 * Identity composer for the `@beep/repo-memory-sqlite` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RepoMemorySqliteId = composers.$RepoMemorySqliteId;

/**
 * Identity composer for the `@beep/repo-memory-runtime` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RepoMemoryRuntimeId = composers.$RepoMemoryRuntimeId;

/**
 * Identity composer for the `@beep/repo-memory-client` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RepoMemoryClientId = composers.$RepoMemoryClientId;

// --- iam ---

/**
 * Identity composer for the `@beep/iam-domain` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $IamDomainId = composers.$IamDomainId;

/**
 * Identity composer for the `@beep/iam-tables` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $IamTablesId = composers.$IamTablesId;

/**
 * Identity composer for the `@beep/iam-client` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $IamClientId = composers.$IamClientId;

/**
 * Identity composer for the `@beep/iam-server` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $IamServerId: Identity.IdentityComposer<"@beep/iam-server"> = composers.$IamServerId;

/**
 * Identity composer for the `@beep/iam-ui` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $IamUiId: Identity.IdentityComposer<"@beep/iam-ui"> = composers.$IamUiId;

/**
 * Identity composer for the `@beep/codegraph` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $CodegraphId: Identity.IdentityComposer<"@beep/codegraph"> = composers.$CodegraphId;

/**
 * Identity composer for the `@beep/semantic-web` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $SemanticWebId: Identity.IdentityComposer<"@beep/semantic-web"> = composers.$SemanticWebId;

/**
 * Identity composer for the `@beep/nlp` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $NlpId: Identity.IdentityComposer<"@beep/nlp"> = composers.$NlpId;

/**
 * Identity composer for the `@beep/editor` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $EditorId: Identity.IdentityComposer<"@beep/editor"> = composers.$EditorId;

/**
 * Identity composer for the `@beep/scratch` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $ScratchId: Identity.IdentityComposer<"@beep/scratch"> = composers.$ScratchId;

/**
 * Identity composer for the `@beep/observability` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $ObservabilityId: Identity.IdentityComposer<"@beep/observability"> = composers.$ObservabilityId;

/**
 * Identity composer for the `@beep/codex` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $CodexId: Identity.IdentityComposer<"@beep/codex"> = composers.$CodexId;

/**
 * Identity composer for the `@beep/colors` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $ColorsId: Identity.IdentityComposer<"@beep/colors"> = composers.$ColorsId;

/**
 * Identity composer for the `@beep/chalk` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $ChalkId: Identity.IdentityComposer<"@beep/chalk"> = composers.$ChalkId;

/**
 * Identity composer for the `@beep/docgen` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $DocgenId: Identity.IdentityComposer<"@beep/docgen"> = composers.$DocgenId;

/**
 * Identity composer for the `@beep/editor-app` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $EditorAppId: Identity.IdentityComposer<"@beep/editor-app"> = composers.$EditorAppId;

/**
 * Identity composer for the `@beep/editor-lexical` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $EditorLexicalId: Identity.IdentityComposer<"@beep/editor-lexical"> = composers.$EditorLexicalId;

/**
 * Identity composer for the `@beep/editor-protocol` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $EditorProtocolId: Identity.IdentityComposer<"@beep/editor-protocol"> = composers.$EditorProtocolId;

/**
 * Identity composer for the `@beep/editor-client` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $EditorClientId: Identity.IdentityComposer<"@beep/editor-client"> = composers.$EditorClientId;

/**
 * Identity composer for the `@beep/editor-runtime` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $EditorRuntimeId: Identity.IdentityComposer<"@beep/editor-runtime"> = composers.$EditorRuntimeId;

/**
 * Identity composer for the `@beep/infra` package.
 *
 * @since 0.0.0
 * @category configuration
 */
export const $InfraId: Identity.IdentityComposer<"@beep/infra"> = composers.$InfraId;
