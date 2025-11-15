import * as A from "effect/Array";
import * as Str from "effect/String";
export function hasParams(url: string): boolean {
  try {
    const urlObj = new URL(url, window.location.origin);
    return A.fromIterable(urlObj.searchParams.keys()).length > 0;
  } catch {
    return false;
  }
}

export function removeLastSlash(pathname: string): string {
  const isValid = pathname !== "/" && Str.endsWith("/")(pathname);

  return isValid ? Str.slice(0, -1)(pathname) : pathname;
}

export function isEqualPath(targetUrl: string, pathname: string): boolean {
  return removeLastSlash(targetUrl) === removeLastSlash(pathname);
}

export function removeParams(url: string): string {
  try {
    const urlObj = new URL(url, window.location.origin);

    return removeLastSlash(urlObj.pathname);
  } catch {
    return url;
  }
}

export function isExternalLink(url: string): boolean {
  return /^https?:\/\//i.test(url);
}
