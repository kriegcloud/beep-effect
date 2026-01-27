/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as HashSet from "effect/HashSet";
import * as S from "effect/Schema";

import { UrlPattern } from "../schema/url.schema";

const SUPPORTED_URL_PROTOCOLS = HashSet.fromIterable(["http:", "https:", "mailto:", "sms:", "tel:"]);

export function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);

    if (!HashSet.has(SUPPORTED_URL_PROTOCOLS, parsedUrl.protocol)) {
      return "about:blank";
    }
  } catch {
    return url;
  }
  return url;
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
