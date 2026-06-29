# Brief

<!--
Stage 3. The shaped pitch (Shape Up anatomy). Fat-marker fidelity: concrete
enough to evaluate and decompose, rough enough to leave design latitude to
the implementing goal packets. The exploration is shaped when the human says
this file matches the picture in their head.
-->

## Problem

The professional-desktop control plane has no voice. We want to talk to the agent
— dictate into the composer, have replies read aloud, and eventually hold a
voice-to-voice conversation — but the firm handles **privileged client audio**, so
the naive "pipe the mic to a cloud realtime API" answer is a privilege-waiver hazard
(ABA MR 1.6(c); cloud zero-retention is enterprise-only, ElevenLabs has none).

The repo already has the scattered pieces — a Tauri v2 shell, a Web-Audio waveform
capture component, an ElevenLabs Scribe STT hook, xAI/Venice/OpenAI voice drivers,
and (the user's correct hunch) `@effect/platform-browser` primitives (`Permissions`,
`BrowserKeyValueStore`, `BrowserSocket`, `BrowserWorker`). What's missing is the
**Effect-first spine** that turns them into one capability: a permission-gated,
Scope-safe capture service; an on-device inference worker; and a provider port that
lets us **choose the best model/service per voice feature** and keep privileged
audio on the box. Now, because mid-2026 closed three gaps at once — on-device model
quality (Moonshine/Kokoro), WASM/WebGPU ubiquity, and a clean Effect RPC-over-worker
path — local-first voice is finally buildable without a quality cliff.

## Appetite

**Big batch, but sliced.** The whole vision (dictation + TTS + voice-to-voice +
cloud adapters + selection UI) is multi-cycle. The **shaped bet is the first
vertical slice only**: local, English, desktop **dictation** — roughly a
two-to-three-week budget. That budget is the constraint: if the secure-context /
worker-RPC / permission-atom spine can't be proven inside it, we re-shape rather
than expand scope. Everything past dictation is named in the MAP as follow-on bets,
not part of this appetite.

## Solution Sketch

**Posture:** local-first, privilege-safe, pipeline, desktop-first.

```
 mic ─▶ AudioCapture ─▶ Silero VAD ─▶ Transcriber port ─▶ transcript atom ─▶ composer
        (AudioWorklet,   (worker)      │                    (Atom.kvs)
         Permissions,                  ├─ LocalMoonshine  ← InferenceWorker (effect/unstable/rpc
         Scope teardown)               │   (default)         over BrowserWorker, streaming)
                                       └─ cloud adapters  ← RtcTransport (BrowserSocket WS)
                                          [gated: PrivilegedAudio never routes here]
```

The Effect spine (each `extends Context.Service`, exports a `layer`):
- **`AudioCapture`** — `Permissions.query` + `getUserMedia` + AudioWorklet→`Stream`
  (the `Box.streaming.ts:824–896` pattern), all under `Effect.acquireRelease`/`Scope`
  so tracks stop and the `AudioContext` closes on interrupt.
- **`InferenceWorker`** — a single long-lived `BrowserWorker` running Transformers.js
  (Moonshine STT + Silero VAD), driven by an `effect/unstable/rpc` streaming contract;
  weights in OPFS; model destroyed via `Scope.addFinalizer`.
- **Provider ports** — `Transcriber` / `Synthesizer` / `VoiceSession` / `Vad`, each a
  small typed contract with local + cloud `Layer` adapters and a persisted per-capability
  selection atom. `PrivilegedAudio` is a schema tag that is structurally un-routable to
  any cloud adapter.
- **Atoms** — `audioPermissionAtom` (Atom.kvs, subscribes `PermissionStatus.onchange`,
  WKWebView/iOS fallback to a `getUserMedia` probe), `deviceListAtom` (refetch on
  `devicechange`), `selectedDeviceAtom`, `providerSelectionAtom`.

**First slice (what ships):** on `apps/professional-desktop`, hold-to-talk → local
Moonshine transcription → text lands in the chat composer. No network, no cloud, full
teardown, visible recording state.

## Rabbit Holes

- **Secure context on the desktop webview.** `tauri://` is not guaranteed secure;
  patch with the Tauri `localhost` plugin (127.0.0.1) + a `window.isSecureContext`
  capability check. Don't bet on `tauri://`.
- **WKWebView quirks.** No `permissions.query('microphone')` → feature-detect + probe;
  unreliable WebGPU → WASM-first; a known Whisper window-freeze on Tauri/macOS → keep
  models small and test on-target. (macOS is the slice target, so this is front-loaded.)
- **AudioWorklet realm.** Effect can't run in the worklet; keep it a thin frame-poster
  and do all Effect work in the main thread / worker. Resampling 48k→16k and Float32→PCM16
  rounding live just outside the worklet.
- **COOP/COEP.** Threaded WASM needs cross-origin isolation set in *both* Tauri config
  and dev server; forget the dev server and it silently single-threads.
- **Interrupt cleanup.** Reuse the `Chat.atoms.ts:451–531` lesson — route cancel cleanup
  through `Reactivity`/`AtomRegistry`, not `ctx.set`.
- **Model download UX.** First-run pulls ~50–130MB; OPFS + `storage.persist()` + a
  re-download path, with a visible loading state.

## No-Gos

- **No cloud path for privileged audio** — structurally prevented, not just policy.
- **Not voice-to-voice in slice 1** — headline, not first bet.
- **No native Rust/cpal capture in slice 1** — webview-only first; cpal is a later
  fallback behind the same interface.
- **No provider-switching UI in slice 1** — ports + persisted selection only; defaults wired.
- **No multilingual local models initially** — English-first; non-English is gated cloud.
- **No in-browser audio encoding** — raw PCM16 end to end.
- **No speech-to-speech / WebRTC transport yet** — pipeline + WebSocket only.
