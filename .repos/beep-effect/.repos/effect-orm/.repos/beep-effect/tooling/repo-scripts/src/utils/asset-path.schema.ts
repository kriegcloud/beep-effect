import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
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
 * @since 0.1.0
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
 * @since 0.1.0
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
 * @since 0.1.0
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
 * @since 0.1.0
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
      (root as any)[fileKey] = widen ? (p as string) : p;
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
export const NextgenConvertableExtensionKit = S.Literal("jpg", "jpeg", "png", "webp");
export class SupportedFileExtensionKit extends S.Literal(
  "gif",
  "ico",
  "jpeg",
  "jpg",
  "mkv",
  "mp4",
  "png",
  "avif",
  "svg",
  "wasm",
  "webmanifest",
  "webp",
  "tif",
  "tiff",
  "js"
) {
  static readonly Options = [
    "gif",
    "ico",
    "jpeg",
    "jpg",
    "mkv",
    "mp4",
    "png",
    "avif",
    "svg",
    "wasm",
    "webmanifest",
    "webp",
    "tif",
    "tiff",
    "js",
  ] as const;
}

const jsIdentifierStartRegex = /^[a-z_$]/;
const jsPropertyAccessorRegex = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const kebabCaseFileBaseRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const directorySegmentRegex = /^[a-z0-9_$]+(?:-[a-z0-9_$]+)*$/;
const reservedObjectKeys = new Set(["__proto__", "prototype", "constructor"]);

// Schema enforcing the expected invariants for generated public asset paths.
export const AssetPath = S.String.pipe(
  S.filter((value) => Str.startsWith("/")(value) || "Asset path must start with '/'"),
  S.filter((value) => value === Str.toLowerCase(value) || "Asset path must be lower case"),
  S.filter((value) => !A.contains("//")(value) || "Asset path cannot contain consecutive '/' characters"),
  S.filter((value) => {
    const segments = Str.split("/")(Str.slice(1)(value));
    if (segments.some((segment) => segment.length === 0)) {
      return "Asset path segments cannot be empty";
    }
    for (const segment of segments) {
      if (reservedObjectKeys.has(segment)) {
        return `Asset path segment "${segment}" is reserved`;
      }
    }
    if (segments.some((segment) => /^[0-9]/.test(segment))) {
      return "Asset path segments cannot begin with a number";
    }
    if (segments.some((segment) => !jsIdentifierStartRegex.test(segment[0] ?? ""))) {
      return "Asset path segments must begin with a valid JavaScript identifier character";
    }

    const directorySegments = segments.slice(0, -1);
    for (const segment of directorySegments) {
      if (!directorySegmentRegex.test(segment)) {
        return `Directory segment "${segment}" may only contain lowercase letters, digits, '_' or '-' separators`;
      }
      const accessorCandidate = toJsAccessor(segment);
      if (!jsPropertyAccessorRegex.test(accessorCandidate)) {
        return `Directory segment "${segment}" generates invalid JS accessor "${accessorCandidate}"`;
      }
      if (reservedObjectKeys.has(accessorCandidate)) {
        return `Directory segment "${segment}" generates reserved JS accessor "${accessorCandidate}"`;
      }
    }

    const fileSegment = segments[segments.length - 1]!;
    const extensionIndex = fileSegment.lastIndexOf(".");
    if (extensionIndex === -1 || extensionIndex === fileSegment.length - 1) {
      return "Asset path must include a supported file extension";
    }
    const extension = fileSegment.slice(extensionIndex + 1);
    const baseName = fileSegment.slice(0, extensionIndex);
    if (!kebabCaseFileBaseRegex.test(baseName)) {
      return `Asset file base name "${baseName}" must be kebab-case (letters and digits separated by single '-')`;
    }
    if (reservedObjectKeys.has(baseName)) {
      return `Asset file base name "${baseName}" cannot be a reserved object key`;
    }
    const accessorCandidate = toJsAccessor(baseName);
    if (!jsPropertyAccessorRegex.test(accessorCandidate)) {
      return `Asset file name generates invalid JS accessor "${accessorCandidate}"`;
    }
    if (reservedObjectKeys.has(accessorCandidate)) {
      return `Asset file name generates reserved JS accessor "${accessorCandidate}"`;
    }
    return (
      S.is(SupportedFileExtensionKit)(extension) ||
      `Unsupported asset extension ".${extension}". Supported extensions: ${SupportedFileExtensionKit.Options.join(", ")}`
    );
  })
);

export declare namespace AssetPath {
  export type Type = typeof AssetPath.Type;
  export type Encoded = typeof AssetPath.Encoded;
}

