import type { RcFile } from "syncpack";

const config = {
  source: [
    "package.json",
    ".claude/package.json",
    ".codex/package.json",
    "apps/*/package.json",
    "scratchpad/package.json",
    "packages/_internal/*/package.json",
    "packages/ai/*/package.json",
    "packages/common/*/package.json",
    "packages/repo-memory/client/package.json",
    "packages/repo-memory/model/package.json",
    "packages/repo-memory/runtime/package.json",
    "packages/repo-memory/sqlite/package.json",
    "packages/repo-memory/store/package.json",
    "packages/runtime/*/package.json",
    "packages/shared/*/package.json",
    "tooling/cli/package.json",
    "tooling/configs/package.json",
    "packages/editor/package.json",
    "tooling/repo-utils/package.json",
    "tooling/test-utils/package.json",
    "tooling/docgen/docgen/package.json",
  ],
  customTypes: {
    catalog: {
      path: "catalog",
      strategy: "versionsByName",
    },
  },
  versionGroups: [
    {
      label: "Catalog (Pinned)",
      dependencies: ["**"],
      dependencyTypes: ["catalog"],
      preferVersion: "highestSemver",
    },
    {
      label: "Workspace packages use workspace: protocol",
      dependencies: ["@beep/**"],
      packages: ["**"],
      dependencyTypes: ["dev", "prod"],
      pinVersion: "workspace:^",
    },
    {
      label: "Peer dependencies allow broader ranges",
      dependencies: ["**"],
      dependencyTypes: ["peer"],
      isIgnored: true,
    },
    {
      label: "Root devDependencies (third-party) should use catalog references",
      dependencies: ["!@beep/**"],
      packages: ["@beep/root"],
      dependencyTypes: ["dev"],
      pinVersion: "catalog:",
    },
  ],
} satisfies RcFile;
export default config;
