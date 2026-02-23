import type { RcFile } from "syncpack";

const config = {
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
  ],
} satisfies RcFile;
export default config;
