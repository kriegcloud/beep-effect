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
  "scratchpad",
  // Synthetic architecture automation fixture packages
  "fixture-lab-specimen",

  // P3 Professional Runtime Proof Packages
  "agent-capability-domain",
  "agent-capability-use-cases",
  "epistemic-domain",
  "law-practice-domain",
  "professional-runtime-proof",
  "wealth-management-domain",
  "workspace-domain",

  // Repository Tooling Packages
  "repo-cli",
  "repo-configs",
  "repo-docgen",
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
  "postgres",

  // IAM Slice Packages
  "iam-domain",
  "iam-use-cases",
  "iam-server",
  "iam-tables",

  // Billing Slice Packages
  "billing-domain",
  "billing-use-cases",
  "billing-server",
  "sandbox",
  "openai",
  "venice-ai",
  "xai"
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
 * Identity composer for the `@beep/repo-docgen` package.
 *
 * @example
 * ```typescript
 * import { $RepoDocgenId } from "@beep/identity"
 *
 * const id = $RepoDocgenId.make("Generator")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RepoDocgenId: Identity.IdentityComposer<"@beep/repo-docgen"> = composers.$RepoDocgenId;

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

// --- p3 professional runtime proof ---

/**
 * Identity composer for the `@beep/workspace-domain` package.
 *
 * @example
 * ```typescript
 * import { $WorkspaceDomainId } from "@beep/identity"
 *
 * const id = $WorkspaceDomainId.make("ContextPacket")
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const $WorkspaceDomainId: Identity.IdentityComposer<"@beep/workspace-domain"> = composers.$WorkspaceDomainId;

