import { $WebId } from "@beep/identity/packages";
import { GraphFactsResultSchema, GraphNodeDetailsSchema, GraphSearchResultSchema } from "./mappers";
import { GraphitiService } from "../graphiti/client";
import * as S from "effect/Schema";
import { Tool, Toolkit } from "effect/unstable/ai";

const $I = $WebId.create("lib/effect/tools");

export const SearchGraphScopeSchema = S.Literals(["nodes", "edges", "both"]).annotate(
  $I.annote("SearchGraphScopeSchema", {
    title: "Search Graph Scope",
    description: "Controls whether node-only, edge-only, or combined graph search should run.",
  })
);

export class SearchGraphParameters extends S.Class<SearchGraphParameters>($I`SearchGraphParameters`)(
  {
    query: S.NonEmptyString,
    scope: S.optionalKey(SearchGraphScopeSchema).pipe(S.withDecodingDefault(() => "both")),
    limit: S.optionalKey(S.Int.check(S.isGreaterThanOrEqualTo(1))).pipe(S.withDecodingDefault(() => 20)),
  },
  $I.annote("SearchGraphParametersSchema", {
    title: "Search Graph Parameters",
    description: "Input parameters for semantic graph search.",
  })
) {}

export class GetNodeParameters extends S.Class<GetNodeParameters>($I`GetNodeParameters`)(
  {
    nodeId: S.NonEmptyString,
  },
  $I.annote("GetNodeParametersSchema", {
    title: "Get Node Parameters",
    description: "Input parameters for retrieving a single node and its neighbors.",
  })
) {}

export const GetFactsParametersSchema = S.Struct({
  query: S.NonEmptyString,
  maxFacts: S.optionalKey(S.Int.check(S.isGreaterThanOrEqualTo(1))).pipe(S.withDecodingDefault(() => 20)),
}).annotate(
  $I.annote("GetFactsParametersSchema", {
    title: "Get Facts Parameters",
    description: "Input parameters for retrieving graph facts/relationships.",
  })
);

export type GetFactsParameters = typeof GetFactsParametersSchema.Type;

export const SearchGraph = Tool.make("SearchGraph", {
  description: "Search the Effect knowledge graph for entities and relationships.",
  parameters: SearchGraphParameters,
  success: GraphSearchResultSchema,
})
  .addDependency(GraphitiService)
  .annotate(Tool.Readonly, true);

export const GetNode = Tool.make("GetNode", {
  description: "Get a node with related neighbors and relationships.",
  parameters: GetNodeParameters,
  success: GraphNodeDetailsSchema,
})
  .addDependency(GraphitiService)
  .annotate(Tool.Readonly, true);

export const GetFacts = Tool.make("GetFacts", {
  description: "Search the graph for relationship facts matching a query.",
  parameters: GetFactsParametersSchema,
  success: GraphFactsResultSchema,
})
  .addDependency(GraphitiService)
  .annotate(Tool.Readonly, true);

export const KnowledgeGraphToolkit = Toolkit.make(SearchGraph, GetNode, GetFacts);
