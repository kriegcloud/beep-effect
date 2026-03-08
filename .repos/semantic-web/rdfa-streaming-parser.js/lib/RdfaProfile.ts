/**
 * A type of RDFa profile
 */
export type RdfaProfile =
  '' | // All possible RDFa features
  'core' | // https://www.w3.org/TR/rdfa-core/
  'html' | // https://www.w3.org/TR/html-rdfa/
  'xhtml' | // https://www.w3.org/TR/xhtml-rdfa/
  'xml';

export interface IRdfaFeatures {
  /**
   * If the baseIRI can be set via the <base> tag.
   */
  baseTag?: boolean;
  /**
   * If the baseIRI can be set via the xml:base attribute.
   */
  xmlBase?: boolean;
  /**
   * If the language can be set via the language attribute.
   */
  langAttribute?: boolean;
  /**
   * If non-CURIE and non-URI rel and rev have to be ignored if property is present.
   */
  onlyAllowUriRelRevIfProperty?: boolean;
  /**
   * If the new subject can be inherited from the parent object if we're inside <head> or <body>
   * if the resource defines no new subject.
   */
  inheritSubjectInHeadBody?: boolean;
  /**
   * If the datetime attribute must be interpreted as datetimes.
   */
  datetimeAttribute?: boolean;
  /**
   * If the time tag contents should be interpreted as datetimes.
   */
  timeTag?: boolean;
  /**
   * If rdf:HTML as datatype should cause tag contents to be serialized to text.
   */
  htmlDatatype?: boolean;
  /**
   * If rdfa:copy property links can refer to rdfa:Pattern's for copying.
   */
  copyRdfaPatterns?: boolean;
  /**
   * If prefixes should be extracted from xmlnsPrefixMappings.
   */
  xmlnsPrefixMappings?: boolean;
  /**
   * If children of rdf:XMLLiteral should not be handled as RDFa anymore.
   * This is not part of the RDFa spec.
   */
  skipHandlingXmlLiteralChildren?: boolean;
  /**
   * If the XHTML initial context should be included in the initial prefixes.
   * see https://www.w3.org/2011/rdfa-context/xhtml-rdfa-1.1
   */
  xhtmlInitialContext?: boolean;
  /**
   * If the role attribute should be handled
   * as described in https://www.w3.org/TR/role-attribute/#using-role-in-conjunction-with-rdfa
   */
  roleAttribute?: boolean;
}

/**
 * A mapping of RDFa profile to a features object.
 */
// tslint:disable:object-literal-sort-keys
export const RDFA_FEATURES: {[profile: string]: IRdfaFeatures} = {
  '': {
    baseTag: true,
    xmlBase: true,
    langAttribute: true,
    onlyAllowUriRelRevIfProperty: true,
    inheritSubjectInHeadBody: true,
    datetimeAttribute: true,
    timeTag: true,
    htmlDatatype: true,
    copyRdfaPatterns: true,
    xmlnsPrefixMappings: true,
    xhtmlInitialContext: true,
    roleAttribute: true,
  },
  'core': {
    baseTag: false,
    xmlBase: false,
    langAttribute: true,
    onlyAllowUriRelRevIfProperty: true,
    inheritSubjectInHeadBody: false,
    datetimeAttribute: false,
    timeTag: false,
    htmlDatatype: false,
    copyRdfaPatterns: true,
    xmlnsPrefixMappings: true,
    xhtmlInitialContext: false,
    roleAttribute: false,
  },
  'html': {
    baseTag: true,
    xmlBase: false,
    langAttribute: true,
    onlyAllowUriRelRevIfProperty: true,
    inheritSubjectInHeadBody: true,
    datetimeAttribute: true,
    timeTag: true,
    htmlDatatype: true,
    copyRdfaPatterns: true,
    xmlnsPrefixMappings: true,
    xhtmlInitialContext: false,
    roleAttribute: true,
  },
  'xhtml': {
    baseTag: true,
    xmlBase: false,
    langAttribute: true,
    onlyAllowUriRelRevIfProperty: true,
    inheritSubjectInHeadBody: true,
    datetimeAttribute: true,
    timeTag: true,
    htmlDatatype: true,
    copyRdfaPatterns: true,
    xmlnsPrefixMappings: true,
    xhtmlInitialContext: true,
    roleAttribute: true,
  },
  'xml': {
    baseTag: false,
    xmlBase: true,
    langAttribute: true,
    onlyAllowUriRelRevIfProperty: false,
    inheritSubjectInHeadBody: false,
    datetimeAttribute: true,
    timeTag: true,
    htmlDatatype: false,
    copyRdfaPatterns: false,
    xmlnsPrefixMappings: true,
    xhtmlInitialContext: false,
    roleAttribute: true,
  },
};
// tslint:enable:object-literal-sort-keys

// tslint:disable:object-literal-sort-keys
export const RDFA_CONTENTTYPES: {[contentType: string]: RdfaProfile} = {
  // HTML
  'text/html': 'html',

  // XHTML
  'application/xhtml+xml': 'xhtml',

  // XML
  'application/xml': 'xml',
  'text/xml': 'xml',
  'image/svg+xml': 'xml',
};
// tslint:enable:object-literal-sort-keys
