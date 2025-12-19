/**
 * @module list-users
 *
 * Handler implementation for the list-users endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type { Common } from "../../common";

type HandlerEffect = Common.UrlParamsHandlerEffect<V1.Admin.ListUsers.QueryParams>;

// Type guards for Better Auth enum values
const isSearchField = (s: string): s is "name" | "email" => s === "name" || s === "email";
const isSearchOperator = (s: string): s is "contains" | "starts_with" | "ends_with" =>
  s === "contains" || s === "starts_with" || s === "ends_with";
const isSortDirection = (s: string): s is "asc" | "desc" => s === "asc" || s === "desc";
const isFilterOperator = (s: string): s is "eq" | "ne" | "lt" | "lte" | "gt" | "gte" | "contains" =>
  s === "eq" || s === "ne" || s === "lt" || s === "lte" || s === "gt" || s === "gte" || s === "contains";

/**
 * Handler for the list-users endpoint.
 *
 * Calls Better Auth `auth.api.listUsers` to list users with optional filtering.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("ListUsers")(
  function* ({ urlParams, request }) {
    const auth = yield* Auth.Service;

    // Extract and validate enum values
    const searchField = F.pipe(
      urlParams.searchField,
      O.flatMap((s) => (isSearchField(s) ? O.some(s) : O.none())),
      O.getOrUndefined
    );

    const searchOperator = F.pipe(
      urlParams.searchOperator,
      O.flatMap((s) => (isSearchOperator(s) ? O.some(s) : O.none())),
      O.getOrUndefined
    );

    const sortDirection = F.pipe(
      urlParams.sortDirection,
      O.flatMap((s) => (isSortDirection(s) ? O.some(s) : O.none())),
      O.getOrUndefined
    );

    const filterOperator = F.pipe(
      urlParams.filterOperator,
      O.flatMap((s) => (isFilterOperator(s) ? O.some(s) : O.none())),
      O.getOrUndefined
    );

    const response = yield* Effect.tryPromise(() =>
      auth.api.listUsers({
        query: {
          searchValue: F.pipe(urlParams.searchValue, O.getOrUndefined),
          searchField,
          searchOperator,
          limit: F.pipe(urlParams.limit, O.getOrUndefined),
          offset: F.pipe(urlParams.offset, O.getOrUndefined),
          sortBy: F.pipe(urlParams.sortBy, O.getOrUndefined),
          sortDirection,
          filterField: F.pipe(urlParams.filterField, O.getOrUndefined),
          filterValue: F.pipe(urlParams.filterValue, O.getOrUndefined),
          filterOperator,
        },
        headers: request.headers,
      })
    );

    const decoded = yield* S.decodeUnknown(V1.Admin.ListUsers.Success)(response);
    return yield* HttpServerResponse.json(decoded);
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to list users.",
        cause: e,
      })
  )
);
