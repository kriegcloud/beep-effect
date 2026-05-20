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
  // P3 Professional Runtime Proof Packages
  "agent-capability-domain",
  "agent-capability-use-cases",
  "epistemic-domain",
  "law-practice-domain",
  "professional-desktop",
  "professional-runtime-proof",
  "wealth-management-domain",
  "workspace-domain",

  // Repository Tooling Packages
  "repo-ai-metrics",
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
  "oip-web",
  "drizzle",
  "duckdb",
  "face-detection",
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
  "xai",
  "acp",
  "openai-compat",
  "workspace-tables",
  "architecture-lab-domain",
  "architecture-lab-use-cases",
  "architecture-lab-config",
  "architecture-lab-server",
  "architecture-lab-tables",
  "architecture-lab-client",
  "architecture-lab-ui",
  "canvas-domain",
  "canvas-use-cases",
  "canvas-server",
  "canvas-client",
  "canvas-ui",
  "architecture-lab-proof",
  "stack-installer",
  "installer-domain",
  "installer-use-cases",
  "installer-server",
  "runpod",
  "onepassword-cli",
  "discord",
  "ai-provider-cli",
  "sanity",
  "hubspot",
  "phoenix",
  "konva",
  "canvas",
  "repo-codegraph"
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
 * Identity composer for the `@beep/repo-ai-metrics` package.
 *
 * @example
 * ```typescript
 * import { $RepoAiMetricsId } from "@beep/identity"
 *
 * const id = $RepoAiMetricsId.make("AgentTask")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RepoAiMetricsId = composers.$RepoAiMetricsId;

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
 * Identity composer for the `@beep/repo-configs` package.
 *
 * @example
 * ```typescript
 * import { $RepoConfigsId } from "@beep/identity"
 *
 * const id = $RepoConfigsId.make("Command")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RepoConfigsId = composers.$RepoConfigsId;

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
 * Identity composer for the `@beep/professional-desktop` package.
 *
 * @example
 * ```typescript
 * import { $ProfessionalDesktopId } from "@beep/identity"
 *
 * const id = $ProfessionalDesktopId.make("Workbench")
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const $ProfessionalDesktopId: Identity.IdentityComposer<"@beep/professional-desktop"> =
  composers.$ProfessionalDesktopId;

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
 * @category configuration
 * @since 0.0.0
 */
export const RepoPkgs = composers;

/**
 * @since 0.0.0
 * @category configuration
 */
export const $MdId: Identity.IdentityComposer<"@beep/md"> = composers.$MdId;

/**
 * @since 0.0.0
 * @category configuration
 */
export const $CodedankWebId: Identity.IdentityComposer<"@beep/codedank-web"> = composers.$CodedankWebId;

/**
 * @since 0.0.0
 * @category configuration
 */
export const $OipWebId: Identity.IdentityComposer<"@beep/oip-web"> = composers.$OipWebId;

/**
 * @since 0.0.0
 * @category configuration
 */
export const $DrizzleId: Identity.IdentityComposer<"@beep/drizzle"> = composers.$DrizzleId;

/**
 * @since 0.0.0
 * @category configuration
 */
export const $DuckdbId: Identity.IdentityComposer<"@beep/duckdb"> = composers.$DuckdbId;

/**
 * @since 0.0.0
 * @category configuration
 */
export const $FaceDetectionId: Identity.IdentityComposer<"@beep/face-detection"> = composers.$FaceDetectionId;

/**
 * @since 0.0.0
 * @category configuration
 */
export const $FfmpegId: Identity.IdentityComposer<"@beep/ffmpeg"> = composers.$FfmpegId;

/**
 * @since 0.0.0
 * @category configuration
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
 * @category configuration
 */
export const $OpenaiId: Identity.IdentityComposer<"@beep/openai"> = composers.$OpenaiId;

/**
 * @since 0.0.0
 * @category configuration
 */
export const $VeniceAiId: Identity.IdentityComposer<"@beep/venice-ai"> = composers.$VeniceAiId;

/**
 * @since 0.0.0
 * @category configuration
 */
export const $XaiId: Identity.IdentityComposer<"@beep/xai"> = composers.$XaiId;

/**
 * Identity composer for `@beep/acp`.
 *
 * @example
 * ```typescript
 * import { $AcpId } from "@beep/identity"
 *
 * const id = $AcpId.make("AcpClient")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $AcpId: Identity.IdentityComposer<"@beep/acp"> = composers.$AcpId;

