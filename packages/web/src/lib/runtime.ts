/**
 * Atom Runtime
 *
 * Creates an Atom runtime with ApiClient services.
 * All atoms that need HTTP use this runtime.
 *
 * @since 2.0.0
 * @module lib/runtime
 */

import { Atom } from "@effect-atom/atom"
import { ApiLayer } from "../services/ApiClient"

// Runtime with API services - all Atoms that need HttpClient use this
export const apiRuntime = Atom.runtime(ApiLayer)
