/**
 * Collection management request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { $GraphSchemaId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { pipe, Tuple } from "effect";
import * as S from "effect/Schema";

import { TgError } from "./Primitives.ts";

const $I = $GraphSchemaId.create("Collection");

/**
 * Collection-management commands supported by the graph control plane.
 *
 * @since 0.1.0
 * @category models
 */
export const CollectionOperation = LiteralKit(["list-collections", "update-collection", "delete-collection"] as const).pipe(
  $I.annoteSchema("CollectionOperation", {
    description: "Collection-management commands supported by the graph control plane.",
  }),
);

/**
 * Type for {@link CollectionOperation}. {@inheritDoc CollectionOperation}
 *
 * @category models
 * @since 0.1.0
 */
export type CollectionOperation = typeof CollectionOperation.Type;

class CollectionEntry extends S.Class<CollectionEntry>($I`CollectionEntry`)({
  user: S.String.annotateKey({
    description: "Owner or tenant for the collection.",
  }),
  collection: S.String.annotateKey({
    description: "Stable collection identifier.",
  }),
  name: S.String.annotateKey({
    description: "Human-readable collection name.",
  }),
  description: S.String.annotateKey({
    description: "Human-readable description of the collection.",
  }),
  tags: S.Array(S.String).annotateKey({
    description: "Tags associated with the collection.",
  }),
}, $I.annote("CollectionEntry", {
  description: "Collection metadata entry returned by management queries.",
})) {}

const makeCollectionManagementRequest = <TOperation extends CollectionOperation>(literal: S.Literal<TOperation>) =>
  S.Struct({
    operation: S.tag(literal.literal).annotateKey({
      description: "Collection-management operation to perform.",
    }),
    user: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional user or tenant scope for the operation.",
    }),
    collection: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional collection identifier targeted by the operation.",
    }),
    name: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional collection name for create or update flows.",
    }),
    description: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional collection description for create or update flows.",
    }),
    tags: S.OptionFromOptionalKey(S.Array(S.String)).annotateKey({
      description: "Optional collection tags for create or update flows.",
    }),
  });

/**
 * Request payload for collection-management operations.
 *
 * @since 0.1.0
 * @category models
 */
export const CollectionManagementRequest = CollectionOperation.mapMembers((members) =>
  pipe(members, Tuple.evolve([makeCollectionManagementRequest, makeCollectionManagementRequest, makeCollectionManagementRequest]))
).pipe(
  S.toTaggedUnion("operation"),
  $I.annoteSchema("CollectionManagementRequest", {
    description: "Request payload for collection-management operations.",
  }),
);

/**
 * Type for {@link CollectionManagementRequest}. {@inheritDoc CollectionManagementRequest}
 *
 * @category models
 * @since 0.1.0
 */
export type CollectionManagementRequest = typeof CollectionManagementRequest.Type;

/**
 * Response payload for collection-management operations.
 *
 * @since 0.1.0
 * @category models
 */
export class CollectionManagementResponse extends S.Class<CollectionManagementResponse>($I`CollectionManagementResponse`)({
  error: S.OptionFromOptionalKey(TgError).annotateKey({
    description: "Embedded error payload when the collection operation fails.",
  }),
  collections: S.OptionFromOptionalKey(S.Array(CollectionEntry)).annotateKey({
    description: "Collection metadata returned for list operations.",
  }),
}, $I.annote("CollectionManagementResponse", {
  description: "Response payload for collection-management operations.",
})) {}