export const AssetPaths = S.Array(AssetPath).pipe(
  S.filter((paths) => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const path of paths) {
      if (seen.has(path)) {
        duplicates.add(path);
      } else {
        seen.add(path);
      }
    }
    return duplicates.size === 0 || `Duplicate asset paths detected: ${Array.from(duplicates).join(", ")}`;
  }),
  S.filter((paths) => {
    const duplicateBases: string[] = [];
    const invalidDirectoryAccessorSources = new Set<string>();
    const invalidAccessorSources: string[] = [];
    const accessorCollisions: string[] = [];
    const directoryAccessorCollisionMessages = new Set<string>();
    const directoryAccessorConflicts: string[] = [];
    const baseNamesByDir = new Map<string, Map<string, string[]>>();
    const accessorByDir = new Map<string, Map<string, string[]>>();
    const directoryAccessorsByDir = new Map<string, Map<string, string>>();

    const register = (collection: Map<string, Map<string, string[]>>, dir: string, key: string, path: string) => {
      let perDir = collection.get(dir);
      if (!perDir) {
        perDir = new Map<string, string[]>();
        collection.set(dir, perDir);
      }
      const pathsForKey = perDir.get(key);
      if (!pathsForKey) {
        perDir.set(key, [path]);
      } else {
        pathsForKey.push(path);
      }
    };

    const registerDirectoryAccessor = (parent: string, accessor: string, sourceDir: string) => {
      let perDir = directoryAccessorsByDir.get(parent);
      if (!perDir) {
        perDir = new Map<string, string>();
        directoryAccessorsByDir.set(parent, perDir);
      }
      const existing = perDir.get(accessor);
      if (existing && existing !== sourceDir) {
        directoryAccessorCollisionMessages.add(`${parent}: accessor "${accessor}" ← ${existing}, ${sourceDir}`);
        return;
      }
      if (!existing) {
        perDir.set(accessor, sourceDir);
      }
    };

    for (const path of paths) {
      const lastSlash = path.lastIndexOf("/");
      const directory = lastSlash <= 0 ? "/" : path.slice(0, lastSlash);
      const fileName = path.slice(lastSlash + 1);
      const baseName = removeExt(fileName);

      const segments = path.slice(1).split("/");
      const directorySegments = segments.slice(0, -1);
      let parentDir = "/";
      for (const segment of directorySegments) {
        const currentDirPath = parentDir === "/" ? `/${segment}` : `${parentDir}/${segment}`;
        const directoryAccessor = toJsAccessor(segment);
        if (
          !directoryAccessor ||
          !jsPropertyAccessorRegex.test(directoryAccessor) ||
          reservedObjectKeys.has(directoryAccessor)
        ) {
          invalidDirectoryAccessorSources.add(currentDirPath);
        } else {
          registerDirectoryAccessor(parentDir, directoryAccessor, currentDirPath);
        }
        parentDir = currentDirPath;
      }

      register(baseNamesByDir, directory, baseName, path);

      const accessor = toJsAccessor(baseName);
      if (!accessor || !jsPropertyAccessorRegex.test(accessor)) {
        invalidAccessorSources.push(`${directory}/${baseName}`.replace("//", "/"));
        continue;
      }
      if (reservedObjectKeys.has(accessor)) {
        invalidAccessorSources.push(`${directory}/${baseName}`.replace("//", "/"));
        continue;
      }
      register(accessorByDir, directory, accessor, path);
    }

    for (const [dir, baseMap] of baseNamesByDir) {
      for (const [base, pathsForBase] of baseMap) {
        if (pathsForBase.length > 1) {
          duplicateBases.push(`${dir}: ${base} → ${pathsForBase.join(", ")}`);
        }
      }
    }

    if (invalidDirectoryAccessorSources.size > 0) {
      return `Directory names generate invalid JS accessors: ${Array.from(invalidDirectoryAccessorSources).join(", ")}`;
    }

    if (duplicateBases.length > 0) {
      return `Duplicate asset file base names detected: ${duplicateBases.join("; ")}`;
    }

    if (directoryAccessorCollisionMessages.size > 0) {
      return `Directory names generate conflicting JS accessors: ${Array.from(directoryAccessorCollisionMessages).join(
        "; "
      )}`;
    }

    if (invalidAccessorSources.length > 0) {
      return `Asset file names generate invalid JS accessors: ${invalidAccessorSources.join(", ")}`;
    }

    for (const [dir, accessorMap] of accessorByDir) {
      for (const [accessor, pathsForAccessor] of accessorMap) {
        if (pathsForAccessor.length > 1) {
          accessorCollisions.push(`${dir}: ${accessor} ← ${pathsForAccessor.join(", ")}`);
        }
      }
    }

    for (const [dir, accessorMap] of accessorByDir) {
      const childDirs = directoryAccessorsByDir.get(dir);
      if (!childDirs) continue;
      for (const [accessor, pathsForAccessor] of accessorMap) {
        const childDirPath = childDirs.get(accessor);
        if (childDirPath) {
          directoryAccessorConflicts.push(
            `${dir}: accessor "${accessor}" conflicts with directory "${childDirPath}" ← ${pathsForAccessor.join(", ")}`
          );
        }
      }
    }

    if (directoryAccessorConflicts.length > 0) {
      return `Asset file accessors conflict with directory names: ${directoryAccessorConflicts.join("; ")}`;
    }

    return (
      accessorCollisions.length === 0 ||
      `Asset file names generate conflicting JS accessors: ${accessorCollisions.join("; ")}`
    );
  })
);

export declare namespace AssetPaths {
  export type Type = typeof AssetPaths.Type;
  export type Encoded = typeof AssetPaths.Encoded;
}
