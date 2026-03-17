import { timingSafeEqual } from "node:crypto";
import { $AiSdkId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { Effect, pipe, ServiceMap } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Headers from "effect/unstable/http/Headers";
import * as HttpServerRequest from "effect/unstable/http/HttpServerRequest";

const $I = $AiSdkId.create("core/service/AgentServerAccess");
const authorizationHeader = "authorization";
const fallbackTokenHeader = "x-agent-auth-token";
const textEncoder = new TextEncoder();

/**
 * Configuration for agent HTTP and RPC transport exposure.
 *
 * @since 0.0.0
 * @category Configuration
 */
export type AgentServerAccessOptions = Readonly<{
  readonly authToken?: string;
  readonly hostname?: string;
}>;

/**
 * Typed access-control failure for agent HTTP and RPC transports.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class AgentServerAccessError extends TaggedErrorClass<AgentServerAccessError>()("AgentServerAccessError", {
  message: S.String,
  hostname: S.optional(S.String),
}) {
  static readonly make = (params: Pick<AgentServerAccessError, "message" | "hostname">) =>
    new AgentServerAccessError(params);
}

type AgentServerAccessShape = {
  readonly authToken: O.Option<string>;
  readonly authorizeRequest: Effect.Effect<void, AgentServerAccessError>;
  readonly hostname: string;
};

/**
 * Access-control service for agent HTTP and RPC transports.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class AgentServerAccess extends ServiceMap.Service<AgentServerAccess, AgentServerAccessShape>()(
  $I`AgentServerAccess`
) {}

const normalizeOptionalValue = (value: string | undefined): O.Option<string> =>
  pipe(O.fromUndefinedOr(value), O.map(Str.trim), O.filter(Str.isNonEmpty));

const normalizeAuthHeaderToken = (value: string): string => {
  const trimmed = Str.trim(value);
  const lowered = Str.toLowerCase(trimmed);
  return Str.startsWith("bearer ")(lowered) ? pipe(trimmed, Str.slice(7), Str.trim) : trimmed;
};

const extractRequestToken = (request: HttpServerRequest.HttpServerRequest): O.Option<string> =>
  pipe(
    normalizeOptionalValue(O.getOrUndefined(Headers.get(request.headers, authorizationHeader))),
    O.map(normalizeAuthHeaderToken),
    O.filter(Str.isNonEmpty),
    O.orElse(() => normalizeOptionalValue(O.getOrUndefined(Headers.get(request.headers, fallbackTokenHeader))))
  );

const normalizeHostname = (hostname: string): string => pipe(hostname, Str.trim, Str.toLowerCase);

const formatHostnameLabel = (hostname: string): string => {
  const normalized = Str.trim(hostname);
  return Str.isNonEmpty(normalized) ? normalized : "<empty>";
};

const isBindAllHostname = (hostname: string): boolean => {
  const normalized = normalizeHostname(hostname);
  return normalized === "" || normalized === "0.0.0.0" || normalized === "::" || normalized === "[::]";
};

const isLoopbackHostname = (hostname: string): boolean => {
  const normalized = normalizeHostname(hostname);
  return normalized === "127.0.0.1" || normalized === "::1" || normalized === "[::1]" || normalized === "localhost";
};

const timingSafeTokenEqual = (left: string, right: string): boolean => {
  const leftBytes = textEncoder.encode(left);
  const rightBytes = textEncoder.encode(right);
  return leftBytes.byteLength === rightBytes.byteLength && timingSafeEqual(leftBytes, rightBytes);
};

/**
 * Build access-control state for agent HTTP and RPC transports.
 *
 * @since 0.0.0
 * @category DomainLogic
 */
export const makeAgentServerAccess = (
  options: AgentServerAccessOptions = {}
): Effect.Effect<AgentServerAccess["Service"], AgentServerAccessError> =>
  Effect.gen(function* () {
    const hostname = options.hostname ?? "127.0.0.1";
    const hostnameLabel = formatHostnameLabel(hostname);
    const authToken = normalizeOptionalValue(options.authToken);

    if (isBindAllHostname(hostname)) {
      return yield* AgentServerAccessError.make({
        message: `Agent server hostname "${hostnameLabel}" binds all interfaces. Use a concrete hostname plus an authToken for non-loopback exposure.`,
        hostname,
      });
    }

    if (!isLoopbackHostname(hostname) && O.isNone(authToken)) {
      return yield* AgentServerAccessError.make({
        message: `Agent server hostname "${hostnameLabel}" requires an authToken when exposed beyond loopback.`,
        hostname,
      });
    }

    const authorizeRequest = pipe(
      authToken,
      O.match({
        onNone: () => Effect.void,
        onSome: (expectedToken) =>
          Effect.gen(function* () {
            const requestOption = yield* Effect.serviceOption(HttpServerRequest.HttpServerRequest);
            if (O.isNone(requestOption)) {
              return yield* AgentServerAccessError.make({
                message: "Agent request authorization requires an active HTTP request context.",
                hostname,
              });
            }

            const providedToken = extractRequestToken(requestOption.value);
            if (O.isSome(providedToken) && timingSafeTokenEqual(providedToken.value, expectedToken)) {
              return;
            }

            return yield* AgentServerAccessError.make({
              message: "Missing or invalid agent auth token.",
              hostname,
            });
          }),
      })
    );

    return AgentServerAccess.of({
      authToken,
      authorizeRequest,
      hostname,
    });
  });
