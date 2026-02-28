import type { Path } from "effect";

// cspell:ignore codegraph
/**
 * Normalizes a path to POSIX separators.
 *
 * @param p - Input path to normalize.
 * @param path - Effect `Path` service used to resolve current path separator.
 * @returns Path with POSIX (`/`) separators.
 * @category codegraph
 * @since 0.0.0
 */
export function normalizePath(p: string, path: Path.Path) {
  return p.split(path.sep).join("/");
}