/**
 * Identity composer for `@beep/openai-compat`.
 *
 * @example
 * ```typescript
 * import { $OpenaiCompatId } from "@beep/identity"
 *
 * const id = $OpenaiCompatId.make("LanguageModel")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $OpenaiCompatId: Identity.IdentityComposer<"@beep/openai-compat"> = composers.$OpenaiCompatId;

/**
 * Identity composer for `@beep/workspace-tables`.
 *
 * @example
 * ```typescript
 * import { $WorkspaceTablesId } from "@beep/identity"
 *
 * const id = $WorkspaceTablesId.make("WorkspaceTable")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $WorkspaceTablesId: Identity.IdentityComposer<"@beep/workspace-tables"> = composers.$WorkspaceTablesId;

/**
 * Identity composer for `@beep/architecture-lab-domain`.
 *
 * @example
 * ```typescript
 * import { $ArchitectureLabDomainId } from "@beep/identity"
 *
 * const id = $ArchitectureLabDomainId.make("WorkItem")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $ArchitectureLabDomainId: Identity.IdentityComposer<"@beep/architecture-lab-domain"> =
  composers.$ArchitectureLabDomainId;

/**
 * Identity composer for `@beep/architecture-lab-use-cases`.
 *
 * @example
 * ```typescript
 * import { $ArchitectureLabUseCasesId } from "@beep/identity"
 *
 * const id = $ArchitectureLabUseCasesId.make("WorkItemService")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $ArchitectureLabUseCasesId: Identity.IdentityComposer<"@beep/architecture-lab-use-cases"> =
  composers.$ArchitectureLabUseCasesId;

/**
 * Identity composer for `@beep/architecture-lab-config`.
 *
 * @example
 * ```typescript
 * import { $ArchitectureLabConfigId } from "@beep/identity"
 *
 * const id = $ArchitectureLabConfigId.make("Config")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $ArchitectureLabConfigId: Identity.IdentityComposer<"@beep/architecture-lab-config"> =
  composers.$ArchitectureLabConfigId;

/**
 * Identity composer for `@beep/architecture-lab-server`.
 *
 * @example
 * ```typescript
 * import { $ArchitectureLabServerId } from "@beep/identity"
 *
 * const id = $ArchitectureLabServerId.make("Layer")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $ArchitectureLabServerId: Identity.IdentityComposer<"@beep/architecture-lab-server"> =
  composers.$ArchitectureLabServerId;

/**
 * Identity composer for `@beep/architecture-lab-tables`.
 *
 * @example
 * ```typescript
 * import { $ArchitectureLabTablesId } from "@beep/identity"
 *
 * const id = $ArchitectureLabTablesId.make("WorkItemTable")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $ArchitectureLabTablesId: Identity.IdentityComposer<"@beep/architecture-lab-tables"> =
  composers.$ArchitectureLabTablesId;

/**
 * Identity composer for `@beep/architecture-lab-client`.
 *
 * @example
 * ```typescript
 * import { $ArchitectureLabClientId } from "@beep/identity"
 *
 * const id = $ArchitectureLabClientId.make("WorkItemClient")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $ArchitectureLabClientId: Identity.IdentityComposer<"@beep/architecture-lab-client"> =
  composers.$ArchitectureLabClientId;

/**
 * Identity composer for `@beep/architecture-lab-ui`.
 *
 * @example
 * ```typescript
 * import { $ArchitectureLabUiId } from "@beep/identity"
 *
 * const id = $ArchitectureLabUiId.make("WorkItemViewModel")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $ArchitectureLabUiId: Identity.IdentityComposer<"@beep/architecture-lab-ui"> =
  composers.$ArchitectureLabUiId;

/**
 * Identity composer for `@beep/architecture-lab-proof`.
 *
 * @example
 * ```typescript
 * import { $ArchitectureLabProofId } from "@beep/identity"
 *
 * const id = $ArchitectureLabProofId.make("Proof")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $ArchitectureLabProofId: Identity.IdentityComposer<"@beep/architecture-lab-proof"> =
  composers.$ArchitectureLabProofId;

// --- stack installer ---

/**
 * Identity composer for `@beep/stack-installer`.
 *
 * @example
 * ```typescript
 * import { $StackInstallerId } from "@beep/identity"
 *
 * const id = $StackInstallerId.make("Workbench")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $StackInstallerId: Identity.IdentityComposer<"@beep/stack-installer"> = composers.$StackInstallerId;

/**
 * Identity composer for `@beep/installer-domain`.
 *
 * @category configuration
 * @since 0.0.0
 */
export const $InstallerDomainId: Identity.IdentityComposer<"@beep/installer-domain"> = composers.$InstallerDomainId;

/**
 * Identity composer for `@beep/installer-use-cases`.
 *
 * @category configuration
 * @since 0.0.0
 */
export const $InstallerUseCasesId: Identity.IdentityComposer<"@beep/installer-use-cases"> =
  composers.$InstallerUseCasesId;

/**
 * Identity composer for `@beep/installer-server`.
 *
 * @category configuration
 * @since 0.0.0
 */
export const $InstallerServerId: Identity.IdentityComposer<"@beep/installer-server"> = composers.$InstallerServerId;

