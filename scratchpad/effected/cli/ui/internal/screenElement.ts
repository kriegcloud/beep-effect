import * as Effect from "effect/Effect";
import type { ReactElement } from "react";

/**
 * What a screen returned, as the effect of its element: the element itself, or the effect a lazy screen builds it with.
 *
 * **Details**
 *
 * Callers build the result with `Effect.sync(() => screen(control))`, so a screen that throws is a defect of the run,
 * as a lazy screen whose import fails is.
 *
 * **Example** (Read a plain screen's element)
 *
 * ```ts
 * import { screenElement } from "@beep/scratchpad/effected/cli/ui/internal/screenElement"
 * import * as Effect from "effect/Effect"
 * import { createElement } from "react"
 * const element = Effect.runSync(screenElement(createElement("ink-text", null, "ready")))
 * console.log(element.type) // ink-text
 * ```
 *
 * @internal
 * @category combinators
 * @since 0.0.0
 */
export const screenElement = (made: ReactElement | Effect.Effect<ReactElement>): Effect.Effect<ReactElement> =>
	Effect.isEffect(made) ? made : Effect.succeed(made);
