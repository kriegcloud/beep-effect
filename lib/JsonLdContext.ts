// tslint:disable:max-line-length

export type JsonLdContext = IJsonLdContext | string | (IJsonLdContext | string)[];

export interface IJsonLdContext {
  '@base'?: Uri | null;     // 1.0; https://json-ld.org/spec/latest/json-ld/#base-iri
  '@vocab'?: Uri | null;    // 1.0; https://json-ld.org/spec/latest/json-ld/#default-vocabulary
  '@language'?: Language;   // 1.0; https://json-ld.org/spec/latest/json-ld/#string-internationalization
  [id: string]: any;
  // We can not define the following entries here due to TS restrictions
  // [alias: string]: Uri;
  // [prefix: string]: IPrefixValue; // 1.0; https://json-ld.org/spec/latest/json-ld/#iri-expansion-within-a-context
  '@version'?: number;      // 1.1: https://json-ld.org/spec/latest/json-ld/#json-ld-1-1-processing-mode
}

export interface IJsonLdContextNormalizedRaw {
  '@base'?: Uri | null;     // 1.0; https://json-ld.org/spec/latest/json-ld/#base-iri
  '@vocab'?: Uri | null;    // 1.0; https://json-ld.org/spec/latest/json-ld/#default-vocabulary
  '@language'?: Language;   // 1.0; https://json-ld.org/spec/latest/json-ld/#string-internationalization
  [id: string]: any;
  // We can not define the following entries here due to TS restrictions
  // [alias: string]: Uri;
  // [prefix: string]: IPrefixValue; // 1.0; https://json-ld.org/spec/latest/json-ld/#iri-expansion-within-a-context
  '@version'?: number;      // 1.1: https://json-ld.org/spec/latest/json-ld/#json-ld-1-1-processing-mode
}

export type IPrefixValue = string
  | {
    '@id'?: Uri | Bnode;
    '@reverse'?: Uri | boolean;   // 1.0; https://json-ld.org/spec/latest/json-ld/#reverse-properties
    '@type'?: Types;              // 1.0; https://json-ld.org/spec/latest/json-ld/#typed-values
                                  //      https://json-ld.org/spec/latest/json-ld/#type-coercion
                                  //      https://json-ld.org/spec/latest/json-ld/#embedding
    '@container'?: Containers;
    '@value'?: string;            // 1.0; https://json-ld.org/spec/latest/json-ld/#typed-values
    '@context'?: JsonLdContext;   // 1.1; https://json-ld.org/spec/latest/json-ld/#scoped-contexts
    '@prefix'?: boolean;          // 1.1; https://json-ld.org/spec/latest/json-ld/#compact-iris
  }
  | '@nest'                       // 1.1; https://json-ld.org/spec/latest/json-ld/#nested-properties
  ;

export type Uri = string;
export type Bnode = string;

export type Language = string;

export type Types = '@id' | Uri;

export type Containers =
    '@language'                           // 1.0; https://json-ld.org/spec/latest/json-ld/#string-internationalization
  | '@list'                               // 1.0; https://json-ld.org/spec/latest/json-ld/#sets-and-lists
  | '@set'                                // 1.0; https://json-ld.org/spec/latest/json-ld/#sets-and-lists
  | '@index'                              // 1.0; https://json-ld.org/spec/latest/json-ld/#data-indexing
  | '@graph'                              // 1.1; https://json-ld.org/spec/latest/json-ld/#graph-containers
  | ['@index', '@set']                    // 1.1; https://json-ld.org/spec/latest/json-ld/#data-indexing
  | ['@graph', '@index']                  // 1.1; https://json-ld.org/spec/latest/json-ld/#named-graph-indexing
  | '@language' | ['@language', '@set']   // 1.1; https://json-ld.org/spec/latest/json-ld/#language-indexing
  | '@id' | ['@id', '@set']               // 1.1; https://json-ld.org/spec/latest/json-ld/#node-identifier-indexing
  | ['@graph', '@id']                     // 1.1; https://json-ld.org/spec/latest/json-ld/#named-graph-indexing-by-identifier
  | '@type' | ['@type', '@set']           // 1.1; https://json-ld.org/spec/latest/json-ld/#node-type-indexing
  ;
