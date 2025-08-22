import type { Get, Paths } from "type-fest";

const FORBIDDEN = new Set(["__proto__", "prototype", "constructor"]);

export function getAt(
  obj: unknown,
  path: string | Array<string | number>,
  fallback?: unknown,
) {
  const parts = Array.isArray(path)
    ? path
    : path
        .replace(/\[(\d+)]/g, ".$1") // a[0] -> a.0
        .split(".")
        .filter(Boolean);

  let cur: any = obj;
  for (const key of parts) {
    if (cur == null) return fallback;
    if (typeof key === "string" && FORBIDDEN.has(key)) return fallback;
    cur = cur[key as any];
  }
  return cur === undefined ? fallback : cur;
}

type BracketPath<T> = Paths<T, { bracketNotation: true }>; // only strings like 'a[0].b'

export function getTyped<T extends object, const P extends BracketPath<T>>(
  obj: T,
  path: P,
  fallback?: unknown,
): Get<T, P> {
  // your getAt handles bracket syntax already: 'a[0]' -> 'a.0'
  return getAt(obj, path, fallback) as Get<T, P>;
}
