/**
 * Core 1Password model.
 *
 * @since 0.0.0
 * @module @beep/providers/1password/Model
 */
import { $SharedProvidersId } from "@beep/identity";
import { LiteralKit, PosInt } from "@beep/schema";
import { Tuple } from "effect";
import * as S from "effect/Schema";

const $I = $SharedProvidersId.create("1password/Model");

/**
 * A 1Password error message
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ErrorMessage = S.String.pipe(
  S.brand("ErrorMessage"),
  $I.annoteSchema("ErrorMessage", {
    description: "A 1Password error message",
  })
);

/**
 * The 1password {@link https://github.com/1Password/onepassword-sdk-js/blob/df1da557d27622874af22ef2f9344d260f42a766/client/src/types.ts#L5 | ErrorMessage type}
 * Type of {@link ErrorMessage} {@inheritDoc ErrorMessage}
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ErrorMessage = typeof ErrorMessage.Type;

/**
 * The 1password {@link https://github.com/1Password/onepassword-sdk-js/blob/df1da557d27622874af22ef2f9344d260f42a766/client/src/types.ts#L8 | AddressFieldDetails type}
 * Additional attributes for OTP fields.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class AddressFieldDetails extends S.Class<AddressFieldDetails>($I`AddressFieldDetails`)(
  {
    /** The street address */
    street: S.String.annotateKey({
      description: "The street address",
    }),
    /** The city */
    city: S.String.annotateKey({
      description: "The city",
    }),
    /** The country */
    country: S.String.annotateKey({
      description: "The country",
    }),
    /** The ZIP code */
    zip: S.String.annotateKey({
      description: "The ZIP code",
    }),
    /** The state */
    state: S.String.annotateKey({
      description: "The state",
    }),
  },
  $I.annote("AddressFieldDetails", {
    description: "Additional attributes for OTP fields.",
  })
) {}

/**
 * The 1password {@link https://github.com/1Password/onepassword-sdk-js/blob/df1da557d27622874af22ef2f9344d260f42a766/client/src/types.ts#L21 | DocumentCreateParams type}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class DocumentCreateParams extends S.Class<DocumentCreateParams>($I`DocumentCreateParams`)(
  {
    /** The name of the file */
    name: S.NonEmptyString.annotateKey({
      description: "The name of the file",
    }),
    /** The content of the file */
    content: S.Uint8Array.annotateKey({
      description: "The content of the file",
    }),
  },
  $I.annote("DocumentCreateParams", {
    description:
      "The 1password {@link https://github.com/1Password/onepassword-sdk-js/blob/df1da557d27622874af22ef2f9344d260f42a766/client/src/types.ts#L21 | DocumentCreateParams type}",
  })
) {}

/**
 * The 1password {@link https://github.com/1Password/onepassword-sdk-js/blob/df1da557d27622874af22ef2f9344d260f42a766/client/src/types.ts#L28 | FileAttributes type}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class FileAttributes extends S.Class<FileAttributes>($I`FileAttributes`)(
  {
    /** The name of the file */
    name: S.String.annotateKey({
      description: "The name of the file",
    }),
    /** The ID of the file retrieved from the server */
    id: S.String.annotateKey({
      description: "The ID of the file retrieved from the server",
    }),
    /** The size of the file in bytes */
    size: PosInt.annotateKey({
      description: "The size of the file in bytes",
    }),
  },
  $I.annote("FileAttributes", {
    description:
      "The 1password {@link https://github.com/1Password/onepassword-sdk-js/blob/df1da557d27622874af22ef2f9344d260f42a766/client/src/types.ts#L28 | FileAttributes type}",
  })
) {}

/**
 * The 1password {@link https://github.com/1Password/onepassword-sdk-js/blob/df1da557d27622874af22ef2f9344d260f42a766/client/src/types.ts#L37 | FileCreateParams type}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class FileCreateParams extends S.Class<FileCreateParams>($I`FileCreateParams`)(
  {
    /** The name of the file */
    name: S.NonEmptyString.annotateKey({
      description: "The name of the file",
    }),
    /** The content of the file */
    content: S.Uint8Array.annotateKey({
      description: "The content of the file",
    }),
    /** The section id where the file should be stored */
    sectionId: S.String.annotateKey({
      description: "The section id where the file should be stored",
    }),
    /** The field id where the file should be stored */
    fieldId: S.String.annotateKey({
      description: "The field id where the file should be stored",
    }),
  },
  $I.annote("FileCreateParams", {
    description:
      "The 1password {@link https://github.com/1Password/onepassword-sdk-js/blob/df1da557d27622874af22ef2f9344d260f42a766/client/src/types.ts#L37 | FileCreateParams type}",
  })
) {}

/**
 * The 1password {@link https://github.com/1Password/onepassword-sdk-js/blob/df1da557d27622874af22ef2f9344d260f42a766/client/src/types.ts#L52 | GeneratePasswordResponse type}
 *
 * For future use, if we want to return more information about the generated password.
 * Currently, it only returns the password itself.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class GeneratePasswordResponse extends S.Class<GeneratePasswordResponse>($I`GeneratePasswordResponse`)(
  {
    /** The generated password. */
    password: S.Redacted(S.NonEmptyString).annotateKey({
      description: "The generated password.",
    }),
  },
  $I.annote("GeneratePasswordResponse", {
    description:
      "The 1password {@link https://github.com/1Password/onepassword-sdk-js/blob/df1da557d27622874af22ef2f9344d260f42a766/client/src/types.ts#L52 | GeneratePasswordResponse type}",
  })
) {}

