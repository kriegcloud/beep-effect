import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { ScriptMixin } from './Script.js';

export interface IncludedScript<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.Script<D>, rdfine.RdfResource<D> {
}

export function IncludedScriptMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<IncludedScript & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class IncludedScriptClass extends ScriptMixin(Resource) {
  }
  return IncludedScriptClass as any
}
IncludedScriptMixin.appliesTo = dash.IncludedScript
IncludedScriptMixin.createFactory = (env: RdfineEnvironment) => createFactory<IncludedScript>([ScriptMixin, IncludedScriptMixin], { types: [dash.IncludedScript] }, env)
