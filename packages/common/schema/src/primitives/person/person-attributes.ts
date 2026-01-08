/**
 * Person-centric primitive schemas such as first/last names and birth dates.
 *
 * These helpers wrap {@link NameAttribute} plus additional validation (faker-backed arbitrary, date plausibility) so vertical slices can consume consistent core schemas.
 *
 * @example
 * import { FirstName } from "@beep/schema/primitives/person/person-attributes";
 *
 * const name = FirstName.make("Ada");
 *
 * @category Primitives/Misc/Person
 * @since 0.1.0
 */

import { $SchemaId } from "@beep/identity/packages";
import { faker } from "@faker-js/faker";
import * as DateTime from "effect/DateTime";
import * as S from "effect/Schema";
import { NameAttribute } from "../string/name-attribute";

const $I = $SchemaId.create("primitives/person/person-attributes");

const MAX_AGE = 130;
const MILLIS_PER_YEAR = 365 * 24 * 60 * 60 * 1000;

const ageOn = (birth: Date, on: Date) => {
  const years = on.getUTCFullYear() - birth.getUTCFullYear();
  const monthDelta = on.getUTCMonth() - birth.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && on.getUTCDate() < birth.getUTCDate())) {
    return years - 1;
  }
  return years;
};

/**
 * Person first-name schema that reuses {@link NameAttribute} constraints.
 *
 * @example
 * import { FirstName } from "@beep/schema/primitives/person/person-attributes";
 *
 * FirstName.make("Grace");
 *
 * @category Primitives/Misc/Person
 * @since 0.1.0
 */
export class FirstName extends NameAttribute.annotations(
  $I.annotations("person/FirstName", {
    description: "A person or user's given name.",
    arbitrary: () => (fc) => fc.constant(null).map(() => faker.person.firstName()),
  })
) {}

/**
 * Namespace exposing helper types for {@link FirstName}.
 *
 * @example
 * import type { FirstName } from "@beep/schema/primitives/person/person-attributes";
 *
 * let name: FirstName.Type;
 *
 * @category Primitives/Misc/Person
 * @since 0.1.0
 */
