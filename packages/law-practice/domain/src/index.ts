/**
 * Law-practice context domain models for the runtime proof.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { EntityIdValue } from "@beep/shared-domain/entity/EntityId";
import * as S from "effect/Schema";

/**
 * Legal client context.
 *
 * @category models
 * @since 0.0.0
 */
export class LegalClient extends S.Class<LegalClient>("@beep/law-practice-domain/LegalClient")({
  displayName: S.String,
  fixtureKey: S.String,
  id: EntityIdValue,
  status: S.String,
}) {}

/**
 * Legal contact context.
 *
 * @category models
 * @since 0.0.0
 */
export class LegalContact extends S.Class<LegalContact>("@beep/law-practice-domain/LegalContact")({
  displayName: S.String,
  fixtureKey: S.String,
  id: EntityIdValue,
  legalClientFixtureKey: S.String,
  role: S.String,
}) {}

/**
 * Legal matter context.
 *
 * @category models
 * @since 0.0.0
 */
export class Matter extends S.Class<Matter>("@beep/law-practice-domain/Matter")({
  displayName: S.String,
  fixtureKey: S.String,
  id: EntityIdValue,
  legalClientFixtureKey: S.String,
  matterType: S.String,
}) {}

/**
 * Patent asset context.
 *
 * @category models
 * @since 0.0.0
 */
export class PatentAsset extends S.Class<PatentAsset>("@beep/law-practice-domain/PatentAsset")({
  fixtureKey: S.String,
  id: EntityIdValue,
  matterFixtureKey: S.String,
  status: S.String,
  title: S.String,
}) {}
