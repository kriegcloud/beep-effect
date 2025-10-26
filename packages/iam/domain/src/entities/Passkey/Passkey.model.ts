import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export const PasskeyModelSchemaId = Symbol.for("@beep/iam-domain/PasskeyModel");

/**
 * Passkey model representing WebAuthn credentials for passwordless authentication.
 * Maps to the `passkey` table in the database.
 */
export class Model extends M.Class<Model>(`PasskeyModel`)(
  makeFields(IamEntityIds.PasskeyId, {
    name: BS.NameAttribute.annotations({
      description: "User-friendly name for the passkey device",
      examples: ["iPhone", "YubiKey", "Windows Hello"],
    }),
    /** User this passkey belongs to */
    userId: SharedEntityIds.UserId.annotations({
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
    transports: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "Transport types (e.g. 'usb' or 'nfc')",
        examples: ["usb", "nfc", "ble", "internal"],
      })
    ),

    /** Indicates if the passkey has been backed up */
    backedUp: BS.BoolWithDefault(false).annotations({
      description: "Indicates if the passkey has been backed up",
    }),

    /** Authenticator Attestation GUID */
    aaguid: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "Authenticator Attestation GUID (AAGUID)",
      })
    ),
  }),
  {
    title: "Passkey Model",
    description: "Passkey model representing WebAuthn credentials for passwordless authentication.",
    schemaId: PasskeyModelSchemaId,
  }
) {}
