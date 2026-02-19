# JSDoc Analysis Report: @beep/repo-cli

> **Generated**: 2025-12-06T13:13:22.254Z
> **Package**: tooling/cli
> **Status**: 128 exports need documentation

---

## Instructions for Agent

You are tasked with adding missing JSDoc documentation to this package. Follow these rules:

1. **Required Tags**: Every public export must have:
   - `@category` - Hierarchical category (e.g., "Constructors", "Models/User", "Utils/String")
   - `@example` - Working TypeScript code example with imports
   - `@since` - Version when added (use `0.1.0` for new items)

2. **Example Format**:
   ````typescript
   /**
    * Brief description of what this does.
    *
    * @example
    * ```typescript
    * import { MyThing } from "@beep/repo-cli"
    *
    * const result = MyThing.make({ field: "value" })
    * console.log(result)
    * // => { field: "value" }
    * ```
    *
    * @category Constructors
    * @since 0.1.0
    */
   ````

3. **Workflow**:
   - Work through the checklist below in order
   - Mark items complete by changing `[ ]` to `[x]`
   - After completing all items, delete this file

---

## Progress Checklist

### High Priority (Missing all required tags)

- [ ] `src/commands/docgen/agents/schemas.ts:48` — **DocgenWorkflowPayload** (type)
  - Missing: @category, @example, @since

- [ ] `src/commands/docgen/agents/schemas.ts:82` — **TokenUsage** (type)
  - Missing: @category, @example, @since

- [ ] `src/commands/docgen/agents/tools.ts:54` — **AnalyzePackageParams** (type)
  - Missing: @category, @example, @since

- [ ] `src/commands/docgen/agents/tools.ts:82` — **ReadSourceFileParams** (type)
  - Missing: @category, @example, @since

- [ ] `src/commands/docgen/agents/tools.ts:115` — **WriteSourceFileParams** (type)
  - Missing: @category, @example, @since

- [ ] `src/commands/docgen/agents/tools.ts:153` — **InsertJsDocParams** (type)
  - Missing: @category, @example, @since

- [ ] `src/commands/docgen/agents/tools.ts:182` — **ValidateExamplesParams** (type)
  - Missing: @category, @example, @since

- [ ] `src/commands/docgen/agents/tools.ts:214` — **SearchEffectDocsParams** (type)
  - Missing: @category, @example, @since

- [ ] `src/commands/docgen/agents/tools.ts:249` — **ListPackageExportsParams** (type)
  - Missing: @category, @example, @since

- [ ] `src/commands/docgen/agents/tools.ts:270` — **DocFixerToolkit** (type)
  - Missing: @category, @example, @since

- [ ] `src/commands/docgen/shared/ast.ts:531` — **getSourceFiles** (const)
  - Missing: @category, @example, @since
  - Has: @param, @param, @param, @returns, @throws
  - Context: Get all TypeScript source files in a directory.

- [ ] `src/commands/docgen/shared/ast.ts:574` — **analyzePackage** (const)
  - Missing: @category, @example, @since
  - Has: @param, @param, @param, @returns
  - Context: Analyze all source files in a package directory.

- [ ] `src/commands/docgen/shared/config.ts:58` — **TSCONFIG_PRECEDENCE** (const)
  - Missing: @category, @example, @since
  - Context: TSConfig file search order - first match wins

- [ ] `src/commands/docgen/shared/config.ts:67` — **loadDocgenConfig** (const)
  - Missing: @category, @example, @since
  - Has: @param, @returns, @throws
  - Context: Load and parse docgen.json from a package directory.

- [ ] `src/commands/docgen/shared/config.ts:117` — **hasDocgenConfig** (const)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Check if docgen.json exists in a package directory.

- [ ] `src/commands/docgen/shared/config.ts:135` — **findTsConfig** (const)
  - Missing: @category, @example, @since
  - Has: @param, @returns, @throws
  - Context: Find the best tsconfig file in a package directory.

- [ ] `src/commands/docgen/shared/config.ts:166` — **writeDocgenConfig** (const)
  - Missing: @category, @example, @since
  - Has: @param, @param, @throws
  - Context: Write docgen.json to a package directory.

