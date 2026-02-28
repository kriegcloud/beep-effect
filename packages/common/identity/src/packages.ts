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
 * @category root
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
  "shared-domain",
  "shared-env",
  "ui",
  "web",
  "beep-sync",
  "repo-cli",
  "agent-eval",
  "codebase-search",
  "repo-utils",
  "claude",
  "ai-sdk"
);

// --- common ---

/**
 * @since 0.0.0
 * @category common
 */
export const $DataId = composers.$DataId;

/**
 * @since 0.0.0
 * @category common
 */
export const $IdentityId = composers.$IdentityId;

/**
 * @since 0.0.0
 * @category common
 */
export const $MessagesId = composers.$MessagesId;

/**
 * @since 0.0.0
 * @category common
 */
export const $OntologyId = composers.$OntologyId;

/**
 * @since 0.0.0
 * @category common
 */
export const $SchemaId = composers.$SchemaId;

/**
 * @since 0.0.0
 * @category common
 */
export const $TypesId = composers.$TypesId;

/**
 * @since 0.0.0
 * @category common
 */
export const $UtilsId = composers.$UtilsId;

// --- shared ---

/**
 * @since 0.0.0
 * @category shared
 */
export const $SharedDomainId = composers.$SharedDomainId;

/**
 * @since 0.0.0
 * @category shared
 */
export const $SharedEnvId = composers.$SharedEnvId;

// --- ui ---

/**
 * @since 0.0.0
 * @category ui
 */
export const $UiId = composers.$UiId;

// --- apps ---

/**
 * @since 0.0.0
 * @category apps
 */
export const $WebId = composers.$WebId;

// --- tooling ---

/**
 * @since 0.0.0
 * @category tooling
 */
export const $BeepSyncId = composers.$BeepSyncId;

/**
 * @since 0.0.0
 * @category tooling
 */
export const $RepoCliId = composers.$RepoCliId;

/**
 * @since 0.0.0
 * @category tooling
 */
export const $AgentEvalId = composers.$AgentEvalId;

/**
 * @since 0.0.0
 * @category tooling
 */
export const $CodebaseSearchId = composers.$CodebaseSearchId;

/**
 * @since 0.0.0
 * @category tooling
 */
export const $RepoUtilsId = composers.$RepoUtilsId;

// --- claude ---

/**
 * @since 0.0.0
 * @category claude
 */
export const $ClaudeId = composers.$ClaudeId;

/**
 * @since 0.0.0
 * @category claude
 */
export const $AiSdkId = composers.$AiSdkId;
