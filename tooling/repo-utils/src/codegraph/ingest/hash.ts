import { createHash } from "node:crypto";

// cspell:ignore codegraph
/**
 * Builds a stable short identifier from ordered parts.
 *
 * @param parts - Ordered hash input parts.
 * @returns Stable 16-character SHA-1 prefix identifier.
 * @category codegraph
 * @since 0.0.0
 */
export function makeId(parts: (string | number | undefined | null)[]) {
  const h = createHash("sha1");
  for (const p of parts) h.update(String(p ?? ""));
  return h.digest("hex").slice(0, 16); // short but stable
}
