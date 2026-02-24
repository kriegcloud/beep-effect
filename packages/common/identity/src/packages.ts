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
import * as Identity from "./Identity.js";

/**
 * Root identity composer for the `@beep` namespace.
 *
 * @since 0.0.0
 * @category root
 */
export const $I = Identity.make("beep").$BeepId;

// --- common ---

/**
 * @since 0.0.0
 * @category common
 */
export const $DataId = $I.compose("data");

/**
 * @since 0.0.0
 * @category common
 */
export const $IdentityId = $I.compose("identity");

/**
 * @since 0.0.0
 * @category common
 */
export const $MessagesId = $I.compose("messages");

/**
 * @since 0.0.0
 * @category common
 */
export const $OntologyId = $I.compose("ontology");

/**
 * @since 0.0.0
 * @category common
 */
export const $SchemaId = $I.compose("schema");

/**
 * @since 0.0.0
 * @category common
 */
export const $TypesId = $I.compose("types");

/**
 * @since 0.0.0
 * @category common
 */
export const $UtilsId = $I.compose("utils");

// --- shared ---

/**
 * @since 0.0.0
 * @category shared
 */
export const $SharedDomainId = $I.compose("shared-domain");

/**
 * @since 0.0.0
 * @category shared
 */
export const $SharedEnvId = $I.compose("shared-env");

// --- ui ---

/**
 * @since 0.0.0
 * @category ui
 */
export const $UiId = $I.compose("ui");

// --- apps ---

/**
 * @since 0.0.0
 * @category apps
 */
export const $WebId = $I.compose("web");

// --- tooling ---

/**
 * @since 0.0.0
 * @category tooling
 */
export const $BeepSyncId = $I.compose("beep-sync");

/**
 * @since 0.0.0
 * @category tooling
 */
export const $RepoCliId = $I.compose("repo-cli");

/**
 * @since 0.0.0
 * @category tooling
 */
export const $CodebaseSearchId = $I.compose("codebase-search");

/**
 * @since 0.0.0
 * @category tooling
 */
export const $RepoUtilsId = $I.compose("repo-utils");

// --- claude ---

/**
 * @since 0.0.0
 * @category claude
 */
export const $ClaudeId = $I.compose("claude");
