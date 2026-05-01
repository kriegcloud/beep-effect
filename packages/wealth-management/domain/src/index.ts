/**
 * Wealth-management context domain models for the runtime proof.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { EntityIdValue } from "@beep/shared-domain/entity/EntityId";
import * as S from "effect/Schema";

/**
 * Household context.
 *
 * @category models
 * @since 0.0.0
 */
export class Household extends S.Class<Household>("@beep/wealth-management-domain/Household")({
  displayName: S.String,
  fixtureKey: S.String,
  id: EntityIdValue,
  status: S.String,
}) {}

/**
 * Wealth client context.
 *
 * @category models
 * @since 0.0.0
 */
export class WealthClient extends S.Class<WealthClient>("@beep/wealth-management-domain/WealthClient")({
  displayName: S.String,
  fixtureKey: S.String,
  householdFixtureKey: S.String,
  id: EntityIdValue,
  partyFixtureKey: S.String,
  status: S.String,
}) {}

/**
 * Party context.
 *
 * @category models
 * @since 0.0.0
 */
export class Party extends S.Class<Party>("@beep/wealth-management-domain/Party")({
  displayName: S.String,
  fixtureKey: S.String,
  id: EntityIdValue,
  partyType: S.String,
}) {}

/**
 * Account reference context.
 *
 * @category models
 * @since 0.0.0
 */
export class Account extends S.Class<Account>("@beep/wealth-management-domain/Account")({
  accountType: S.String,
  externalLabel: S.String,
  fixtureKey: S.String,
  householdFixtureKey: S.String,
  id: EntityIdValue,
}) {}
