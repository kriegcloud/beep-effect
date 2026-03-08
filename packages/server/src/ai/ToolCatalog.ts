import type { SubroutineToolScope } from "@template/domain/memory"

export type ToolScopeGroup =
  | "always"
  | "fileRead"
  | "fileWrite"
  | "shell"
  | "memoryRead"
  | "memoryWrite"
  | "notification"

export interface ToolCatalogEntry {
  readonly name: string
  readonly definitionId: string
  readonly isSafeStandard: boolean
  readonly scopeGroup: ToolScopeGroup
}

export const TOOL_CATALOG: ReadonlyArray<ToolCatalogEntry> = [
  { name: "time_now", definitionId: "tooldef:time_now:v1", isSafeStandard: true, scopeGroup: "always" },
  { name: "math_calculate", definitionId: "tooldef:math_calculate:v1", isSafeStandard: true, scopeGroup: "always" },
  { name: "echo_text", definitionId: "tooldef:echo_text:v1", isSafeStandard: true, scopeGroup: "always" },
  { name: "store_memory", definitionId: "tooldef:store_memory:v1", isSafeStandard: true, scopeGroup: "memoryWrite" },
  { name: "retrieve_memories", definitionId: "tooldef:retrieve_memories:v1", isSafeStandard: true, scopeGroup: "memoryRead" },
  { name: "forget_memories", definitionId: "tooldef:forget_memories:v1", isSafeStandard: true, scopeGroup: "memoryWrite" },
  { name: "file_read", definitionId: "tooldef:file_read:v1", isSafeStandard: true, scopeGroup: "fileRead" },
  { name: "file_ls", definitionId: "tooldef:file_ls:v1", isSafeStandard: true, scopeGroup: "fileRead" },
  { name: "file_find", definitionId: "tooldef:file_find:v1", isSafeStandard: true, scopeGroup: "fileRead" },
  { name: "file_grep", definitionId: "tooldef:file_grep:v1", isSafeStandard: true, scopeGroup: "fileRead" },
  { name: "file_write", definitionId: "tooldef:file_write:v1", isSafeStandard: false, scopeGroup: "fileWrite" },
  { name: "file_edit", definitionId: "tooldef:file_edit:v1", isSafeStandard: false, scopeGroup: "fileWrite" },
  { name: "shell_execute", definitionId: "tooldef:shell_execute:v1", isSafeStandard: false, scopeGroup: "shell" },
  { name: "send_notification", definitionId: "tooldef:send_notification:v1", isSafeStandard: false, scopeGroup: "notification" }
] as const

export const TOOL_CATALOG_BY_NAME: ReadonlyMap<string, ToolCatalogEntry> = new Map(
  TOOL_CATALOG.map((entry) => [entry.name, entry])
)

export const TOOL_NAMES_LIST: ReadonlyArray<string> = TOOL_CATALOG.map((entry) => entry.name)

export const ALWAYS_ALLOWED_TOOLS: ReadonlySet<string> = new Set(
  TOOL_CATALOG.filter((entry) => entry.scopeGroup === "always").map((entry) => entry.name)
)

export const TOOL_SCOPE_MAP: Record<keyof SubroutineToolScope, ReadonlyArray<string>> = {
  fileRead: TOOL_CATALOG.filter((e) => e.scopeGroup === "fileRead").map((e) => e.name),
  fileWrite: TOOL_CATALOG.filter((e) => e.scopeGroup === "fileWrite").map((e) => e.name),
  shell: TOOL_CATALOG.filter((e) => e.scopeGroup === "shell").map((e) => e.name),
  memoryRead: TOOL_CATALOG.filter((e) => e.scopeGroup === "memoryRead").map((e) => e.name),
  memoryWrite: TOOL_CATALOG.filter((e) => e.scopeGroup === "memoryWrite").map((e) => e.name),
  notification: TOOL_CATALOG.filter((e) => e.scopeGroup === "notification").map((e) => e.name)
}

export const computeAllowedTools = (scope: SubroutineToolScope): Set<string> => {
  const allowed = new Set(ALWAYS_ALLOWED_TOOLS)
  for (const [scopeKey, toolNames] of Object.entries(TOOL_SCOPE_MAP)) {
    if (scope[scopeKey as keyof SubroutineToolScope]) {
      for (const name of toolNames) {
        allowed.add(name)
      }
    }
  }
  return allowed
}
