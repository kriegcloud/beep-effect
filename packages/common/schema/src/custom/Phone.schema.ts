import * as regexes from "@beep/schema/regexes";
import { faker } from "@faker-js/faker";
import type * as B from "effect/Brand";
import * as F from "effect/Function";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import { CustomId } from "./_id";

const Id = CustomId.compose("phone");
export const UnsafePhone = S.NonEmptyTrimmedString.pipe(S.pattern(regexes.e164), S.brand("Phone")).annotations(
  Id.annotations("Phone", {
    description: "A valid phone number",
    arbitrary: () => (fc) => fc.constant(null).map(() => faker.phone.number() as B.Branded<string, "Phone">),
  })
);

/**
 * Phone number schema and helpers.
 *
 * ## Why Redacted?
 * Phone values are wrapped with `Redacted` to avoid accidental logging / printing
 * of PII at runtime. Use `Redacted.value(phone)` if you must access the inner string.
 *
 * ## Example (decoding)
 * ```ts
 * import * as Effect from "effect/Effect";
 *
 * const decode = S.decodeUnknown(Phone.Schema);
 * const program = decode("+1-123-456-7890");
 * // -> Effect<never, ParseIssue, Redacted.Redacted<"123-456-7890">>
 * ```
 *
 * ## Example (mocking)
 * ```ts
 * // Default single value (type-level sample)
 * const one = Phone.Mock("type", 1, true);
 * // Multiple samples
 * const many = Phone.Mock("type", 3);
 * ```
 *
 * @since 0.1.0
 * @category Phone
 */
export class Phone extends S.Redacted(UnsafePhone).annotations(
  Id.annotations("Phone", {
    description: "A valid phone number",
  })
) {
  static readonly make = F.flow((i: string) => UnsafePhone.make(i), Redacted.make);
}

export declare namespace Phone {
  export type Type = typeof Phone.Type;
  export type Encoded = typeof Phone.Encoded;
}
