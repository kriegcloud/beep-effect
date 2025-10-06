import type { RcFile } from "syncpack";

const config = {
  versionGroups: [
    {
      label: "PNPM Overrides (Pinned)",
      dependencies: ["**"],
      dependencyTypes: ["pnpmOverrides"],
      preferVersion: "highestSemver",
    },
  ],
} satisfies RcFile;
export default config;
