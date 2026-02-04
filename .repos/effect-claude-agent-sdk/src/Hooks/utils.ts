import type { HookCallbackMatcher, HookEvent } from "../Schema/Hooks.js"
import type { Options } from "../Schema/Options.js"

export type HookMap = NonNullable<Options["hooks"]>

type MutableHookMap = { -readonly [K in keyof HookMap]?: HookMap[K] }

export const mergeHookMaps = (...maps: ReadonlyArray<HookMap | undefined>): HookMap => {
  const merged: MutableHookMap = {}
  for (const map of maps) {
    if (!map) continue
    for (const [event, matchers] of Object.entries(map)) {
      if (!matchers || matchers.length === 0) continue
      const key = event as HookEvent
      const existing = merged[key]
      merged[key] = existing ? [...existing, ...matchers] : Array.from(matchers)
    }
  }
  return merged as HookMap
}

export const withHook = (event: HookEvent, matcher: HookCallbackMatcher): HookMap => ({
  [event]: [matcher]
})

export const withHooks = (options: Options, hooks: HookMap): Options => {
  if (!options.hooks && Object.keys(hooks).length === 0) return options
  const merged = mergeHookMaps(options.hooks, hooks)
  return Object.keys(merged).length === 0 ? { ...options } : { ...options, hooks: merged }
}
