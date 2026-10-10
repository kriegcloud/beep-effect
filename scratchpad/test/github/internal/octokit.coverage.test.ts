import { assert, it } from "@effect/vitest";
import { assertNone } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import { makeTransport } from "../../../effected/github/internal/octokit.ts";
import { RetryPolicy } from "../../../effected/github/Resilience.ts";
import { scriptedFetch } from "../fixtures.ts";

for (const thrown of [null, "offline", { status: 404, message: "missing" }, { response: null }]) {
  it.effect(`classifies a throwable without response headers: ${String(thrown)}`, () => Effect.gen(function* () {
    const script = scriptedFetch([{ status: 200, body: {} }]);
    const transport = yield* makeTransport({ retry: RetryPolicy.none, fetch: script.fetch });
    const error = yield* transport.request("probe", "/probe", { request: { hook: () => Promise.reject(thrown) } }).pipe(Effect.flip);
    assert.strictEqual(error.operation, "probe");
    assert.strictEqual(error.cause, thrown);
    assertNone(yield* transport.rateLimit);
    assert.strictEqual(script.count(), 0);
  }));
}
