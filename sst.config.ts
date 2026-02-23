/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "beep-effect2",
      home: "aws",
      removal: input.stage === "production" ? "retain" : "remove",
      protect: input.stage === "production",
      providers: {
        aws: {
          region: "us-east-1",
          // SSO profile for local dev. CI uses OIDC federation (aws-actions/configure-aws-credentials).
          // Dev account (487243850762) for all non-production stages.
          // Prod account (703222328573) for production.
          profile: input.stage === "production" ? "beep-prod" : "beep-dev",
        },
        railway: "0.4.4",
        neon: "0.9.0",
        "@pulumiverse/vercel": "4.6.0",
      },
    };
  },

  async run() {
    // P1: Railway services (FalkorDB, Graphiti MCP, Auth Proxy)
    const railway = await import("./infra/railway");

    // P2: Neon database (secrets module is imported transitively by railway)
    const database = await import("./infra/database");

    // P3: Vercel deployment + env var wiring
    const web = await import("./infra/web");

    return {
      // Railway
      railwayProjectId: railway.railwayProjectId,
      proxyUrl: railway.proxyUrl,

      // Neon
      neonProjectId: database.projectId,
      neonConnectionHost: database.connectionUri,

      // Vercel
      vercelProjectId: web.vercelProjectId,
      vercelProjectUrl: web.vercelProjectUrl,
    };
  },
});
