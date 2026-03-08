import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { ScriptMixin } from './Script.js';

export interface ShapeScript<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.Script<D>, rdfine.RdfResource<D> {
}

export function ShapeScriptMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ShapeScript & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class ShapeScriptClass extends ScriptMixin(Resource) {
  }
  return ShapeScriptClass as any
}
ShapeScriptMixin.appliesTo = dash.ShapeScript
ShapeScriptMixin.createFactory = (env: RdfineEnvironment) => createFactory<ShapeScript>([ScriptMixin, ShapeScriptMixin], { types: [dash.ShapeScript] }, env)
