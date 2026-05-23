/**
 * Miscellaneous runtime utilities and structural comparison hooks.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as GlobalValue from "./GlobalValue.ts";

/**
 * Note: this is an experimental feature made available to allow custom matchers in tests, not to be directly used yet in user code
 *
 * @since 0.0.0
 * @category utilities
 */
export const structuralRegionState = GlobalValue.globalValue(
  "effect/Utils/isStructuralRegion",
  (): { enabled: boolean; tester: ((a: unknown, b: unknown) => boolean) | undefined } => ({
    enabled: false,
    tester: undefined,
  })
);

/**
 * Note: this is an experimental feature made available to allow custom matchers in tests, not to be directly used yet in user code
 *
 * @since 0.0.0
 * @category utilities
 */
export const structuralRegion = <A>(body: () => A, tester?: (a: unknown, b: unknown) => boolean): A => {
  const current = structuralRegionState.enabled;
  const currentTester = structuralRegionState.tester;
  structuralRegionState.enabled = true;
  if (tester !== undefined) {
    structuralRegionState.tester = tester;
  }
  try {
    return body();
  } finally {
    structuralRegionState.enabled = current;
    structuralRegionState.tester = currentTester;
  }
};

/**
 * Re-export of all helpers from `effect/Utils`.
 *
 * @category utilities
 * @since 0.0.0
 */
export * from "effect/Utils";
