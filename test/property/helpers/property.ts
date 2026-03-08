import * as FC from "effect/FastCheck"

type AssertParameters = Parameters<typeof FC.assert>[1]
type PropertyParameters = NonNullable<AssertParameters>

const parsePositiveInt = (value: string | undefined): number | undefined => {
  if (value === undefined || value.trim() === "") return undefined
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined
  return parsed
}

const parseMaybeInt = (value: string | undefined): number | undefined => {
  if (value === undefined || value.trim() === "") return undefined
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return undefined
  return parsed
}

const defaultNumRuns = Bun.env.CI ? 300 : 100

export const propertyConfig = (overrides: PropertyParameters = {}): PropertyParameters => {
  const seed = parseMaybeInt(Bun.env.PROP_SEED)
  const numRuns = parsePositiveInt(Bun.env.PROP_RUNS) ?? defaultNumRuns
  const path = Bun.env.PROP_PATH
  const interruptAfterTimeLimit = parsePositiveInt(Bun.env.PROP_TIME_MS)

  return {
    numRuns,
    ...(seed !== undefined ? { seed } : {}),
    ...(path !== undefined && path !== "" ? { path } : {}),
    ...(interruptAfterTimeLimit !== undefined ? { interruptAfterTimeLimit } : {}),
    ...overrides
  }
}

export const assertProperty = (
  property: Parameters<typeof FC.assert>[0],
  overrides: PropertyParameters = {}
): ReturnType<typeof FC.assert> => {
  return FC.assert(property, propertyConfig(overrides))
}
