/**
 * Browser-safe Organization display contracts.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SharedUiId } from "@beep/identity/packages";
import { Slug } from "@beep/schema";
import * as Organization from "@beep/shared-domain/entities/Organization/Organization.values";
import * as Shared from "@beep/shared-domain/identity/Shared";
import * as S from "effect/Schema";

const $I = $SharedUiId.create("entities/Organization/Organization.display");

/**
 * Browser-safe Organization display payload.
 *
 * @example
 * ```ts
 * import { Display } from "@beep/shared-ui/entities/Organization/Organization.display"
 * import * as S from "effect/Schema"
 *
 * const display = S.decodeUnknownSync(Display)({
 *   id: 1,
 *   legalName: "Acme Legal LLC",
 *   licenseTier: "team",
 *   name: "Acme",
 *   settings: {
 *     allowAgentActions: true,
 *     defaultRetentionDays: 90,
 *   },
 *   slug: "acme",
 * })
 * console.log(display.name)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Display extends S.Class<Display>($I`Display`)(
  {
    id: Shared.OrganizationId,
    legalName: S.NonEmptyString,
    licenseTier: Organization.LicenseTier,
    name: S.NonEmptyString,
    parentOrgId: S.OptionFromOptionalKey(Shared.OrganizationId),
    settings: Organization.Settings,
    slug: Slug,
  },
  $I.annote("Display", {
    description: "Browser-safe display payload for a shared Organization.",
  })
) {}

/**
 * Browser-safe Organization form payload.
 *
 * @example
 * ```ts
 * import { Form } from "@beep/shared-ui/entities/Organization/Organization.display"
 * import * as S from "effect/Schema"
 *
 * const form = S.decodeUnknownSync(Form)({
 *   legalName: "Acme Legal LLC",
 *   licenseTier: "team",
 *   name: "Acme",
 *   settings: {
 *     allowAgentActions: true,
 *     defaultRetentionDays: 90,
 *   },
 *   slug: "acme",
 * })
 * console.log(form.slug)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Form extends S.Class<Form>($I`Form`)(
  {
    legalName: S.NonEmptyString,
    licenseTier: Organization.LicenseTier,
    name: S.NonEmptyString,
    parentOrgId: S.OptionFromOptionalKey(Shared.OrganizationId),
    settings: Organization.Settings,
    slug: Slug,
  },
  $I.annote("Form", {
    description: "Browser-safe form payload for creating or editing a shared Organization profile.",
  })
) {}

/**
 * Primary display label for an Organization.
 *
 * @example
 * ```ts
 * import {
 *   Display,
 *   primaryLabel,
 * } from "@beep/shared-ui/entities/Organization/Organization.display"
 * import * as S from "effect/Schema"
 *
 * const display = S.decodeUnknownSync(Display)({
 *   id: 1,
 *   legalName: "Acme Legal LLC",
 *   licenseTier: "team",
 *   name: "Acme",
 *   settings: {
 *     allowAgentActions: true,
 *     defaultRetentionDays: 90,
 *   },
 *   slug: "acme",
 * })
 * console.log(primaryLabel(display))
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const primaryLabel = (organization: Pick<Display, "name">): string => organization.name;
