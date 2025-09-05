import type { UnsafeTypes } from "@beep/types";

const FORBIDDEN = new Set(["__proto__", "prototype", "constructor"]);

export function getAt(obj: unknown, path: string | Array<string | number>, fallback?: unknown) {
  const parts = Array.isArray(path)
    ? path
    : path
        .replace(/\[(\d+)]/g, ".$1") // a[0] -> a.0
        .split(".")
        .filter(Boolean);

  let cur: UnsafeTypes.UnsafeAny = obj;
  for (const key of parts) {
    if (cur == null) return fallback;
    if (typeof key === "string" && FORBIDDEN.has(key)) return fallback;
    cur = cur[key as UnsafeTypes.UnsafeAny];
  }
  return cur === undefined ? fallback : cur;
}
