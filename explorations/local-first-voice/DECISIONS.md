# Decisions

<!--
Stage 2. The grilling log. One entry per resolved branch-closing question,
newest last. Unresolved questions live in ops/manifest.json `openQuestions`
until they land here. Deferred questions get an entry too, marked DEFERRED
with the reason.
-->

## 2026-06-27 — privilege-posture

**Question:** How should audio be allowed to leave the device?

**Answer:** **Hybrid, local-default.** A schema tag `PrivilegedAudio` is
structurally un-routable to any cloud adapter; cloud is opt-in per feature and
audited.

**Rationale:** Recommended over *local-only* (accepts a quality/multilingual
ceiling unnecessarily) and *cloud-allowed* (privilege-waiver risk for an IP firm
under ABA MR 1.6(c); cloud zero-retention is enterprise-only, ElevenLabs has no
carve-out). Hybrid keeps privileged audio on-device while leaving a gated,
audited path for non-privileged or quality-critical work.

## 2026-06-27 — anchor-first-slice

**Question:** What should the first vertical slice nail?

**Answer:** **Dictation-first** — local push-to-talk STT into the chat composer;
voice-to-voice is the headline it builds toward.

**Rationale:** Recommended over *voice-to-voice headline first* (highest
complexity/risk up front), *TTS-first* (doesn't de-risk the capture/permission
spine), and *composable kit with no headline* (slowest visible win). Dictation is
thin and zero-cloud yet exercises every hard primitive (secure-context, AudioWorklet
capture, VAD, RPC worker, Scope teardown, permission/device atoms).

## 2026-06-27 — surface

**Question:** Which surface should the first slice target and validate on?

**Answer:** **Desktop-first** (`apps/professional-desktop`), built into a shared
`@beep/ui-system` package the web inherits.

**Rationale:** Recommended over *web-first* (defers the Tauri-specific unknowns
that are the whole point) and *both at once* (debugging two webview engines + SSR
simultaneously in slice 1). The desktop control plane carries the real risk
(secure-context, mic entitlements); the shared package means web inherits it.

## 2026-06-27 — capture-path

**Question:** Primary microphone capture path?

**Answer:** **Webview Web Audio (AudioWorklet) primary**, behind one `AudioCapture`
Effect interface; **native Rust/cpal fallback** later (Linux/background/system-audio).

**Rationale:** Recommended over *native cpal primary* (dormant plugins → fork cost,
platform-skewed IPC, slower iteration) and *decide-after-a-spike* (defers the call).
Webview gives fast iteration + portability + reuse of `live-waveform.tsx`; the Effect
interface keeps a native swap-in cheap.

## 2026-06-27 — languages

**Question:** Language scope (this picks the local STT/TTS models)?

**Answer:** **English-first** — Moonshine (STT) + Kokoro-82M (TTS). Non-English via
cloud under the privilege gate if a real need appears.

**Rationale:** Recommended over *multilingual-local from the start* (larger downloads,
higher latency) for a US-primary IP practice. The *English-local + multilingual-via-cloud*
option is effectively subsumed: the hybrid gate already permits audited cloud escalation.

## 2026-06-27 — provider-granularity

**Question:** Provider-selection granularity (the "choose the best per feature"
requirement)?

**Answer:** **Per-capability ports** (`Transcriber` / `Synthesizer` / `VoiceSession`
/ `Vad`) with persisted `Atom.kvs` selection; the provider-switching **UI comes later**.

**Rationale:** Recommended over *per-capability + selection UI now* (front-loads UI
before the engine is proven) and *single global provider first* (partial rebuild
later). Ports from day one make mix-and-match (e.g. local Whisper + ElevenLabs TTS +
xAI voice-to-voice) fall out for free; defaults wire now, UI when the kit settles.

## 2026-06-27 — cloud-voice-to-voice

**Question:** Cloud voice-to-voice strategy (for the non-privileged, cloud-eligible
path)?

**Answer:** **STT→LLM→TTS pipeline**; speech-to-speech deferred as an optional
`VoiceSession` adapter behind the same port.

