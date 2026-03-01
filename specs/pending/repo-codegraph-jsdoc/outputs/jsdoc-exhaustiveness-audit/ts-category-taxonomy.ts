/**
 * @module TSCategoryTaxonomy
 * @description Closed taxonomy for classifying TypeScript code elements in a
 * knowledge graph pipeline. Designed as a discriminated union via `_tag`.
 *
 * Design grounding:
 *   - Architectural convergence across Clean, Hexagonal, Onion, and DDD patterns
 *   - Moggi-style computation categories mapped to practical TypeScript concerns
 *   - Empirical shape of production TypeScript monorepos and framework conventions
 *   - Optimized for graph query utility and deterministic AST-first classification
 *
 * @since 2026-03-01
 */

import type { ApplicableTo } from "./jsdoc-tags-database";

/**
 * Deterministic heuristic for auto-classifying code elements
 * from the AST without LLM inference.
 *
 * @since 2026-03-01
 * @category DomainModel
 */
export interface ASTSignal {
  /** What to look for in the AST (human-readable) */
  readonly signal: string;
  /**
   * How confident this signal alone is (0.0 to 1.0).
   * When combined signals exceed 0.85, classification
   * can skip LLM inference entirely.
   */
  readonly confidence: number;
  /**
   * How to detect this programmatically via ts-morph.
   * Should be specific enough to translate directly to code.
   */
  readonly detection: string;
}

/**
 * Architectural layer mappings across established patterns.
 * Enables cross-framework queries such as "show me all code in the
 * domain core that depends on infrastructure".
 *
 * @since 2026-03-01
 * @category DomainModel
 */
export type ArchitecturalLayer =
  | "domain-entity"
  | "use-case"
  | "interface-adapter"
  | "framework-driver"
  | "port"
  | "adapter"
  | "core"
  | "cross-cutting";

/**
 * Dependency direction profile. Used to validate classifications:
 * if something classified as domain logic has high fan-out, that is a
 * misclassification signal.
 *
 * @since 2026-03-01
 * @category DomainModel
 */
export interface DependencyProfile {
  /** How many other categories typically depend on this one */
  readonly typicalFanIn: "low" | "medium" | "high";
  /** How many other categories this one typically depends on */
  readonly typicalFanOut: "low" | "medium" | "high";
}

/**
 * A single member of the closed taxonomy used to classify
 * TypeScript code elements in the knowledge graph.
 *
 * @since 2026-03-01
 * @category DomainModel
 */
export interface TSCategory {
  /**
   * Discriminant. PascalCase with no spaces.
   * This is the value used in `@category PascalCaseName`.
   */
  readonly _tag: string;
  /** One-sentence definition precise enough to resolve ambiguity. */
  readonly definition: string;
  /**
   * Extended guidance written for LLM-based fallback classification.
   * Should cover membership, non-membership, and edge-case boundaries.
   */
  readonly classificationGuidance: string;
  /** Concrete production-like TypeScript patterns for this category. */
  readonly examples: readonly [string, ...string[]];
  /** Disambiguation patterns that belong in other categories. */
  readonly counterExamples: readonly string[];
  /**
   * Common SyntaxKind names for this category.
   * This is indicative, not exclusive.
   */
  readonly typicalSyntaxKinds: readonly string[];
  /**
   * Deterministic AST signals. Every category includes at least one signal
   * with confidence >= 0.7.
   */
  readonly astSignals: readonly ASTSignal[];
  /**
   * Effect or monad analog for the computational nature of this category.
   * Null when no clean mapping exists.
   */
  readonly effectAnalog: string | null;
  /** Architectural layers this category maps to. */
  readonly architecturalLayers: readonly ArchitecturalLayer[];
  /**
   * Purity classification.
   * - pure: no observable side effects
   * - effectful: performs IO, mutation, or external effects
   * - mixed: both pure and effectful patterns
   */
  readonly purity: "pure" | "effectful" | "mixed";
  /**
   * Semantically adjacent categories for query expansion and ambiguity handling.
   * Reference by `_tag` value.
   */
  readonly adjacentCategories: readonly string[];
  /** Import path glob patterns that are strong classification hints. */
  readonly typicalImportPatterns: readonly string[];
  /** Typical dependency direction profile. */
  readonly dependencyProfile: DependencyProfile;
  /** Lower means document first in topological ordering. */
  readonly documentationPriority: number;
}

/**
 * Confidence threshold where deterministic classification can skip LLM inference.
 *
 * @since 2026-03-01
 * @category Configuration
 */
export const DETERMINISTIC_CLASSIFICATION_THRESHOLD = 0.85;

/**
 * Guardrail threshold used to route low-confidence matches to `Uncategorized`.
 *
 * @since 2026-03-01
 * @category Configuration
 */
export const UNCATEGORIZED_GUARDRAIL_THRESHOLD = 0.45;

/**
 * Closed category taxonomy used by `@category` tags.
 *
 * @since 2026-03-01
 * @category Configuration
 */