- [ ] `src/commands/docgen/shared/config.ts:195` — **loadTsConfig** (const)
  - Missing: @category, @example, @since
  - Has: @param, @returns, @throws
  - Context: Load and parse a tsconfig.json file.

- [ ] `src/commands/docgen/shared/discovery.ts:191` — **discoverAllPackages** (const)
  - Missing: @category, @example, @since
  - Has: @returns
  - Context: Discover all workspace packages in the monorepo.

- [ ] `src/commands/docgen/shared/discovery.ts:220` — **discoverConfiguredPackages** (const)
  - Missing: @category, @example, @since
  - Has: @returns
  - Context: Discover packages that have docgen.json configured.

- [ ] `src/commands/docgen/shared/discovery.ts:237` — **discoverPackagesWithDocs** (const)
  - Missing: @category, @example, @since
  - Has: @returns
  - Context: Discover packages that have generated documentation.

- [ ] `src/commands/docgen/shared/discovery.ts:257` — **resolvePackagePath** (const)
  - Missing: @category, @example, @since
  - Has: @param, @returns, @throws, @throws
  - Context: Resolve a package path (relative or absolute) to PackageInfo.

- [ ] `src/commands/docgen/shared/discovery.ts:309` — **resolvePackageByName** (const)
  - Missing: @category, @example, @since
  - Has: @param, @returns, @throws
  - Context: Resolve a package by name from the workspace.

- [ ] `src/commands/docgen/shared/error-handling.ts:105` — **makeErrorAccumulator** (const)
  - Missing: @category, @example, @since
  - Context: Create a new error accumulator

- [ ] `src/commands/docgen/shared/error-handling.ts:179` — **apiRetrySchedule** (const)
  - Missing: @category, @example, @since
  - Context: Retry policy for API calls.

- [ ] `src/commands/docgen/shared/error-handling.ts:212` — **formatCause** (const)
  - Missing: @category, @example, @since
  - Context: Format a Cause for display.

- [ ] `src/commands/docgen/shared/error-handling.ts:219` — **causeMessage** (const)
  - Missing: @category, @example, @since
  - Context: Extract error summary from a Cause.

- [ ] `src/commands/docgen/shared/error-handling.ts:233` — **formatBatchResult** (const)
  - Missing: @category, @example, @since
  - Context: Format batch result for display.

- [ ] `src/commands/docgen/shared/index.ts:36` — **export * from "./ast.js";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./ast.js needs documentation

- [ ] `src/commands/docgen/shared/index.ts:58` — **export * from "./config.js";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./config.js needs documentation

- [ ] `src/commands/docgen/shared/index.ts:78` — **export * from "./discovery.js";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./discovery.js needs documentation

- [ ] `src/commands/docgen/shared/index.ts:108` — **export * from "./markdown.js";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./markdown.js needs documentation

- [ ] `src/commands/docgen/shared/index.ts:128` — **export * from "./output.js";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./output.js needs documentation

- [ ] `src/commands/docgen/shared/index.ts:531` — **getSourceFiles** (const)
  - Missing: @category, @example, @since
  - Has: @param, @param, @param, @returns, @throws
  - Context: Get all TypeScript source files in a directory.

- [ ] `src/commands/docgen/shared/index.ts:574` — **analyzePackage** (const)
  - Missing: @category, @example, @since
  - Has: @param, @param, @param, @returns
  - Context: Analyze all source files in a package directory.

- [ ] `src/commands/docgen/shared/index.ts:58` — **TSCONFIG_PRECEDENCE** (const)
  - Missing: @category, @example, @since
  - Context: TSConfig file search order - first match wins

- [ ] `src/commands/docgen/shared/index.ts:67` — **loadDocgenConfig** (const)
  - Missing: @category, @example, @since
  - Has: @param, @returns, @throws
  - Context: Load and parse docgen.json from a package directory.

- [ ] `src/commands/docgen/shared/index.ts:117` — **hasDocgenConfig** (const)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Check if docgen.json exists in a package directory.

- [ ] `src/commands/docgen/shared/index.ts:135` — **findTsConfig** (const)
  - Missing: @category, @example, @since
  - Has: @param, @returns, @throws
  - Context: Find the best tsconfig file in a package directory.