export declare namespace FirstName {
  /**
   * Runtime type for {@link FirstName}.
   *
   * @example
   * import type { FirstName } from "@beep/schema/primitives/person/person-attributes";
   *
   * let value: FirstName.Type;
   *
   * @category Primitives/Misc/Person
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof FirstName>;
  /**
   * Encoded representation for {@link FirstName}.
   *
   * @example
   * import type { FirstName } from "@beep/schema/primitives/person/person-attributes";
   *
   * let encoded: FirstName.Encoded;
   *
   * @category Primitives/Misc/Person
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof FirstName>;
}

/**
 * Last-name schema with the same constraints as {@link NameAttribute}.
 *
 * @example
 * import { LastName } from "@beep/schema/primitives/person/person-attributes";
 *
 * LastName.make("Hopper");
 *
 * @category Primitives/Misc/Person
 * @since 0.1.0
 */
export class LastName extends NameAttribute.annotations(
  $I.annotations("person/LastName", {
    description: "A person or user's family name.",
    arbitrary: () => (fc) => fc.constant(null).map(() => faker.person.lastName()),
  })
) {}

/**
 * Namespace exposing helper types for {@link LastName}.
 *
 * @example
 * import type { LastName } from "@beep/schema/primitives/person/person-attributes";
 *
 * type Value = LastName.Type;
 *
 * @category Primitives/Misc/Person
 * @since 0.1.0
 */
export declare namespace LastName {
  /**
   * Runtime type for {@link LastName}.
   *
   * @example
   * import type { LastName } from "@beep/schema/primitives/person/person-attributes";
   *
   * let value: LastName.Type;
   *
   * @category Primitives/Misc/Person
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof LastName>;
  /**
   * Encoded representation for {@link LastName}.
   *
   * @example
   * import type { LastName } from "@beep/schema/primitives/person/person-attributes";
   *
   * let encoded: LastName.Encoded;
   *
   * @category Primitives/Misc/Person
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof LastName>;
}

/**
 * Full-name schema capturing display names.
 *
 * @example
 * import { FullName } from "@beep/schema/primitives/person/person-attributes";
 *
 * FullName.make("Grace Hopper");
 *
 * @category Primitives/Misc/Person
 * @since 0.1.0
 */
export class FullName extends NameAttribute.annotations(
  $I.annotations("person/FullName", {
    description: "A person or user's display name.",
    arbitrary: () => (fc) => fc.constant(null).map(() => faker.person.fullName()),
  })
) {}

/**
 * Namespace exposing helper types for {@link FullName}.
 *
 * @example
 * import type { FullName } from "@beep/schema/primitives/person/person-attributes";
 *
 * type Value = FullName.Type;
 *
 * @category Primitives/Misc/Person
 * @since 0.1.0
 */
export declare namespace FullName {
  /**
   * Runtime type for {@link FullName}.
   *
   * @example
   * import type { FullName } from "@beep/schema/primitives/person/person-attributes";
   *
   * let value: FullName.Type;
   *
   * @category Primitives/Misc/Person
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof FullName>;
  /**
   * Encoded representation for {@link FullName}.
   *
   * @example
   * import type { FullName } from "@beep/schema/primitives/person/person-attributes";
   *
   * let encoded: FullName.Encoded;
   *
   * @category Primitives/Misc/Person
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof FullName>;
}

/**
 * Middle-name schema that mirrors {@link NameAttribute} limits.
 *
 * @example
 * import { MiddleName } from "@beep/schema/primitives/person/person-attributes";
 *
 * MiddleName.make("Maria");
 *
 * @category Primitives/Misc/Person
 * @since 0.1.0
 */
export class MiddleName extends NameAttribute.annotations(
  $I.annotations("person/MiddleName", {
    description: "A person or user's middle name.",
    arbitrary: () => (fc) => fc.constant(null).map(() => faker.person.middleName()),
  })
) {}

/**
 * Namespace exposing helper types for {@link MiddleName}.
 *
 * @example
 * import type { MiddleName } from "@beep/schema/primitives/person/person-attributes";
 *
 * type Value = MiddleName.Type;
 *
 * @category Primitives/Misc/Person
 * @since 0.1.0
 */
export declare namespace MiddleName {
  /**
   * Runtime type for {@link MiddleName}.
   *
   * @example
   * import type { MiddleName } from "@beep/schema/primitives/person/person-attributes";
   *
   * let value: MiddleName.Type;
   *
   * @category Primitives/Misc/Person
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof MiddleName>;
  /**
   * Encoded representation for {@link MiddleName}.
   *
   * @example
   * import type { MiddleName } from "@beep/schema/primitives/person/person-attributes";
   *
   * let encoded: MiddleName.Encoded;
   *
   * @category Primitives/Misc/Person
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof MiddleName>;
}

/**
 * Birth-date schema that forbids future dates and caps age at {@link MAX_AGE}.
 *
 * @example
 * import { BirthDate } from "@beep/schema/primitives/person/person-attributes";
 *
 * BirthDate.make(new Date("1990-12-01"));
 *
 * @category Primitives/Misc/Person
 * @since 0.1.0
 */
export class BirthDate extends S.Date.pipe(
  S.filter((value) => value.getTime() <= DateTime.toEpochMillis(DateTime.unsafeNow()), {
    message: () => "birthDate cannot be in the future",
  }),
  S.filter((value) => ageOn(value, DateTime.toDate(DateTime.unsafeNow())) <= MAX_AGE, {
    message: () => `age must be ≤ ${MAX_AGE}`,
  })
).annotations(
  $I.annotations("person/BirthDate", {
    description: "A realistic birth date that is not in the future and corresponds to an age ≤ 130.",
    arbitrary: () => (fc) =>
      fc.constant(null).map(() => {
        const now = DateTime.toEpochMillis(DateTime.unsafeNow());
        const min = now - MAX_AGE * MILLIS_PER_YEAR;
        return faker.date.between({ from: new Date(min), to: new Date(now) });
      }),
  })
) {}

/**
 * Namespace exposing helper types for {@link BirthDate}.
 *
 * @example
 * import type { BirthDate } from "@beep/schema/primitives/person/person-attributes";
 *
 * type Value = BirthDate.Type;
 *
 * @category Primitives/Misc/Person
 * @since 0.1.0
 */
export declare namespace BirthDate {
  /**
   * Runtime type for {@link BirthDate}.
   *
   * @example
   * import type { BirthDate } from "@beep/schema/primitives/person/person-attributes";
   *
   * let value: BirthDate.Type;
   *
   * @category Primitives/Misc/Person
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof BirthDate>;
  /**
   * Encoded representation for {@link BirthDate}.
   *
   * @example
   * import type { BirthDate } from "@beep/schema/primitives/person/person-attributes";
   *
   * let encoded: BirthDate.Encoded;
   *
   * @category Primitives/Misc/Person
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof BirthDate>;
}