export const CATEGORY_TAXONOMY = [
  {
    _tag: "DomainModel",
    definition:
      "Core business concepts and stable type-level contracts that represent domain state and invariants.",
    classificationGuidance:
      "Classify as DomainModel when the element defines domain nouns and canonical shapes (types, interfaces, enums, immutable classes) without orchestration concerns. Put parsers/validators in Validation, workflow coordinators in UseCase, and storage schema bindings in DataAccess. If a symbol is primarily a typed data contract used across layers, prefer DomainModel.",
    examples: [
      "export interface Invoice { readonly id: InvoiceId; readonly lines: ReadonlyArray<LineItem>; readonly currency: Currency }",
      "export type UserId = string & { readonly UserId: unique symbol }",
    ],
    counterExamples: [
      "export const InvoiceSchema = S.Struct({ ... }) belongs to Validation",
      "export const invoice = pgTable('invoice', { ... }) belongs to DataAccess",
    ],
    typicalSyntaxKinds: [
      "InterfaceDeclaration",
      "TypeAliasDeclaration",
      "EnumDeclaration",
      "ClassDeclaration",
      "PropertySignature",
    ],
    astSignals: [
      {
        signal: "Type-only domain declarations with stable noun naming",
        confidence: 0.85,
        detection:
          "Node.isInterfaceDeclaration(node) || Node.isTypeAliasDeclaration(node) || Node.isEnumDeclaration(node)",
      },
      {
        signal: "File imports avoid framework and IO adapters",
        confidence: 0.7,
        detection:
          "node.getSourceFile().getImportDeclarations().every((decl) => !/react|next|express|hono|drizzle-orm|prisma|@effect\\/schema|zod/.test(decl.getModuleSpecifierValue()))",
      },
    ],
    effectAnalog: "Identity",
    architecturalLayers: ["domain-entity", "core"],
    purity: "pure",
    adjacentCategories: ["DomainLogic", "Validation", "Utility"],
    typicalImportPatterns: ["**/domain/**/*.ts", "**/model/**/*.ts", "**/entities/**/*.ts"],
    dependencyProfile: { typicalFanIn: "high", typicalFanOut: "low" },
    documentationPriority: 1,
  },
  {
    _tag: "DomainLogic",
    definition:
      "Pure domain rules and transformations that operate on domain models without infrastructure side effects.",
    classificationGuidance:
      "Use DomainLogic for deterministic computations such as policies, pricing rules, normalization logic, and invariant checks that do not perform IO. If code orchestrates multiple dependencies, classify as UseCase. If code validates external payloads, classify as Validation. If code is framework-neutral but generic across many domains, classify as Utility.",
    examples: [
      "export const computeInvoiceTotal = (invoice: Invoice): Money => ...",
      "export const canTransition = (from: OrderStatus, to: OrderStatus): boolean => ...",
    ],
    counterExamples: [
      "export const createOrderUseCase = Effect.fn(...) belongs to UseCase",
      "export const trimAndCompact = (input: string) => ... belongs to Utility",
    ],
    typicalSyntaxKinds: [
      "FunctionDeclaration",
      "ArrowFunction",
      "MethodDeclaration",
      "BinaryExpression",
      "ReturnStatement",
    ],
    astSignals: [
      {
        signal: "Pure callable with no await and no Promise or Effect return",
        confidence: 0.8,
        detection:
          "Node.isFunctionDeclaration(node) && !node.getDescendantsOfKind(SyntaxKind.AwaitExpression).length && !/^(Promise|Effect)</.test(node.getReturnType().getText())",
      },
      {
        signal: "Business-rule naming and domain-type parameters",
        confidence: 0.72,
        detection:
          "/(calculate|compute|derive|normalize|isValid|can)/.test(node.getSymbol()?.getName() ?? '') && node.getParameters().some((param) => /Id|Status|Amount|Domain/.test(param.getType().getText()))",
      },
    ],
    effectAnalog: "Either",
    architecturalLayers: ["core"],
    purity: "pure",
    adjacentCategories: ["DomainModel", "UseCase", "Validation", "Utility"],
    typicalImportPatterns: ["**/domain/**/*.ts", "**/policies/**/*.ts", "**/rules/**/*.ts"],
    dependencyProfile: { typicalFanIn: "high", typicalFanOut: "low" },
    documentationPriority: 2,
  },
  {
    _tag: "PortContract",
    definition:
      "Abstract capability contracts that define how core and use-case logic talks to external dependencies.",
    classificationGuidance:
      "Assign PortContract to interfaces and type contracts describing repositories, gateways, or service boundaries with no concrete implementation details. If the symbol includes concrete persistence or API client logic, use DataAccess or Integration instead. If it orchestrates work using ports, use UseCase.",
    examples: [
      "export interface UserRepositoryPort { findById(id: UserId): Effect.Effect<Option<User>, RepoError> }",
      "export type MailGateway = { readonly send: (input: MailMessage) => Promise<void> }",
    ],
    counterExamples: [
      "export class PrismaUserRepository implements UserRepositoryPort belongs to DataAccess",
      "export const sendWelcomeEmailUseCase = ... belongs to UseCase",
    ],
    typicalSyntaxKinds: [
      "InterfaceDeclaration",
      "TypeAliasDeclaration",
      "MethodSignature",
      "CallSignature",
      "ConstructSignature",
    ],
    astSignals: [
      {
        signal: "Interface names ending in Port, Repository, or Gateway",
        confidence: 0.9,
        detection:
          "Node.isInterfaceDeclaration(node) && /(Port|Repository|Gateway)$/.test(node.getName() ?? '')",
      },
      {
        signal: "Contract-only declarations with method signatures and no bodies",
        confidence: 0.75,
        detection:
          "(Node.isTypeAliasDeclaration(node) || Node.isInterfaceDeclaration(node)) && !node.getDescendantsOfKind(SyntaxKind.Block).length && node.getText().includes(':')",
      },
    ],
    effectAnalog: "Reader",
    architecturalLayers: ["port", "interface-adapter"],
    purity: "pure",
    adjacentCategories: ["UseCase", "DataAccess", "Integration"],
    typicalImportPatterns: ["**/*Port.ts", "**/*Repository.ts", "**/*Gateway.ts"],
    dependencyProfile: { typicalFanIn: "high", typicalFanOut: "low" },
    documentationPriority: 3,
  },
  {
    _tag: "Validation",
    definition:
      "Boundary parsing, schema validation, and normalization that converts unknown input into trusted typed values.",
    classificationGuidance:
      "Choose Validation for schema definitions, decoders, parser functions, and boundary guards that verify shape, type, and constraints. Do not use Validation for domain entities alone (DomainModel), workflow orchestration (UseCase), or UI request/response handling (Presentation). Validation can be pure or effectful depending on parser runtime.",
    examples: [
      "export const AgentTaskSpecSchema = S.Struct({ ... })",
      "export const parseCreateUser = (input: unknown) => CreateUserSchema.safeParse(input)",
    ],
    counterExamples: [
      "export type AgentTaskSpec = { ... } belongs to DomainModel",
      "export async function post(request: Request) { ... } belongs to Presentation",
    ],
    typicalSyntaxKinds: [
      "VariableDeclaration",
      "FunctionDeclaration",
      "TypeAliasDeclaration",
      "CallExpression",
      "PropertyAssignment",
    ],
    astSignals: [
      {
        signal: "Imports schema-validation libraries",
        confidence: 0.9,
        detection:
          "node.getSourceFile().getImportDeclarations().some((decl) => /@effect\\/schema|effect\\/Schema|zod|valibot|arktype/.test(decl.getModuleSpecifierValue()))",
      },
      {
        signal: "Decoder or parser call patterns on unknown input",
        confidence: 0.75,
        detection:
          "node.getDescendantsOfKind(SyntaxKind.CallExpression).some((callExpr) => /(decode|parse|safeParse|validate)/.test(callExpr.getExpression().getText()))",
      },
    ],
    effectAnalog: "Either",
    architecturalLayers: ["interface-adapter", "cross-cutting"],
    purity: "mixed",
    adjacentCategories: ["DomainModel", "UseCase", "Presentation"],
    typicalImportPatterns: [
      "@effect/schema*",
      "effect/Schema*",
      "zod*",
      "valibot*",
      "arktype*",
      "**/schemas/**/*.ts",
    ],
    dependencyProfile: { typicalFanIn: "medium", typicalFanOut: "low" },
    documentationPriority: 4,
  },
  {
    _tag: "Utility",
    definition:
      "Reusable generic helpers that are not specific to one domain workflow or infrastructure boundary.",
    classificationGuidance:
      "Classify as Utility when code provides cross-context helper behavior such as formatting, collection transforms, class name merging, and simple adapters. If helper logic encodes business policy, use DomainLogic. If helper configures runtime environment or framework behavior, use Configuration or CrossCutting.",
    examples: [
      "export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }",
      "export const chunk = <T>(items: ReadonlyArray<T>, size: number) => ...",
    ],
    counterExamples: [
      "export const calculateRiskScore = (...) => ... belongs to DomainLogic",
      "export const GraphitiConfig = S.Struct({ ...process.env }) belongs to Configuration",
    ],
    typicalSyntaxKinds: [
      "FunctionDeclaration",
      "ArrowFunction",
      "VariableDeclaration",
      "TypeAliasDeclaration",
    ],
    astSignals: [
      {
        signal: "Utility file naming with no framework or data access imports",
        confidence: 0.75,
        detection:
          "/(utils|helpers)/.test(node.getSourceFile().getFilePath()) && node.getSourceFile().getImportDeclarations().every((decl) => !/react|next|express|hono|drizzle-orm|prisma|@effect\\/platform/.test(decl.getModuleSpecifierValue()))",
      },
      {
        signal: "Helper callable declarations in utility modules stay synchronous",
        confidence: 0.72,
        detection:
          "/(utils|helpers)/.test(node.getSourceFile().getFilePath()) && (Node.isFunctionDeclaration(node) || Node.isMethodDeclaration(node) || Node.isArrowFunction(node)) && !node.getDescendantsOfKind(SyntaxKind.AwaitExpression).length",
      },
    ],
    effectAnalog: "Identity",
    architecturalLayers: ["core", "cross-cutting"],
    purity: "pure",
    adjacentCategories: ["DomainLogic", "DomainModel", "CrossCutting"],
    typicalImportPatterns: ["**/utils.ts", "**/helpers.ts", "**/lib/**/*.ts"],
    dependencyProfile: { typicalFanIn: "medium", typicalFanOut: "low" },
    documentationPriority: 5,
  },
  {
    _tag: "UseCase",
    definition:
      "Application-level orchestration that coordinates domain logic, validation, and port interactions to fulfill business intents.",
    classificationGuidance:
      "Use UseCase for command or query handlers and workflow services that coordinate multiple operations and dependencies. If a symbol is mostly transport mapping (HTTP/UI), classify as Presentation. If it is a pure policy function, classify as DomainLogic. If it is a concrete adapter implementation, classify as DataAccess or Integration.",
    examples: [
      "export const createOrderUseCase = Effect.fn('CreateOrderUseCase')(function* (...) { ... })",
      "export async function inviteUserHandler(input: InviteUserInput): Promise<InviteUserResult> { ... }",
    ],
    counterExamples: [
      "export async function GET(request: NextRequest) { ... } belongs to Presentation",
      "export class HttpPaymentGateway { ... } belongs to Integration",
    ],
    typicalSyntaxKinds: [
      "FunctionDeclaration",
      "ArrowFunction",
      "CallExpression",
      "AwaitExpression",
      "ReturnStatement",
    ],
    astSignals: [
      {
        signal: "Exported callable with UseCase, Handler, or Service suffix and async or Effect return",
        confidence: 0.8,
        detection:
          "node.getModifiers().some((modifier) => modifier.getText() === 'export') && /(UseCase|Handler|Service)$/.test(node.getSymbol()?.getName() ?? '') && /Effect<|Promise</.test(node.getReturnType().getText())",
      },
      {
        signal: "Workflow code invoking multiple dependent services or ports",
        confidence: 0.78,
        detection:
          "node.getDescendantsOfKind(SyntaxKind.CallExpression).length >= 2 && (node.getSourceFile().getImportDeclarations().some((decl) => /(Port|Repository|Gateway)/.test(decl.getModuleSpecifierValue())) || node.getText().includes('Effect.fn') || node.getText().includes('Effect.runPromise'))",
      },
    ],
    effectAnalog: "ReaderEither",
    architecturalLayers: ["use-case"],
    purity: "mixed",
    adjacentCategories: ["PortContract", "DomainLogic", "Presentation", "Integration", "DataAccess"],
    typicalImportPatterns: ["**/*UseCase.ts", "**/*Handler.ts", "**/application/**/*.ts"],
    dependencyProfile: { typicalFanIn: "medium", typicalFanOut: "high" },
    documentationPriority: 6,
  },
  {
    _tag: "Presentation",
    definition:
      "Transport and UI surface code that handles requests, responses, rendering, and interaction flow.",
    classificationGuidance:
      "Classify as Presentation for React components, route handlers, controllers, page modules, and HTTP adapters that convert external requests to internal use-case calls and map outputs back to transport formats. If the symbol is mostly schema parsing use Validation. If it is external service client wiring use Integration.",
    examples: [
      "export async function GET(request: NextRequest) { ... }",
      "export default function SignInPage() { return <Suspense fallback={null}>...</Suspense> }",
    ],
    counterExamples: [
      "export const GraphSearchRouteResponseSchema = S.Struct({ ... }) belongs to Validation",
      "export const searchGraph = Effect.fn(...)(...) belongs to UseCase",
    ],
    typicalSyntaxKinds: [
      "FunctionDeclaration",
      "ArrowFunction",
      "ClassDeclaration",
      "JsxElement",
      "VariableDeclaration",
      "ExportAssignment",
    ],
    astSignals: [
      {
        signal: "Framework imports from web and UI stacks",
        confidence: 0.85,
        detection:
          "node.getSourceFile().getImportDeclarations().some((decl) => /react|next|remix|astro|hono|express|fastify/.test(decl.getModuleSpecifierValue()))",
      },
      {
        signal: "Request or response handling signatures",
        confidence: 0.72,
        detection:
          "Node.isFunctionDeclaration(node) && /(request|response|NextRequest|NextResponse|Request|Response)/.test(node.getText())",
      },
    ],
    effectAnalog: "Continuation",
    architecturalLayers: ["interface-adapter", "framework-driver"],
    purity: "effectful",
    adjacentCategories: ["UseCase", "Validation", "Integration", "Configuration"],
    typicalImportPatterns: ["next/*", "react*", "**/app/**/page.tsx", "**/api/**/route.ts"],
    dependencyProfile: { typicalFanIn: "medium", typicalFanOut: "high" },
    documentationPriority: 7,
  },
  {
    _tag: "DataAccess",
    definition:
      "Persistence adapters and data-mapping logic that interact with databases and storage engines.",
    classificationGuidance:
      "Use DataAccess for table schemas, repository implementations, query builders, and persistence mappers. If code talks to third-party APIs rather than persistence stores, use Integration. If it only defines data contracts, use DomainModel. DataAccess is usually effectful and adapter-layer oriented.",
    examples: [
      "export const user = pgTable('user', { ... })",
      "export class UserRepositoryDrizzle implements UserRepositoryPort { ... }",
    ],
    counterExamples: [
      "export interface UserRepositoryPort { ... } belongs to PortContract",
      "export const OpenAIClient = new OpenAI(...) belongs to Integration",
    ],
    typicalSyntaxKinds: [
      "VariableDeclaration",
      "FunctionDeclaration",
      "ClassDeclaration",
      "MethodDeclaration",
      "PropertyAssignment",
    ],
    astSignals: [
      {
        signal: "Database or ORM imports",
        confidence: 0.9,
        detection:
          "node.getSourceFile().getImportDeclarations().some((decl) => /drizzle-orm|prisma|typeorm|kysely|@effect\\/sql|pg|mongodb/.test(decl.getModuleSpecifierValue()))",
      },
      {
        signal: "Query, transaction, or table-definition API usage",
        confidence: 0.75,
        detection:
          "node.getDescendantsOfKind(SyntaxKind.CallExpression).some((callExpr) => /(pgTable|select|insert|update|delete|transaction|query)/.test(callExpr.getExpression().getText()))",
      },
    ],
    effectAnalog: "State",
    architecturalLayers: ["adapter", "framework-driver"],
    purity: "effectful",
    adjacentCategories: ["PortContract", "UseCase", "Integration", "Configuration"],
    typicalImportPatterns: ["drizzle-orm*", "prisma*", "**/db/**/*.ts", "**/repository/**/*.ts"],
    dependencyProfile: { typicalFanIn: "low", typicalFanOut: "medium" },
    documentationPriority: 8,
  },
  {
    _tag: "Integration",
    definition:
      "Adapters for external systems and third-party services such as APIs, queues, payment providers, and AI backends.",
    classificationGuidance:
      "Assign Integration when code encapsulates outbound communication with systems outside the local runtime and persistence boundary. Use DataAccess for databases and storage. Use Presentation for inbound HTTP or UI boundary handlers. Use UseCase for orchestration that consumes integrations.",
    examples: [
      "export const openAiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })",
      "export class StripeBillingGateway { async charge(...) { ... } }",
    ],
    counterExamples: [
      "export const account = pgTable('account', { ... }) belongs to DataAccess",
      "export async function POST(request: Request) { ... } belongs to Presentation",
    ],
    typicalSyntaxKinds: [
      "ClassDeclaration",
      "MethodDeclaration",
      "NewExpression",
      "AwaitExpression",
      "CallExpression",
    ],
    astSignals: [
      {
        signal: "External SDK or HTTP client imports",
        confidence: 0.8,
        detection:
          "node.getSourceFile().getImportDeclarations().some((decl) => /openai|anthropic|resend|stripe|@aws-sdk|axios|fetch|undici/.test(decl.getModuleSpecifierValue()))",
      },
      {
        signal: "Explicit outbound fetch or request construction",
        confidence: 0.72,
        detection:
          "node.getDescendantsOfKind(SyntaxKind.CallExpression).some((callExpr) => /fetch|request|post|get|put/.test(callExpr.getExpression().getText()))",
      },
    ],
    effectAnalog: "IO",
    architecturalLayers: ["adapter", "framework-driver"],
    purity: "effectful",
    adjacentCategories: ["UseCase", "Presentation", "DataAccess", "Configuration"],
    typicalImportPatterns: ["openai*", "stripe*", "@aws-sdk/*", "**/client.ts", "**/gateway/**/*.ts"],
    dependencyProfile: { typicalFanIn: "low", typicalFanOut: "medium" },
    documentationPriority: 9,
  },
  {
    _tag: "Configuration",
    definition:
      "Environment, wiring, and runtime setup that determines how services are instantiated and composed.",
    classificationGuidance:
      "Use Configuration for environment decoding, settings modules, dependency-layer assembly, and runtime bootstrap wiring. Avoid using Configuration for domain contracts (DomainModel), business workflows (UseCase), or generic logging wrappers (CrossCutting) unless the symbol's primary role is setup and composition.",
    examples: [
      "export const AppConfig = S.Struct({ DATABASE_URL: S.NonEmptyString })",
      "export const LiveLayer = Layer.mergeAll(DatabaseLive, LoggerLive, GraphitiLive)",
    ],
    counterExamples: [
      "export const logger = Logger.withSpan(...) belongs to CrossCutting",
      "export const createOrderUseCase = ... belongs to UseCase",
    ],
    typicalSyntaxKinds: [
      "VariableDeclaration",
      "FunctionDeclaration",
      "SourceFile",
      "ModuleDeclaration",
      "PropertyAccessExpression",
    ],
    astSignals: [
      {
        signal: "Environment variable reads or config naming",
        confidence: 0.85,
        detection:
          "node.getText().includes('process.env') || node.getText().includes('Bun.env') || /(Config|Configuration|Settings|Env)/.test(node.getSymbol()?.getName() ?? '')",
      },
      {
        signal: "Dependency wiring and layer composition patterns",
        confidence: 0.72,
        detection:
          "node.getSourceFile().getDescendantsOfKind(SyntaxKind.Identifier).some((identifier) => /(Layer|provide|make)/.test(identifier.getText()))",
      },
    ],
    effectAnalog: "Reader",
    architecturalLayers: ["framework-driver", "cross-cutting"],
    purity: "mixed",
    adjacentCategories: ["Integration", "DataAccess", "Presentation", "CrossCutting"],
    typicalImportPatterns: ["**/config/**/*.ts", "**/*Config.ts", "**/*Settings.ts", "**/env/**/*.ts"],
    dependencyProfile: { typicalFanIn: "high", typicalFanOut: "medium" },
    documentationPriority: 10,
  },
  {
    _tag: "CrossCutting",
    definition:
      "Shared operational concerns that span multiple layers, such as auth, logging, tracing, metrics, and caching.",
    classificationGuidance:
      "Use CrossCutting for behavior that is orthogonal to one business use case and is intentionally reused across layers. If logic is specific to one workflow, use UseCase. If code primarily configures runtime settings, use Configuration. If code only formats data with no operational concern, use Utility.",
    examples: [
      "export const withRequestLogging = <A>(effect: Effect.Effect<A, E, R>) => ...",
      "export const authMiddleware = (request: Request) => ...",
    ],
    counterExamples: [
      "export const cn = (...inputs) => ... belongs to Utility",
      "export const graphSearchRoute = async (...) => ... belongs to Presentation",
    ],
    typicalSyntaxKinds: [
      "SourceFile",
      "ImportDeclaration",
      "FunctionDeclaration",
      "MethodDeclaration",
      "CallExpression",
      "Identifier",
    ],
    astSignals: [
      {
        signal: "Imports for auth, logging, metrics, tracing, or cache modules",
        confidence: 0.75,
        detection:
          "node.getSourceFile().getImportDeclarations().some((decl) => /auth|logger|pino|winston|otel|opentelemetry|metrics|cache|redis/.test(decl.getModuleSpecifierValue()))",
      },
      {
        signal: "Operational concern naming in exported symbol",
        confidence: 0.7,
        detection:
          "/(Auth|Logger|Log|Trace|Metric|Cache|Audit|Telemetry)/.test(node.getSymbol()?.getName() ?? '')",
      },
    ],
    effectAnalog: "Writer",
    architecturalLayers: ["cross-cutting"],
    purity: "mixed",
    adjacentCategories: ["Configuration", "Utility", "Presentation", "UseCase"],
    typicalImportPatterns: ["**/middleware/**/*.ts", "**/logger/**/*.ts", "**/auth/**/*.ts", "**/metrics/**/*.ts"],
    dependencyProfile: { typicalFanIn: "medium", typicalFanOut: "medium" },
    documentationPriority: 11,
  },
  {
    _tag: "Uncategorized",
    definition:
      "Fallback category for elements that remain ambiguous after deterministic signals and boundary-context rules.",
    classificationGuidance:
      "Use Uncategorized only as a last resort. First classify by nearest exportable ancestor for statement/expression/signature nodes. If no ancestor applies, use source-file dominant category. Only assign Uncategorized when combined confidence for known categories remains below 0.45 or signals are contradictory without a clear winner.",
    examples: [
      "Generated shim modules with mixed declarations and no stable semantic role",
      "Ad hoc migration scratch files that blend setup, data transformation, and one-off scripts",
    ],
    counterExamples: [
      "Any symbol with a stable dominant concern (validation, data access, presentation, use case, etc.) should use that concrete category",
      "A file path ending in /utils.ts with pure helpers belongs to Utility, not Uncategorized",
    ],
    typicalSyntaxKinds: [
      "SourceFile",
      "ExpressionStatement",
      "IfStatement",
      "ForStatement",
      "ReturnStatement",
      "ThrowStatement",
      "Identifier",
      "BinaryExpression",
      "Block",
    ],
    astSignals: [
      {
        signal: "No known category exceeds fallback confidence threshold",
        confidence: 1,
        detection:
          "Node.isSourceFile(node) && scoredCandidates.every((entry) => entry.combinedConfidence < 0.45)",
      },
    ],
    effectAnalog: null,
    architecturalLayers: ["cross-cutting"],
    purity: "mixed",
    adjacentCategories: [
      "DomainModel",
      "DomainLogic",
      "PortContract",
      "Validation",
      "Utility",
      "UseCase",
      "Presentation",
      "DataAccess",
      "Integration",
      "Configuration",
      "CrossCutting",
    ],
    typicalImportPatterns: [],
    dependencyProfile: { typicalFanIn: "low", typicalFanOut: "low" },
    documentationPriority: 99,
  },
] as const satisfies ReadonlyArray<TSCategory>;

