import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import { FunctionMixin } from './Function.js';
import { SPARQLAskExecutableMixin } from './SPARQLAskExecutable.js';
import { SPARQLSelectExecutableMixin } from './SPARQLSelectExecutable.js';

export interface SPARQLFunction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.Function<D>, Sh.SPARQLAskExecutable<D>, Sh.SPARQLSelectExecutable<D>, rdfine.RdfResource<D> {
}

export function SPARQLFunctionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<SPARQLFunction & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class SPARQLFunctionClass extends SPARQLSelectExecutableMixin(SPARQLAskExecutableMixin(FunctionMixin(Resource))) {
  }
  return SPARQLFunctionClass as any
}
SPARQLFunctionMixin.appliesTo = sh.SPARQLFunction
SPARQLFunctionMixin.createFactory = (env: RdfineEnvironment) => createFactory<SPARQLFunction>([SPARQLSelectExecutableMixin, SPARQLAskExecutableMixin, FunctionMixin, SPARQLFunctionMixin], { types: [sh.SPARQLFunction] }, env)
