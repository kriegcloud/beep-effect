import type { RcFile } from "syncpack";

const config = {
  source: [
    "package.json",
    ".claude/package.json",
    "apps/*/package.json",
    "packages/_internal/*/package.json",
    "packages/ai/*/package.json",
    "packages/common/*/package.json",
    "packages/repo-memory/*/package.json",
    "packages/runtime/*/package.json",
    "packages/shared/*/package.json",
    "tooling/*/package.json",
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
