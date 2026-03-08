import {ERROR_CODES, ErrorCoded, JsonLdContextNormalized} from "jsonld-context-parser";
import * as RDF from "@rdfjs/types";

/**
 * Utility functions and methods.
 */
export class Util {

  public static readonly XSD: string = 'http://www.w3.org/2001/XMLSchema#';
  public static readonly XSD_STRING: string = Util.XSD + 'string';
  public static readonly RDF: string = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
  public static readonly RDF_TYPE: string = Util.RDF + 'type';
  public static readonly RDF_JSON: string = Util.RDF + 'JSON';
  public static readonly I18N: string = 'https://www.w3.org/ns/i18n#';

  /**
   * Convert an RDF term to a JSON value.
   * @param {Term} term An RDF term.
   * @param {JsonLdContextNormalized} context The context.
   * @param {ITermToValueOptions} options Conversion options.
   * @return {any} A JSON value.
   */
  public static termToValue(term: RDF.Term, context: JsonLdContextNormalized, options: ITermToValueOptions = {
    compactIds: false,
    useNativeTypes: false,
  }): any {
    switch (term.termType) {
    case 'NamedNode':
      const compacted = context.compactIri(term.value, options.vocab);
      return options.compactIds ? compacted : { '@id': compacted };
    case 'DefaultGraph':
      return options.compactIds ? term.value : { '@id': term.value };
    case 'BlankNode':
      const id = `_:${term.value}`;
      return options.compactIds ? id : { '@id': id };
    case 'Literal':
      // Handle JSON datatype
      if (term.datatype.value === Util.RDF_JSON) {
        let parsedJson: any;
        try {
          parsedJson = JSON.parse(term.value);
        } catch (e) {
          throw new ErrorCoded('Invalid JSON literal: ' + e.message, ERROR_CODES.INVALID_JSON_LITERAL);
        }
        return {
          '@value': parsedJson,
          '@type': '@json',
        };
      }

      // Handle rdfDirection: i18n-datatype
      if (options.rdfDirection === 'i18n-datatype' && term.datatype.value.startsWith(Util.I18N)) {
        const [language, direction] = term.datatype.value
          .substr(Util.I18N.length, term.datatype.value.length)
          .split('_');
        return {
          '@value': term.value,
          ...language ? { '@language': language } : {},
          ...direction ? { '@direction': direction } : {},
        };
      }

      const stringType = term.datatype.value === Util.XSD_STRING;
      const rawValue = {
        '@value': !stringType && options.useNativeTypes
          ? Util.stringToNativeType(term.value, term.datatype.value) : term.value,
      };
      if (term.language) {
        if (term.direction && !options.rdfDirection) {
          return { ...rawValue, '@language': term.language, '@direction': term.direction };
        }
        return { ...rawValue, '@language': term.language };
      } else if (!stringType && typeof rawValue['@value'] === 'string') {
        return { ...rawValue, '@type': term.datatype.value };
      } else {
        return rawValue;
      }
    }
  }

  /**
   * Convert a string term to a native type.
   * If no conversion is possible, the original string will be returned.
   * @param {string} value An RDF term's string value.
   * @param {string} type
   * @return {any}
   */
  public static stringToNativeType(value: string, type: string): any {
    if (type.startsWith(Util.XSD)) {
      const xsdType = type.substr(Util.XSD.length);
      switch (xsdType) {
      case 'boolean':
        if (value === 'true') {
          return true;
        } else if (value === 'false') {
          return false;
        }
        throw new Error(`Invalid xsd:boolean value '${value}'`);
      case 'integer':
      case 'number':
      case 'int':
      case 'byte':
      case 'long':
        const parsedInt = parseInt(value, 10);
        if (isNaN(parsedInt)) {
          throw new Error(`Invalid xsd:integer value '${value}'`);
        }
        return parsedInt;
      case 'float':
      case 'double':
        const parsedFloat = parseFloat(value);
        if (isNaN(parsedFloat)) {
          throw new Error(`Invalid xsd:float value '${value}'`);
        }
        return parsedFloat;
      }
    }
    return value;
  }

}

export interface ITermToValueOptions {
  /**
   * If '@id' objects without other entries should be compacted.
   */
  compactIds?: boolean;
  /**
   * If literals should be converted to primitive types, such as booleans and integers.
   * Defaults to false.
   */
  useNativeTypes?: boolean;
  /**
   * If vocab-mode should be used for term compacting.
   * Defaults to false.
   */
  vocab?: boolean;
  /**
   * The mode by which the values with a certain base direction should be transformed from RDF.
   * * 'i18n-datatype': objects have a https://www.w3.org/ns/i18n# datatype.
   * * 'compound-literal': reified values using rdf:value, rdf:direction and rdf:language.
   */
  rdfDirection?: 'i18n-datatype' | 'compound-literal';
}