- [ ] `src/commands/docgen/shared/index.ts:166` — **writeDocgenConfig** (const)
  - Missing: @category, @example, @since
  - Has: @param, @param, @throws
  - Context: Write docgen.json to a package directory.

- [ ] `src/commands/docgen/shared/index.ts:195` — **loadTsConfig** (const)
  - Missing: @category, @example, @since
  - Has: @param, @returns, @throws
  - Context: Load and parse a tsconfig.json file.

- [ ] `src/commands/docgen/shared/index.ts:191` — **discoverAllPackages** (const)
  - Missing: @category, @example, @since
  - Has: @returns
  - Context: Discover all workspace packages in the monorepo.

- [ ] `src/commands/docgen/shared/index.ts:220` — **discoverConfiguredPackages** (const)
  - Missing: @category, @example, @since
  - Has: @returns
  - Context: Discover packages that have docgen.json configured.

- [ ] `src/commands/docgen/shared/index.ts:237` — **discoverPackagesWithDocs** (const)
  - Missing: @category, @example, @since
  - Has: @returns
  - Context: Discover packages that have generated documentation.

- [ ] `src/commands/docgen/shared/index.ts:257` — **resolvePackagePath** (const)
  - Missing: @category, @example, @since
  - Has: @param, @returns, @throws, @throws
  - Context: Resolve a package path (relative or absolute) to PackageInfo.

- [ ] `src/commands/docgen/shared/index.ts:309` — **resolvePackageByName** (const)
  - Missing: @category, @example, @since
  - Has: @param, @returns, @throws
  - Context: Resolve a package by name from the workspace.

- [ ] `src/commands/docgen/shared/index.ts:131` — **generateAnalysisReport** (const)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Generate the full JSDOC_ANALYSIS.md report content.

- [ ] `src/commands/docgen/shared/index.ts:270` — **generateAnalysisJson** (const)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Generate JSON output for analysis results.

- [ ] `src/commands/docgen/shared/logger.ts:27` — **LogLevel** (type)
  - Missing: @category, @example, @since
  - Context: Log severity levels in ascending order

- [ ] `src/commands/docgen/shared/logger.ts:39` — **LogEntry** (interface)
  - Missing: @category, @example, @since
  - Context: Structured log entry

- [ ] `src/commands/docgen/shared/logger.ts:50` — **LoggerOptions** (interface)
  - Missing: @category, @example, @since
  - Context: Logger configuration options

- [ ] `src/commands/docgen/shared/logger.ts:62` — **DocgenLogger** (interface)
  - Missing: @category, @example, @since
  - Context: DocgenLogger service interface

- [ ] `src/commands/docgen/shared/logger.ts:79` — **DocgenLogger** (const)
  - Missing: @category, @example, @since

- [ ] `src/commands/docgen/shared/markdown.ts:131` — **generateAnalysisReport** (const)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Generate the full JSDOC_ANALYSIS.md report content.

- [ ] `src/commands/docgen/shared/markdown.ts:270` — **generateAnalysisJson** (const)
  - Missing: @category, @example, @since
  - Has: @param, @returns
  - Context: Generate JSON output for analysis results.

### Medium Priority (Missing some tags)

- [ ] `src/commands/docgen/agents/activities.ts:41` — **ReadConfigActivity** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Read and parse the docgen configuration for a package.

- [ ] `src/commands/docgen/agents/activities.ts:65` — **AnalyzePackageActivity** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Analyze a package to identify exports needing documentation.

- [ ] `src/commands/docgen/agents/activities.ts:101` — **CallAIActivity** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Call the AI model to fix JSDoc in a file.

- [ ] `src/commands/docgen/agents/activities.ts:143` — **WriteFileActivity** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Write updated content to a source file.

- [ ] `src/commands/docgen/agents/activities.ts:169` — **ReadFileActivity** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Read a source file for AI processing.

- [ ] `src/commands/docgen/agents/activities.ts:196` — **ValidateExamplesActivity** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Validate that JSDoc examples compile correctly.

- [ ] `src/commands/docgen/agents/index.ts:52` — **ANTHROPIC_PRICING** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Anthropic pricing per million tokens (as of Dec 2025).

