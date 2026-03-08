import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { ScriptMixin } from './Script.js';

export interface ScriptConstraint<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.Script<D>, rdfine.RdfResource<D> {
}

export function ScriptConstraintMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ScriptConstraint & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class ScriptConstraintClass extends ScriptMixin(Resource) {
  }
  return ScriptConstraintClass as any
}
ScriptConstraintMixin.appliesTo = dash.ScriptConstraint
ScriptConstraintMixin.createFactory = (env: RdfineEnvironment) => createFactory<ScriptConstraint>([ScriptMixin, ScriptConstraintMixin], { types: [dash.ScriptConstraint] }, env)
