# Assistant-turn finalize bug — root cause + fix (2026-06-14)

The live browser E2E surfaced one bug: a streamed assistant turn rendered
block-by-block but never finalized/persisted, and the client stream hung. This
note records the root cause (proven), the fix, and the regression coverage that
now guards it.

## Root cause (proven by isolated reproduction)

`@beep/md`'s `Pre.language` (the fenced-code-block language hint — the **only**
`S.Option` field in the entire md model) was declared `S.Option(S.String)`. In
this Effect v4 (beta.83), `S.Option(S.String)` behaves like `OptionFromSelf`:
its **encoded** form is a real `Option` instance, not plain JSON.

A real `Option` instance does **not** survive a JSON boundary. Proven directly:

```
DOCUMENT SELF ROUND-TRIP OK            (decode(encode(doc)) in-process)
DOCUMENT JSON ROUND-TRIP FAILED:       (decode(JSON.parse(JSON.stringify(encode(doc)))))
  SchemaError: Expected Option, got {"_id":"Option","_tag":"Some","value":"text"}
    at ["children"][0]["language"]
```

After `JSON.parse(JSON.stringify(...))` the Option degrades to a plain
`{_id,_tag,value}` object that the decoder rejects ("Expected Option"). Two live
boundaries hit this:

1. **jsonb persistence** — `Message.content` is the encoded `Document` written
   to a jsonb column. On read-back (`fromMessageRow` decode) the degraded Option
   failed → the assistant `appendTurn` inside `Stream.onEnd(persist)` **died**.
   Because `S.encodeSync`/decode throw **defects** (not the error channel),
   `Effect.catch` in `persist` did not catch them; the defect escaped through
   `Stream.onEnd`, aborting the stream with no end-frame → the client hung.
2. **rpc/ndjson wire** — `GetTimeline` returns a `Document`; the same degraded
   Option would fail to decode on the client for any thread with a code block.

The fixture kernel **always** emits a fenced code block, so every assistant turn
hit it. The in-process contract/smoke tests never did: they use the in-memory
`ThreadStore` (no jsonb) and `RpcTest` (no JSON wire), so the encode/decode
round-trip through JSON was never exercised.

## Fix

One field, root cause, comprehensive (fixes both boundaries at once). Decision
confirmed with the repo owner before editing the shared foundation schema.

```diff
// packages/foundation/modeling/md/src/Md.model.ts
-  language: S.Option(S.String).annotateKey({ ... }),
+  language: S.OptionFromNullOr(S.String).annotateKey({ ... }),
```

- Type is **unchanged** (`Option<string>`) → zero consumer breakage.
- Encoded form becomes JSON-safe `string | null`, which round-trips cleanly.
- The hand-written recursive `Pre.Encoded` interface was split from `Pre.Type`
  (encoded `language: string | null`).
- No data migration: the old encoded form was never JSON-persistable, so no
  existing jsonb/wire data can be in it.

`OptionFromNullOr` is the repo's conventional JSON-safe Option codec (188 uses).

## Regression coverage (the gap that let it through)

1. **`@beep/md` JSON-boundary tests** (fast, no infra, always run): a concrete
   code-block case plus a `fc.property(DocumentArbitrary, …)` asserting every
   encoded document survives `JSON.parse(JSON.stringify(encode(doc)))`. This
   directly guards the invariant. `@beep/md`: 13 tests pass.
2. **DB-backed chat-persist integration test**
   (`apps/professional-desktop/test/integration/chat-persist.pglite.test.ts`):
   drives `makeChatOperations` over the real Drizzle/PGlite store —
   CreateThread → SendMessage (stream completes with 4 blocks) → GetTimeline
   (assistant turn persisted; the code block's `language` Option survives the
   jsonb round-trip). This exercises the exact path the in-memory tests skipped.

## Verification

- `@beep/md` test: 13 pass (incl. 2 new JSON-boundary tests).
- `check` green across `@beep/md` + consumers (lexical-schema, editor,
  workspace-tables, agents-domain/use-cases/server/client, professional-desktop)
  — 26 packages.
- `test` green: lexical-schema, workspace-tables, agents-domain,
  agents-use-cases, professional-desktop unit (9 incl. chat-contract/chat-ui).
- Integration lane green (3/3): chat-persist, UsageRecordSink, sidecar-smoke.

The fixture-path assistant turn now finalizes, persists, and reads back across a
relaunch.

## Live real-LLM E2E (validated)

Ran the **real Anthropic kernel** (`CHAT_AGENT=anthropic`, key resolved via
`op read` into the sidecar env — never written to disk) against the live bun
sidecar over the actual HTTP/ndjson rpc wire + pglite-socket persistence, driven
by a standalone `RpcClient` (the same transport the client atoms use):

```
e2e: SendMessage (real Anthropic) — streaming...
e2e: block { type: "paragraph" }
e2e: block { type: "code" }
e2e: stream complete { blocks: "2" }
e2e: timeline after reload { turns: "2", roles: "user,assistant" }
e2e: assistant content blocks { tags: "p,pre" }
e2e: PASS — real assistant turn streamed + persisted + read back
```

This proves end-to-end, over the real production path (not in-process):
- the Anthropic forced-tool structured-output kernel streams valid blocks;
- the assistant turn **finalizes and persists** over the live transport (the
  exact bug that previously hung);
- a fresh `GetTimeline` (the relaunch case) **decodes the persisted Document
  over the rpc wire**, including the `pre` code block — the JSON boundary the
  fix addressed.

The full `tauri build` bundle still needs a dev-machine run; the runnable
surface (sidecar + rpc + real LLM + persistence) is validated.
