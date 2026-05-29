/**
 * Reuse command facade.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
/**
 * Public structural-clone baseline helpers (gate diff + document builder) for tests and tooling.
 *
 * @category utilities
 * @since 0.0.0
 */
export {
  buildCloneDocument,
  CloneBaselineDocument,
  CloneBaselineEntry,
  diffCloneBaseline,
} from "./internal/CloneBaseline.js";
/**
 * Public reuse command export.
 *
 * @category cli-commands
 * @since 0.0.0
 */
export * from "./Reuse.command.js";
/**
 * Public command module export.
 *
 * @category cli-commands
 * @since 0.0.0
 */
export * from "./Reuse.errors.js";
