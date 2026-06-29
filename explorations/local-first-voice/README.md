# Local-First Voice & Microphone Capability

## Status

Stage: `shape`
Status: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Spark

A Tauri desktop app that can hear and speak — dictation, TTS, and voice-to-voice
— for privileged legal work, hand-rolled "dev-safe" on `@effect/platform-browser`
primitives with per-feature choice of local (Transformers.js) vs cloud models.

## Next Open Question

Right-sizing the first bet to actual `professional-desktop` usage (a
research→align loop, 2026-06-27). The bet is now **push-to-talk dictation into the
existing chat composer**, not the full 7-packet slice. The load-bearing open fork:
**which transcription engine** does the first bet ship on — local Moonshine
(privilege-safe, pulls a minimal worker) vs a cloud/browser STT spike behind a
swappable seam (thin, non-privileged dev only)? Plus packaging (standalone thin
goal vs the named `voice-dictation-slice`). Resolve, then reshape BRIEF/MAP.

## Read This First

1. [`ops/manifest.json`](./ops/manifest.json) - machine state: stage, status, open questions.
2. [`CAPTURE.md`](./CAPTURE.md) - raw dump (stage 0).
3. [`RESEARCH.md`](./RESEARCH.md) - prior art + capability inventory (stage 1).
4. [`DECISIONS.md`](./DECISIONS.md) - grilling log (stage 2) — 9 resolved forks.
5. [`BRIEF.md`](./BRIEF.md) - shaped pitch (stage 3) — **awaiting user sign-off**.
6. [`MAP.md`](./MAP.md) - decomposition (stage 4 sketch) — 7 candidate goals, first slice named.

## Trail

<Dated one-liners, newest first: what each session did and where it stopped.>

- 2026-06-27 (loop): research→align loop on user steer ("not a full slice; deep-research
  the repo for real usage"). In-repo sweep of `apps/professional-desktop` (5 agents)
  appended a usage-grounding section to RESEARCH. Bet right-sized to push-to-talk
  dictation into the existing composer (~80% existing parts). Stopped to grill the
  engine fork + packaging before reshaping BRIEF/MAP.
- 2026-06-27: packet opened and driven research → align → shape in one session.
  Two adversarial deep-research sweeps (Tauri/cloud/permissions + local-models/
  workers/WebGPU/RPC) populated RESEARCH; 9 forks resolved in DECISIONS via
  multiple-choice grilling (all on recommendations); BRIEF + MAP drafted. Stopped at
  the shape exit gate awaiting BRIEF sign-off before graduating `voice-dictation-slice`.
