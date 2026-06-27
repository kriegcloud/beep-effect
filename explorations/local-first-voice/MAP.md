# Map

<!--
Stage 4. Decomposition into candidate goal packets. This is the graduation
surface: the definition-of-ready in explorations/README.md is checked against
this file. Every major component cites an existing repo capability or is
explicitly marked NET-NEW.
-->

## Candidate Goal Packets

| Slug | Mission | Depends on | Capabilities cited |
| --- | --- | --- | --- |
| `voice-capture-foundation` | Secure-context config (Tauri `localhost` plugin, COOP/COEP headers, CSP `media-src`, macOS Info.plist/entitlement) + `AudioCapture` service + permission/device atoms | none (root) | ✅ `@effect/platform-browser` `Permissions`+`BrowserKeyValueStore`; ✅ `Box.streaming.ts:824–896` (AudioWorklet→Stream); ✅ `Chat.atoms.ts` (atoms/interrupt); ✅ absorb `live-waveform.tsx`; 🆕 thin AudioWorklet processor + Tauri config |
| `voice-inference-worker` | `InferenceWorker`: `BrowserWorker` + `effect/unstable/rpc` streaming contract hosting Transformers.js (Moonshine STT + Silero VAD); OPFS weights; single long-lived worker; `Scope` model teardown | none (∥ root) | ✅ `effect/unstable/rpc` + `BrowserWorker` (`RpcWorker.test.ts` pattern); 🆕 worker host + model lifecycle + OPFS cache |
| `voice-provider-ports` | `Transcriber`/`Synthesizer`/`VoiceSession`/`Vad` interfaces + `PrivilegedAudio` gate + per-capability `Atom.kvs` selection; local adapters (wrap worker) + cloud adapters (wrap existing drivers) | `voice-inference-worker` | ✅ `packages/drivers/{xai,venice-ai}`, `@elevenlabs/client`, `@effect/ai-openai`; ✅ `Atom.kvs`; 🆕 ports + privilege gate |
| `voice-dictation-slice` **(first slice)** | Push-to-talk → Silero VAD → local Moonshine (RPC worker) → transcript atom → chat composer, on `apps/professional-desktop` | `voice-capture-foundation`, `voice-inference-worker`, `voice-provider-ports` (Transcriber only) | ✅ all of the above; ✅ chat composer (`ui-system/editor`); 🆕 hold-to-talk UX wiring |
| `voice-tts-playback` | `AudioPlayback` (ring buffer, barge-in `stop()`, autoplay gesture) + Kokoro local TTS adapter (read replies aloud) | `voice-inference-worker`, `voice-provider-ports` | ✅ Web Audio; ✅ `kokoro-js`; 🆕 ring-buffer playback + Synthesizer adapter |
| `voice-cloud-transport` | `RtcTransport` (`BrowserSocket` WS) + cloud adapters live + audited cloud-escalation gate | `voice-provider-ports` | ✅ `BrowserSocket.layerWebSocket`; ✅ existing drivers; 🆕 transport + escalation audit |
| `voice-to-voice-session` **(headline)** | Full-duplex `VoiceSession` pipeline (capture→VAD→STT→LLM→TTS→playback) + barge-in + client echo cancellation; optional cloud speech-to-speech adapter | `voice-dictation-slice`, `voice-tts-playback`, `voice-cloud-transport` | ✅ all of the above; 🆕 duplex orchestration + echo cancellation |

## Sequencing

`voice-capture-foundation ∥ voice-inference-worker → voice-provider-ports →
voice-dictation-slice (FIRST BET) → {voice-tts-playback, voice-cloud-transport} →
voice-to-voice-session (HEADLINE)`.

- **First bet:** `voice-dictation-slice` — it pulls the thin necessary parts of the
  two root packets plus the `Transcriber` port, proving the entire hard spine
  (secure-context, worker/RPC, Scope teardown, permission/device atoms, Atom.kvs)
  with zero cloud surface.
- **Roots run in parallel:** capture-foundation and inference-worker have no
  interdependency; build both, then the ports layer joins them.
- **Follow-ons:** TTS playback and cloud transport are independent once the ports
  exist; either can go first.
- **Headline last:** voice-to-voice composes everything and adds the genuinely new
  hard problems (duplex timing, barge-in, echo cancellation).

## First Vertical Slice

On `apps/professional-desktop`: the user holds a push-to-talk control and speaks; a
visible recording indicator shows; on release, local Moonshine (in the RPC worker)
transcribes and the text lands in the chat composer — **entirely on-device, no
network**.

**Verify:** (1) mic permission flows through the `Permissions` atom with a WKWebView
fallback probe; (2) `window.isSecureContext === true` under the `localhost` plugin;
(3) releasing the key yields a transcript in <~1s for a short utterance; (4) on
interrupt/unmount, all `MediaStreamTrack`s stop, the `AudioContext` closes, and the
browser recording indicator clears (assert no held mic); (5) no outbound network
request carries audio (privilege check); (6) `@effect/vitest` covers the services
with mocked `MediaDevices` + a stub worker.

## Open Risks Inherited From The Brief

- Secure context on the desktop webview — mitigated by the `localhost` plugin + a
  `window.isSecureContext` capability gate; do not bet on `tauri://`.
- WKWebView: no `permissions.query('microphone')`, unreliable WebGPU, Tauri/macOS
  Whisper window-freeze — feature-detect, WASM-first, keep models small, test on-target.
- COOP/COEP cross-origin isolation must be set in both Tauri config and dev server or
  threaded WASM silently single-threads.
- AudioWorklet realm can't run Effect — keep it a thin frame-poster.
- Interrupt cleanup must route through `Reactivity`/`AtomRegistry`, not `ctx.set`
  (`Chat.atoms.ts:451–531`).
- First-run model download (~50–130MB) needs OPFS + `storage.persist()` + re-download
  fallback and a visible loading state.
