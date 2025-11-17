import { CustomId } from "@beep/schema/custom/_id";
import { NameAttribute } from "@beep/schema/custom/NameAttribute.schema";
import { faker } from "@faker-js/faker";
import * as S from "effect/Schema";

const Id = CustomId.compose("person");

export class FirstName extends NameAttribute.annotations(
  Id.annotations("FirstName", {
    description: "A person or users first name",
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.person.firstName()),
  })
) {}

export declare namespace FirstName {
  export type Type = S.Schema.Type<typeof FirstName>;
  export type Encoded = S.Schema.Encoded<typeof FirstName>;
}

export class LastName extends NameAttribute.annotations(
  Id.annotations("LastName", {
    description: "A person or users last name",
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.person.lastName()),
  })
) {}

export declare namespace LastName {
  export type Type = S.Schema.Type<typeof LastName>;
  export type Encoded = S.Schema.Encoded<typeof LastName>;
}

export class FullName extends NameAttribute.annotations(
  Id.annotations("FullName", {
    description: "A person or users full name",
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.person.fullName()),
  })
) {}

export declare namespace FullName {
  export type Type = S.Schema.Type<typeof FullName>;
  export type Encoded = S.Schema.Encoded<typeof FullName>;
}

export class MiddleName extends NameAttribute.annotations(
  Id.annotations("MiddleName", {
    description: "A person or users middle name",
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.person.middleName()),
  })
) {}

export declare namespace MiddleName {
  export type Type = S.Schema.Type<typeof MiddleName>;
  export type Encoded = S.Schema.Encoded<typeof MiddleName>;
}

// Helper: age in full years (UTC-safe)
const ageOn = (birth: Date, on: Date) => {
  let a = on.getUTCFullYear() - birth.getUTCFullYear();
  const m = on.getUTCMonth() - birth.getUTCMonth();
  if (m < 0 || (m === 0 && on.getUTCDate() < birth.getUTCDate())) a--;
  return a;
};

const MAX_AGE = 130;

export class BirthDate extends S.Date.pipe(
  // Not in the future (compute "now" at parse time, not at module load)
  S.filter((d) => d.getTime() <= Date.now(), {
    message: () => "birthDate cannot be in the future",
  }),
  // Plausibility guard (≤ 130 years old)
  S.filter((d) => ageOn(d, new Date()) <= MAX_AGE, {
    message: () => `age must be ≤ ${MAX_AGE}`,
  })
).annotations(
  Id.annotations("BirthDate", {
    description: "A person or users birth date",
    arbitrary: () => (fc) =>
      fc
        .constantFrom(null)
        .map(() =>
          faker.date.between({ from: new Date(Date.now() - MAX_AGE * 365 * 24 * 60 * 60 * 1000), to: new Date() })
        ),
  })
) {}

export declare namespace BirthDate {
  export type Type = S.Schema.Type<typeof BirthDate>;
  export type Encoded = S.Schema.Encoded<typeof BirthDate>;
}
