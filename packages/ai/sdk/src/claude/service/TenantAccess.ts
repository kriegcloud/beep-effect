import { TaggedErrorClass } from "@beep/schema";
import { Effect } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Headers from "effect/unstable/http/Headers";
import * as HttpServerRequest from "effect/unstable/http/HttpServerRequest";

const tenantPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const callerTenantHeader = "x-agent-tenant";

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class SessionTenantAccessError extends TaggedErrorClass<SessionTenantAccessError>()("SessionTenantAccessError", {
  message: S.String,
  requestedTenant: S.optional(S.String),
  callerTenant: S.optional(S.String),
}) {
  static readonly make = (params: Pick<SessionTenantAccessError, "message" | "requestedTenant" | "callerTenant">) =>
    new SessionTenantAccessError(params);
}

const normalizeTenant = (tenant: string | undefined) => {
  if (tenant === undefined) return undefined;
  const trimmed = tenant.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const validateTenant = (tenant: string | undefined, source: "requested" | "caller") =>
  tenant === undefined || tenantPattern.test(tenant)
    ? Effect.succeed(tenant)
    : Effect.fail(
        SessionTenantAccessError.make({
          message: `Invalid ${source} tenant format. Expected /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.`,
          ...(source === "requested" ? { requestedTenant: tenant } : {}),
          ...(source === "caller" ? { callerTenant: tenant } : {}),
        })
      );

/**
 * @since 0.0.0
 * @category DomainLogic
 */
export const resolveRequestTenant = (requestedTenant?: string) =>
  Effect.gen(function* () {
    const requestOption = yield* Effect.serviceOption(HttpServerRequest.HttpServerRequest);
    const requested = normalizeTenant(requestedTenant);
    const caller = O.isSome(requestOption)
      ? Headers.get(requestOption.value.headers, callerTenantHeader).pipe(O.getOrUndefined, normalizeTenant)
      : undefined;

    yield* validateTenant(requested, "requested");
    yield* validateTenant(caller, "caller");

    if (caller === undefined) {
      if (requested === undefined) {
        return undefined;
      }

      return yield* SessionTenantAccessError.make({
        message: "Caller tenant header is required when requesting a tenant.",
        requestedTenant: requested,
        callerTenant: caller,
      });
    }

    if (requested === undefined || requested === caller) return caller;

    return yield* SessionTenantAccessError.make({
      message: "Requested tenant does not match caller tenant.",
      requestedTenant: requested,
      callerTenant: caller,
    });
  });
