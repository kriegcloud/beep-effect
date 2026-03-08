import type * as RDF from '@rdfjs/types';
import type { IndirDef } from '@traqula/core';
import type { PathPure } from '@traqula/rules-sparql-1-1';
import { AstFactory, AstTransformer } from '@traqula/rules-sparql-1-1';
import { DataFactory } from 'rdf-data-factory';
import * as Algebra from '../algebra.js';
import { AlgebraFactory } from '../algebraFactory.js';

export interface AlgebraContext {
  variables: Set<string>;
  varCount: number;
  useQuads: boolean;
  algebraFactory: AlgebraFactory;
  transformer: AstTransformer;
  astFactory: AstFactory;
  dataFactory: RDF.DataFactory<RDF.BaseQuad> & { variable: Function };
  currentBase: string | undefined;
  currentPrefixes: Record<string, string>;
}

export interface ContextConfigs {
  dataFactory?: RDF.DataFactory<RDF.BaseQuad> & { variable: Function };
  quads?: boolean;
  prefixes?: Record<string, string>;
  baseIRI?: string;
  blankToVariable?: boolean;
}
export function createAlgebraContext(config: ContextConfigs): AlgebraContext {
  const dataFactory = config.dataFactory ?? new DataFactory<RDF.BaseQuad>();
  return {
    variables: new Set<string>(),
    varCount: 0,
    useQuads: false,
    transformer: new AstTransformer(),
    astFactory: new AstFactory(),
    dataFactory,
    algebraFactory: new AlgebraFactory(dataFactory),
    currentBase: config.baseIRI,
    currentPrefixes: config.prefixes ? { ...config.prefixes } : {},
  };
}

export type AlgebraIndir<Name extends string, Ret, Arg extends any[]> = IndirDef<AlgebraContext, Name, Ret, Arg>;

export interface FlattenedTriple {
  subject: RDF.Term;
  predicate: RDF.Term | PathPure;
  object: RDF.Term;
}

export const types = Algebra.Types;
export const typeVals = Object.values(types);

export function isTerm(term: any): term is RDF.Term {
  return Boolean(term?.termType);
}

// This is not completely correct but this way we also catch SPARQL.js triples
export function isTriple(triple: any): triple is RDF.Quad {
  return triple.subject && triple.predicate && triple.object;
}

export function isVariable(term: RDF.Term): term is RDF.Variable {
  return term?.termType === 'Variable';
}
