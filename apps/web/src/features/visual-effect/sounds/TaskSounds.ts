import * as Tone from "tone"

// Musical scale configuration
const PENTATONIC_SCALE = ["C", "D", "E", "G", "A"] as const
const BASE_OCTAVE = 3

// Time (in ms) within which multiple notes are considered part of the same
// "chord" and will be voiced as adjacent scale degrees in the *same* octave.
const CHORD_WINDOW_MS = 100

class TaskSoundSystem {
  // Poly synths for overlapping notes
  private synthSuccess: Tone.PolySynth | null = null
  private synthRunning: Tone.PolySynth | null = null
  private synthBass: Tone.PolySynth | null = null
  private interruptSynth: Tone.PolySynth | null = null
  private resetSynth: Tone.PolySynth | null = null
  private synthDeath: Tone.PolySynth | null = null
  private synthRefUpdate: Tone.PolySynth | null = null
  private synthFinalizer: Tone.PolySynth | null = null
  private synthLinkHover: Tone.PolySynth | null = null
  private synthLinkCopied: Tone.PolySynth | null = null
  private synthNotification: Tone.PolySynth | null = null
  private synthConfig: Tone.PolySynth | null = null // configuration change chime

  // FX / routing
  private distortion: Tone.Distortion | null = null
  private reverb: Tone.Reverb | null = null
  private volume: Tone.Volume | null = null

  // Lifecycle / state
  private initialized = false
  private initializing: Promise<void> | null = null
  private muted = false
  private currentNoteIndex = 0
  private transport: ReturnType<typeof Tone.getTransport> | null = null

  // Chord-scheduling helpers
  private chordWindowStart: number | null = null
  private chordStep = 0
  private chordBaseIndex = 0
  private chordBaseOctave = BASE_OCTAVE

  // Error sound management
  private isPlayingFailure = false
  private isPlayingInterrupt = false

  // --- Small helpers -------------------------------------------------------

  /** Returns true if still inside the active chord window. */
  private inChordWindow(now = Date.now()): boolean {
    return this.chordWindowStart !== null && now - this.chordWindowStart <= CHORD_WINDOW_MS
  }

  /** Guard used by most play* methods; ensures audio is ready unless muted. */
  private async ready(): Promise<boolean> {
    if (this.muted) return false
    await this.initialize()
    return true
  }

  /** Schedules a one-off callback on the (started) Transport. */
  private scheduleOnce(cb: () => void, time: string | number) {
    // transport is set in initialize(); a fallback is included for safety.
    const t = this.transport ?? Tone.getTransport()
    t.scheduleOnce(cb, time)
  }

  // --- Initialization ------------------------------------------------------

  private async initialize(): Promise<void> {
    if (this.initialized) return
    if (this.initializing) return this.initializing

    // Kick off initialization once, and always clear the latch.
    this.initializing = (async () => {
      // Ensure audio context is running (await to avoid race with node creation)
      await Tone.start()

      // Create volume control
      this.volume = new Tone.Volume(-12).toDestination()

      // Create effects
      this.reverb = new Tone.Reverb({ decay: 2.5, wet: 0.3 }).connect(this.volume)
      this.distortion = new Tone.Distortion({ distortion: 0.8, wet: 1.0 }).connect(this.volume)

      // --- Synths (unchanged options/voicings) -----------------------------
      this.synthSuccess = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.1, release: 1.2 },
      } as Tone.SynthOptions).connect(this.reverb)

