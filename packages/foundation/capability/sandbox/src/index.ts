/**
 * Effect-first sandbox orchestration capability.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Package version.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/sandbox"
 *
 * console.log(VERSION)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;

/**
 * Agent provider constructors and stream parsing models.
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./Agent.provider.ts";

/**
 * Agent stream emitter service.
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./AgentStreamEmitter.ts";
/**
 * Direct sandbox creation helper.
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./createSandbox.ts";
/**
 * Managed worktree creation helper.
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./createWorktree.ts";
/**
 * Display service and built-in display layers.
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./Display.ts";
/**
 * Environment resolution helpers.
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./Env.ts";
/**
 * Interactive runner helper.
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./interactive.ts";
/**
 * Agent iteration orchestration.
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./Orchestrator.ts";
/**
 * Prompt resolution and substitution helpers.
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./Prompt.ts";
/**
 * Public run API.
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./Run.ts";
/**
 * Error formatting helpers.
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./Sandbox.error-handler.ts";
/**
 * Typed sandbox errors.
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./Sandbox.errors.ts";
/**
 * Sandbox process service.
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./Sandbox.process.ts";
/**
 * Sandbox provider contracts.
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./Sandbox.provider.ts";
/**
 * Built-in local sandbox providers.
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./Sandbox.providers.ts";
/**
 * Session helpers.
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./Session.ts";
/**
 * Worktree helpers.
 *
 * @category exports
 * @since 0.0.0
 */
export * from "./Worktree.ts";
