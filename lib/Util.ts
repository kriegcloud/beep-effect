import {IExpandOptions} from "./JsonLdContextNormalized";
import {IJsonLdContextNormalizedRaw, JsonLdContext} from "./JsonLdContext";

export class Util {

  // Regex for valid IRIs
  public static readonly IRI_REGEX: RegExp = /^([A-Za-z][A-Za-z0-9+-.]*|_):[^ "<>{}|\\\[\]`#]*(#[^#]*)?$/;
  // Weaker regex for valid IRIs, this includes relative IRIs
  public static readonly IRI_REGEX_WEAK: RegExp = /(?::[^:])|\//;
  // Regex for keyword form
  public static readonly KEYWORD_REGEX: RegExp = /^@[a-z]+$/i;
  // Regex to see if an IRI ends with a gen-delim character (see RFC 3986)
  public static readonly ENDS_WITH_GEN_DELIM: RegExp = /[:/?#\[\]@]$/;
  // Regex for language tags
  public static readonly REGEX_LANGUAGE_TAG: RegExp = /^[a-zA-Z]+(-[a-zA-Z0-9]+)*$/;
  // Regex for base directions
  public static readonly REGEX_DIRECTION_TAG: RegExp = /^(ltr)|(rtl)$/;

  // All known valid JSON-LD keywords
  // @see https://www.w3.org/TR/json-ld11/#keywords
  public static readonly VALID_KEYWORDS: {[keyword: string]: boolean} = {
    '@annotation': true, // https://json-ld.github.io/json-ld-star/
    '@base': true,
    '@container': true,
    '@context': true,
    '@direction': true,
    '@graph': true,
    '@id': true,
    '@import': true,
    '@included': true,
    '@index': true,
    '@json': true,
    '@language': true,
    '@list': true,
    '@nest': true,
    '@none': true,
    '@prefix': true,
    '@propagate': true,
    '@protected': true,
    '@reverse': true,
    '@set': true,
    '@type': true,
    '@value': true,
    '@version': true,
    '@vocab': true,
  };
  // Keys in the contexts that will not be expanded based on the base IRI
  public static readonly EXPAND_KEYS_BLACKLIST: string[] = [
    '@base',
    '@vocab',
    '@language',
    '@version',
    '@direction',
  ];
  // Keys in the contexts that may not be aliased from
  public static readonly ALIAS_DOMAIN_BLACKLIST: string[] = [
    '@container',
    '@graph',
    '@id',
    '@index',
    '@list',
    '@nest',
    '@none',
    '@prefix',
    '@reverse',
    '@set',
    '@type',
    '@value',
    '@version',
  ];
  // Keys in the contexts that may not be aliased to
  public static readonly ALIAS_RANGE_BLACKLIST: string[] = [
    '@context',
    '@preserve',
  ];
  // All valid @container values
  public static readonly CONTAINERS: string[] = [
    '@list',
    '@set',
    '@index',
    '@language',
    '@graph',
    '@id',
    '@type',
  ];
  // All valid @container values under processing mode 1.0
  public static readonly CONTAINERS_1_0: string[] = [
    '@list',
    '@set',
    '@index',
  ];

  /**
   * Check if the given term is a valid compact IRI.
   * Otherwise, it may be an IRI.
   * @param {string} term A term.
   * @return {boolean} If it is a compact IRI.
   */
  public static isCompactIri(term: string) {
    return term.indexOf(':') > 0 && !(term && term[0] === '#');
  }

  /**
   * Get the prefix from the given term.
   * @see https://json-ld.org/spec/latest/json-ld/#compact-iris
   * @param {string} term A term that is an URL or a prefixed URL.
   * @param {IJsonLdContextNormalizedRaw} context A context.
   * @return {string} The prefix or null.
   */
  public static getPrefix(term: string, context: IJsonLdContextNormalizedRaw): string | null {
    // Do not consider relative IRIs starting with a hash as compact IRIs
    if (term && term[0] === '#') {
      return null;
    }

    const separatorPos: number = term.indexOf(':');
    if (separatorPos >= 0) {
      // Suffix can not begin with two slashes
      if (term.length > separatorPos + 1
        && term.charAt(separatorPos + 1) === '/'
        && term.charAt(separatorPos + 2) === '/') {
        return null;
      }

      const prefix: string = term.substr(0, separatorPos);

      // Prefix can not be an underscore (this is a blank node)
      if (prefix === '_' ) {
        return null;
      }

      // Prefix must match a term in the active context
      if (context[prefix]) {
        return prefix;
      }
    }
    return null;
  }

  /**
   * From a given context entry value, get the string value, or the @id field.
   * @param contextValue A value for a term in a context.
   * @return {string} The id value, or null.
   */
  public static getContextValueId(contextValue: any): string {
    if (contextValue === null || typeof contextValue === 'string') {
      return contextValue;
    }
    const id = contextValue['@id'];
    return id ? id : null;
  }

  /**
   * Check if the given simple term definition (string-based value of a context term)
   * should be considered a prefix.
   * @param value A simple term definition value.
   * @param options Options that define the way how expansion must be done.
   */
  public static isSimpleTermDefinitionPrefix(value: unknown, options: IExpandOptions): boolean {
    return !Util.isPotentialKeyword(value)
      && (options.allowPrefixNonGenDelims || (typeof value === 'string' && (value[0] === '_' || Util.isPrefixIriEndingWithGenDelim(value))));
  }

  /**
   * Check if the given keyword is of the keyword format "@"1*ALPHA.
   * @param {string} keyword A potential keyword.
   * @return {boolean} If the given keyword is of the keyword format.
   */
  public static isPotentialKeyword(keyword: any): boolean {
    return typeof keyword === 'string' && Util.KEYWORD_REGEX.test(keyword);
  }

  /**
   * Check if the given prefix ends with a gen-delim character.
   * @param {string} prefixIri A prefix IRI.
   * @return {boolean} If the given prefix IRI is valid.
   */
  public static isPrefixIriEndingWithGenDelim(prefixIri: string): boolean {
    return Util.ENDS_WITH_GEN_DELIM.test(prefixIri);
  }

  /**
   * Check if the given context value can be a prefix value.
   * @param value A context value.
   * @return {boolean} If it can be a prefix value.
   */
  public static isPrefixValue(value: any): boolean {
    return value && (typeof value === 'string' || (value && typeof value === 'object'));
  }

  /**
   * Check if the given IRI is valid.
   * @param {string} iri A potential IRI.
   * @return {boolean} If the given IRI is valid.
   */
  public static isValidIri(iri: string | null): boolean {
    return Boolean(iri && Util.IRI_REGEX.test(iri));
  }

  /**
   * Check if the given IRI is valid, this includes the possibility of being a relative IRI.
   * @param {string} iri A potential IRI.
   * @return {boolean} If the given IRI is valid.
   */
  public static isValidIriWeak(iri: string | null): boolean {
    return !!iri && iri[0] !== ':' && Util.IRI_REGEX_WEAK.test(iri);
  }

  /**
   * Check if the given keyword is a defined according to the JSON-LD specification.
   * @param {string} keyword A potential keyword.
   * @return {boolean} If the given keyword is valid.
   */
  public static isValidKeyword(keyword: any): boolean {
    return Util.VALID_KEYWORDS[keyword];
  }

  /**
   * Check if the given term is protected in the context.
   * @param {IJsonLdContextNormalizedRaw} context A context.
   * @param {string} key A context term.
   * @return {boolean} If the given term has an @protected flag.
   */
  public static isTermProtected(context: IJsonLdContextNormalizedRaw, key: string): boolean {
    const value = context[key];
    return !(typeof value === 'string') && value && value['@protected'];
  }

  /**
   * Check if the given context has at least one protected term.
   * @param context A context.
   * @return If the context has a protected term.
   */
  public static hasProtectedTerms(context: IJsonLdContextNormalizedRaw) {
    for (const key of Object.keys(context)) {
      if (Util.isTermProtected(context, key)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if the given key is an internal reserved keyword.
   * @param key A context key.
   */
  public static isReservedInternalKeyword(key: string) {
    return key.startsWith('@__');
  }

  /**
   * Check if two objects are deepEqual to on another.
   * @param object1 The first object to test.
   * @param object2 The second object to test.
   */
  public static deepEqual(object1: any, object2: any): boolean {
    const objKeys1 = Object.keys(object1);
    const objKeys2 = Object.keys(object2);

    if (objKeys1.length !== objKeys2.length) return false;
    return objKeys1.every((key) => {
      const value1 = object1[key];
      const value2 = object2[key];
      return (value1 === value2) || (
        value1 !== null &&
        value2 !== null &&
        typeof value1 === "object" &&
        typeof value2 === "object" &&
        this.deepEqual(value1, value2)
      );
    });
  };
}
