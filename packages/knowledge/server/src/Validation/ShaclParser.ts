import * as A from "effect/Array";
import * as N3 from "n3";

const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const RDFS_SUBCLASS_OF = "http://www.w3.org/2000/01/rdf-schema#subClassOf";

const namedNode = N3.DataFactory.namedNode;

export const materializeSubclassInference = (graph: N3.Store, maxDepth: number): void => {
  let iterations = 0;
  let changed = true;

  while (changed && iterations < maxDepth) {
    iterations += 1;
    changed = false;

    const subclassTriples = graph.getQuads(null, namedNode(RDFS_SUBCLASS_OF), null, null);
    const typeTriples = graph.getQuads(null, namedNode(RDF_TYPE), null, null);

    for (const subclass of subclassTriples) {
      if (subclass.object.termType !== "NamedNode" || subclass.subject.termType !== "NamedNode") {
        continue;
      }

      for (const typeTriple of typeTriples) {
        if (typeTriple.object.termType !== "NamedNode") {
          continue;
        }
        if (typeTriple.object.value !== subclass.subject.value) {
          continue;
        }

        const inferred = N3.DataFactory.quad(
          typeTriple.subject,
          namedNode(RDF_TYPE),
          namedNode(subclass.object.value),
          typeTriple.graph
        );

        if (!graph.has(inferred)) {
          graph.addQuad(inferred);
          changed = true;
        }
      }
    }
  }
};

export const valuesForNodeAndPath = (graph: N3.Store, focusNode: string, path: string): ReadonlyArray<N3.Term> =>
  A.map(graph.getQuads(namedNode(focusNode), namedNode(path), null, null), (quad) => quad.object);

export const nodesOfType = (graph: N3.Store, classIri: string): ReadonlyArray<string> =>
  A.map(graph.getQuads(null, namedNode(RDF_TYPE), namedNode(classIri), null), (quad) => quad.subject.value);

export const hasType = (graph: N3.Store, nodeIri: string, classIri: string): boolean =>
  graph.countQuads(namedNode(nodeIri), namedNode(RDF_TYPE), namedNode(classIri), null) > 0;
