import * as regexes from "@beep/schema/regexes";
import { faker } from "@faker-js/faker";
import * as S from "effect/Schema";
import { CustomId } from "./_id";

const Id = CustomId.compose("domain");
export class DomainLabel extends S.Lowercase.pipe(
  S.maxLength(63, {
    message: () => "Domain Label cannot be longer than 63 characters.",
  }),
  S.nonEmptyString({ message: () => "Domain Label cannot be empty." }),
  S.pattern(regexes.domain_label, {
    message: () => `Domain Label must match the regex ${regexes.domain_label.source}`,
  })
).annotations(
  Id.annotations("DomainLabel", {
    description: "A valid domain label",
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.internet.domainWord()),
  })
) {}

export declare namespace DomainLabel {
  export type Type = S.Schema.Type<typeof DomainLabel>;
  export type Encoded = S.Schema.Encoded<typeof DomainLabel>;
}

export class TopLevelDomain extends S.Lowercase.pipe(
  S.nonEmptyString({ message: () => "Top Level Domain cannot be empty." }),
  S.minLength(2, {
    message: () => "Top Level Domain must be at least 2 characters long.",
  }),
  S.pattern(regexes.top_level_domain, {
    message: () => `Top Level Domain must match the regex ${regexes.top_level_domain.source}`,
  })
).annotations(
  Id.annotations("TopLevelDomain", {
    description: "A valid top level domain",
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.internet.domainSuffix()),
  })
) {}

export declare namespace TopLevelDomain {
  export type Type = S.Schema.Type<typeof TopLevelDomain>;
  export type Encoded = S.Schema.Encoded<typeof TopLevelDomain>;
}

export class DomainName extends S.String.pipe(
  S.lowercased(),
  S.nonEmptyString({
    message: () => "Domain Name cannot be empty.",
  }),
  S.trimmed({
    message: () => "Domain Name cannot contain leading or trailing whitespace.",
  }),
  S.maxLength(253, {
    message: () => "Domain Name cannot be longer than 253 characters.",
  }),
  S.pattern(regexes.domain, {
    message: () => `Domain Name must match the regex ${regexes.domain.source}`,
  })
).annotations(
  Id.annotations("DomainName", {
    description: "A valid domain name",
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.internet.domainName()),
  })
) {}
