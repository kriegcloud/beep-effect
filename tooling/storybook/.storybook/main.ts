import type { StorybookConfig } from "@storybook/react-vite";
import { join, dirname } from "node:path";

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, "package.json")));
}

const rootDir = join(__dirname, "../../..");

const config: StorybookConfig = {
  stories: [
    "../../../packages/ui/ui/src/**/*.stories.@(ts|tsx)",
  ],
  addons: [
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-themes"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-interactions"),
    getAbsolutePath("storybook-addon-pseudo-states"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-vite") as "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    config.css = {
      postcss: join(rootDir, "packages/ui/ui/postcss.config.mjs"),
    };

    // Configure esbuild for JSX
    config.esbuild = {
      ...config.esbuild,
      jsx: "automatic",
    };

    // Polyfill Node.js globals for browser
    config.define = {
      ...config.define,
      "global": "globalThis",
    };

    config.optimizeDeps = {
      ...config.optimizeDeps,
      include: [...(config.optimizeDeps?.include || []), "buffer"],
    };

    // Comprehensive alias mapping for monorepo packages
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        // Buffer polyfill for browser
        buffer: "buffer/",
        // UI packages
        "@beep/ui": join(rootDir, "packages/ui/ui/src"),
        "@beep/ui-core": join(rootDir, "packages/ui/core/src"),
        "@beep/ui-editor": join(rootDir, "packages/ui/editor/src"),
        // Common packages
        "@beep/utils": join(rootDir, "packages/common/utils/src"),
        "@beep/schema": join(rootDir, "packages/common/schema/src"),
        "@beep/invariant": join(rootDir, "packages/common/invariant/src"),
        "@beep/constants": join(rootDir, "packages/common/constants/src"),
        "@beep/errors": join(rootDir, "packages/common/errors/src"),
        "@beep/types": join(rootDir, "packages/common/types/src"),
        // Shared packages
        "@beep/shared-domain": join(rootDir, "packages/shared/domain/src"),
        // Identity package with subpath exports
        "@beep/identity/packages": join(rootDir, "packages/common/identity/src/packages.ts"),
        "@beep/identity": join(rootDir, "packages/common/identity/src"),
      },
    };

    // Externalize problematic Node.js dependencies
    config.build = {
      ...config.build,
      rollupOptions: {
        ...config.build?.rollupOptions,
        external: [
          "node:fs/promises",
          "node:fs",
          "node:path",
          "node:crypto",
          "@6over3/zeroperl-ts",
        ],
      },
    };

    return config;
  },
  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
};

export default config;
