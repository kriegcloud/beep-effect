import * as pulumi from "@pulumi/pulumi";
import { V2TWorkstation } from "../../src/V2T.ts";

const commandResources = [];

await pulumi.runtime.setMocks(
  {
    call: (args) => args.inputs,
    newResource: (args) => {
      if (args.type === "command:local:Command") {
        commandResources.push({
          environment:
            typeof args.inputs.environment === "object" && args.inputs.environment !== null
              ? args.inputs.environment
              : {},
          name: args.name,
          triggersLength: Array.isArray(args.inputs.triggers) ? args.inputs.triggers.length : 0,
        });
      }

      return {
        id: `${args.name}-id`,
        state: {
          ...args.inputs,
          stderr: "",
          stdout: args.name.endsWith("-app") ? "fixture-package\n" : "",
        },
      };
    },
  },
  "infra-unit",
  "dev"
);

const workstation = new V2TWorkstation("fixture", {
  config: {
    repoRoot: "/repo/beep-effect",
    targetHomeDir: "/home/tester",
    targetUser: "tester",
  },
  graphitiOpenAiApiKey: "secret-ref",
});

const resolveOutput = (output) =>
  new Promise((resolve) => {
    output.apply((value) => {
      resolve(value);
      return value;
    });
  });

const [installedPackageName, graphitiStateDir, qwenStateDir] = await Promise.all([
  resolveOutput(workstation.installedPackageName),
  resolveOutput(workstation.graphitiStateDir),
  resolveOutput(workstation.qwenStateDir),
]);

console.log(
  JSON.stringify({
    commandResources,
    outputs: {
      graphitiStateDir,
      installedPackageName,
      qwenStateDir,
    },
  })
);