/**
 * The 1password GroupType
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const GroupType = LiteralKit([
  /**
   * The owners group, which gives the following permissions:
   * - Do everything the Admin group can do
   * - See every vault other than the personal vaults
   * - Change people's names
   * - See billing
   * - Change billing
   * - Make other people owners
   * - Delete a person
   */
  "owners",
  /**
   * The administrators group, which gives the following permissions:
   * - Perform recovery
   * - Create new vaults
   * - Invite new members
   * - See vault metadata, including the vault name and who has access.
   * - Make other people admins
   */
  "administrators",
  /**
   * The recovery group. It contains recovery keysets, and is added to every vault to allow for recovery.
   * No one is added to this.
   */
  "recovery",
  /**
   * The external account managers group or EAM is a mandatory group for managed accounts that has
   * same permissions as the owners.
   */
  "externalAccountManagers",
  /** Members of a team that a user is on. */
  "teamMembers",
  /** A custom, user defined group. */
  "userDefined",
  /** Support for new or renamed group types */
  "unsupported",
])
  .mapMembers(
    Tuple.evolve([
      (lit) =>
        lit.annotateKey({
          description:
            "The owners group, which gives the following permissions:\n- Do everything the Admin group can do\n- See every vault other than the personal vaults\n- Change people's names\n- See billing\n- Change billing\n- Make other people owners\n- Delete a person",
        }),
      (lit) =>
        lit.annotateKey({
          description:
            "The administrators group, which gives the following permissions:\n- Perform recovery\n- Create new vaults\n- Invite new members\n- See vault metadata, including the vault name and who has access.\n- Make other people admins",
        }),
      (lit) =>
        lit.annotateKey({
          description:
            "The recovery group. It contains recovery keysets, and is added to every vault to allow for recovery.\nNo one is added to this.",
        }),
      (lit) =>
        lit.annotateKey({
          description:
            "The external account managers group or EAM is a mandatory group for managed accounts that has\nsame permissions as the owners.",
        }),
      (lit) =>
        lit.annotateKey({
          description: "Members of a team that a user is on.",
        }),
      (lit) =>
        lit.annotateKey({
          description: "A custom, user defined group.",
        }),
      (lit) =>
        lit.annotateKey({
          description: "Support for new or renamed group types",
        }),
    ])
  )
  .pipe(
    $I.annoteSchema("GroupType", {
      description: "The 1password GroupType",
    })
  );

/**
 * Type of {@link GroupType} {@inheritDoc GroupType}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type GroupType = typeof GroupType.Type;

/**
 * The GroupState type for 1password
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const GroupState = LiteralKit([
  /** This group is active */
  "active",
  /** This group has been deleted */
  "deleted",
  /** This group is in an unknown state */
  "unsupported",
])
  .mapMembers(
    Tuple.evolve([
      (active) =>
        active.annotateKey({
          description: "This group is active",
        }),
      (deleted) =>
        deleted.annotateKey({
          description: "This group has been deleted",
        }),
      (unsupported) =>
        unsupported.annotateKey({
          description: "This group is in an unknown state",
        }),
    ])
  )
  .pipe(
    $I.annoteSchema("GroupState", {
      description: "The GroupState type for 1password",
    })
  );

/**
 * Type of {@link GroupState} {@inheritDoc GroupState}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type GroupState = typeof GroupState.Type;

/**
 * The Vault Accessor Type for 1password
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const VaultAccessorType = LiteralKit(["user", "group"]).pipe(
  $I.annoteSchema("VaultAccessorType", {
    description: "The Vault Accessor Type for 1password",
  })
);

/**
 * Type of {@link VaultAccessorType} {@inheritDoc VaultAccessorType}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type VaultAccessorType = typeof VaultAccessorType.Type;

/**
 * The 1password {@link https://github.com/1Password/onepassword-sdk-js/blob/df1da557d27622874af22ef2f9344d260f42a766/client/src/types.ts#L112 | VaultAccess type}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class VaultAccess extends S.Class<VaultAccess>($I`VaultAccess`)(
  {
    /** The vault's UUID. */
    vaultUuid: S.NonEmptyString.check(S.isUUID()).annotateKey({
      description: "The vault's UUID.",
    }),
    /** The vault's accessor type. */
    accessorType: VaultAccessorType.annotateKey({
      description: "The vault's accessor type.",
    }),
    /** The vault's accessor UUID. */
    accessorUuid: S.String.check(S.isUUID()).annotateKey({
      description: "The vault's accessor UUID.",
    }),
    /** The permissions granted to this vault */
    permissions: S.Number.annotateKey({
      description: "The permissions granted to this vault",
    }),
  },
  $I.annote("VaultAccess", {
    description:
      "The 1password {@link https://github.com/1Password/onepassword-sdk-js/blob/df1da557d27622874af22ef2f9344d260f42a766/client/src/types.ts#L112 | VaultAccess type}",
  })
) {}