/**
 * All valid category tag values.
 *
 * @since 2026-03-01
 * @category DomainModel
 */
export type CategoryTag = (typeof CATEGORY_TAXONOMY)[number]["_tag"];

/**
 * Deterministic precedence for external classifier conflict resolution.
 * This policy is intentionally separate from `getCandidateCategories`,
 * which preserves canonical sorting by confidence and `_tag`.
 *
 * @since 2026-03-01
 * @category Configuration
 */
export const CATEGORY_PRECEDENCE: ReadonlyArray<CategoryTag> = [
  "Validation",
  "DataAccess",
  "Integration",
  "Presentation",
  "UseCase",
  "PortContract",
  "Configuration",
  "CrossCutting",
  "DomainModel",
  "DomainLogic",
  "Utility",
  "Uncategorized",
];

/**
 * Explicit fallback policy for non-declaration nodes where direct classification
 * is ambiguous without structural context.
 *
 * @since 2026-03-01
 * @category Configuration
 */
export const CONTEXT_FALLBACK_POLICY = {
  appliesTo: ["statement", "expression", "signature"],
  resolutionSteps: [
    "Classify by nearest exportable ancestor symbol first.",
    "If no ancestor applies, classify by source-file dominant category.",
    "If ambiguity remains or score is below guardrail, classify as Uncategorized.",
  ],
  fallbackCategory: "Uncategorized",
  threshold: UNCATEGORIZED_GUARDRAIL_THRESHOLD,
} as const;

