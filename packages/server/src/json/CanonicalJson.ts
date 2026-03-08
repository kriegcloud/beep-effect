export const canonicalizeJson = (input: unknown): unknown => {
  if (Array.isArray(input)) {
    return input.map(canonicalizeJson)
  }

  if (input !== null && typeof input === "object") {
    const objectInput = input as Record<string, unknown>
    return Object.keys(objectInput)
      .sort((a, b) => a.localeCompare(b))
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = canonicalizeJson(objectInput[key])
        return acc
      }, {})
  }

  return input
}

export const stableJsonStringify = (value: unknown): string =>
  JSON.stringify(canonicalizeJson(value))
