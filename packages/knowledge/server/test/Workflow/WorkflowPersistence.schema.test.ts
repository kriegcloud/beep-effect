import {
  decodeWorkflowExecutionRecord,
  WorkflowExecutionRecord,
} from "@beep/knowledge-server/Workflow/WorkflowPersistence";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

describe("WorkflowPersistence schema boundary", () => {
  effect(
    "decodeWorkflowExecutionRecord defaults retryCount and produces a schema class instance",
    Effect.fn(function* () {
      const raw = {
        id: KnowledgeEntityIds.WorkflowExecutionId.create(),
        organizationId: "org-1",
        workflowType: "extraction",
        status: "pending",
        input: null,
        output: null,
        error: null,
        startedAt: null,
        completedAt: null,
        lastActivityName: null,
        // retryCount intentionally omitted: boundary decode should default to 0
      };

      const decoded = yield* decodeWorkflowExecutionRecord(raw);
      assertTrue(decoded instanceof WorkflowExecutionRecord);
      strictEqual(decoded.retryCount, 0);
    }, Effect.provide(Layer.empty))
  );
});
