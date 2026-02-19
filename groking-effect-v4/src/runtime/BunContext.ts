import * as BunServices from "@effect/platform-bun/BunServices"

/**
 * Compatibility shim for template-generated examples.
 *
 * `@effect/platform-bun` v4 beta currently exposes `BunServices.layer` rather
 * than a dedicated `BunContext` module. Generated files import
 * `@effect/platform-bun/BunContext` for a stable teaching shape, and this file
 * maps that import to the available layer.
 */
export const layer = BunServices.layer
