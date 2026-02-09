import {$SemanticWebId} from "@beep/identity/packages";
import {BS} from "@beep/schema";
import * as S from "effect/Schema";

const $I = $SemanticWebId.create("values");

export class ModelType extends BS.StringLiteralKit(
  "Variable",
  "Quad",
  "NamedNode",
  "Literal",
  "DefaultGraph",
  "BlankNode",
).annotations($I.annotations(
  "ModelType",
  {
    description: "Represents the type of a model in the RDF model."
  }
)) {
  static readonly makeKind = ModelType.toTagged("termType").composer({});
}

export declare namespace ModelType {
  export type Type = typeof ModelType.Type;
}

/**
 * triple term names.
 */
export class TripleTermName extends BS.StringLiteralKit(
  "subject",
  "predicate",
  "object"
).annotations(
  $I.annotations(
    "TripleTermName",
    {
      description: "A triple term name."
    }
  )
) {
}

export declare namespace TripleTermName {
  export type Type = typeof TripleTermName.Type;
}

export class QuadTermName extends BS.StringLiteralKit(
  ...TripleTermName.Options,
  "graph"
).annotations(
  $I.annotations(
    "QuadTermName",
    {
      description: "A quad term name."
    }
  )
) {
}

export declare namespace QuadTermName {
  export type Type = typeof QuadTermName.Type;
}

/**
 * QueryOperationCost represents the cost of a given query operation.
 */
export class QueryOperationCostValue extends S.Struct(
  {
    /**
     * An estimation of how many iterations over items are executed.
     * This is used to determine the CPU cost.
     */
    iterations: S.NonNegativeInt.annotations({
      description: "An estimation of how many iterations over items are executed.",
      documentation: "This is used to determine the CPU cost."
    }),
    /**
     * An estimation of how many items are stored in memory.
     * This is used to determine the memory cost.
     */
    persistedItems: S.NonNegativeInt.annotations({
      description: "An estimation of how many items are stored in memory.",
      documentation: "This is used to determine the memory cost."
    }),
    /**
     * An estimation of how many items block the stream.
     * This is used to determine the time the stream is not progressing anymore.
     */
    blockingItems: S.NonNegativeInt.annotations({
      description: "An estimation of how many items block the stream.",

    }),
    /**
     * An estimation of the time to request items from sources.
     * This is used to determine the I/O cost.
     */
    requestTime: S.DurationFromMillis,
  },
  /**
   * Custom properties
   */
  S.Record({key: S.String, value: S.Any})
).annotations($I.annotations("QueryOperationCostValue", {
  description: "value of the cost of a given query operation."
})) {
}

export declare namespace QueryOperationCostValue {
  export type Type = typeof QueryOperationCostValue.Type;
}


export class QueryOperationCost extends S.Class<QueryOperationCost>($I`QueryOperationCost`)(
  {
    value: QueryOperationCostValue,
  },
  $I.annotations(
    "QueryOperationCost",
    {
      description: "represents the cost of a given query operation."
    }
  )
) {
}

/**
 * indicates the type of counting that was done, and MUST either be "estimate" or "exact".
 */
export class QueryResultCardinalityType extends BS.StringLiteralKit(
  "estimate",
  "exact"
).annotations(
  $I.annotations(
    "QueryResultCardinalityType",
    {
      description: "indicates the type of counting that was done, and MUST either be \"estimate\" or \"exact\"."
    }
  )
) {

}

export declare namespace QueryResultCardinalityType {
  export type Type = typeof QueryResultCardinalityType.Type;
}
const makeQueryResultCardinalityKind = QueryResultCardinalityType.toTagged("type").composer({
  /**
   * Indicates an estimated of the number of results in the stream if type = "estimate",
   * or the exact number of results in the stream if type = "exact".
   */
  value: S.NonNegativeInt,
});

export class QueryResultCardinalityEstimate extends S.Class<QueryResultCardinalityEstimate>($I`QueryResultCardinalityEstimate`)(
  makeQueryResultCardinalityKind.estimate({}),
  $I.annotations(
    "QueryResultCardinalityEstimate",
    {
      description: "represents the estimated number of results of a given query operation."
    }
  )
) {
}

export class QueryResultCardinalityExact extends S.Class<QueryResultCardinalityExact>($I`QueryResultCardinalityExact`)(
  makeQueryResultCardinalityKind.exact({}),
  $I.annotations(
    "QueryResultCardinalityExact",
    {
      description: "represents the exact number of results of a given query operation."
    }
  )
) {
}

/**
 * QueryResultCardinality represents the number of results, which can either be an estimate or exact value.
 */
export class QueryResultCardinality extends S.Union(
  QueryResultCardinalityExact,
  QueryResultCardinalityEstimate,
).annotations(
  $I.annotations(
    "QueryResultCardinality",
    {
      description: "QueryResultCardinality represents the number of results, which can either be an estimate or exact value."
    }
  )
) {
}

export declare namespace QueryResultCardinality {
  export type Type = typeof QueryResultCardinality.Type;
  export type Encoded = typeof QueryResultCardinality.Encoded;
}
const LiteralTrue = S.Literal(true)
export class CardinalityMetadataSupport extends S.Class<CardinalityMetadataSupport>($I`CardinalityMetadataSupport`)(
  {
    cardinality: LiteralTrue,
  },
  $I.annotations(
    "CardinalityMetadataSupport",
    {
      description: "indicates that the query result cardinality is supported."
    }
  )
) {}

export class OrderMetadataSupport extends S.Class<OrderMetadataSupport>($I`OrderMetadataSupport`)(
  {
    order: LiteralTrue
  },
  $I.annotations(
    "OrderMetadataSupport",
    {
      description: "indicates that the query result order is supported."
    }
  )
) {}

export class AvailableOrdersMetadataSupport extends S.Class<AvailableOrdersMetadataSupport>($I`AvailableOrdersMetadataSupport`)(
  {
    availableOrders: LiteralTrue
  },
  $I.annotations(
    "AvailableOrdersMetadataSupport",
    {
      description: "indicates that the query result available orders is supported."
    }
  )
) {}

export class AllMetadataSupport extends S.Class<AllMetadataSupport>($I`AllMetadataSupport`)(
  {
    ...AvailableOrdersMetadataSupport.fields,
    ...CardinalityMetadataSupport.fields,
    ...OrderMetadataSupport.fields,
  },
  $I.annotations(
    "AllMetadataSupport",
    {
      description: "indicates that the query result all metadata is supported."
    }
  )
) {}

export class CardinalityMetadataOpts extends S.Class<CardinalityMetadataOpts>($I`CardinalityMetadataOpts`)(
  {
    cardinality: QueryResultCardinalityType,
  },
  $I.annotations(
    "CardinalityMetadataOpts",
    {
      description: "indicates the type of counting that was done, and MUST either be \"estimate\" or \"exact\"."
    }
  )
) {}

export class OrderMetadataOpts extends OrderMetadataSupport.extend<OrderMetadataOpts>($I`OrderMetadataOpts`)(
  {},
  $I.annotations(
    "OrderMetadataOpts",
    {
      description: "options for the order of the query result."
    }
  )
) {}

export class AvailableOrdersMetadataOpts extends AvailableOrdersMetadataSupport.extend<AvailableOrdersMetadataOpts>($I`AvailableOrdersMetadataOpts`)(
  {},
  $I.annotations(
    "AvailableOrdersMetadataOpts",
    {
      description: "options for the available orders of the query result."
    }
  )
) {}