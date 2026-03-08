import { Layer } from "effect"
import { CommandHooks, type CommandHook } from "../CommandHooks.js"
import { CommandPolicyHook } from "./CommandPolicyHook.js"

export const DefaultCommandHooks: ReadonlyArray<CommandHook> = Object.freeze([
  CommandPolicyHook
])

export const CommandHooksDefaultLayer: Layer.Layer<CommandHooks> = CommandHooks.fromHooks(
  DefaultCommandHooks
)

export const withAdditionalCommandHooks = (
  hooks: ReadonlyArray<CommandHook>
): Layer.Layer<CommandHooks> =>
  CommandHooks.fromHooks([
    ...DefaultCommandHooks,
    ...hooks
  ])
