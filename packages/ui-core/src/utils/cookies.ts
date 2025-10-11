import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";

export type CookieOptions = {
  secure?: boolean;
  daysUntilExpiration?: number;
  sameSite?: "Strict" | "Lax" | "None";
  domain?: string;
  path?: string;
};

// Internal: feature-detect CookieStore API safely across environments (e.g. SSR)
function hasCookieStore(): boolean {
  return typeof globalThis.cookieStore !== "undefined";
}

// Map our title-cased SameSite option to CookieStore's lowercase values
function toCookieStoreSameSite(sameSite: CookieOptions["sameSite"]): "strict" | "lax" | "none" | undefined {
  switch (sameSite) {
    case "Strict":
      return "strict";
    case "Lax":
      return "lax";
    case "None":
      return "none";
    default:
      return undefined;
  }
}

/**
 * Retrieves a cookie value by key.
 *
 * @param {string} key - The key of the cookie to retrieve.
 * @returns {T | null} - The parsed value of the cookie, or null if not found or an error occurs.
 *
 * @example
 * const user = getCookie<{ name: string, age: number }>('user');
 * console.log(user); // { name: 'John', age: 30 }
 */
export function getCookie<T>(key: string): T | null {
  if (!key || P.not(Str.isString)(key)) {
    console.warn("Invalid cookie key provided");
    return null;
  }

  try {
    const keyName = `${key}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = Str.split("; ")(decodedCookie);

    const matchedCookie = A.findFirst(cookieArray, (cookie) => Str.startsWith(keyName)(cookie));

    if (O.isNone(matchedCookie)) return null;

    const cookieValue = O.getOrThrow(matchedCookie).substring(keyName.length);

    try {
      return JSON.parse(cookieValue) as T;
    } catch {
      return cookieValue as T;
    }
  } catch (error) {
    console.error("Error retrieving cookie:", error);
    return null;
  }
}

/**
 * Sets a cookie with a specified key, value, and options.
 *
 * @template T
 * @param {string} key - The key of the cookie to set.
 * @param {T} value - The value of the cookie to set.
 * @param {CookieOptions} [options] - The options for the cookie.
 *
 * @example
 * setCookie('user', { name: 'John', age: 30 }, { daysUntilExpiration: 7, sameSite: 'Lax', secure: true });
 */
export async function setCookie<T>(key: string, value: T, options?: CookieOptions): Promise<void> {
  if (!key || P.not(Str.isString)(key)) {
    console.error("Invalid cookie key provided");
    return;
  }

  const { daysUntilExpiration = 0, sameSite = "Strict", secure = false, path = "/", domain } = options ?? {};

  try {
    const rawValue = typeof value === "string" ? value : JSON.stringify(value);

    if (hasCookieStore()) {
      const sameSiteLower = toCookieStoreSameSite(sameSite);

      if (sameSiteLower === "none" && !secure) {
        console.warn("SameSite=None typically requires 'secure: true'; cookie may be rejected by browsers.");
      }

      const init: CookieInit = {
        name: key,
        value: rawValue,
        path,
      };
      if (domain) init.domain = domain;
      if (typeof sameSiteLower !== "undefined") init.sameSite = sameSiteLower;
      if (daysUntilExpiration > 0) {
        init.expires = Date.now() + daysUntilExpiration * 24 * 60 * 60 * 1000;
      }

      await cookieStore.set(init);
      return;
    }

    // No direct document.cookie assignment allowed; fail gracefully
    console.error("CookieStore API is not available in this environment; cannot set cookie.");
  } catch (error) {
    console.error("Error setting cookie:", error);
  }
}

/**
 * Removes a cookie by key.
 *
 * @param {string} key - The key of the cookie to remove.
 * @param {Pick<CookieOptions, 'path' | 'domain'>} [options] - The options for the cookie removal.
 *
 * @example
 * removeCookie('user');
 */
export function removeCookie(key: string, options?: Pick<CookieOptions, "path" | "domain">): void {
  if (!key || P.not(Str.isString)(key)) {
    console.error("Invalid cookie key provided");
    return;
  }

  const { path = "/", domain } = options ?? {};

  try {
    if (hasCookieStore()) {
      // Fire-and-forget; keep API sync to avoid breaking callers
      const del: CookieStoreDeleteOptions = { name: key, path };
      if (domain) del.domain = domain;
      cookieStore.delete(del).catch((error: unknown) => console.error("Error removing cookie via CookieStore:", error));
      return;
    }

    // No direct document.cookie assignment allowed; fail gracefully
    console.error("CookieStore API is not available in this environment; cannot remove cookie.");
  } catch (error) {
    console.error("Error removing cookie:", error);
  }
}
