/**
 * Aggregate secure-header option schema and creation helpers.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { $SchemaId } from "@beep/identity";
import { A } from "@beep/utils";
import { Effect, pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { CrossOriginEmbedderPolicyHeader, CrossOriginEmbedderPolicyOption } from "./CrossOriginEmbedderPolicy.ts";
import { CrossOriginOpenerPolicyHeader, CrossOriginOpenerPolicyOption } from "./CrossOriginOpenerPolicy.ts";
import { CrossOriginResourcePolicyHeader, CrossOriginResourcePolicyOption } from "./CrossOriginResourcePolicy.ts";
import { ContentSecurityPolicyHeader, ContentSecurityPolicyOption } from "./Csp.ts";
import { ExpectCTHeader, ExpectCTOption } from "./ExpectCT.ts";
import { ForceHttpsRedirectHeader, ForceHttpsRedirectOption } from "./ForceHttpsRedirect.ts";
import { FrameGuardHeader, FrameGuardOption } from "./FrameGuard.ts";
import { NoOpenHeader, NoOpenOption } from "./NoOpen.ts";
import { NoSniffHeader, NoSniffOption } from "./NoSniff.ts";
import { PermissionsPolicyHeader, PermissionsPolicyOption } from "./PermissionsPolicy.ts";
import {
  PermittedCrossDomainPoliciesHeader,
  PermittedCrossDomainPoliciesOption,
} from "./PermittedCrossDomainPolicies.ts";
import { ReferrerPolicyHeader, ReferrerPolicyOption } from "./ReferrerPolicy.ts";
import type { SecureHeaderError } from "./SecureHeaderError.ts";
import { XSSProtectionHeader, XSSProtectionOption } from "./XSSProtection.ts";

const $I = $SchemaId.create("http/headers/SecureHeaderOptions");

type ResolvedHeader = {
  readonly name: string;
  readonly value: string;
};

/**
 * Aggregate input options for configuring all secure response headers.
 *
 * @example
 * ```ts
 * import { SecureHeaderOptions } from "@beep/schema/SecureHeaderOptions"
 *
 * const options = SecureHeaderOptions.make({ nosniff: "nosniff" })
 * void options
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class SecureHeaderOptions extends S.Class<SecureHeaderOptions>($I`SecureHeaderOptions`)(
  {
    contentSecurityPolicy: S.optionalKey(ContentSecurityPolicyOption),
    crossOriginEmbedderPolicy: S.optionalKey(CrossOriginEmbedderPolicyOption),
    crossOriginOpenerPolicy: S.optionalKey(CrossOriginOpenerPolicyOption),
    crossOriginResourcePolicy: S.optionalKey(CrossOriginResourcePolicyOption),
    expectCT: S.optionalKey(ExpectCTOption),
    forceHttpsRedirect: S.optionalKey(ForceHttpsRedirectOption),
    frameGuard: S.optionalKey(FrameGuardOption),
    noopen: S.optionalKey(NoOpenOption),
    nosniff: S.optionalKey(NoSniffOption),
    permissionsPolicy: S.optionalKey(PermissionsPolicyOption),
    permittedCrossDomainPolicies: S.optionalKey(PermittedCrossDomainPoliciesOption),
    referrerPolicy: S.optionalKey(ReferrerPolicyOption),
    xssProtection: S.optionalKey(XSSProtectionOption),
  },
  $I.annote("SecureHeaderOptions", {
    description: "Aggregate input options for secure response-header creation.",
  })
) {}

/**
 * A rendered secure header pair in `{ key, value }` format.
 *
 * @example
 * ```ts
 * import { SecureHeaderEntry } from "@beep/schema/SecureHeaderOptions"
 *
 * const entry = SecureHeaderEntry.make({ key: "X-Content-Type-Options", value: "nosniff" })
 * void entry
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class SecureHeaderEntry extends S.Class<SecureHeaderEntry>($I`SecureHeaderEntry`)(
  {
    key: S.String,
    value: S.String,
  },
  $I.annote("SecureHeaderEntry", {
    description: "A rendered secure header pair in `{ key, value }` format.",
  })
) {}

const resolveHeaders = Effect.fnUntraced(function* (
  options: SecureHeaderOptions = {}
): Effect.fn.Return<ReadonlyArray<ResolvedHeader>, SecureHeaderError> {
  const headerEffects = A.make(
    ContentSecurityPolicyHeader.create(options.contentSecurityPolicy),
    CrossOriginEmbedderPolicyHeader.create(options.crossOriginEmbedderPolicy),
    CrossOriginOpenerPolicyHeader.create(options.crossOriginOpenerPolicy),
    CrossOriginResourcePolicyHeader.create(options.crossOriginResourcePolicy),
    ExpectCTHeader.create(options.expectCT),
    ForceHttpsRedirectHeader.create(options.forceHttpsRedirect),
    FrameGuardHeader.create(options.frameGuard),
    NoOpenHeader.create(options.noopen),
    NoSniffHeader.create(options.nosniff),
    PermissionsPolicyHeader.create(options.permissionsPolicy),
    PermittedCrossDomainPoliciesHeader.create(options.permittedCrossDomainPolicies),
    ReferrerPolicyHeader.create(options.referrerPolicy),
    XSSProtectionHeader.create(options.xssProtection)
  );

  const headers = yield* Effect.all(headerEffects, {
    concurrency: headerEffects.length,
  });

  let resolvedHeaders = A.empty<ResolvedHeader>();

  A.forEach(headers, (headerOption) => {
    if (O.isNone(headerOption)) {
      return;
    }

    const header = headerOption.value;

    if (O.isNone(header.value)) {
      return;
    }

    resolvedHeaders = A.append(resolvedHeaders, {
      name: header.name,
      value: header.value.value,
    });
  });

  return resolvedHeaders;
});

/**
 * Resolve secure-header options into a plain `Record<string, string>` header object.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { createHeadersObject } from "@beep/schema/SecureHeaderOptions"
 *
 * const program = createHeadersObject({ nosniff: "nosniff" })
 * void program
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const createHeadersObject = Effect.fn("SecureHeaderOptions.createHeadersObject")(function* (
  options: SecureHeaderOptions = {}
): Effect.fn.Return<Record<string, string>, SecureHeaderError> {
  const headers = yield* resolveHeaders(options);

  return pipe(
    headers,
    A.reduce({} as Record<string, string>, (acc, header) => ({
      ...acc,
      [header.name]: header.value,
    }))
  );
});

/**
 * Resolve secure-header options into an array of {@link SecureHeaderEntry} pairs.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { createSecureHeaders } from "@beep/schema/SecureHeaderOptions"
 *
 * const program = createSecureHeaders({ nosniff: "nosniff" })
 * void program
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const createSecureHeaders = Effect.fn("SecureHeaderOptions.createSecureHeaders")(function* (
  options: SecureHeaderOptions = {}
): Effect.fn.Return<ReadonlyArray<SecureHeaderEntry>, SecureHeaderError> {
  const headers = yield* resolveHeaders(options);

  return A.map(
    headers,
    (header) =>
      SecureHeaderEntry.make({
        key: header.name,
        value: header.value,
      })
  );
});
