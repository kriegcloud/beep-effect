import { faker } from "@faker-js/faker";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import { sid } from "./id";
import { annotate, makeMocker } from "./utils";
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
export namespace Phone {
  export const Base = S.NonEmptyTrimmedString.pipe(
    S.pattern(/^\+\d-\d{3}-\d{3}-\d{4}$/),
    S.brand("Phone"),
  );

  export const Schema = annotate(S.Redacted(Base), {
    identifier: sid.shared.schema("Phone.Schema"),
    title: "Phone",
    description: "A valid phone number",
    arbitrary: () => (fc) =>
      fc.constant(null).map(() =>
        Redacted.make(Base.make(faker.phone.number())),
      ),
  });

  export type Type = typeof Schema.Type;

  export const Mock = makeMocker(Schema);
  export const make = (input: string) => Redacted.make(Base.make(input));
}
