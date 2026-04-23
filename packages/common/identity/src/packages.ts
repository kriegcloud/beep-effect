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
 * @module
 */
import * as Identity from "./Id.ts";
// import { Struct, pipe } from "effect";
// import * as A from "effect/Array";
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
  // Agent Config Packages
  "claude",
  "codex",

  // IaC Infra Package
  "infra",

  // Scratchpad Package
  "scratch",

  // Common Packages
  "chalk",
  "colors",
  "data",
  "identity",
  "knoledge-graph",
  "messages",
  "nlp",
  "observability",
  "schema",
  "semantic-web",
  "types",
  "ui",
  "utils",

  // Repository Tooling Packages
  "repo-cli",
  "repo-configs",
  "docgen",
  "repo-utils",
  "test-utils",

  // Internal Packages
  "db-admin",

  // Shared Kernel Slice Packages
  "shared-domain",
  "shared-use-cases",
  "shared-server",
  "shared-client",
  "shared-tables",
  "shared-ui",
  "shared-config",
  "runtime-protocol",
  "runtime-server",
  "repo-memory-model",
  "repo-memory-store",
  "repo-memory-sqlite",
  "repo-memory-runtime",
  "repo-memory-client",
  "codegraph",

  // editor
  "editor-client",
  "editor-domain",
  "editor-lexical",
  "editor-app",
  "editor-protocol",
  "editor-runtime",

  "firecrawl", "md"
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
 * @example
 * ```typescript
 * import { $UiId } from "@beep/identity"
 *
 * const id = $UiId.make("Button")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $UiId = composers.$UiId;

// --- tooling ---

/**
 * Identity composer for the `@beep/repo-cli` package.
 *
 * @example
 * ```typescript
 * import { $RepoCliId } from "@beep/identity"
 *
 * const id = $RepoCliId.make("Command")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RepoCliId = composers.$RepoCliId;

