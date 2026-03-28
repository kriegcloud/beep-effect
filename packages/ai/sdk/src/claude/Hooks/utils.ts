import type { HookCallbackMatcher, HookEvent } from "../Schema/Hooks.js";
import type { Options } from "../Schema/Options.js";

/**
 * @since 0.0.0
 * @category DomainLogic
 */
export type HookMap = NonNullable<Options["hooks"]>;

type MutableHookMap = { -readonly [K in keyof HookMap]: HookMap[K] };

const hookEvents: ReadonlyArray<HookEvent> = [
  "PreToolUse",
  "PostToolUse",
  "PostToolUseFailure",
  "Notification",
  "UserPromptSubmit",
  "SessionStart",
  "SessionEnd",
  "Stop",
  "SubagentStart",
  "SubagentStop",
  "PreCompact",
  "PermissionRequest",
  "Setup",
  "TeammateIdle",
  "TaskCompleted",
];

const emptyHookMap = (): MutableHookMap => ({
  PreToolUse: undefined,
  PostToolUse: undefined,
  PostToolUseFailure: undefined,
  Notification: undefined,
  UserPromptSubmit: undefined,
  SessionStart: undefined,
  SessionEnd: undefined,
  Stop: undefined,
  SubagentStart: undefined,
  SubagentStop: undefined,
  PreCompact: undefined,
  PermissionRequest: undefined,
  Setup: undefined,
  TeammateIdle: undefined,
  TaskCompleted: undefined,
});

const hasHooks = (hooks: HookMap | undefined): boolean =>
  hooks !== undefined && hookEvents.some((event) => (hooks[event]?.length ?? 0) > 0);

/**
 * @since 0.0.0
 * @category DomainLogic
 */
export const mergeHookMaps = (...maps: ReadonlyArray<HookMap | undefined>): HookMap => {
  const merged = emptyHookMap();
  for (const map of maps) {
    if (map === undefined) continue;
    for (const event of hookEvents) {
      const matchers = map[event];
      if (matchers === undefined || matchers.length === 0) continue;
      const existing = merged[event];
      merged[event] = existing === undefined ? [...matchers] : [...existing, ...matchers];
    }
  }
  return merged;
};

/**
 * @since 0.0.0
 * @category DomainLogic
 */
export const withHook = (event: HookEvent, matcher: HookCallbackMatcher): HookMap => {
  const hooks = emptyHookMap();
  hooks[event] = [matcher];
  return hooks;
};

/**
 * @since 0.0.0
 * @category DomainLogic
 */
export const withHooks = (options: Options, hooks: HookMap): Options => {
  if (!hasHooks(options.hooks) && !hasHooks(hooks)) return options;
  const merged = mergeHookMaps(options.hooks, hooks);
  return hasHooks(merged) ? { ...options, hooks: merged } : { ...options };
};
