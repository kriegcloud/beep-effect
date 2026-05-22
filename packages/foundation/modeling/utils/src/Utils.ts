import * as GlobalValue from "./GlobalValue.ts"

/**
 * Note: this is an experimental feature made available to allow custom matchers in tests, not to be directly used yet in user code
 *
 * @since 0.0.0
 * @category modifiers
 */
export const structuralRegionState = GlobalValue.globalValue(
  "effect/Utils/isStructuralRegion",
  (): { enabled: boolean; tester: ((a: unknown, b: unknown) => boolean) | undefined } => ({
    enabled: false,
    tester: undefined
  })
)

/**
 * Note: this is an experimental feature made available to allow custom matchers in tests, not to be directly used yet in user code
 *
 * @since 0.0.0
 * @category modifiers
 */
export const structuralRegion = <A>(body: () => A, tester?: (a: unknown, b: unknown) => boolean): A => {
  const current = structuralRegionState.enabled
  const currentTester = structuralRegionState.tester
  structuralRegionState.enabled = true
  if (tester) {
    structuralRegionState.tester = tester
  }
  try {
    return body()
  } finally {
    structuralRegionState.enabled = current
    structuralRegionState.tester = currentTester
  }
}


export * from "effect/Utils";
