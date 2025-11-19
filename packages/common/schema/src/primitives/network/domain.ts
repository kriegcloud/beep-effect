/**
 * Domain string schemas for labels, TLDs, and full hostnames.
 *
 * Wraps lowercase/trimmed validation with regexes for domain labels and top-level domains.
 *
 * @example
 * import { DomainName } from "@beep/schema/primitives/network/domain";
 *
 * const domain = DomainName.make("example.com");
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
import * as regexes from "@beep/schema/internal/regex/regexes";
import { faker } from "@faker-js/faker";
import * as S from "effect/Schema";
import { Id } from "./_id";

/**
 * Schema ensuring a domain label (the segments between dots) is valid.
 *
 * @example
 * import { DomainLabel } from "@beep/schema/primitives/network/domain";
 *
 * const label = DomainLabel.make("api");
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export class DomainLabel extends S.Lowercase.pipe(
  S.maxLength(63, {
    message: () => "Domain label cannot exceed 63 characters.",
  }),
  S.nonEmptyString({ message: () => "Domain label cannot be empty." }),
  S.pattern(regexes.domain_label, {
    message: () => `Domain label must match ${regexes.domain_label.source}`,
  })
).annotations(
  Id.annotations("domain/DomainLabel", {
    description: "A valid DNS domain label (subdomain segment).",
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.internet.domainWord()),
  })
) {}

/**
 * Namespace describing runtime and encoded types for {@link DomainLabel}.
 *
 * @example
 * import type { DomainLabel } from "@beep/schema/primitives/network/domain";
 *
 * type Label = DomainLabel.Type;
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export declare namespace DomainLabel {
  /**
   * Runtime type alias for {@link DomainLabel}.
   *
   * @example
   * import type { DomainLabel } from "@beep/schema/primitives/network/domain";
   *
   * let label: DomainLabel.Type;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof DomainLabel>;
  /**
   * Encoded type alias for {@link DomainLabel}.
   *
   * @example
   * import type { DomainLabel } from "@beep/schema/primitives/network/domain";
   *
   * let encoded: DomainLabel.Encoded;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof DomainLabel>;
}

/**
 * Schema validating official top-level domains.
 *
 * @example
 * import { TopLevelDomain } from "@beep/schema/primitives/network/domain";
 *
 * const tld = TopLevelDomain.make("dev");
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export class TopLevelDomain extends S.Lowercase.pipe(
  S.nonEmptyString({ message: () => "Top level domain cannot be empty." }),
  S.minLength(2, {
    message: () => "Top level domain must be at least two characters.",
  }),
  S.pattern(regexes.top_level_domain, {
    message: () => `Top level domain must match ${regexes.top_level_domain.source}`,
  })
).annotations(
  Id.annotations("domain/TopLevelDomain", {
    description: "A valid top-level domain (TLD).",
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.internet.domainSuffix()),
  })
) {}

/**
 * Namespace for {@link TopLevelDomain} helper types.
 *
 * @example
 * import type { TopLevelDomain } from "@beep/schema/primitives/network/domain";
 *
 * type Tld = TopLevelDomain.Type;
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export declare namespace TopLevelDomain {
  /**
   * Runtime type alias for {@link TopLevelDomain}.
   *
   * @example
   * import type { TopLevelDomain } from "@beep/schema/primitives/network/domain";
   *
   * let tld: TopLevelDomain.Type;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof TopLevelDomain>;
  /**
   * Encoded type alias for {@link TopLevelDomain}.
   *
   * @example
   * import type { TopLevelDomain } from "@beep/schema/primitives/network/domain";
   *
   * let encoded: TopLevelDomain.Encoded;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof TopLevelDomain>;
}

/**
 * Schema validating complete domain names (lowercase, trimmed, dotted).
 *
 * @example
 * import { DomainName } from "@beep/schema/primitives/network/domain";
 *
 * const domain = DomainName.make("app.example.com");
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export class DomainName extends S.String.pipe(
  S.lowercased(),
  S.nonEmptyString({
    message: () => "Domain name cannot be empty.",
  }),
  S.trimmed({
    message: () => "Domain name cannot have leading or trailing whitespace.",
  }),
  S.maxLength(253, {
    message: () => "Domain name cannot exceed 253 characters.",
  }),
  S.pattern(regexes.domain, {
    message: () => `Domain name must match ${regexes.domain.source}`,
  })
).annotations(
  Id.annotations("domain/DomainName", {
    description: "A fully qualified domain name.",
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.internet.domainName()),
  })
) {}

/**
 * Namespace for {@link DomainName} helper types.
 *
 * @example
 * import type { DomainName } from "@beep/schema/primitives/network/domain";
 *
 * type Domain = DomainName.Type;
 *
 * @category Primitives/Network
 * @since 0.1.0
 */
export declare namespace DomainName {
  /**
   * Runtime type alias for {@link DomainName}.
   *
   * @example
   * import type { DomainName } from "@beep/schema/primitives/network/domain";
   *
   * let domain: DomainName.Type;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof DomainName>;
  /**
   * Encoded type alias for {@link DomainName}.
   *
   * @example
   * import type { DomainName } from "@beep/schema/primitives/network/domain";
   *
   * let encoded: DomainName.Encoded;
   *
   * @category Primitives/Network
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof DomainName>;
}
