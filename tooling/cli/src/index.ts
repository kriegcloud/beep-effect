/**
 * CLI tool for creating and managing packages in the beep-effect monorepo.
 *
 * ## Mental model
 *
 * - **Package creation** - Scaffold new packages following effect-smol patterns
 * - **Code generation** - Generate barrel files and exports
 * - **Topological sort** - Output packages in dependency order
 *
 * @since 0.0.0
 * @packageDocumentation
 */

/**
 * Code generation command for workspace barrels and exports.
 *
 * @since 0.0.0
 */
export {
  /**
   * Code generation command for workspace barrels and exports.
   *
   * @since 0.0.0
   */
  codegenCommand,
} from "./commands/Codegen.js";
/**
 * Agent policy command group.
 *
 * @since 0.0.0
 */
export {
  /**
   * Agent policy command group.
   *
   * @since 0.0.0
   */
  agentsCommand,
} from "./commands/Agents/index.js";
/**
 * Claude helper command group.
 *
 * @since 0.0.0
 */
export {
  /**
   * Claude helper command group.
   *
   * @since 0.0.0
   */
  claudeCommand,
} from "./commands/Claude/index.js";
/**
 * Package scaffolding command for creating new workspace packages.
 *
 * @since 0.0.0
 */
export {
  /**
   * Package scaffolding command for creating new workspace packages.
   *
   * @since 0.0.0
   */
  createPackageCommand,
} from "./commands/CreatePackage/index.js";
/**
 * Command-first docs discovery command tree.
 *
 * @since 0.0.0
 */
export {
  /**
   * Command-first docs discovery command tree.
   *
   * @since 0.0.0
   */
  docsCommand,
} from "./commands/Docs.js";
/**
 * Graphiti operational command group.
 *
 * @since 0.0.0
 */
export {
  /**
   * Graphiti operational command group.
   *
   * @since 0.0.0
   */
  graphitiCommand,
} from "./commands/Graphiti/index.js";
/**
 * Effect laws command group.
 *
 * @since 0.0.0
 */
export {
  /**
   * Effect laws command group.
   *
   * @since 0.0.0
   */
  lawsCommand,
} from "./commands/Laws/index.js";
/**
 * Lint policy command group.
 *
 * @since 0.0.0
 */
export {
  /**
   * Lint policy command group.
   *
   * @since 0.0.0
   */
  lintCommand,
} from "./commands/Lint/index.js";

/**
 * Purge command for removing root/workspace build artifacts.
 *
 * @since 0.0.0
 */
export {
  /**
   * Purge command for removing root/workspace build artifacts.
   *
   * @since 0.0.0
   */
  purgeCommand,
} from "./commands/Purge.js";
/**
 * Root CLI command that composes subcommands.
 *
 * @since 0.0.0
 */
export {
  /**
   * Root CLI command that composes subcommands.
   *
   * @since 0.0.0
   */
  rootCommand,
} from "./commands/Root.js";
/**
 * Dependency topological sort command.
 *
 * @since 0.0.0
 */
export {
  /**
   * Dependency topological sort command.
   *
   * @since 0.0.0
   */
  topoSortCommand,
} from "./commands/TopoSort.js";
/**
 * Tsconfig sync command for workspace tsconfig references and root aliases.
 *
 * @since 0.0.0
 */
export {
  /**
   * Tsconfig sync command for workspace tsconfig references and root aliases.
   *
   * @since 0.0.0
   */
  tsconfigSyncCommand,
} from "./commands/TsconfigSync.js";
/**
 * Version sync command for detecting and fixing version drift.
 *
 * @since 0.0.0
 */
export {
  /**
   * Version sync command for detecting and fixing version drift.
   *
   * @since 0.0.0
   */
  versionSyncCommand,
} from "./commands/VersionSync/index.js";
