import type { StorybookConfig } from "@storybook/react-vite";

const repoRoot = new URL("../../..", import.meta.url).pathname;

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../../../packages/foundation/ui-system/*/stories/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-themes", "@storybook/addon-vitest"],
  staticDirs: [{ from: "../../../node_modules/emojibase-data", to: "/emojibase-data" }],
  viteFinal(config) {
    const dedupe = Array.from(new Set(["react", "react-dom", ...(config.resolve?.dedupe ?? [])]));
    const fsAllow = Array.from(new Set([repoRoot, ...(config.server?.fs?.allow ?? [])]));

    return {
      ...config,
      resolve: {
        ...config.resolve,
        dedupe,
      },
      server: {
        ...config.server,
        fs: {
          ...config.server?.fs,
          allow: fsAllow,
        },
      },
    };
  },
};

export default config;