- [ ] `src/commands/docgen/agents/index.ts:77` — **estimateCost** (const)
  - Missing: @example
  - Has: @param, @param, @returns, @category, @since
  - Context: Estimate cost based on token usage.

- [ ] `src/commands/docgen/agents/index.ts:148` — **agentsCommand** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: The agents command for running AI-powered documentation fixes.

- [ ] `src/commands/docgen/agents/index.ts:148` — **default** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: The agents command for running AI-powered documentation fixes.

- [ ] `src/commands/docgen/agents/prompts.ts:20` — **JSDOC_GENERATOR_PROMPT** (const)
  - Missing: @example
  - Has: @file, @module, @since, @category, @since

- [ ] `src/commands/docgen/agents/prompts.ts:75` — **SIMPLE_DOC_FIXER_PROMPT** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Simple system prompt for the DocFixer agent.

- [ ] `src/commands/docgen/agents/prompts.ts:136` — **DOC_FIXER_SYSTEM_PROMPT** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: System prompt for the DocFixer agent with tool calling.

- [ ] `src/commands/docgen/agents/prompts.ts:231` — **COORDINATOR_SYSTEM_PROMPT** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: System prompt for the Coordinator agent.

- [ ] `src/commands/docgen/agents/prompts.ts:271` — **JSDOC_BATCH_GENERATOR_PROMPT** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: System prompt for batch JSDoc generation.

- [ ] `src/commands/docgen/agents/service.ts:149` — **TokenStats** (interface)
  - Missing: @example
  - Has: @category, @since
  - Context: Token usage statistics interface.

- [ ] `src/commands/docgen/agents/service.ts:163` — **TokenCounter** (class)
  - Missing: @example
  - Has: @category, @since
  - Context: Service for tracking token usage across agent interactions.

- [ ] `src/commands/docgen/agents/service.ts:239` — **DocgenAgentService** (interface)
  - Missing: @example
  - Has: @category, @since
  - Context: Service interface for docgen agent operations.

- [ ] `src/commands/docgen/agents/service.ts:275` — **DocgenAgentService** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: DocgenAgentService context tag.

- [ ] `src/commands/docgen/agents/service.ts:287` — **make** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Create the DocgenAgentService implementation.

- [ ] `src/commands/docgen/agents/service.ts:604` — **ModelLayer** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: AnthropicLanguageModel layer.

- [ ] `src/commands/docgen/agents/service.ts:616` — **ClientLayer** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: AnthropicClient layer with config from environment.

- [ ] `src/commands/docgen/agents/service.ts:630` — **DocgenAgentServiceLive** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Live implementation of DocgenAgentService.

- [ ] `src/commands/docgen/agents/tool-handlers.ts:28` — **DocFixerToolkitLive** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Create the DocFixer toolkit layer with all tool handlers.

- [ ] `src/commands/docgen/agents/tools.ts:65` — **ReadSourceFile** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Read a source file from the package.

- [ ] `src/commands/docgen/agents/tools.ts:93` — **WriteSourceFile** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Write updated content to a source file.

- [ ] `src/commands/docgen/agents/tools.ts:126` — **InsertJsDoc** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Insert or replace JSDoc at a specific line in a file.

- [ ] `src/commands/docgen/agents/tools.ts:164` — **ValidateExamples** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Validate that JSDoc examples compile correctly.

- [ ] `src/commands/docgen/agents/tools.ts:193` — **SearchEffectDocs** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Search Effect documentation for API patterns and examples.

- [ ] `src/commands/docgen/agents/tools.ts:225` — **ListPackageExports** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: List all exports from a package's index file.

- [ ] `src/commands/docgen/agents/tools.ts:260` — **DocFixerToolkit** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Complete toolkit for the DocFixer agent.

- [ ] `src/commands/docgen/agents/workflow.ts:56` — **DocgenAgentsWorkflow** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: The DocgenAgents workflow orchestrates documentation fixing across packages.

- [ ] `src/commands/docgen/agents/workflow.ts:74` — **DocgenAgentsWorkflowLayer** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Workflow handler layer.

