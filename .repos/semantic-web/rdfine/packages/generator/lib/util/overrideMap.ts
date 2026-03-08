import { expand } from '@zazuko/prefixes'

export function expandMapKeys<T>(overrideMap: Record<string, T> | null | undefined, namespace: string): Record<string, T> {
  if (!overrideMap) {
    return {}
  }

  return Object.entries(overrideMap)
    .reduce((newMap, [key, override]) => {
      let typeUri: string
      if (key.includes(':')) {
        typeUri = /https?:\/\//.test(key) ? key : expand(key)
      } else {
        typeUri = `${namespace}${key}`
      }

      return {
        ...newMap,
        [typeUri]: override,
      }
    }, {})
}
