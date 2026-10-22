/**
 * Side-effect module that installs the DuckDB native addon resolver.
 *
 * **Details**
 *
 * Import it first in a host entrypoint: module evaluation follows import
 * order, and `@duckdb/node-bindings` loads its addon while it is evaluated,
 * so the resolver must already be in place.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { installNativeAddonResolver } from "./NativeAddon.ts";

installNativeAddonResolver();
