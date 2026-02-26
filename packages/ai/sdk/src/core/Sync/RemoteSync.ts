import type * as Layer from "effect/Layer"
import { AgentRuntime, type RemoteSyncOptions } from "../AgentRuntime.js"
import { ConflictPolicy } from "./ConflictPolicy.js"

export type RemoteUrlOptions = {
  readonly tenant?: string
  readonly authToken?: string
}

export type ConflictPolicyOption =
  | "lastWriteWins"
  | "firstWriteWins"
  | "reject"
  | Layer.Layer<ConflictPolicy>

export type RemoteSyncLayerOptions = Omit<RemoteSyncOptions, "url" | "conflictPolicy"> & {
  readonly conflictPolicy?: ConflictPolicyOption
  readonly tenant?: string
  readonly authToken?: string
}

const tenantPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/

export const buildRemoteUrl = (baseUrl: string, options?: RemoteUrlOptions) => {
  const url = new URL(baseUrl)
  const path = url.pathname === "/" ? "/event-log" : url.pathname
  const isEventLogPath = path === "/event-log" || path === "/event-log/"
  if (isEventLogPath) {
    const tenant = options?.tenant
    if (!tenant) {
      throw new Error("Remote sync requires a tenant when using /event-log.")
    }
    if (!tenantPattern.test(tenant)) {
      throw new Error("Invalid tenant format.")
    }
    url.pathname = `/event-log/${encodeURIComponent(tenant)}`
  } else {
    url.pathname = path
  }
  if (options?.authToken) {
    url.searchParams.set("token", options.authToken)
  }
  return url.toString()
}

const resolveConflictPolicyLayer = (input?: ConflictPolicyOption) => {
  if (input === undefined) return undefined
  if (typeof input !== "string") return input
  switch (input) {
    case "firstWriteWins":
      return ConflictPolicy.layerFirstWriteWins
    case "reject":
      return ConflictPolicy.layerReject()
    case "lastWriteWins":
    default:
      return ConflictPolicy.layerLastWriteWins
  }
}

/**
 * One-liner helper to wire remote sync layers for the AgentRuntime.
 */
export const withRemoteSync = (url: string, options?: RemoteSyncLayerOptions) => {
  const { conflictPolicy, tenant, authToken, ...rest } = options ?? {}
  const resolvedConflictPolicy = resolveConflictPolicyLayer(conflictPolicy)
  const remoteUrlOptions = {
    ...(tenant !== undefined ? { tenant } : {}),
    ...(authToken !== undefined ? { authToken } : {})
  }
  const resolvedUrl =
    Object.keys(remoteUrlOptions).length > 0
      ? buildRemoteUrl(url, remoteUrlOptions)
      : url
  return AgentRuntime.layerWithRemoteSync({
    url: resolvedUrl,
    ...rest,
    ...(resolvedConflictPolicy !== undefined
      ? { conflictPolicy: resolvedConflictPolicy }
      : {})
  })
}
