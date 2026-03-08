import * as RDF from "@rdfjs/types";
import {resolve} from "relative-to-absolute-iri";
import {IActiveTag} from "./IActiveTag";
import {RDFA_CONTENTTYPES, RdfaProfile} from "./RdfaProfile";
import {DataFactory} from "rdf-data-factory";

/**
 * A collection of utility functions.
 */
export class Util {

  public static readonly RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
  public static readonly XSD = 'http://www.w3.org/2001/XMLSchema#';
  public static readonly RDFA = 'http://www.w3.org/ns/rdfa#';

  private static readonly PREFIX_REGEX: RegExp = /\s*([^:\s]*)*:\s*([^\s]*)*\s*/g;
  private static readonly TIME_REGEXES: { regex: RegExp, type: string }[] = [
    {
      regex: /^-?P([0-9]+Y)?([0-9]+M)?([0-9]+D)?(T([0-9]+H)?([0-9]+M)?([0-9]+(\.[0-9])?S)?)?$/,
      type: 'duration',
    },
    {
      regex: /^[0-9]+-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9]((Z?)|([\+-][0-9][0-9]:[0-9][0-9]))$/,
      type: 'dateTime',
    },
    { regex: /^[0-9]+-[0-9][0-9]-[0-9][0-9]Z?$/, type: 'date' },
    { regex: /^[0-9][0-9]:[0-9][0-9]:[0-9][0-9]((Z?)|([\+-][0-9][0-9]:[0-9][0-9]))$/, type: 'time' },
    { regex: /^[0-9]+-[0-9][0-9]$/, type: 'gYearMonth' },
    { regex: /^[0-9]+$/, type: 'gYear' },
  ];
  private static readonly IRI_REGEX: RegExp = /^([A-Za-z][A-Za-z0-9+-.]*|_):[^ "<>{}|\\\[\]`]*$/;

  public readonly dataFactory: RDF.DataFactory;
  public baseIRI: RDF.NamedNode;
  public blankNodeFactory: () => RDF.BlankNode;
  private readonly baseIRIDocument: RDF.NamedNode;

  constructor(dataFactory: RDF.DataFactory, baseIRI: string) {
    this.dataFactory = dataFactory || new DataFactory();
    this.baseIRI = this.dataFactory.namedNode(baseIRI || '');
    this.baseIRIDocument = this.baseIRI;
  }

  /**
   * Retrieve the prefixes of the current tag's attributes.
   * @param {{[p: string]: string}} attributes A tag's attributes.
   * @param {{[p: string]: string}} parentPrefixes The prefixes from the parent tag.
   * @param {boolean} xmlnsPrefixMappings If prefixes should be extracted from xmlnsPrefixMappings.
   * @return {{[p: string]: string}} The new prefixes.
   */
  public static parsePrefixes(attributes: {[s: string]: string},
                              parentPrefixes: {[prefix: string]: string},
                              xmlnsPrefixMappings: boolean): {[prefix: string]: string} {
    const additionalPrefixes: {[prefix: string]: string} = {};
    if (xmlnsPrefixMappings) {
      for (const attribute in attributes) {
        if (attribute.startsWith('xmlns')) {
          additionalPrefixes[attribute.substr(6)] = attributes[attribute];
        }
      }
    }

    if (attributes.prefix || Object.keys(additionalPrefixes).length > 0) {
      const prefixes: {[prefix: string]: string} = { ...parentPrefixes, ...additionalPrefixes };

      if (attributes.prefix) {
        let prefixMatch;
        // tslint:disable-next-line:no-conditional-assignment
        while (prefixMatch = Util.PREFIX_REGEX.exec(attributes.prefix)) {
          prefixes[prefixMatch[1]] = prefixMatch[2];
        }
      }

      return prefixes;
    } else {
      return parentPrefixes;
    }
  }

  /**
   * Expand the given term value based on the given prefixes.
   * @param {string} term A term value.
   * @param {{[p: string]: string}[]} prefixes The available prefixes.
   * @return {string} An expanded URL, or the term as-is.
   */
  public static expandPrefixedTerm(term: string, activeTag: IActiveTag): string {
    // Check if the term is prefixed
    const colonIndex: number = term.indexOf(':');
    let prefix: string;
    let local: string;
    if (colonIndex >= 0) {
      prefix = term.substr(0, colonIndex);
      local = term.substr(colonIndex + 1);
    }

    // Expand default namespace
    if (prefix === '') {
      return 'http://www.w3.org/1999/xhtml/vocab#' + local;
    }

    // Try to expand the prefix
    if (prefix) {
      const prefixElement = activeTag.prefixesAll[prefix];
      if (prefixElement) {
        return prefixElement + local;
      }
    }

    // Try to expand the term
    if (term) {
      const expandedTerm = activeTag.prefixesAll[term.toLocaleLowerCase()];
      if (expandedTerm) {
        return expandedTerm;
      }
    }

    return term;
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
   * Determine the RDFa profile from the given content type.
   * Defaults to the default RDFa profile (all features enabled) for unknown content types.
   * @param {string} contentType A content type.
   * @returns {RdfaProfile} An RDFa profile.
   */
  public static contentTypeToProfile(contentType: string): RdfaProfile {
    return RDFA_CONTENTTYPES[contentType] || '';
  }

  /**
   * Get the base IRI.
   * @param {string} baseIriValue A base IRI value.
   * @return A base IRI named node.
   */
  public getBaseIRI(baseIriValue: string): RDF.NamedNode {
    let href: string = baseIriValue;
    const fragmentIndex = href.indexOf('#');
    if (fragmentIndex >= 0) {
      href = href.substr(0, fragmentIndex);
    }
    return this.dataFactory.namedNode(resolve(href, this.baseIRI.value));
  }

  /**
   * If the term is a boolean, return the baseIRI, otherwise return the term as-is.
   * @param {Term | boolean} term A term or boolean, where the boolean indicates the baseIRI.
   * @param {IActiveTag} activeTag An active tag.
   * @returns {Term} A term.
   */
  public getResourceOrBaseIri(term: RDF.Term | boolean, activeTag: IActiveTag): RDF.NamedNode {
    return term === true ? this.getBaseIriTerm(activeTag) : <RDF.NamedNode> term;
  }

  /**
   * Get the active base IRI as an RDF term.
   * @param {IActiveTag} activeTag The active tag.
   * @return {NamedNode} The base IRI term.
   */
  public getBaseIriTerm(activeTag: IActiveTag): RDF.NamedNode {
    return activeTag.localBaseIRI || this.baseIRI;
  }

  /**
   * Create vocab terms for the given terms attribute.
   * @param {string} terms An attribute value.
   * @param {IActiveTag} activeTag The current active tag.
   * @param {boolean} allowTerms If terms are allowed (strings without ':')
   * @param {boolean} allowBlankNode If blank nodes are allowed.
   * @return {Term[]} The IRI terms.
   */
  public createVocabIris<B extends boolean>(terms: string, activeTag: IActiveTag, allowTerms: boolean,
                                            allowBlankNode: B): B extends true
    ? (RDF.BlankNode | RDF.NamedNode)[] : RDF.NamedNode[];
  public createVocabIris(terms: string, activeTag: IActiveTag, allowTerms: boolean,
                         allowBlankNode: boolean): (RDF.NamedNode | RDF.BlankNode)[] {
    return terms.split(/\s+/)
      .filter((term) => term && (allowTerms || term.indexOf(':') >= 0))
      .map((property) => this.createIri(property, activeTag, true, true, allowBlankNode))
      .filter((term) => term != null);
  }

  /**
   * Create a new literal node.
   * @param {string} literal The literal value.
   * @param {IActiveTag} activeTag The current active tag.
   * @return {Literal} A new literal node.
   */
  public createLiteral(literal: string, activeTag: IActiveTag): RDF.Literal {
    if (activeTag.interpretObjectAsTime && !activeTag.datatype) {
      for (const entry of Util.TIME_REGEXES) {
        if (literal.match(entry.regex)) {
          activeTag.datatype = this.dataFactory.namedNode(Util.XSD + entry.type);
          break;
        }
      }
    }
    return this.dataFactory.literal(literal, activeTag.datatype || activeTag.language?.toLowerCase());
  }

  /**
   * Create a blank node.
   * @returns {BlankNode} A new blank node.
   */
  public createBlankNode(): RDF.BlankNode {
    if (this.blankNodeFactory) {
      return this.blankNodeFactory();
    }
    return this.dataFactory.blankNode();
  }

  /**
   * Create a named node for the given term.
   * This will take care of prefix detection.
   * @param {string} term A term string (CURIE or IRI, aka safe-CURIE in RDFa spec).
   * @param {IActiveTag} activeTag The current active tag.
   * @param {boolean} vocab If creating an IRI in vocab-mode (based on vocab IRI),
   *                        or in base-mode (based on base IRI).
   * @param {boolean} allowSafeCurie If safe CURIEs are allowed
   *                                 (invalid CURIEs between square brackets will return null)
   *                                 Otherwise, only IRIs are allowed.
   * @param {boolean} allowBlankNode If blank nodes are allowed. Otherwise null will be returned.
   * @return {Term} An RDF term or null.
   */
  public createIri<B extends boolean>(term: string, activeTag: IActiveTag, vocab: boolean, allowSafeCurie: boolean,
                                      allowBlankNode: B): B extends true
    ? (RDF.NamedNode | RDF.BlankNode) : RDF.NamedNode;
  public createIri<B extends boolean>(term: string, activeTag: IActiveTag, vocab: boolean, allowSafeCurie: boolean,
                                      allowBlankNode: B): RDF.NamedNode | RDF.BlankNode {
    term = term || '';

    if (!allowSafeCurie) {
      if (!vocab) {
        term = resolve(term, this.getBaseIriTerm(activeTag).value);
      }
      if (!Util.isValidIri(term)) {
        return null;
      }
      return this.dataFactory.namedNode(term);
    }

    // Handle strict CURIEs
    if (term.length > 0 && term[0] === '[' && term[term.length - 1] === ']') {
      term = term.substr(1, term.length - 2);

      // Strict CURIEs MUST have a prefix separator
      if (term.indexOf(':') < 0) {
        return null;
      }
    }

    // Handle blank nodes
    if (term.startsWith('_:')) {
      return allowBlankNode ? this.dataFactory.blankNode(term.substr(2) || 'b_identity') : null;
    }

    // Handle vocab IRIs
    if (vocab) {
      if (activeTag.vocab && term.indexOf(':') < 0) {
        return this.dataFactory.namedNode(activeTag.vocab + term);
      }
    }

    // Handle prefixed IRIs
    let iri: string = Util.expandPrefixedTerm(term, activeTag);
    // Resolve against baseIRI if in base-mode, or if the term was a prefixed relative IRI
    if (!vocab) {
      iri = resolve(iri, this.getBaseIriTerm(activeTag).value);
    } else if (term !== iri) {
      iri = resolve(iri, this.baseIRIDocument.value);
    }
    if (!Util.isValidIri(iri)) {
      return null;
    }
    return this.dataFactory.namedNode(iri);
  }

}
