import type { Options } from "../Schema/Options.js"
import { mergeHookMaps } from "../Hooks/utils.js"
import type { HookMap } from "../Hooks/utils.js"

const mergeRecord = <T>(
  base: Record<string, T> | undefined,
  override: Record<string, T> | undefined
) => (base || override ? { ...(base ?? {}), ...(override ?? {}) } : undefined)

const mergeHooks = (base: HookMap | undefined, override: HookMap | undefined) => {
  if (!base && !override) return undefined
  const merged = mergeHookMaps(base, override)
  return Object.keys(merged).length === 0 ? undefined : merged
}

export const mergeOptions = (base: Options, override?: Partial<Options>): Options => {
  if (!override) return { ...base }
  const hooks = mergeHooks(base.hooks, override.hooks)
  const env = mergeRecord(base.env, override.env)
  const mcpServers = mergeRecord(base.mcpServers, override.mcpServers)
  const agents = mergeRecord(base.agents, override.agents)
  const extraArgs = mergeRecord(base.extraArgs, override.extraArgs)

  return {
    ...base,
    ...override,
    ...(hooks ? { hooks } : {}),
    ...(env ? { env } : {}),
    ...(mcpServers ? { mcpServers } : {}),
    ...(agents ? { agents } : {}),
    ...(extraArgs ? { extraArgs } : {})
  }
}
