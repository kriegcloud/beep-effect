import { BS } from "@beep/schema";
import { UserGender } from "@beep/shared-domain/entities/User";
import { allIconNamesNonEmpty } from "@beep/ui-core/constants/iconify/register-icons";
import { faker } from "@faker-js/faker";
import * as Arbitrary from "effect/Arbitrary";
import * as FC from "effect/FastCheck";
import * as S from "effect/Schema";

export const IconKit = BS.stringLiteralKit(...allIconNamesNonEmpty);

export class Icon extends IconKit.Schema {}

export class PersonalInfo extends BS.Class<PersonalInfo>("PersonalInfo")({
  firstName: BS.FirstName,
  lastName: BS.LastName,
  name: BS.FullName,
  username: BS.NameAttribute.annotations({
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.internet.username()),
  }),
  birthDate: BS.BirthDate,
  gender: UserGender,
  country: BS.CountryName,
  state: BS.USStateName,
  city: BS.Locality,
  street: BS.StreetLine,
  zip: BS.PostalCode,
  phoneNumber: BS.Phone,
  email: BS.Email,
  secondaryEmail: BS.Email,
}) {
  static readonly Mock = (qty: number) => FC.sample(Arbitrary.make(PersonalInfo), qty);
}

export declare namespace PersonalInfo {
  export type Type = S.Schema.Type<typeof PersonalInfo>;
  export type Encoded = S.Schema.Encoded<typeof PersonalInfo>;
}

export class AddressInfo extends BS.Class<AddressInfo>("AddressInfo")({
  name: BS.NameAttribute,
  phoneNumber: BS.Phone,
  emailAddress: BS.Email,
  country: BS.CountryName,
  state: BS.USStateName,
  city: BS.Locality,
  street: BS.StreetLine,
  zip: BS.PostalCode,
  addressType: S.Literal("Office", "Home", "Billing", "Shipping"),
}) {
  static readonly Mock = (qty: number) => FC.sample(Arbitrary.make(AddressInfo), qty);
}

export declare namespace AddressInfo {
  export type Type = S.Schema.Type<typeof AddressInfo>;
  export type Encoded = S.Schema.Encoded<typeof AddressInfo>;
}

export class StorageCategory extends BS.Class<StorageCategory>("StorageCategory")({
  name: BS.NameAttribute,
  icon: Icon,
  color: S.String.annotations({
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.color.rgb()),
  }),
  fileCount: S.NonNegativeInt.annotations({
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.number.int({ min: 0, max: 1000 })),
  }),
  spaceUsedInKb: S.NonNegativeInt.annotations({
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.number.int({ min: 0, max: 1000 })),
  }),
}) {
  static readonly Mock = (qty: number) => FC.sample(Arbitrary.make(StorageCategory), qty);
}

export declare namespace StorageCategory {
  export type Type = S.Schema.Type<typeof StorageCategory>;
  export type Encoded = S.Schema.Encoded<typeof StorageCategory>;
}

export class Storage extends BS.Class<Storage>("Storage")({
  totalSpaceInKb: S.NonNegativeInt.annotations({
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.number.int({ min: 0, max: 1000 })),
  }),
  totalSpaceUsedInKb: S.NonNegativeInt.annotations({
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.number.int({ min: 0, max: 1000 })),
  }),
  categories: S.NonEmptyArray(StorageCategory),
}) {
  static readonly Mock = (qty: number) => FC.sample(Arbitrary.make(Storage), qty);
}

export declare namespace Storage {
  export type Type = S.Schema.Type<typeof Storage>;
  export type Encoded = S.Schema.Encoded<typeof Storage>;
}

export class BackupSyncSettings extends BS.Class<BackupSyncSettings>("BackupSyncSettings")({
  name: BS.NameAttribute,
  enabled: S.Boolean,
}) {
  static readonly Mock = (qty: number) => FC.sample(Arbitrary.make(BackupSyncSettings), qty);
}

export declare namespace BackupSyncSettings {
  export type Type = S.Schema.Type<typeof BackupSyncSettings>;
  export type Encoded = S.Schema.Encoded<typeof BackupSyncSettings>;
}

export class CardInfo extends BS.Class<CardInfo>("CardInfo")({
  id: S.NonNegativeInt.pipe(S.greaterThan(1), S.lessThan(1000)),
  cardName: S.String.annotations({
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.finance.creditCardIssuer()),
  }),
  cardHolder: BS.FullName,
  cardNumber: S.Redacted(
    S.String.annotations({
      arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.finance.creditCardNumber()),
    })
  ),
  expirationDate: S.String.annotations({
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.date.future({ refDate: new Date() }).toISOString()),
  }),
  cvv: S.Redacted(
    S.String.annotations({
      arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.finance.creditCardCVV()),
    })
  ),
  subscriptions: S.NonNegativeInt.pipe(S.greaterThan(1), S.lessThan(10)),
  icon: Icon,
}) {
  static readonly Mock = (qty: number) => FC.sample(Arbitrary.make(CardInfo), qty);
}

export declare namespace CardInfo {
  export type Type = S.Schema.Type<typeof CardInfo>;
  export type Encoded = S.Schema.Encoded<typeof CardInfo>;
}
