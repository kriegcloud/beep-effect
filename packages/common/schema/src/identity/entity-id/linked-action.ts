import type { StringTypes } from "@beep/types";
import { ArrayUtils } from "@beep/utils";
import type * as A from "effect/Array";
import * as Str from "effect/String";
import type * as EntityId from "./entity-id";

export type ConcatedAction<
  EntityIdentifier extends StringTypes.NonEmptyString,
  Action extends StringTypes.NonEmptyString,
> = `${Lowercase<EntityIdentifier>}:${Lowercase<Action>}`;

export const concatAction =
  <EntityIdentifier extends StringTypes.NonEmptyString>(entityIdentifier: EntityIdentifier) =>
  <Action extends StringTypes.NonEmptyString>(action: Action): ConcatedAction<EntityIdentifier, Action> => {
    const normalizedIdentifier = Str.toLowerCase(entityIdentifier);
    const normalizedAction = Str.toLowerCase(action);
    return Str.concat(`${normalizedIdentifier}:` as const, normalizedAction);
  };

export type ApplyActions<
  EntityIdentifier extends StringTypes.NonEmptyString,
  CustomActions extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>,
> = A.NonEmptyReadonlyArray<ConcatedAction<EntityIdentifier, CustomActions[number]>>;

export const applyActions =
  <EntityIdentifier extends StringTypes.NonEmptyString>(entityIdentifier: EntityIdentifier) =>
  <CustomActions extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>>(
    ...customActions: CustomActions
  ): ApplyActions<EntityIdentifier, CustomActions> => {
    const concat = concatAction(entityIdentifier);

    return ArrayUtils.NonEmptyReadonly.mapNonEmpty(customActions, concat);
  };

export const associateEntityActions =
  <
    const TableName extends StringTypes.NonEmptyString,
    const Brand extends string,
    const LinkedActions extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>,
  >(
    entityId: EntityId.EntityId<TableName, Brand, LinkedActions>
  ) =>
  <CustomActions extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>>(customActions: CustomActions) =>
    applyActions(entityId.tableName)(...customActions);
