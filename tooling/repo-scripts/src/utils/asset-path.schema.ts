import {BS} from "@beep/schema";
import * as S from "effect/Schema";
import {toJsAccessor, removeExt} from "@beep/constants/paths/utils/public-paths-to-record";
import * as F from "effect/Function";

const SupportedFileExtensionKit = BS.stringLiteralKit(
  "gif",
  "ico",
  "jpeg",
  "jpg",
  "mkv",
  "mp4",
  "png",
  "avif",
  "svg",
  "webmanifest",
  "webp",
  "tif",
  "tiff",
  "js"
);

export const NextgenConvertableExtensionKit = SupportedFileExtensionKit.derive(
  "jpg",
  "jpeg",
  "png",
  "avif"
);

export class NextgenConvertableExtensions extends F.pipe({
    fields: {mod: S.instanceOf(WebAssembly.Module)},
    members: NextgenConvertableExtensionKit.toTagged("_tag").Members
  }, ({fields, members}) =>
    S.Union(
      S.Struct({...members.jpg.fields, ...fields}),
      S.Struct({...members.jpeg.fields, ...fields}),
      S.Struct({...members.avif.fields, ...fields}),
      S.Struct({...members.png.fields, ...fields})
    )
) {

}

export namespace NextgenConvertableExtensions {
  export type Type = typeof NextgenConvertableExtensions.Type;
  export type Encoded = typeof NextgenConvertableExtensions.Encoded;
}

export const SupportedFileExtensionSet = new Set([
  ...SupportedFileExtensionKit.Options,
]);

const jsIdentifierStartRegex = /^[a-z_$]/;
const jsIdentifierRegex = /^[a-z_$][a-z0-9_$]*$/;
const jsPropertyAccessorRegex = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const kebabCaseFileBaseRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const reservedObjectKeys = new Set(["__proto__", "prototype", "constructor"]);

// Schema enforcing the expected invariants for generated public asset paths.
export const AssetPath = S.String.pipe(
  S.filter((value) => value.startsWith("/") || "Asset path must start with '/'"),
  S.filter((value) => value === value.toLowerCase() || "Asset path must be lower case"),
  S.filter((value) => !value.includes("//") || "Asset path cannot contain consecutive '/' characters"),
  S.filter((value) => {
    const segments = value.slice(1).split("/");
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
      if (!jsIdentifierRegex.test(segment)) {
        return `Directory segment "${segment}" must be a valid JavaScript identifier`;
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
      SupportedFileExtensionKit.is(extension) ||
      `Unsupported asset extension ".${extension}". Supported extensions: ${SupportedFileExtensionKit.Options.join(", ")}`
    );
  })
);

export namespace AssetPath {
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
    const invalidAccessorSources: string[] = [];
    const accessorCollisions: string[] = [];
    const directoryAccessorConflicts: string[] = [];
    const baseNamesByDir = new Map<string, Map<string, string[]>>();
    const accessorByDir = new Map<string, Map<string, string[]>>();
    const directoryChildren = new Map<string, Set<string>>();

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

    const registerDirectoryChild = (parent: string, child: string) => {
      let children = directoryChildren.get(parent);
      if (!children) {
        children = new Set<string>();
        directoryChildren.set(parent, children);
      }
      children.add(child);
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
        registerDirectoryChild(parentDir, segment);
        parentDir = parentDir === "/" ? `/${segment}` : `${parentDir}/${segment}`;
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

    if (duplicateBases.length > 0) {
      return `Duplicate asset file base names detected: ${duplicateBases.join("; ")}`;
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
      const childDirs = directoryChildren.get(dir);
      if (!childDirs) continue;
      for (const [accessor, pathsForAccessor] of accessorMap) {
        if (childDirs.has(accessor)) {
          const dirPath = dir === "/" ? `/${accessor}` : `${dir}/${accessor}`;
          directoryAccessorConflicts.push(`${dir}: accessor "${accessor}" conflicts with directory "${dirPath}" ← ${pathsForAccessor.join(", ")}`);
        }
      }
    }

    if (directoryAccessorConflicts.length > 0) {
      return `Asset file accessors conflict with directory names: ${directoryAccessorConflicts.join("; ")}`;
    }

    return accessorCollisions.length === 0 ||
      `Asset file names generate conflicting JS accessors: ${accessorCollisions.join("; ")}`;
  })
);

export namespace AssetPaths {
  export type Type = typeof AssetPaths.Type;
  export type Encoded = typeof AssetPaths.Encoded;
}