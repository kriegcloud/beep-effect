import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { sh } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Sh from '../index.js';
import { FunctionMixin } from './Function.js';
import { JSExecutableMixin } from './JSExecutable.js';

export interface JSFunction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Sh.Function<D>, Sh.JSExecutable<D>, rdfine.RdfResource<D> {
}

export function JSFunctionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<JSFunction & RdfResourceCore> & Base {
  @rdfine.namespace(sh)
  class JSFunctionClass extends JSExecutableMixin(FunctionMixin(Resource)) {
  }
  return JSFunctionClass as any
}
JSFunctionMixin.appliesTo = sh.JSFunction
JSFunctionMixin.createFactory = (env: RdfineEnvironment) => createFactory<JSFunction>([JSExecutableMixin, FunctionMixin, JSFunctionMixin], { types: [sh.JSFunction] }, env)
