import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { ScriptMixin } from './Script.js';

export interface ChangeScript<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.Script<D>, rdfine.RdfResource<D> {
}

export function ChangeScriptMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ChangeScript & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class ChangeScriptClass extends ScriptMixin(Resource) {
  }
  return ChangeScriptClass as any
}
ChangeScriptMixin.appliesTo = dash.ChangeScript
ChangeScriptMixin.createFactory = (env: RdfineEnvironment) => createFactory<ChangeScript>([ScriptMixin, ChangeScriptMixin], { types: [dash.ChangeScript] }, env)
