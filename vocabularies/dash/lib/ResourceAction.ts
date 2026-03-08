import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { dash } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as Dash from '../index.js';
import { ActionMixin } from './Action.js';

export interface ResourceAction<D extends RDF.DatasetCore = RDF.DatasetCore> extends Dash.Action<D>, rdfine.RdfResource<D> {
}

export function ResourceActionMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<ResourceAction & RdfResourceCore> & Base {
  @rdfine.namespace(dash)
  class ResourceActionClass extends ActionMixin(Resource) {
  }
  return ResourceActionClass as any
}
ResourceActionMixin.appliesTo = dash.ResourceAction
ResourceActionMixin.createFactory = (env: RdfineEnvironment) => createFactory<ResourceAction>([ActionMixin, ResourceActionMixin], { types: [dash.ResourceAction] }, env)
