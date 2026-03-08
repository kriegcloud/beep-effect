import type * as RDF from '@rdfjs/types';
import type { Algebra } from '../index.js';
import { types } from '../toAlgebra/index.js';
import type { AstIndir } from './core.js';

/**
 * Removes quad component of triple and ...
 */
export const removeAlgQuads: AstIndir<'removeQuads', Algebra.Operation, [Algebra.Operation]> = {
  name: 'removeQuads',
  fun: ({ SUBRULE }) => (_, op) =>
    <typeof op>SUBRULE(removeAlgQuadsRecursive, op, []),
};

/**
 * Removes quad component of triples and wrap found bgps in Algebra.GraphOperations
 * Mainly returns same type as first arg
 */
export const removeAlgQuadsRecursive: AstIndir<
  'removeQuadsRecursive',
unknown,
[unknown, (RDF.NamedNode | RDF.DefaultGraph)[]]
> = {
  name: 'removeQuadsRecursive',
  fun: ({ SUBRULE }) => ({ algebraFactory: AF }, unknownVal, graphs) => {
    if (Array.isArray(unknownVal)) {
      return unknownVal.map(sub => SUBRULE(removeAlgQuadsRecursive, sub, graphs));
    }

    if (typeof unknownVal !== 'object' || unknownVal === null || !('type' in unknownVal) || !unknownVal.type) {
      return unknownVal;
    }
    const knownOp = <Algebra.Operation> unknownVal;

    // UPDATE operations with Patterns handle graphs a bit differently - do not traverse
    if (knownOp.type === types.DELETE_INSERT) {
      return unknownVal;
    }

    // If triple or path register graph and return - graphs will be populated by in order graph occurrence
    if ((knownOp.type === types.PATTERN || knownOp.type === types.PATH) && knownOp.graph) {
      const graph = <RDF.NamedNode | RDF.DefaultGraph> knownOp.graph;
      // We create a list that tracks, for each pattern the original graph and remove the graph
      graphs.push(graph);
      // Remove non-default graphs
      if (graph.value !== '') {
        return knownOp.type === types.PATTERN ?
          AF.createPattern(knownOp.subject, knownOp.predicate, knownOp.object) :
          AF.createPath(knownOp.subject, knownOp.predicate, knownOp.object);
      }
      return knownOp;
    }

    // We build our `op` again.
    const result: any = {};
    // Unique graphs per key (keyof T)
    const keyGraphs: Record<string, (RDF.NamedNode | RDF.DefaultGraph)[]> = {};
    // Track all the unique graph names for the entire Operation
    const operationGraphNames: Record<string, RDF.NamedNode | RDF.DefaultGraph> = {};
    for (const [ key, value ] of Object.entries(knownOp)) {
      const newGraphs: (RDF.NamedNode | RDF.DefaultGraph)[] = [];
      result[key] = SUBRULE(removeAlgQuadsRecursive, value, newGraphs);

      // If a graph was registered, we register the discovery we did at this key of the object
      //  and create graph identifier map
      if (newGraphs.length > 0) {
        keyGraphs[key] = newGraphs;
        for (const graph of newGraphs) {
          operationGraphNames[graph.value] = graph;
        }
      }
    }

    const graphNameSet = Object.keys(operationGraphNames);
    // Finally, if we found graphs at some keys, wrap those keys in Algebra.graphOperations
    if (graphNameSet.length > 0) {
      // We also need to create graph statement if we are at the edge of certain operations
      if (graphNameSet.length === 1 && ![ types.PROJECT, types.SERVICE ].includes(knownOp.type)) {
        graphs.push(operationGraphNames[graphNameSet[0]]);
      } else if (knownOp.type === types.BGP) {
        // This is the specific case that `op` got changed because of using quads. -
        return SUBRULE(splitAlgBgpToGraphs, knownOp, keyGraphs.patterns);
      } else {
        // Multiple graphs (or project), need to create graph objects for them
        for (const key of Object.keys(keyGraphs)) {
          const value = result[key];
          if (Array.isArray(value)) {
            result[key] = value.map((child, idx) =>
              // If DefaultGraph, do nothing, else wrap in plainly in Graph
              keyGraphs[key][idx].termType === 'DefaultGraph' ?
                child :
                AF.createGraph(child, keyGraphs[key][idx]));
          } else if (keyGraphs[key][0].termType !== 'DefaultGraph') {
            result[key] = AF.createGraph(value, keyGraphs[key][0]);
          }
        }
      }
    }

    return result;
  },
};

/**
 * Graphs should be an array of length identical to `op.patterns`,
 * containing the corresponding graph for each triple.
 *
 * returns Join if more than 1 pattern present, otherwise if only default graph present returns Bgp, otherwise Graph.
 */
export const splitAlgBgpToGraphs: AstIndir<
  'splitBgpToGraphs',
Algebra.Join | Algebra.Graph | Algebra.Bgp,
[Algebra.Bgp, (RDF.NamedNode | RDF.DefaultGraph)[]]
> = {
  name: 'splitBgpToGraphs',
  fun: () => ({ algebraFactory: AF }, op, graphs) => {
    // Split patterns per graph
    const graphPatterns: Record<string, { patterns: Algebra.Pattern[]; graph: RDF.NamedNode }> = {};
    for (const [ index, pattern ] of op.patterns.entries()) {
      const graph = graphs[index];
      graphPatterns[graph.value] = graphPatterns[graph.value] ?? { patterns: [], graph };
      graphPatterns[graph.value].patterns.push(pattern);
    }

    // Create graph objects for every cluster
    const children: (Algebra.Graph | Algebra.Bgp)[] = [];
    for (const [ graphName, { patterns, graph }] of Object.entries(graphPatterns)) {
      const bgp = AF.createBgp(patterns);
      // No name means DefaultGraph, otherwise wrap in graph
      children.push(graphName === '' ? bgp : AF.createGraph(bgp, graph));
    }

    // Join the graph objects
    let join: Algebra.Join | Algebra.Graph | Algebra.Bgp = children[0];
    for (const child of children.slice(1)) {
      join = AF.createJoin([ join, child ]);
    }

    return join;
  },
};
