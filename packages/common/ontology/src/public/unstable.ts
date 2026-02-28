/**
 * Unstable/experimental public surface for `@beep/ontology`.
 *
 * @since 0.0.0
 * @module @beep/ontology/unstable
 */

export type {
  /** @since 0.0.0 */
  Experiment,
  /** @since 0.0.0 */
  ExperimentFns,
} from "../experimental/Experiment.js";

export {
  /** @since 0.0.0 */
  __EXPERIMENTAL__NOT_SUPPORTED_YET__createMediaReference,
} from "../experimental/createMediaReference.js";
export {
  /** @since 0.0.0 */
  __EXPERIMENTAL__NOT_SUPPORTED_YET__fetchOneByRid,
} from "../experimental/fetchOneByRid.js";
export {
  /** @since 0.0.0 */
  __EXPERIMENTAL__NOT_SUPPORTED_YET__fetchPageByRid,
  /** @since 0.0.0 */
  type FetchPageByRidPayload,
} from "../experimental/fetchPageByRid.js";
export {
  /** @since 0.0.0 */
  __EXPERIMENTAL__NOT_SUPPORTED_YET__getBulkLinks,
} from "../experimental/getBulkLinks.js";

export type {
  /** @since 0.0.0 */
  EXPERIMENTAL_BulkLinkResult,
} from "../objectSet/BulkLinkResult.js";
export type {
  /** @since 0.0.0 */
  MinimalObjectSet,
} from "../objectSet/ObjectSet.js";