- [ ] `src/commands/docgen/shared/ast.ts:44` — **createProject** (const)
  - Missing: @category, @example
  - Has: @param, @returns, @since
  - Context: Create a new ts-morph Project.

- [ ] `src/commands/docgen/shared/ast.ts:62` — **addSourceFile** (const)
  - Missing: @category, @example
  - Has: @param, @param, @returns, @throws, @since
  - Context: Add a source file to a project by path.

- [ ] `src/commands/docgen/shared/ast.ts:495` — **analyzeSourceFile** (const)
  - Missing: @category, @example
  - Has: @param, @param, @returns, @since
  - Context: Analyze all exports in a source file.

- [ ] `src/commands/docgen/shared/error-handling.ts:138` — **accumulateErrors** (const)
  - Missing: @category, @since
  - Has: @example
  - Context: Process items with error accumulation.

- [ ] `src/commands/docgen/shared/error-handling.ts:196` — **withApiRetry** (const)
  - Missing: @category, @since
  - Has: @example
  - Context: Wrap an effect with API retry logic.

- [ ] `src/commands/docgen/shared/index.ts:44` — **createProject** (const)
  - Missing: @category, @example
  - Has: @param, @returns, @since
  - Context: Create a new ts-morph Project.

- [ ] `src/commands/docgen/shared/index.ts:62` — **addSourceFile** (const)
  - Missing: @category, @example
  - Has: @param, @param, @returns, @throws, @since
  - Context: Add a source file to a project by path.

- [ ] `src/commands/docgen/shared/index.ts:495` — **analyzeSourceFile** (const)
  - Missing: @category, @example
  - Has: @param, @param, @returns, @since
  - Context: Analyze all exports in a source file.

- [ ] `src/commands/docgen/shared/index.ts:32` — **symbols** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Unicode symbols for status indicators.

- [ ] `src/commands/docgen/shared/index.ts:49` — **success** (const)
  - Missing: @example
  - Has: @param, @returns, @category, @since
  - Context: Log a success message with green checkmark.

- [ ] `src/commands/docgen/shared/index.ts:59` — **error** (const)
  - Missing: @example
  - Has: @param, @returns, @category, @since
  - Context: Log an error message with red X.

- [ ] `src/commands/docgen/shared/index.ts:69` — **warning** (const)
  - Missing: @example
  - Has: @param, @returns, @category, @since
  - Context: Log a warning message with yellow warning symbol.

- [ ] `src/commands/docgen/shared/index.ts:80` — **info** (const)
  - Missing: @example
  - Has: @param, @returns, @category, @since
  - Context: Log an info message with blue info symbol.

- [ ] `src/commands/docgen/shared/index.ts:90` — **formatPackageResult** (const)
  - Missing: @example
  - Has: @param, @returns, @category, @since
  - Context: Format a package generation result line.

- [ ] `src/commands/docgen/shared/index.ts:106` — **formatPackageStatus** (const)
  - Missing: @example
  - Has: @param, @returns, @category, @since
  - Context: Format package info for status output.

- [ ] `src/commands/docgen/shared/index.ts:128` — **header** (const)
  - Missing: @example
  - Has: @param, @returns, @category, @since
  - Context: Print a section header with underline.

- [ ] `src/commands/docgen/shared/index.ts:144` — **formatCoverage** (const)
  - Missing: @example
  - Has: @param, @param, @returns, @category, @since
  - Context: Format coverage percentage with color coding.

- [ ] `src/commands/docgen/shared/index.ts:157` — **blank** (const)
  - Missing: @example
  - Has: @returns, @category, @since
  - Context: Print a blank line.

- [ ] `src/commands/docgen/shared/index.ts:166` — **divider** (const)
  - Missing: @example
  - Has: @returns, @category, @since
  - Context: Print a horizontal divider.

- [ ] `src/commands/docgen/shared/index.ts:177` — **keyValue** (const)
  - Missing: @example
  - Has: @param, @param, @returns, @category, @since
  - Context: Format a key-value pair for display.

- [ ] `src/commands/docgen/shared/index.ts:187` — **bulletList** (const)
  - Missing: @example
  - Has: @param, @returns, @category, @since
  - Context: Print a list of items with bullets.

