/**
 * Phone input primitive backed by `libphonenumber-js/min`.
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
import {
  CountryOptionContent,
  countryOptions,
  findCountryOption,
  isCountryCode,
} from "@beep/ui/components/country-select";
import { InputGroup, InputGroupInput } from "@beep/ui/components/input-group";
import { make as makeScopedAtom, useAtom } from "@effect/atom-react";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import { Atom } from "effect/unstable/reactivity";
import {
  AsYouType,
  getCountries,
  isSupportedCountry,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js/min";
import type { CountryCode as PhoneCountryCode } from "libphonenumber-js/min";
import type React from "react";

const defaultPhoneCountry = "US" satisfies PhoneCountryCode;

/**
 * Supported phone country codes from the pinned phone metadata.
 *
 * @example
 * ```tsx
 * import { phoneCountryCodes } from "@beep/ui/components/phone-input"
 *
 * console.log(phoneCountryCodes.includes("US"))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const phoneCountryCodes: ReadonlyArray<PhoneCountryCode> = getCountries();

/**
 * Country options filtered to the phone metadata's supported countries.
 *
 * @example
 * ```tsx
 * import { phoneCountryOptions } from "@beep/ui/components/phone-input"
 *
 * console.log(phoneCountryOptions.length)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const phoneCountryOptions = A.filter(countryOptions, (option) => isSupportedCountry(option.code));

/**
 * E.164 phone number value used by {@link PhoneInput}.
 *
 * @category models
 * @since 0.0.0
 */
export type PhoneNumberE164 = string;

/**
 * Formats draft phone input for a selected country.
 *
 * @example
 * ```tsx
 * import { formatPhoneDraft } from "@beep/ui/components/phone-input"
 *
 * console.log(formatPhoneDraft("4155552671", "US"))
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const formatPhoneDraft: {
  (country: PhoneCountryCode): (value: string) => string;
  (value: string, country: PhoneCountryCode): string;
} = dual(2, (value: string, country: PhoneCountryCode): string => new AsYouType(country).input(value));

/**
 * Parses a draft phone input into E.164 when possible.
 *
 * @example
 * ```tsx
 * import { parsePhoneDraft } from "@beep/ui/components/phone-input"
 *
 * console.log(parsePhoneDraft("4155552671", "US"))
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const parsePhoneDraft: {
  (country: PhoneCountryCode): (value: string) => PhoneNumberE164;
  (value: string, country: PhoneCountryCode): PhoneNumberE164;
} = dual(2, (value: string, country: PhoneCountryCode): PhoneNumberE164 => {
  if (value.length === 0) {
    return "";
  }

  const formatter = new AsYouType(country);
  formatter.input(value);
  return formatter.getNumberValue() ?? parsePhoneNumberFromString(value, country)?.number ?? "";
});

/**
 * Validates an E.164 phone number using the pinned `libphonenumber-js/min`
 * metadata.
 *
 * @example
 * ```tsx
 * import { isValidPhoneNumberE164 } from "@beep/ui/components/phone-input"
 *
 * console.log(isValidPhoneNumberE164("+14155552671"))
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const isValidPhoneNumberE164 = (value: string): boolean => value.length > 0 && isValidPhoneNumber(value);

/**
 * Props for {@link PhoneInput}.
 *
 * @category models
 * @since 0.0.0
 */
export interface PhoneInputProps extends Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> {
  readonly defaultCountry?: PhoneCountryCode | undefined;
  readonly defaultValue?: PhoneNumberE164 | undefined;
  readonly disabled?: boolean | undefined;
  readonly id?: string | undefined;
  readonly inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"] | undefined;
  readonly name?: string | undefined;
  readonly onBlur?: React.FocusEventHandler<HTMLInputElement> | undefined;
  readonly onCountryChange?: ((country: PhoneCountryCode) => void) | undefined;
  readonly onValueChange?: ((value: PhoneNumberE164) => void) | undefined;
  readonly placeholder?: string | undefined;
  readonly value?: PhoneNumberE164 | undefined;
}

interface PhoneInputState {
  readonly country: PhoneCountryCode;
  readonly displayValue: string;
}

interface PhoneInputScopeInput {
  readonly defaultCountry: PhoneCountryCode;
  readonly defaultValue: PhoneNumberE164;
}

const formatInitialPhoneValue = (value: PhoneNumberE164 | undefined, country: PhoneCountryCode): string => {
  if (!P.isString(value) || value.length === 0) {
    return "";
  }

  return formatPhoneDraft(value, country);
};

const PhoneInputScope = makeScopedAtom((input: PhoneInputScopeInput) =>
  Atom.make<PhoneInputState>({
    country: input.defaultCountry,
    displayValue: formatInitialPhoneValue(input.defaultValue, input.defaultCountry),
  })
);

/**
 * Country-aware phone input that emits E.164 strings.
 *
 * @example
 * ```tsx
 * import { PhoneInput } from "@beep/ui/components/phone-input"
 *
 * console.log(PhoneInput)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const PhoneInput: React.FC<PhoneInputProps> = (props) => (
  <PhoneInputScope.Provider
    value={{
      defaultCountry: props.defaultCountry ?? defaultPhoneCountry,
      defaultValue: props.defaultValue ?? props.value ?? "",
    }}
  >
    <PhoneInputInner {...props} />
  </PhoneInputScope.Provider>
);

const PhoneInputInner: React.FC<PhoneInputProps> = ({
  className,
  defaultCountry = defaultPhoneCountry,
  disabled = false,
  id,
  inputMode = "tel",
  name,
  onBlur,
  onCountryChange,
  onValueChange,
  placeholder = "(555) 123-4567",
  value,
  ...props
}) => {
  const [state, setState] = useAtom(PhoneInputScope.use());
  const selectedCountry = state.country;
  const selectedOption = findCountryOption(selectedCountry);
  const displayedValue =
    P.isString(value) && value.length > 0 ? formatInitialPhoneValue(value, selectedCountry) : state.displayValue;

  return (
    <div className={className} {...props}>
      <InputGroup className="h-auto min-h-8">
        <Combobox
          items={[...phoneCountryCodes]}
          value={selectedCountry}
          onValueChange={(nextValue) => {
            if (P.isString(nextValue) && isCountryCode(nextValue) && isSupportedCountry(nextValue)) {
              setState((current) => ({ ...current, country: nextValue }));
              onCountryChange?.(nextValue);
            }
          }}
        >
          <ComboboxInput
            aria-label="Phone country"
            className="w-36 rounded-r-none border-0 border-r bg-transparent focus-visible:ring-0"
            disabled={disabled}
            placeholder={selectedOption?.code ?? defaultCountry}
            showClear={false}
          />
          <ComboboxContent>
            <ComboboxEmpty>No countries found.</ComboboxEmpty>
            <ComboboxList>
              {phoneCountryOptions.map((option) => (
                <ComboboxItem key={option.code} value={option.code}>
                  <CountryOptionContent option={option} />
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <InputGroupInput
          id={id}
          name={name}
          type="tel"
          inputMode={inputMode}
          disabled={disabled}
          placeholder={placeholder}
          value={displayedValue}
          onBlur={onBlur}
          onChange={(event) => {
            const draft = event.target.value;
            const formatted = formatPhoneDraft(draft, selectedCountry);
            const e164 = parsePhoneDraft(draft, selectedCountry);
            setState((current) => ({ ...current, displayValue: formatted }));
            onValueChange?.(e164);
          }}
        />
      </InputGroup>
    </div>
  );
};
