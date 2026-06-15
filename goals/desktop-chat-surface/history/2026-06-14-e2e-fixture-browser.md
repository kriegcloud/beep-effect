# E2E — keyless fixture-mode browser run (2026-06-14)

Ran the real desktop chat surface in a browser, keyless, against the live bun
sidecar in `CHAT_AGENT=fixture` mode — no Anthropic key, no Tauri shell (vite
dev webview + the sidecar, which is the dev flow the atoms target via the
`/rpc` vite proxy).

## Setup (all started + healthy in this environment)
- Sidecar: `CHAT_AGENT=fixture CHAT_DB_PATH=/tmp/chat-e2e-db bun run server/main.ts`
  → `Listening on http://localhost:3939`, `pglite socket server started`,
  `chat sidecar migrations applied`.
- Vite: `bun run dev` → `http://127.0.0.1:1421/` (proxies `/rpc` → :3939).
- Driven via Chrome (claude-in-chrome).

## What works (demonstrated live, screenshots captured)
- ✅ **App loads + renders** — header "Professional Desktop — Chat", sidebar,
  empty-state "No thread selected". The previously-unrun seam (vite bundle of the
  `@beep/agents-client` atoms + `@beep/editor` + the schemas, and the
  atom↔sidecar wiring) works with **zero console errors**.
- ✅ **Create thread** → sidebar shows "New thread / Dec 31"; the composer
  appears; `CreateThread` rpc returned 200; the thread **survives reload**
  (rendered from PGlite).
- ✅ **Send message** → the user message persists (the user bubble + an Edit
  button render after reload, from PGlite).
- ✅ **Streamed assistant turn renders block-by-block as structured rich text** —
  the fixture's exact deterministic sequence rendered live: a **heading** "Echo",
  a **paragraph** "You said: Hello from the end-to-end test", a **bullet list**
  ("Received your message", "Echoing it back"), and a **code block** — plus the
  in-flight **Stop** (cancel) control. This is the SPEC headline criterion,
  visually demonstrated.
- ✅ Sidecar rpc lane healthy: all real rpc POSTs returned 200 (ListThreads,
  CreateThread, SendMessage stream, GetTimeline).

## The one bug the live E2E surfaced
- ❌ **The streamed assistant turn does not finalize/persist in the live HTTP
  transport.** Console shows `assistant turn started` but never `assistant turn
  complete`; the client's `Stream.runForEach` (inside `runTurnAtom`) hangs after
  the blocks arrive (the stream-end signal isn't received), so `Stop` lingers and
  the assistant turn is **absent after reload** (only the user turn persists).
- **Root-cause hypothesis (well-evidenced):** the server-side
  `Stream.onEnd(persist)` in `ChatOrchestrator` — which `appendTurn`s the
  assistant turn via PGlite over `pglite-socket` — does not complete/close the
  streaming response in the live HTTP + ndjson transport, so neither the server
  persist nor the client finalize fires. This is a PGlite-socket × streaming-rpc ×
  onEnd-persist integration seam that the in-process contract test does NOT
  exercise (it uses the in-memory `ThreadStore` + `RpcTest.makeClient`, which
  propagate stream completion differently than the HTTP/ndjson `RpcClient`).
- **Why the contract test still passed:** the orchestration LOGIC (persist on
  `onEnd` only, cancel→no-persist) is correct and unit-proven; the gap is purely
  in the live streaming-transport finalize path.
- **Fix direction (next session, not blind-fixed here per no-rabbit-hole):**
  ensure the finalize-persist completes and closes the stream in the live
  transport — e.g. run the `onEnd` assistant-persist on a separate PGlite
  connection (avoid contending with the open streaming response), or move the
  finalize off the streaming response (persist in a follow-up step the client
  awaits), then re-run this keyless browser E2E to confirm assistant-turn
  persistence + that `Stop` clears on normal completion. Add a live
  streaming-transport integration test (HTTP `RpcClient` + drizzle `ThreadStore`)
  to cover the seam the in-process contract test misses.

## Net
The full UI + streaming-render + create/user-persistence flow is demonstrated
working end-to-end, keylessly, in a real browser. One specific, well-localized
integration bug (assistant-turn finalize in the live PGlite-socket + streaming
transport) remains, with a clear fix direction. The real-LLM path additionally
needs an Anthropic key; the full `tauri build` bundle needs a dev-machine run.
