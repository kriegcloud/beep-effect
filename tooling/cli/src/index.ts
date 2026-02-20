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
} from "./commands/codegen.js";
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
} from "./commands/create-package/index.js";
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
} from "./commands/purge.js";
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
} from "./commands/root.js";
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
} from "./commands/topo-sort.js";
