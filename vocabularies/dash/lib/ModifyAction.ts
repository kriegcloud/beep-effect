import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { ResourceActionMixin } from './ResourceAction.js';

export interface ModifyAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.ResourceAction<D>, rdfine.RdfResource<D> {
}

export function ModifyActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ModifyAction & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class ModifyActionClass extends ResourceActionMixin(Resource) {
  }
  return ModifyActionClass as any
}
ModifyActionMixin.appliesTo = dash.ModifyAction
ModifyActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ModifyAction>([ResourceActionMixin, ModifyActionMixin], { types: [dash.ModifyAction] }, env)
