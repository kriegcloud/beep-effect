import { toJsAccessor } from "@beep/constants/paths/utils/public-paths-to-record";
import * as A from "effect/Array";

type CapitalizeHead<S extends string> = S extends `${infer H}${infer R}` ? `${Uppercase<H>}${R}` : S;

export type LocaleAccessorName<S extends string> = S extends `${infer Head}-${infer Tail}`
  ? `${Head}${CapitalizeHead<LocaleAccessorName<Tail>>}`
  : S;

export type LocaleAccessorRecord<Locales extends readonly string[]> = {
  readonly [K in Locales[number] as LocaleAccessorName<K>]: K;
};

export function toLocaleAccessor<S extends string>(locale: S): LocaleAccessorName<S> {
  return toJsAccessor(locale) as LocaleAccessorName<S>;
}

export function localesToAccessorRecord<const Locales extends readonly string[]>(
  locales: Locales
): LocaleAccessorRecord<Locales> {
  return A.reduce(locales, {} as LocaleAccessorRecord<Locales>, (acc, locale) => ({
    ...acc,
    [toLocaleAccessor(locale)]: locale,
  }));
}