/**
 * Identity composer for the `@beep/repo-utils` package.
 *
 * @example
 * ```typescript
 * import { $RepoUtilsId } from "@beep/identity"
 *
 * const id = $RepoUtilsId.make("FileTree")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RepoUtilsId = composers.$RepoUtilsId;

/**
 * Identity composer for the `@beep/test-utils` package.
 *
 * @example
 * ```typescript
 * import { $TestUtilsId } from "@beep/identity"
 *
 * const id = $TestUtilsId.make("Fixture")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $TestUtilsId = composers.$TestUtilsId;

// --- claude ---

/**
 * Identity composer for the `@beep/claude` package.
 *
 * @example
 * ```typescript
 * import { $ClaudeId } from "@beep/identity"
 *
 * const id = $ClaudeId.make("Agent")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $ClaudeId = composers.$ClaudeId;

// --- shared ---

/**
 * Identity composer for the `@beep/shared-domain` package.
 *
 * @example
 * ```typescript
 * import { $SharedDomainId } from "@beep/identity"
 *
 * const id = $SharedDomainId.make("TenantId")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $SharedDomainId = composers.$SharedDomainId;

/**
 * Identity composer for the `@beep/shared-tables` package.
 *
 * @example
 * ```typescript
 * import { $SharedTablesId } from "@beep/identity"
 *
 * const id = $SharedTablesId.make("AuditColumns")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $SharedTablesId = composers.$SharedTablesId;

/**
 * Identity composer for the `@beep/shared-client` package.
 *
 * @example
 * ```typescript
 * import { $SharedClientId } from "@beep/identity"
 *
 * const id = $SharedClientId.make("HttpClient")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $SharedClientId = composers.$SharedClientId;

/**
 * Identity composer for the `@beep/shared-server` package.
 *
 * @example
 * ```typescript
 * import { $SharedServerId } from "@beep/identity"
 *
 * const id = $SharedServerId.make("Middleware")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $SharedServerId = composers.$SharedServerId;

/**
 * Identity composer for the `@beep/shared-ui` package.
 *
 * @example
 * ```typescript
 * import { $SharedUiId } from "@beep/identity"
 *
 * const id = $SharedUiId.make("ThemeProvider")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $SharedUiId = composers.$SharedUiId;

/**
 * Identity composer for the `@beep/shared-config` package.
 *
 * @example
 * ```typescript
 * import { $SharedConfigId } from "@beep/identity"
 *
 * const id = $SharedConfigId.make("DatabaseUrl")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $SharedConfigId = composers.$SharedConfigId;

// --- runtime ---

/**
 * Identity composer for the `@beep/runtime-protocol` package.
 *
 * @example
 * ```typescript
 * import { $RuntimeProtocolId } from "@beep/identity"
 *
 * const id = $RuntimeProtocolId.make("Message")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RuntimeProtocolId = composers.$RuntimeProtocolId;

/**
 * Identity composer for the `@beep/runtime-server` package.
 *
 * @example
 * ```typescript
 * import { $RuntimeServerId } from "@beep/identity"
 *
 * const id = $RuntimeServerId.make("Runtime")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RuntimeServerId = composers.$RuntimeServerId;

// --- repo-memory ---

/**
 * Identity composer for the `@beep/repo-memory-model` package.
 *
 * @example
 * ```typescript
 * import { $RepoMemoryModelId } from "@beep/identity"
 *
 * const id = $RepoMemoryModelId.make("Chunk")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RepoMemoryModelId = composers.$RepoMemoryModelId;

/**
 * Identity composer for the `@beep/repo-memory-store` package.
 *
 * @example
 * ```typescript
 * import { $RepoMemoryStoreId } from "@beep/identity"
 *
 * const id = $RepoMemoryStoreId.make("VectorStore")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RepoMemoryStoreId = composers.$RepoMemoryStoreId;

/**
 * Identity composer for the `@beep/repo-memory-sqlite` package.
 *
 * @example
 * ```typescript
 * import { $RepoMemorySqliteId } from "@beep/identity"
 *
 * const id = $RepoMemorySqliteId.make("Connection")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RepoMemorySqliteId = composers.$RepoMemorySqliteId;

/**
 * Identity composer for the `@beep/repo-memory-runtime` package.
 *
 * @example
 * ```typescript
 * import { $RepoMemoryRuntimeId } from "@beep/identity"
 *
 * const id = $RepoMemoryRuntimeId.make("Worker")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RepoMemoryRuntimeId = composers.$RepoMemoryRuntimeId;

/**
 * Identity composer for the `@beep/repo-memory-client` package.
 *
 * @example
 * ```typescript
 * import { $RepoMemoryClientId } from "@beep/identity"
 *
 * const id = $RepoMemoryClientId.make("QueryClient")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RepoMemoryClientId = composers.$RepoMemoryClientId;

/**
 * Identity composer for the `@beep/codegraph` package.
 *
 * @example
 * ```typescript
 * import { $CodegraphId } from "@beep/identity"
 *
 * const id = $CodegraphId.make("Node")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $CodegraphId: Identity.IdentityComposer<"@beep/codegraph"> = composers.$CodegraphId;

/**
 * Identity composer for the `@beep/semantic-web` package.
 *
 * @example
 * ```typescript
 * import { $SemanticWebId } from "@beep/identity"
 *
 * const id = $SemanticWebId.make("Triple")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $SemanticWebId: Identity.IdentityComposer<"@beep/semantic-web"> = composers.$SemanticWebId;

/**
 * Identity composer for the `@beep/nlp` package.
 *
 * @example
 * ```typescript
 * import { $NlpId } from "@beep/identity"
 *
 * const id = $NlpId.make("Tokenizer")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $NlpId: Identity.IdentityComposer<"@beep/nlp"> = composers.$NlpId;

/**
 * Identity composer for the `@beep/editor-domain` package.
 *
 * @example
 * ```typescript
 * import { $EditorDomainId } from "@beep/identity"
 *
 * const id = $EditorDomainId.make("Document")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $EditorDomainId: Identity.IdentityComposer<"@beep/editor-domain"> = composers.$EditorDomainId;

/**
 * Identity composer for the `@beep/scratch` package.
 *
 * @example
 * ```typescript
 * import { $ScratchId } from "@beep/identity"
 *
 * const id = $ScratchId.make("Sandbox")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $ScratchId: Identity.IdentityComposer<"@beep/scratch"> = composers.$ScratchId;

/**
 * Identity composer for the `@beep/observability` package.
 *
 * @example
 * ```typescript
 * import { $ObservabilityId } from "@beep/identity"
 *
 * const id = $ObservabilityId.make("Tracer")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $ObservabilityId: Identity.IdentityComposer<"@beep/observability"> = composers.$ObservabilityId;

/**
 * Identity composer for the `@beep/codex` package.
 *
 * @example
 * ```typescript
 * import { $CodexId } from "@beep/identity"
 *
 * const id = $CodexId.make("Prompt")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $CodexId: Identity.IdentityComposer<"@beep/codex"> = composers.$CodexId;

/**
 * Identity composer for the `@beep/colors` package.
 *
 * @example
 * ```typescript
 * import { $ColorsId } from "@beep/identity"
 *
 * const id = $ColorsId.make("Palette")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $ColorsId: Identity.IdentityComposer<"@beep/colors"> = composers.$ColorsId;

/**
 * Identity composer for the `@beep/chalk` package.
 *
 * @example
 * ```typescript
 * import { $ChalkId } from "@beep/identity"
 *
 * const id = $ChalkId.make("Formatter")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $ChalkId: Identity.IdentityComposer<"@beep/chalk"> = composers.$ChalkId;

/**
 * Identity composer for the `@beep/docgen` package.
 *
 * @example
 * ```typescript
 * import { $DocgenId } from "@beep/identity"
 *
 * const id = $DocgenId.make("Generator")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $DocgenId: Identity.IdentityComposer<"@beep/docgen"> = composers.$DocgenId;

/**
 * Identity composer for the `@beep/editor-app` package.
 *
 * @example
 * ```typescript
 * import { $EditorAppId } from "@beep/identity"
 *
 * const id = $EditorAppId.make("Workspace")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $EditorAppId: Identity.IdentityComposer<"@beep/editor-app"> = composers.$EditorAppId;

/**
 * Identity composer for the `@beep/editor-lexical` package.
 *
 * @example
 * ```typescript
 * import { $EditorLexicalId } from "@beep/identity"
 *
 * const id = $EditorLexicalId.make("Plugin")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $EditorLexicalId: Identity.IdentityComposer<"@beep/editor-lexical"> = composers.$EditorLexicalId;

/**
 * Identity composer for the `@beep/editor-protocol` package.
 *
 * @example
 * ```typescript
 * import { $EditorProtocolId } from "@beep/identity"
 *
 * const id = $EditorProtocolId.make("Command")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $EditorProtocolId: Identity.IdentityComposer<"@beep/editor-protocol"> = composers.$EditorProtocolId;

/**
 * Identity composer for the `@beep/editor-client` package.
 *
 * @example
 * ```typescript
 * import { $EditorClientId } from "@beep/identity"
 *
 * const id = $EditorClientId.make("Adapter")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $EditorClientId: Identity.IdentityComposer<"@beep/editor-client"> = composers.$EditorClientId;

/**
 * Identity composer for the `@beep/editor-runtime` package.
 *
 * @example
 * ```typescript
 * import { $EditorRuntimeId } from "@beep/identity"
 *
 * const id = $EditorRuntimeId.make("Layer")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $EditorRuntimeId: Identity.IdentityComposer<"@beep/editor-runtime"> = composers.$EditorRuntimeId;

/**
 * Identity composer for the `@beep/infra` package.
 *
 * @example
 * ```typescript
 * import { $InfraId } from "@beep/identity"
 *
 * const id = $InfraId.make("Deploy")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $InfraId: Identity.IdentityComposer<"@beep/infra"> = composers.$InfraId;

/**
 * Identity composer for the `@beep/firecrawl` package.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const $FirecrawlId: Identity.IdentityComposer<"@beep/firecrawl"> = composers.$FirecrawlId;

/**
 * RepoPkgs - export object containing all package IdentityComposer's
 *
 * @category Configuration
 * @since 0.0.0
 */
export const RepoPkgs = composers;

/**
 * @since 0.0.0
 * @category Configuration
 * @type {Identity.IdentityComposer<"@beep/md">}
 */
export const $MdId: Identity.IdentityComposer<"@beep/md"> = composers.$MdId;
