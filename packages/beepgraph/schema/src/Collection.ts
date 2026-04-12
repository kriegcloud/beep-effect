/**
 * Collection management request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { Schema } from "effect";

import { TgError } from "./Primitives.ts";

export const CollectionOperation = Schema.Literals(["list-collections", "update-collection", "delete-collection"]);

export type CollectionOperation = typeof CollectionOperation.Type;

export const CollectionManagementRequest = Schema.Struct({
  operation: CollectionOperation,
  user: Schema.optionalKey(Schema.String),
  collection: Schema.optionalKey(Schema.String),
  name: Schema.optionalKey(Schema.String),
  description: Schema.optionalKey(Schema.String),
  tags: Schema.optionalKey(Schema.Array(Schema.String)),
});

export type CollectionManagementRequest = typeof CollectionManagementRequest.Type;

const CollectionEntry = Schema.Struct({
  user: Schema.String,
  collection: Schema.String,
  name: Schema.String,
  description: Schema.String,
  tags: Schema.Array(Schema.String),
});

export const CollectionManagementResponse = Schema.Struct({
  error: Schema.optionalKey(TgError),
  collections: Schema.optionalKey(Schema.Array(CollectionEntry)),
});

export type CollectionManagementResponse = typeof CollectionManagementResponse.Type;
