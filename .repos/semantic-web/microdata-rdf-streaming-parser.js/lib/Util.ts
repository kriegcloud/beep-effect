import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { resolve } from 'relative-to-absolute-iri';
import type { IItemScope } from './IItemScope';
import type { IVocabRegistry } from './IVocabRegistry';

/**
 * A collection of utility functions.
 */
export class Util {
  public static readonly RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
  public static readonly XSD = 'http://www.w3.org/2001/XMLSchema#';
  public static readonly RDFA = 'http://www.w3.org/ns/rdfa#';

  private static readonly IRI_REGEX: RegExp = /^([A-Za-z][\d+-.A-Za-z]*|_):[^ "<>[\\\]`{|}]*$/u;

  public readonly dataFactory: RDF.DataFactory;
  public baseIRI: string;

  public constructor(dataFactory?: RDF.DataFactory, baseIRI?: string) {
    this.dataFactory = dataFactory || new DataFactory();
    this.baseIRI = baseIRI || '';
  }

  /**
   * Check if the given IRI is valid.
   * @param {string} iri A potential IRI.
   * @return {boolean} If the given IRI is valid.
   */
  public static isValidIri(iri: string): boolean {
    return Util.IRI_REGEX.test(iri);
  }

  /**
   * Create vocab terms for the given terms attribute.
   *
   * Relative IRIs will be based on the active vocab or baseIRI if `allowRelativeIris` is true.
   *
   * @param {string} terms An attribute value.
   * @param {IItemScope} itemScope The active item scope.
   * @param {boolean} allowRelativeIris If relative IRIs are allowed.
   * @return {Term[]} The IRI terms.
   */
  public createVocabIris(terms: string, itemScope: IItemScope, allowRelativeIris: boolean): RDF.NamedNode[] {
    return terms.split(/\s+/u)
      .filter(term => !!term)
      .map(property => {
        if (!Util.isValidIri(property)) {
          if (!allowRelativeIris) {
            return;
          }
          property = `${itemScope.vocab || `${this.baseIRI}#`}${property}`;
        }
        return this.dataFactory.namedNode(property);
      })
      .filter(term => !!term);
  }

  /**
   * Get the predicates for which the given itemprop value should cause vocabulary expansion.
   * @param terms An attribute value.
   * @param itemScope The active item scope.
   * @param vocabRegistry The active vocabulary registry.
   */
  public getVocabularyExpansionType(
    terms: string,
    itemScope: IItemScope,
    vocabRegistry: IVocabRegistry,
  ): RDF.NamedNode[] {
    // Check the presence of subPropertyOf or equivalentProperty
    const parts = terms.split(/\s+/u);
    if (parts.includes('subPropertyOf') || parts.includes('equivalentProperty')) {
      return [ this.dataFactory.namedNode(`${Util.RDF}type`) ];
    }

    // Check in the item scope's vocab
    if (itemScope.vocab && itemScope.vocab in vocabRegistry && vocabRegistry[itemScope.vocab].properties) {
      let predicates: RDF.NamedNode[] = [];
      for (const [ property, expansions ] of Object
        .entries(vocabRegistry[itemScope.vocab].properties!)) {
        if (parts.includes(property)) {
          predicates = [ ...Object.values(expansions).map(iri => this.dataFactory.namedNode(iri)) ];
        }
      }
      return predicates;
    }

    return [];
  }

  /**
   * Create a named node for the given term, which can be relative to the document base.
   * @param {string} iri A term string.
   * @return {Term} An RDF term, or undefined if invalid.
   */
  public createSubject(iri: string): RDF.NamedNode | undefined {
    if (!Util.isValidIri(iri)) {
      try {
        iri = resolve(iri, this.baseIRI);
      } catch {
        return;
      }
    }
    return this.dataFactory.namedNode(iri);
  }

  /**
   * Create a new literal node.
   * @param {string} literal The literal value.
   * @param {IActiveTag} activeTag The current active tag.
   * @return {Literal} A new literal node.
   */
  public createLiteral(literal: string, activeTag: IItemScope): RDF.Literal {
    return this.dataFactory.literal(literal, activeTag.language);
  }

  /**
   * Determine the vocab IRI from a given type IRI.
   * @link https://w3c.github.io/microdata-rdf/#property-uri-generation
   * @param typeIri A type IRI.
   * @param vocabRegistry The active vocabulary registry.
   */
  public deriveVocab(typeIri: string, vocabRegistry: IVocabRegistry): string {
    let vocab: string | undefined;

    // First check if we find a prefix in the vocab registry
    for (const uriPrefix in vocabRegistry) {
      if (typeIri.startsWith(uriPrefix)) {
        vocab = uriPrefix;
        // Append fragment if prefix does not end with a slash
        if (!vocab.endsWith('/')) {
          vocab += '#';
        }
        break;
      }
    }
    // If no match was found, remove the last path segment from the URI
    if (!vocab) {
      const hashPos = typeIri.indexOf('#');
      if (hashPos > 0) {
        vocab = typeIri.slice(0, hashPos + 1);
      } else {
        vocab = resolve('.', typeIri);
      }
    }
    return vocab;
  }
}
