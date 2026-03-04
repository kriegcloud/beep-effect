/**
 * Category-selection service for version-sync.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import { Layer, ServiceMap } from "effect";
import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
import { VersionCategory, type VersionCategory as VersionCategoryValue, type VersionSyncOptions } from "../Models.js";

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
  const hasExplicitCategoryFilter = VersionCategory.$match(category, {
    bun: () => options.bunOnly,
    node: () => options.nodeOnly,
    docker: () => options.dockerOnly,
    biome: () => options.biomeOnly,
  });

  const hasAnyExplicitCategoryFilter = options.bunOnly || options.nodeOnly || options.dockerOnly || options.biomeOnly;

  return Bool.match(hasAnyExplicitCategoryFilter, {
    onFalse: () => true,
    onTrue: () => hasExplicitCategoryFilter,
  });
};

const selectedCategories: CategorySelectionServiceShape["selectedCategories"] = (options) =>
  A.filter(VersionCategory.Options, (category) => shouldCheck(options, category));

/**
 * Live layer for category-selection logic.
 *
 * @since 0.0.0
 * @category Layers
 */
export const CategorySelectionServiceLive = Layer.succeed(
  CategorySelectionService,
  CategorySelectionService.of({
    shouldCheck,
    selectedCategories,
  })
);
