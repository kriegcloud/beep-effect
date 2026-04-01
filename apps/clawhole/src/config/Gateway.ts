/**
 * Contains the Gateway API for `@beep/clawhole`.
 *
 * @module @beep/clawhole/config/Gateway
 * @since 0.0.0
 */
import { SecretInput } from "./Secrets.ts";
import * as S from "effect/Schema";
import { LiteralKit, SchemaUtils, FilePath } from "@beep/schema";
import { $ClawholeId } from "@beep/identity";

const $I = $ClawholeId.create("config/Gateway");


/**
 * Configuration class for managing TLS settings in the gateway server.
 *
 * This class encapsulates configuration settings for enabling TLS, specifying
 * certificate and key paths, and handling auto-generation of self-signed certificates.
 * It is used to ensure secure communication for gateway operations.
 *
 * ## Key Features
 * - Configurable TLS enablement.
 * - Option to auto-generate self-signed certificates when necessary.
 * - Support for specifying certificate, private key, and CA paths.
 *
 * ## Examples
 *
 * ### Default Configuration
 *
 * ```typescript
 * import { GatewayTlsConfig } from "gateway/config";
 *
 * const tlsConfig = new GatewayTlsConfig();
 * console.log(tlsConfig);
 * // Default output:
 * // { enabled: undefined, autoGenerate: true, certPath: undefined, keyPath: undefined, caPath: undefined }
 * ```
 *
 * ### Custom Configuration
 *
 * ```typescript
 * import { GatewayTlsConfig } from "gateway/config";
 *
 * const tlsConfig = new GatewayTlsConfig({
 *   enabled: true,
 *   autoGenerate: false,
 *   certPath: "/path/to/cert.pem",
 *   keyPath: "/path/to/key.pem",
 *   caPath: "/path/to/ca.pem"
 * });
 *
 * console.log(tlsConfig);
 * // Output:
 * // {
 * //   enabled: true,
 * //   autoGenerate: false,
 * //   certPath: "/path/to/cert.pem",
 * //   keyPath: "/path/to/key.pem",
 * //   caPath: "/path/to/ca.pem"
 * // }
 * ```
 *
 * ###*/
export class GatewayTlsConfig extends S.Class<GatewayTlsConfig>($I`GatewayTlsConfig`)(
  {
    /** Enable TLS for the gateway server. */
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Enable TLS for the gateway server.",
    }),
    /** Auto-generate a self-signed cert if cert/key are missing (default: true). */
    autoGenerate: SchemaUtils.withKeyDefaults(S.Boolean, true).annotateKey({
      description: "Auto-generate a self-signed cert if cert/key are missing" + " (default: true).",
      default: true,
    }),
    /** PEM certificate path for the gateway server. */
    certPath: S.OptionFromOptionalKey(FilePath).annotateKey({
      description: "PEM certificate path for the gateway server.",
    }),
    /** PEM private key path for the gateway server. */
    keyPath: S.OptionFromOptionalKey(FilePath).annotateKey({
      description: "PEM private key path for the gateway server.",
    }),
    /** Optional PEM CA bundle for TLS clients (mTLS or custom roots). */
    caPath: S.OptionFromOptionalKey(FilePath).annotateKey({
      description: "Optional PEM CA bundle for TLS clients (mTLS or custom roots).",
    }),
  },
  $I.annote("GatewayTlsConfig", {
    description: "TLS configuration for the gateway server, including certificate paths and auto-generation options.",
  })
) {}
