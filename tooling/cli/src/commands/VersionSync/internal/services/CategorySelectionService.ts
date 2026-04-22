/**
 * Category-selection service for version-sync.
 *
 * @module
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { Context, Layer, Match } from "effect";
import * as A from "effect/Array";
import {
  VersionCategoryOptions,
  type VersionCategory as VersionCategoryValue,
  type VersionSyncOptions,
} from "../Models.js";

const $I = $RepoCliId.create("commands/VersionSync/internal/services/CategorySelectionService");

/**
 * Service contract for selecting categories to resolve and update.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type CategorySelectionServiceShape = {
  readonly shouldCheck: (options: VersionSyncOptions, category: VersionCategoryValue) => boolean;
  readonly selectedCategories: (options: VersionSyncOptions) => ReadonlyArray<VersionCategoryValue>;
};

/**
 * Service tag for category-selection logic.
 *
 * @category PortContract
 * @since 0.0.0
 */
export class CategorySelectionService extends Context.Service<
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

  return !hasAnyExplicitCategoryFilter || hasExplicitCategoryFilter;
};

const selectedCategories: CategorySelectionServiceShape["selectedCategories"] = (options) =>
  A.filter(VersionCategoryOptions, (category) => shouldCheck(options, category));

/**
 * Live layer for category-selection logic.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const CategorySelectionServiceLive = Layer.succeed(
  CategorySelectionService,
  CategorySelectionService.of({
    shouldCheck,
    selectedCategories,
  })
);
