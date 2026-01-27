/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as S from "effect/Schema";

import { InvalidUrlError } from "../schema/errors";
import { UrlPattern } from "../schema/url.schema";

const SUPPORTED_URL_PROTOCOLS = HashSet.fromIterable(["http:", "https:", "mailto:", "sms:", "tel:"]);

/**
 * Parses and validates a URL, returning the sanitized URL or "about:blank" for unsupported protocols.
 * @internal
 */
const sanitizeUrlEffect = (url: string): Effect.Effect<string, InvalidUrlError> =>
  pipe(
    Effect.try({
      try: () => new URL(url),
      catch: () => new InvalidUrlError({ message: "Failed to parse URL", url }),
    }),
    Effect.map((parsedUrl) => (HashSet.has(SUPPORTED_URL_PROTOCOLS, parsedUrl.protocol) ? url : "about:blank"))
  );

/**
 * Sanitizes a URL by validating its protocol against a list of supported protocols.
 * Returns "about:blank" for unsupported protocols, or the original URL if parsing fails.
 *
 * @since 0.1.0
 */
export function sanitizeUrl(url: string): string {
  return pipe(
    sanitizeUrlEffect(url),
    Effect.orElseSucceed(() => url),
    Effect.runSync
  );
}

/**
 * Validates a URL string against the UrlPattern schema.
 *
 * @since 0.1.0
 */
export function validateUrl(url: string): boolean {
  // TODO Fix UI for link insertion; it should never default to an invalid URL such as https://.
  if (url === "https://") {
    return true;
  }
  return S.is(UrlPattern)(url);
}
