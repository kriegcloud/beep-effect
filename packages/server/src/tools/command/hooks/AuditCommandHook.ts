import { Effect } from "effect"
import type { CommandHook } from "../CommandHooks.js"

const formatContext = (source: string, toolName?: string): string =>
  toolName === undefined
    ? source
    : `${source}:${toolName}`

export const AuditCommandHook: CommandHook = {
  id: "audit-command",
  afterExecute: ({ context, plan, result }) =>
    Effect.log("command.executed", {
      context: formatContext(context.source, context.toolName),
      cwd: plan.cwd,
      exitCode: result.exitCode,
      truncatedStdout: result.truncatedStdout,
      truncatedStderr: result.truncatedStderr
    }),
  onError: ({ context, plan, error }) =>
    Effect.log("command.failed", {
      context: formatContext(context.source, context.toolName),
      cwd: plan?.cwd ?? null,
      errorTag: error._tag
    })
}
