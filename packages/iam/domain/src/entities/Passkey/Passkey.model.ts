import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/Passkey/Passkey.model");

export class Model extends M.Class<Model>($I`PasskeyModel`)(
  makeFields(IamEntityIds.PasskeyId, {
    name: BS.NameAttribute.annotations({
      description: "User-friendly name for the passkey device",
      examples: ["iPhone", "YubiKey", "Windows Hello"],
    }),
    userId: SharedEntityIds.UserId.annotations({
      description: "ID of the user this passkey belongs to",
    }),
    credentialID: M.Sensitive(
      S.NonEmptyString.annotations({
        description: "WebAuthn credential identifier",
      })
    ),
    publicKey: M.Sensitive(
      S.NonEmptyString.annotations({
        description: "WebAuthn public key for verification",
      })
    ),
    counter: S.Int.pipe(S.nonNegative()).annotations({
      description: "WebAuthn counter for replay protection",
    }),
    deviceType: S.NonEmptyString.annotations({
      description: "The type of device the passkey is stored on",
    }),
    transports: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "Transport types (e.g. 'usb' or 'nfc')",
        examples: ["usb", "nfc", "ble", "internal"],
      })
    ),
    backedUp: BS.BoolWithDefault(false).annotations({
      description: "Indicates if the passkey has been backed up",
    }),
    aaguid: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "Authenticator Attestation GUID (AAGUID)",
      })
    ),
  }),
  $I.annotations("PasskeyModel", {
    title: "Passkey Model",
    description: "Passkey model representing WebAuthn credentials for passwordless authentication.",
  })
) {
  static readonly utils = modelKit(Model);
}
