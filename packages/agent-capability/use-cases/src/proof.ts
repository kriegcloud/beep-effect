/**
 * Deterministic Professional Runtime proof helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * In-memory runtime SDK facade backed by deterministic proof fixtures.
 *
 * @example
 * ```ts
 * import { makeInMemoryProfessionalRuntimeSdk } from "@beep/agent-capability-use-cases/proof"
 *
 * const sdk = makeInMemoryProfessionalRuntimeSdk([])
 * console.log(sdk)
 * ```
 *
 * @category fixtures
 * @since 0.0.0
 */
export { makeInMemoryProfessionalRuntimeSdk } from "./processes/ProfessionalRuntime/ProfessionalRuntime.fixture-service.js";
/**
 * Runtime fixture schema and deterministic runner used by proof harnesses.
 *
 * @example
 * ```ts
 * import { RuntimeFixtureInput, runRuntimeFixture } from "@beep/agent-capability-use-cases/proof"
 *
 * console.log(RuntimeFixtureInput)
 * console.log(runRuntimeFixture)
 * ```
 *
 * @category fixtures
 * @since 0.0.0
 */
export {
  RuntimeFixtureInput,
  runRuntimeFixture,
} from "./processes/ProfessionalRuntime/ProfessionalRuntime.fixtures.js";
/**
 * Public runtime SDK contracts reused by proof helpers.
 *
 * @example
 * ```ts
 * import { RuntimeScope } from "@beep/agent-capability-use-cases/proof"
 *
 * console.log(RuntimeScope)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export * from "./public.js";
