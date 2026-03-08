import type * as RDF from '@rdfjs/types';

/**
 * Data holder for the Microdata state in XML tags.
 */
export interface IItemScope {
  /**
   * The current subject of this scope.
   */
  subject: RDF.NamedNode | RDF.BlankNode;
  /**
   * The vocbulary that is active in this scope.
   */
  vocab?: string;
  /**
   * The language that is active in this scope.
   */
  language?: string;
  /**
   * A hash of (absolute) depth to predicates that are defined in this scope.
   * Both forward and reverse properties can be defined.
   */
  predicates?: Record<number, { forward?: RDF.NamedNode[]; reverse?: RDF.NamedNode[] }>;
  /**
   * If triples from this scope must NOT be emitted.
   */
  blockEmission?: boolean;
}
