import type { GeneratorRule, ParserRule, traqulaIndentation, traqulaNewlineAlternative } from '@traqula/core';
import type { AstFactory } from './astFactory.js';

export interface SparqlContext {
  /**
   * Data-factoryMixins to be used when constructing rdf primitives.
   */
  astFactory: AstFactory;
  /**
   * Current scoped prefixes. Only used to validate parsed prefixes are known.
   */
  prefixes: Record<string, string>;
  /**
   * Currently scoped base IRI. Only used to validate a base is set when parsing.
   */
  baseIRI: string | undefined;
  /**
   * Can be used to disable the validation that used variables in a select clause are in scope.
   */
  skipValidation: boolean;
  /**
   * Set of queryModes. Primarily used for note 8, 14.
   */
  parseMode: Set<'canParseVars' | 'canCreateBlankNodes' | 'inAggregate' | 'canParseAggregate' | string>;
}

export interface SparqlGeneratorContext {
  astFactory: AstFactory;
  indentInc: number;
  origSource: string;
  [traqulaIndentation]: number;
  [traqulaNewlineAlternative]: string;
}

export type SparqlRule<
  /**
   * Name of grammar rule, should be a strict subtype of string like 'myGrammarRule'.
   */
  NameType extends string = string,
  /**
   * Type that will be returned after a correct parse of this rule.
   * This type will be the return type of calling SUBRULE with this grammar rule.
   */
  ReturnType = unknown,
  GenInputType = ReturnType,
  /**
   * Function arguments that can be given to convey the state of the current parse operation.
   */
  ParamType extends any[] = [],
> = SparqlGrammarRule<NameType, ReturnType, ParamType>
  & SparqlGeneratorRule<NameType, GenInputType, ParamType>;
export type SparqlGeneratorRule<
  /**
   * Name of grammar rule, should be a strict subtype of string like 'myGrammarRule'.
   */
  NameType extends string = string,
  /**
   * Type that will be returned after a correct parse of this rule.
   * This type will be the return type of calling SUBRULE with this grammar rule.
   */
  ReturnType = unknown,
  /**
   * Function arguments that can be given to convey the state of the current parse operation.
   */
  ParamType extends any[] = [],
> = GeneratorRule<SparqlGeneratorContext, NameType, ReturnType, ParamType>;
export type SparqlGrammarRule<
  /**
   * Name of grammar rule, should be a strict subtype of string like 'myGrammarRule'.
   */
  NameType extends string = string,
  /**
   * Type that will be returned after a correct parse of this rule.
   * This type will be the return type of calling SUBRULE with this grammar rule.
   */
  ReturnType = unknown,
  /**
   * Function arguments that can be given to convey the state of the current parse operation.
   */
  ParamType extends any[] = [],
> = ParserRule<SparqlContext, NameType, ReturnType, ParamType>;