- [ ] `src/commands/docgen/shared/index.ts:199` — **dryRunTag** (const)
  - Missing: @example
  - Has: @returns, @category, @since
  - Context: Format dry-run indicator.

- [ ] `src/commands/docgen/shared/index.ts:209` — **formatPath** (const)
  - Missing: @example
  - Has: @param, @returns, @category, @since
  - Context: Format a path for display (cyan colored).

- [ ] `src/commands/docgen/shared/index.ts:220` — **formatCount** (const)
  - Missing: @example
  - Has: @param, @param, @returns, @category, @since
  - Context: Format a count with appropriate color.

- [ ] `src/commands/docgen/shared/output.ts:32` — **symbols** (const)
  - Missing: @example
  - Has: @category, @since
  - Context: Unicode symbols for status indicators.

- [ ] `src/commands/docgen/shared/output.ts:49` — **success** (const)
  - Missing: @example
  - Has: @param, @returns, @category, @since
  - Context: Log a success message with green checkmark.

- [ ] `src/commands/docgen/shared/output.ts:59` — **error** (const)
  - Missing: @example
  - Has: @param, @returns, @category, @since
  - Context: Log an error message with red X.

- [ ] `src/commands/docgen/shared/output.ts:69` — **warning** (const)
  - Missing: @example
  - Has: @param, @returns, @category, @since
  - Context: Log a warning message with yellow warning symbol.

- [ ] `src/commands/docgen/shared/output.ts:80` — **info** (const)
  - Missing: @example
  - Has: @param, @returns, @category, @since
  - Context: Log an info message with blue info symbol.

- [ ] `src/commands/docgen/shared/output.ts:90` — **formatPackageResult** (const)
  - Missing: @example
  - Has: @param, @returns, @category, @since
  - Context: Format a package generation result line.

- [ ] `src/commands/docgen/shared/output.ts:106` — **formatPackageStatus** (const)
  - Missing: @example
  - Has: @param, @returns, @category, @since
  - Context: Format package info for status output.

- [ ] `src/commands/docgen/shared/output.ts:128` — **header** (const)
  - Missing: @example
  - Has: @param, @returns, @category, @since
  - Context: Print a section header with underline.

- [ ] `src/commands/docgen/shared/output.ts:144` — **formatCoverage** (const)
  - Missing: @example
  - Has: @param, @param, @returns, @category, @since
  - Context: Format coverage percentage with color coding.

- [ ] `src/commands/docgen/shared/output.ts:157` — **blank** (const)
  - Missing: @example
  - Has: @returns, @category, @since
  - Context: Print a blank line.

- [ ] `src/commands/docgen/shared/output.ts:166` — **divider** (const)
  - Missing: @example
  - Has: @returns, @category, @since
  - Context: Print a horizontal divider.

- [ ] `src/commands/docgen/shared/output.ts:177` — **keyValue** (const)
  - Missing: @example
  - Has: @param, @param, @returns, @category, @since
  - Context: Format a key-value pair for display.

- [ ] `src/commands/docgen/shared/output.ts:187` — **bulletList** (const)
  - Missing: @example
  - Has: @param, @returns, @category, @since
  - Context: Print a list of items with bullets.

- [ ] `src/commands/docgen/shared/output.ts:199` — **dryRunTag** (const)
  - Missing: @example
  - Has: @returns, @category, @since
  - Context: Format dry-run indicator.

- [ ] `src/commands/docgen/shared/output.ts:209` — **formatPath** (const)
  - Missing: @example
  - Has: @param, @returns, @category, @since
  - Context: Format a path for display (cyan colored).

- [ ] `src/commands/docgen/shared/output.ts:220` — **formatCount** (const)
  - Missing: @example
  - Has: @param, @param, @returns, @category, @since
  - Context: Format a count with appropriate color.

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Exports | 205 |
| Fully Documented | 77 |
| Missing Documentation | 128 |
| Missing @category | 63 |
| Missing @example | 126 |
| Missing @since | 57 |

---

## Verification

After completing all documentation, run:

```bash
beep docgen analyze -p tooling/cli
```

If successful, delete this file. If issues remain, the checklist will be regenerated.