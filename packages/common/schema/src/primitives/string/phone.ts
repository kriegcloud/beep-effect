/**
 * Phone number schemas that enforce E.164 formatting and redact runtime values.
 *
 * Exposes the raw branded schema ({@link UnsafePhone}) plus a redacted {@link Phone} wrapper to avoid leaking PII in logs.
 *
 * @example
 * import { Phone } from "@beep/schema/primitives/string/phone";
 *
 * const phone = Phone.make("+14155552671");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
import * as regexes from "@beep/schema/internal/regex/regexes";
import { faker } from "@faker-js/faker";
import type * as B from "effect/Brand";
import * as F from "effect/Function";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import { Id } from "./_id";

/**
 * Raw branded phone schema that validates E.164 compatible strings.
 *
 * @example
 * import { UnsafePhone } from "@beep/schema/primitives/string/phone";
 *
 * UnsafePhone.make("+441632960960");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export const UnsafePhone = S.NonEmptyTrimmedString.pipe(S.pattern(regexes.e164), S.brand("Phone")).annotations(
  Id.annotations("phone/UnsafePhone", {
    description: "A phone number that matches the strict E.164 pattern.",
    arbitrary: () => (fc) => fc.constant(null).map(() => faker.phone.number() as B.Branded<string, "Phone">),
  })
);

/**
 * Namespace exposing helper types for {@link UnsafePhone}.
 *
 * @example
 * import type { UnsafePhone } from "@beep/schema/primitives/string/phone";
 *
 * type RawPhone = UnsafePhone.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace UnsafePhone {
  /**
   * Runtime type of {@link UnsafePhone}.
   *
   * @example
   * import type { UnsafePhone } from "@beep/schema/primitives/string/phone";
   *
   * let value: UnsafePhone.Type;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof UnsafePhone>;
  /**
   * Encoded type accepted by {@link UnsafePhone}.
   *
   * @example
   * import type { UnsafePhone } from "@beep/schema/primitives/string/phone";
   *
   * let encoded: UnsafePhone.Encoded;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof UnsafePhone>;
}

/**
 * Redacted phone schema that hides the branded string behind {@link Redacted["Redacted"] }.
 *
 * @example
 * import { Phone } from "@beep/schema/primitives/string/phone";
 *
 * const value = Phone.make("+14155552671");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class Phone extends S.Redacted(UnsafePhone).annotations(
  Id.annotations("phone/Phone", {
    description: "A redacted phone number built from the E.164-branded schema.",
  })
) {
  /**
   * Creates a redacted phone value from a plain string.
   */
  static readonly make = F.flow((value: string) => UnsafePhone.make(value), Redacted.make);

  /**
   * Extracts the branded string from a redacted phone value.
   */
  static readonly value = (phone: Redacted.Redacted<B.Branded<string, "Phone">>) => Redacted.value(phone);
}

/**
 * Namespace exposing helper types for {@link Phone}.
 *
 * @example
 * import type { Phone } from "@beep/schema/primitives/string/phone";
 *
 * type RedactedPhone = Phone.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace Phone {
  /**
   * Runtime type of {@link Phone}.
   *
   * @example
   * import type { Phone } from "@beep/schema/primitives/string/phone";
   *
   * let phone: Phone.Type;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = typeof Phone.Type;
  /**
   * Encoded type accepted by {@link Phone}.
   *
   * @example
   * import type { Phone } from "@beep/schema/primitives/string/phone";
   *
   * let encoded: Phone.Encoded;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = typeof Phone.Encoded;
}
