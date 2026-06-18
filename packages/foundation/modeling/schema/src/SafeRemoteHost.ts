/**
 * Shared SSRF guard for outbound HTTP(S) requests.
 *
 * Blocks requests whose target hostname resolves to the local host or to
 * private/internal network space before any `HttpClient` request is issued.
 * This bounds the SSRF surface of drivers that accept attacker-influenced URLs
 * (USPTO, Box, the NLP MCP dataset loaders, and friends): a prompt-injected or
 * malicious caller must not be able to reach loopback services, link-local
 * addresses, RFC1918/ULA private ranges, or the cloud metadata endpoint
 * (`169.254.169.254`).
 *
 * The module exposes a pure boolean predicate ({@link isBlockedRemoteHost}) and
 * two fail-closed Effect assertions ({@link assertAllowedRemoteHost} and
 * {@link assertAllowedRemoteUrl}) that reject with a typed
 * {@link BlockedHostError}. An optional allowlist permits explicitly trusted
 * hosts (matched case-insensitively against the normalized hostname).
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema/TaggedErrorClass";
import { Effect, pipe, Result } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SchemaId.create("SafeRemoteHost");

// Options accepted by the SSRF guard predicate and assertions: an optional
// `allowlist` of hostnames permitted even when they resolve to internal space
// (matched case-insensitively against the normalized hostname). Inlined at each
// call site rather than exported as a pure-data interface, per schema-first.

/**
 * Typed failure raised when a hostname or URL targets internal network space
 * or cannot be parsed into a hostname.
 *
 * Fails closed: an unparseable URL is treated as blocked rather than allowed.
 *
 * @example
 * ```ts
 * import { BlockedHostError } from "@beep/schema"
 * import * as O from "effect/Option"
 *
 * const error = BlockedHostError.make({
 *   host: "169.254.169.254",
 *   url: O.some("http://169.254.169.254/latest/meta-data"),
 *   message: "Refusing to reach a cloud metadata endpoint: 169.254.169.254",
 *   cause: O.none()
 * })
 * console.log(error._tag)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class BlockedHostError extends TaggedErrorClass<BlockedHostError>($I`BlockedHostError`)(
  "BlockedHostError",
  {
    host: S.String.annotateKey({
      description: "Normalized hostname that was rejected (lowercased, brackets stripped).",
    }),
    url: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Originating URL when the guard was invoked on a full URL.",
    }),
    message: S.String.annotateKey({
      description: "Safe diagnostic message explaining why the host was blocked.",
    }),
    cause: S.OptionFromOptionalKey(S.Defect({ includeStack: true })).annotateKey({
      description: "Underlying parse failure when the URL could not be decoded.",
    }),
  },
  $I.annote("BlockedHostError", {
    description: "Raised when an outbound request targets internal network space or an unparseable URL.",
  })
) {}

/**
 * Normalize a hostname for comparison: lowercase and strip the surrounding
 * brackets that wrap IPv6 literals (e.g. `[::1]` becomes `::1`).
 */
const normalizeHost = (hostname: string): string => pipe(Str.toLowerCase(hostname), Str.replace(/^\[|\]$/g, ""));

/**
 * Report whether a normalized host is present in an optional allowlist.
 */
const isAllowlisted = (host: string, allowlist: ReadonlyArray<string> | undefined): boolean =>
  pipe(
    O.fromNullishOr(allowlist),
    O.map(A.map(normalizeHost)),
    O.map((entries) => A.contains(entries, host)),
    O.getOrElse(() => false)
  );

/**
 * Core blocked-host classifier mirroring the loopback, link-local,
 * RFC1918/ULA private, and cloud-metadata ranges blocked by the dataset loader.
 */
// SSRF host classifier: the explicit loopback/link-local/RFC1918/ULA/metadata
// range checks are intentionally exhaustive and flat for auditability; folding
// them behind abstraction would obscure which ranges are blocked.
// fallow-ignore-next-line complexity
const isInternalHost = (host: string): boolean =>
  // SSRF guard duplicated with @beep/nlp-mcp DatasetLoader.isBlockedRemoteHost by
  // design: each slice owns a self-contained, independently auditable blocklist
  // rather than coupling a foundation schema to a driver's internals.
  // fallow-ignore-next-line code-duplication
  host === "localhost" ||
  Str.endsWith(".localhost")(host) ||
  host === "0.0.0.0" ||
  host === "::" ||
  host === "::1" ||
  Str.startsWith("127.")(host) ||
  Str.startsWith("::ffff:127.")(host) ||
  Str.startsWith("::ffff:7f")(host) ||
  Str.startsWith("169.254.")(host) ||
  Str.startsWith("::ffff:169.254.")(host) ||
  Str.startsWith("::ffff:a9fe:")(host) ||
  Str.startsWith("fe80:")(host) ||
  Str.startsWith("fc")(host) ||
  Str.startsWith("fd")(host) ||
  Str.startsWith("10.")(host) ||
  Str.startsWith("192.168.")(host) ||
  isPrivate172(host);

/**
 * RFC1918 `172.16.0.0/12` covers `172.16.` through `172.31.`; check the second
 * octet explicitly rather than with a broad `172.` prefix that would also block
 * public `172.x` addresses.
 */
