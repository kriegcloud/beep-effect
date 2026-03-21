import { Effect, Layer, Match } from "effect";
import * as P from "effect/Predicate";
import { AgentRuntime, type RemoteSyncOptions } from "../AgentRuntime.js";
import { ConfigError } from "../Errors.js";
import { ConflictPolicy } from "./ConflictPolicy.js";

/**
 * @since 0.0.0
 * @category Integration
 */
export type RemoteUrlOptions = Readonly<{
  readonly tenant?: string;
  readonly authToken?: string;
}>;

/**
 * @since 0.0.0
 * @category Integration
 */
export type ConflictPolicyOption = "lastWriteWins" | "firstWriteWins" | "reject" | Layer.Layer<ConflictPolicy>;

/**
 * @since 0.0.0
 * @category Integration
 */
export type RemoteSyncLayerOptions = Omit<RemoteSyncOptions, "url" | "conflictPolicy"> & {
  readonly conflictPolicy?: ConflictPolicyOption;
  readonly tenant?: string;
  readonly authToken?: string;
};

const tenantPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

/**
 * @since 0.0.0
 * @category Integration
 */
export const buildRemoteUrl = Effect.fn("RemoteSync.buildRemoteUrl")(function* (
  baseUrl: string,
  options?: RemoteUrlOptions
) {
  const url = new URL(baseUrl);
  const path = url.pathname === "/" ? "/event-log" : url.pathname;
  const isEventLogPath = path === "/event-log" || path === "/event-log/";
  if (isEventLogPath) {
    const tenant = options?.tenant;
    if (tenant === undefined || tenant.length === 0) {
      return yield* ConfigError.make({
        message: "Remote sync requires a tenant when using /event-log.",
      });
    }
    if (!tenantPattern.test(tenant)) {
      return yield* ConfigError.make({
        message: "Invalid tenant format.",
      });
    }
    url.pathname = `/event-log/${encodeURIComponent(tenant)}`;
  } else {
    url.pathname = path;
  }
  if (options?.authToken !== undefined) {
    url.searchParams.set("token", options.authToken);
  }
  return url.toString();
});

const resolveConflictPolicyLayer = (input?: ConflictPolicyOption) => {
  if (input === undefined) return undefined;
  if (!P.isString(input)) return input;
  return Match.value(input).pipe(
    Match.when("firstWriteWins", () => ConflictPolicy.layerFirstWriteWins),
    Match.when("reject", () => ConflictPolicy.layerReject()),
    Match.orElse(() => ConflictPolicy.layerLastWriteWins)
  );
};

/**
 * One-liner helper to wire remote sync layers for the AgentRuntime.
 */
/**
 * @since 0.0.0
 * @category Integration
 */
export const withRemoteSync = (url: string, options?: RemoteSyncLayerOptions) => {
  const { conflictPolicy, tenant, authToken, ...rest } = options ?? {};
  const resolvedConflictPolicy = resolveConflictPolicyLayer(conflictPolicy);
  const remoteUrlOptions = {
    ...(tenant !== undefined ? { tenant } : {}),
    ...(authToken !== undefined ? { authToken } : {}),
  };
  if (tenant === undefined && authToken === undefined) {
    return AgentRuntime.layerWithRemoteSync({
      url,
      ...rest,
      ...(resolvedConflictPolicy !== undefined ? { conflictPolicy: resolvedConflictPolicy } : {}),
    });
  }
  return Layer.unwrap(
    buildRemoteUrl(url, remoteUrlOptions).pipe(
      Effect.map((resolvedUrl) =>
        AgentRuntime.layerWithRemoteSync({
          url: resolvedUrl,
          ...rest,
          ...(resolvedConflictPolicy !== undefined ? { conflictPolicy: resolvedConflictPolicy } : {}),
        })
      )
    )
  );
};