**Rationale:** Recommended over *end-to-end speech-to-speech* (opaque — no transcript
layer for compliance — and cloud-only) and *both pluggable now* (more surface before
value). The pipeline gives observability, text-layer compliance filtering, free LLM
choice, and cost control at +100–400ms; local models are pipeline-only anyway.

## 2026-06-27 — worker-control-plane

**Question:** Inference-worker control plane (driving Transformers.js in the worker)?

**Answer:** **`effect/unstable/rpc` over `BrowserWorker`** — streaming partial
transcripts/TTS frames, AtomRpc bridge, Scope-based model teardown.

**Rationale:** Recommended over *hand-rolled `postMessage`* (rebuild streaming,
backpressure, typed errors, teardown by hand) and *defer/spike* (the streaming-over-worker
path is already confirmed in `RpcWorker.test.ts`). Trade-off accepted: dependency on
the beta.90 `unstable` API surface.

## 2026-06-27 — secondary-defaults

**Question:** Accept the technical secondary defaults?

**Answer:** Accepted (bundled into the approved plan): WebSocket-default transport
(`BrowserSocket`); no in-browser encoding (raw PCM16); WASM-first with WebGPU as
accelerator; single long-lived inference worker; OPFS weights + `storage.persist()` +
re-download fallback; Tauri `localhost` plugin for secure context + COOP/COEP headers;
macOS Info.plist + the single entitlement matching the (later-chosen) ship path.

**Rationale:** Each follows directly from the research (raw PCM16 accepted by all
target STT APIs; WASM-first because WebGPU is non-uniform across Tauri engines; OPFS
fastest for 100s-MB weights). Approved as plan defaults; revisit individually only if
a constraint changes.

## 2026-06-27 (loop) — right-size to professional-desktop usage

**Question:** Is the full 7-packet slice the right first move, or should it be
right-sized to how voice would actually be used in `apps/professional-desktop`?

**Answer:** **Right-size.** An in-repo research loop (5 agents) found professional-desktop
is single-workspace chat only; the highest value × proximity is **voice in the chat
composer**. First bet collapses to a thin composer integration reusing the orphaned
`speech-input`/`live-waveform`/`use-scribe` bricks, not the full ports/worker program.

**Rationale:** User steer ("I don't think this needs a full slice; deep-research the
repo for real usage"). The composer (`apps/professional-desktop/src/chat/ui/Composer.tsx`)
already accepts injected text; voice lands as an alternate input/output stream with no
domain/schema re-architecture. The 7-packet MAP stays as the long-range vision.

## 2026-06-27 (loop) — transcription engine

**Question:** Which transcription engine does the first bet ship on?

**Answer:** **Local Moonshine behind a swappable `Transcriber` seam** — a minimal
single-model worker, not the full `InferenceWorker`/ports/`PrivilegedAudio` stack.

**Rationale:** Recommended over a *cloud/browser throwaway spike* (risks shipping cloud
STT on privileged audio; double integration) and *cloud ElevenLabs as shipped*
(contradicts the local-first posture; no zero-retention carve-out). Privilege-safety is
the spine of the exploration; the seam keeps cloud adapters swappable later.

## 2026-06-27 (loop) — packaging: spike, not graduation

**Question:** How is the first bet packaged?

**Answer:** **Prototype in a spike branch; do NOT graduate a goal packet yet.** Validate
the composer UX (dictation + read-aloud, local engine) before committing to a goal.

**Rationale:** Recommended *standalone thin goal* was overridden in favor of a spike —
the user wants to prove the feel and the hard webview/worker bits (secure context,
COOP/COEP, getUserMedia, local model load) before investing in a graduated goal. The
exploration stays `active` at `shape`; the spike outcome feeds graduation.

## 2026-06-27 (loop) — first features: dictation AND read-aloud

**Question:** Which voice feature ships first?

**Answer:** **Both together** — push-to-talk dictation (Moonshine STT → composer) AND
read-aloud (Kokoro TTS of a turn).

**Rationale:** Recommended *dictation-first* was widened to both. Read-aloud has no
synth path today, so the spike additionally proves local **Kokoro TTS** + Web Audio
playback alongside the STT path. Surface confirmed: the chat composer, **desktop-first**
(Tauri), built into the shared `@beep/editor` so web inherits.