const isPrivate172 = (host: string): boolean =>
  pipe(
    Str.match(/^172\.(\d{1,3})\./)(host),
    O.flatMap(A.get(1)),
    O.map((octet) => Number.parseInt(octet, 10)),
    O.filter((n) => !Number.isNaN(n)),
    O.exists((n) => n >= 16 && n <= 31)
  );

/**
 * Report whether a hostname should be blocked as loopback, link-local,
 * private (RFC1918/ULA), or a cloud metadata endpoint.
 *
 * Pure boolean predicate. Hostnames present in `options.allowlist` are never
 * blocked. The input is normalized (lowercased, IPv6 brackets stripped) before
 * matching, so `[::1]`, `::1`, and `LOCALHOST` all classify consistently.
 *
 * @example
 * ```ts
 * import { isBlockedRemoteHost } from "@beep/schema"
 *
 * console.log(isBlockedRemoteHost("169.254.169.254")) // true
 * console.log(isBlockedRemoteHost("example.com")) // false
 * console.log(isBlockedRemoteHost("10.0.0.5", { allowlist: ["10.0.0.5"] })) // false
 * ```
 *
 * @category predicates
 * @since 0.0.0
 */
export const isBlockedRemoteHost = (
  hostname: string,
  options: { readonly allowlist?: ReadonlyArray<string> | undefined } = {}
): boolean => {
  const host = normalizeHost(hostname);
  if (isAllowlisted(host, options.allowlist)) {
    return false;
  }
  return isInternalHost(host);
};

/**
 * Fail-closed assertion that a hostname does not target internal network space.
 *
 * Succeeds with `void` when the host is allowed; fails with a typed
 * {@link BlockedHostError} when the host resolves to loopback, link-local,
 * private, or cloud-metadata space and is not allowlisted.
 *
 * @example
 * ```ts
 * import { assertAllowedRemoteHost } from "@beep/schema"
 * import * as Effect from "effect/Effect"
 *
 * const program = assertAllowedRemoteHost("example.com")
 * console.log(Effect.isEffect(program))
 * ```
 *
 * @effects Fails with `BlockedHostError` when the host is blocked; otherwise
 * succeeds with `void`. Emits a `SafeRemoteHost.assertAllowedRemoteHost` span.
 *
 * @category assertions
 * @since 0.0.0
 */
export const assertAllowedRemoteHost: {
  (options?: {
    readonly allowlist?: ReadonlyArray<string> | undefined;
  }): (hostname: string) => Effect.Effect<void, BlockedHostError>;
  (
    hostname: string,
    options?: { readonly allowlist?: ReadonlyArray<string> | undefined }
  ): Effect.Effect<void, BlockedHostError>;
} = dual(
  (args) => P.isString(args[0]),
  Effect.fn("SafeRemoteHost.assertAllowedRemoteHost")(function* (
    hostname: string,
    options: { readonly allowlist?: ReadonlyArray<string> | undefined } = {}
  ) {
    const host = normalizeHost(hostname);
    if (isBlockedRemoteHost(hostname, options)) {
      return yield* BlockedHostError.make({
        host,
        url: O.none(),
        message: `Refusing to reach a loopback, link-local, private, or metadata host: ${host}`,
        cause: O.none(),
      });
    }
  })
);

/**
 * Fail-closed assertion that a full URL does not target internal network space.
 *
 * Parses the URL, extracts its hostname, and delegates to the same
 * classification used by {@link isBlockedRemoteHost}. An unparseable URL fails
 * with a typed {@link BlockedHostError} carrying the parse defect, so callers
 * never proceed on a URL the guard could not evaluate.
 *
 * @example
 * ```ts
 * import { assertAllowedRemoteUrl } from "@beep/schema"
 * import * as Effect from "effect/Effect"
 *
 * const program = assertAllowedRemoteUrl("https://api.uspto.gov/data")
 * console.log(Effect.isEffect(program))
 * ```
 *
 * @effects Fails with `BlockedHostError` when the URL cannot be parsed or its
 * host is blocked; otherwise succeeds with `void`. Emits a
 * `SafeRemoteHost.assertAllowedRemoteUrl` span.
 *
 * @category assertions
 * @since 0.0.0
 */
export const assertAllowedRemoteUrl: {
  (options?: {
    readonly allowlist?: ReadonlyArray<string> | undefined;
  }): (url: string) => Effect.Effect<void, BlockedHostError>;
  (
    url: string,
    options?: { readonly allowlist?: ReadonlyArray<string> | undefined }
  ): Effect.Effect<void, BlockedHostError>;
} = dual(
  (args) => P.isString(args[0]),
  Effect.fn("SafeRemoteHost.assertAllowedRemoteUrl")(function* (
    url: string,
    options: { readonly allowlist?: ReadonlyArray<string> | undefined } = {}
  ) {
    const parsed = Result.try({
      try: () => new URL(url).hostname,
      catch: (cause) =>
        BlockedHostError.make({
          host: "",
          url: O.some(url),
          message: `Refusing to load from an unparseable URL: ${url}`,
          cause: O.some(cause),
        }),
    });

    const hostname = yield* pipe(
      parsed,
      Result.match({
        onFailure: Effect.fail,
        onSuccess: Effect.succeed,
      })
    );

    const host = normalizeHost(hostname);
    if (isBlockedRemoteHost(hostname, options)) {
      return yield* BlockedHostError.make({
        host,
        url: O.some(url),
        message: `Refusing to load from a loopback, link-local, private, or metadata host: ${host}`,
        cause: O.none(),
      });
    }
  })
);
