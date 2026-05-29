/**
 * Browser-safe Organization display contracts.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SharedUiId } from "@beep/identity/packages";
import { OptionFromOptionalNullishKey, Slug } from "@beep/schema";
import * as Organization from "@beep/shared-domain/entities/Organization/Organization.values";
import * as Shared from "@beep/shared-domain/identity/Shared";
import * as S from "effect/Schema";

const $I = $SharedUiId.create("entities/Organization/Organization.display");

/**
 * Browser-safe Organization display payload.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Display } from "@beep/shared-ui/entities/Organization/Organization.display"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const display = yield* S.decodeUnknownEffect(Display)({
 *     id: 1,
 *     legalName: "Acme Legal LLC",
 *     licenseTier: "team",
 *     name: "Acme",
 *     settings: {
 *       allowAgentActions: true,
 *       defaultRetentionDays: 90,
 *     },
 *     slug: "acme",
 *   })
 *   return display.name
 * })
 * console.log(program)
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
    parentOrgId: OptionFromOptionalNullishKey(Shared.OrganizationId, {
      onNoneEncoding: null,
    }),
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
 * import { Effect } from "effect"
 * import { Form } from "@beep/shared-ui/entities/Organization/Organization.display"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const form = yield* S.decodeUnknownEffect(Form)({
 *     legalName: "Acme Legal LLC",
 *     licenseTier: "team",
 *     name: "Acme",
 *     settings: {
 *       allowAgentActions: true,
 *       defaultRetentionDays: 90,
 *     },
 *     slug: "acme",
 *   })
 *   return form.slug
 * })
 * console.log(program)
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
    parentOrgId: OptionFromOptionalNullishKey(Shared.OrganizationId, {
      onNoneEncoding: null,
    }),
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
 * import { Effect } from "effect"
 * import {
 *   Display,
 *   primaryLabel,
 * } from "@beep/shared-ui/entities/Organization/Organization.display"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const display = yield* S.decodeUnknownEffect(Display)({
 *     id: 1,
 *     legalName: "Acme Legal LLC",
 *     licenseTier: "team",
 *     name: "Acme",
 *     settings: {
 *       allowAgentActions: true,
 *       defaultRetentionDays: 90,
 *     },
 *     slug: "acme",
 *   })
 *   return primaryLabel(display)
 * })
 * console.log(program)
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const primaryLabel = (organization: Pick<Display, "name">): string => organization.name;
