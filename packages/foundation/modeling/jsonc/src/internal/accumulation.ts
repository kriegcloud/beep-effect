/**
 * In-place accumulation shared by JSONC parsing, scanning and formatting.
 *
 * **Details**
 *
 * Kept as an internal seam so tests can count actual indexed reads and writes
 * inside an append, including copies of previously accumulated elements.
 *
 * **Example** (Accumulate without copying the prefix)
 *
 * ```ts
 * import { accumulation } from "@beep/jsonc/internal/accumulation"
 *
 * const items: Array<number> = []
 * accumulation.append(items, 1)
 * console.log(items) // [1]
 * ```
 *
 * @internal
 * @category utilities
 * @since 0.0.0
 */
export const accumulation = {
  append<T>(items: Array<T>, item: T): void {
    items.push(item);
  },
};