/**
 * Complete routing table from `ApplicableTo` node intent to candidate categories.
 * This makes taxonomy completeness auditable against HasJSDoc surfaces.
 *
 * @since 2026-03-01
 * @category Configuration
 */
export const APPLICABLE_TO_CATEGORY_ROUTING: Readonly<
  Record<ApplicableTo, ReadonlyArray<CategoryTag>>
> = {
  function: ["UseCase", "DomainLogic", "Validation", "Presentation", "Utility"],
  method: ["UseCase", "DomainLogic", "DataAccess", "Integration", "CrossCutting"],
  class: ["DomainModel", "UseCase", "DataAccess", "Integration", "Presentation", "CrossCutting"],
  "class-static-block": ["Configuration", "CrossCutting"],
  interface: ["DomainModel", "PortContract"],
  "type-alias": ["DomainModel", "PortContract", "Validation", "Utility"],
  enum: ["DomainModel"],
  "enum-member": ["DomainModel"],
  variable: ["Utility", "Validation", "Configuration", "DataAccess", "CrossCutting"],
  constant: ["Utility", "DomainModel", "Configuration", "CrossCutting"],
  property: ["DomainModel", "DataAccess", "Validation", "Configuration"],
  accessor: ["DomainModel", "DataAccess", "CrossCutting"],
  constructor: ["UseCase", "DataAccess", "Integration"],
  parameter: ["UseCase", "Validation", "Presentation", "DomainLogic"],
  signature: ["PortContract", "DomainLogic", "UseCase", "Validation"],
  "index-signature": ["DomainModel", "PortContract"],
  "type-parameter": ["DomainModel", "Utility", "Validation"],
  "tuple-member": ["DomainModel"],
  "export-specifier": ["Presentation", "UseCase", "Utility", "Configuration"],
  identifier: ["Uncategorized", "Utility", "DomainModel", "CrossCutting"],
  statement: ["Presentation", "UseCase", "CrossCutting", "Uncategorized"],
  expression: ["DomainLogic", "Validation", "Presentation", "Integration", "Uncategorized"],
  module: ["Configuration", "Presentation", "UseCase", "Integration"],
  namespace: ["Configuration", "DomainModel"],
  file: ["Configuration", "Presentation", "DataAccess", "Uncategorized"],
  event: ["CrossCutting", "Presentation"],
  mixin: ["CrossCutting", "Presentation", "Integration"],
  any: ["Uncategorized"],
};

