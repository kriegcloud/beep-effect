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
 */

/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  codegenCommand,
} from "./commands/codegen.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  createPackageCommand,
} from "./commands/create-package/index.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  rootCommand,
} from "./commands/root.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  topoSortCommand,
} from "./commands/topo-sort.js";