/**
 * Identity composer for the `@beep/epistemic-domain` package.
 *
 * @example
 * ```typescript
 * import { $EpistemicDomainId } from "@beep/identity"
 *
 * const id = $EpistemicDomainId.make("Evidence")
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const $EpistemicDomainId: Identity.IdentityComposer<"@beep/epistemic-domain"> = composers.$EpistemicDomainId;

/**
 * Identity composer for the `@beep/agent-capability-domain` package.
 *
 * @example
 * ```typescript
 * import { $AgentCapabilityDomainId } from "@beep/identity"
 *
 * const id = $AgentCapabilityDomainId.make("Agent")
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const $AgentCapabilityDomainId: Identity.IdentityComposer<"@beep/agent-capability-domain"> =
  composers.$AgentCapabilityDomainId;

/**
 * Identity composer for the `@beep/agent-capability-use-cases` package.
 *
 * @example
 * ```typescript
 * import { $AgentCapabilityUseCasesId } from "@beep/identity"
 *
 * const id = $AgentCapabilityUseCasesId.make("RuntimeScope")
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const $AgentCapabilityUseCasesId: Identity.IdentityComposer<"@beep/agent-capability-use-cases"> =
  composers.$AgentCapabilityUseCasesId;

/**
 * Identity composer for the `@beep/law-practice-domain` package.
 *
 * @example
 * ```typescript
 * import { $LawPracticeDomainId } from "@beep/identity"
 *
 * const id = $LawPracticeDomainId.make("Matter")
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const $LawPracticeDomainId: Identity.IdentityComposer<"@beep/law-practice-domain"> =
  composers.$LawPracticeDomainId;

/**
 * Identity composer for the `@beep/wealth-management-domain` package.
 *
 * @example
 * ```typescript
 * import { $WealthManagementDomainId } from "@beep/identity"
 *
 * const id = $WealthManagementDomainId.make("Household")
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const $WealthManagementDomainId: Identity.IdentityComposer<"@beep/wealth-management-domain"> =
  composers.$WealthManagementDomainId;

/**
 * Identity composer for the `@beep/professional-runtime-proof` package.
 *
 * @example
 * ```typescript
 * import { $ProfessionalRuntimeProofId } from "@beep/identity"
 *
 * const id = $ProfessionalRuntimeProofId.make("RuntimeHarness")
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const $ProfessionalRuntimeProofId: Identity.IdentityComposer<"@beep/professional-runtime-proof"> =
  composers.$ProfessionalRuntimeProofId;

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

// --- billing ---

/**
 * Identity composer for the `@beep/billing-domain` package.
 *
 * Pre-registered ahead of slice creation.
 *
 * @example
 * ```typescript
 * import { $BillingDomainId } from "@beep/identity"
 *
 * const id = $BillingDomainId.make("Invoice")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $BillingDomainId: Identity.IdentityComposer<"@beep/billing-domain"> = composers.$BillingDomainId;

/**
 * Identity composer for the `@beep/billing-server` package.
 *
 * Pre-registered ahead of slice creation.
 *
 * @example
 * ```typescript
 * import { $BillingServerId } from "@beep/identity"
 *
 * const id = $BillingServerId.make("Webhook")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $BillingServerId: Identity.IdentityComposer<"@beep/billing-server"> = composers.$BillingServerId;

/**
 * Identity composer for the `@beep/billing-use-cases` package.
 *
 * Pre-registered ahead of slice creation.
 *
 * @example
 * ```typescript
 * import { $BillingUseCasesId } from "@beep/identity"
 *
 * const id = $BillingUseCasesId.make("ChargeCustomer")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $BillingUseCasesId: Identity.IdentityComposer<"@beep/billing-use-cases"> = composers.$BillingUseCasesId;

// --- iam ---

/**
 * Identity composer for the `@beep/iam-domain` package.
 *
 * Pre-registered ahead of slice creation.
 *
 * @example
 * ```typescript
 * import { $IamDomainId } from "@beep/identity"
 *
 * const id = $IamDomainId.make("User")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $IamDomainId: Identity.IdentityComposer<"@beep/iam-domain"> = composers.$IamDomainId;

/**
 * Identity composer for the `@beep/iam-server` package.
 *
 * Pre-registered ahead of slice creation.
 *
 * @example
 * ```typescript
 * import { $IamServerId } from "@beep/identity"
 *
 * const id = $IamServerId.make("AuthMiddleware")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $IamServerId: Identity.IdentityComposer<"@beep/iam-server"> = composers.$IamServerId;

/**
 * Identity composer for the `@beep/iam-tables` package.
 *
 * Pre-registered ahead of slice creation.
 *
 * @example
 * ```typescript
 * import { $IamTablesId } from "@beep/identity"
 *
 * const id = $IamTablesId.make("UsersTable")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $IamTablesId: Identity.IdentityComposer<"@beep/iam-tables"> = composers.$IamTablesId;

/**
 * Identity composer for the `@beep/iam-use-cases` package.
 *
 * Pre-registered ahead of slice creation.
 *
 * @example
 * ```typescript
 * import { $IamUseCasesId } from "@beep/identity"
 *
 * const id = $IamUseCasesId.make("LoginUser")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $IamUseCasesId: Identity.IdentityComposer<"@beep/iam-use-cases"> = composers.$IamUseCasesId;

/**
 * Identity composer for the `@beep/scratchpad` package.
 *
 * Pre-registered ahead of slice creation.
 *
 * @example
 * ```typescript
 * import { $ScratchpadId } from "@beep/identity"
 *
 * const id = $ScratchpadId.make("entity-schema")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $ScratchpadId: Identity.IdentityComposer<"@beep/scratchpad"> = composers.$ScratchpadId;

/**
 * Identity composer for the `@beep/sandbox` package.
 *
 * Pre-registered ahead of sandbox package creation.
 *
 * @example
 * ```typescript
 * import { $SandboxId } from "@beep/identity"
 *
 * const id = $SandboxId.make("Worktree")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $SandboxId: Identity.IdentityComposer<"@beep/sandbox"> = composers.$SandboxId;

/**
 * @since 0.0.0
 * @category Configuration
 * @type {Identity.IdentityComposer<"@beep/openai">}
 */
export const $OpenaiId: Identity.IdentityComposer<"@beep/openai"> = composers.$OpenaiId;

/**
 * @since 0.0.0
 * @category Configuration
 * @type {Identity.IdentityComposer<"@beep/venice-ai">}
 */
export const $VeniceAiId: Identity.IdentityComposer<"@beep/venice-ai"> = composers.$VeniceAiId;

/**
 * @since 0.0.0
 * @category Configuration
 * @type {Identity.IdentityComposer<"@beep/xai">}
 */
export const $XaiId: Identity.IdentityComposer<"@beep/xai"> = composers.$XaiId;
