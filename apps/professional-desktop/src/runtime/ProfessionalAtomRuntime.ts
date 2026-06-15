/**
 * Professional Desktop browser Atom runtime services.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

"use client";

import { Layer } from "effect";
import { Atom } from "effect/unstable/reactivity";

const professionalAtomRuntimeFactory = Atom.context({
  memoMap: Layer.makeMemoMapUnsafe(),
});

/**
 * Browser runtime mounted by the Professional Desktop Atom provider.
 *
 * @example
 * ```ts
 * import { professionalBrowserRuntime } from "@/runtime/ProfessionalAtomRuntime"
 *
 * console.log(professionalBrowserRuntime)
 * ```
 *
 * @category runtime
 * @since 0.0.0
 */
export const professionalBrowserRuntime = professionalAtomRuntimeFactory(Layer.empty);
