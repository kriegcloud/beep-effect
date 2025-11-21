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
    "**/*.tsbuildinfo"
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
    "apps/web": {
      entry: [
        "src/app/**/page.{ts,tsx,js,jsx}",
        "src/app/**/layout.{ts,tsx,js,jsx}",
        "src/app/**/template.{ts,tsx,js,jsx}",
        "src/app/**/default.{ts,tsx,js,jsx}",
        "src/app/**/error.{ts,tsx,js,jsx}",
        "src/app/**/loading.{ts,tsx,js,jsx}",
        "src/app/**/route.{ts,tsx,js,jsx}",
        "src/app/api/**/route.{ts,tsx,js,jsx}",
        "src/middleware.{ts,tsx,js,jsx}",
        "middleware.{ts,tsx,js,jsx}",
        "next.config.{js,mjs,cjs,ts}",
        "instrumentation.{ts,js}"
      ],
      project: [
        "src/**/*.{ts,tsx,js,jsx}",
        "app/**/*.{ts,tsx,js,jsx}",
        "test/**/*.{ts,tsx,js,jsx,mts,cts}",
        "src/**/*.{test,spec}.{ts,tsx,js,jsx,mts,cts}",
        "__tests__/**/*.{ts,tsx,js,jsx,mts,cts}"
      ]
    },
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
    "apps/start-client": {
      entry: [
        "src/client/main.tsx",
        "src/server/main.ts",
        "src/client/sw.ts",
        "vite.config.ts",
        "vitest.config.ts",
        "pwa-assets.config.ts"
      ],
      project: [
        "src/**/*.{ts,tsx,js,jsx}",
        "index.html",
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
