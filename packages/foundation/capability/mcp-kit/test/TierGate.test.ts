/**
 * Fixture proof: the tier-gate dispatch wrapper refuses fail-closed as a
 * value for an unapproved write-tool call and produces a sanitized audit
 * record matching the kit's audit schema.
 *
 * @since 0.0.0
 */
import { dispatchWithTierGate, fromApprovedToolsPolicy, TierGate, TierGateAuditRecord } from "@beep/mcp-kit";
import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";

const writeTool = Tool.make("delete_document", { success: S.String }).annotate(Tool.Destructive, true);
const readTool = Tool.make("search_documents", { success: S.String }).annotate(Tool.Destructive, false);

describe("dispatchWithTierGate", () => {
  it.effect("refuses fail-closed as a value for an unapproved destructive tool call", () =>
    Effect.gen(function* () {
      const gate = fromApprovedToolsPolicy({ approvedTools: [] });
      const result = yield* dispatchWithTierGate(
        { tool: writeTool, toolCallId: O.some("call-1") },
        Effect.succeed("this handler must never run")
      ).pipe(Effect.provideService(TierGate, TierGate.of(gate)));

      assert.strictEqual(result._tag, "Refused");
      if (result._tag === "Refused") {
        assert.isTrue(S.is(TierGateAuditRecord)(result.audit));
        assert.strictEqual(result.audit.tool, "delete_document");
        assert.isTrue(result.audit.destructive);
        assert.deepStrictEqual(result.audit.toolCallId, O.some("call-1"));
        assert.isString(result.audit.occurredAt);
      }
    })
  );

  it.effect("dispatches an approved destructive tool call and runs the wrapped effect", () =>
    Effect.gen(function* () {
      const gate = fromApprovedToolsPolicy({ approvedTools: ["delete_document"] });
      const result = yield* dispatchWithTierGate(
        { tool: writeTool, toolCallId: O.none() },
        Effect.succeed("deleted")
      ).pipe(Effect.provideService(TierGate, TierGate.of(gate)));

      assert.deepStrictEqual(result, { _tag: "Dispatched", value: "deleted" });
    })
  );

  it.effect("dispatches a read-only tool call without requiring approval", () =>
    Effect.gen(function* () {
      const gate = fromApprovedToolsPolicy({ approvedTools: [] });
      const result = yield* dispatchWithTierGate(
        { tool: readTool, toolCallId: O.none() },
        Effect.succeed("results")
      ).pipe(Effect.provideService(TierGate, TierGate.of(gate)));

      assert.deepStrictEqual(result, { _tag: "Dispatched", value: "results" });
    })
  );
});
