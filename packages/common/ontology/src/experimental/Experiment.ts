/**
 * Shared metadata envelope for unstable experiments.
 *
 * @since 0.0.0
 * @module @beep/ontology/experimental/Experiment
 */
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $OntologyId.create("experimental/Experiment");
/**
 * Stable metadata shape describing an experimental capability token.
 *
 * @since 0.0.0
 * @category models
 */
export type Experiment<
  V extends string,
  T extends string = string,
  K extends Record<string, unknown> = Record<never, never>,
> = {
  type: "experiment";
  name: T;
  branded?: K;
  version: V;
};

/**
 * Extracts branded helper functions from an experiment token.
 *
 * @since 0.0.0
 * @category models
 */
export type ExperimentFns<B extends Experiment<string, string>> = NonNullable<B["branded"]>;
