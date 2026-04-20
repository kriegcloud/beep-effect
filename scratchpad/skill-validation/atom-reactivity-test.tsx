/**
 * Skill validation: atom-reactivity-specialist
 *
 * Proves that the Effect v4 Atom / reactivity APIs referenced in the
 * specialist skill actually type-check in this repo.
 */
import { Context, DateTime, Effect, Layer } from "effect"
import { Atom } from "effect/unstable/reactivity"

// ---------------------------------------------------------------------------
// 1. Atom.make(initialValue) -- basic writable state atom
// ---------------------------------------------------------------------------

const counterAtom: Atom.Writable<number> = Atom.make(0)
void counterAtom

// ---------------------------------------------------------------------------
// 2. Atom.make(effect) -- effect-backed atom (async result)
// ---------------------------------------------------------------------------

const fetchAtom = Atom.make(
  Effect.succeed("hello")
)
void fetchAtom

// ---------------------------------------------------------------------------
// 3. Atom.make(get => value) -- derived / computed atom
// ---------------------------------------------------------------------------

const doubledAtom: Atom.Atom<number> = Atom.make((get) => {
  const count = get(counterAtom)
  return count * 2
})
void doubledAtom

// ---------------------------------------------------------------------------
// 4. Context.Service class + Layer
// ---------------------------------------------------------------------------

class TimeSvc extends Context.Service<TimeSvc, {
  readonly now: Effect.Effect<DateTime.Utc>
}>()("@beep/root/scratchpad/skill-validation/atom-reactivity-test/TimeSvc") {}

const TimeSvcLive = Layer.succeed(TimeSvc, {
  now: DateTime.now,
})

// ---------------------------------------------------------------------------
// 5. Atom.runtime(layer) -- runtime from a Layer
// ---------------------------------------------------------------------------

const appRuntime = Atom.runtime(TimeSvcLive)
void appRuntime

// ---------------------------------------------------------------------------
// 6. runtime.atom(effect) -- service-aware atom
// ---------------------------------------------------------------------------

const timeAtom = appRuntime.atom(
  Effect.gen(function*() {
    const svc = yield* TimeSvc
    return yield* svc.now
  })
)
void timeAtom

// ---------------------------------------------------------------------------
// 7. runtime.fn<Arg>()(effect) -- mutation atom
// ---------------------------------------------------------------------------

const greetFn = appRuntime.fn<string>()(
  (name) =>
    Effect.gen(function*() {
      const svc = yield* TimeSvc
      const now = yield* svc.now
      return `Hello ${name} at ${DateTime.formatIso(now)}`
    })
)
void greetFn
