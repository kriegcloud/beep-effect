import type * as RDF from '@rdfjs/types';
import type * as Trans11 from '@traqula/algebra-transformations-1-1';
import {
  createAlgebraContext as createAlgebraContext11,
  createAstContext as createAstContext11,
} from '@traqula/algebra-transformations-1-1';
import type { IndirDef, Patch } from '@traqula/core';
import { AstFactory } from '@traqula/rules-sparql-1-2';
import type * as T12 from '@traqula/rules-sparql-1-2';

export type AlgebraContext = Patch<Trans11.AlgebraContext, {
  astFactory: AstFactory;
}>;

export type FlattenedTriple = Patch<Trans11.FlattenedTriple, { predicate: RDF.Term | T12.PathPure }>;
export type ContextConfigs = Trans11.ContextConfigs;
export function createAlgebraContext(config: ContextConfigs): AlgebraContext {
  const context11 = createAlgebraContext11(config);
  return {
    ...context11,
    astFactory: new AstFactory(),
  };
}

export type AlgebraIndir<Name extends string, Ret, Arg extends any[]> = IndirDef<AlgebraContext, Name, Ret, Arg>;

export type AstContext = Patch<Trans11.AstContext, {
  astFactory: AstFactory;
}>;

export function createAstContext(): AstContext {
  const context11 = createAstContext11();
  return {
    ...context11,
    astFactory: new AstFactory(),
  };
}

export type AstIndir<Name extends string, Ret, Arg extends any[]> = IndirDef<AstContext, Name, Ret, Arg>;
