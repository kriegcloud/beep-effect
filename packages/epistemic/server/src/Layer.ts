/**
 * Epistemic server layer.
 *
 * Composes the slice's live service surface: the claim gate (wired over the
 * bounded SHACL engine) and the lifecycle transition. The shared
 * `ShaclValidationService` backend is provided once at the merge boundary so it
 * is built a single time across consumers.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.0.0
 */
import { ClaimGate, makeClaimGate } from "@beep/epistemic-use-cases/ClaimGate";
import { ClaimTransition, makeClaimTransition } from "@beep/epistemic-use-cases/ClaimLifecycle";
import { ShaclValidationServiceLive } from "@beep/semantic-web/adapters/shacl-engine";
import { ShaclValidationService } from "@beep/semantic-web/services/shacl-validation";
import { Effect, Layer } from "effect";

const ClaimGateLayer = Layer.effect(
  ClaimGate,
  Effect.map(ShaclValidationService, (shacl) => ClaimGate.of(makeClaimGate(shacl)))
);

const ClaimTransitionLayer = Layer.succeed(ClaimTransition, ClaimTransition.of(makeClaimTransition()));

/**
 * Live epistemic server layer providing the claim gate and lifecycle transition
 * over the bounded SHACL engine.
 *
 * @example
 * ```ts
 * import { EpistemicServerLive } from "@beep/epistemic-server/layer"
 *
 * console.log(EpistemicServerLive)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const EpistemicServerLive = Layer.mergeAll(ClaimGateLayer, ClaimTransitionLayer).pipe(
  Layer.provide(ShaclValidationServiceLive)
);
