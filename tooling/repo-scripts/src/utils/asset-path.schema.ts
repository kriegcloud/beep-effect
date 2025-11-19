import { removeExt, toJsAccessor } from "@beep/constants/paths/utils/public-paths-to-record";
import { BS } from "@beep/schema";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const SupportedFileExtensionKit = BS.StringLiteralKit(
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

export const NextgenConvertableExtensionKit = SupportedFileExtensionKit.derive("jpg", "jpeg", "png", "webp");

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
