import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";

// public-paths-to-record.ts
// -------------------------------------------------------------------------------------------------
// Build a type-safe accessor object and tuple structure from a list of public asset paths.
// Folder keys are camelized (dashes removed) and file names camelized with dashes removed.
// Leaves can be either exact literal path strings or widened to `string` via an option.
// -------------------------------------------------------------------------------------------------

/**
 * Camel-case a dash-separated identifier (e.g. `"ic-app-5"` → `"icApp5"`), preserving literal types.
 *
 * @example
 * const id = toJsAccessor("ic-app-5"); // "icApp5"
 *
 * @category String • Identifiers
 * @since 1.0.0
 */
export function toJsAccessor<S extends string>(str: S): CamelCase<S> {
  return F.pipe(
    str,
    Str.split("-"),
    A.map((part, idx) =>
      idx === 0 ? part : Str.toUpperCase(Str.charAt(part, 0).pipe(O.getOrThrow)) + Str.slice(1)(part)
    ),
    A.join("")
  ) as CamelCase<S>;
}

/* =======================================
 * Type-level helpers
 * =======================================
 */

/** Remove a single leading slash. */
type StripLeadingSlash<S extends string> = S extends `/${infer R}` ? R : S;

/** Split a path on "/", ignoring the empty leading segment when the path starts with "/". */
type SplitPath<S extends string> = S extends `${infer A}/${infer B}`
  ? A extends ""
    ? SplitPath<B>
    : [A, ...SplitPath<B>]
  : S extends ""
    ? []
    : [S];

/** Remove the last file extension (last dot wins). */
type RemoveExt<S extends string> = S extends `${infer Base}.${string}` ? Base : S;

/** Runtime mirror of `RemoveExt`. */
export function removeExt(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? name : name.slice(0, i);
}

/** Type-level camelizer for dash-separated tokens. */
type CamelCase<S extends string> = S extends `${infer H}-${infer C}${infer R}`
  ? `${H}${Uppercase<C>}${CamelCase<R>}`
  : S;

/** Camelized directory key preserving literal types. */
type DirectoryKey<S extends string> = CamelCase<S>;

/** Camelized base name key used for file leaves. */
type FileKey<S extends string> = CamelCase<RemoveExt<S>>;

/** Convert a union to an intersection. */
type UnionToIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

/* =======================================
 * Tuple builders (optional shape)
 * =======================================
 */

/**
 * A nested tuple for a single path:
 * - Non-leaf: `[segment, NestedTuple]`
 * - Leaf: `[fileBaseName (no ext), camelizedFileBase]`
 *
 * @example
 * "/assets/background/background-3-blur.avif"
 * -> ["assets", ["background", ["background-3-blur", "background3Blur"]]]
 */
export type NestedTuple = readonly [string, NestedTuple] | readonly [string, string];

/** Build nested tuple type from path segments. */
type BuildNestedTuple<Segs extends readonly string[]> = Segs extends [infer Only extends string]
  ? readonly [RemoveExt<Only>, FileKey<Only>]
  : Segs extends [infer Head extends string, ...infer Tail extends string[]]
    ? readonly [DirectoryKey<Head>, BuildNestedTuple<Tail>]
    : never;

/** Map an array of paths to nested tuples. */
export type PathTuplesFrom<Paths extends readonly string[]> = {
  [K in keyof Paths]: BuildNestedTuple<SplitPath<StripLeadingSlash<Paths[K] & string>>>;
};

/**
 * Convert a single path into a `NestedTuple` at runtime.
 *
 * @example
 * toNestedTuple("/logo.png") // ["logo", "logo"]
 * toNestedTuple("/a/b/file-name.svg") // ["a", ["b", ["file-name", "fileName"]]]
 * toNestedTuple("/settings-panel/icon.svg") // ["settingsPanel", "icon"]
 *
 * @category Paths • Tuples
 * @since 1.0.0
 */
export function toNestedTuple(path: string): NestedTuple {
  const parts = path.split("/").filter(Boolean); // drop leading ""
  if (parts.length === 0) return ["", ""] as const; // defensive
  const last = parts[parts.length - 1]!;
  const base = removeExt(last);
  const camel = toJsAccessor(base);

  if (parts.length === 1) {
    // root file: "/logo.png" -> ["logo", "logo"]
    return [base, camel] as const;
  }

  // Build from tail: [lastDir, camelFileBase] then wrap upward with parent dirs.
  let node: NestedTuple = [toJsAccessor(parts[parts.length - 2]!), camel] as const;
  for (let i = parts.length - 3; i >= 0; i--) {
    node = [toJsAccessor(parts[i]!), node] as const;
  }
  return node;
}

/**
 * Convert an array of paths into nested tuples (literal-preserving).
 *
 * @category Paths • Tuples
 * @since 1.0.0
 */