const CATEGORY_BY_TAG = new Map<string, TSCategory>(
  CATEGORY_TAXONOMY.map((category) => [category._tag, category])
);

const clampConfidence = (confidence: number): number =>
  Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0;

const combineSignalConfidences = (confidences: ReadonlyArray<number>): number =>
  confidences.reduce((combined, confidence) => {
    const clamped = clampConfidence(confidence);
    return 1 - (1 - combined) * (1 - clamped);
  }, 0);

/**
 * Get deterministic conflict precedence rank for a category tag.
 *
 * @since 2026-03-01
 * @category Utility
 */
export function getCategoryPrecedence(tag: CategoryTag): number {
  const index = CATEGORY_PRECEDENCE.indexOf(tag);
  return index === -1 ? CATEGORY_PRECEDENCE.length : index;
}

/**
 * Lookup a category by `_tag`.
 *
 * @since 2026-03-01
 * @category Utility
 */
export function getCategory(tag: string): TSCategory | undefined {
  return CATEGORY_BY_TAG.get(tag);
}

/**
 * Get categories by purity classification.
 *
 * @since 2026-03-01
 * @category Utility
 */
export function getCategoriesByPurity(
  purity: TSCategory["purity"]
): ReadonlyArray<TSCategory> {
  return CATEGORY_TAXONOMY.filter((category) => category.purity === purity);
}

