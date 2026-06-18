/**
 * Country combobox primitive backed by `countries-list` and SVG flags.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@beep/ui/components/combobox";
import { getCountryDataList } from "countries-list";
import * as FlagIcons from "country-flag-icons/react/3x2";
import { Order, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import { cn } from "../lib/index.ts";
import type { TCountryCode } from "countries-list";
import type React from "react";

/**
 * ISO 3166-1 alpha-2 country code used by the country primitives.
 *
 * @category models
 * @since 0.0.0
 */
export type CountryCode = TCountryCode;

/**
 * A country option rendered by {@link CountrySelect}.
 *
 * @category models
 * @since 0.0.0
 */
type CountryOption = {
  readonly callingCode: string;
  readonly code: CountryCode;
  readonly label: string;
  readonly nativeLabel: string;
  readonly searchText: string;
};

const countryOptionOrder = Order.mapInput(Order.String, (option: CountryOption) => option.label);

/**
 * Stable, label-sorted country options derived from `countries-list`.
 *
 * @example
 * ```tsx
 * import { countryOptions } from "@beep/ui/components/country-select"
 *
 * console.log(countryOptions.length)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const countryOptions: ReadonlyArray<CountryOption> = pipe(
  getCountryDataList(),
  A.map((country) => {
    const callingCode = pipe(
      country.phone,
      A.head,
      O.map((code) => `+${code}`),
      O.getOrElse(() => "")
    );

    return {
      callingCode,
      code: country.iso2,
      label: country.name,
      nativeLabel: country.native,
      searchText: `${country.name} ${country.native} ${country.iso2} ${country.iso3} ${callingCode}`,
    };
  }),
  A.sort(countryOptionOrder)
);

/**
 * Country codes aligned with {@link countryOptions}.
 *
 * @example
 * ```tsx
 * import { countryCodes } from "@beep/ui/components/country-select"
 *
 * console.log(countryCodes.includes("US"))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const countryCodes: ReadonlyArray<CountryCode> = A.map(countryOptions, (option) => option.code);

/**
 * Checks whether a string is one of the supported country codes.
 *
 * @example
 * ```tsx
 * import { isCountryCode } from "@beep/ui/components/country-select"
 *
 * console.log(isCountryCode("US"))
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const isCountryCode = (value: string): value is CountryCode =>
  A.some(countryOptions, (option) => option.code === value);

/**
 * Finds the display option for a country code.
 *
 * @example
 * ```tsx
 * import { findCountryOption } from "@beep/ui/components/country-select"
 *
 * console.log(findCountryOption("US")?.label)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const findCountryOption = (value: string | undefined): CountryOption | undefined =>
  P.isString(value)
    ? pipe(
        countryOptions,
        A.findFirst((option) => option.code === value),
        O.getOrUndefined
      )
    : undefined;

const countryCodeLabel = (value: unknown): string =>
  P.isString(value) && isCountryCode(value) ? (findCountryOption(value)?.label ?? value) : "";

const countryCodeValue = (value: unknown): string => (P.isString(value) && isCountryCode(value) ? value : "");

/**
 * Props for {@link CountryFlag}.
 *
 * @category models
 * @since 0.0.0
 */
export type CountryFlagProps = React.ComponentPropsWithoutRef<"span"> & {
  readonly className?: string | undefined;
  readonly code: CountryCode;
};

/**
 * Renders a 3x2 SVG country flag.
 *
 * @example
 * ```tsx
 * import { CountryFlag } from "@beep/ui/components/country-select"
 *
 * console.log(CountryFlag)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const CountryFlag: React.FC<CountryFlagProps> = ({ code, className, ...props }) => {
  // biome-ignore lint/performance/noDynamicNamespaceImportAccess: Country options are data-driven from ISO codes.
  const Flag = FlagIcons[code];
  return <Flag aria-hidden className={cn("h-3 w-5 shrink-0 rounded-[2px] object-cover", className)} {...props} />;
};

/**
 * Props for {@link CountryOptionContent}.
 *
 * @category models
 * @since 0.0.0
 */
export interface CountryOptionContentProps extends React.ComponentProps<"span"> {
  readonly option: CountryOption;
  readonly showCallingCode?: boolean | undefined;
}

/**
 * Shared visual content for country options.
 *
 * @example
 * ```tsx
 * import { CountryOptionContent, countryOptions } from "@beep/ui/components/country-select"
 *
 * console.log(CountryOptionContent)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const CountryOptionContent: React.FC<CountryOptionContentProps> = ({
  option,
  showCallingCode = true,
  className,
  ...props
}) => (
  <span className={cn("flex min-w-0 items-center gap-2", className)} {...props}>
    <CountryFlag code={option.code} />
    <span className="min-w-0 flex-1 truncate">{option.label}</span>
    {showCallingCode && option.callingCode.length > 0 ? (
      <span className="text-muted-foreground shrink-0 text-xs">{option.callingCode}</span>
    ) : null}
  </span>
);

/**
 * Props for {@link CountrySelect}.
 *
 * @category models
 * @since 0.0.0
 */
export interface CountrySelectProps
  extends Omit<React.ComponentProps<typeof Combobox>, "items" | "value" | "onValueChange" | "name"> {
  readonly disabled?: boolean | undefined;
  readonly id?: string | undefined;
  readonly name?: string | undefined;
  readonly onBlur?: React.FocusEventHandler<HTMLInputElement> | undefined;
  readonly onValueChange?: ((value: CountryCode | "") => void) | undefined;
  readonly placeholder?: string | undefined;
  readonly value?: CountryCode | "" | undefined;
}

/**
 * Filterable country combobox with SVG flags.
 *
 * @example
 * ```tsx
 * import { CountrySelect } from "@beep/ui/components/country-select"
 *
 * console.log(CountrySelect)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const CountrySelect: React.FC<CountrySelectProps> = ({
  disabled = false,
  id,
  name,
  onBlur,
  onValueChange,
  placeholder = "Select country",
  value = "",
  ...props
}) => (
  <Combobox
    {...props}
    items={[...countryCodes]}
    itemToStringLabel={countryCodeLabel}
    itemToStringValue={countryCodeValue}
    name={name}
    value={value}
    onValueChange={(nextValue) => {
      if (P.isString(nextValue) && isCountryCode(nextValue)) {
        onValueChange?.(nextValue);
        return;
      }
      onValueChange?.("");
    }}
  >
    <ComboboxInput id={id} placeholder={placeholder} disabled={disabled} onBlur={onBlur} showClear />
    <ComboboxContent>
      <ComboboxEmpty>No countries found.</ComboboxEmpty>
      <ComboboxList>
        {countryOptions.map((option) => (
          <ComboboxItem key={option.code} value={option.code}>
            <CountryOptionContent option={option} />
          </ComboboxItem>
        ))}
      </ComboboxList>
    </ComboboxContent>
  </Combobox>
);
