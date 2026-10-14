/**
 * Desktop sidecar transport probe schema.
 *
 * @packageDocumentation
 * @category protocols
 * @since 0.0.0
 */
import { $ProfessionalDesktopId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const $I = $ProfessionalDesktopId.create("transport/SidecarTransport");

/**
 * Transport probe result returned by the desktop sidecar.
 *
 * **Example** (Create transport instance)
 *
 * ```ts
 * import { SidecarTransport } from "@/transport/SidecarTransport"
 *
 * const transport = SidecarTransport.make({ ipc: false })
 * console.log(transport.ipc) // false
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SidecarTransport extends S.Opaque<SidecarTransport, { readonly brand: unique symbol }>()(
  S.Struct({
    ipc: S.Boolean,
    rpcSessionToken: S.OptionFromOptionalKey(S.NonEmptyString).pipe(S.withConstructorDefault(Effect.succeedNone)),
  }).pipe(
    $I.annoteSchema("SidecarTransport", {
      description: "The transport used to communicate with the sidecar.",
    })
  )
) {
  static readonly decodeUnknownEffect = S.decodeUnknownEffect(SidecarTransport);
}