/**
 * Get categories by architectural layer.
 *
 * @since 2026-03-01
 * @category Utility
 */
export function getCategoriesByArchLayer(
  layer: ArchitecturalLayer
): ReadonlyArray<TSCategory> {
  return CATEGORY_TAXONOMY.filter((category) =>
    category.architecturalLayers.some((archLayer) => archLayer === layer)
  );
}

/**
 * Get categories by Effect or monad analog.
 *
 * @since 2026-03-01
 * @category Utility
 */
export function getCategoriesByEffectAnalog(
  analog: string
): ReadonlyArray<TSCategory> {
  return CATEGORY_TAXONOMY.filter((category) => category.effectAnalog === analog);
}

/**
 * Get ordered candidate categories for an `ApplicableTo` node intent.
 *
 * @since 2026-03-01
 * @category Utility
 */
export function getCategoriesForApplicableTo(
  applicableTo: ApplicableTo
): ReadonlyArray<TSCategory> {
  return APPLICABLE_TO_CATEGORY_ROUTING[applicableTo]
    .map((tag) => getCategory(tag))
    .filter((category): category is TSCategory => category !== undefined);
}

/**
 * Get categories whose AST signals could match a code element.
 * Unknown categories are ignored.
 *
 * Sorting policy:
 * 1) `combinedConfidence` descending
 * 2) `_tag` ascending
 *
 * `CATEGORY_PRECEDENCE` is intentionally NOT used here.
 * It is an external conflict policy for classifier flows.
 *
 * Combined confidence formula:
 *   1 - Π(1 - c_i)
 *
 * @since 2026-03-01
 * @category Utility
 */
