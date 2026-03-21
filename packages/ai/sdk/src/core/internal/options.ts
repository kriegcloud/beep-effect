import { Struct } from "effect";
import type { HookMap } from "../Hooks/utils.js";
import { mergeHookMaps } from "../Hooks/utils.js";
import type { Options } from "../Schema/Options.js";

const mergeRecord = <T>(base: Record<string, T> | undefined, override: Record<string, T> | undefined) =>
  base !== undefined || override !== undefined ? { ...base, ...override } : undefined;

const mergeHooks = (base: HookMap | undefined, override: HookMap | undefined) => {
  if (base === undefined && override === undefined) return undefined;
  const merged = mergeHookMaps(base, override);
  return Struct.keys(merged).length === 0 ? undefined : merged;
};

/**
 * @since 0.0.0
 */
export const mergeOptions = (base: Options, override?: Partial<Options>): Options => {
  if (override === undefined) return { ...base };
  const hooks = mergeHooks(base.hooks, override.hooks);
  const env = mergeRecord(base.env, override.env);
  const mcpServers = mergeRecord(base.mcpServers, override.mcpServers);
  const agents = mergeRecord(base.agents, override.agents);
  const extraArgs = mergeRecord(base.extraArgs, override.extraArgs);

  return {
    ...base,
    ...override,
    ...(hooks === undefined ? {} : { hooks }),
    ...(env === undefined ? {} : { env }),
    ...(mcpServers === undefined ? {} : { mcpServers }),
    ...(agents === undefined ? {} : { agents }),
    ...(extraArgs === undefined ? {} : { extraArgs }),
  };
};