export function buildPathTuples<const A extends readonly [string, ...string[]]>(paths: A): PathTuplesFrom<A> {
  return paths.map(toNestedTuple) as PathTuplesFrom<A>;
}

/* =======================================
 * Accessor object builder
 * =======================================
 */

/**
 * Construct the *type shape* for the accessor object produced from an array of paths.
 * Folder names are object keys; file leaves are camelized base names.
 * Leaves can be exact literal strings or widened to `string` based on the `Widen` flag.
 */
type ObjFromPath<P extends string, Widen extends boolean> = SplitPath<StripLeadingSlash<P>> extends [
  ...infer Dirs extends string[],
  infer File extends string,
]
  ? Dirs extends []
    ? { [K in FileKey<File>]: Widen extends true ? string : P } // root file
    : BuildNest<Dirs, File, P, Widen>
  : never;

/** Recursively build `{ dir: ... }` … `{ fileKey: value }` for the final leaf. */
type BuildNest<
  Dirs extends readonly string[],
  File extends string,
  P extends string,
  Widen extends boolean,
> = Dirs extends [infer H extends string, ...infer T extends string[]]
  ? { [K in DirectoryKey<H>]: BuildNest<T, File, P, Widen> }
  : { [K in FileKey<File>]: Widen extends true ? string : P };

/** Merge all per-path objects into one tree, keeping literal keys. */
export type PathObjectFrom<Paths extends readonly string[], Widen extends boolean> = UnionToIntersection<
  ObjFromPath<Paths[number] & string, Widen>
> extends infer I
  ? { readonly [K in keyof I]: I[K] }
  : never;

/** Options controlling the leaf value types for the accessor object. */
export type BuildOptions = {
  /**
   * If `true`, file leaves are typed as `string` instead of exact literal path strings.
   * Use this to avoid extremely large union types at usage sites.
   *
   * @default false
   */
  readonly widenLeavesToString?: boolean | undefined;
};

/**
 * Build a type-safe accessor object from an array of public paths.
 *
 * - Directory segments become nested objects (keys camelized).
 * - File leaves become camelized keys of the file base name (extension removed).
 * - Leaf values are, by default, the exact literal path strings; you can widen them to `string`.
 *
 * @example
 * const publicPaths = [
 *   "/logo.png",
 *   "/assets/background/background-3-blur.avif",
 * ] as const;
 *
 * const obj = pathObjFromPaths(publicPaths);
 * // obj.logo === "/logo.png"
 * // obj.assets.background.background3Blur === "/assets/background/background-3-blur.avif"
 *
 * const wide = pathObjFromPaths(publicPaths, { widenLeavesToString: true });
 * // wide.logo is typed as string (value still "/logo.png" at runtime)
 *
 * @category Paths • Object Accessors
 * @since 1.0.0
 */
export function pathObjFromPaths<
  const A extends readonly string[],
  const Opt extends BuildOptions | undefined = undefined,
>(paths: A, options?: Opt | undefined): PathObjectFrom<A, Opt extends { widenLeavesToString: true } ? true : false> {
  const widen = options?.widenLeavesToString === true;

  const root: Record<string, unknown> = {};

  for (const p of paths as readonly string[]) {
    const parts = p.split("/").filter(Boolean); // e.g. ["assets","background","background-3-blur.avif"]
    const file = parts[parts.length - 1]!;
    const fileKey = toJsAccessor(removeExt(file)); // e.g. "background3Blur"

    if (parts.length === 1) {
      // root file: "/logo.png" => root.logo
      (root as UnsafeTypes.UnsafeAny)[fileKey] = widen ? (p as string) : p;
    } else {
      // nested file: "/a/b/.../name.ext" => root.a.b....[fileKey]
      let node = root as Record<string, unknown>;
      for (let i = 0; i < parts.length - 1; i++) {
        const seg = parts[i]!;
        const dirKey = toJsAccessor(seg);
        node = (node[dirKey] ??= {}) as Record<string, unknown>;
      }
      node[fileKey] = widen ? (p as string) : p;
    }
  }

  return root as PathObjectFrom<A, Opt extends { widenLeavesToString: true } ? true : false>;
}

/* =======================================
 * Notes for production usage
 * =======================================
 *
 * 1) Ensure your generated list uses `as const` to preserve literal types:
 *    export const publicPaths = ["/logo.png", ...] as const;
 *
 * 2) For huge path lists, you may prefer:
 *    pathObjFromPaths(publicPaths, { widenLeavesToString: true })
 *    …to avoid very large union types in IntelliSense while keeping exact values at runtime.
 *
 * 3) The accessor keys shown in IntelliSense come from:
 *    - directories: camelized via `toJsAccessor` ("assets", "settingsPanel", …)
 *    - files: camelized base names ("androidChrome192x192", "background3Blur", "logo", …)
 *
 * 4) If you still see unions at leaves, something widened your `publicPaths` before reaching
 *    this function—import the constant directly, or use `{ widenLeavesToString: true }`.
 */
