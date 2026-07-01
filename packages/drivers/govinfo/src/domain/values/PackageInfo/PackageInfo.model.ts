/**
 * The PackageInfo value object module for the `@beep/govinfo` driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $GovinfoId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $GovinfoId.create("domain/values/PackageInfo/PackageInfo.model");

/**
 * The PackageInfo value object.
 *
 * @example
 * ```ts
 * import { PackageInfo } from "@beep/govinfo/domain/values/PackageInfo/PackageInfo.model";
 *
 * console.log(PackageInfo);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PackageInfo extends S.Class<PackageInfo>($I`PackageInfo`)(
  {
    /** Number of the Congress that produced the package, for congressional collections. */
    congress: S.String.annotateKey({
      description: "Number of the Congress that produced the package, for congressional collections.",
    }),

    /** Official publication date on which the package was issued. */
    dateIssued: S.DateTimeUtcFromString.annotateKey({
      description: "Official publication date on which the package was issued.",
    }),

    /** GovInfo document class code categorizing the type of document in the package. */
    docClass: S.String.annotateKey({
      description: "GovInfo document class code categorizing the type of document in the package.",
    }),

    /** Timestamp of the most recent modification to the package in GovInfo. */
    lastModified: S.DateTimeUtcFromString.annotateKey({
      description: "Timestamp of the most recent modification to the package in GovInfo.",
    }),

    /** GovInfo API URL linking to this package's summary resource. */
    packageLink: S.String.annotateKey({
      description: "GovInfo API URL linking to this package's summary resource.",
    }),

    /** Human-readable title of the package. */
    title: S.String.annotateKey({
      description: "Human-readable title of the package.",
    }),
  },
  $I.annote("PackageInfo", {
    description:
      "Package-level metadata for a GovInfo package as returned by the /packages/{id}/summary endpoint, covering its issuing Congress, issuance and modification dates, document class, API link, and title.",
  })
) {}

/**
 * The companion namespace for the {@link PackageInfo} value object.
 *
 * @category namespaces
 * @since 0.0.0
 */
export declare namespace PackageInfo {
  /**
   * The companion encoded type for {@link PackageInfo}.
   *
   * @example
   * ```ts
   * import type { PackageInfo } from "@beep/govinfo/domain/values/PackageInfo/PackageInfo.model";
   *
   * const useEncoded = (_value: PackageInfo.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof PackageInfo.Encoded;
}
