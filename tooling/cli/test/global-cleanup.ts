import fs from "node:fs/promises";
import path from "node:path";

const CONFIG_FILES = ["tsconfig.packages.json", "tsconfig.json", "tstyche.config.json"] as const;
const CLEANUP_PARENT_DIRS = ["", "tooling", "packages/common", "packages/shared", "apps", "docs"] as const;
const TEST_ARTIFACT_PREFIX = "_test-";

const readFileIfExists = async (filePath: string): Promise<string | undefined> => {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return undefined;
  }
};

const removeTestArtifacts = async (parentDir: string): Promise<void> => {
  let entries: ReadonlyArray<{ readonly name: string }>;
  try {
    entries = await fs.readdir(parentDir, { withFileTypes: true });
  } catch {
    return;
  }

  const removals = entries
    .filter((entry) => entry.name.startsWith(TEST_ARTIFACT_PREFIX))
    .map((entry) => fs.rm(path.join(parentDir, entry.name), { recursive: true, force: true }));

  await Promise.all(removals);
};

const restoreConfigSnapshots = async (repoRoot: string, snapshots: ReadonlyMap<string, string>): Promise<void> => {
  const writes = Array.from(snapshots.entries()).map(([relativePath, content]) =>
    fs.writeFile(path.join(repoRoot, relativePath), content, "utf8")
  );
  await Promise.all(writes);
};

export default async function globalCleanupSetup() {
  const repoRoot = path.resolve(__dirname, "../../..");
  const configSnapshots = new Map<string, string>();

  for (const relativePath of CONFIG_FILES) {
    const content = await readFileIfExists(path.join(repoRoot, relativePath));
    if (content !== undefined) {
      configSnapshots.set(relativePath, content);
    }
  }

  return async () => {
    for (const relativeParentDir of CLEANUP_PARENT_DIRS) {
      await removeTestArtifacts(path.join(repoRoot, relativeParentDir));
    }
    await restoreConfigSnapshots(repoRoot, configSnapshots);
  };
}
