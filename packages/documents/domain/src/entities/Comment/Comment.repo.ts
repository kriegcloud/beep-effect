/**
 * Comment repository contract (domain).
 *
 * This module intentionally lives in the domain package:
 * - Slice server packages implement this contract against the real database.
 * - Domain code can depend on the *shape* of persistence without importing server layers.
 *
 * Custom repo methods should prefer schema-derived signatures (`DbRepo.Method`) so
 * payload/success types and required schema contexts stay mechanically consistent.
 *
 * @module documents-domain/entities/Comment/Comment.repo
 * @since 1.0.0
 * @category repos
 */
import { $DocumentsDomainId } from "@beep/identity/packages";
import { DocumentsEntityIds } from "@beep/shared-domain";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import * as S from "effect/Schema";
import * as Comment from "./Comment.model";
import type { Get } from "./contracts";

const $I = $DocumentsDomainId.create("entities/Comment/Comment.repo");

const ListByDiscussionPayload = S.Struct({
  discussionId: DocumentsEntityIds.DiscussionId,
});

const ListByDiscussionSuccess = S.Array(Comment.Model);

/**
 * Comment repository service tag.
 *
 * Base CRUD methods come from `DbRepo.DbRepoSuccess<typeof Comment.Model, ...>`.
 *
 * @since 1.0.0
 * @category repos
 */
export class Repo extends Context.Tag($I`Repo`)<
  Repo,
  DbRepo.DbRepoSuccess<
    typeof Comment.Model,
    {
      /**
       * List all comments for a discussion.
       *
       * @since 1.0.0
       * @category repos
       */
      readonly listByDiscussion: DbRepo.Method<{
        payload: typeof ListByDiscussionPayload;
        success: typeof ListByDiscussionSuccess;
      }>;

      /**
       * Update comment content (implementations typically set `isEdited = true`).
       *
       * `Get.Failure` is intentionally included to document the desired behavior:
       * implementations should translate "missing row" into a typed not-found error
       * rather than defecting.
       *
       * @since 1.0.0
       * @category repos
       */
      readonly updateContent: DbRepo.Method<{
        payload: typeof Comment.Model.update;
        success: typeof Comment.Model;
        failure: typeof Get.Failure;
      }>;

      /**
       * Hard delete a comment by id.
       *
       * @since 1.0.0
       * @category repos
       */
      readonly hardDelete: DbRepo.Method<{
        payload: typeof DocumentsEntityIds.CommentId;
        success: typeof S.Void;
      }>;
    }
  >
>() {}
