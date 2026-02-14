import type { SyncWorkerEnv } from "./types.js"
import { SyncDurableObject } from "./do/SyncDurableObject.js"

const routeMatcher = /^\/event-log(?:\/([^/]+))?\/?$/
const tenantPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/

const isWebSocketUpgrade = (request: Request) =>
  request.headers.get("Upgrade")?.toLowerCase() === "websocket"

const parseTenant = (url: URL) => {
  const match = routeMatcher.exec(url.pathname)
  if (!match) {
    return { ok: false, status: 404, message: "Not found" } as const
  }
  const tenant = match[1]
  if (!tenant) {
    return { ok: false, status: 400, message: "Tenant is required." } as const
  }
  if (!tenantPattern.test(tenant)) {
    return { ok: false, status: 400, message: "Invalid tenant format." } as const
  }
  return { ok: true, tenant } as const
}

const parseProtocolToken = (request: Request) => {
  const header = request.headers.get("Sec-WebSocket-Protocol")
  if (!header) return undefined
  const protocols = header
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
  const authProtocol = protocols.find((entry) => entry.startsWith("sync-auth."))
  if (!authProtocol) return undefined
  return {
    token: authProtocol.slice("sync-auth.".length),
    protocol: authProtocol
  }
}

const authorize = (request: Request, env: SyncWorkerEnv, url: URL) => {
  const expected = env.SYNC_AUTH_TOKEN
  if (!expected) return { ok: true, protocol: undefined }
  const header = request.headers.get("Authorization")
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : undefined
  const protocol = parseProtocolToken(request)
  const protocolMatch = protocol?.token === expected ? protocol.protocol : undefined
  const allowQuery =
    env.SYNC_ALLOW_QUERY_TOKEN === "1" || env.SYNC_ALLOW_QUERY_TOKEN === "true"
  const query = allowQuery ? url.searchParams.get("token") ?? undefined : undefined
  const token = bearer ?? (protocolMatch ? protocol?.token : undefined) ?? query
  const ok = token === expected
  return { ok, protocol: ok ? protocolMatch : undefined }
}

export default {
  async fetch(request: Request, env: SyncWorkerEnv): Promise<Response> {
    const url = new URL(request.url)
    const tenantResult = parseTenant(url)
    if (!tenantResult.ok) {
      return new Response(tenantResult.message, { status: tenantResult.status })
    }
    const auth = authorize(request, env, url)
    if (!auth.ok) {
      return new Response("Unauthorized", {
        status: 401,
        headers: {
          "WWW-Authenticate": "Bearer"
        }
      })
    }
    if (!isWebSocketUpgrade(request)) {
      return new Response("Expected WebSocket upgrade", { status: 426 })
    }
    const id = env.SYNC_DO.idFromName(tenantResult.tenant)
    const stub = env.SYNC_DO.get(id)
    try {
      const response = await stub.fetch(request)
      if (!auth.protocol || !response.webSocket) return response
      const headers = new Headers(response.headers)
      headers.set("Sec-WebSocket-Protocol", auth.protocol)
      return new Response(null, {
        status: response.status,
        webSocket: response.webSocket,
        headers
      })
    } catch (error) {
      console.error("Sync durable object fetch failed.", error)
      return new Response("Sync durable object unavailable.", { status: 502 })
    }
  }
}

export { SyncDurableObject }