      this.synthRunning = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.002, decay: 0.08, sustain: 0, release: 0.1 },
      } as Tone.SynthOptions).connect(this.reverb)

      this.synthBass = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.02, decay: 0.4, sustain: 0.1, release: 0.8 },
      } as Tone.SynthOptions).connect(this.reverb)

      this.interruptSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.04 },
      } as Tone.SynthOptions).connect(this.reverb)

      this.resetSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.004, decay: 0.18, sustain: 0, release: 0.12 },
      } as Tone.SynthOptions).connect(this.reverb)

      this.synthDeath = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "fatsawtooth10" },
        envelope: { attack: 0.01, decay: 0.5, sustain: 0.3, release: 1.5 },
      } as Tone.SynthOptions).connect(this.distortion)

      this.synthConfig = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
      } as Tone.SynthOptions).connect(this.reverb)

      this.synthRefUpdate = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.04 },
      } as Tone.SynthOptions).connect(this.reverb)

      this.synthFinalizer = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "square4" },
        envelope: { attack: 0.005, decay: 0.12, sustain: 0.05, release: 0.25 },
      } as Tone.SynthOptions).connect(this.reverb)

      this.synthLinkHover = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.02 },
      } as Tone.SynthOptions).connect(this.reverb)

      this.synthLinkCopied = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.002, decay: 0.15, sustain: 0.05, release: 0.3 },
      } as Tone.SynthOptions).connect(this.reverb)

      this.synthNotification = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.005, decay: 0.25, sustain: 0.1, release: 0.4 },
      } as Tone.SynthOptions).connect(this.reverb)

      // Transport: ensure scheduleOnce works reliably
      this.transport = Tone.getTransport()
      if (this.transport.state !== "started") {
        this.transport.start()
      }

      this.initialized = true
    })()

    try {
      await this.initializing
    } finally {
      // Ensure latch is always cleared, even if initialization fails
      this.initializing = null
    }
  }

  // --- Note selection ------------------------------------------------------

  private getNextNote(octaveOffset: number = 0): string {
    const now = Date.now()
    const inChordWindow = this.inChordWindow(now)

    if (!inChordWindow) {
      // Start new chord window
      this.chordWindowStart = now
      this.chordStep = 0
      // Root of the chord based on rotating index
      this.chordBaseIndex = this.currentNoteIndex % PENTATONIC_SCALE.length
      this.chordBaseOctave = BASE_OCTAVE + octaveOffset
    }

    // Adjacent scale degrees within the same octave for tight harmony
    const scaleIndex = (this.chordBaseIndex + this.chordStep) % PENTATONIC_SCALE.length
    const note = PENTATONIC_SCALE[scaleIndex]
    const octave = this.chordBaseOctave

    // Advance counters for next call
    this.chordStep++
    this.currentNoteIndex = (this.currentNoteIndex + 1) % (PENTATONIC_SCALE.length * 2)

    return `${note}${octave}`
  }

  // --- Public API (unchanged behavior) ------------------------------------

  async playSuccess() {
    if (!(await this.ready())) return

    // Triad cycling within a timing window to keep overlaps consonant
    const now = Date.now()
    const inWindow = this.inChordWindow(now)

    if (!inWindow) {
      this.chordWindowStart = now
      this.chordStep = 0
      this.chordBaseIndex = this.currentNoteIndex % PENTATONIC_SCALE.length
      this.chordBaseOctave = BASE_OCTAVE + 1 // brightness
    }

    const rootNoteName = PENTATONIC_SCALE[this.chordBaseIndex]
    const rootNoteStr = `${rootNoteName}${this.chordBaseOctave}`

    const TRIAD_SEMITONES = [0, 4, 7] as const
    const semitoneOffset = TRIAD_SEMITONES[this.chordStep % 3]!

    const note = Tone.Frequency(rootNoteStr).transpose(semitoneOffset).toNote()

    this.chordStep++
    this.currentNoteIndex = (this.currentNoteIndex + 1) % (PENTATONIC_SCALE.length * 2)

    this.synthSuccess?.triggerAttackRelease(note, "4n")
  }

  async playFailure() {
    if (this.muted) return
    if (this.isPlayingFailure) return
    this.isPlayingFailure = true

    await this.initialize()

    // Deep bass tone
    const note = `${PENTATONIC_SCALE[this.currentNoteIndex % PENTATONIC_SCALE.length]}${BASE_OCTAVE - 1}`
    this.currentNoteIndex = (this.currentNoteIndex + 1) % PENTATONIC_SCALE.length

    const now = Tone.now()
    this.synthBass?.triggerAttackRelease(note, "4n", now, 0.65)

    // Reset flag after the sound completes (~0.2 s)
    this.scheduleOnce(() => {
      this.isPlayingFailure = false
    }, "+0.2")
  }

  async playInterrupted() {
    if (this.muted) return
    if (this.isPlayingInterrupt) return
    this.isPlayingInterrupt = true

    await this.initialize()

    // Two rapid ascending beeps (Metal Gear-style alert)
    const note1 = "C5"
    const note2 = "E5"

    const now = Tone.now()
    this.interruptSynth?.triggerAttackRelease(note1, "32n", now, 0.6)
    this.interruptSynth?.triggerAttackRelease(note2, "32n", now + 0.07, 0.6)

    this.scheduleOnce(() => {
      this.isPlayingInterrupt = false
    }, "+0.2")
  }

  async playRunning() {
    if (!(await this.ready())) return
    const note = this.getNextNote(0.5) // half octave higher
    this.synthRunning?.triggerAttackRelease(note, "32n", undefined, 0.25)
  }

  async playReset() {
    if (!(await this.ready())) return

    // Classic two-note descending cue (G → C)
    const note1 = `G${BASE_OCTAVE}`
    const note2 = `C${BASE_OCTAVE}`

    const now = Tone.now()
    this.resetSynth?.triggerAttackRelease(note1, "16n", now, 0.6)
    this.resetSynth?.triggerAttackRelease(note2, "16n", now + 0.1, 0.6)
  }

  async playDeath() {
    if (!(await this.ready())) return

    const now = Tone.now()
    // Short distorted stab
    this.synthDeath?.triggerAttackRelease(`D#${BASE_OCTAVE}`, "32n", now, 0.45)
    // Long, low distorted rumble to finish (100 ms later)
    this.synthDeath?.triggerAttackRelease(`C${BASE_OCTAVE - 2}`, "1n", now + 0.1, 0.55)
  }

  /** Pleasant two-note ascending chime when users change configuration. */
  async playConfigurationChange() {
    if (!(await this.ready())) return
    this.synthConfig?.triggerAttackRelease("G5", "16n", undefined, 0.6)
  }

  /** Subtle one-note blip when VisualRef values update. */
  async playRefUpdate() {
    if (!(await this.ready())) return
    this.synthRefUpdate?.triggerAttackRelease("E6", "64n", undefined, 0.35)
  }

  /** Soft registration sound when a finalizer is created. */
  async playFinalizerCreated() {
    if (!(await this.ready())) return
    const note = this.getNextNote(0) // Base octave
    this.synthFinalizer?.triggerAttackRelease(note, "32n", undefined, 0.25)
  }

  /** Mid-range sound when a finalizer starts running. */
  async playFinalizerRunning() {
    if (!(await this.ready())) return
    const note = this.getNextNote(0.5) // Half octave up
    this.synthFinalizer?.triggerAttackRelease(note, "16n", undefined, 0.3)
  }

  /** Higher sound when a finalizer completes. */
  async playFinalizerCompleted() {
    if (!(await this.ready())) return
    const note = this.getNextNote(1) // One octave up
    this.synthFinalizer?.triggerAttackRelease(note, "8n", undefined, 0.35)
  }

  /** Ultra-subtle sound when hovering over link option. */
  async playLinkHover() {
    if (!(await this.ready())) return
    this.synthLinkHover?.triggerAttackRelease("G6", "64n", undefined, 0.2)
  }

  /** Pleasant chime when link is successfully copied. */
  async playLinkCopied() {
    if (!(await this.ready())) return

    const note1 = "E5"
    const note2 = "G5"

    const now = Tone.now()
    this.synthLinkCopied?.triggerAttackRelease(note1, "16n", now, 0.5)
    this.synthLinkCopied?.triggerAttackRelease(note2, "16n", now + 0.08, 0.5)
  }

  /** Gentle chime when a notification appears. */
  async playNotificationChime() {
    if (!(await this.ready())) return

    const note1 = "C5"
    const note2 = "E5"

    const now = Tone.now()
    this.synthNotification?.triggerAttackRelease(note1, "16n", now, 0.4)
    this.synthNotification?.triggerAttackRelease(note2, "16n", now + 0.12, 0.4)
  }

  setMuted(muted: boolean) {
    this.muted = muted
  }

  setVolume(volume: number) {
    if (!this.volume) return
    // Map 0..1 to -Infinity..0 dB (0 => hard mute)
    const db = volume === 0 ? -Infinity : -40 + volume * 40
    this.volume.volume.value = db
  }

  async dispose() {
    // Dispose & null all nodes; keep flags and counters unchanged.
    this.synthSuccess?.dispose()
    this.synthSuccess = null
    this.synthRunning?.dispose()
    this.synthRunning = null
    this.synthBass?.dispose()
    this.synthBass = null
    this.interruptSynth?.dispose()
    this.interruptSynth = null
    this.resetSynth?.dispose()
    this.resetSynth = null
    this.synthDeath?.dispose()
    this.synthDeath = null
    this.synthFinalizer?.dispose()
    this.synthFinalizer = null
    this.synthLinkHover?.dispose()
    this.synthLinkHover = null
    this.synthLinkCopied?.dispose()
    this.synthLinkCopied = null
    this.synthNotification?.dispose()
    this.synthNotification = null
    this.synthConfig?.dispose()
    this.synthConfig = null
    this.synthRefUpdate?.dispose()
    this.synthRefUpdate = null

    this.distortion?.dispose()
    this.distortion = null
    this.reverb?.dispose()
    this.reverb = null
    this.volume?.dispose()
    this.volume = null

    this.initialized = false
    // keep this.transport as-is; it’s owned by Tone.js and reused globally
  }
}

// Singleton instance
export const taskSounds = new TaskSoundSystem()
