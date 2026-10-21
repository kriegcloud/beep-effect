import * as V2 from "@beep/acp/schema";
import * as V1 from "@beep/acp/schema-v1";
import { assert, describe, it } from "@effect/vitest";
import * as S from "effect/Schema";

describe("pinned ACP wire schemas", () => {
  it("validates known content variants without accepting malformed ones as future content", () => {
    const accepts = S.is(V2.ContentBlock);
    assert.isTrue(accepts({ type: "text", text: "hello" }));
    assert.isFalse(accepts({ type: "text" }));
    assert.isFalse(accepts({ type: "image", data: "aGVsbG8=" }));
    assert.isTrue(accepts({ type: "future_content", payload: { value: 1 } }));
  });

  it("keeps v1 command inputs compatible with native agents", () => {
    const command = { name: "plan", description: "Make a plan", input: { hint: "Task" } };
    assert.isTrue(S.is(V1.AvailableCommand)(command));
    assert.isTrue(S.is(V2.AvailableCommand)({ ...command, input: { type: "text", hint: "Task" } }));
  });

  it("distributes v1 elicitation modes over request scopes", () => {
    const accepts = S.is(V1.CreateElicitationRequest);
    const requestedSchema = { type: "object", properties: {} };
    assert.isTrue(accepts({ mode: "form", message: "m", requestedSchema, sessionId: "s" }));
    assert.isTrue(accepts({ mode: "form", message: "m", requestedSchema, requestId: 1 }));
    assert.isTrue(accepts({ mode: "url", message: "m", elicitationId: "e", url: "https://x.test", sessionId: "s" }));
    assert.isFalse(accepts({ mode: "form", message: "m", requestedSchema }));
    assert.isFalse(accepts({ mode: "url", message: "m", elicitationId: "e", sessionId: "s" }));
    assert.isTrue(accepts({ mode: "_future", message: "m", sessionId: "s" }));
  });

  it("publishes method tables for both protocol generations", () => {
    assert.strictEqual(V2.PROTOCOL_VERSION, 2);
    assert.strictEqual(V2.V1_PROTOCOL_VERSION, 1);
    assert.strictEqual(V2.AGENT_METHODS.initialize, "initialize");
    assert.strictEqual(V2.V1_AGENT_METHODS.session_load, "session/load");
    assert.strictEqual(V2.V1_CLIENT_METHODS.fs_read_text_file, "fs/read_text_file");
  });
});
