/**
 * Page repository contract (domain).
 *
 * This module intentionally lives in the domain package:
 * - Slice server packages implement this contract against the real database.
 * - Domain code can depend on the *shape* of persistence without importing server layers.
 *
 * Custom repo methods should prefer schema-derived signatures (`DbRepo.Method`) so
 * payload/success types and required schema contexts stay mechanically consistent.
 *
 * @module documents-domain/entities/Page/Page.repo
 * @since 1.0.0
 * @category repos
 */
import { $WorkspacesDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as S from "effect/Schema";
import type {
  Archive,
  Breadcrumbs,
  Create,
  Delete,
  Get,
  List,
  ListChildren,
  ListTrash,
  Lock,
  Move,
  Publish,
  Restore,
  Search,
  Unlock,
  UnPublish,
  Update,
} from "./contracts";
import type * as Page from "./Page.model";

const $I = $WorkspacesDomainId.create("entities/Page/Page.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof Page.Model,
  {
    /**
     * Retrieve a single page by id.
     *
     * @since 1.0.0
     * @category repos
     */
    readonly get: DbRepo.Method<{
      payload: typeof Get.Payload;
      success: typeof Get.Success;
      failure: typeof Get.Failure;
    }>;

    /**
     * Cursor-paginated listing of pages for an organization.
     *
     * @since 1.0.0
     * @category repos
     */
    readonly list: DbRepo.Method<{
      payload: typeof List.Payload;
      success: typeof List.Success;
    }>;

    /**
     * Cursor-paginated listing of child pages for a given parent.
     *
     * @since 1.0.0
     * @category repos
     */
    readonly listChildren: DbRepo.Method<{
      payload: typeof ListChildren.Payload;
      success: typeof ListChildren.Success;
    }>;

    /**
     * Cursor-paginated listing of archived/trashed pages.
     *
     * @since 1.0.0
     * @category repos
     */
    readonly listTrash: DbRepo.Method<{
      payload: typeof ListTrash.Payload;
      success: typeof ListTrash.Success;
    }>;

    /**
     * Full-text search of pages within an organization.
     *
     * @since 1.0.0
     * @category repos
     */
    readonly search: DbRepo.Method<{
      payload: typeof Search.Payload;
      success: typeof Search.Success;
    }>;

    /**
     * Create a new page.
     *
     * @since 1.0.0
     * @category repos
     */
    readonly create: DbRepo.Method<{
      payload: typeof Create.Payload;
      success: typeof Create.Success;
      failure: typeof Create.Failure;
    }>;

    /**
     * Update an existing page.
     *
     * @since 1.0.0
     * @category repos
     */
    readonly updatePage: DbRepo.Method<{
      payload: typeof Update.Payload;
      success: typeof Update.Success;
      failure: typeof Update.Failure;
    }>;

    /**
     * Soft-delete (archive) a page by id.
     *
     * @since 1.0.0
     * @category repos
     */
    readonly archive: DbRepo.Method<{
      payload: typeof Archive.Payload;
      success: typeof Archive.Success;
      failure: typeof Archive.Failure;
    }>;

    /**
     * Restore a previously archived page.
     *
     * @since 1.0.0
     * @category repos
     */
    readonly restore: DbRepo.Method<{
      payload: typeof Restore.Payload;
      success: typeof Restore.Success;
      failure: typeof Restore.Failure;
    }>;

    /**
     * Lock a page to prevent further edits.
     *
     * @since 1.0.0
     * @category repos
     */
    readonly lock: DbRepo.Method<{
      payload: typeof Lock.Payload;
      success: typeof Lock.Success;
      failure: typeof Lock.Failure;
    }>;

    /**
     * Unlock a previously locked page.
     *
     * @since 1.0.0
     * @category repos
     */
    readonly unlock: DbRepo.Method<{
      payload: typeof Unlock.Payload;
      success: typeof Unlock.Success;
      failure: typeof Unlock.Failure;
    }>;

    /**
     * Move a page to a new parent and/or position.
     *
     * Implementations should validate against cyclic nesting.
     *
     * @since 1.0.0
     * @category repos
     */
    readonly move: DbRepo.Method<{
      payload: typeof Move.Payload;
      success: typeof Move.Success;
      failure: typeof Move.Failure;
    }>;

    /**
     * Publish a page for public access.
     *
     * @since 1.0.0
     * @category repos
     */
    readonly publish: DbRepo.Method<{
      payload: typeof Publish.Payload;
      success: typeof Publish.Success;
      failure: typeof Publish.Failure;
    }>;

    /**
     * Revoke public access to a page.
     *
     * @since 1.0.0
     * @category repos
     */
    readonly unPublish: DbRepo.Method<{
      payload: typeof UnPublish.Payload;
      success: typeof UnPublish.Success;
      failure: typeof UnPublish.Failure;
    }>;

    /**
     * Stream breadcrumb ancestry for a given page.
     *
     * @since 1.0.0
     * @category repos
     */
    readonly breadcrumbs: DbRepo.Method<{
      payload: typeof Breadcrumbs.Payload;
      success: typeof Breadcrumbs.Success;
      failure: typeof Breadcrumbs.Failure;
    }>;

    /**
     * Permanently delete a page by id.
     *
     * @since 1.0.0
     * @category repos
     */
    readonly hardDelete: DbRepo.Method<{
      payload: typeof Delete.Payload;
      success: typeof S.Void;
      failure: typeof Delete.Failure;
    }>;
  }
>;

/**
 * Page repository service tag.
 *
 * Base CRUD methods come from `DbRepo.DbRepoSuccess<typeof Page.Model, ...>`.
 *
 * @since 1.0.0
 * @category repos
 */
export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
