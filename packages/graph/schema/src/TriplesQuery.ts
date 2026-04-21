/**
 * Triples query request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { $GraphSchemaId } from "@beep/identity";
import * as S from "effect/Schema";

import { Term, TgError, Triple } from "./Primitives.ts";

const $I = $GraphSchemaId.create("TriplesQuery");

/**
 * Request payload for querying triples from the graph store.
 *
 * @since 0.1.0
 * @category models
 */
export class TriplesQueryRequest extends S.Class<TriplesQueryRequest>($I`TriplesQueryRequest`)({
  s: S.OptionFromOptionalKey(Term).annotateKey({
    description: "Optional subject term used to constrain the triple query.",
  }),
  p: S.OptionFromOptionalKey(Term).annotateKey({
    description: "Optional predicate term used to constrain the triple query.",
  }),
  o: S.OptionFromOptionalKey(Term).annotateKey({
    description: "Optional object term used to constrain the triple query.",
  }),
  collection: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Optional collection identifier used to scope the query.",
  }),
  limit: S.OptionFromOptionalKey(S.Number).annotateKey({
    description: "Optional maximum number of triples to return.",
  }),
}, $I.annote("TriplesQueryRequest", {
  description: "Request payload for querying triples from the graph store.",
})) {}

/**
 * Response payload for querying triples from the graph store.
 *
 * @since 0.1.0
 * @category models
 */
export class TriplesQueryResponse extends S.Class<TriplesQueryResponse>($I`TriplesQueryResponse`)({
  triples: S.Array(Triple).annotateKey({
    description: "Triples returned by the graph query.",
  }),
  error: S.OptionFromOptionalKey(TgError).annotateKey({
    description: "Embedded error payload when the query fails.",
  }),
}, $I.annote("TriplesQueryResponse", {
  description: "Response payload for querying triples from the graph store.",
})) {}
