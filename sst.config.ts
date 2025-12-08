/// <reference path="./.sst/platform/config.d.ts" />

const AWS_REGION = process.env.AWS_REGION ?? process.env.CLOUD_AWS_REGION;
if (!AWS_REGION) throw new Error("AWS_REGION is not set");

export default $config({
  app(input) {
    return {
      name: "beep",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: input?.stage === "production",
      home: "aws",
      providers: {
        aws: {
          profile: input?.stage === "production" ? "todox-prod" : "todox-dev",
          region: AWS_REGION as aws.Region,
          version: "6.83.0",
        },
        random: true,
        tls: true,
      },
      version: ">= 3.0.1",
    };
  },
  async run() {
    const { readdirSync } = await import("node:fs");

    // Set default function configuration
    $transform(sst.aws.Function, (args) => {
      args.architecture ??= "arm64";
      args.runtime ??= "nodejs22.x";
    });

    const outputs: Record<string, unknown> = {};

    // Dynamically load all infrastructure modules
    const dir = readdirSync("./deploy");
    for (const file of dir) {
      if (file === "lib" || file.startsWith(".")) continue;
      if (!file.endsWith(".ts")) continue;

      const infra = await import(`./deploy/${file}`);
      if (infra.outputs) Object.assign(outputs, infra.outputs);
    }

    return outputs;
  },
});
