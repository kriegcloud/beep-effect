/**
 * Materializes intersections so IntelliSense shows the final flattened shape.
 *
 * Helpful when returning conditional/intersection-heavy helpers without
 * exposing implementation-only aliases.
 *
 * @example
 * import type { Prettify } from "@beep/types/common.types";
 *
 * type Intersect = { id: string } & { name: string };
 * type Readable = Prettify<Intersect>;
 * let example!: Readable;
 * void example;
 *
 * @category Types/Common
 * @since 0.1.0
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Recursively makes every property optional, matching `Partial<T>` semantics at
 * every nesting level.
 *
 * Use this to express "patch" inputs or optional configuration blobs where
 * callers may omit deeply nested sections.
 *
 * @example
 * import type { DeepPartial } from "@beep/types/common.types";
 *
 * interface Settings {
 *   readonly theme: { readonly mode: "light" | "dark"; readonly accent: string };
 * }
 *
 * type SettingsPatch = DeepPartial<Settings>;
 * let example!: SettingsPatch;
 * void example;
 *
 * @category Types/Common
 * @since 0.1.0
 */
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> | undefined } : T;
