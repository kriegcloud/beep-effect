import type { AgentId, PolicyId, SessionId, ToolName } from "@template/domain/ids"
import type { AgentStatePort, GovernancePort, SessionTurnPort, ToolInvocationQuery } from "@template/domain/ports"
import type { AuthorizationDecision, ComplianceStatus } from "@template/domain/status"
import { DEFAULT_PAGINATION_LIMIT, MAX_PAGINATION_LIMIT } from "@template/domain/system-defaults"
import { Effect, Layer } from "effect"
import * as HttpRouter from "effect/unstable/http/HttpRouter"
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"
import { AgentStatePortTag, GovernancePortTag, SessionTurnPortTag } from "../PortTags.js"
import {
  badRequest,
  extractPathParam,
  internalServerError
} from "./RouteCommon.js"

const parseLimit = (url: URL): number | null => {
  const raw = url.searchParams.get("limit")
  if (raw === null || raw === "") {
    return DEFAULT_PAGINATION_LIMIT
  }
  const parsed = Number(raw)
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_PAGINATION_LIMIT) {
    return null
  }
  return parsed
}

const parseOffset = (url: URL): number | null => {
  const raw = url.searchParams.get("offset")
  if (raw === null || raw === "") {
    return 0
  }
  const parsed = Number(raw)
  if (!Number.isInteger(parsed) || parsed < 0) {
    return null
  }
  return parsed
}

const parseDecision = (url: URL): AuthorizationDecision | undefined | null => {
  const raw = url.searchParams.get("decision")
  if (raw === null || raw === "") {
    return undefined
  }
  if (raw === "Allow" || raw === "Deny" || raw === "RequireApproval") {
    return raw
  }
  return null
}

const parseComplianceStatus = (url: URL): ComplianceStatus | undefined | null => {
  const raw = url.searchParams.get("complianceStatus")
  if (raw === null || raw === "") {
    return undefined
  }
  if (raw === "Compliant" || raw === "NonCompliant") {
    return raw
  }
  return null
}

const parsePolicyId = (url: URL): PolicyId | undefined => {
  const raw = url.searchParams.get("policyId")
  if (raw === null || raw === "") {
    return undefined
  }
  return raw as PolicyId
}

const parseToolName = (url: URL): ToolName | undefined => {
  const raw = url.searchParams.get("toolName")
  if (raw === null || raw === "") {
    return undefined
  }
  return raw as ToolName
}

export const handleListSessionToolInvocations = (
  requestUrl: string,
  dependencies: {
    readonly governance: Pick<GovernancePort, "listToolInvocationsBySession">
    readonly sessions: Pick<SessionTurnPort, "getSession">
  }
) =>
  Effect.gen(function*() {
    const parsedUrl = new URL(requestUrl, "http://localhost")
    const sessionIdRaw = extractPathParam(requestUrl, 2)
    if (sessionIdRaw.length === 0) {
      return yield* badRequest("Missing sessionId")
    }

    const limit = parseLimit(parsedUrl)
    if (limit === null) {
      return yield* badRequest(`limit must be an integer between 1 and ${MAX_PAGINATION_LIMIT}`)
    }

    const offset = parseOffset(parsedUrl)
    if (offset === null) {
      return yield* badRequest("offset must be an integer greater than or equal to 0")
    }

    const decision = parseDecision(parsedUrl)
    if (decision === null) {
      return yield* badRequest("decision must be one of Allow, Deny, or RequireApproval")
    }

    const complianceStatus = parseComplianceStatus(parsedUrl)
    if (complianceStatus === null) {
      return yield* badRequest("complianceStatus must be Compliant or NonCompliant")
    }

    const policyId = parsePolicyId(parsedUrl)
    const toolName = parseToolName(parsedUrl)

    const sessionId = sessionIdRaw as SessionId
    const existingSession = yield* dependencies.sessions.getSession(sessionId)
    if (existingSession === null) {
      return yield* HttpServerResponse.json(
        { error: "SessionNotFound", sessionId },
        { status: 404 }
      )
    }

    const query: ToolInvocationQuery = {
      limit,
      offset,
      ...(decision === undefined ? {} : { decision }),
      ...(complianceStatus === undefined ? {} : { complianceStatus }),
      ...(policyId === undefined ? {} : { policyId }),
      ...(toolName === undefined ? {} : { toolName })
    }

    const result = yield* dependencies.governance.listToolInvocationsBySession(sessionId, query)

    return yield* HttpServerResponse.json({
      sessionId,
      items: result.items,
      totalCount: result.totalCount,
      limit,
      offset
    })
  }).pipe(
    Effect.withSpan("GovernanceRoutes.listSessionToolInvocations"),
    Effect.catchCause(() => internalServerError())
  )

export const handleListAgentPolicies = (
  requestUrl: string,
  dependencies: {
    readonly governance: Pick<GovernancePort, "listPoliciesForAgent">
    readonly agents: Pick<AgentStatePort, "get">
  }
) =>
  Effect.gen(function*() {
    const parsedUrl = new URL(requestUrl, "http://localhost")
    const action = parsedUrl.searchParams.get("action")
    const validActions = ["InvokeTool", "ReadMemory", "WriteMemory", "ExecuteSchedule", "SpawnSubAgent", "CreateGoal", "TransitionTask"]
    if (action !== null && action !== "" && !validActions.includes(action)) {
      return yield* badRequest(`action must be one of: ${validActions.join(", ")}`)
    }

    const agentIdRaw = extractPathParam(requestUrl, 2)
    if (agentIdRaw.length === 0) {
      return yield* badRequest("Missing agentId")
    }

    const agentId = agentIdRaw as AgentId
    const existingAgent = yield* dependencies.agents.get(agentId)
    if (existingAgent === null) {
      return yield* HttpServerResponse.json(
        { error: "AgentNotFound", agentId },
        { status: 404 }
      )
    }

    const policies = yield* dependencies.governance.listPoliciesForAgent(agentId)

    return yield* HttpServerResponse.json({
      agentId,
      items: policies.map((policy) => ({
        policyId: policy.policyId,
        permissionMode: policy.permissionMode,
        selector: policy.selector,
        decision: policy.decision,
        reasonTemplate: policy.reasonTemplate,
        precedence: policy.precedence,
        tools: policy.toolDefinitionIds
      })),
      totalCount: policies.length
    })
  }).pipe(
    Effect.withSpan("GovernanceRoutes.listAgentPolicies"),
    Effect.catchCause(() => internalServerError())
  )

const listSessionToolInvocations = HttpRouter.add(
  "GET",
  "/governance/sessions/:sessionId/tool-invocations",
  (request) =>
    Effect.gen(function*() {
      const governance = yield* GovernancePortTag
      const sessions = yield* SessionTurnPortTag
      return yield* handleListSessionToolInvocations(request.url, {
        governance,
        sessions
      })
    })
)

const listAgentPolicies = HttpRouter.add(
  "GET",
  "/governance/agents/:agentId/policies",
  (request) =>
    Effect.gen(function*() {
      const governance = yield* GovernancePortTag
      const agents = yield* AgentStatePortTag
      return yield* handleListAgentPolicies(request.url, {
        governance,
        agents
      })
    })
)

export const layer = Layer.mergeAll(
  listSessionToolInvocations,
  listAgentPolicies
)
