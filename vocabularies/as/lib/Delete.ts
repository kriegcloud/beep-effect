import * as rdfine from '@tpluscode/rdfine';
import { createFactory } from '@tpluscode/rdfine/factory';
import { RdfineEnvironment } from '@tpluscode/rdfine/environment';
import $rdf from '@rdfjs/data-model';
import type * as RDF from '@rdfjs/types';
import { as } from './namespace.js';
import type { RdfResourceCore } from '@tpluscode/rdfine/RdfResource';
import type * as As from '../index.js';
import { ActivityMixin } from './Activity.js';

export interface Delete<D extends RDF.DatasetCore = RDF.DatasetCore> extends As.Activity<D>, rdfine.RdfResource<D> {
}

export function DeleteMixin<Base extends rdfine.Constructor>(Resource: Base): rdfine.Constructor<Delete & RdfResourceCore> & Base {
  @rdfine.namespace(as)
  class DeleteClass extends ActivityMixin(Resource) {
  }
  return DeleteClass as any
}
DeleteMixin.appliesTo = as.Delete
DeleteMixin.createFactory = (env: RdfineEnvironment) => createFactory<Delete>([ActivityMixin, DeleteMixin], { types: [as.Delete] }, env)
