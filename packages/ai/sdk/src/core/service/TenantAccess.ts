import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"
import * as Headers from "effect/unstable/http/Headers"
import * as HttpServerRequest from "effect/unstable/http/HttpServerRequest"

const tenantPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/
const callerTenantHeader = "x-agent-tenant"

export class SessionTenantAccessError extends Schema.TaggedErrorClass<SessionTenantAccessError>()(
  "SessionTenantAccessError",
  {
    message: Schema.String,
    requestedTenant: Schema.optional(Schema.String),
    callerTenant: Schema.optional(Schema.String)
  }
) {
  static readonly make = (params: Pick<SessionTenantAccessError, "message" | "requestedTenant" | "callerTenant">) => new SessionTenantAccessError(params)
}

const normalizeTenant = (tenant: string | undefined) => {
  if (tenant === undefined) return undefined
  const trimmed = tenant.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const validateTenant = (tenant: string | undefined, source: "requested" | "caller") =>
  tenant === undefined || tenantPattern.test(tenant)
    ? Effect.succeed(tenant)
    : Effect.fail(
        SessionTenantAccessError.make({
          message: `Invalid ${source} tenant format. Expected /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.`,
          ...(source === "requested" ? { requestedTenant: tenant } : {}),
          ...(source === "caller" ? { callerTenant: tenant } : {})
        })
      )

export const resolveRequestTenant = (requestedTenant?: string) =>
  Effect.gen(function*() {
    const requestOption = yield* Effect.serviceOption(HttpServerRequest.HttpServerRequest)
    const requested = normalizeTenant(requestedTenant)
    const caller = Option.isSome(requestOption)
      ? normalizeTenant(Headers.get(requestOption.value.headers, callerTenantHeader))
      : undefined

    yield* validateTenant(requested, "requested")
    yield* validateTenant(caller, "caller")

    if (caller === undefined) return requested
    if (requested === undefined || requested === caller) return caller

    return yield* SessionTenantAccessError.make({
        message: "Requested tenant does not match caller tenant.",
        requestedTenant: requested,
        callerTenant: caller
      })
  })
