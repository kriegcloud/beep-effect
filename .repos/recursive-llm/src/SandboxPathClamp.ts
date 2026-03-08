import * as nodePath from "node:path"

/** Resolve user path relative to sandboxDir, reject escapes. */
export const clampPath = (userPath: string, sandboxDir: string): string => {
  if (nodePath.isAbsolute(userPath)) {
    throw new Error(`Absolute paths not allowed: ${userPath}`)
  }
  const resolved = nodePath.resolve(sandboxDir, userPath)
  const normalized = nodePath.normalize(resolved)
  if (normalized !== sandboxDir && !normalized.startsWith(sandboxDir + nodePath.sep)) {
    throw new Error(`Path escapes sandbox: ${userPath}`)
  }
  return normalized
}

/** Post-read symlink containment check. */
export const checkSymlink = async (
  resolvedPath: string,
  sandboxDir: string,
  realPathFn: (p: string) => Promise<string>
): Promise<void> => {
  const real = await realPathFn(resolvedPath)
  if (real !== sandboxDir && !real.startsWith(sandboxDir + nodePath.sep)) {
    throw new Error(`Symlink escapes sandbox: ${resolvedPath}`)
  }
}
