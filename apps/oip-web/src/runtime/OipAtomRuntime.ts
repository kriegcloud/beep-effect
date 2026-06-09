/**
 * OIP browser Atom runtime.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

"use client";

import * as BrowserHttpClient from "@effect/platform-browser/BrowserHttpClient";
import * as BrowserKeyValueStore from "@effect/platform-browser/BrowserKeyValueStore";
import { Layer } from "effect";
import { Atom } from "effect/unstable/reactivity";

/**
 * Runtime factory shared by OIP browser atoms.
 *
 * @example
 * ```ts
 * import { oipAtomRuntimeFactory } from "@beep/oip-web/runtime/OipAtomRuntime"
 *
 * console.log(oipAtomRuntimeFactory.memoMap)
 * ```
 *
 * @category runtime
 * @since 0.0.0
 */
export const oipAtomRuntimeFactory = Atom.context({
  memoMap: Layer.makeMemoMapUnsafe(),
});

/**
 * Browser services available to OIP Atom workflows.
 *
 * @example
 * ```ts
 * import { oipBrowserLayer } from "@beep/oip-web/runtime/OipAtomRuntime"
 *
 * console.log(oipBrowserLayer)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const oipBrowserLayer = Layer.mergeAll(BrowserHttpClient.layerFetch, BrowserKeyValueStore.layerLocalStorage);

/**
 * Browser runtime mounted by the OIP app provider.
 *
 * @example
 * ```ts
 * import { oipBrowserRuntime } from "@beep/oip-web/runtime/OipAtomRuntime"
 *
 * console.log(oipBrowserRuntime)
 * ```
 *
 * @category runtime
 * @since 0.0.0
 */
export const oipBrowserRuntime = oipAtomRuntimeFactory(oipBrowserLayer);
