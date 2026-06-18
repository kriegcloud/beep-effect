/**
 * Runtime configuration models and constants for the Microsoft 365 (Graph) driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $M365Id } from "@beep/identity";
import { O } from "@beep/utils";
import { HashSet, pipe } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $M365Id.create("M365.config");

/**
 * Microsoft Graph base URL pinned to the stable `v1.0` endpoint.
 *
 * The driver never targets `beta` in product code (surface drift / no SLA).
 *
 * @example
 * ```ts
 * import { GRAPH_API_BASE_URL } from "@beep/m365"
 *
 * console.log(GRAPH_API_BASE_URL) // "https://graph.microsoft.com/v1.0"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const GRAPH_API_BASE_URL = "https://graph.microsoft.com/v1.0";

/**
 * Default Microsoft identity platform authority host.
 *
 * @example
 * ```ts
 * import { DEFAULT_AUTHORITY_HOST } from "@beep/m365"
 *
 * console.log(DEFAULT_AUTHORITY_HOST) // "https://login.microsoftonline.com"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const DEFAULT_AUTHORITY_HOST = "https://login.microsoftonline.com";

/**
 * Default loopback redirect URI for the delegated authorization-code + PKCE flow.
 *
 * AAD allows any port for `http://localhost` / `http://127.0.0.1` loopback
 * redirects (RFC 8252); the host-owned interactive authorizer binds the port.
 *
 * @example
 * ```ts
 * import { DEFAULT_REDIRECT_URI } from "@beep/m365"
 *
 * console.log(DEFAULT_REDIRECT_URI) // "http://localhost"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const DEFAULT_REDIRECT_URI = "http://localhost";

/**
 * Default throttle-retry budget honored on `429` / `503` responses.
 *
 * @example
 * ```ts
 * import { DEFAULT_MAX_RETRIES } from "@beep/m365"
 *
 * console.log(DEFAULT_MAX_RETRIES) // 3
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const DEFAULT_MAX_RETRIES = 3;

/**
 * Delegated Graph read scopes requested in v1.
 *
 * Least-privilege for read-only ingest; `offline_access` enables silent refresh.
 *
 * @example
 * ```ts
 * import { M365_READ_SCOPES } from "@beep/m365"
 *
 * console.log(M365_READ_SCOPES.includes("Files.Read.All")) // true
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const M365_READ_SCOPES = [
  "offline_access",
  "User.Read",
  "Files.Read.All",
  "Sites.Read.All",
  "Mail.Read",
  "Calendars.Read",
] as const;

/**
 * Write scopes reserved for a future write-back phase. v1 NEVER requests these.
 *
 * The service shape is write-ready (verbs/scopes are extensible), but the v1
 * scope set is read-only by construction — see {@link M365ConfigInput}.
 *
 * @example
 * ```ts
 * import { M365_RESERVED_WRITE_SCOPES } from "@beep/m365"
 *
 * console.log(M365_RESERVED_WRITE_SCOPES.includes("Mail.Send")) // true
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const M365_RESERVED_WRITE_SCOPES = [
  "Files.ReadWrite.All",
  "Sites.ReadWrite.All",
  "Mail.Send",
  "Calendars.ReadWrite",
] as const;

const reservedWriteScopes = HashSet.make(...M365_RESERVED_WRITE_SCOPES);

const requestsNoWriteScope = (scopes: ReadonlyArray<string>): boolean =>
  A.every(scopes, (scope) => !HashSet.has(reservedWriteScopes, scope));

/**
 * Runtime configuration accepted by the Microsoft 365 driver layers.
 *
 * Public-client (delegated, auth-code + PKCE) configuration. `tenantId` and
 * `clientId` are not secrets; `clientSecret` is reserved (and `S.Redacted`) for
 * a future confidential-client path and is unused by the v1 public-client flow.
 * This is an application-boundary input the host constructs, so optional fields
 * stay `S.optionalKey`; {@link resolveM365Config} folds them into `Option`.
 *
 * Requested `scopes` may not include any {@link M365_RESERVED_WRITE_SCOPES}
 * entry — read-only by construction.
 *
 * @example
 * ```ts
 * import { M365ConfigInput } from "@beep/m365"
 *
 * const config = M365ConfigInput.make({
 *   tenantId: "common",
 *   clientId: "00000000-0000-0000-0000-000000000000"
 * })
 *
 * console.log(config.tenantId) // "common"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class M365ConfigInput extends S.Class<M365ConfigInput>($I`M365ConfigInput`)(
  {
    tenantId: S.String.annotateKey({
      description: "Entra tenant id (a GUID, `common`, `organizations`, or `consumers`).",
    }),
    clientId: S.String.annotateKey({
      description: "Entra application (public client) id used for the delegated PKCE flow.",
    }),
    authority: S.optionalKey(S.String).annotateKey({
      description: "Full authority URL; defaults to `${DEFAULT_AUTHORITY_HOST}/${tenantId}` when omitted.",
    }),
    clientSecret: S.optionalKey(S.String.pipe(S.RedactedFromValue)).annotateKey({
      description: "Reserved confidential-client secret; redacted and unused by the v1 public-client flow.",
    }),
    graphBaseUrl: S.optionalKey(S.String).annotateKey({
      description: "Graph base URL override; defaults to the pinned v1.0 endpoint.",
    }),
    maxRetries: S.optionalKey(S.Int).annotateKey({
      description: "Throttle-retry budget honored on 429/503; defaults to DEFAULT_MAX_RETRIES.",
    }),
    redirectUri: S.optionalKey(S.String).annotateKey({
      description: "Loopback redirect URI base for the interactive authorizer; defaults to http://localhost.",
    }),
    scopes: S.optionalKey(
      S.Array(S.String).check(
        S.makeFilter(requestsNoWriteScope, {
          identifier: $I`M365ReadOnlyScopes`,
          title: "M365 read-only scopes",
          description: "v1 requests delegated read scopes only; reserved write scopes must not be requested.",
          message: "Reserved write scope requested; the v1 Microsoft 365 driver is read-only.",
        })
      )
    ).annotateKey({
      description: "Requested delegated scopes; defaults to M365_READ_SCOPES. Reserved write scopes are rejected.",
    }),
    tokenCachePath: S.optionalKey(S.String).annotateKey({
      description: "Filesystem path for the encrypted MSAL token cache; in-memory cache when omitted.",
    }),
  },
  $I.annote("M365ConfigInput", {
    description: "Runtime configuration accepted by the Microsoft 365 Graph driver layers.",
  })
) {}

/**
 * Resolved Microsoft 365 configuration with defaults applied. Internal model
 * shared by the auth and service layers; absence is modeled as `Option`.
 *
 * @example
 * ```ts
 * import { M365ConfigInput, resolveM365Config } from "@beep/m365"
 *
 * const resolved = resolveM365Config(
 *   M365ConfigInput.make({ tenantId: "common", clientId: "client-id" })
 * )
 *
 * console.log(resolved.graphBaseUrl) // "https://graph.microsoft.com/v1.0"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ResolvedM365Config extends S.Class<ResolvedM365Config>($I`ResolvedM365Config`)(
  {
    tenantId: S.String.annotateKey({ description: "Resolved Entra tenant id." }),
    clientId: S.String.annotateKey({ description: "Resolved Entra public-client application id." }),
    authority: S.String.annotateKey({ description: "Resolved authority URL." }),
    scopes: S.Array(S.String).annotateKey({ description: "Resolved delegated read scopes." }),
    redirectUri: S.String.annotateKey({ description: "Resolved loopback redirect URI base." }),
    graphBaseUrl: S.String.annotateKey({ description: "Resolved Graph base URL (normalized, no trailing slash)." }),
    maxRetries: S.Int.annotateKey({ description: "Resolved throttle-retry budget." }),
    tokenCachePath: S.Option(S.String).annotateKey({
      description: "Resolved encrypted token-cache path, if persistence is configured.",
    }),
    clientSecret: S.String.pipe(S.Redacted, S.Option).annotateKey({
      description: "Resolved reserved confidential-client secret, if supplied.",
    }),
  },
  $I.annote("ResolvedM365Config", {
    description: "Resolved Microsoft 365 driver configuration with defaults applied.",
  })
) {}

const normalizeBaseUrl = Str.replace(/\/+$/, "");

/**
 * Apply defaults to {@link M365ConfigInput}, producing a {@link ResolvedM365Config}.
 *
 * @example
 * ```ts
 * import { M365ConfigInput, resolveM365Config } from "@beep/m365"
 *
 * const resolved = resolveM365Config(
 *   M365ConfigInput.make({ tenantId: "common", clientId: "client-id" })
 * )
 *
 * console.log(resolved.graphBaseUrl) // "https://graph.microsoft.com/v1.0"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const resolveM365Config = (input: M365ConfigInput): ResolvedM365Config =>
  ResolvedM365Config.make({
    tenantId: input.tenantId,
    clientId: input.clientId,
    authority: pipe(
      O.fromUndefinedOr(input.authority),
      O.map(normalizeBaseUrl),
      O.getOrElse(() => `${DEFAULT_AUTHORITY_HOST}/${input.tenantId}`)
    ),
    scopes: input.scopes ?? M365_READ_SCOPES,
    redirectUri: normalizeBaseUrl(input.redirectUri ?? DEFAULT_REDIRECT_URI),
    graphBaseUrl: normalizeBaseUrl(input.graphBaseUrl ?? GRAPH_API_BASE_URL),
    maxRetries: input.maxRetries ?? DEFAULT_MAX_RETRIES,
    tokenCachePath: O.fromUndefinedOr(input.tokenCachePath),
    clientSecret: O.fromUndefinedOr(input.clientSecret),
  });
