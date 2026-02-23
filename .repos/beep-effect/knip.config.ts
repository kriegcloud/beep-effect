const config = {
  ignore: [
    "**/node_modules/**",
    "**/.turbo/**",
    "**/.next/**",
    "**/.vercel/**",
    "**/.cache/**",
    "**/dist/**",
    "**/build/**",
    "**/coverage/**",
    "**/out/**",
    "**/tmp/**",
    "**/test-results/**",
    "**/routeTree.gen.ts",
    "**/routeTree.gen.tsx",
    "**/*.tsbuildinfo",
    ".repos/**"
  ],
  entry: [
    "tooling/**/*.{ts,tsx,js,jsx,mts,cts}",
    "scripts/**/*.{ts,tsx,js,jsx,mts,cts}",
    "syncpack.config.ts",
    "turbo.json"
  ],
  project: [
    "tooling/**/*.{ts,tsx,js,jsx,mts,cts}",
    "documentation/**/*.{ts,tsx,js,jsx,mts,cts}",
    "test/**/*.{ts,tsx,js,jsx,mts,cts}",
    "src/**/*.{test,spec}.{ts,tsx,js,jsx,mts,cts}",
    "__tests__/**/*.{ts,tsx,js,jsx,mts,cts}"
  ],
  workspaces: {
    "apps/server": {
      entry: ["src/server.ts"],
      project: [
        "src/**/*.{ts,tsx}",
        "test/**/*.{ts,tsx,js,jsx,mts,cts}",
        "src/**/*.{test,spec}.{ts,tsx,js,jsx,mts,cts}",
        "__tests__/**/*.{ts,tsx,js,jsx,mts,cts}"
      ]
    },
    "apps/mcp": {
      entry: ["src/server.ts"],
      project: [
        "src/**/*.{ts,tsx}",
        "test/**/*.{ts,tsx,js,jsx,mts,cts}",
        "src/**/*.{test,spec}.{ts,tsx,js,jsx,mts,cts}",
        "__tests__/**/*.{ts,tsx,js,jsx,mts,cts}"
      ]
    },
    "packages/_internal/*": {
      entry: [
        "src/index.{ts,tsx}",
        "src/server.{ts,tsx}",
        "src/client.{ts,tsx}",
        "src/scripts/**/*.{ts,tsx}"
      ],
      project: [
        "src/**/*.{ts,tsx}",
        "test/**/*.{ts,tsx,js,jsx,mts,cts}",
        "src/**/*.{test,spec}.{ts,tsx,js,jsx,mts,cts}",
        "__tests__/**/*.{ts,tsx,js,jsx,mts,cts}"
      ]
    },
    "packages/*": {
      entry: [
        "src/index.{ts,tsx}",
        "src/server.{ts,tsx}",
        "src/client.{ts,tsx}",
        "src/main.{ts,tsx}",
        "src/cli.{ts,tsx}"
      ],
      project: [
        "src/**/*.{ts,tsx}",
        "test/**/*.{ts,tsx,js,jsx,mts,cts}",
        "src/**/*.{test,spec}.{ts,tsx,js,jsx,mts,cts}",
        "__tests__/**/*.{ts,tsx,js,jsx,mts,cts}"
      ]
    },
    "tooling/*": {
      entry: [
        "src/index.{ts,tsx}",
        "src/cli.{ts,tsx}",
        "src/main.{ts,tsx}",
        "src/bin/**/*.{ts,tsx}"
      ],
      project: [
        "src/**/*.{ts,tsx}",
        "test/**/*.{ts,tsx,js,jsx,mts,cts}",
        "src/**/*.{test,spec}.{ts,tsx,js,jsx,mts,cts}",
        "__tests__/**/*.{ts,tsx,js,jsx,mts,cts}"
      ]
    }
  }
};

export default config;
