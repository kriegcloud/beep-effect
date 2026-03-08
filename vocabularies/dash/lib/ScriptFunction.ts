import '../extensions/sh/Function.js';
import { FunctionMixinEx } from '../extensions/sh/Function.js';
import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import type * as Shacl from '@rdfine/shacl';
import { FunctionMixin as ShaclFunctionMixin } from '@rdfine/shacl/lib/Function';
import { ScriptMixin } from './Script.js';

export interface ScriptFunction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Shacl.Function<D>, Dash.Script<D>, rdfine.RdfResource<D> {
}

export function ScriptFunctionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ScriptFunction & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class ScriptFunctionClass extends ScriptMixin(FunctionMixinEx(ShaclFunctionMixin(Resource))) {
  }
  return ScriptFunctionClass as any
}
ScriptFunctionMixin.appliesTo = dash.ScriptFunction
ScriptFunctionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ScriptFunction>([ScriptMixin, ShaclFunctionMixin, ScriptFunctionMixin], { types: [dash.ScriptFunction] }, env)
