import { Common, IamEntityIds } from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * Passkey model representing WebAuthn credentials for passwordless authentication.
 * Maps to the `passkey` table in the database.
 */
export class Model extends M.Class<Model>(`Passkey.Model`)({
  /** Primary key identifier for the passkey */
  id: M.Generated(IamEntityIds.PasskeyId),

  name: M.FieldOption(
    S.NonEmptyString.annotations({
      description: "User-friendly name for the passkey device",
      examples: ["iPhone", "YubiKey", "Windows Hello"],
    })
  ),
  /** User this passkey belongs to */
  userId: IamEntityIds.UserId.annotations({
    description: "ID of the user this passkey belongs to",
  }),

  /** WebAuthn credential ID */
  credentialID: M.Sensitive(
    S.NonEmptyString.annotations({
      description: "WebAuthn credential identifier",
    })
  ),

  /** WebAuthn public key (sensitive) */
  publicKey: M.Sensitive(
    S.NonEmptyString.annotations({
      description: "WebAuthn public key for verification",
    })
  ),
  /** WebAuthn counter for replay protection */
  counter: S.Int.pipe(S.nonNegative()).annotations({
    description: "WebAuthn counter for replay protection",
  }),

  /** The type of device the passkey is stored on */
  deviceType: S.NonEmptyString.annotations({
    description: "The type of device the passkey is stored on",
  }),

  /** Transport types */
  transports: M.FieldOption(
    S.NonEmptyString.annotations({
      description: "Transport types (e.g. 'usb' or 'nfc')",
      examples: ["usb", "nfc", "ble", "internal"],
    })
  ),

  /** Indicates if the passkey has been backed up */
  backedUp: S.Boolean.annotations({
    description: "Indicates if the passkey has been backed up",
  }),

  /** Authenticator Attestation GUID */
  aaguid: M.FieldOption(
    S.NonEmptyString.annotations({
      description: "Authenticator Attestation GUID (AAGUID)",
    })
  ),

  // Use defaultColumns to match table schema (includes organizationId)
  ...Common.defaultColumns,
}) {}