export function getCandidateCategories(
  signals: ReadonlyArray<{ category: string; confidence: number }>
): ReadonlyArray<{ category: TSCategory; combinedConfidence: number }> {
  const grouped = new Map<string, Array<number>>();

  for (const signal of signals) {
    if (!grouped.has(signal.category)) {
      grouped.set(signal.category, []);
    }
    const current = grouped.get(signal.category);
    if (current) {
      current.push(signal.confidence);
    }
  }

  const combined = new Array<{ category: TSCategory; combinedConfidence: number }>();

  grouped.forEach((confidences, categoryName) => {
    const category = getCategory(categoryName);
    if (!category) {
      return;
    }
    combined.push({
      category,
      combinedConfidence: combineSignalConfidences(confidences),
    });
  });

  return combined.sort((left, right) => {
    if (left.combinedConfidence !== right.combinedConfidence) {
      return right.combinedConfidence - left.combinedConfidence;
    }
    return left.category._tag.localeCompare(right.category._tag);
  });
}

/**
 * Design decisions and tradeoffs
 *
 * 1) Why these categories and not others:
 * The set was intentionally constrained to 12 tags (11 operational plus fallback)
 * to stay queryable and memorable while covering common production boundaries:
 * domain, orchestration, ports/adapters, validation, presentation, persistence,
 * integration, configuration, and shared operational concerns.
 *
 * 2) Known overlaps:
 * UseCase vs Presentation can overlap around route handlers; boundary rule is:
 * transport mapping belongs to Presentation, orchestration belongs to UseCase.
 * DomainLogic vs Utility can overlap for pure helpers; boundary rule is:
 * business policy belongs to DomainLogic, generic reusable mechanics to Utility.
 * Typical syntax kinds were reduced for heavily overlapping pairs to improve
 * discriminability while keeping the fixed 12-category set stable.
 *
 * 3) Known gaps:
 * Highly mixed files, generated shims, and one-off scripts may lack a dominant
 * semantic role. Those are intentionally routed to Uncategorized when confidence
 * remains below `UNCATEGORIZED_GUARDRAIL_THRESHOLD`.
 *
 * 4) Relationship to Effect:
 * Effect signatures improve deterministic classification, especially for
 * orchestration and port boundaries. Strong typed channels make Validation and
 * UseCase detection more reliable than untyped Promise-only code.
 *
 * 5) Evolution path:
 * Add new categories only when Uncategorized exceeds 10% in stable samples and
 * overlap cannot be resolved via guidance updates. Preserve existing `_tag`
 * values as schema-stable IDs; introduce additions additively and re-run
 * migration validation over historical graph nodes. Precedence policy remains
 * separate from helper sorting so query-layer behavior is deterministic and
 * stable even when classifier conflict policy evolves.
 */