/**
 * Identity composer for `@beep/runpod`.
 *
 * @example
 * ```typescript
 * import { $RunpodId } from "@beep/identity"
 *
 * const id = $RunpodId.make("Runpod")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RunpodId: Identity.IdentityComposer<"@beep/runpod"> = composers.$RunpodId;

/**
 * Identity composer for `@beep/onepassword-cli`.
 *
 * @example
 * ```typescript
 * import { $OnepasswordCliId } from "@beep/identity"
 *
 * const id = $OnepasswordCliId.make("OnepasswordCli")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $OnepasswordCliId: Identity.IdentityComposer<"@beep/onepassword-cli"> = composers.$OnepasswordCliId;

/**
 * Identity composer for `@beep/discord`.
 *
 * @example
 * ```typescript
 * import { $DiscordId } from "@beep/identity"
 *
 * const id = $DiscordId.make("Discord")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $DiscordId: Identity.IdentityComposer<"@beep/discord"> = composers.$DiscordId;

/**
 * Identity composer for `@beep/ai-provider-cli`.
 *
 * @example
 * ```typescript
 * import { $AiProviderCliId } from "@beep/identity"
 *
 * const id = $AiProviderCliId.make("AiProviderCli")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $AiProviderCliId: Identity.IdentityComposer<"@beep/ai-provider-cli"> = composers.$AiProviderCliId;

/**
 * Identity composer for `@beep/sanity`.
 *
 * @example
 * ```typescript
 * import { $SanityId } from "@beep/identity"
 *
 * const id = $SanityId.make("Sanity")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $SanityId: Identity.IdentityComposer<"@beep/sanity"> = composers.$SanityId;

/**
 * Identity composer for `@beep/hubspot`.
 *
 * @example
 * ```typescript
 * import { $HubspotId } from "@beep/identity"
 *
 * const id = $HubspotId.make("Hubspot")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $HubspotId: Identity.IdentityComposer<"@beep/hubspot"> = composers.$HubspotId;

/**
 * Identity composer for `@beep/phoenix`.
 *
 * @example
 * ```typescript
 * import { $PhoenixId } from "@beep/identity"
 *
 * const id = $PhoenixId.make("Phoenix")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $PhoenixId: Identity.IdentityComposer<"@beep/phoenix"> = composers.$PhoenixId;

/**
 * Identity composer for `@beep/konva`.
 *
 * @example
 * ```typescript
 * import { $KonvaId } from "@beep/identity"
 *
 * const id = $KonvaId.make("Konva")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $KonvaId: Identity.IdentityComposer<"@beep/konva"> = composers.$KonvaId;

/**
 * Identity composer for `@beep/canvas-domain`.
 *
 * @example
 * ```typescript
 * import { $CanvasDomainId } from "@beep/identity"
 *
 * const id = $CanvasDomainId.make("CanvasProject")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $CanvasDomainId: Identity.IdentityComposer<"@beep/canvas-domain"> = composers.$CanvasDomainId;

/**
 * Identity composer for `@beep/canvas-use-cases`.
 *
 * @example
 * ```typescript
 * import { $CanvasUseCasesId } from "@beep/identity"
 *
 * const id = $CanvasUseCasesId.make("CanvasProjectUseCases")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $CanvasUseCasesId: Identity.IdentityComposer<"@beep/canvas-use-cases"> = composers.$CanvasUseCasesId;

/**
 * Identity composer for `@beep/canvas-server`.
 *
 * @example
 * ```typescript
 * import { $CanvasServerId } from "@beep/identity"
 *
 * const id = $CanvasServerId.make("CanvasProjectBundleRepository")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $CanvasServerId: Identity.IdentityComposer<"@beep/canvas-server"> = composers.$CanvasServerId;

/**
 * Identity composer for `@beep/canvas-client`.
 *
 * @example
 * ```typescript
 * import { $CanvasClientId } from "@beep/identity"
 *
 * const id = $CanvasClientId.make("CanvasEditorState")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $CanvasClientId: Identity.IdentityComposer<"@beep/canvas-client"> = composers.$CanvasClientId;

/**
 * Identity composer for `@beep/canvas-ui`.
 *
 * @example
 * ```typescript
 * import { $CanvasUiId } from "@beep/identity"
 *
 * const id = $CanvasUiId.make("CanvasEditor")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $CanvasUiId: Identity.IdentityComposer<"@beep/canvas-ui"> = composers.$CanvasUiId;

/**
 * Identity composer for `@beep/canvas`.
 *
 * @example
 * ```typescript
 * import { $CanvasId } from "@beep/identity"
 *
 * const id = $CanvasId.make("Canvas")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $CanvasId: Identity.IdentityComposer<"@beep/canvas"> = composers.$CanvasId;

/**
 * Identity composer for `@beep/repo-codegraph`.
 *
 * 
 * @example
 * ```typescript
 * import { $RepoCodegraphId } from "@beep/identity"
 *
 * const id = $RepoCodegraphId.make("RepoCodegraph")
 * void id
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const $RepoCodegraphId: Identity.IdentityComposer<"@beep/repo-codegraph"> = composers.$RepoCodegraphId;
