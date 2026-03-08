import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface View<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Activity<D>, rdfine.RdfResource<D> {
}

export function ViewMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<View & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class ViewClass extends ActivityMixin(Resource) {
  }
  return ViewClass as any
}
ViewMixin.appliesTo = as.View
ViewMixin.createFactory = (env: RdfineEnvironment) => createFactory<View>([ActivityMixin, ViewMixin], { types: [as.View] }, env)
