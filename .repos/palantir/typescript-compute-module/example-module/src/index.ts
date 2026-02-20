import { ComputeModule, FoundryService } from "@palantir/compute-module";
import { Type } from "@sinclair/typebox";

const computeModule = new ComputeModule({
  logger: console,
  sources: {
    MyApi: {
      credentials: ["TestSecret"],
    },
    YourApi: {}
  },
  definitions: {
    chat: {
      input: Type.Object({
        messages: Type.Array(
          Type.Object({
            role: Type.String(),
            content: Type.String(),
          })
        ),
        temperature: Type.Number(),
        max_tokens: Type.Number(),
      }),
      output: Type.Object({
        messages: Type.Array(Type.String()),
      }),
    },
    getEnv: {
      input: Type.Object({}),
      output: Type.Object({
        SERVICE_HOST: Type.String(),
      }),
    },
    wait: {
      input: Type.Object({
        waitMs: Type.Number(),
        value: Type.Object({}),
      }),
      output: Type.Object({}),
    },
    getCredential: {
      input: Type.Object({
        source: Type.String(),
        key: Type.String(),
      }),
      output: Type.String(),
    },
    testEgress: {
      input: Type.Object({}),
      output: Type.String(),
    },
    openFile: {
      input: Type.Object({
        path: Type.String(),
      }),
      output: Type.String(),
    },
    testOutput: {
      input: Type.Object({}),
      output: Type.String(),
    },
    streamable: {
      input: Type.Object({}),
      output: Type.String(),
    }
  },
});

if (computeModule.environment.type === "pipelines") {
  console.log("Running in pipelines environment");
  console.log(
    "Build token length: ",
    computeModule.environment.buildToken.length
  );
  console.log(
    `Logging "input" and "output"`,
    computeModule.getResource("input"),
    computeModule.getResource("output")
  );
  console.log(
    `Logging credential "TestSecret" on "TestApi"`,
    computeModule.getCredential("MyApi", "TestSecret")
  );
  console.log(
    `Logging streamProxyApi location`,
    computeModule.getServiceApi(FoundryService.STREAM_PROXY)
  );
} else {
  computeModule
    .on("responsive", () => {
      console.log("[Example Module] Responsive");
    })
    .register("wait", async (v) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(v.value);
        }, v.waitMs);
      });
    })
    .register("getEnv", async () => {
      return {
        SERVICE_HOST: process.env.SERVICE_HOST ?? "Not found",
      };
    })
    .register("getCredential", async (v) => {
      return (
        (await computeModule.getCredential(v.source as "YourApi", v.key)) ?? "Not found"
      );
    })
    .register("openFile", async (v) => {
      const fileContents = require("fs").readFileSync(v.path, "utf-8");
      return fileContents;
    }).registerStreaming("streamable", (input, writeable) => {
      let count = 10;
      let interval = setInterval(() => {
        writeable.write("Hello, World!");
        count--;
        if (count === 0) {
          clearInterval(interval);
          writeable.end();
        }
      }, 1000);
    })
    .register("chat", async (v) => {
      return {
        messages: v.messages.map((m) => `${m.role}: ${m.content}`),
      };
    });
}
