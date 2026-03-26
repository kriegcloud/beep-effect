import type {} from "./sst-platform-config";

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
      },
    };
  },

  async run() {},
});
