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
 * @packageDocumentation
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

  // Foundation Packages
  "chalk",
  "colors",
  "data",
  "identity",
  "md",
  "messages",
  "nlp",
  "observability",
  "schema",
  "semantic-web",
  "types",
  "ui",
  "utils",

  // Synthetic architecture automation fixture packages
  "fixture-lab-specimen",

  // Repository Tooling Packages
  "repo-cli",
  "repo-configs",
  "docgen",
  "repo-checks",
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

  "codedank-web",
  "drizzle",
  "ffmpeg",
  "postgres"
);

// --- foundation ---

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
 * Identity composer for the `@beep/repo-checks` package.
 *
 * @example
 * ```typescript
 * import { $RepoChecksId } from "@beep/identity"
 *
 * const id = $RepoChecksId.make("QualityGate")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RepoChecksId: Identity.IdentityComposer<"@beep/repo-checks"> = composers.$RepoChecksId;

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
 * Identity composer for the `@beep/shared-use-cases` package.
 *
 * @example
 * ```typescript
 * import { $SharedUseCasesId } from "@beep/identity"
 *
 * const id = $SharedUseCasesId.make("Workflow")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $SharedUseCasesId: Identity.IdentityComposer<"@beep/shared-use-cases"> = composers.$SharedUseCasesId;

/**
 * Identity composer for the synthetic `@beep/fixture-lab-specimen-*` packages.
 *
 * @example
 * ```typescript
 * import { $FixtureLabSpecimenId } from "@beep/identity"
 *
 * const id = $FixtureLabSpecimenId.make("Specimen")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $FixtureLabSpecimenId: Identity.IdentityComposer<"@beep/fixture-lab-specimen"> =
  composers.$FixtureLabSpecimenId;

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
 */
export const $MdId: Identity.IdentityComposer<"@beep/md"> = composers.$MdId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $CodedankWebId: Identity.IdentityComposer<"@beep/codedank-web"> = composers.$CodedankWebId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $DrizzleId: Identity.IdentityComposer<"@beep/drizzle"> = composers.$DrizzleId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $FfmpegId: Identity.IdentityComposer<"@beep/ffmpeg"> = composers.$FfmpegId;

/**
 * @since 0.0.0
 * @category Configuration
 */
export const $PostgresId: Identity.IdentityComposer<"@beep/postgres"> = composers.$PostgresId;
