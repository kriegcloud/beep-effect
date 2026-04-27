import type { RcFile } from "syncpack";

const config = {
  source: [
    "package.json",
    ".claude/package.json",
    ".codex/package.json",
    "infra/package.json",
    "packages/_internal/*/package.json",
    "packages/common/*/package.json",
    "packages/fixture-lab/specimen/*/package.json",
    "packages/shared/client/package.json",
    "packages/shared/domain/package.json",
    "packages/shared/server/package.json",
    "packages/shared/tables/package.json",
    "packages/shared/ui/package.json",
    "tooling/cli/package.json",
    "tooling/configs/package.json",
    "tooling/repo-checks/package.json",
    "tooling/repo-utils/package.json",
    "tooling/test-utils/package.json",
    "tooling/docgen/package.json",
    "apps/codedank-web/package.json",
    "packages/shared/use-cases/package.json",
    "packages/shared/config/package.json",
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
