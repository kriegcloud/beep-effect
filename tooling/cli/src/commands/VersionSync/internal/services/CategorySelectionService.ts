/**
 * Category-selection service for version-sync.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import { thunkTrue } from "@beep/utils";
import { Layer, Match, ServiceMap } from "effect";
import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
import {
  VersionCategoryOptions,
  type VersionCategory as VersionCategoryValue,
  type VersionSyncOptions,
} from "../Models.js";

const $I = $RepoCliId.create("commands/VersionSync/internal/services/CategorySelectionService");

/**
 * Service contract for selecting categories to resolve and update.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CategorySelectionServiceShape = {
  readonly shouldCheck: (options: VersionSyncOptions, category: VersionCategoryValue) => boolean;
  readonly selectedCategories: (options: VersionSyncOptions) => ReadonlyArray<VersionCategoryValue>;
};

/**
 * Service tag for category-selection logic.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class CategorySelectionService extends ServiceMap.Service<
  CategorySelectionService,
  CategorySelectionServiceShape
>()($I`CategorySelectionService`) {}

const shouldCheck: CategorySelectionServiceShape["shouldCheck"] = (options, category) => {
  const hasExplicitCategoryFilter = Match.value(category).pipe(
    Match.when("bun", () => options.bunOnly),
    Match.when("node", () => options.nodeOnly),
    Match.when("docker", () => options.dockerOnly),
    Match.when("biome", () => options.biomeOnly),
    Match.when("effect", () => options.effectOnly),
    Match.exhaustive
  );

  const hasAnyExplicitCategoryFilter =
    options.bunOnly || options.nodeOnly || options.dockerOnly || options.biomeOnly || options.effectOnly;

  return Bool.match(hasAnyExplicitCategoryFilter, {
    onFalse: thunkTrue,
    onTrue: () => hasExplicitCategoryFilter,
  });
};

const selectedCategories: CategorySelectionServiceShape["selectedCategories"] = (options) =>
  A.filter(VersionCategoryOptions, (category) => shouldCheck(options, category));

/**
 * Live layer for category-selection logic.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const CategorySelectionServiceLive = Layer.succeed(
  CategorySelectionService,
  CategorySelectionService.of({
    shouldCheck,
    selectedCategories,
  })
);
