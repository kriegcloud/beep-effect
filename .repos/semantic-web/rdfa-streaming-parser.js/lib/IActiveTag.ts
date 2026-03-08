import * as RDF from "@rdfjs/types";
import {IRdfaPattern} from "./IRdfaPattern";

/**
 * Data holder for the RDFa state in XML tags.
 */
export interface IActiveTag {
  name: string;
  prefixesAll: {[prefix: string]: string};
  prefixesCustom: {[prefix: string]: string};
  subject?: RDF.NamedNode | RDF.BlankNode | boolean;
  explicitNewSubject?: boolean;
  predicates?: RDF.NamedNode[];
  object?: RDF.NamedNode | RDF.BlankNode | boolean;
  textWithTags?: string[];
  textWithoutTags?: string[];
  vocab?: string;
  language?: string;
  datatype?: RDF.NamedNode;
  collectChildTags?: boolean;
  collectChildTagsForCurrentTag?: boolean;
  collectedPatternTag?: IRdfaPattern;
  interpretObjectAsTime?: boolean;
  incompleteTriples?: { predicate: RDF.Quad_Predicate, reverse: boolean, list?: boolean }[];
  inlist: boolean;
  listMapping: {[predicate: string]: (RDF.Term|boolean)[]};
  listMappingLocal: {[predicate: string]: (RDF.Term|boolean)[]};
  skipElement: boolean;
  localBaseIRI?: RDF.NamedNode;
}
