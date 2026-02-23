import {
  DEFAULT_WORKFLOW_RUNTIME_MODE,
  WorkflowRuntimeConfig,
  WorkflowRuntimeConfigLive,
} from "@beep/knowledge-server/Runtime/WorkflowRuntime";
import { describe, effect, strictEqual } from "@beep/testkit";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

describe("WorkflowRuntimeConfig", () => {
  effect(
    "defaults to engine-memory mode",
    Effect.fn(
      function* () {
        const config = yield* WorkflowRuntimeConfig;
        strictEqual(config.mode, DEFAULT_WORKFLOW_RUNTIME_MODE);
        strictEqual(config.mode, "engine-memory");
      },
      Effect.provide(Layer.provide(WorkflowRuntimeConfigLive, Layer.setConfigProvider(ConfigProvider.fromJson({}))))
    )
  );

  effect(
    "coerces legacy mode config to engine-memory",
    Effect.fn(
      function* () {
        const config = yield* WorkflowRuntimeConfig;
        strictEqual(config.mode, "engine-memory");
      },
      Effect.provide(
        Layer.provide(
          WorkflowRuntimeConfigLive,
          Layer.setConfigProvider(
            ConfigProvider.fromJson({
              KNOWLEDGE_WORKFLOW_MODE: "legacy",
            })
          )
        )
      )
    )
  );

  effect(
    "accepts engine-durable-sql mode",
    Effect.fn(
      function* () {
        const config = yield* WorkflowRuntimeConfig;
        strictEqual(config.mode, "engine-durable-sql");
      },
      Effect.provide(
        Layer.provide(
          WorkflowRuntimeConfigLive,
          Layer.setConfigProvider(
            ConfigProvider.fromJson({
              KNOWLEDGE_WORKFLOW_MODE: "engine-durable-sql",
            })
          )
        )
      )
    )
  );
});
