import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { ScriptMixin } from './Script.js';

export interface CommitScript<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.Script<D>, rdfine.RdfResource<D> {
}

export function CommitScriptMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<CommitScript & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class CommitScriptClass extends ScriptMixin(Resource) {
  }
  return CommitScriptClass as any
}
CommitScriptMixin.appliesTo = dash.CommitScript
CommitScriptMixin.createFactory = (env: RdfineEnvironment) => createFactory<CommitScript>([ScriptMixin, CommitScriptMixin], { types: [dash.CommitScript] }, env)
