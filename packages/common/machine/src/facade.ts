/**
 * Machine facade — assembles the public `Machine` namespace from separate
 * modules without introducing circular dependencies.
 *
 * `machine.ts` holds the core builder API (Machine class, BuiltMachine, make).
 * `actor.ts` holds `spawn` (which depends on `createActor` in the same file).
 * `internal/transition.ts` holds `findTransitions` (which depends on Machine types).
 *
 * Re-exporting them here keeps the public API (`Machine.spawn`, `Machine.findTransitions`,
 * `Machine.make`, etc.) intact while each module only imports what it needs.
 *
 * @module
 */

// spawn (lives in actor.ts to avoid machine -> actor cycle)
export { spawn } from "./actor";
// Transition lookup (introspection)
export { findTransitions } from "./internal/transition";
// Core builder API
export * from "./machine";

// Persistence types (re-exported for Machine.PersistentMachine etc.)
export type { PersistenceConfig, PersistentMachine } from "./persistence/index";
