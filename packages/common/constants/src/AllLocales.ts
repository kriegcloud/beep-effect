import { ALL_LOCALES } from "@beep/constants/_generated";
import { type LocaleAccessorRecord, localesToAccessorRecord } from "@beep/constants/IsoCountries";

export const AllLocales: LocaleAccessorRecord<typeof ALL_LOCALES> = localesToAccessorRecord(ALL_LOCALES);
