/**
 * Count-and-noun phrasing for parcel summaries.
 *
 * @internal
 * @since 0.0.0
 */
import { dual } from "effect/Function";

/**
 * `1 lane`, `2 lanes`: a count followed by its noun, pluralized with `s`.
 *
 * @internal
 * @since 0.0.0
 */
export const plural: {
  (noun: string): (count: number) => string;
  (count: number, noun: string): string;
} = dual(2, (count: number, noun: string): string => `${count} ${noun}${count === 1 ? "" : "s"}`);
